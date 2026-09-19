import { PumpingLemmaProof, PumpingLemmaStep } from '../../types/index.js';

export class PumpingLemmaEngine {
  /**
   * Generates a step-by-step Pumping Lemma proof for a non-regular language
   * Highlights x | y | z partitions and animated pump multipliers i = 0, 1, 2...
   */
  static getRegularProof(languageKey: string, pumpingLength = 4): PumpingLemmaProof {
    const p = pumpingLength;

    if (languageKey === 'anbn' || languageKey.includes('a^n b^n')) {
      const xStr = 'a'.repeat(p - 1);
      const yStr = 'a';
      const zStr = `b`.repeat(p);
      const chosen = `a^${p} b^${p}`;

      const pumpingAnalysis: PumpingLemmaStep[] = [
        {
          i: 0,
          pumpedString: `${xStr}${zStr}`, // xy^0 z = a^(p-1) b^p
          inLanguage: false,
          explanation: `i = 0 (Pump Down): xy^0z = a^${p - 1} b^${p}. Number of 'a's (${p - 1}) ≠ Number of 'b's (${p}). Violates condition n_a(w) = n_b(w).`
        },
        {
          i: 1,
          pumpedString: `${xStr}${yStr}${zStr}`, // xyz = a^p b^p
          inLanguage: true,
          explanation: `i = 1: Original string xyz = a^${p} b^${p} ∈ L.`
        },
        {
          i: 2,
          pumpedString: `${xStr}${yStr}${yStr}${zStr}`, // xy^2 z = a^(p+1) b^p
          inLanguage: false,
          explanation: `i = 2 (Pump Up): xy^2z = a^${p + 1} b^${p}. Number of 'a's (${p + 1}) exceeds number of 'b's (${p}). Violates condition n_a(w) = n_b(w).`
        }
      ];

      return {
        language: 'L = { a^n b^n | n ≥ 0 }',
        isRegularProof: true,
        assumedLength: `${p}`,
        chosenString: chosen,
        decomposition: {
          description: `By the Pumping Lemma, since |xy| ≤ p, the substring y consists strictly of 'a's (y = a^k for some 1 ≤ k ≤ p).`,
          parts: [
            { name: 'x', value: xStr, condition: '|x| ≥ 0' },
            { name: 'y', value: yStr, condition: '|y| > 0 (strictly non-empty "a"s)' },
            { name: 'z', value: zStr, condition: 'contains remaining "a"s and all "b"s' }
          ]
        },
        pumpingAnalysis,
        contradiction: `Pumping y changes the number of 'a's without changing the number of 'b's. Thus xy^i z ∉ L for any i ≠ 1.`,
        conclusion: `Since the Pumping Lemma conditions are violated, our initial assumption that L is regular must be false. Therefore, L = { a^n b^n | n ≥ 0 } is NOT REGULAR.`
      };
    }

    // Default to Palindromes L = { w w^R }
    return {
      language: 'L = { 0^n 1^n | n ≥ 1 }',
      isRegularProof: true,
      assumedLength: `${p}`,
      chosenString: `0^${p} 1^${p}`,
      decomposition: {
        description: `Decompose w = xyz such that |xy| ≤ p and |y| ≥ 1. y must consist solely of '0's.`,
        parts: [
          { name: 'x', value: '0'.repeat(p - 1), condition: '|x| ≥ 0' },
          { name: 'y', value: '0', condition: '|y| > 0' },
          { name: 'z', value: '1'.repeat(p), condition: 'remaining 0s and all 1s' }
        ]
      },
      pumpingAnalysis: [
        {
          i: 2,
          pumpedString: `0^${p + 1} 1^${p}`,
          inLanguage: false,
          explanation: `xy^2z has ${p + 1} zeros but only ${p} ones. Not in L.`
        }
      ],
      contradiction: 'Count of zeros and ones is unbalanced after pumping.',
      conclusion: 'By contradiction, L is not a regular language.'
    };
  }

  /**
   * Generates a step-by-step Pumping Lemma proof for a non-Context-Free Language (Module 2)
   * Decomposes z = u v w x y with |vwx| ≤ p and |vx| > 0
   */
  static getCFLProof(languageKey: string, pumpingLength = 4): PumpingLemmaProof {
    const p = pumpingLength;

    return {
      language: 'L = { a^n b^n c^n | n ≥ 1 }',
      isRegularProof: false, // CFL proof
      assumedLength: `${p}`,
      chosenString: `a^${p} b^${p} c^${p}`,
      decomposition: {
        description: `By the CFL Pumping Lemma, |vwx| ≤ p, meaning the substring vwx can span at most two distinct symbol types (either {a,b} or {b,c}, but never all three {a,b,c}).`,
        parts: [
          { name: 'u', value: 'a'.repeat(p - 1), condition: 'Prefix' },
          { name: 'v', value: 'a', condition: '|v| ≥ 0' },
          { name: 'w', value: 'b', condition: 'Middle segment' },
          { name: 'x', value: 'b', condition: '|x| ≥ 0 (|vx| > 0)' },
          { name: 'y', value: 'b'.repeat(p - 2) + 'c'.repeat(p), condition: 'Suffix including all "c"s' }
        ]
      },
      pumpingAnalysis: [
        {
          i: 2,
          pumpedString: `u v^2 w x^2 y = a^${p + 1} b^${p + 1} c^${p}`,
          inLanguage: false,
          explanation: `Pumping increases the count of 'a's and/or 'b's, but leaves the count of 'c's completely unchanged at ${p}. The string no longer has equal counts!`
        },
        {
          i: 0,
          pumpedString: `u v^0 w x^0 y = a^${p - 1} b^${p - 1} c^${p}`,
          inLanguage: false,
          explanation: `Pumping down decreases 'a' and/or 'b' while 'c' remains ${p}. Count condition violated.`
        }
      ],
      contradiction: `The substring vwx cannot contain all three symbols {a, b, c}. Pumping v and x alters at most two symbol counts, breaking the required equality n_a(z) = n_b(z) = n_c(z).`,
      conclusion: `Therefore, by contradiction, L = { a^n b^n c^n | n ≥ 1 } is NOT a Context-Free Language.`
    };
  }
}
