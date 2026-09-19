import { UniversalSolverResponse, AutomatonData, SimulationResult } from '../../types/index.js';
import { Tokenizer } from '../../algorithms/common/tokenizer.js';
import { DFAEngine } from '../../algorithms/automata/dfa.js';
import { NFAEngine } from '../../algorithms/automata/nfa.js';
import { MinimizationEngine } from '../../algorithms/automata/minimization.js';
import { RegexEngine } from '../../algorithms/regex/regexEngine.js';
import { ArdenEngine } from '../../algorithms/regex/ardenEngine.js';
import { CFGEngine } from '../../algorithms/cfg/cfgEngine.js';
import { PDAEngine } from '../../algorithms/pda/pdaEngine.js';
import { TMEngine } from '../../algorithms/tm/tmEngine.js';
import { PumpingLemmaEngine } from '../../algorithms/pumping/pumpingEngine.js';
import { PCPEngine } from '../../algorithms/computability/pcpEngine.js';

export interface QuestionAnalysis {
  normalizedQuery: string;
  detectedAlphabet: string[];
  detectedModel: 'DFA' | 'NFA' | 'PDA' | 'TM' | 'CFG' | 'Regex' | 'Arden' | 'Computability';
  detectedProblemType: string;
  parameters: Record<string, any>;
}

export class SolverService {
  /**
   * Universal Question Parser: extracts semantic tokens, alphabet, and parameters
   */
  static parseQuestion(query: string): QuestionAnalysis {
    const raw = query.trim();
    const q = raw.toLowerCase();

    // 1. Extract alphabet if explicitly specified or implied e.g. "over {0,1}", "alphabet {a,b,c}", "a^n b^n"
    const extractedAlpha = Tokenizer.extractAlphabetFromQuestion(raw);
    let detectedAlphabet: string[] = extractedAlpha || ['0', '1']; // Sensible default for TOC

    // 2. Detect requested computational model
    let detectedModel: QuestionAnalysis['detectedModel'] = 'DFA';
    if (q.includes('arden')) {
      detectedModel = 'Arden';
    } else if (q.includes('pda') || q.includes('pushdown')) {
      detectedModel = 'PDA';
    } else if (q.includes('turing') || q.includes('tm')) {
      detectedModel = 'TM';
    } else if (q.includes('cfg') || q.includes('grammar') || q.includes('derivation') || q.includes('ambiguity') || q.includes('cnf')) {
      detectedModel = 'CFG';
    } else if (q.includes('regex') || q.includes('regular expression') || q.includes('thompson') || q.includes('kleene')) {
      detectedModel = 'Regex';
    } else if (q.includes('nfa') || q.includes('subset')) {
      detectedModel = 'NFA';
    } else if (q.includes('halting') || q.includes('undecidable') || q.includes('decidable') || q.includes('pcp') || q.includes('post correspondence')) {
      detectedModel = 'Computability';
    }

    // 3. Extract parameters
    const parameters: Record<string, any> = {};

    // Divisibility modulus e.g. "divisible by 3", "divisible by 5"
    const divMatch = q.match(/divisible\s+by\s+(\d+)/i);
    if (divMatch) {
      parameters.modulus = parseInt(divMatch[1], 10);
    }

    // Substring pattern e.g. "substring 01", "contains ab", "containing '101'"
    const subMatch = raw.match(/(?:substring|contains|containing)\s*['"]?([a-zA-Z0-9]+)['"]?/i);
    if (subMatch) {
      parameters.substring = subMatch[1];
    }

    // Ends with suffix e.g. "ending in 01", "ends with 101"
    const endMatch = raw.match(/(?:ending\s+(?:in|with)|ends\s+with)\s*['"]?([a-zA-Z0-9]+)['"]?/i);
    if (endMatch) {
      parameters.suffix = endMatch[1];
    }

    // Starts with prefix e.g. "starting with 01", "starts with ab"
    const startMatch = raw.match(/(?:starting\s+with|starts\s+with)\s*['"]?([a-zA-Z0-9]+)['"]?/i);
    if (startMatch) {
      parameters.prefix = startMatch[1];
    }

    // Parity e.g. "even number of 1s", "odd number of 0s"
    const parityMatch = q.match(/(even|odd)\s+number\s+of\s+['"]?([a-zA-Z0-9])['"]?/i);
    if (parityMatch) {
      parameters.parity = parityMatch[1].toUpperCase() as 'EVEN' | 'ODD';
      parameters.targetSymbol = parityMatch[2];
    }

    return {
      normalizedQuery: raw,
      detectedAlphabet,
      detectedModel,
      detectedProblemType: parameters.modulus ? 'Divisibility' :
        parameters.substring ? 'Substring' :
        parameters.suffix ? 'Suffix' :
        parameters.prefix ? 'Prefix' :
        parameters.parity ? 'Parity' : 'General',
      parameters
    };
  }

  /**
   * Universal Question Solver Router
   */
  static async solveQuestion(query: string, customAlphabet?: string[]): Promise<UniversalSolverResponse> {
    const analysis = this.parseQuestion(query);
    const alphabet = customAlphabet && customAlphabet.length > 0
      ? Tokenizer.parseAlphabet(customAlphabet)
      : analysis.detectedAlphabet;
    
    const q = analysis.normalizedQuery.toLowerCase();

    // GUARD 1: Non-Regular Language Guard (Section 18)
    // If user asks for a DFA for 0^n 1^n or a^n b^n, DO NOT fabricate a DFA!
    if (
      (q.includes('dfa') || q.includes('finite automaton') || q.includes('regular')) &&
      (q.includes('0^n1^n') || q.includes('0^n 1^n') || q.includes('a^nb^n') || q.includes('a^n b^n') || q.includes('equal number of 0 and 1'))
    ) {
      return {
        module: 1,
        topic: 'Regular Languages',
        subtopic: 'Pumping Lemma & Non-Regularity',
        problemType: 'Non-Regular Language Notice',
        difficulty: 4,
        conceptsRequired: ['Pumping Lemma', 'Pigeonhole Principle', 'Memory Limitation of Finite Automata'],
        visualizerType: 'PumpingLemma',
        coreIdea: 'The language L = { 0^n 1^n | n >= 1 } CANNOT be recognized by any DFA. A DFA has finite states and cannot count an unbounded number of 0s to match with 1s.',
        steps: [
          {
            stepNumber: 1,
            title: 'Theoretical Limitation',
            action: 'Identify that counting unbounded arbitrary n requires auxiliary memory.',
            explanation: 'Any DFA with k states would enter a cycle on reading 0^k, confusing strings with different numbers of 0s.',
            why: 'Pigeonhole Principle on finite state set Q.'
          },
          {
            stepNumber: 2,
            title: 'Pumping Lemma Contradiction',
            action: 'Apply Pumping Lemma: let w = 0^p 1^p, split into xyz with |xy| <= p, y = 0^k (k >= 1).',
            explanation: 'Pumping y = 0^k to xy^2 z gives 0^(p+k) 1^p, which has more 0s than 1s and is NOT in L.',
            why: 'Contradiction proves L is NOT regular.'
          }
        ],
        finalAnswer: 'CANNOT CONSTRUCT DFA: Language L = { 0^n 1^n | n >= 1 } is proven NON-REGULAR by the Pumping Lemma. Use a Pushdown Automaton (PDA) or Turing Machine instead.',
        formalAnswer: 'L = { 0^n 1^n | n >= 1 } ∉ Regular Languages.',
        ktuExamAnswer: {
          twoMarks: 'L = {0^n 1^n} is not regular because a DFA has finite memory and cannot count arbitrary n.',
          fiveMarks: '1. State regular Pumping Lemma.\n2. Assume L is regular with pumping length p.\n3. Choose w = 0^p 1^p.\n4. Show y must consist solely of 0s.\n5. Pump i = 2: string 0^(p+k) 1^p ∉ L. Contradiction.',
          tenMarks: 'Comprehensive Pumping Lemma proof, pigeonhole principle explanation of state cycles, and comparison with Pushdown Automata memory requirements.'
        },
        commonMistakes: ['Attempting to design a DFA for unbounded counting like 0^n 1^n', 'Assuming a DFA can remember arbitrary numbers of symbols'],
        memoryTip: 'Finite memory = Regular; Unbounded single-stack memory = Context-Free (PDA); Unbounded tape = TM!'
      };
    }

    // GUARD 2: Non-Context-Free Language Guard (Section 19)
    const nonCFL = PDAEngine.detectNonCFL(query);
    if ((analysis.detectedModel === 'PDA' || q.includes('pda')) && nonCFL) {
      return {
        module: 2,
        topic: 'Pushdown Automata',
        subtopic: 'Context-Free Pumping Lemma',
        problemType: 'Non-CFL Language Notice',
        difficulty: 5,
        conceptsRequired: ['CFL Pumping Lemma', 'Simultaneous Counting', 'Turing Machine Transition'],
        visualizerType: 'TM',
        coreIdea: nonCFL.reason,
        steps: [
          {
            stepNumber: 1,
            title: 'Limitation of Single LIFO Stack',
            action: 'A PDA has only one stack. Comparing 3 independent counts simultaneously is impossible with one stack.',
            explanation: 'Popping elements to match the second symbol empties the stack, losing the count needed for the third symbol.',
            why: 'LIFO stack restriction.'
          }
        ],
        modelData: {
          tm: TMEngine.getAnBnCnTM()
        },
        finalAnswer: `CANNOT CONSTRUCT PDA: ${nonCFL.reason} Route to ${nonCFL.suggestedModel}.`,
        formalAnswer: 'Language is NOT Context-Free. It is Context-Sensitive / Recursively Enumerable.',
        ktuExamAnswer: {
          twoMarks: 'L = {a^n b^n c^n} is not context-free because a single stack cannot compare three counts simultaneously.',
          fiveMarks: '1. State CFL Pumping Lemma (uv^i x y^i z).\n2. Assume L is CFL with pumping length p.\n3. Choose w = a^p b^p c^p.\n4. Show vxy cannot span all 3 symbols.\n5. Pumping changes at most 2 symbol types, violating equality.',
          tenMarks: 'Full formal CFL Pumping Lemma proof with all 5 decomposition cases and redirection to Turing Machine.'
        },
        commonMistakes: ['Trying to design a PDA with multiple stacks (2 stacks = Turing Machine)'],
        memoryTip: '1 stack = 2 counts (a^n b^n); 3 counts (a^n b^n c^n) requires a Turing Machine!'
      };
    }

    // 1. ROUTE TO ARDEN'S THEOREM
    if (analysis.detectedModel === 'Arden') {
      return this.solveArdenProblem(query, alphabet);
    }

    // 2. ROUTE TO PDA
    if (analysis.detectedModel === 'PDA') {
      return this.solvePDAProblem(query, alphabet);
    }

    // 3. ROUTE TO TURING MACHINE
    if (analysis.detectedModel === 'TM') {
      return this.solveTMProblem(query, alphabet);
    }

    // 4. ROUTE TO CFG
    if (analysis.detectedModel === 'CFG') {
      return this.solveCFGProblem(query, alphabet);
    }

    // 5. ROUTE TO REGEX & THOMPSON CONVERSION
    if (analysis.detectedModel === 'Regex') {
      return this.solveRegexProblem(query, alphabet);
    }

    // 6. ROUTE TO COMPUTABILITY
    if (analysis.detectedModel === 'Computability') {
      return this.solveComputabilityProblem(query);
    }

    // 7. DEFAULT: ROUTE TO DFA / NFA CONSTRUCTOR
    return this.solveAutomataProblem(analysis, alphabet);
  }

  /**
   * Automata Solver: Handles arbitrary Divisibility, Substrings, Prefixes, Suffixes, and Parity
   */
  private static solveAutomataProblem(analysis: QuestionAnalysis, alphabet: string[]): UniversalSolverResponse {
    let automaton: AutomatonData;
    let coreIdea = '';
    let problemType = analysis.detectedProblemType;
    let sampleTestInputs: string[] = [];

    if (analysis.parameters.modulus) {
      // Dynamic Divisibility by m
      const m = analysis.parameters.modulus;
      automaton = DFAEngine.buildDivisibilityDFA(m, alphabet);
      coreIdea = `Every binary number read left-to-right updates remainder r' = (2 * r + bit) mod ${m}. The machine has ${m} states {q0..q${m - 1}}, where state qi represents remainder i. State q0 is accepting (remainder 0).`;
      problemType = `Binary Divisible by ${m}`;
      sampleTestInputs = ['0', '1', '10', '11', '100', '101', '110', '111', '1001', '1010'];
    } else if (analysis.parameters.prefix) {
      const p = analysis.parameters.prefix;
      automaton = DFAEngine.buildPrefixDFA(p, alphabet);
      coreIdea = `DFA tracks consecutive matched symbols of prefix "${p}". Any mismatch before completion leads to a dead/trap state q_trap.`;
      problemType = `Starts with "${p}"`;
      sampleTestInputs = [p, `${p}0`, `${p}1`, `0${p}`, `1${p}`, 'ε'];
    } else if (analysis.parameters.suffix) {
      const s = analysis.parameters.suffix;
      automaton = DFAEngine.buildSuffixDFA(s, alphabet);
      coreIdea = `DFA maintains memory of the longest suffix matching a prefix of "${s}". State q${s.length} is accepting.`;
      problemType = `Ends with "${s}"`;
      sampleTestInputs = [s, `0${s}`, `1${s}`, `${s}0`, '0', '1'];
    } else if (analysis.parameters.parity) {
      const sym = analysis.parameters.targetSymbol || alphabet[0];
      const parity = analysis.parameters.parity;
      automaton = DFAEngine.buildParityDFA(sym, parity, alphabet);
      coreIdea = `DFA maintains a modulo-2 counter: state q_even and q_odd toggle upon reading symbol '${sym}'.`;
      problemType = `${parity} number of '${sym}'s`;
      sampleTestInputs = ['', sym, `${sym}${sym}`, `${sym}${sym}${sym}`];
    } else {
      // Substring matching (e.g. "01", "101", "ab")
      const sub = analysis.parameters.substring || (alphabet.includes('0') ? '01' : 'ab');
      automaton = DFAEngine.buildSubstringDFA(sub, alphabet);
      coreIdea = `Knuth-Morris-Pratt prefix automaton: tracks matched prefix length of substring "${sub}". Once matched, the machine enters accepting state q${sub.length} and loops permanently.`;
      problemType = `Contains Substring "${sub}"`;
      sampleTestInputs = [sub, `${sub}0`, `0${sub}`, `1${sub}1`, '0', '1', ''];
    }

    // Complete transitions with trap state if missing
    automaton = DFAEngine.complete(automaton);

    // Generate test simulations
    const testCases = DFAEngine.testBatch(automaton, sampleTestInputs.slice(0, 6));

    // Steps
    const steps = [
      {
        stepNumber: 1,
        title: 'Define Alphabet & States',
        action: `Alphabet: ${Tokenizer.formatAlphabet(alphabet)}. States: {${automaton.states.join(', ')}}.`,
        explanation: 'Each state has an explicit invariant capturing the historical memory of the string read so far.',
        why: 'Formal 5-tuple specification of DFA.'
      },
      {
        stepNumber: 2,
        title: 'Formulate Transition Functions',
        action: `Generated ${automaton.transitions.length} transitions ensuring completeness for every state and symbol.`,
        explanation: 'Every state q has a defined transition delta(q, a) for all a in alphabet.',
        why: 'DFA completeness guarantee.'
      },
      {
        stepNumber: 3,
        title: 'Identify Accepting States',
        action: `Accept States: {${automaton.acceptStates.join(', ')}}. Start State: ${automaton.startState}.`,
        explanation: 'A string is accepted if and only if the final state reached belongs to the accept state set.',
        why: 'Language recognition criterion.'
      }
    ];

    return {
      module: 1,
      topic: 'Finite Automata',
      subtopic: 'DFA Construction',
      problemType,
      difficulty: 3,
      conceptsRequired: ['Deterministic Transitions', 'State Invariants', 'Completeness with Trap State'],
      visualizerType: 'DFA',
      coreIdea,
      steps,
      modelData: {
        automaton
      },
      testCases,
      finalAnswer: `DFA constructed with ${automaton.states.length} states over ${Tokenizer.formatAlphabet(alphabet)}. Start state: ${automaton.startState}, Accept states: {${automaton.acceptStates.join(', ')}}.`,
      formalAnswer: `M = (Q, Σ, δ, q0, F) where Q = {${automaton.states.join(', ')}}, Σ = {${alphabet.join(', ')}}, start state = ${automaton.startState}, F = {${automaton.acceptStates.join(', ')}}.`,
      ktuExamAnswer: {
        twoMarks: `Formal 5-tuple M = (Q, Σ, δ, q0, F) where Q = {${automaton.states.join(', ')}}, Σ = {${alphabet.join(', ')}}, F = {${automaton.acceptStates.join(', ')}}.`,
        fiveMarks: `1. State Invariant Table.\n2. State Transition Diagram with start arrow and double circle for accepting states.\n3. Complete Transition Matrix.\n4. Verification on sample strings.`,
        tenMarks: `1. Comprehensive problem definition.\n2. Mathematical state representation.\n3. Full transition function δ(q, a) table.\n4. Transition graph with trap state q_trap.\n5. Step-by-step trace of sample accepted and rejected strings.`
      },
      commonMistakes: [
        'Missing transitions for some alphabet symbols (omitting dead/trap state)',
        'Treating 0 and 1 as numeric values instead of string tokens'
      ],
      memoryTip: 'Every state must have an arrow for EVERY alphabet symbol in a DFA!'
    };
  }

  /**
   * Arden's Theorem Solver
   */
  private static solveArdenProblem(query: string, alphabet: string[]): UniversalSolverResponse {
    // Check if query specifies custom parameters e.g. X = aX + b or X = 0X + 1
    let variable = 'X';
    let p = alphabet[0] || '0';
    let qVal = alphabet[1] || '1';

    const eqMatch = query.match(/([a-zA-Z])\s*=\s*([a-zA-Z0-9+*]+)\s*\1\s*\+\s*([a-zA-Z0-9+*]+)/i);
    if (eqMatch) {
      variable = eqMatch[1];
      p = eqMatch[2];
      qVal = eqMatch[3];
    }

    const sol = ArdenEngine.solveSingleEquation(variable, p, qVal, 'LEFT_RECURSIVE');

    return {
      module: 1,
      topic: 'Regular Expressions',
      subtopic: "Arden's Theorem",
      problemType: 'Equation Solving',
      difficulty: 3,
      conceptsRequired: ["Arden's Theorem", 'Uniqueness Condition (ε ∉ P)', 'Linear Equations in Regular Languages'],
      visualizerType: 'Regex',
      coreIdea: `Arden's Theorem: If P and Q are regular expressions over Σ such that ε ∉ P, then the equation ${variable} = P${variable} + Q has the unique closed solution ${variable} = P*Q.`,
      steps: sol.steps.map((s) => ({
        stepNumber: s.stepNumber,
        title: s.title,
        action: s.action,
        explanation: s.whatChanged,
        why: s.why
      })),
      finalAnswer: `${variable} = ${sol.solution}`,
      formalAnswer: `By Arden's Theorem: Since ε ∉ '${p}', the equation ${variable} = (${p})${variable} + (${qVal}) has unique solution: ${variable} = ${sol.solution}.`,
      ktuExamAnswer: {
        twoMarks: `Arden's Theorem: If P, Q are regular expressions and ε ∉ P, then X = PX + Q has a unique solution X = P*Q.`,
        fiveMarks: `1. State theorem with uniqueness condition.\n2. Identify P = ${p}, Q = ${qVal}.\n3. Verify ε ∉ P.\n4. Substitute into formula: ${variable} = P*Q = ${sol.solution}.`,
        tenMarks: `1. Formal statement and uniqueness condition proof.\n2. Complete step-by-step resolution.\n3. Application to FA to RE state equation systems.\n4. Verification with test strings.`
      },
      commonMistakes: [
        'Confusing left-recursive X = PX + Q (X = P*Q) with right-recursive X = XP + Q (X = QP*)',
        'Applying Arden\'s theorem when P contains ε without noting non-uniqueness'
      ],
      memoryTip: 'Recursive P gets starred; Q comes afterward for X = PX + Q!'
    };
  }

  /**
   * PDA Solver: Dynamically constructs multi-model PDAs with 7-tuple, delta notation, strategy invariants,
   * and complete Instantaneous Description (ID) derivation traces.
   */
  private static solvePDAProblem(query: string, alphabet: string[]): UniversalSolverResponse {
    const pda = PDAEngine.constructPDAForQuery(query, alphabet, 'FINAL_STATE');

    let testString = '0011';
    const inputMatch =
      query.match(/input\s*(?:string)?\s*[:=]?\s*["']?([a-zA-Z0-9()]+)["']?/i) ||
      query.match(/for\s*(?:string)?\s*[:=]?\s*["']?([a-zA-Z0-9()]+)["']?/i);

    if (inputMatch && inputMatch[1]) {
      testString = inputMatch[1];
    } else if (query.toLowerCase().includes('palindrome')) {
      testString = query.toLowerCase().includes('c')
        ? 'abcba'
        : alphabet.includes('0')
        ? '0110'
        : 'abba';
    } else if (query.toLowerCase().includes('parenthes')) {
      testString = '(())';
    } else if (pda.inputAlphabet.includes('0')) {
      testString = '0011';
    } else {
      testString = 'aabb';
    }

    const sim = PDAEngine.simulate(pda, testString);
    const deltaList = PDAEngine.formatTransitionFunction(pda);
    const ids = PDAEngine.generateIDs(pda, sim);
    const idValidation = PDAEngine.validateIDTrace(pda, ids);
    const turnstileTrace = ids.map((d) => d.formatted).join(' ⊢ ');
    const terminalID = ids[ids.length - 1];
    const theoremSummary = `${ids[0].formatted} ⊢* ${terminalID.formatted} [${
      sim.accepted ? 'ACCEPTED' : 'REJECTED'
    }]`;

    const isExplicitIDRequest =
      query.toLowerCase().includes('instantaneous') ||
      query.toLowerCase().includes('id') ||
      query.toLowerCase().includes('configuration') ||
      query.toLowerCase().includes('trace') ||
      query.toLowerCase().includes('stack change');

    return {
      module: 2,
      topic: 'Pushdown Automata',
      subtopic: isExplicitIDRequest ? 'Instantaneous Descriptions (IDs)' : 'PDA Construction',
      problemType: pda.strategyName || 'PDA Language Recognition',
      difficulty: pda.isDeterministic === false ? 5 : 4,
      conceptsRequired: [
        'Pushdown Stack (LIFO)',
        pda.strategyName || 'Stack Accounting',
        pda.acceptanceMode === 'EMPTY_STACK' ? 'Empty Stack Acceptance' : 'Final State Acceptance',
        'Instantaneous Descriptions (q, w, α)'
      ],
      visualizerType: 'PDA',
      coreIdea:
        pda.whyItWorks ||
        'Pushes symbols onto stack to maintain memory invariants, then pops upon reading matching suffixes.',
      steps: [
        {
          stepNumber: 1,
          title: 'Formal 7-Tuple Definition',
          action: `P = (Q, Σ, Γ, δ, ${pda.startState}, ${pda.initialStackSymbol}, {${pda.acceptStates.join(
            ', '
          )}})`,
          explanation: `States Q = {${pda.states.join(', ')}}, Input Σ = {${pda.inputAlphabet.join(
            ', '
          )}}, Stack Γ = {${pda.stackAlphabet.join(', ')}}.`,
          why: 'Formal specification of the Pushdown Automaton.'
        },
        {
          stepNumber: 2,
          title: 'Stack Operation Strategy',
          action: pda.strategyName || 'Stack Matching Strategy',
          explanation: pda.whyItWorks || 'Maintains balance between input stream and stack top.',
          why: 'Core language recognition invariant.'
        },
        {
          stepNumber: 3,
          title: 'Transition Function δ',
          action: `${pda.transitions.length} formal transitions formulated.`,
          explanation: deltaList.slice(0, 4).join('; ') + (deltaList.length > 4 ? '...' : ''),
          why: 'Complete deterministic/nondeterministic state evolution.'
        },
        {
          stepNumber: 4,
          title: 'Formal Instantaneous Descriptions (IDs) Trace (⊢)',
          action: `Turnstile Sequence for input "${testString}":\n${turnstileTrace}`,
          explanation: `Convention: (State, Remaining Input, Stack top→bottom). Derivation theorem: ${theoremSummary}. Mathematical validity check: ${
            idValidation.isValid ? 'VALID' : 'INVALID'
          } (${idValidation.stepsValidated} moves verified against δ).`,
          why: 'Formal step-by-step operational semantics of PDA execution.'
        }
      ],
      modelData: { pda },
      testCases: [
        {
          input: testString,
          accepted: sim.accepted,
          path: sim.steps.map((s) => String(s.currentState))
        }
      ],
      finalAnswer: `PDA constructed with ${pda.states.length} states over Σ = {${pda.inputAlphabet.join(
        ', '
      )}}, Γ = {${pda.stackAlphabet.join(', ')}}. Start state: ${pda.startState}, Accept states: {${pda.acceptStates.join(
        ', '
      )}}.\n\nInstantaneous Descriptions for input "${testString}":\n${turnstileTrace}\n\nDerivation Theorem: ${theoremSummary}`,
      formalAnswer: `P = (Q, Σ, Γ, δ, ${pda.startState}, ${pda.initialStackSymbol}, {${pda.acceptStates.join(
        ', '
      )}}) where Q = {${pda.states.join(', ')}}, Σ = {${pda.inputAlphabet.join(
        ', '
      )}}, Γ = {${pda.stackAlphabet.join(
        ', '
      )}}.\n\nFormal Computation Trace: ${turnstileTrace}\nResult: ${theoremSummary}`,
      ktuExamAnswer: {
        twoMarks: `PDA 7-tuple definition: P = (Q, Σ, Γ, δ, q0, Z0, F). Acceptance mode: ${pda.acceptanceMode}. Instantaneous Description: (q, w, α).`,
        fiveMarks: `1. 7-tuple specification.\n2. Strategy: ${pda.strategyName}.\n3. Transition function table.\n4. Complete Instantaneous Description trace: ${turnstileTrace}.`,
        tenMarks: `1. Formal 7-tuple components.\n2. State semantic meaning invariants.\n3. Complete δ(q, a, X) mathematical specification.\n4. Complete Instantaneous Description (ID) trace: ${turnstileTrace}.\n5. Formal proof of acceptance via ${theoremSummary}.\n6. Discussion of DPDA vs NPDA determinism.`
      },
      commonMistakes: [
        'Popping when stack is empty without checking for base marker Z0',
        'Attempting to count 3 separate symbols with one stack (requires Turing Machine)',
        'Writing stack contents backwards (standard convention is top → bottom)'
      ],
      memoryTip:
        'Convention: (q, w, α) means current state q, remaining unread input w, stack contents α with leftmost symbol at top!'
    };
  }

  /**
   * Turing Machine Solver
   */
  private static solveTMProblem(query: string, alphabet: string[]): UniversalSolverResponse {
    const q = query.toLowerCase();
    let tm = TMEngine.getAnBnCnTM();
    let problemType = 'L = { a^n b^n c^n | n >= 1 }';
    let sampleInput = 'aabbcc';

    if (q.includes('0^n1^n') || q.includes('0n1n') || alphabet.includes('0')) {
      tm = TMEngine.getZeroNOneNTM();
      problemType = 'L = { 0^n 1^n | n >= 1 }';
      sampleInput = '0011';
    } else if (q.includes('increment') || q.includes('binary')) {
      tm = TMEngine.getBinaryIncrementTM();
      problemType = 'Binary Incrementer';
      sampleInput = '101';
    }

    const sim = TMEngine.simulate(tm, sampleInput);

    return {
      module: 3,
      topic: 'Turing Machines',
      subtopic: 'TM Construction',
      problemType,
      difficulty: 5,
      conceptsRequired: ['Infinite Tape', 'Read/Write Head', 'Bidirectional Marking'],
      visualizerType: 'TM',
      coreIdea: `A Turing Machine moves bidirectionally on an infinite tape, marking matching symbols in iterative passes to recognize non-context-free languages.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Tape Invariant',
          action: 'Mark first symbol, scan right to mark corresponding matching symbols, rewind to start.',
          explanation: 'Guarantees equal counts across all symbol blocks.',
          why: 'Turing Machine design framework.'
        }
      ],
      modelData: { tm },
      testCases: [
        { input: sampleInput, accepted: sim.accepted, path: sim.steps.slice(0, 10).map((s) => String(s.currentState)) }
      ],
      finalAnswer: `Turing Machine constructed with ${tm.states.length} states. Accept state: ${tm.acceptState}.`,
      formalAnswer: `M = (Q, Σ, Γ, δ, q0, □, {${tm.acceptState}})`,
      ktuExamAnswer: {
        twoMarks: 'Turing Machine is a 7-tuple M = (Q, Σ, Γ, δ, q0, B, F) with bidirectional tape memory.',
        fiveMarks: '1. 7-tuple components.\n2. Head movement strategy.\n3. Transition table.\n4. Acceptance condition.',
        tenMarks: 'Complete 7-tuple, tape invariant analysis, transition matrix, and instantaneous description trace.'
      },
      commonMistakes: ['Moving off the left end of the tape without boundary check'],
      memoryTip: 'Mark, scan forward, mark matching, rewind to start!'
    };
  }

  /**
   * CFG Solver
   */
  private static solveCFGProblem(query: string, alphabet: string[]): UniversalSolverResponse {
    const grammar = {
      variables: ['S'],
      terminals: alphabet.length > 0 ? alphabet : ['0', '1'],
      startSymbol: 'S',
      productions: [
        { from: 'S', to: [`${alphabet[0]}S${alphabet[1]}`, 'ε'] }
      ]
    };

    const targetString = `${alphabet[0]}${alphabet[0]}${alphabet[1]}${alphabet[1]}`;
    const derivation = CFGEngine.deriveLeftmost(grammar, targetString);

    return {
      module: 2,
      topic: 'Context-Free Grammars',
      subtopic: 'Grammar Derivations & Parse Tree',
      problemType: 'CFG Derivation',
      difficulty: 3,
      conceptsRequired: ['Leftmost Derivation', 'Production Rules', 'Parse Tree'],
      visualizerType: 'CFG',
      coreIdea: 'Context-Free Grammar derives strings through recursive production substitutions.',
      steps: derivation.steps.map((s) => ({
        stepNumber: s.stepNumber,
        title: `Expand ${s.targetNonTerminal}`,
        action: s.productionUsed,
        explanation: s.resultingSententialForm,
        why: s.reason
      })),
      modelData: {
        grammar
      },
      finalAnswer: `Derived "${targetString}" from S using ${derivation.steps.length} derivation steps.`,
      formalAnswer: `G = (V, T, P, S) where V = {S}, T = {${alphabet.join(', ')}}, S = S, P = { S -> ${alphabet[0]}S${alphabet[1]} | ε }`,
      ktuExamAnswer: {
        twoMarks: 'CFG 4-tuple G = (V, T, P, S). Generates languages by substituting non-terminals with production RHS.',
        fiveMarks: '1. 4-tuple definition.\n2. Production rules.\n3. Leftmost derivation sequence.\n4. Parse tree diagram.',
        tenMarks: 'Complete formal grammar definition, LMD vs RMD comparison, parse tree construction, and ambiguity analysis.'
      },
      commonMistakes: ['Applying rightmost expansion during a leftmost derivation'],
      memoryTip: 'Leftmost replaces the leftmost variable first!'
    };
  }

  /**
   * Regex & Thompson Solver
   */
  private static solveRegexProblem(query: string, alphabet: string[]): UniversalSolverResponse {
    const rawMatch = query.match(/(?:for|represented by|re|regex)\s*['"]?([a-zA-Z0-9|*+()]+)['"]?/i);
    const regexStr = rawMatch ? rawMatch[1] : (alphabet.includes('0') ? '(0|1)*01' : '(a|b)*ab');

    const thompson = RegexEngine.regexToNFA(regexStr);

    return {
      module: 1,
      topic: 'Regular Expressions',
      subtopic: "Thompson's Construction",
      problemType: 'Regex to ε-NFA',
      difficulty: 3,
      conceptsRequired: ["Thompson's Construction", 'ε-Transitions', 'AST Parsing'],
      visualizerType: 'Regex',
      coreIdea: `Thompson's construction builds an equivalent ε-NFA compositionally: single transitions for symbols, branching for union, sequential connection for concatenation, and loops with bypass for Kleene star.`,
      steps: [
        {
          stepNumber: 1,
          title: 'Parse Regex into AST',
          action: `Parsed expression "${regexStr}".`,
          explanation: 'Identified union, concatenation, and star operators.',
          why: 'Hierarchical syntax parsing.'
        },
        {
          stepNumber: 2,
          title: "Construct Thompson ε-NFA",
          action: `Generated NFA with ${thompson.nfa.states.length} states and ${thompson.nfa.transitions.length} transitions.`,
          explanation: 'Built sub-machines and connected with ε-transitions.',
          why: 'Thompson compositional construction.'
        }
      ],
      modelData: {
        automaton: thompson.nfa
      },
      finalAnswer: `Converted regex "${regexStr}" into an equivalent ε-NFA with ${thompson.nfa.states.length} states.`,
      formalAnswer: `Thompson ε-NFA M = (Q, Σ, δ, q0, F)`,
      ktuExamAnswer: {
        twoMarks: "Thompson's construction converts regular expressions into ε-NFAs using base, union, concat, and star fragments.",
        fiveMarks: "1. Regex operator fragments (Union, Concat, Star).\n2. Step-by-step assembly.\n3. Final ε-NFA state diagram.",
        tenMarks: "Full operator construction rules, formal proof of language equivalence, complete ε-NFA transition graph, and subsequent subset construction to DFA."
      },
      commonMistakes: ['Forgetting the ε-bypass transition in Kleene star'],
      memoryTip: 'Kleene star adds a forward bypass and a backward loop via ε!'
    };
  }

  /**
   * Computability Solver
   */
  private static solveComputabilityProblem(query: string): UniversalSolverResponse {
    return {
      module: 4,
      topic: 'Computability & Undecidability',
      subtopic: 'The Halting Problem',
      problemType: 'Diagonalization Undecidability Proof',
      difficulty: 5,
      conceptsRequired: ['Turing Computability', 'Halting Problem', 'Diagonalization', 'Contradiction Proof'],
      visualizerType: 'Reduction',
      coreIdea: 'The Halting Problem (H_TM = { <M, w> | M halts on w }) is UNDECIDABLE. Alan Turing proved this using Cantor\'s diagonalization method by showing that assuming an algorithm H exists leads to a logical self-referential paradox.',
      steps: [
        {
          stepNumber: 1,
          title: 'Problem Definition',
          action: 'Assume there exists a decider H(<M, w>) that returns ACCEPT if M halts on w, and REJECT if M loops.',
          explanation: 'By contradiction, assume H is a total Turing machine (halts on all inputs).',
          why: 'Indirect contradiction hypothesis.'
        },
        {
          stepNumber: 2,
          title: 'Construct Diagonal Machine D',
          action: 'Construct machine D(<M>): calls H(<M, <M>>). If H accepts, D LOOPS forever. If H rejects, D HALTS.',
          explanation: 'D inverts the decision of H when executed on its own description.',
          why: 'Diagonalization construction.'
        },
        {
          stepNumber: 3,
          title: 'Evaluate D on Its Own Description <D>',
          action: 'What happens when D runs on input <D>? D(<D>) halts iff D(<D>) loops!',
          explanation: 'If D(<D>) halts -> H(<D, <D>>) accepts -> D loops (contradiction!). If D(<D>) loops -> H(<D, <D>>) rejects -> D halts (contradiction!).',
          why: 'Logical paradox establishes undecidability.'
        },
        {
          stepNumber: 4,
          title: 'Conclusion',
          action: 'The assumption that decider H exists is impossible. Therefore, H_TM is UNDECIDABLE.',
          explanation: 'No general algorithm can predict whether an arbitrary program will halt.',
          why: 'Turing Theorem (1936).'
        }
      ],
      finalAnswer: 'The Halting Problem is UNDECIDABLE by Turing\'s diagonalization proof.',
      formalAnswer: 'H_TM = { <M, w> | M is a TM and M halts on input w } is undecidable (not recursive).',
      ktuExamAnswer: {
        twoMarks: 'The Halting Problem asks whether an arbitrary Turing machine M halts on input w. It is undecidable.',
        fiveMarks: '1. State Halting Problem.\n2. Assume decider H exists.\n3. Construct inverted machine D(<M>).\n4. Evaluate D(<D>) to demonstrate contradiction.',
        tenMarks: '1. Formal definitions of decidable vs undecidable languages.\n2. Complete Turing diagonalization proof with self-referential paradox.\n3. Church-Turing thesis implications.\n4. Reduction of Halting Problem to other undecidable problems (PCP, Rice\'s Theorem).'
      },
      commonMistakes: [
        'Confusing undecidable with unrecognizable (H_TM is Turing-recognizable but undecidable)',
        'Thinking a specific program\'s halting cannot be proven (the theorem applies to a GENERAL decider for ALL programs)'
      ],
      memoryTip: 'D halts iff D loops: the universal paradox that proves undecidability!'
    };
  }
}
