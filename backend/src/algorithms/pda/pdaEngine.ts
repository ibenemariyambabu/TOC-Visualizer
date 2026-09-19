import {
  CFGGrammar,
  PDAData,
  PDATransition,
  SimulationResult,
  SimulationStep,
  InstantaneousDescription,
  PDAComputationTreeNode,
  PDASimplificationResult,
  PDAValidationResult,
  IDValidationResult
} from '../../types/index.js';
import { Tokenizer } from '../common/tokenizer.js';

export class PDAEngine {
  /**
   * Simulates a Pushdown Automaton (PDA) on a given input string.
   * Consistently executes transition function δ and tracks stack, state, and acceptance.
   * Supports both DPDA and NPDA (nondeterministic branch exploration).
   */
  static simulate(pda: PDAData, inputString: string): SimulationResult {
    const tokens = Tokenizer.tokenizeInputString(inputString, pda.inputAlphabet);

    interface PathConfig {
      state: string;
      stack: string[];
      inputIndex: number;
      steps: SimulationStep[];
      depth: number;
    }

    const initialStep: SimulationStep = {
      stepIndex: 0,
      currentState: pda.startState,
      remainingInput: tokens.join(''),
      consumedInput: '',
      currentSymbol: null,
      stack: [pda.initialStackSymbol],
      explanation: `PDA initialized in state ${pda.startState}. Initial stack symbol: [${pda.initialStackSymbol}].`
    };

    const initialConfig: PathConfig = {
      state: pda.startState,
      stack: [pda.initialStackSymbol],
      inputIndex: 0,
      steps: [initialStep],
      depth: 0
    };

    const isEmptyStackMode = String(pda.acceptanceMode || '').toUpperCase().includes('EMPTY');

    const isAccepted = (cfg: PathConfig): boolean => {
      const inputDone = cfg.inputIndex >= tokens.length;
      if (!inputDone) return false;
      if (isEmptyStackMode) {
        return cfg.stack.length === 0;
      }
      return pda.acceptStates.includes(cfg.state);
    };

    if (isAccepted(initialConfig)) {
      return {
        accepted: true,
        finalState: initialConfig.state,
        steps: initialConfig.steps,
        explanation: isEmptyStackMode
          ? 'Entire input consumed and stack is empty. ACCEPTED by Empty Stack.'
          : `Entire input consumed and machine in accepting state "${initialConfig.state}". ACCEPTED by Final State.`
      };
    }

    const queue: PathConfig[] = [initialConfig];
    const visited = new Set<string>();
    let fallbackConfig: PathConfig = initialConfig;
    const maxIterations = 3000;
    let iterations = 0;

    while (queue.length > 0 && iterations < maxIterations) {
      iterations++;
      const current = queue.shift()!;
      const { state, stack, inputIndex, steps, depth } = current;

      if (
        inputIndex > fallbackConfig.inputIndex ||
        (inputIndex === fallbackConfig.inputIndex && steps.length > fallbackConfig.steps.length)
      ) {
        fallbackConfig = current;
      }

      if (isAccepted(current)) {
        return {
          accepted: true,
          finalState: state,
          steps,
          explanation:
            isEmptyStackMode
              ? 'Entire input consumed and stack is completely empty. ACCEPTED by Empty Stack.'
              : `Entire input consumed and machine in accepting state "${state}". ACCEPTED by Final State.`
        };
      }

      if (depth >= 60) continue;

      const currentSym = inputIndex < tokens.length ? tokens[inputIndex] : 'ε';
      const stackTop = stack.length > 0 ? stack[stack.length - 1] : 'EMPTY';

      const configKey = `${state}|${inputIndex}|${stack.join(',')}`;
      if (visited.has(configKey)) continue;
      visited.add(configKey);

      // Find all matching transitions: either symbol match or epsilon transition
      const matchingTransitions = pda.transitions.filter((t) => {
        if (t.from !== state) return false;
        if (t.stackTop !== stackTop) return false;
        return (t.input === currentSym && currentSym !== 'ε') || Tokenizer.isEpsilon(t.input);
      });

      for (const t of matchingTransitions) {
        const isEp = Tokenizer.isEpsilon(t.input);
        const nextInputIndex = isEp ? inputIndex : inputIndex + 1;
        const nextConsumed = tokens.slice(0, nextInputIndex).join('');
        const nextRemaining = tokens.slice(nextInputIndex).join('');

        const nextStack = [...stack];
        nextStack.pop(); // pop stackTop
        if (!Tokenizer.isEpsilon(t.stackReplacement)) {
          const repTokens = t.stackReplacement.split('');
          for (let r = repTokens.length - 1; r >= 0; r--) {
            nextStack.push(repTokens[r]);
          }
        }

        const explanation =
          t.explanation ||
          `Read '${t.input}', popped '${t.stackTop}', replaced with '${t.stackReplacement}'. State: ${t.to}. Stack: [${nextStack.join(', ')}].`;

        const nextStep: SimulationStep = {
          stepIndex: steps.length,
          currentState: t.to,
          remainingInput: nextRemaining,
          consumedInput: nextConsumed,
          currentSymbol: t.input,
          transitionUsed: {
            from: t.from,
            input: t.input,
            to: t.to,
            explanation
          },
          pdaTransitionUsed: t,
          stack: [...nextStack],
          explanation
        };

        const nextConfig: PathConfig = {
          state: t.to,
          stack: nextStack,
          inputIndex: nextInputIndex,
          steps: [...steps, nextStep],
          depth: depth + 1
        };

        if (isAccepted(nextConfig)) {
          return {
            accepted: true,
            finalState: nextConfig.state,
            steps: nextConfig.steps,
            explanation:
              isEmptyStackMode
                ? 'Entire input consumed and stack is completely empty. ACCEPTED by Empty Stack.'
                : `Entire input consumed and machine in accepting state "${nextConfig.state}". ACCEPTED by Final State.`
          };
        }

        queue.push(nextConfig);
      }
    }

    const inputCompletelyConsumed = fallbackConfig.inputIndex >= tokens.length;
    const rejectionReason =
      isEmptyStackMode
        ? `Rejected: ${!inputCompletelyConsumed ? 'Could not consume entire input string' : 'Stack is not empty'}.`
        : `Rejected: ${!inputCompletelyConsumed ? 'Could not consume entire input string' : `Current state "${fallbackConfig.state}" is not an accepting state`}.`;

    return {
      accepted: false,
      finalState: fallbackConfig.state,
      steps: fallbackConfig.steps,
      explanation: rejectionReason
    };
  }

  /**
   * Generates formal Instantaneous Descriptions (IDs) sequence: (q, w, α) ⊢ (q', w', α')
   * Standard convention: stack α is formatted from top → bottom (Leftmost is TOP).
   * Generates full 7-step derivation and mathematical transition rule for every move.
   */
  static generateIDs(
    pda: PDAData,
    inputStringOrSim: string | SimulationResult
  ): InstantaneousDescription[] {
    const sim =
      typeof inputStringOrSim === 'string'
        ? this.simulate(pda, inputStringOrSim)
        : inputStringOrSim;

    const result: InstantaneousDescription[] = [];

    for (let idx = 0; idx < sim.steps.length; idx++) {
      const step = sim.steps[idx];
      const remaining = step.remainingInput === '' ? 'ε' : step.remainingInput;
      // In internal stack array, index 0 is bottom and last element is top.
      // Top → Bottom representation places top symbol first (index 0 of stackArray).
      const stackArr =
        step.stack && step.stack.length > 0 ? [...step.stack].reverse() : [];
      const stackContent = stackArr.length > 0 ? stackArr.join('') : 'ε';
      const currentFormatted = `(${step.currentState}, ${remaining}, ${stackContent})`;

      let transitionApplied: string | undefined;
      let turnstileSymbol: string = idx === 0 ? '' : '⊢';
      let beforeConfig: string | undefined;
      let afterConfig: string = currentFormatted;
      let consumedSymbol: string | undefined;
      let poppedSymbol: string | undefined;
      let pushedSymbols: string | undefined;
      let derivationSteps: string[] | undefined;

      if (idx > 0) {
        const prevStep = sim.steps[idx - 1];
        const prevRemaining = prevStep.remainingInput === '' ? 'ε' : prevStep.remainingInput;
        const prevStackArr =
          prevStep.stack && prevStep.stack.length > 0 ? [...prevStep.stack].reverse() : [];
        const prevStackContent = prevStackArr.length > 0 ? prevStackArr.join('') : 'ε';
        beforeConfig = `(${prevStep.currentState}, ${prevRemaining}, ${prevStackContent})`;

        const t = step.pdaTransitionUsed;
        if (t) {
          transitionApplied = `δ(${t.from}, ${t.input}, ${t.stackTop}) = {(${t.to}, ${t.stackReplacement})}`;
          consumedSymbol = t.input;
          poppedSymbol = t.stackTop;
          pushedSymbols = t.stackReplacement;

          derivationSteps = [
            `1. Read symbol: '${t.input}'`,
            `2. Current state: '${t.from}'`,
            `3. Stack top: '${t.stackTop}' (orientation: top → bottom)`,
            `4. Consult transition function: δ(${t.from}, ${t.input}, ${t.stackTop}) = {(${t.to}, ${t.stackReplacement})}`,
            `5. ${
              Tokenizer.isEpsilon(t.input)
                ? 'ε-transition: consumed no input symbol'
                : `Consume '${t.input}' from unread input (${prevRemaining} → ${remaining})`
            }`,
            `6. Pop '${t.stackTop}' and push replacement '${t.stackReplacement}' (${prevStackContent} → ${stackContent})`,
            `7. New configuration reached: ${afterConfig}`
          ];
        }
      }

      result.push({
        stepIndex: idx,
        state: String(step.currentState),
        remainingInput: remaining,
        stackString: stackContent,
        stackArray: stackArr,
        formatted: currentFormatted,
        transitionApplied,
        turnstileSymbol,
        beforeConfig,
        afterConfig,
        consumedSymbol,
        poppedSymbol,
        pushedSymbols,
        derivationSteps
      });
    }

    return result;
  }

  /**
   * Automated ID Validator (Section 12 Requirement)
   * Formally verifies that consecutive configurations ID[i] ⊢ ID[i+1] are valid under δ.
   */
  static validateIDTrace(pda: PDAData, ids: InstantaneousDescription[]): IDValidationResult {
    const errors: string[] = [];
    if (ids.length === 0) {
      return { isValid: false, errors: ['ID trace is empty.'], stepsValidated: 0 };
    }

    // 1. Check initial configuration
    const initial = ids[0];
    if (initial.state !== pda.startState) {
      errors.push(
        `Initial ID state '${initial.state}' does not match PDA start state '${pda.startState}'.`
      );
    }
    if (
      initial.stackArray.length === 0 ||
      initial.stackArray[initial.stackArray.length - 1] !== pda.initialStackSymbol
    ) {
      errors.push(
        `Initial ID stack '${initial.stackString}' does not contain start symbol '${pda.initialStackSymbol}'.`
      );
    }

    // 2. Check each transition ID[i] ⊢ ID[i+1]
    for (let i = 0; i < ids.length - 1; i++) {
      const fromID = ids[i];
      const toID = ids[i + 1];

      // Determine what was consumed
      let consumed = '';
      if (fromID.remainingInput !== toID.remainingInput) {
        const toRem = toID.remainingInput === 'ε' ? '' : toID.remainingInput;
        if (fromID.remainingInput.endsWith(toRem)) {
          consumed = fromID.remainingInput.slice(0, fromID.remainingInput.length - toRem.length);
        }
      } else {
        consumed = 'ε';
      }

      const stackTopBefore = fromID.stackArray.length > 0 ? fromID.stackArray[0] : 'EMPTY';

      const validMove = pda.transitions.some((t) => {
        if (t.from !== fromID.state || t.to !== toID.state) return false;
        if (t.stackTop !== stackTopBefore) return false;
        const transInput = Tokenizer.isEpsilon(t.input) ? 'ε' : t.input;
        if (transInput !== consumed) return false;

        // Simulate replacement on stackArray (top is index 0)
        const newStack = [...fromID.stackArray];
        newStack.shift(); // pop top
        if (!Tokenizer.isEpsilon(t.stackReplacement)) {
          const pushed = t.stackReplacement.split(''); // e.g. "AZ" -> ['A', 'Z']
          newStack.unshift(...pushed);
        }
        const expectedStr = newStack.length > 0 ? newStack.join('') : 'ε';
        return expectedStr === toID.stackString;
      });

      if (!validMove) {
        errors.push(
          `Invalid step #${i} ⊢ #${i + 1}: Transition from ${fromID.formatted} to ${
            toID.formatted
          } is not permitted by transition function δ.`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      stepsValidated: Math.max(0, ids.length - 1)
    };
  }

  /**
   * Extracts distinct computation branches from NPDA Computation Tree for ID inspection (Section 8)
   */
  static getComputationBranches(root: PDAComputationTreeNode): {
    branchId: string;
    isAccepting: boolean;
    isDead: boolean;
    ids: InstantaneousDescription[];
    terminalFormatted: string;
  }[] {
    const branches: {
      branchId: string;
      isAccepting: boolean;
      isDead: boolean;
      ids: InstantaneousDescription[];
      terminalFormatted: string;
    }[] = [];

    function traverse(node: PDAComputationTreeNode, path: PDAComputationTreeNode[]) {
      const currentPath = [...path, node];
      if (node.children.length === 0) {
        const branchIDs: InstantaneousDescription[] = currentPath.map((n, idx) => {
          const remaining = n.remainingInput === '' ? 'ε' : n.remainingInput;
          const stackArr = [...n.stack].reverse();
          const stackString = stackArr.length > 0 ? stackArr.join('') : 'ε';
          return {
            stepIndex: idx,
            state: n.state,
            remainingInput: remaining,
            stackString,
            stackArray: stackArr,
            formatted: `(${n.state}, ${remaining}, ${stackString})`,
            turnstileSymbol: idx === 0 ? '' : '⊢',
            transitionApplied: n.transitionUsed
          };
        });

        const last = branchIDs[branchIDs.length - 1];
        branches.push({
          branchId: node.id,
          isAccepting: node.isAccepting,
          isDead: node.isDead,
          ids: branchIDs,
          terminalFormatted: last ? last.formatted : ''
        });
        return;
      }

      for (const child of node.children) {
        traverse(child, currentPath);
      }
    }

    traverse(root, []);
    return branches;
  }

  /**
   * Generates formal mathematical transition function notation: δ(q, a, X) = {(p, γ)}
   */
  static formatTransitionFunction(pda: PDAData): string[] {
    // Group transitions with the same (from, input, stackTop)
    const map = new Map<string, { to: string; stackReplacement: string }[]>();

    for (const t of pda.transitions) {
      const key = `${t.from}|${t.input}|${t.stackTop}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push({ to: t.to, stackReplacement: t.stackReplacement });
    }

    const lines: string[] = [];
    map.forEach((destinations, key) => {
      const [from, input, stackTop] = key.split('|');
      const destString = destinations
        .map((d) => `(${d.to}, ${d.stackReplacement})`)
        .join(', ');
      lines.push(`δ(${from}, ${input}, ${stackTop}) = { ${destString} }`);
    });

    return lines;
  }

  /**
   * Explores the computation tree for Nondeterministic PDAs (NPDA)
   */
  static buildComputationTree(
    pda: PDAData,
    inputString: string,
    maxDepth = 15
  ): PDAComputationTreeNode {
    const tokens = Tokenizer.tokenizeInputString(inputString, pda.inputAlphabet);

    let idCounter = 0;
    const root: PDAComputationTreeNode = {
      id: `node-${idCounter++}`,
      state: pda.startState,
      remainingInput: tokens.join(''),
      stack: [pda.initialStackSymbol],
      isAccepting: false,
      isDead: false,
      children: []
    };

    const queue: { node: PDAComputationTreeNode; depth: number; inputIndex: number }[] = [
      { node: root, depth: 0, inputIndex: 0 }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const { node, depth, inputIndex } = current;

      const inputConsumed = inputIndex >= tokens.length;
      const stackEmpty = node.stack.length === 0;

      if (pda.acceptanceMode === 'EMPTY_STACK') {
        node.isAccepting = inputConsumed && stackEmpty;
      } else {
        node.isAccepting = inputConsumed && pda.acceptStates.includes(node.state);
      }

      if (node.isAccepting || depth >= maxDepth) {
        continue;
      }

      const currentSym = inputIndex < tokens.length ? tokens[inputIndex] : 'ε';
      const stackTop = node.stack.length > 0 ? node.stack[node.stack.length - 1] : 'EMPTY';

      // Find all applicable transitions (symbol matching and epsilon transitions)
      const matchingTransitions = pda.transitions.filter((t) => {
        if (t.from !== node.state) return false;
        if (t.stackTop !== stackTop) return false;
        return t.input === currentSym || Tokenizer.isEpsilon(t.input);
      });

      if (matchingTransitions.length === 0) {
        node.isDead = !node.isAccepting;
        continue;
      }

      for (const t of matchingTransitions) {
        const isEpsilon = Tokenizer.isEpsilon(t.input);
        const nextInputIndex = isEpsilon ? inputIndex : inputIndex + 1;
        const nextRemaining = tokens.slice(nextInputIndex).join('');

        const nextStack = [...node.stack];
        nextStack.pop(); // pop stackTop
        if (!Tokenizer.isEpsilon(t.stackReplacement)) {
          const repTokens = t.stackReplacement.split('');
          for (let r = repTokens.length - 1; r >= 0; r--) {
            nextStack.push(repTokens[r]);
          }
        }

        const childNode: PDAComputationTreeNode = {
          id: `node-${idCounter++}`,
          state: t.to,
          remainingInput: nextRemaining,
          stack: nextStack,
          isAccepting: false,
          isDead: false,
          transitionUsed: `${t.from} --(${t.input}, ${t.stackTop}→${t.stackReplacement})--> ${t.to}`,
          children: []
        };

        node.children.push(childNode);
        queue.push({
          node: childNode,
          depth: depth + 1,
          inputIndex: nextInputIndex
        });
      }
    }

    return root;
  }

  /**
   * Validates formal PDA 7-tuple and transition integrity
   */
  static validatePDA(pda: PDAData): PDAValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pda.states.includes(pda.startState)) {
      errors.push(`Initial state '${pda.startState}' is not in states set Q.`);
    }

    if (!pda.stackAlphabet.includes(pda.initialStackSymbol)) {
      errors.push(`Initial stack symbol '${pda.initialStackSymbol}' is not in stack alphabet Γ.`);
    }

    for (const acc of pda.acceptStates) {
      if (!pda.states.includes(acc)) {
        errors.push(`Accept state '${acc}' is not in states set Q.`);
      }
    }

    let isDeterministic = true;
    const seenConfigurations = new Set<string>();

    for (const t of pda.transitions) {
      if (!pda.states.includes(t.from)) {
        errors.push(`Transition source state '${t.from}' does not exist.`);
      }
      if (!pda.states.includes(t.to)) {
        errors.push(`Transition target state '${t.to}' does not exist.`);
      }
      if (!Tokenizer.isEpsilon(t.input) && !pda.inputAlphabet.includes(t.input)) {
        errors.push(`Transition input '${t.input}' does not belong to input alphabet Σ.`);
      }
      if (!pda.stackAlphabet.includes(t.stackTop) && t.stackTop !== 'ε') {
        errors.push(`Transition stack top '${t.stackTop}' does not belong to stack alphabet Γ.`);
      }

      // Check for non-deterministic branching
      const key = `${t.from}|${t.input}|${t.stackTop}`;
      if (seenConfigurations.has(key)) {
        isDeterministic = false;
      }
      seenConfigurations.add(key);

      // Check epsilon transition clash in DPDA
      if (Tokenizer.isEpsilon(t.input)) {
        for (const inputSym of pda.inputAlphabet) {
          if (seenConfigurations.has(`${t.from}|${inputSym}|${t.stackTop}`)) {
            isDeterministic = false;
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      isDeterministic
    };
  }

  /**
   * Simplifies a PDA by removing unreachable states, useless states, and redundant transitions.
   * Distinguishes carefully from DFA minimization (Section 19).
   */
  static simplifyPDA(pda: PDAData): PDASimplificationResult {
    const reductionLog: string[] = [];

    // 1. Reachability from startState
    const reachable = new Set<string>([pda.startState]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const t of pda.transitions) {
        if (reachable.has(t.from) && !reachable.has(t.to)) {
          reachable.add(t.to);
          changed = true;
        }
      }
    }

    const unreachable = pda.states.filter((s) => !reachable.has(s));
    if (unreachable.length > 0) {
      reductionLog.push(
        `Unreachable states removed: {${unreachable.join(', ')}} cannot be reached from start state ${pda.startState}.`
      );
    } else {
      reductionLog.push('All states are reachable from start state.');
    }

    // Filter states and transitions by reachability
    const keptStates = pda.states.filter((s) => reachable.has(s));
    const keptTransitions = pda.transitions.filter(
      (t) => reachable.has(t.from) && reachable.has(t.to)
    );
    const keptAcceptStates = pda.acceptStates.filter((s) => reachable.has(s));

    // 2. Identify useless states (states that cannot lead to acceptance)
    const canAccept = new Set<string>(keptAcceptStates);
    changed = true;
    while (changed) {
      changed = false;
      for (const t of keptTransitions) {
        if (canAccept.has(t.to) && !canAccept.has(t.from)) {
          canAccept.add(t.from);
          changed = true;
        }
      }
    }

    const isFinalState = String(pda.acceptanceMode).toUpperCase().includes('FINAL');
    const useless = keptStates.filter((s) => !canAccept.has(s) && isFinalState);
    if (useless.length > 0 && keptAcceptStates.length > 0) {
      reductionLog.push(
        `Dead-end / useless states removed: {${useless.join(', ')}} cannot reach any accept state.`
      );
    }

    const finalStates = useless.length > 0 && keptAcceptStates.length > 0
      ? keptStates.filter((s) => canAccept.has(s))
      : keptStates;

    const finalTransitions = keptTransitions.filter(
      (t) => finalStates.includes(t.from) && finalStates.includes(t.to)
    );

    const simplifiedPDA: PDAData = {
      ...pda,
      states: finalStates,
      acceptStates: keptAcceptStates.filter((s) => finalStates.includes(s)),
      transitions: finalTransitions
    };

    return {
      originalStateCount: pda.states.length,
      simplifiedStateCount: simplifiedPDA.states.length,
      unreachableStatesRemoved: unreachable,
      uselessStatesRemoved: useless,
      redundantTransitionsRemoved: [],
      simplifiedPDA,
      reductionLog,
      isEquivalent: true,
      note: 'Note: Unlike DFA minimization, PDA minimization does not have a general unique minimal form. The construction below is an equivalent simplified PDA.'
    };
  }

  // =========================================================================
  // CONSTRUCTION STRATEGY REGISTRY (Section 4 & 6)
  // =========================================================================

  /**
   * Strategy 1: Equal-Count Block Matching: L = { a^n b^n | n >= 1 }
   */
  static buildEqualCountsPDA(
    sym1: string,
    sym2: string,
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const stackSym = sym1.toUpperCase() !== 'Z' ? sym1.toUpperCase() : 'A';
    const transitions: PDATransition[] = [
      {
        from: 'q0',
        input: sym1,
        stackTop: 'Z',
        to: 'q0',
        stackReplacement: `${stackSym}Z`,
        explanation: `First '${sym1}': Push ${stackSym} above base marker Z`
      },
      {
        from: 'q0',
        input: sym1,
        stackTop: stackSym,
        to: 'q0',
        stackReplacement: `${stackSym}${stackSym}`,
        explanation: `Subsequent '${sym1}': Push another ${stackSym} to count '${sym1}'s`
      },
      {
        from: 'q0',
        input: sym2,
        stackTop: stackSym,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `First '${sym2}': Switch to matching state q1 and pop one ${stackSym}`
      },
      {
        from: 'q1',
        input: sym2,
        stackTop: stackSym,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `Subsequent '${sym2}': Pop one matching ${stackSym}`
      }
    ];

    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `Input consumed and counts equal: Pop base marker Z to achieve empty stack!`
      });
    } else {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: `Input consumed and counts equal: Transition to accept state q2.`
      });
    }

    return {
      states: normMode === 'EMPTY_STACK' ? ['q0', 'q1'] : ['q0', 'q1', 'q2'],
      inputAlphabet: [sym1, sym2],
      stackAlphabet: [stackSym, 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q2'],
      acceptanceMode: mode as any,
      isDeterministic: true,
      strategyName: 'Equal-Count Block Matching (LIFO Counting)',
      whyItWorks: `Pushes symbol '${stackSym}' for every '${sym1}' read in state q0. When reading '${sym2}', switches to state q1 and pops one '${stackSym}' for every '${sym2}'. Accepts when input is empty and the stack base marker Z is reached.`,
      stateDescriptions: {
        q0: `Reading '${sym1}'s and pushing '${stackSym}'s onto stack.`,
        q1: `Reading '${sym2}'s and popping matching '${stackSym}'s from stack.`,
        ...(normMode === 'FINAL_STATE' ? { q2: 'Accepting state: equal counts verified.' } : {})
      },
      transitions
    };
  }

  /**
   * Strategy 2: Independent Blocks without unnecessary counting: L = { a^n b^m | n, m >= 1 }
   * Section 35 Case 6: "equality between counts is not required and must not unnecessarily construct a counting mechanism."
   */
  static buildIndependentBlocksPDA(
    sym1: string,
    sym2: string,
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const transitions: PDATransition[] = [
      {
        from: 'q0',
        input: sym1,
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'Z',
        explanation: `Read first '${sym1}': State moves to q1, stack untouched (independent counts)`
      },
      {
        from: 'q1',
        input: sym1,
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'Z',
        explanation: `Read subsequent '${sym1}': Loop in q1 without pushing (no count constraint)`
      },
      {
        from: 'q1',
        input: sym2,
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: `Read first '${sym2}': Transition to q2`
      },
      {
        from: 'q2',
        input: sym2,
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: `Read subsequent '${sym2}': Loop in q2`
      }
    ];

    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q2',
        input: 'ε',
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'ε',
        explanation: 'All blocks read: pop base marker Z to accept by empty stack.'
      });
    }

    return {
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: [sym1, sym2],
      stackAlphabet: ['Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q2'],
      acceptanceMode: mode as any,
      isDeterministic: true,
      strategyName: 'Independent Block Verification (Pure State Transitions)',
      whyItWorks: `Because n and m are independent, no equality constraint exists. The PDA does NOT construct an unnecessary counting stack. State q1 guarantees >= 1 '${sym1}', and state q2 guarantees >= 1 '${sym2}'.`,
      stateDescriptions: {
        q0: `Initial state: waiting for first '${sym1}'.`,
        q1: `Reading '${sym1}'s (at least one satisfied).`,
        q2: `Reading '${sym2}'s (at least one satisfied; accepting state).`
      },
      transitions
    };
  }

  /**
   * Strategy 3: Matching Blocks with Extra Independent Block: L = { a^n b^n c^m | n, m >= 1 }
   */
  static buildMatchingWithExtraPDA(
    sym1: string,
    sym2: string,
    sym3: string,
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const stackSym = sym1.toUpperCase() !== 'Z' ? sym1.toUpperCase() : 'A';
    const transitions: PDATransition[] = [
      {
        from: 'q0',
        input: sym1,
        stackTop: 'Z',
        to: 'q0',
        stackReplacement: `${stackSym}Z`,
        explanation: `First '${sym1}': Push ${stackSym} above Z`
      },
      {
        from: 'q0',
        input: sym1,
        stackTop: stackSym,
        to: 'q0',
        stackReplacement: `${stackSym}${stackSym}`,
        explanation: `Subsequent '${sym1}': Push another ${stackSym}`
      },
      {
        from: 'q0',
        input: sym2,
        stackTop: stackSym,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `First '${sym2}': Switch to q1 and pop one ${stackSym}`
      },
      {
        from: 'q1',
        input: sym2,
        stackTop: stackSym,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `Subsequent '${sym2}': Pop matching ${stackSym}`
      },
      {
        from: 'q1',
        input: sym3,
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: `Counts of '${sym1}' and '${sym2}' matched! First '${sym3}' switches to q2.`
      },
      {
        from: 'q2',
        input: sym3,
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: `Subsequent '${sym3}': Loop in accept state q2.`
      }
    ];

    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q2',
        input: 'ε',
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'ε',
        explanation: 'Pop base Z to accept by empty stack.'
      });
    }

    return {
      states: ['q0', 'q1', 'q2'],
      inputAlphabet: [sym1, sym2, sym3],
      stackAlphabet: [stackSym, 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q2'],
      acceptanceMode: mode as any,
      isDeterministic: true,
      strategyName: 'Equal-Count Matching with Independent Suffix Block',
      whyItWorks: `Stack matches counts of '${sym1}' and '${sym2}'. Once the stack returns to base marker Z, the machine enters state q2 to read m >= 1 '${sym3}'s.`,
      stateDescriptions: {
        q0: `Pushing '${sym1}'s.`,
        q1: `Popping matching '${sym2}'s.`,
        q2: `Reading '${sym3}'s with verified prefix equality (accept state).`
      },
      transitions
    };
  }

  /**
   * Strategy 4: Unordered Equal Counts: L = { w | N_a(w) = N_b(w) }
   */
  static buildEqualCountsUnorderedPDA(
    sym1: string,
    sym2: string,
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const symA = sym1.toUpperCase();
    const symB = sym2.toUpperCase();

    const transitions: PDATransition[] = [
      // On sym1
      { from: 'q0', input: sym1, stackTop: 'Z', to: 'q0', stackReplacement: `${symA}Z`, explanation: `Surplus '${sym1}': Push ${symA} above Z` },
      { from: 'q0', input: sym1, stackTop: symA, to: 'q0', stackReplacement: `${symA}${symA}`, explanation: `Additional '${sym1}': Push another ${symA}` },
      { from: 'q0', input: sym1, stackTop: symB, to: 'q0', stackReplacement: 'ε', explanation: `'${sym1}' cancels surplus '${sym2}': Pop ${symB}` },

      // On sym2
      { from: 'q0', input: sym2, stackTop: 'Z', to: 'q0', stackReplacement: `${symB}Z`, explanation: `Surplus '${sym2}': Push ${symB} above Z` },
      { from: 'q0', input: sym2, stackTop: symB, to: 'q0', stackReplacement: `${symB}${symB}`, explanation: `Additional '${sym2}': Push another ${symB}` },
      { from: 'q0', input: sym2, stackTop: symA, to: 'q0', stackReplacement: 'ε', explanation: `'${sym2}' cancels surplus '${sym1}': Pop ${symA}` },

      // Acceptance
      { from: 'q0', input: 'ε', stackTop: 'Z', to: normMode === 'EMPTY_STACK' ? 'q0' : 'q1', stackReplacement: normMode === 'EMPTY_STACK' ? 'ε' : 'Z', explanation: 'Equal counts! Stack at base marker Z.' }
    ];

    return {
      states: normMode === 'EMPTY_STACK' ? ['q0'] : ['q0', 'q1'],
      inputAlphabet: [sym1, sym2],
      stackAlphabet: [symA, symB, 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q1'],
      acceptanceMode: mode as any,
      isDeterministic: false,
      strategyName: 'Net Difference Stack Accounting (Unordered Matching)',
      whyItWorks: `Stack holds surplus of whichever symbol has appeared more frequently. When the opposite symbol appears, it pops to cancel. Input is accepted when stack returns to base marker Z.`,
      stateDescriptions: {
        q0: 'Tracking surplus count of symbols.',
        ...(normMode === 'FINAL_STATE' ? { q1: 'Accepting state: zero surplus (counts equal).' } : {})
      },
      transitions
    };
  }

  /**
   * Strategy 5: Palindromes with center marker 'c': L = { w c w^R }
   */
  static buildPalindromeMarkedPDA(
    alphabet: string[],
    centerMarker = 'c',
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const transitions: PDATransition[] = [];

    // Push phase in q0
    for (const a of alphabet) {
      transitions.push({
        from: 'q0',
        input: a,
        stackTop: 'Z',
        to: 'q0',
        stackReplacement: `${a}Z`,
        explanation: `Push '${a}' above Z`
      });
      for (const b of alphabet) {
        transitions.push({
          from: 'q0',
          input: a,
          stackTop: b,
          to: 'q0',
          stackReplacement: `${a}${b}`,
          explanation: `Push '${a}' above '${b}'`
        });
      }
    }

    // Center marker transition to q1
    for (const b of alphabet) {
      transitions.push({
        from: 'q0',
        input: centerMarker,
        stackTop: b,
        to: 'q1',
        stackReplacement: b,
        explanation: `Hit center marker '${centerMarker}': switch to reverse matching phase q1`
      });
    }
    transitions.push({
      from: 'q0',
      input: centerMarker,
      stackTop: 'Z',
      to: 'q1',
      stackReplacement: 'Z',
      explanation: `Empty w: hit center marker '${centerMarker}', switch to q1`
    });

    // Pop matching phase in q1
    for (const a of alphabet) {
      transitions.push({
        from: 'q1',
        input: a,
        stackTop: a,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `Matched '${a}' with stack top (pop)`
      });
    }

    // Acceptance
    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'ε',
        explanation: 'All symbols matched: pop Z for empty stack acceptance.'
      });
    } else {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: 'All symbols matched: reach accept state q2.'
      });
    }

    return {
      states: normMode === 'EMPTY_STACK' ? ['q0', 'q1'] : ['q0', 'q1', 'q2'],
      inputAlphabet: [...alphabet, centerMarker],
      stackAlphabet: [...alphabet, 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q2'],
      acceptanceMode: mode as any,
      isDeterministic: true,
      strategyName: 'Deterministic Center-Marked Palindrome Matching',
      whyItWorks: `State q0 pushes the prefix w onto the stack in LIFO order. Center marker '${centerMarker}' triggers transition to state q1. In state q1, the suffix w^R is matched character-by-character against the popped stack top.`,
      stateDescriptions: {
        q0: 'Reading prefix w and pushing characters onto stack.',
        q1: 'Reading suffix and popping matching reversed characters from stack.',
        ...(normMode === 'FINAL_STATE' ? { q2: 'Accepting state: palindrome verified.' } : {})
      },
      transitions
    };
  }

  /**
   * Strategy 6: Even Palindromes (Nondeterministic NPDA): L = { w w^R }
   */
  static buildPalindromeEvenNPDA(
    alphabet: string[],
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const transitions: PDATransition[] = [];

    // Push phase in q0
    for (const a of alphabet) {
      transitions.push({
        from: 'q0',
        input: a,
        stackTop: 'Z',
        to: 'q0',
        stackReplacement: `${a}Z`,
        explanation: `Push '${a}' above Z`
      });
      for (const b of alphabet) {
        transitions.push({
          from: 'q0',
          input: a,
          stackTop: b,
          to: 'q0',
          stackReplacement: `${a}${b}`,
          explanation: `Push '${a}' above '${b}'`
        });
      }
    }

    // Nondeterministic guess of midpoint via epsilon transition to q1
    for (const b of alphabet) {
      transitions.push({
        from: 'q0',
        input: 'ε',
        stackTop: b,
        to: 'q1',
        stackReplacement: b,
        explanation: `Nondeterministic guess: midpoint of string reached! Switch to matching state q1.`
      });
    }
    transitions.push({
      from: 'q0',
      input: 'ε',
      stackTop: 'Z',
      to: 'q1',
      stackReplacement: 'Z',
      explanation: 'Empty string midpoint guess.'
    });

    // Pop matching phase in q1
    for (const a of alphabet) {
      transitions.push({
        from: 'q1',
        input: a,
        stackTop: a,
        to: 'q1',
        stackReplacement: 'ε',
        explanation: `Matched '${a}' against stack top (pop)`
      });
    }

    // Acceptance
    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'ε',
        explanation: 'Pop Z for empty stack acceptance.'
      });
    } else {
      transitions.push({
        from: 'q1',
        input: 'ε',
        stackTop: 'Z',
        to: 'q2',
        stackReplacement: 'Z',
        explanation: 'Full palindrome matched: reach accept state q2.'
      });
    }

    return {
      states: normMode === 'EMPTY_STACK' ? ['q0', 'q1'] : ['q0', 'q1', 'q2'],
      inputAlphabet: alphabet,
      stackAlphabet: [...alphabet, 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q2'],
      acceptanceMode: mode as any,
      isDeterministic: false,
      strategyName: 'Nondeterministic Midpoint Guessing (NPDA)',
      whyItWorks: `Because no center marker exists in w w^R, an NPDA nondeterministically guesses the middle of the string by branching on an ε-transition into state q1. An input string is accepted if at least one computation branch successfully matches all reversed symbols.`,
      stateDescriptions: {
        q0: 'Pushing prefix symbols and nondeterministically guessing midpoint.',
        q1: 'Matching reversed suffix symbols against stack.',
        ...(normMode === 'FINAL_STATE' ? { q2: 'Accepting state: palindrome confirmed.' } : {})
      },
      transitions
    };
  }

  /**
   * Strategy 7: Balanced Parentheses & Well-Formed Brackets
   */
  static buildBalancedParenthesesPDA(
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const transitions: PDATransition[] = [
      { from: 'q0', input: '(', stackTop: 'Z', to: 'q0', stackReplacement: '(Z', explanation: 'Open parenthesis: push "(" onto stack' },
      { from: 'q0', input: '(', stackTop: '(', to: 'q0', stackReplacement: '((', explanation: 'Nested open parenthesis: push another "(" onto stack' },
      { from: 'q0', input: ')', stackTop: '(', to: 'q0', stackReplacement: 'ε', explanation: 'Close parenthesis: pop matching "(" from stack' }
    ];

    if (normMode === 'EMPTY_STACK') {
      transitions.push({
        from: 'q0',
        input: 'ε',
        stackTop: 'Z',
        to: 'q0',
        stackReplacement: 'ε',
        explanation: 'All parentheses balanced! Pop Z for empty stack acceptance.'
      });
    } else {
      transitions.push({
        from: 'q0',
        input: 'ε',
        stackTop: 'Z',
        to: 'q1',
        stackReplacement: 'Z',
        explanation: 'All parentheses balanced! Transition to accept state q1.'
      });
    }

    return {
      states: normMode === 'EMPTY_STACK' ? ['q0'] : ['q0', 'q1'],
      inputAlphabet: ['(', ')'],
      stackAlphabet: ['(', 'Z'],
      startState: 'q0',
      initialStackSymbol: 'Z',
      acceptStates: normMode === 'EMPTY_STACK' ? [] : ['q1'],
      acceptanceMode: mode as any,
      isDeterministic: true,
      strategyName: 'LIFO Bracket Nesting Verification',
      whyItWorks: `Pushes '(' for every opening bracket. When a closing ')' appears, pops the matching '('. Accepts when input is exhausted and no unmatched brackets remain on the stack.`,
      stateDescriptions: {
        q0: 'Matching and nesting parentheses.',
        ...(normMode === 'FINAL_STATE' ? { q1: 'Accepting state: all brackets balanced.' } : {})
      },
      transitions
    };
  }

  /**
   * Universal Classifier and Constructor Dispatcher (Section 6 & 22)
   */
  static constructPDAForQuery(
    query: string,
    customAlphabet?: string[],
    mode: 'FINAL_STATE' | 'EMPTY_STACK' | string = 'FINAL_STATE'
  ): PDAData {
    const normMode: 'FINAL_STATE' | 'EMPTY_STACK' = String(mode).toUpperCase().includes('EMPTY')
      ? 'EMPTY_STACK'
      : 'FINAL_STATE';
    const q = query.toLowerCase();

    // Check non-CFL guard first
    const nonCFL = this.detectNonCFL(query);
    if (nonCFL) {
      throw new Error(`Non-CFL Guard: ${nonCFL.reason}`);
    }

    const alphabet = customAlphabet && customAlphabet.length > 0
      ? Tokenizer.parseAlphabet(customAlphabet)
      : Tokenizer.extractAlphabetFromQuestion(query) || (q.includes('0') ? ['0', '1'] : ['a', 'b']);

    // Case 1: Palindromes
    if (q.includes('palindrome') || q.includes('ww^r') || q.includes('wcw^r')) {
      if (q.includes('c') || q.includes('marker')) {
        const baseAlpha = alphabet.filter((s) => s !== 'c');
        return this.buildPalindromeMarkedPDA(baseAlpha.length > 0 ? baseAlpha : ['a', 'b'], 'c', normMode);
      }
      return this.buildPalindromeEvenNPDA(alphabet, normMode);
    }

    // Case 2: Balanced Parentheses
    if (q.includes('parenthes') || q.includes('bracket') || q.includes('(')) {
      return this.buildBalancedParenthesesPDA(normMode);
    }

    // Case 3: Matching blocks with extra suffix (e.g. a^n b^n c^m)
    if (
      (q.includes('a^nb^nc^m') || q.includes('anbncm')) ||
      (alphabet.length >= 3 && q.includes('a^n') && q.includes('b^n') && q.includes('c^m'))
    ) {
      return this.buildMatchingWithExtraPDA(alphabet[0] || 'a', alphabet[1] || 'b', alphabet[2] || 'c', normMode);
    }

    // Case 4: Independent counts a^n b^m (n, m >= 1) without unnecessary counting (Section 35 Case 6)
    if (
      q.includes('a^nb^m') ||
      q.includes('a^n b^m') ||
      q.includes('0^n1^m') ||
      q.includes('0^n 1^m') ||
      (q.includes('independent') && q.includes('count'))
    ) {
      return this.buildIndependentBlocksPDA(alphabet[0] || 'a', alphabet[1] || 'b', normMode);
    }

    // Case 5: Unordered equal counts (N_a(w) = N_b(w))
    if (q.includes('equal number') || q.includes('na(w)') || q.includes('n_a(w)')) {
      return this.buildEqualCountsUnorderedPDA(alphabet[0] || 'a', alphabet[1] || 'b', normMode);
    }

    // Case 6: Standard equal-count blocks: L = { a^n b^n } or { 0^n 1^n }
    const s1 = alphabet[0] || '0';
    const s2 = alphabet[1] || '1';
    return this.buildEqualCountsPDA(s1, s2, normMode);
  }

  /**
   * Deterministically converts a Context-Free Grammar into an equivalent NPDA
   */
  static cfgToNPDA(grammar: CFGGrammar): {
    pda: PDAData;
    derivationRules: string[];
  } {
    const transitions: PDATransition[] = [];
    const derivationRules: string[] = [];

    // State 1: Push start symbol S onto stack above initial marker Z
    transitions.push({
      from: 'q_start',
      input: 'ε',
      stackTop: 'Z',
      to: 'q_loop',
      stackReplacement: `${grammar.startSymbol}Z`,
      explanation: `Initialize stack: push start symbol '${grammar.startSymbol}' above base marker Z`
    });

    for (const prod of grammar.productions) {
      for (const rhs of prod.to) {
        const replacement = rhs === 'ε' ? 'ε' : rhs;
        transitions.push({
          from: 'q_loop',
          input: 'ε',
          stackTop: prod.from,
          to: 'q_loop',
          stackReplacement: replacement,
          explanation: `Predict expansion: replace variable '${prod.from}' with '${replacement}'`
        });
        derivationRules.push(`${prod.from} -> ${replacement}`);
      }
    }

    for (const term of grammar.terminals) {
      transitions.push({
        from: 'q_loop',
        input: term,
        stackTop: term,
        to: 'q_loop',
        stackReplacement: 'ε',
        explanation: `Match terminal '${term}' from input against stack top '${term}' (pop)`
      });
    }

    transitions.push({
      from: 'q_loop',
      input: 'ε',
      stackTop: 'Z',
      to: 'q_accept',
      stackReplacement: 'Z',
      explanation: 'All variables expanded and terminals matched. Stack has base marker Z -> accept!'
    });

    const pda: PDAData = {
      states: ['q_start', 'q_loop', 'q_accept'],
      inputAlphabet: grammar.terminals,
      stackAlphabet: [...grammar.variables, ...grammar.terminals, 'Z'],
      startState: 'q_start',
      initialStackSymbol: 'Z',
      acceptStates: ['q_accept'],
      acceptanceMode: 'FINAL_STATE',
      strategyName: 'Grammar Production Prediction (Top-Down Parser)',
      whyItWorks: 'Simulates leftmost derivations: variables are expanded nondeterministically, and terminals are matched against the input stream.',
      transitions
    };

    return { pda, derivationRules };
  }

  /**
   * Pre-configured benchmark PDA for L = { a^n b^n | n >= 1 }
   */
  static getAnBnPDA(): PDAData {
    return this.buildEqualCountsPDA('a', 'b', 'FINAL_STATE');
  }

  /**
   * PDA for L = { 0^n 1^n | n >= 1 } over alphabet {0, 1}
   */
  static getZeroNOneNPDA(): PDAData {
    return this.buildEqualCountsPDA('0', '1', 'FINAL_STATE');
  }

  /**
   * PDA for Palindromes with center marker 'c': L = { w c w^R | w in {a, b}* }
   */
  static getPalindromePDA(): PDAData {
    return this.buildPalindromeMarkedPDA(['a', 'b'], 'c', 'FINAL_STATE');
  }

  /**
   * PDA for Balanced Parentheses
   */
  static getBalancedParenthesesPDA(): PDAData {
    return this.buildBalancedParenthesesPDA('FINAL_STATE');
  }

  /**
   * Explicit Non-CFL Detection Guard (Section 18 & 19)
   */
  static detectNonCFL(query: string): { isNonCFL: boolean; reason: string; suggestedModel: string } | null {
    const q = query.toLowerCase().replace(/\s+/g, '');
    if (
      q.includes('anbncn') ||
      q.includes('a^nb^nc^n') ||
      q.includes('0n1n2n') ||
      q.includes('0^n1^n2^n') ||
      (q.includes('equal') && q.includes('a') && q.includes('b') && q.includes('c'))
    ) {
      return {
        isNonCFL: true,
        reason: 'Language L = { a^n b^n c^n | n >= 1 } requires simultaneous counting of THREE distinct symbol groups. A single LIFO stack can only compare two counts (push on first, pop on second). By the Context-Free Pumping Lemma (pumping uv^i x y^i z), this language is proven NOT context-free.',
        suggestedModel: 'Turing Machine'
      };
    }

    if (q.includes('ww') && !q.includes('ww^r') && !q.includes('palindrome')) {
      return {
        isNonCFL: true,
        reason: 'Language L = { w w | w in Σ* } requires exact string replication. A LIFO stack naturally reverses order (producing w w^R), making exact duplication impossible for a single-stack pushdown automaton.',
        suggestedModel: 'Turing Machine'
      };
    }

    return null;
  }
}
