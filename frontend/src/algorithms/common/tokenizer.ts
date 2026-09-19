/**
 * Centralized Universal Symbol Tokenizer & Parser for TOC Visualizer
 * Ensures symbols are strictly represented as string tokens, never JavaScript numbers.
 * Supports any alphabet: {0,1}, {a,b}, {a,b,c}, {0,1,2}, {x,y}, mixed symbols, and epsilon notations.
 */

export class Tokenizer {
  /**
   * Normalizes an alphabet specification into an array of clean, unique string tokens
   * e.g. "{0,1}" -> ["0", "1"]
   * e.g. "{a, b, c}" -> ["a", "b", "c"]
   * e.g. ["0", "1"] -> ["0", "1"]
   */
  static parseAlphabet(input: string | string[]): string[] {
    if (Array.isArray(input)) {
      const set = new Set(input.map((s) => String(s).trim()).filter((s) => s.length > 0 && s !== 'ε' && s !== '∅'));
      return Array.from(set);
    }

    if (!input || typeof input !== 'string') {
      return ['0', '1']; // Sensible default if unspecified
    }

    // Strip out braces, brackets, parentheses, and 'sigma', 'Σ', '='
    let cleaned = input
      .replace(/Σ|∑|\bsigma\b/gi, ' ')
      .replace(/[=\{\}\[\]\(\)]/g, ' ')
      .trim();

    if (!cleaned) {
      return ['0', '1'];
    }

    // Split by commas, semicolons, or whitespace
    const parts = cleaned.split(/[\s,;]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    
    // Filter out epsilon and empty set symbols from the input alphabet
    const filtered = parts.filter((s) => s !== 'ε' && s !== 'λ' && s !== 'epsilon' && s !== 'lambda' && s !== '∅');
    
    const unique = Array.from(new Set(filtered));
    return unique.length > 0 ? unique : ['0', '1'];
  }

  /**
   * Normalizes epsilon and special mathematical symbols
   */
  static normalizeSymbol(symbol: string): string {
    const s = symbol.trim();
    if (s === 'ε' || s === 'e' || s.toLowerCase() === 'epsilon' || s === 'λ' || s.toLowerCase() === 'lambda') {
      return 'ε';
    }
    if (s === '∅' || s.toLowerCase() === 'empty' || s.toLowerCase() === 'phi' || s === 'Φ') {
      return '∅';
    }
    return s;
  }

  /**
   * Checks if a symbol represents epsilon (empty string)
   */
  static isEpsilon(symbol: string): boolean {
    const norm = this.normalizeSymbol(symbol);
    return norm === 'ε' || norm === '';
  }

  /**
   * Checks if a symbol represents the empty set (empty language with 0 strings)
   */
  static isEmptySet(symbol: string): boolean {
    const norm = this.normalizeSymbol(symbol);
    return norm === '∅';
  }

  /**
   * Tokenizes an input test string into an array of distinct alphabet tokens.
   * If the string represents epsilon, returns an empty array [] (0 transitions).
   * Supports multi-character symbols if provided in the alphabet.
   */
  static tokenizeInputString(inputString: string, alphabet?: string[]): string[] {
    const trimmed = inputString.trim();

    // Check if input is explicitly empty or an epsilon token
    if (!trimmed || this.isEpsilon(trimmed)) {
      return [];
    }

    // If whitespace or commas are used explicitly e.g. "0, 1, 0, 1" or "a b a b"
    if (trimmed.includes(',') || trimmed.includes(' ')) {
      const parts = trimmed.split(/[\s,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
      const res: string[] = [];
      for (const p of parts) {
        if (!this.isEpsilon(p)) {
          res.push(p);
        }
      }
      return res;
    }

    // If alphabet has multi-character tokens, greedily match longest tokens first
    if (alphabet && alphabet.some((a) => a.length > 1)) {
      const sortedAlpha = [...alphabet].sort((a, b) => b.length - a.length);
      const tokens: string[] = [];
      let idx = 0;
      while (idx < trimmed.length) {
        let matched = false;
        for (const sym of sortedAlpha) {
          if (trimmed.startsWith(sym, idx)) {
            tokens.push(sym);
            idx += sym.length;
            matched = true;
            break;
          }
        }
        if (!matched) {
          // Fallback to single character token
          tokens.push(trimmed[idx]);
          idx++;
        }
      }
      return tokens;
    }

    // Standard character-by-character tokenization
    // Each character is cast strictly as a string
    return trimmed.split('').map((ch) => String(ch));
  }

  /**
   * Validates if all tokens in an input string belong to the given alphabet
   */
  static validateStringAgainstAlphabet(
    tokens: string[],
    alphabet: string[]
  ): { valid: boolean; invalidTokens: string[] } {
    const alphaSet = new Set(alphabet);
    const invalid: string[] = [];
    for (const t of tokens) {
      if (!alphaSet.has(t) && !this.isEpsilon(t)) {
        invalid.push(t);
      }
    }
    return {
      valid: invalid.length === 0,
      invalidTokens: invalid
    };
  }

  /**
   * Formats an alphabet for formal mathematical display, e.g. Σ = {0, 1}
   */
  static formatAlphabet(alphabet: string[]): string {
    return `Σ = {${alphabet.join(', ')}}`;
  }

  /**
   * Automatically extracts alphabet from natural language questions
   * e.g. "over {0,1}" -> ["0", "1"]
   * e.g. "alphabet {a,b,c}" -> ["a", "b", "c"]
   * e.g. "binary strings" -> ["0", "1"]
   */
  static extractAlphabetFromQuestion(query: string): string[] | null {
    const raw = query.trim();
    // 1. Explicit alphabet pattern e.g. "over {0,1}", "alphabet {a,b,c}", "Σ = {0,1}"
    const alphaMatch =
      raw.match(/(?:over|alphabet|on|input\s+alphabet)\s*\{([^}]+)\}/i) ||
      raw.match(/Σ\s*=\s*\{([^}]+)\}/i);

    if (alphaMatch) {
      return this.parseAlphabet(alphaMatch[1]);
    }

    const q = raw.toLowerCase();

    // 2. 3-symbol patterns
    if (
      q.includes('a^n b^n c') ||
      q.includes('a^nb^nc') ||
      q.includes('anbncn') ||
      q.includes('anbncm') ||
      q.includes('{a,b,c}') ||
      q.includes('a,b,c')
    ) {
      return ['a', 'b', 'c'];
    }

    // 3. Binary patterns (must be explicit, not just digit 1 in n >= 1)
    if (
      q.includes('{0,1}') ||
      q.includes('0,1') ||
      q.includes('0 and 1') ||
      q.includes('binary') ||
      q.includes('0^n') ||
      q.includes('1^n') ||
      q.includes('0^m') ||
      q.includes('1^m') ||
      q.includes('0n1n')
    ) {
      return ['0', '1'];
    }

    // 4. 2-symbol alphabetical patterns
    if (
      q.includes('{a,b}') ||
      q.includes('a,b') ||
      q.includes('a and b') ||
      q.includes('alphabet a') ||
      q.includes('a^n') ||
      q.includes('b^n') ||
      q.includes('a^m') ||
      q.includes('b^m') ||
      q.includes('anbn') ||
      q.includes('w c w^r') ||
      q.includes('wcw^r') ||
      q.includes('w w^r') ||
      q.includes('ww^r')
    ) {
      return ['a', 'b'];
    }

    return null;
  }
}

