import { AutomatonData, AutomatonTransition, SimulationResult, SimulationStep, TestResult } from '../../types/index.js';
import { Tokenizer } from '../common/tokenizer.js';

/**
 * Deterministic Finite Automaton (DFA) Simulator and Operations Engine
 * 100% Deterministic construction for arbitrary alphabets, divisibility, substrings, prefixes, suffixes, and parity.
 */
export class DFAEngine {
  /**
   * Simulates a string on a DFA step-by-step using universal tokenization.
   * Accurately supports any alphabet: {0,1}, {a,b}, {a,b,c}, {0,1,2}, {x,y}, and epsilon.
   */
  static simulate(dfa: AutomatonData, inputString: string): SimulationResult {
    const steps: SimulationStep[] = [];
    let currentState = dfa.startState;
    const tokens = Tokenizer.tokenizeInputString(inputString, dfa.alphabet);

    let consumed = '';
    let remaining = tokens.join('');

    // Initial state step 0
    steps.push({
      stepIndex: 0,
      currentState,
      remainingInput: remaining,
      consumedInput: consumed,
      currentSymbol: null,
      explanation: `Machine initialized at start state ${currentState}. ${
        dfa.stateMeanings?.[currentState] ? `Meaning: "${dfa.stateMeanings[currentState]}"` : ''
      }`
    });

    // Special case: Epsilon string (empty token sequence)
    if (tokens.length === 0) {
      const isAccepted = dfa.acceptStates.includes(currentState);
      return {
        accepted: isAccepted,
        finalState: currentState,
        steps,
        explanation: isAccepted
          ? `Input is empty string (ε). Start state ${currentState} is an ACCEPTING state. The string "ε" is ACCEPTED.`
          : `Input is empty string (ε). Start state ${currentState} is NOT an accepting state. The string "ε" is REJECTED.`
      };
    }

    for (let i = 0; i < tokens.length; i++) {
      const symbol = tokens[i];
      consumed += symbol;
      remaining = tokens.slice(i + 1).join('');

      // Find deterministic transition: delta(currentState, symbol)
      const transition = dfa.transitions.find(
        (t) => t.from === currentState && t.input === symbol
      );

      if (!transition) {
        // Missing transition in incomplete DFA -> leads to implicit rejection
        steps.push({
          stepIndex: i + 1,
          currentState: 'REJECT_TRAP',
          remainingInput: remaining,
          consumedInput: consumed,
          currentSymbol: symbol,
          explanation: `No transition defined from state "${currentState}" on input symbol '${symbol}'. Machine halts in non-accepting condition.`
        });
        return {
          accepted: false,
          finalState: currentState,
          steps,
          explanation: `String "${inputString}" rejected because transition delta(${currentState}, '${symbol}') is missing.`
        };
      }

      const nextState = transition.to;
      const stepExplanation = transition.explanation || 
        `Read symbol '${symbol}': transitioned from ${currentState} to ${nextState}.${
          dfa.stateMeanings?.[nextState] ? ` Current memory: "${dfa.stateMeanings[nextState]}".` : ''
        }`;

      currentState = nextState;

      steps.push({
        stepIndex: i + 1,
        currentState,
        remainingInput: remaining,
        consumedInput: consumed,
        currentSymbol: symbol,
        transitionUsed: transition,
        explanation: stepExplanation
      });
    }

    const isAccepted = dfa.acceptStates.includes(currentState);
    const finalExplanation = isAccepted
      ? `Final state ${currentState} is an ACCEPTING state. The string "${inputString}" is ACCEPTED.`
      : `Final state ${currentState} is a NON-ACCEPTING state. The string "${inputString}" is REJECTED.`;

    return {
      accepted: isAccepted,
      finalState: currentState,
      steps,
      explanation: finalExplanation
    };
  }

  /**
   * Batch tests multiple test cases against the DFA
   */
  static testBatch(dfa: AutomatonData, testInputs: string[]): TestResult[] {
    return testInputs.map((input) => {
      const res = this.simulate(dfa, input);
      const path = res.steps.map((s) => (typeof s.currentState === 'string' ? s.currentState : s.currentState.join(',')));
      return {
        input,
        accepted: res.accepted,
        path
      };
    });
  }

  /**
   * Validates if the DFA is syntactically sound, complete, and deterministic
   */
  static validate(dfa: AutomatonData): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!dfa.states.includes(dfa.startState)) {
      errors.push(`Start state "${dfa.startState}" is not listed in states.`);
    }

    for (const acc of dfa.acceptStates) {
      if (!dfa.states.includes(acc)) {
        errors.push(`Accept state "${acc}" is not in states list.`);
      }
    }

    // Check determinism: at most one transition for any (state, symbol)
    const seen = new Set<string>();
    for (const t of dfa.transitions) {
      if (!dfa.states.includes(t.from)) {
        errors.push(`Transition source "${t.from}" is not a valid state.`);
      }
      if (!dfa.states.includes(t.to)) {
        errors.push(`Transition target "${t.to}" is not a valid state.`);
      }
      if (!dfa.alphabet.includes(t.input)) {
        errors.push(`Transition symbol '${t.input}' is not in alphabet [${dfa.alphabet.join(', ')}].`);
      }

      const key = `${t.from}:::${t.input}`;
      if (seen.has(key)) {
        errors.push(`Non-deterministic transition detected! Multiple transitions from "${t.from}" on symbol '${t.input}'.`);
      }
      seen.add(key);
    }

    // Check completeness
    for (const state of dfa.states) {
      for (const symbol of dfa.alphabet) {
        const key = `${state}:::${symbol}`;
        if (!seen.has(key)) {
          warnings.push(`Incomplete DFA: Missing transition from state "${state}" on symbol '${symbol}'. Consider adding a trap/dead state.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Complements a DFA by swapping accepting and non-accepting states (L' = Sigma* \ L)
   * Note: DFA must be fully defined with trap state first!
   */
  static complement(dfa: AutomatonData): AutomatonData {
    const completed = this.complete(dfa);
    const newAcceptStates = completed.states.filter((s) => !completed.acceptStates.includes(s));
    
    return {
      ...completed,
      id: `comp_${completed.id || 'dfa'}`,
      name: `Complement of ${completed.name || 'DFA'}`,
      acceptStates: newAcceptStates
    };
  }

  /**
   * Completes a DFA by adding an explicit dead/trap state for any missing transitions
   */
  static complete(dfa: AutomatonData): AutomatonData {
    const trapState = 'q_trap';
    let needsTrap = false;
    const newTransitions = [...dfa.transitions];
    const newStates = [...dfa.states];

    for (const state of dfa.states) {
      for (const symbol of dfa.alphabet) {
        const exists = dfa.transitions.some((t) => t.from === state && t.input === symbol);
        if (!exists) {
          needsTrap = true;
          newTransitions.push({
            from: state,
            input: symbol,
            to: trapState,
            explanation: `Missing transition routed to dead/trap state ${trapState}`
          });
        }
      }
    }

    if (needsTrap && !newStates.includes(trapState)) {
      newStates.push(trapState);
      // Self loops on trap state for all alphabet symbols
      for (const sym of dfa.alphabet) {
        newTransitions.push({
          from: trapState,
          input: sym,
          to: trapState,
          explanation: `Self-loop on dead/trap state ${trapState}`
        });
      }
    }

    return {
      ...dfa,
      states: newStates,
      transitions: newTransitions,
      trapState: needsTrap ? trapState : undefined,
      stateMeanings: {
        ...(dfa.stateMeanings || {}),
        ...(needsTrap ? { [trapState]: 'Dead / Trap State: condition permanently violated' } : {})
      }
    };
  }

  /**
   * Dynamic Divisibility Automata Synthesizer for arbitrary modulus m >= 2
   * Uses remainder-state construction: states q0..q(m-1), newRemainder = (2*r + bit) % m
   */
  static buildDivisibilityDFA(modulus: number, customAlphabet: string[] = ['0', '1']): AutomatonData {
    const m = Math.max(2, Math.floor(modulus));
    const alphabet = Tokenizer.parseAlphabet(customAlphabet);
    const states: string[] = [];
    const stateMeanings: Record<string, string> = {};
    const transitions: AutomatonTransition[] = [];

    for (let r = 0; r < m; r++) {
      const state = `q${r}`;
      states.push(state);
      stateMeanings[state] = `Binary value modulo ${m} is ${r}`;
    }

    for (let r = 0; r < m; r++) {
      const fromState = `q${r}`;
      for (const sym of alphabet) {
        // Evaluate numerical value of the symbol (default 0 if not digit)
        const bitVal = /^\d+$/.test(sym) ? parseInt(sym, 10) : 0;
        const nextRem = (2 * r + bitVal) % m;
        const toState = `q${nextRem}`;

        transitions.push({
          from: fromState,
          input: sym,
          to: toState,
          explanation: `Read '${sym}': (2 * ${r} + ${bitVal}) mod ${m} = ${nextRem} -> transition to ${toState}`
        });
      }
    }

    return {
      id: `dfa_div_${m}`,
      name: `DFA for Binary Numbers Divisible by ${m}`,
      type: 'DFA',
      alphabet,
      states,
      startState: 'q0',
      acceptStates: ['q0'],
      transitions,
      stateMeanings
    };
  }

  /**
   * Dynamic Substring Matching DFA Synthesizer for arbitrary substring pattern over arbitrary alphabet
   * Uses Knuth-Morris-Pratt style prefix transition function
   */
  static buildSubstringDFA(pattern: string, customAlphabet: string[] = ['0', '1']): AutomatonData {
    const patTokens = Tokenizer.tokenizeInputString(pattern);
    const cleanPattern = patTokens.length > 0 ? patTokens : ['0', '1'];
    const alphabet = Array.from(new Set([...Tokenizer.parseAlphabet(customAlphabet), ...cleanPattern]));
    
    const k = cleanPattern.length;
    const states: string[] = [];
    const stateMeanings: Record<string, string> = {};
    const transitions: AutomatonTransition[] = [];

    for (let i = 0; i <= k; i++) {
      const st = `q${i}`;
      states.push(st);
      stateMeanings[st] = i === k
        ? `Matched full substring "${cleanPattern.join('')}" (Terminal Acceptance)`
        : `Matched prefix of length ${i}: "${cleanPattern.slice(0, i).join('')}"`;
    }

    for (let i = 0; i <= k; i++) {
      const fromState = `q${i}`;
      for (const sym of alphabet) {
        if (i === k) {
          // Already accepted substring: self-loop permanently
          transitions.push({
            from: fromState,
            input: sym,
            to: fromState,
            explanation: `Already matched substring: stay in accepting state ${fromState}`
          });
        } else {
          // Find longest prefix of pattern that matches suffix of (current_prefix + sym)
          const currentPrefixTokens = cleanPattern.slice(0, i);
          const combined = [...currentPrefixTokens, sym];

          let nextLen = 0;
          for (let len = Math.min(k, combined.length); len >= 1; len--) {
            const patternPrefix = cleanPattern.slice(0, len);
            const combinedSuffix = combined.slice(combined.length - len);
            if (patternPrefix.every((val, idx) => val === combinedSuffix[idx])) {
              nextLen = len;
              break;
            }
          }

          const toState = `q${nextLen}`;
          transitions.push({
            from: fromState,
            input: sym,
            to: toState,
            explanation: `Read '${sym}' after "${currentPrefixTokens.join('')}": matched prefix of length ${nextLen} -> ${toState}`
          });
        }
      }
    }

    return {
      id: `dfa_sub_${cleanPattern.join('')}`,
      name: `DFA for Strings Containing Substring "${cleanPattern.join('')}"`,
      type: 'DFA',
      alphabet,
      states,
      startState: 'q0',
      acceptStates: [`q${k}`],
      transitions,
      stateMeanings
    };
  }

  /**
   * Dynamic Ends-With Suffix DFA Synthesizer
   */
  static buildSuffixDFA(suffix: string, customAlphabet: string[] = ['0', '1']): AutomatonData {
    const sufTokens = Tokenizer.tokenizeInputString(suffix);
    const cleanSuffix = sufTokens.length > 0 ? sufTokens : ['0', '1'];
    const alphabet = Array.from(new Set([...Tokenizer.parseAlphabet(customAlphabet), ...cleanSuffix]));

    const k = cleanSuffix.length;
    const states: string[] = [];
    const stateMeanings: Record<string, string> = {};
    const transitions: AutomatonTransition[] = [];

    for (let i = 0; i <= k; i++) {
      const st = `q${i}`;
      states.push(st);
      stateMeanings[st] = i === k
        ? `Ends with full suffix "${cleanSuffix.join('')}" (Accepting)`
        : `Matched suffix prefix of length ${i}: "${cleanSuffix.slice(0, i).join('')}"`;
    }

    for (let i = 0; i <= k; i++) {
      const fromState = `q${i}`;
      for (const sym of alphabet) {
        const currentPrefixTokens = cleanSuffix.slice(0, i);
        const combined = [...currentPrefixTokens, sym];

        let nextLen = 0;
        for (let len = Math.min(k, combined.length); len >= 1; len--) {
          const suffixPrefix = cleanSuffix.slice(0, len);
          const combinedSuffix = combined.slice(combined.length - len);
          if (suffixPrefix.every((val, idx) => val === combinedSuffix[idx])) {
            nextLen = len;
            break;
          }
        }

        const toState = `q${nextLen}`;
        transitions.push({
          from: fromState,
          input: sym,
          to: toState,
          explanation: `Read '${sym}': matches suffix prefix of length ${nextLen} -> ${toState}`
        });
      }
    }

    return {
      id: `dfa_ends_${cleanSuffix.join('')}`,
      name: `DFA for Strings Ending with "${cleanSuffix.join('')}"`,
      type: 'DFA',
      alphabet,
      states,
      startState: 'q0',
      acceptStates: [`q${k}`],
      transitions,
      stateMeanings
    };
  }

  /**
   * Dynamic Starts-With Prefix DFA Synthesizer (features explicit dead/trap state)
   */
  static buildPrefixDFA(prefix: string, customAlphabet: string[] = ['0', '1']): AutomatonData {
    const preTokens = Tokenizer.tokenizeInputString(prefix);
    const cleanPrefix = preTokens.length > 0 ? preTokens : ['0', '1'];
    const alphabet = Array.from(new Set([...Tokenizer.parseAlphabet(customAlphabet), ...cleanPrefix]));

    const k = cleanPrefix.length;
    const states: string[] = [];
    const stateMeanings: Record<string, string> = {};
    const transitions: AutomatonTransition[] = [];
    const trapState = 'q_trap';

    for (let i = 0; i <= k; i++) {
      const st = `q${i}`;
      states.push(st);
      stateMeanings[st] = i === k
        ? `Successfully started with "${cleanPrefix.join('')}" (Loop Accept)`
        : `Matched starting prefix of length ${i}: "${cleanPrefix.slice(0, i).join('')}"`;
    }

    states.push(trapState);
    stateMeanings[trapState] = 'Trap state: string does NOT start with required prefix';

    for (let i = 0; i < k; i++) {
      const fromState = `q${i}`;
      const requiredSym = cleanPrefix[i];
      for (const sym of alphabet) {
        if (sym === requiredSym) {
          transitions.push({
            from: fromState,
            input: sym,
            to: `q${i + 1}`,
            explanation: `Matched expected symbol '${sym}' at index ${i} -> q${i + 1}`
          });
        } else {
          transitions.push({
            from: fromState,
            input: sym,
            to: trapState,
            explanation: `Mismatch! Expected '${requiredSym}', read '${sym}' -> ${trapState}`
          });
        }
      }
    }

    // Accepting state qk loops on all symbols
    for (const sym of alphabet) {
      transitions.push({
        from: `q${k}`,
        input: sym,
        to: `q${k}`,
        explanation: `Prefix confirmed: stay in accepting state q${k}`
      });
      // Trap state loops on all symbols
      transitions.push({
        from: trapState,
        input: sym,
        to: trapState,
        explanation: `Trap: stay in non-accepting state ${trapState}`
      });
    }

    return {
      id: `dfa_starts_${cleanPrefix.join('')}`,
      name: `DFA for Strings Starting with "${cleanPrefix.join('')}"`,
      type: 'DFA',
      alphabet,
      states,
      startState: 'q0',
      acceptStates: [`q${k}`],
      transitions,
      trapState,
      stateMeanings
    };
  }

  /**
   * Dynamic Parity DFA Synthesizer (Even / Odd count of a symbol)
   */
  static buildParityDFA(targetSymbol: string, targetParity: 'EVEN' | 'ODD' = 'EVEN', customAlphabet: string[] = ['0', '1']): AutomatonData {
    const alphabet = Tokenizer.parseAlphabet(customAlphabet);
    const sym = alphabet.includes(targetSymbol) ? targetSymbol : alphabet[0];

    const states = ['q_even', 'q_odd'];
    const stateMeanings = {
      q_even: `Even number of '${sym}' read so far`,
      q_odd: `Odd number of '${sym}' read so far`
    };

    const transitions: AutomatonTransition[] = [
      { from: 'q_even', input: sym, to: 'q_odd', explanation: `Read '${sym}': count changes from even to odd` },
      { from: 'q_odd', input: sym, to: 'q_even', explanation: `Read '${sym}': count changes from odd to even` }
    ];

    // Other symbols self loop
    for (const s of alphabet) {
      if (s !== sym) {
        transitions.push({ from: 'q_even', input: s, to: 'q_even', explanation: `Read '${s}': count of '${sym}' unchanged` });
        transitions.push({ from: 'q_odd', input: s, to: 'q_odd', explanation: `Read '${s}': count of '${sym}' unchanged` });
      }
    }

    const acceptStates = targetParity === 'EVEN' ? ['q_even'] : ['q_odd'];

    return {
      id: `dfa_parity_${sym}_${targetParity.toLowerCase()}`,
      name: `DFA for ${targetParity} Number of '${sym}'s`,
      type: 'DFA',
      alphabet,
      states,
      startState: 'q_even',
      acceptStates,
      transitions,
      stateMeanings
    };
  }
}
