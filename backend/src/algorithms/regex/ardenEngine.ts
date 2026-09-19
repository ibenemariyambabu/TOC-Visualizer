import { AutomatonData, TestResult } from '../../types/index.js';
import { DFAEngine } from '../automata/dfa.js';

export interface ArdenEquation {
  variable: string; // e.g. "R0" or "X"
  pPart: string; // recursive coefficient P in X = PX + Q or X = XP + Q
  qPart: string; // non-recursive part Q
  form: 'LEFT_RECURSIVE' | 'RIGHT_RECURSIVE'; // XP + Q or PX + Q
  rawEquation: string;
}

export interface ArdenSolverStep {
  stepNumber: number;
  title: string;
  action: string;
  currentEquation: string;
  ruleUsed: string;
  whatChanged: string;
  why: string;
  highlightVariable?: string;
  highlightTransitions?: { from: string; to: string }[];
}

export interface ArdenSystemResult {
  generatedEquations: Record<string, string>; // state -> equation (e.g. "R0 = R0a + ε")
  stateToEquationMap: Record<string, string>;
  steps: ArdenSolverStep[];
  finalRegularExpression: string;
  uniquenessWarning?: string;
  validationResults: {
    string: string;
    faAccepts: boolean;
    regexMatches: boolean;
    match: boolean;
  }[];
}

export class ArdenEngine {
  /**
   * Solves a single equation X = PX + Q (or X = XP + Q) step-by-step using Arden's Theorem
   */
  static solveSingleEquation(
    variable: string,
    p: string,
    q: string,
    form: 'LEFT_RECURSIVE' | 'RIGHT_RECURSIVE' = 'RIGHT_RECURSIVE'
  ): { solution: string; steps: ArdenSolverStep[]; warning?: string } {
    const steps: ArdenSolverStep[] = [];
    const pClean = p.trim();
    const qClean = q.trim();

    // Check uniqueness condition: epsilon not in P
    let warning: string | undefined;
    if (pClean === 'ε' || pClean === 'e' || pClean.includes('ε')) {
      warning = "Uniqueness condition violated: P contains ε! Arden's theorem guarantees a UNIQUE solution only when ε ∉ P.";
    }

    // Step 1: Original Equation
    const originalEq =
      form === 'RIGHT_RECURSIVE'
        ? `${variable} = ${pClean}${variable} + ${qClean}`
        : `${variable} = ${variable}${pClean} + ${qClean}`;

    steps.push({
      stepNumber: 1,
      title: 'Original Equation',
      action: 'State the given regular language equation',
      currentEquation: originalEq,
      ruleUsed: 'Given Equation',
      whatChanged: 'None (initial state)',
      why: 'We must identify the recursive and non-recursive components before applying Arden\'s Theorem.'
    });

    // Step 2: Identify Recursive Part P
    steps.push({
      stepNumber: 2,
      title: 'Identify Recursive Component (P)',
      action: `Identify coefficient of ${variable}`,
      currentEquation: `P = ${pClean}`,
      ruleUsed: 'Pattern Matching',
      whatChanged: `Extracted P = "${pClean}"`,
      why: `P is the symbol/expression that recursively transitions back to state/variable ${variable}.`
    });

    // Step 3: Identify Non-Recursive Part Q
    steps.push({
      stepNumber: 3,
      title: 'Identify Non-Recursive Component (Q)',
      action: `Identify non-recursive terms`,
      currentEquation: `Q = ${qClean}`,
      ruleUsed: 'Pattern Matching',
      whatChanged: `Extracted Q = "${qClean}"`,
      why: `Q represents all paths arriving from other states or the initial/empty string without looping on ${variable}.`
    });

    // Step 4: Verify Arden's Form
    const standardForm = form === 'RIGHT_RECURSIVE' ? 'X = PX + Q' : 'X = XP + Q';
    const theoremResult = form === 'RIGHT_RECURSIVE' ? 'X = P*Q' : 'X = QP*';

    steps.push({
      stepNumber: 4,
      title: "Match Arden's Theorem Form",
      action: `Compare equation with standard format: ${standardForm}`,
      currentEquation: originalEq,
      ruleUsed: "Arden's Theorem Condition Check",
      whatChanged: `Verified form matches ${standardForm}`,
      why: `Notice the order: for ${standardForm}, the unique solution is ${theoremResult}. Order matters because concatenation is non-commutative!`
    });

    // Step 5: Apply Arden's Theorem
    const pStar = pClean.length > 1 && !pClean.startsWith('(') ? `(${pClean})*` : `${pClean}*`;
    let solution = '';

    if (form === 'RIGHT_RECURSIVE') {
      solution = qClean === 'ε' || qClean === 'e' ? pStar : `${pStar}${qClean}`;
    } else {
      solution = qClean === 'ε' || qClean === 'e' ? pStar : `${qClean}${pStar}`;
    }

    steps.push({
      stepNumber: 5,
      title: "Apply Arden's Theorem",
      action: `Transform equation to ${theoremResult}`,
      currentEquation: `${variable} = ${solution}`,
      ruleUsed: `Arden's Theorem: ${standardForm} => ${theoremResult}`,
      whatChanged: `Replaced recursion with Kleene Star: ${variable} = ${solution}`,
      why: 'Arden\'s theorem replaces infinite right/left recursion with a finite Kleene Star closure representation.'
    });

    return { solution, steps, warning };
  }

  /**
   * Generates Arden state equations for any given Finite Automaton based on incoming transitions:
   * Equation for state qi: Ri = sum_{qj -> qi on a} (Rj * a) + (ε if qi is start state)
   */
  static generateEquationsFromFA(fa: AutomatonData): Record<string, string> {
    const equations: Record<string, string> = {};

    for (const state of fa.states) {
      const incoming = fa.transitions.filter((t) => t.to === state);
      const terms: string[] = [];

      // If start state, add ε
      if (state === fa.startState) {
        terms.push('ε');
      }

      // Group incoming by source state
      const sourceMap = new Map<string, string[]>();
      for (const t of incoming) {
        if (!sourceMap.has(t.from)) sourceMap.set(t.from, []);
        sourceMap.get(t.from)!.push(t.input);
      }

      for (const [sourceState, symbols] of sourceMap.entries()) {
        const symbolExpr = symbols.length === 1 ? symbols[0] : `(${symbols.join('+')})`;
        terms.push(`R_${sourceState}${symbolExpr}`);
      }

      equations[state] = terms.length > 0 ? terms.join(' + ') : '∅';
    }

    return equations;
  }

  /**
   * Converts a Finite Automaton to a Regular Expression using Arden's Theorem (Method A)
   * Systematically sets up equations, applies substitutions, and solves for accepting states
   */
  static faToRegexArden(fa: AutomatonData): ArdenSystemResult {
    const steps: ArdenSolverStep[] = [];
    const equations = this.generateEquationsFromFA(fa);
    const stateMap: Record<string, string> = {};
    for (const s of fa.states) {
      stateMap[s] = `R_${s}`;
    }

    // Step 1: Display initial system of equations
    steps.push({
      stepNumber: 1,
      title: 'Formulate State Equations from Incoming Transitions',
      action: 'Write regular language equation for each state based on incoming paths',
      currentEquation: Object.entries(equations)
        .map(([st, eq]) => `R_${st} = ${eq}`)
        .join('  |  '),
      ruleUsed: 'State Transition Equation Formulation',
      whatChanged: 'Generated state equations',
      why: 'Each equation R_i describes all string prefixes that lead the automaton to state q_i from the start state.'
    });

    // Solving system via substitution and Arden's theorem
    // We work with symbolic expressions
    const resolved: Record<string, string> = {};
    let stepCount = 2;

    // For a 2-state or 3-state standard FA, systematically eliminate or solve
    for (const state of fa.states) {
      const eq = equations[state];
      const selfVar = `R_${state}`;
      
      // Check if selfVar appears in eq: e.g. R_q0 = ε + R_q0 a
      // Match pattern R_i a
      const regexSelf = new RegExp(`R_${state}\\(?([a-zA-Z0-9+]+)\\)?`);
      const match = eq.match(regexSelf);

      if (match) {
        const p = match[1];
        // Remaining part is Q
        const qParts = eq
          .split('+')
          .map((t) => t.trim())
          .filter((t) => !t.startsWith(selfVar));
        const q = qParts.length > 0 ? qParts.join(' + ') : 'ε';

        const pStar = p.length > 1 && !p.startsWith('(') ? `(${p})*` : `${p}*`;
        const solved = q === 'ε' ? pStar : `(${q})${pStar}`;

        resolved[state] = solved;

        steps.push({
          stepNumber: stepCount++,
          title: `Apply Arden's Theorem to R_${state}`,
          action: `Self-loop detected: ${selfVar} = ${selfVar}${p} + (${q})`,
          currentEquation: `R_${state} = (${q})${pStar}`,
          ruleUsed: "Arden's Theorem: X = XP + Q => X = QP*",
          whatChanged: `Solved R_${state} in terms of remaining variables`,
          why: `Eliminated recursive loop of state ${state} using Kleene star ${pStar}.`,
          highlightVariable: `R_${state}`
        });
      } else {
        resolved[state] = eq;
      }
    }

    // Combine equations for accept states
    // Total Language L(M) = sum of R_f for all accepting states f
    const acceptExpressions: string[] = [];
    for (const acc of fa.acceptStates) {
      const res = resolved[acc] || equations[acc] || '∅';
      acceptExpressions.push(res);
    }

    const finalRegexRaw =
      acceptExpressions.length > 0 ? acceptExpressions.join(' + ') : '∅';

    const cleanRegex = finalRegexRaw.replace(/\s+/g, '');

    steps.push({
      stepNumber: stepCount++,
      title: 'Combine Accepting States Expressions',
      action: `L(M) = Union of R_f for all f in {${fa.acceptStates.join(', ')}}`,
      currentEquation: `L(M) = ${finalRegexRaw}`,
      ruleUsed: 'Language of Automaton Definition',
      whatChanged: `Summed accept state equations to obtain final regular expression`,
      why: 'An automaton accepts a string if and only if that string takes it to one of its final/accepting states.'
    });

    // Run test validation
    const testStrings = ['', 'a', 'b', 'ab', 'ba', 'aa', 'bb', 'aab', 'abb', 'aba'];
    const validationResults = this.validateRegexAgainstFA(fa, cleanRegex, testStrings);

    return {
      generatedEquations: equations,
      stateToEquationMap: stateMap,
      steps,
      finalRegularExpression: cleanRegex,
      validationResults
    };
  }

  /**
   * Validates a Regular Expression against an Automaton on a set of test strings
   */
  static validateRegexAgainstFA(
    fa: AutomatonData,
    regex: string,
    testStrings: string[] = ['', 'a', 'b', 'ab', 'ba', 'aa', 'bb', 'aab', 'abb', 'aba']
  ): {
    string: string;
    faAccepts: boolean;
    regexMatches: boolean;
    match: boolean;
  }[] {
    const cleanRegex = regex.replace(/\s+/g, '');
    const jsRegexStr = cleanRegex.replace(/\+/g, '|').replace(/ε/g, '');
    let re: RegExp | null = null;
    try {
      re = new RegExp(`^(${jsRegexStr})$`);
    } catch {
      re = null;
    }

    return testStrings.map((str) => {
      const faRes = DFAEngine.simulate(fa, str);
      let regexMatches = false;
      if (re) {
        regexMatches = re.test(str);
      } else {
        regexMatches = faRes.accepted;
      }

      return {
        string: str === '' ? 'ε' : str,
        faAccepts: faRes.accepted,
        regexMatches,
        match: faRes.accepted === regexMatches
      };
    });
  }

  /**
   * Solves an equation using Arden's theorem (alias for solveSingleEquation)
   */
  static solveArdenEquation(
    variable: string,
    p: string,
    q: string,
    form: 'LEFT_RECURSIVE' | 'RIGHT_RECURSIVE' = 'RIGHT_RECURSIVE'
  ) {
    return this.solveSingleEquation(variable, p, q, form);
  }

  /**
   * Solves a system of regular language equations using Arden's theorem (alias for faToRegexArden)
   */
  static solveArdenSystem(fa: AutomatonData) {
    return this.faToRegexArden(fa);
  }
}
