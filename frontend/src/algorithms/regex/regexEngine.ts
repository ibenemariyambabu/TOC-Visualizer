import { AutomatonData, AutomatonTransition, RegexASTNode } from '../../types/index.js';

export interface StateEliminationStep {
  stepNumber: number;
  eliminatedState: string;
  remainingStates: string[];
  formula: string;
  explanation: string;
  intermediateMatrix: Record<string, Record<string, string>>;
}

export interface StateEliminationResult {
  regularExpression: string;
  steps: StateEliminationStep[];
  generalizedGraph: {
    states: string[];
    startState: string;
    acceptState: string;
    transitions: { from: string; to: string; regex: string }[];
  };
}

export class RegexEngine {
  /**
   * Parses a regular expression string into an Abstract Syntax Tree (AST)
   * Precedence: Star (*) > Concatenation > Union (| or +)
   */
  static parseToAST(regex: string): RegexASTNode {
    const clean = regex.replace(/\s+/g, '');
    let pos = 0;

    const peek = () => clean[pos];
    const get = () => clean[pos++];

    // Expression: Term (('|' | '+') Term)*
    const parseExpression = (): RegexASTNode => {
      let node = parseTerm();
      while (pos < clean.length && (peek() === '|' || peek() === '+')) {
        const op = get();
        const right = parseTerm();
        node = {
          type: 'union',
          left: node,
          right
        };
      }
      return node;
    };

    // Term: Factor (Factor)* [Implicit concatenation]
    const parseTerm = (): RegexASTNode => {
      let node = parseFactor();
      while (
        pos < clean.length &&
        peek() !== '|' &&
        peek() !== '+' &&
        peek() !== ')'
      ) {
        const right = parseFactor();
        node = {
          type: 'concat',
          left: node,
          right
        };
      }
      return node;
    };

    // Factor: Atom ('*')*
    const parseFactor = (): RegexASTNode => {
      let node = parseAtom();
      while (pos < clean.length && peek() === '*') {
        get();
        node = {
          type: 'star',
          child: node
        };
      }
      return node;
    };

    // Atom: '(' Expression ')' | Symbol | ε
    const parseAtom = (): RegexASTNode => {
      if (pos >= clean.length) {
        return { type: 'epsilon', value: 'ε' };
      }

      const ch = peek();
      if (ch === '(') {
        get(); // '('
        const node = parseExpression();
        if (get() !== ')') {
          throw new Error('Mismatched parentheses in regular expression.');
        }
        return node;
      } else if (ch === 'ε' || ch === 'e') {
        get();
        return { type: 'epsilon', value: 'ε' };
      } else if (ch === '∅' || ch === 'Φ') {
        get();
        return { type: 'empty', value: '∅' };
      } else {
        get();
        return { type: 'symbol', value: ch };
      }
    };

    return parseExpression();
  }

  /**
   * Thompson's Construction: converts a regular expression into an ε-NFA
   */
  static regexToNFA(regex: string): {
    nfa: AutomatonData;
    ast: RegexASTNode;
    constructionSteps: string[];
  } {
    const ast = this.parseToAST(regex);
    let stateCounter = 0;
    const newState = () => `s${stateCounter++}`;
    const constructionSteps: string[] = [];

    interface Fragment {
      start: string;
      end: string;
      states: string[];
      transitions: AutomatonTransition[];
    }

    const buildFragment = (node: RegexASTNode): Fragment => {
      switch (node.type) {
        case 'symbol': {
          const s = newState();
          const e = newState();
          constructionSteps.push(`Base fragment for symbol '${node.value}': ${s} --${node.value}--> ${e}`);
          return {
            start: s,
            end: e,
            states: [s, e],
            transitions: [{ from: s, input: node.value!, to: e }]
          };
        }
        case 'epsilon': {
          const s = newState();
          const e = newState();
          constructionSteps.push(`Epsilon fragment: ${s} --ε--> ${e}`);
          return {
            start: s,
            end: e,
            states: [s, e],
            transitions: [{ from: s, input: 'ε', to: e }]
          };
        }
        case 'concat': {
          const leftFrag = buildFragment(node.left!);
          const rightFrag = buildFragment(node.right!);
          constructionSteps.push(`Concatenation: connected ${leftFrag.end} to ${rightFrag.start} via ε`);
          return {
            start: leftFrag.start,
            end: rightFrag.end,
            states: [...leftFrag.states, ...rightFrag.states],
            transitions: [
              ...leftFrag.transitions,
              { from: leftFrag.end, input: 'ε', to: rightFrag.start },
              ...rightFrag.transitions
            ]
          };
        }
        case 'union': {
          const leftFrag = buildFragment(node.left!);
          const rightFrag = buildFragment(node.right!);
          const s = newState();
          const e = newState();
          constructionSteps.push(`Union: created branch ${s} --ε--> (${leftFrag.start}, ${rightFrag.start}) and merged to ${e}`);
          return {
            start: s,
            end: e,
            states: [s, ...leftFrag.states, ...rightFrag.states, e],
            transitions: [
              { from: s, input: 'ε', to: leftFrag.start },
              { from: s, input: 'ε', to: rightFrag.start },
              ...leftFrag.transitions,
              ...rightFrag.transitions,
              { from: leftFrag.end, input: 'ε', to: e },
              { from: rightFrag.end, input: 'ε', to: e }
            ]
          };
        }
        case 'star': {
          const childFrag = buildFragment(node.child!);
          const s = newState();
          const e = newState();
          constructionSteps.push(`Kleene Star: added loopback from ${childFrag.end} to ${childFrag.start} and bypass ${s} to ${e}`);
          return {
            start: s,
            end: e,
            states: [s, ...childFrag.states, e],
            transitions: [
              { from: s, input: 'ε', to: childFrag.start },
              { from: s, input: 'ε', to: e }, // bypass 0 times
              ...childFrag.transitions,
              { from: childFrag.end, input: 'ε', to: childFrag.start }, // loop
              { from: childFrag.end, input: 'ε', to: e }
            ]
          };
        }
        default: {
          const s = newState();
          const e = newState();
          return { start: s, end: e, states: [s, e], transitions: [] };
        }
      }
    };

    const finalFrag = buildFragment(ast);

    // Extract alphabet symbols from transitions
    const alphabet = Array.from(
      new Set(
        finalFrag.transitions
          .map((t) => t.input)
          .filter((sym) => sym !== 'ε' && sym !== 'e' && sym !== '')
      )
    ).sort();

    const nfa: AutomatonData = {
      id: `nfa_${Date.now()}`,
      name: `ε-NFA for regex ${regex}`,
      type: 'e-NFA',
      alphabet,
      states: finalFrag.states,
      startState: finalFrag.start,
      acceptStates: [finalFrag.end],
      transitions: finalFrag.transitions
    };

    return { nfa, ast, constructionSteps };
  }

  /**
   * Method B: State Elimination (FA -> Regular Expression)
   * Systematically removes states while accumulating path expressions:
   * R_ij = R_ij | (R_ik (R_kk)* R_kj)
   */
  static faToRegexStateElimination(fa: AutomatonData): StateEliminationResult {
    const steps: StateEliminationStep[] = [];
    const newStart = 'START_INIT';
    const newAccept = 'FINAL_ACCEPT';

    // Build generalized transition matrix: map[from][to] = regex string
    const matrix: Record<string, Record<string, string>> = {};

    const allStates = [newStart, ...fa.states, newAccept];
    for (const s1 of allStates) {
      matrix[s1] = {};
      for (const s2 of allStates) {
        matrix[s1][s2] = '∅';
      }
    }

    // Connect newStart -> fa.startState via ε
    matrix[newStart][fa.startState] = 'ε';

    // Connect all original accept states -> newAccept via ε
    for (const acc of fa.acceptStates) {
      matrix[acc][newAccept] = 'ε';
    }

    // Populate original transitions
    for (const t of fa.transitions) {
      const existing = matrix[t.from][t.to];
      if (existing === '∅') {
        matrix[t.from][t.to] = t.input;
      } else {
        matrix[t.from][t.to] = `(${existing}|${t.input})`;
      }
    }

    const statesToEliminate = [...fa.states];
    let stepNum = 1;

    for (const qk of statesToEliminate) {
      const remaining = allStates.filter(
        (s) => s !== qk && !statesToEliminate.slice(0, stepNum - 1).includes(s)
      );

      const R_kk = matrix[qk][qk];
      const loopPart = R_kk !== '∅' && R_kk !== 'ε' ? `(${R_kk})*` : '';

      const formulasUsed: string[] = [];

      // For all incoming qi != qk and outgoing qj != qk
      for (const qi of remaining) {
        if (qi === newAccept) continue;
        const R_ik = matrix[qi][qk];
        if (R_ik === '∅') continue;

        for (const qj of remaining) {
          if (qj === newStart) continue;
          const R_kj = matrix[qk][qj];
          if (R_kj === '∅') continue;

          // Path formula: R_ik (R_kk)* R_kj
          let path = '';
          if (R_ik === 'ε') {
            path = loopPart ? `${loopPart}${R_kj === 'ε' ? '' : R_kj}` : R_kj;
          } else if (R_kj === 'ε') {
            path = loopPart ? `${R_ik}${loopPart}` : R_ik;
          } else {
            path = loopPart ? `${R_ik}${loopPart}${R_kj}` : `${R_ik}${R_kj}`;
          }

          const existingR_ij = matrix[qi][qj];
          let updated = '';
          if (existingR_ij === '∅') {
            updated = path;
          } else if (existingR_ij === 'ε' && path === 'ε') {
            updated = 'ε';
          } else {
            updated = `(${existingR_ij}|${path})`;
          }

          matrix[qi][qj] = updated;
          formulasUsed.push(`${qi} -> ${qj}: ${updated}`);
        }
      }

      steps.push({
        stepNumber: stepNum++,
        eliminatedState: qk,
        remainingStates: remaining.filter((s) => s !== newStart && s !== newAccept),
        formula: `qi -> qj: R_ij | (R_i,${qk} * (R_${qk},${qk})* * R_${qk},j)`,
        explanation: `Eliminated state ${qk}. Updated transitions between all predecessors and successors. Loop at ${qk}: ${R_kk}.`,
        intermediateMatrix: JSON.parse(JSON.stringify(matrix))
      });
    }

    const finalRegex = matrix[newStart][newAccept] || '∅';

    const cleanRegex = this.simplifyRegex(finalRegex);

    return {
      regularExpression: cleanRegex,
      steps,
      generalizedGraph: {
        states: [newStart, newAccept],
        startState: newStart,
        acceptState: newAccept,
        transitions: [{ from: newStart, to: newAccept, regex: cleanRegex }]
      }
    };
  }

  /**
   * Helper to simplify regular expressions (removes redundant brackets and empty strings)
   */
  static simplifyRegex(regex: string): string {
    let s = regex;
    // Replace (a)|(b) with a|b
    s = s.replace(/\(ε\)/g, 'ε');
    s = s.replace(/∅\|/g, '');
    s = s.replace(/\|∅/g, '');
    if (s.startsWith('(') && s.endsWith(')')) {
      // Check if wrapping brackets are redundant
      let depth = 0;
      let canStrip = true;
      for (let i = 0; i < s.length - 1; i++) {
        if (s[i] === '(') depth++;
        if (s[i] === ')') depth--;
        if (depth === 0) {
          canStrip = false;
          break;
        }
      }
      if (canStrip) s = s.slice(1, -1);
    }
    return s || 'ε';
  }
}
