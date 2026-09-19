import { AutomatonData, AutomatonTransition, SimulationResult, SimulationStep } from '../../types/index.js';

export interface SubsetConstructionStep {
  stepIndex: number;
  currentSubset: string[];
  subsetName: string;
  symbol: string;
  directTargets: string[];
  epsilonClosureTargets: string[];
  newSubsetName: string;
  isNewSubsetDiscovered: boolean;
  explanation: string;
}

export interface SubsetConstructionResult {
  dfa: AutomatonData;
  subsetMapping: Record<string, string[]>; // e.g. "D0": ["q0", "q1"]
  steps: SubsetConstructionStep[];
}

export class NFAEngine {
  /**
   * Computes epsilon-closure of a given set of states in an ε-NFA
   */
  static epsilonClosure(nfa: AutomatonData, initialStates: string[]): string[] {
    const closure = new Set<string>(initialStates);
    const stack = [...initialStates];

    const isEpsilon = (input: string) => input === 'ε' || input === 'e' || input === '' || input === 'E';

    while (stack.length > 0) {
      const state = stack.pop()!;
      const epsilonTransitions = nfa.transitions.filter(
        (t) => t.from === state && isEpsilon(t.input)
      );

      for (const t of epsilonTransitions) {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      }
    }

    return Array.from(closure).sort();
  }

  /**
   * Simulates an NFA / ε-NFA on an input string, tracking the set of active states at every step
   */
  static simulate(nfa: AutomatonData, inputString: string): SimulationResult {
    const steps: SimulationStep[] = [];
    const isEpsilonNFA = nfa.type === 'e-NFA' || nfa.transitions.some((t) => t.input === 'ε' || t.input === 'e');

    // Initial state set with epsilon closure
    let currentActiveStates = isEpsilonNFA
      ? this.epsilonClosure(nfa, [nfa.startState])
      : [nfa.startState];

    let consumed = '';
    let remaining = inputString;

    steps.push({
      stepIndex: 0,
      currentState: currentActiveStates,
      remainingInput: remaining,
      consumedInput: consumed,
      currentSymbol: null,
      explanation: `Initialized NFA. Start state {${nfa.startState}}${
        isEpsilonNFA ? ` with ε-closure: {${currentActiveStates.join(', ')}}` : ''
      }. Active branches: ${currentActiveStates.length}.`
    });

    for (let i = 0; i < inputString.length; i++) {
      const symbol = inputString[i];
      consumed += symbol;
      remaining = inputString.slice(i + 1);

      const nextStateSet = new Set<string>();
      const transitionsFired: AutomatonTransition[] = [];

      // Find all transitions from all active states on the current symbol
      for (const st of currentActiveStates) {
        const matches = nfa.transitions.filter((t) => t.from === st && t.input === symbol);
        for (const m of matches) {
          nextStateSet.add(m.to);
          transitionsFired.push(m);
        }
      }

      // Compute epsilon closure if applicable
      const nextStatesArray = Array.from(nextStateSet);
      currentActiveStates = isEpsilonNFA
        ? this.epsilonClosure(nfa, nextStatesArray)
        : nextStatesArray.sort();

      const explanation =
        currentActiveStates.length > 0
          ? `Read '${symbol}': active states transitioned to {${currentActiveStates.join(
              ', '
            )}} (${transitionsFired.length} branch transitions taken).`
          : `Read '${symbol}': no transitions available. All non-deterministic branches died.`;

      steps.push({
        stepIndex: i + 1,
        currentState: currentActiveStates,
        remainingInput: remaining,
        consumedInput: consumed,
        currentSymbol: symbol,
        explanation
      });

      if (currentActiveStates.length === 0) {
        break;
      }
    }

    // NFA accepts if ANY active state is an accepting state
    const hasAccepting = currentActiveStates.some((st) => nfa.acceptStates.includes(st));
    const finalExplanation = hasAccepting
      ? `ACCEPTED: At least one active branch reached an accepting state in {${nfa.acceptStates.join(', ')}}.`
      : `REJECTED: None of the active branches {${currentActiveStates.join(', ') || '∅'}} reached an accepting state.`;

    return {
      accepted: hasAccepting,
      finalState: currentActiveStates,
      steps,
      explanation: finalExplanation
    };
  }

  /**
   * Converts an NFA or ε-NFA to a DFA using the Subset Construction algorithm
   * Produces a fully documented step-by-step derivation
   */
  static subsetConstruction(nfa: AutomatonData): SubsetConstructionResult {
    const isEpsilonNFA = nfa.type === 'e-NFA' || nfa.transitions.some((t) => t.input === 'ε' || t.input === 'e');
    const cleanAlphabet = nfa.alphabet.filter((sym) => sym !== 'ε' && sym !== 'e' && sym !== '');

    const subsetMap = new Map<string, string>(); // serialized subset -> DFA state name (e.g. "[q0,q1]" -> "A" or "q0_q1")
    const reverseMap: Record<string, string[]> = {};
    const dfaTransitions: AutomatonTransition[] = [];
    const steps: SubsetConstructionStep[] = [];

    const serialize = (arr: string[]) => Array.from(new Set(arr)).sort().join(',');

    // 1. Initial DFA state: epsilon-closure of start state
    const initialNFAStates = isEpsilonNFA
      ? this.epsilonClosure(nfa, [nfa.startState])
      : [nfa.startState];

    const initialKey = serialize(initialNFAStates);
    const startDFAName = initialNFAStates.length > 0 ? `{${initialKey}}` : '{∅}';
    
    subsetMap.set(initialKey, startDFAName);
    reverseMap[startDFAName] = initialNFAStates;

    const queue: string[][] = [initialNFAStates];
    const visited = new Set<string>();

    let stepCounter = 1;

    while (queue.length > 0) {
      const currentSubset = queue.shift()!;
      const currentKey = serialize(currentSubset);

      if (visited.has(currentKey)) continue;
      visited.add(currentKey);

      const currentDFAName = subsetMap.get(currentKey)!;

      for (const symbol of cleanAlphabet) {
        // Find direct reachable states from currentSubset on symbol
        const directTargets = new Set<string>();
        for (const nfaState of currentSubset) {
          const transitions = nfa.transitions.filter((t) => t.from === nfaState && t.input === symbol);
          for (const t of transitions) {
            directTargets.add(t.to);
          }
        }

        const directArray = Array.from(directTargets).sort();
        const closureTargets = isEpsilonNFA
          ? this.epsilonClosure(nfa, directArray)
          : directArray;

        const targetKey = serialize(closureTargets);
        let targetDFAName = subsetMap.get(targetKey);
        let isNew = false;

        if (!targetDFAName) {
          isNew = true;
          targetDFAName = closureTargets.length > 0 ? `{${targetKey}}` : '{∅}';
          subsetMap.set(targetKey, targetDFAName);
          reverseMap[targetDFAName] = closureTargets;
          queue.push(closureTargets);
        }

        dfaTransitions.push({
          from: currentDFAName,
          input: symbol,
          to: targetDFAName,
          explanation: `Move on '${symbol}' from ${currentDFAName}: NFA reached {${directArray.join(
            ','
          ) || '∅'}}, ε-closure gave ${targetDFAName}`
        });

        steps.push({
          stepIndex: stepCounter++,
          currentSubset,
          subsetName: currentDFAName,
          symbol,
          directTargets: directArray,
          epsilonClosureTargets: closureTargets,
          newSubsetName: targetDFAName,
          isNewSubsetDiscovered: isNew,
          explanation: `Processed subset ${currentDFAName} with symbol '${symbol}'. Reachable: {${directArray.join(
            ','
          ) || '∅'}}${isEpsilonNFA ? ` -> ε-closure: ${targetDFAName}` : ''}.${
            isNew ? ` Discovered NEW DFA state ${targetDFAName}.` : ' Target state already known.'
          }`
        });
      }
    }

    const dfaStates = Array.from(subsetMap.values());
    const dfaAcceptStates = dfaStates.filter((dfaState) => {
      const nfaStates = reverseMap[dfaState] || [];
      return nfaStates.some((st) => nfa.acceptStates.includes(st));
    });

    const dfa: AutomatonData = {
      id: `dfa_from_${nfa.id || 'nfa'}`,
      name: `DFA converted from ${nfa.name || 'NFA'} via Subset Construction`,
      type: 'DFA',
      alphabet: cleanAlphabet,
      states: dfaStates,
      startState: startDFAName,
      acceptStates: dfaAcceptStates,
      transitions: dfaTransitions,
      stateMeanings: Object.fromEntries(
        Object.entries(reverseMap).map(([dfaSt, nfaSts]) => [
          dfaSt,
          `Equivalence subset of NFA states: {${nfaSts.join(', ') || 'dead state'}}`
        ])
      )
    };

    return {
      dfa,
      subsetMapping: reverseMap,
      steps
    };
  }
}
