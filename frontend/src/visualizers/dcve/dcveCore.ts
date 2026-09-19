import {
  ComputationStep,
  StepConfiguration,
  FormalRule,
  StepDiff,
  VisualEvent,
  TestCaseModel
} from './types.js';
import { SimulationResult, SimulationStep, AutomatonData, PDAData, TMData } from '../../types/index.js';

export class DCVECore {
  /**
   * Converts any raw simulation trace into canonical ComputationStep models
   * enriched with diffs, formal mathematical formulas, why-explanations, and visual events.
   */
  static convertSimulationToSteps(
    simResult: SimulationResult,
    machineType: 'DFA' | 'NFA' | 'PDA' | 'TM',
    machineModel: AutomatonData | PDAData | TMData | any,
    initialInput: string
  ): ComputationStep[] {
    const rawSteps = simResult.steps;
    if (!rawSteps || rawSteps.length === 0) {
      return [];
    }

    const computationSteps: ComputationStep[] = [];
    const total = rawSteps.length;

    for (let i = 0; i < total; i++) {
      const current = rawSteps[i];
      const prev = i > 0 ? rawSteps[i - 1] : null;
      const isInitial = i === 0;
      const isLast = i === total - 1;

      // 1. Build Before & After Configuration
      const beforeState = prev ? prev.currentState : current.currentState;
      const afterState = current.currentState;

      const beforeRemaining = prev ? prev.remainingInput : initialInput;
      const afterRemaining = current.remainingInput;

      const beforeConsumed = prev ? prev.consumedInput : '';
      const afterConsumed = current.consumedInput;

      const beforeStack = prev?.stack ? [...prev.stack] : current.stack ? [...current.stack] : undefined;
      const afterStack = current.stack ? [...current.stack] : undefined;

      const beforeTape = prev?.tape ? [...prev.tape] : current.tape ? [...current.tape] : undefined;
      const afterTape = current.tape ? [...current.tape] : undefined;

      const beforeHead = prev?.headPosition !== undefined ? prev.headPosition : current.headPosition;
      const afterHead = current.headPosition !== undefined ? current.headPosition : undefined;

      const symbolConsumed = current.currentSymbol || '';

      const beforeConfig: StepConfiguration = {
        currentState: beforeState,
        remainingInput: beforeRemaining,
        consumedInput: beforeConsumed,
        currentSymbol: prev?.currentSymbol,
        stack: beforeStack,
        tape: beforeTape,
        headPosition: beforeHead,
        instantaneousDescription: prev ? this.buildID(prev, machineType) : undefined
      };

      const afterConfig: StepConfiguration = {
        currentState: afterState,
        remainingInput: afterRemaining,
        consumedInput: afterConsumed,
        currentSymbol: current.currentSymbol,
        stack: afterStack,
        tape: afterTape,
        headPosition: afterHead,
        instantaneousDescription: this.buildID(current, machineType)
      };

      // 2. Build Formal Mathematical Rule (Section 5 & 51)
      const ruleApplied = this.deriveFormalRule(current, machineType, machineModel);

      // 3. Compute Exact Structural Diff (Section 50)
      const diff = this.computeStepDiff(beforeConfig, afterConfig, symbolConsumed, machineType);

      // 4. Derive Visual Events (Section 39-40)
      const visualEvents = this.deriveVisualEvents(beforeConfig, afterConfig, ruleApplied, isLast, simResult.accepted);

      // 5. Pedagogical "Why Did This Happen?" (Section 49)
      const why = this.explainWhy(beforeConfig, afterConfig, ruleApplied, current, isInitial, isLast, simResult.accepted, machineType);

      // 6. Status determination
      let status: ComputationStep['status'] = 'running';
      if (isLast) {
        status = simResult.accepted ? 'accepted' : 'rejected';
      }

      computationSteps.push({
        stepNumber: i,
        before: beforeConfig,
        event: {
          type: isInitial ? 'INITIALIZE' : symbolConsumed ? 'READ_SYMBOL' : 'EPSILON_TRANSITION',
          symbol: symbolConsumed,
          description: isInitial
            ? 'Machine initialized at start state'
            : symbolConsumed
            ? `Read symbol '${symbolConsumed}'`
            : 'Spontaneous ε-transition'
        },
        ruleApplied,
        after: afterConfig,
        inputConsumed: symbolConsumed ? [symbolConsumed] : [],
        stateChanges: [
          {
            from: beforeState,
            to: afterState
          }
        ],
        memoryChanges: this.buildMemoryChanges(beforeConfig, afterConfig, machineType),
        visualEvents,
        explanation: current.explanation || (isInitial ? 'Initial configuration set.' : 'Transition applied.'),
        why,
        diff,
        status
      });
    }

    return computationSteps;
  }

  /**
   * Derives formal mathematical transition formula (Section 5)
   */
  private static deriveFormalRule(
    step: SimulationStep,
    machineType: 'DFA' | 'NFA' | 'PDA' | 'TM',
    model: any
  ): FormalRule {
    const t: any = step.transitionUsed;
    const currentState = typeof step.currentState === 'string' ? step.currentState : step.currentState.join(',');

    if (machineType === 'PDA') {
      const fromSt = t?.from || currentState;
      const toSt = t?.to || currentState;
      const inputSym = t?.input || step.currentSymbol || 'ε';
      const stackTop = t?.stackTop || (step.stack && step.stack.length > 0 ? step.stack[step.stack.length - 1] : 'Z0');
      const stackRep = t?.stackReplacement || (step.stack ? step.stack.join('') : 'Z0');

      return {
        machineType: 'PDA',
        formula: `δ(${fromSt}, ${inputSym}, ${stackTop}) = {(${toSt}, ${stackRep})}`,
        explanation: `In state ${fromSt}, with input '${inputSym}' and stack top '${stackTop}', replace '${stackTop}' with '${stackRep}' and move to ${toSt}.`,
        components: {
          stateFrom: fromSt,
          symbolRead: inputSym,
          stackTop,
          stateTo: toSt,
          stackReplacement: stackRep
        }
      };
    }

    if (machineType === 'TM') {
      const fromSt = t?.from || currentState;
      const toSt = t?.to || currentState;
      const readSym = t?.input || step.currentSymbol || '□';
      const writeSym = t?.writeSymbol || readSym;
      const dir = t?.direction || 'R';

      return {
        machineType: 'TM',
        formula: `δ(${fromSt}, '${readSym}') = (${toSt}, '${writeSym}', ${dir})`,
        explanation: `In state ${fromSt}, reading '${readSym}', write '${writeSym}', head moves ${dir}, enter ${toSt}.`,
        components: {
          stateFrom: fromSt,
          symbolRead: readSym,
          stateTo: toSt,
          symbolWrite: writeSym,
          headDirection: dir
        }
      };
    }

    // Default: DFA / NFA
    const fromSt = t?.from || (typeof step.currentState === 'string' ? step.currentState : 'q0');
    const toSt = t?.to || (typeof step.currentState === 'string' ? step.currentState : 'q0');
    const inputSym = t?.input || step.currentSymbol || 'ε';

    return {
      machineType: machineType === 'NFA' ? 'NFA' : 'DFA',
      formula: machineType === 'NFA' ? `δ(${fromSt}, '${inputSym}') ⊇ {${toSt}}` : `δ(${fromSt}, '${inputSym}') = ${toSt}`,
      explanation: `Transition from state ${fromSt} on input '${inputSym}' leads to state ${toSt}.`,
      components: {
        stateFrom: fromSt,
        symbolRead: inputSym,
        stateTo: toSt
      }
    };
  }

  /**
   * Computes a compact before-to-after mathematical diff (Section 50)
   */
  private static computeStepDiff(
    before: StepConfiguration,
    after: StepConfiguration,
    symbol: string,
    machineType: string
  ): StepDiff {
    const fromSt = typeof before.currentState === 'string' ? before.currentState : before.currentState.join(',');
    const toSt = typeof after.currentState === 'string' ? after.currentState : after.currentState.join(',');

    const stateChanged = fromSt !== toSt ? { from: before.currentState, to: after.currentState } : undefined;
    const inputChanged = symbol
      ? {
          from: before.remainingInput,
          to: after.remainingInput,
          consumed: symbol
        }
      : undefined;

    let stackChanged: StepDiff['stackChanged'];
    if (machineType === 'PDA' && before.stack && after.stack) {
      const bLen = before.stack.length;
      const aLen = after.stack.length;
      let action: 'PUSH' | 'POP' | 'REPLACE' | 'NONE' = 'NONE';
      let symbols: string[] = [];

      if (aLen > bLen) {
        action = 'PUSH';
        symbols = after.stack.slice(bLen);
      } else if (aLen < bLen) {
        action = 'POP';
        symbols = before.stack.slice(aLen);
      } else {
        const topB = before.stack[bLen - 1];
        const topA = after.stack[aLen - 1];
        if (topB !== topA) {
          action = 'REPLACE';
          symbols = [topA];
        }
      }

      stackChanged = {
        from: before.stack,
        to: after.stack,
        action,
        symbols
      };
    }

    let tapeChanged: StepDiff['tapeChanged'];
    if (machineType === 'TM' && before.tape && after.tape && before.headPosition !== undefined && after.headPosition !== undefined) {
      const idx = before.headPosition;
      const fromSym = before.tape[idx] || '□';
      const toSym = after.tape[idx] || '□';
      const dir = after.headPosition > before.headPosition ? 'RIGHT (+1)' : after.headPosition < before.headPosition ? 'LEFT (-1)' : 'STAY';

      tapeChanged = {
        cellIndex: idx,
        from: fromSym,
        to: toSym,
        headFrom: before.headPosition,
        headTo: after.headPosition,
        moveDir: dir
      };
    }

    const summaryParts: string[] = [];
    if (stateChanged) summaryParts.push(`State: ${fromSt} → ${toSt}`);
    if (inputChanged) summaryParts.push(`Consumed: '${symbol}'`);
    if (stackChanged && stackChanged.action !== 'NONE') {
      summaryParts.push(`Stack: ${stackChanged.action} (${stackChanged.symbols.join(',')})`);
    }
    if (tapeChanged) summaryParts.push(`Tape[${tapeChanged.cellIndex}]: '${tapeChanged.from}' → '${tapeChanged.to}', Head: ${tapeChanged.moveDir}`);

    return {
      stateChanged,
      inputChanged,
      stackChanged,
      tapeChanged,
      summary: summaryParts.join(' | ') || 'No state or memory modification.'
    };
  }

  /**
   * Generates visual events for animation synchronization (Section 39-40)
   */
  private static deriveVisualEvents(
    before: StepConfiguration,
    after: StepConfiguration,
    rule: FormalRule,
    isLast: boolean,
    accepted: boolean
  ): VisualEvent[] {
    const events: VisualEvent[] = [];

    // State change event
    const bSt = typeof before.currentState === 'string' ? before.currentState : before.currentState.join(',');
    const aSt = typeof after.currentState === 'string' ? after.currentState : after.currentState.join(',');
    if (bSt !== aSt) {
      events.push({
        type: 'STATE_CHANGE',
        mathematicalOperation: rule.formula,
        payload: { from: bSt, to: aSt },
        description: `State moved from ${bSt} to ${aSt}`
      });
    }

    // Input consumed
    if (rule.components.symbolRead && rule.components.symbolRead !== 'ε') {
      events.push({
        type: 'INPUT_CONSUMED',
        mathematicalOperation: `Consume '${rule.components.symbolRead}'`,
        payload: { symbol: rule.components.symbolRead },
        description: `Input token '${rule.components.symbolRead}' consumed from tape`
      });
    } else if (rule.components.symbolRead === 'ε') {
      events.push({
        type: 'EPSILON_MOVE',
        mathematicalOperation: 'ε-transition',
        payload: {},
        description: 'Spontaneous state change without reading input'
      });
    }

    // Stack operations
    if (rule.machineType === 'PDA') {
      const top = rule.components.stackTop;
      const rep = rule.components.stackReplacement;
      if (rep === 'ε' || rep === '') {
        events.push({
          type: 'STACK_POP',
          mathematicalOperation: `${rule.components.symbolRead},${top} → ε`,
          payload: { popped: top },
          description: `Popped '${top}' from stack`
        });
      } else if (rep && rep.length > 1) {
        events.push({
          type: 'STACK_PUSH',
          mathematicalOperation: `${rule.components.symbolRead},${top} → ${rep}`,
          payload: { pushed: rep },
          description: `Pushed '${rep}' onto stack`
        });
      }
    }

    // TM Tape operations
    if (rule.machineType === 'TM') {
      events.push({
        type: 'TAPE_WRITE',
        mathematicalOperation: `Write '${rule.components.symbolWrite}'`,
        payload: { symbol: rule.components.symbolWrite, head: before.headPosition },
        description: `Wrote '${rule.components.symbolWrite}' on tape cell`
      });
      events.push({
        type: 'TAPE_MOVE',
        mathematicalOperation: `Move ${rule.components.headDirection}`,
        payload: { direction: rule.components.headDirection },
        description: `Tape head moved ${rule.components.headDirection}`
      });
    }

    // Outcome events
    if (isLast) {
      events.push({
        type: accepted ? 'ACCEPT' : 'REJECT',
        mathematicalOperation: accepted ? 'w ∈ L(M)' : 'w ∉ L(M)',
        payload: { accepted },
        description: accepted ? 'Final state/condition satisfied: String ACCEPTED' : 'Halting condition failed: String REJECTED'
      });
    }

    return events;
  }

  /**
   * Pedagogical explanation generator: "Why Did This Happen?" (Section 49)
   */
  private static explainWhy(
    before: StepConfiguration,
    after: StepConfiguration,
    rule: FormalRule,
    rawStep: SimulationStep,
    isInitial: boolean,
    isLast: boolean,
    accepted: boolean,
    machineType: string
  ): string {
    if (isInitial) {
      return `The machine begins in initial state ${typeof after.currentState === 'string' ? after.currentState : after.currentState[0]}. The input tape is primed and memory is initialized.`;
    }

    if (isLast) {
      const finalStateStr = typeof after.currentState === 'string' ? after.currentState : after.currentState.join(', ');
      if (accepted) {
        return `Execution halted because input has been completely read and the machine reached an accepting configuration (${finalStateStr}). Therefore, the string is ACCEPTED by the formal language.`;
      } else {
        return `Execution ended in non-accepting state ${finalStateStr} or no valid transition was defined for the current input symbol. The input is therefore REJECTED.`;
      }
    }

    if (machineType === 'PDA') {
      const sym = rule.components.symbolRead || 'ε';
      const top = rule.components.stackTop || 'Z0';
      const rep = rule.components.stackReplacement || 'ε';
      return `In state ${rule.components.stateFrom}, reading input '${sym}' with stack top '${top}', the unique matching transition δ applies. '${top}' is popped and replaced by '${rep}', transitioning to ${rule.components.stateTo}.`;
    }

    if (machineType === 'TM') {
      return `The Turing Machine scanned '${rule.components.symbolRead}' at current head position. Transition δ instructed the write-head to output '${rule.components.symbolWrite}', advance ${rule.components.headDirection}, and shift state to ${rule.components.stateTo}.`;
    }

    return `At state ${rule.components.stateFrom}, the input symbol '${rule.components.symbolRead}' matched transition rule ${rule.formula}. The automaton advances its state to ${rule.components.stateTo} and consumes the symbol.`;
  }

  /**
   * Builds memory change structures for stack/tape/partitions
   */
  private static buildMemoryChanges(before: StepConfiguration, after: StepConfiguration, machineType: string): ComputationStep['memoryChanges'] {
    const list: ComputationStep['memoryChanges'] = [];

    if (machineType === 'PDA' && before.stack && after.stack) {
      list.push({
        type: 'STACK',
        before: [...before.stack],
        after: [...after.stack],
        diffSummary: `Stack size: ${before.stack.length} → ${after.stack.length} (Top: ${after.stack[after.stack.length - 1] || 'empty'})`
      });
    }

    if (machineType === 'TM' && before.tape && after.tape) {
      list.push({
        type: 'TAPE',
        before: { tape: [...before.tape], head: before.headPosition },
        after: { tape: [...after.tape], head: after.headPosition },
        diffSummary: `Head: ${before.headPosition} → ${after.headPosition}`
      });
    }

    return list;
  }

  /**
   * Builds formal Instantaneous Description (ID) string (Section 19)
   */
  private static buildID(step: SimulationStep, machineType: string): string {
    const st = typeof step.currentState === 'string' ? step.currentState : step.currentState.join(',');
    const rem = step.remainingInput || 'ε';

    if (machineType === 'PDA') {
      const stk = step.stack ? step.stack.slice().reverse().join('') : 'Z0';
      return `(${st}, ${rem}, ${stk})`;
    }

    if (machineType === 'TM' && step.tape && step.headPosition !== undefined) {
      const left = step.tape.slice(0, step.headPosition).join('');
      const head = step.tape[step.headPosition] || '□';
      const right = step.tape.slice(step.headPosition + 1).join('');
      return `${left}${st}${head}${right}`;
    }

    return `(${st}, ${rem})`;
  }

  /**
   * Trace Validation (Section 42): Verifies mathematical continuity before rendering
   */
  static validateTrace(steps: ComputationStep[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (steps.length === 0) {
      return { valid: true, errors: [] };
    }

    for (let i = 0; i < steps.length - 1; i++) {
      const current = steps[i];
      const next = steps[i + 1];

      // Verify continuity: after(step[i]) == before(step[i+1])
      const curAfterState = JSON.stringify(current.after.currentState);
      const nextBeforeState = JSON.stringify(next.before.currentState);
      if (curAfterState !== nextBeforeState) {
        errors.push(
          `Continuity break between step ${i} and ${i + 1}: After-state ${curAfterState} does not equal Next-Before-state ${nextBeforeState}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates representative test cases based on the alphabet and language type (Section 55)
   */
  static generateRepresentativeTestCases(alphabet: string[] = ['0', '1'], questionText = ''): TestCaseModel[] {
    const cleanAlpha = alphabet.length > 0 ? alphabet : ['0', '1'];
    const a = cleanAlpha[0] || '0';
    const b = cleanAlpha[1] || '1';
    const c = cleanAlpha[2] || '2';

    const list: TestCaseModel[] = [
      {
        input: '',
        displayLabel: 'ε (Empty String)',
        category: 'EPSILON',
        expectedOutcome: false,
        notes: 'Language testing on empty input'
      },
      {
        input: a,
        displayLabel: `'${a}' (Single Symbol)`,
        category: 'EDGE_CASE',
        expectedOutcome: false
      },
      {
        input: b,
        displayLabel: `'${b}' (Single Symbol)`,
        category: 'EDGE_CASE',
        expectedOutcome: false
      },
      {
        input: `${a}${b}`,
        displayLabel: `'${a}${b}' (Two Symbols)`,
        category: 'REPRESENTATIVE',
        expectedOutcome: true
      },
      {
        input: `${a}${a}${b}${b}`,
        displayLabel: `'${a}${a}${b}${b}' (Repeated)`,
        category: 'REPRESENTATIVE',
        expectedOutcome: true
      },
      {
        input: `${b}${b}${a}${a}`,
        displayLabel: `'${b}${b}${a}${a}' (Counter Example)`,
        category: 'INVALID',
        expectedOutcome: false
      }
    ];

    if (cleanAlpha.length >= 3) {
      list.push({
        input: `${a}${b}${c}`,
        displayLabel: `'${a}${b}${c}' (Three-Symbol Combination)`,
        category: 'REPRESENTATIVE',
        expectedOutcome: true
      });
    }

    return list;
  }
}
