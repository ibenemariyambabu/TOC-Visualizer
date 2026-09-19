import { AutomatonData, AutomatonTransition, MinimizationPartitionStep, MinimizationResult } from '../../types/index.js';
import { DFAEngine } from './dfa.js';

export class MinimizationEngine {
  /**
   * Minimizes a DFA using the Partition Refinement (Hopcroft-style / Table-filling equivalent) algorithm
   * Displays every intermediate partition step (P0, P1, P2...) with the exact reason states are split
   */
  static minimize(dfa: AutomatonData): MinimizationResult {
    // 1. Remove unreachable states
    const reachable = this.getReachableStates(dfa);
    const unreachable = dfa.states.filter((s) => !reachable.has(s));

    const cleanStates = dfa.states.filter((s) => reachable.has(s));
    const cleanTransitions = dfa.transitions.filter(
      (t) => reachable.has(t.from) && reachable.has(t.to)
    );
    const cleanAcceptStates = dfa.acceptStates.filter((s) => reachable.has(s));

    const workingDFA: AutomatonData = {
      ...dfa,
      states: cleanStates,
      acceptStates: cleanAcceptStates,
      transitions: cleanTransitions
    };

    const alphabet = workingDFA.alphabet.filter((sym) => sym !== 'ε' && sym !== 'e');

    // 2. Initial Partition P0: Split into Non-Accepting and Accepting states
    const nonAccepting = workingDFA.states.filter((s) => !workingDFA.acceptStates.includes(s));
    const accepting = workingDFA.states.filter((s) => workingDFA.acceptStates.includes(s));

    let currentPartitions: string[][] = [];
    if (nonAccepting.length > 0) currentPartitions.push([...nonAccepting].sort());
    if (accepting.length > 0) currentPartitions.push([...accepting].sort());

    const steps: MinimizationPartitionStep[] = [];

    steps.push({
      iteration: 0,
      partitions: currentPartitions.map((p) => [...p]),
      reason: `Initial partition P0: Distinguish non-final states [${nonAccepting.join(', ') || 'none'}] from final/accepting states [${accepting.join(', ') || 'none'}].`,
      splits: []
    });

    let iteration = 1;
    let refined = true;

    // Helper to find which partition a state belongs to
    const getPartitionIndex = (state: string, partitions: string[][]) => {
      return partitions.findIndex((part) => part.includes(state));
    };

    // Helper to get next state on symbol
    const getNextState = (state: string, symbol: string): string | null => {
      const t = workingDFA.transitions.find((trans) => trans.from === state && trans.input === symbol);
      return t ? t.to : null;
    };

    while (refined) {
      refined = false;
      const nextPartitions: string[][] = [];
      const splitRecords: MinimizationPartitionStep['splits'] = [];

      for (const group of currentPartitions) {
        if (group.length <= 1) {
          nextPartitions.push(group);
          continue;
        }

        // Sub-partition map: signature -> states in this subgroup
        // Signature is determined by the partition index of next state for each alphabet symbol
        const signatureMap = new Map<string, string[]>();

        for (const state of group) {
          const signature = alphabet
            .map((sym) => {
              const target = getNextState(state, sym);
              return target ? getPartitionIndex(target, currentPartitions) : -1;
            })
            .join('|');

          if (!signatureMap.has(signature)) {
            signatureMap.set(signature, []);
          }
          signatureMap.get(signature)!.push(state);
        }

        const subGroups = Array.from(signatureMap.values());

        if (subGroups.length > 1) {
          refined = true;
          // Record explanation of why this group split
          for (let sIdx = 0; sIdx < alphabet.length; sIdx++) {
            const sym = alphabet[sIdx];
            const sampleState1 = subGroups[0][0];
            const sampleState2 = subGroups[1][0];
            const target1 = getNextState(sampleState1, sym);
            const target2 = getNextState(sampleState2, sym);
            const p1 = target1 ? getPartitionIndex(target1, currentPartitions) : -1;
            const p2 = target2 ? getPartitionIndex(target2, currentPartitions) : -1;

            if (p1 !== p2) {
              splitRecords.push({
                originalPartition: group,
                symbol: sym,
                subPartitions: subGroups,
                explanation: `States in [${group.join(', ')}] were separated on symbol '${sym}' because ${sampleState1} transitions to ${target1} (Group P${p1}) while ${sampleState2} transitions to ${target2} (Group P${p2}).`
              });
              break;
            }
          }
        }

        for (const sub of subGroups) {
          nextPartitions.push(sub.sort());
        }
      }

      currentPartitions = nextPartitions;

      steps.push({
        iteration,
        partitions: currentPartitions.map((p) => [...p]),
        reason: refined
          ? `Iteration P${iteration}: Refined into ${currentPartitions.length} equivalence classes.`
          : `Iteration P${iteration}: No further partition refinement occurred. The partition has stabilized.`,
        splits: splitRecords
      });

      iteration++;
      if (iteration > 50) break; // Safety against infinite loop
    }

    // 3. Construct Minimized DFA from final partitions
    const stateMapping: Record<string, string> = {}; // originalState -> minimizedStateName
    const minimizedStates: string[] = [];

    currentPartitions.forEach((group, idx) => {
      const name = group.length === 1 ? group[0] : `q[${group.join('')}]`;
      minimizedStates.push(name);
      for (const st of group) {
        stateMapping[st] = name;
      }
    });

    const minimizedStartState = stateMapping[workingDFA.startState];
    const minimizedAcceptStates = Array.from(
      new Set(workingDFA.acceptStates.map((st) => stateMapping[st]))
    );

    const minimizedTransitions: AutomatonTransition[] = [];
    const seenTransitions = new Set<string>();

    for (const group of currentPartitions) {
      const representative = group[0];
      const fromMin = stateMapping[representative];

      for (const sym of alphabet) {
        const nextOriginal = getNextState(representative, sym);
        if (nextOriginal) {
          const toMin = stateMapping[nextOriginal];
          const key = `${fromMin}:::${sym}:::${toMin}`;

          if (!seenTransitions.has(key)) {
            seenTransitions.add(key);
            minimizedTransitions.push({
              from: fromMin,
              input: sym,
              to: toMin,
              explanation: `Equivalence class ${fromMin} transitions on '${sym}' to ${toMin}`
            });
          }
        }
      }
    }

    const minimizedAutomaton: AutomatonData = {
      id: `min_${dfa.id || 'dfa'}`,
      name: `Minimized DFA (${minimizedStates.length} states, reduced from ${dfa.states.length})`,
      type: 'DFA',
      alphabet,
      states: minimizedStates,
      startState: minimizedStartState,
      acceptStates: minimizedAcceptStates,
      transitions: minimizedTransitions,
      stateMeanings: Object.fromEntries(
        currentPartitions.map((group) => {
          const name = group.length === 1 ? group[0] : `q[${group.join('')}]`;
          return [name, `Merged equivalence class of {${group.join(', ')}}`];
        })
      )
    };

    return {
      originalStateCount: dfa.states.length,
      minimizedStateCount: minimizedStates.length,
      unreachableStatesRemoved: unreachable,
      steps,
      minimizedAutomaton,
      equivalentClasses: stateMapping
    };
  }

  private static getReachableStates(dfa: AutomatonData): Set<string> {
    const reachable = new Set<string>([dfa.startState]);
    const queue = [dfa.startState];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outgoing = dfa.transitions.filter((t) => t.from === curr);
      for (const t of outgoing) {
        if (!reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }

    return reachable;
  }
}
