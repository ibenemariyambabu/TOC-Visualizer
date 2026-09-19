import { UniversalSolverResponse } from '../../types/index.js';

export interface QuestionSeedItem {
  id: string;
  moduleNumber: number;
  moduleName: string;
  topic: string;
  subtopic: string;
  problemType: string;
  difficulty: number; // 1 to 7
  marks: number;
  questionText: string;
  solution: UniversalSolverResponse;
}

export const SEED_QUESTIONS: QuestionSeedItem[] = [
  // -------------------------------------------------------------
  // MODULE 1: FOUNDATIONS & FINITE AUTOMATA & REGEX
  // -------------------------------------------------------------
  {
    id: 'm1_found_switch',
    moduleNumber: 1,
    moduleName: 'Foundations & Finite Automata',
    topic: 'Foundations',
    subtopic: 'Simple Automata Models',
    problemType: 'Conceptual Machine',
    difficulty: 1,
    marks: 2,
    questionText: 'Explain the On/Off switch as the simplest model of a finite automaton.',
    solution: {
      module: 1,
      topic: 'Foundations',
      subtopic: 'Simple Automata Models',
      problemType: 'Conceptual Machine',
      difficulty: 1,
      conceptsRequired: ['States', 'Transitions', 'Finite Memory'],
      visualizerType: 'DFA',
      coreIdea: 'An On/Off switch possesses exactly two distinct states and responds to a single input event ("toggle/switch").',
      memoryExplanation: {
        OFF: 'The device is unpowered/idle.',
        ON: 'The device is energized/active.'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Identify States',
          action: 'Define states Q = {OFF, ON}',
          explanation: 'The machine only needs to remember whether it is currently powered or unpowered.',
          why: 'Finite memory is modeled by a finite set of discrete states.'
        },
        {
          stepNumber: 2,
          title: 'Define Transition Event',
          action: 'Input symbol Σ = {push}',
          explanation: 'Pressing the switch triggers OFF -> ON and ON -> OFF.',
          why: 'Transitions model dynamic behavior upon receiving discrete input events.'
        }
      ],
      modelData: {
        automaton: {
          type: 'DFA',
          alphabet: ['push'],
          states: ['OFF', 'ON'],
          startState: 'OFF',
          acceptStates: ['ON'],
          transitions: [
            { from: 'OFF', input: 'push', to: 'ON', explanation: 'Turning switch ON' },
            { from: 'ON', input: 'push', to: 'OFF', explanation: 'Turning switch OFF' }
          ],
          stateMeanings: {
            OFF: 'Switch is OFF',
            ON: 'Switch is ON (Active)'
          }
        }
      },
      testCases: [
        { input: 'push', accepted: true, path: ['OFF', 'ON'] },
        { input: 'pushpush', accepted: false, path: ['OFF', 'ON', 'OFF'] }
      ],
      finalAnswer: 'The On/Off switch is a 2-state finite automaton with alphabet {push} where pushing alternates between OFF and ON.',
      formalAnswer: 'M = (Q, Σ, δ, q0, F) where Q = {OFF, ON}, Σ = {push}, q0 = OFF, F = {ON}, and δ(OFF, push) = ON, δ(ON, push) = OFF.',
      ktuExamAnswer: {
        twoMarks: 'An On/Off switch is modeled as a DFA with Q = {OFF, ON}, Σ = {toggle}, start state OFF, accepting state ON, and transitions toggling between them.',
        fiveMarks: '1. State definition: Q = {OFF, ON}\n2. Alphabet: Σ = {toggle}\n3. Transition table: δ(OFF, toggle)=ON, δ(ON, toggle)=OFF\n4. State diagram: Draw two states with bi-directional arrows.\n5. Explanation of finite memory.',
        tenMarks: 'Detailed definition of finite automata, transition function, state diagram, real-life relevance to sequential logic and vending machines.'
      },
      commonMistakes: ['Thinking automata must always accept complex strings instead of modeling physical hardware states.'],
      memoryTip: 'Every button press flips the state: parity mod 2!'
    }
  },

  {
    id: 'm1_dfa_substring_ab',
    moduleNumber: 1,
    moduleName: 'Foundations & Finite Automata',
    topic: 'Finite Automata',
    subtopic: 'DFA Construction',
    problemType: 'Substring Matching',
    difficulty: 3,
    marks: 5,
    questionText: 'Design a DFA over {a,b} that accepts all strings containing the substring "ab".',
    solution: {
      module: 1,
      topic: 'Finite Automata',
      subtopic: 'DFA Construction',
      problemType: 'Substring Matching',
      difficulty: 3,
      conceptsRequired: ['Substring DFA', 'State Memory', 'Self-Loops'],
      visualizerType: 'DFA',
      coreIdea: 'The states track how much of the target pattern "ab" has been matched so far: 0 characters matched (q0), 1 character "a" matched (q1), or full pattern "ab" matched (q2).',
      memoryExplanation: {
        q0: 'No part of the substring "ab" has been matched yet.',
        q1: 'Just read "a": one step away from completing "ab".',
        q2: 'Substring "ab" found! Once here, we stay here forever (absorbing state).'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Determine Memory Requirements',
          action: 'Map substring prefix progress to states',
          explanation: 'We need states for: matched "", matched "a", matched "ab". Total 3 states: {q0, q1, q2}.',
          why: 'A DFA cannot remember past symbols unless they are encoded into state identities.'
        },
        {
          stepNumber: 2,
          title: 'Define Forward Transitions',
          action: 'q0 --a--> q1 and q1 --b--> q2',
          explanation: 'Reading "a" from q0 advances to q1. Reading "b" from q1 completes the pattern into q2.',
          why: 'Progresses along the target sequence.'
        },
        {
          stepNumber: 3,
          title: 'Define Fallback and Absorbing Loops',
          action: 'q0 --b--> q0, q1 --a--> q1, q2 --a,b--> q2',
          explanation: 'At q0, reading "b" keeps us at q0. At q1, reading another "a" keeps us at q1. Once in q2, any subsequent symbol stays in q2.',
          why: 'Once a substring appears, the string is permanently accepted regardless of future characters.'
        }
      ],
      modelData: {
        automaton: {
          type: 'DFA',
          alphabet: ['a', 'b'],
          states: ['q0', 'q1', 'q2'],
          startState: 'q0',
          acceptStates: ['q2'],
          transitions: [
            { from: 'q0', input: 'a', to: 'q1', explanation: 'Matched first character "a"' },
            { from: 'q0', input: 'b', to: 'q0', explanation: 'No progress: still no "a" matched' },
            { from: 'q1', input: 'a', to: 'q1', explanation: 'Consecutive "a": still ready for "b"' },
            { from: 'q1', input: 'b', to: 'q2', explanation: 'Matched "b": target "ab" completed!' },
            { from: 'q2', input: 'a', to: 'q2', explanation: 'Pattern already found: stay accepted' },
            { from: 'q2', input: 'b', to: 'q2', explanation: 'Pattern already found: stay accepted' }
          ],
          stateMeanings: {
            q0: 'No "a" matched yet',
            q1: 'Last symbol read was "a"',
            q2: 'Substring "ab" successfully found'
          }
        }
      },
      testCases: [
        { input: 'ab', accepted: true, path: ['q0', 'q1', 'q2'] },
        { input: 'aab', accepted: true, path: ['q0', 'q1', 'q1', 'q2'] },
        { input: 'ba', accepted: false, path: ['q0', 'q0', 'q1'] },
        { input: 'bba', accepted: false, path: ['q0', 'q0', 'q0', 'q1'] },
        { input: 'babb', accepted: true, path: ['q0', 'q0', 'q1', 'q2', 'q2'] }
      ],
      finalAnswer: 'DFA has 3 states {q0, q1, q2} with start state q0 and accept state q2.',
      formalAnswer: 'M = ({q0,q1,q2}, {a,b}, δ, q0, {q2}) where δ(q0,a)=q1, δ(q0,b)=q0, δ(q1,a)=q1, δ(q1,b)=q2, δ(q2,a)=q2, δ(q2,b)=q2.',
      ktuExamAnswer: {
        twoMarks: 'States: q0 (start), q1 (seen a), q2 (seen ab, final). Transitions: δ(q0,a)=q1, δ(q0,b)=q0; δ(q1,a)=q1, δ(q1,b)=q2; δ(q2,a/b)=q2.',
        fiveMarks: '1. Meaning of states:\n   - q0: no "a" read\n   - q1: seen "a", waiting for "b"\n   - q2: substring "ab" accepted (trap accept)\n2. Transition Table:\n   State | a | b\n   ->q0  | q1| q0\n     q1  | q1| q2*\n    *q2  | q2| q2\n3. Transition Diagram.\n4. Verification with strings "ab", "aab", "ba".',
        tenMarks: 'Complete formal 5-tuple definition, state meaning justification, transition table, transition diagram, step-by-step trace of string "aab" and "ba", and proof of minimality.'
      },
      commonMistakes: ['Resetting to q0 on reading "a" from q1 instead of staying at q1.'],
      memoryTip: 'States represent how many characters of the target substring are currently matched!'
    }
  },

  {
    id: 'm1_dfa_divisible_by_3',
    moduleNumber: 1,
    moduleName: 'Foundations & Finite Automata',
    topic: 'Finite Automata',
    subtopic: 'DFA Construction',
    problemType: 'Divisibility',
    difficulty: 4,
    marks: 7,
    questionText: 'Design a DFA over {0,1} that accepts binary numbers divisible by 3.',
    solution: {
      module: 1,
      topic: 'Finite Automata',
      subtopic: 'DFA Construction',
      problemType: 'Divisibility',
      difficulty: 4,
      conceptsRequired: ['Modulo Arithmetic', 'Binary Shift Logic', 'State Memory'],
      visualizerType: 'DFA',
      coreIdea: 'When reading binary strings left-to-right, arriving at a new bit b transforms value V to 2V + b. Modulo 3: new_rem = (2 * old_rem + b) mod 3.',
      memoryExplanation: {
        q0: 'Remainder 0 modulo 3 (Divisible by 3 / Start state)',
        q1: 'Remainder 1 modulo 3',
        q2: 'Remainder 2 modulo 3'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Establish Mathematical Relation',
          action: 'Compute next remainder formula: R_new = (2 * R_old + bit) mod 3',
          explanation: 'Bit 0 shifts value to 2R mod 3. Bit 1 shifts value to (2R + 1) mod 3.',
          why: 'Binary representation appends digits as least significant bits at each step.'
        },
        {
          stepNumber: 2,
          title: 'Calculate State Transitions',
          action: 'Compute for each remainder {0, 1, 2} on inputs {0, 1}',
          explanation: 'q0: (2*0+0)%3=0 (q0), (2*0+1)%3=1 (q1)\nq1: (2*1+0)%3=2 (q2), (2*1+1)%3=0 (q0)\nq2: (2*2+0)%3=1 (q1), (2*2+1)%3=2 (q2)',
          why: 'Deterministic transition arithmetic.'
        }
      ],
      modelData: {
        automaton: {
          type: 'DFA',
          alphabet: ['0', '1'],
          states: ['q0', 'q1', 'q2'],
          startState: 'q0',
          acceptStates: ['q0'],
          transitions: [
            { from: 'q0', input: '0', to: 'q0', explanation: '(2*0+0) mod 3 = 0' },
            { from: 'q0', input: '1', to: 'q1', explanation: '(2*0+1) mod 3 = 1' },
            { from: 'q1', input: '0', to: 'q2', explanation: '(2*1+0) mod 3 = 2' },
            { from: 'q1', input: '1', to: 'q0', explanation: '(2*1+1) mod 3 = 0' },
            { from: 'q2', input: '0', to: 'q1', explanation: '(2*2+0) mod 3 = 1' },
            { from: 'q2', input: '1', to: 'q2', explanation: '(2*2+1) mod 3 = 2' }
          ],
          stateMeanings: {
            q0: 'Remainder 0 (divisible by 3)',
            q1: 'Remainder 1',
            q2: 'Remainder 2'
          }
        }
      },
      testCases: [
        { input: '0', accepted: true, path: ['q0', 'q0'] }, // 0 = 0 mod 3
        { input: '11', accepted: true, path: ['q0', 'q1', 'q0'] }, // 3 in binary
        { input: '110', accepted: true, path: ['q0', 'q1', 'q0', 'q0'] }, // 6 in binary
        { input: '100', accepted: false, path: ['q0', 'q1', 'q2', 'q1'] }, // 4 in binary (4 % 3 = 1)
        { input: '1001', accepted: true, path: ['q0', 'q1', 'q2', 'q1', 'q0'] } // 9 in binary
      ],
      finalAnswer: '3-state DFA where state q_i represents remainder i modulo 3. Start state q0 is the only accept state.',
      formalAnswer: 'M = ({q0,q1,q2}, {0,1}, δ, q0, {q0}) where δ(qi, b) = q_{(2i + b) mod 3}.',
      ktuExamAnswer: {
        twoMarks: 'States correspond to remainders modulo 3: q0 (rem 0, final), q1 (rem 1), q2 (rem 2). Transitions follow R_new = (2*R + bit) mod 3.',
        fiveMarks: '1. State memory: q_i tracks remainder i mod 3.\n2. Binary transition formula: δ(qi, b) = q_{(2i+b)%3}.\n3. Transition table and diagram with start/accept state q0.',
        tenMarks: 'Complete derivation of binary Horner rule, state transition matrix, diagram, mathematical proof by induction on string length, and test examples for 3, 6, 9, 4.'
      },
      commonMistakes: ['Confusing base 10 arithmetic with base 2 (multiplying by 10 instead of 2).'],
      memoryTip: 'Reading a new binary digit shifts left (doubles value) and adds the digit: 2*R + bit!'
    }
  },

  // -------------------------------------------------------------
  // ARDEN'S THEOREM & KLEENE'S THEOREM
  // -------------------------------------------------------------
  {
    id: 'm1_arden_theorem_solve',
    moduleNumber: 1,
    moduleName: 'Foundations & Finite Automata',
    topic: 'Regular Expressions',
    subtopic: "Arden's Theorem",
    problemType: 'Equation Solving',
    difficulty: 3,
    marks: 5,
    questionText: "Solve the regular expression equation X = aX + b using Arden's Theorem.",
    solution: {
      module: 1,
      topic: 'Regular Expressions',
      subtopic: "Arden's Theorem",
      problemType: 'Equation Solving',
      difficulty: 3,
      conceptsRequired: ["Arden's Theorem", 'Recursive Equations', 'Uniqueness Condition'],
      visualizerType: 'Regex',
      coreIdea: "Arden's Theorem states that if P and Q are regular expressions over Σ with ε ∉ P, then the equation X = PX + Q has a unique solution X = P*Q.",
      steps: [
        {
          stepNumber: 1,
          title: 'Original Equation',
          action: 'X = aX + b',
          explanation: 'Identify the recursive term and the constant/non-recursive term.',
          why: "Arden's Theorem requires identifying P and Q."
        },
        {
          stepNumber: 2,
          title: 'Identify P and Q',
          action: 'P = a, Q = b',
          explanation: 'P is the coefficient multiplying X on the left; Q is the non-recursive remainder.',
          why: 'Matches form X = PX + Q.'
        },
        {
          stepNumber: 3,
          title: 'Check Uniqueness Condition',
          action: 'Verify ε ∉ P',
          explanation: 'P = "a", which does not contain the empty string ε. The solution is guaranteed to be UNIQUE.',
          why: "If ε ∈ P, the equation would have infinitely many solutions."
        },
        {
          stepNumber: 4,
          title: 'Apply Theorem',
          action: 'X = P*Q',
          explanation: 'Substitute P = a and Q = b into P*Q to obtain X = a*b.',
          why: 'Arden replaces recursion with Kleene closure.'
        }
      ],
      finalAnswer: 'X = a*b',
      formalAnswer: "By Arden's Theorem: For X = PX + Q where ε ∉ P, X = P*Q. Here P = a and Q = b, giving X = a*b.",
      ktuExamAnswer: {
        twoMarks: "Statement: If P, Q are regular expressions and ε ∉ P, then X = PX + Q has unique solution X = P*Q. For X = aX + b, X = a*b.",
        fiveMarks: "1. Statement of Arden's Theorem with ε ∉ P condition.\n2. Comparison with X = aX + b: P = a, Q = b.\n3. Application: X = P*Q = a*b.\n4. Intuitive explanation of loop a with exit b.",
        tenMarks: "Full statement, formal proof of existence and uniqueness of solution, and application to FA equation systems."
      },
      commonMistakes: ['Writing X = ba* instead of a*b (order matters because concatenation is non-commutative).'],
      memoryTip: 'Recursive P gets starred; Q comes afterward for X = PX + Q!'
    }
  },

  // -------------------------------------------------------------
  // MODULE 2: CFG & PDA
  // -------------------------------------------------------------
  {
    id: 'm2_pda_anbn',
    moduleNumber: 2,
    moduleName: 'Context-Free Grammars & PDA',
    topic: 'Pushdown Automata',
    subtopic: 'PDA Construction',
    problemType: 'Stack Counting',
    difficulty: 3,
    marks: 5,
    questionText: 'Design a PDA for the language L = { a^n b^n | n ≥ 1 }.',
    solution: {
      module: 2,
      topic: 'Pushdown Automata',
      subtopic: 'PDA Construction',
      problemType: 'Stack Counting',
      difficulty: 3,
      conceptsRequired: ['Pushdown Stack', 'Matching Symbols', 'Stack Bottom Z0'],
      visualizerType: 'PDA',
      coreIdea: 'Finite automata cannot remember arbitrarily large counts of n. A PDA uses its stack to push symbol A for every "a" read, and pop A for every "b" read.',
      memoryExplanation: {
        q0: 'Reading "a"s and pushing A onto the stack.',
        q1: 'Reading "b"s and popping matching A from the stack.',
        q2: 'Final accept state: verified equal counts and reached stack bottom Z0.'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Push Phase (Reading a)',
          action: 'For each "a", push "A"',
          explanation: 'delta(q0, a, Z0) = (q0, AZ0) and delta(q0, a, A) = (q0, AA).',
          why: 'The stack stores the exact count of "a"s without size restriction.'
        },
        {
          stepNumber: 2,
          title: 'Pop Phase (Reading b)',
          action: 'For each "b", pop "A"',
          explanation: 'delta(q0, b, A) = (q1, ε) and delta(q1, b, A) = (q1, ε).',
          why: 'Each "b" cancels out one previously recorded "a".'
        },
        {
          stepNumber: 3,
          title: 'Acceptance Verification',
          action: 'delta(q1, ε, Z0) = (q2, Z0)',
          explanation: 'When input finishes and stack returns to base symbol Z0, transition to accept state q2.',
          why: 'Guarantees n_a = n_b.'
        }
      ],
      modelData: {
        pda: {
          states: ['q0', 'q1', 'q2'],
          inputAlphabet: ['a', 'b'],
          stackAlphabet: ['A', 'Z0'],
          startState: 'q0',
          initialStackSymbol: 'Z0',
          acceptStates: ['q2'],
          acceptanceMode: 'FINAL_STATE',
          transitions: [
            { from: 'q0', input: 'a', stackTop: 'Z0', to: 'q0', stackReplacement: 'AZ0', explanation: 'Push A above Z0' },
            { from: 'q0', input: 'a', stackTop: 'A', to: 'q0', stackReplacement: 'AA', explanation: 'Push A above A' },
            { from: 'q0', input: 'b', stackTop: 'A', to: 'q1', stackReplacement: 'ε', explanation: 'Pop A on first "b"' },
            { from: 'q1', input: 'b', stackTop: 'A', to: 'q1', stackReplacement: 'ε', explanation: 'Pop A on next "b"' },
            { from: 'q1', input: 'ε', stackTop: 'Z0', to: 'q2', stackReplacement: 'Z0', explanation: 'Accept: input empty and stack matched' }
          ]
        }
      },
      testCases: [
        { input: 'ab', accepted: true, path: ['q0', 'q1', 'q2'] },
        { input: 'aabb', accepted: true, path: ['q0', 'q0', 'q1', 'q1', 'q2'] },
        { input: 'aab', accepted: false, path: ['q0', 'q0', 'q1'] },
        { input: 'abb', accepted: false, path: ['q0', 'q1'] }
      ],
      finalAnswer: '3-state deterministic PDA accepting by final state q2.',
      formalAnswer: 'P = ({q0,q1,q2}, {a,b}, {A,Z0}, δ, q0, Z0, {q2}).',
      ktuExamAnswer: {
        twoMarks: 'PDA uses stack: push A for each "a", pop A for each "b". Accept when stack top is Z0 after reading all input.',
        fiveMarks: '1. 7-tuple definition\n2. Transition function table\n3. Instantaneous Description (ID) trace for string "aabb"\n4. State diagram.',
        tenMarks: 'Complete 7-tuple definition, state meaning, ID derivation of acceptance for "aaabbb" and rejection for "aabbb", acceptance by final state vs empty stack comparison.'
      },
      commonMistakes: ['Allowing another "a" after a "b" has been read (must not transition back to q0).'],
      memoryTip: 'Stack acts as an unbounded counter: increment on "a", decrement on "b"!'
    }
  },

  // -------------------------------------------------------------
  // MODULE 3: TURING MACHINES
  // -------------------------------------------------------------
  {
    id: 'm3_tm_anbncn',
    moduleNumber: 3,
    moduleName: 'Turing Machines',
    topic: 'Turing Machines',
    subtopic: 'TM Construction',
    problemType: '3-Symbol Matching',
    difficulty: 5,
    marks: 10,
    questionText: 'Design a Turing Machine for the non-context-free language L = { a^n b^n c^n | n ≥ 1 }.',
    solution: {
      module: 3,
      topic: 'Turing Machines',
      subtopic: 'TM Construction',
      problemType: '3-Symbol Matching',
      difficulty: 5,
      conceptsRequired: ['Turing Tape', 'Marking Technique', 'Zig-Zag Head Movement'],
      visualizerType: 'TM',
      coreIdea: 'Since a PDA only has one stack and cannot simultaneously balance two independent counters, a Turing machine solves this by marking one "a" as X, matching one "b" as Y, and matching one "c" as Z in repeating passes.',
      memoryExplanation: {
        q0: 'Looking for leftmost unmarked "a" to mark as X.',
        q1: 'Moving right across "a"s and "Y"s to find first unmarked "b" to mark as Y.',
        q2: 'Moving right across "b"s and "Z"s to find first unmarked "c" to mark as Z.',
        q3: 'Rewinding head left all the way back to the last marked X.',
        q4: 'Verification pass: ensuring all a, b, c symbols were matched without leftovers.',
        q_accept: 'Accepting state reached.'
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Mark first "a"',
          action: 'delta(q0, a) = (q1, X, R)',
          explanation: 'Replace leftmost "a" with X and move right.',
          why: 'Marks completion of one unit of "a".'
        },
        {
          stepNumber: 2,
          title: 'Find and mark first "b"',
          action: 'delta(q1, b) = (q2, Y, R)',
          explanation: 'Scan past "a"s and "Y"s until finding "b", replace with Y, move right.',
          why: 'Matches 1 "a" with 1 "b".'
        },
        {
          stepNumber: 3,
          title: 'Find and mark first "c"',
          action: 'delta(q2, c) = (q3, Z, L)',
          explanation: 'Scan past "b"s and "Z"s until finding "c", replace with Z, then rewind left.',
          why: 'Matches 1 "b" with 1 "c".'
        },
        {
          stepNumber: 4,
          title: 'Rewind Left to next "a"',
          action: 'delta(q3, X) = (q0, X, R)',
          explanation: 'Move left past all symbols until hitting X, then move right into q0 for next cycle.',
          why: 'Restores the invariant.'
        }
      ],
      testCases: [
        { input: 'abc', accepted: true, path: ['q0', 'q1', 'q2', 'q3', 'q0', 'q4', 'q_accept'] },
        { input: 'aabbcc', accepted: true, path: ['q0', '...', 'q_accept'] },
        { input: 'aabcc', accepted: false, path: ['q0', '...', 'q_reject'] }
      ],
      finalAnswer: 'Turing machine with states {q0, q1, q2, q3, q4, q_accept, q_reject} and tape alphabet {a, b, c, X, Y, Z, □}.',
      formalAnswer: 'M = (Q, Σ, Γ, δ, q0, □, {q_accept}) with 7-tuple formal transitions.',
      ktuExamAnswer: {
        twoMarks: 'TM marks an "a" as X, finds matching "b" and marks as Y, finds matching "c" and marks as Z, then rewinds left. Repeats until all symbols are marked.',
        fiveMarks: '1. Machine logic & tape alphabet Γ = {a,b,c,X,Y,Z,B}\n2. State transition table\n3. Tape diagram showing one round of replacement\n4. Explanation of acceptance.',
        tenMarks: 'Comprehensive 7-tuple definition, state invariant breakdown (the 8 questions), transition table, instantaneous tape configurations for "aabbcc", and proof why PDA fails for this language.'
      },
      commonMistakes: ['Forgetting to skip previously marked Y and Z symbols during subsequent passes.'],
      memoryTip: 'Mark one of each in every cycle: a->X, b->Y, c->Z, then rewind!'
    }
  },

  // -------------------------------------------------------------
  // MODULE 4: COMPUTABILITY & UNDECIDABILITY
  // -------------------------------------------------------------
  {
    id: 'm4_halting_problem',
    moduleNumber: 4,
    moduleName: 'Computability & Undecidability',
    topic: 'Computability',
    subtopic: 'Halting Problem',
    problemType: 'Undecidability Proof',
    difficulty: 5,
    marks: 10,
    questionText: 'Prove that the Halting Problem of Turing Machines is undecidable.',
    solution: {
      module: 4,
      topic: 'Computability',
      subtopic: 'Halting Problem',
      problemType: 'Undecidability Proof',
      difficulty: 5,
      conceptsRequired: ['Turing Machine Encodings', 'Diagonalization', 'Self-Reference Paradox'],
      visualizerType: 'Reduction',
      coreIdea: 'Assume a decider H exists for the halting problem. We construct an adversarial machine D that feeds its own description to H and does the exact opposite: if H says D halts on D, D loops forever; if H says D loops, D halts immediately. This creates a logical contradiction.',
      steps: [
        {
          stepNumber: 1,
          title: 'Assume Decidability',
          action: 'Assume decider H exists such that H(<M, w>) = ACCEPT if M halts on w, else REJECT.',
          explanation: 'Standard proof by contradiction.',
          why: 'To disprove existence, assume the machine exists and expose a contradiction.'
        },
        {
          stepNumber: 2,
          title: 'Construct Diagonal Adversary D',
          action: 'Define D(<M>): Run H(<M, <M>>). If H accepts, LOOP forever. If H rejects, HALT and accept.',
          explanation: 'D copies its input and asks H what M does on its own description.',
          why: 'Constructs self-referential diagonal behavior.'
        },
        {
          stepNumber: 3,
          title: 'Feed D to Itself',
          action: 'Evaluate D(<D>)',
          explanation: 'What happens when D runs on input <D>?\n- If D(<D>) halts, H(<D, <D>>) outputs ACCEPT -> D loops forever (Contradiction!)\n- If D(<D>) loops, H(<D, <D>>) outputs REJECT -> D halts (Contradiction!)',
          why: 'Direct logical impossibility (Russell / Cantor paradox).'
        },
        {
          stepNumber: 4,
          title: 'Conclusion',
          action: 'D(<D>) halts <=> D(<D>) does not halt',
          explanation: 'This mathematical contradiction proves our initial assumption was false. Decider H cannot exist.',
          why: 'Therefore, the Halting Problem is UNDECIDABLE.'
        }
      ],
      finalAnswer: 'The Halting Problem is undecidable by reduction and Cantor diagonal contradiction.',
      formalAnswer: 'H_TM = { <M, w> | M is a TM and M halts on input w } is undecidable.',
      ktuExamAnswer: {
        twoMarks: 'Halting problem is undecidable: No Turing machine can determine whether an arbitrary TM M will halt on an input w without potentially running forever.',
        fiveMarks: '1. Definition of H_TM\n2. Assumption of decider H\n3. Construction of inverted machine D(<M>)\n4. Evaluating D(<D>) and deriving the contradiction: D halts <=> D loops.',
        tenMarks: 'Formal definition of Turing machine encoding, definition of decidability vs recognizability, complete proof by contradiction with circuit diagram of D and H, table of diagonal contradiction, and implications for program verification.'
      },
      commonMistakes: ['Confusing "undecidable" with "unsolvable for specific machines". The halting problem is undecidable for ARBITRARY machines.'],
      memoryTip: 'If H says "yes", D does "no"; if H says "no", D does "yes" — self-reference explodes into paradox!'
    }
  }
];
