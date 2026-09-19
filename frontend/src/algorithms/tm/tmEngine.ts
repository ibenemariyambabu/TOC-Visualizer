import { SimulationResult, SimulationStep, TMData, TMTransition } from '../../types/index.js';

export interface TMStepRecord extends SimulationStep {
  tape: string[];
  headPosition: number;
  readSymbol: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';
  ruleString: string;
}

export class TMEngine {
  /**
   * Simulates a Turing Machine step-by-step with infinite tape representation and loop safety
   */
  static simulate(
    tm: TMData,
    inputString: string,
    maxSteps = 2000
  ): SimulationResult {
    const steps: SimulationStep[] = [];
    const blank = tm.blankSymbol || '□';

    // Initialize tape with input bounded by blanks
    // Provide 3 blank cells padding on left and 10 blank cells padding on right
    const leftPadding = 3;
    const rightPadding = Math.max(10, inputString.length + 5);
    
    let tape: string[] = [
      ...Array(leftPadding).fill(blank),
      ...(inputString.length > 0 ? inputString.split('') : [blank]),
      ...Array(rightPadding).fill(blank)
    ];

    let head = leftPadding; // Points to first character of input
    let currentState = tm.startState;
    let stepCount = 0;

    steps.push({
      stepIndex: 0,
      currentState,
      remainingInput: '',
      consumedInput: '',
      currentSymbol: tape[head],
      tape: [...tape],
      headPosition: head,
      explanation: `Turing Machine initialized in start state ${currentState}. Head positioned at cell ${head} reading symbol '${tape[head]}'.`
    });

    while (
      currentState !== tm.acceptState &&
      currentState !== tm.rejectState &&
      stepCount < maxSteps
    ) {
      stepCount++;
      const currentSym = tape[head] || blank;

      // Find transition delta(currentState, currentSym)
      const transition = tm.transitions.find(
        (t) => t.currentState === currentState && t.readSymbol === currentSym
      );

      if (!transition) {
        // Missing transition -> transition implicitly to reject
        steps.push({
          stepIndex: stepCount,
          currentState: tm.rejectState,
          remainingInput: '',
          consumedInput: '',
          currentSymbol: currentSym,
          tape: [...tape],
          headPosition: head,
          explanation: `No transition defined for (state=${currentState}, read='${currentSym}'). Machine halts in REJECT state.`
        });
        currentState = tm.rejectState;
        break;
      }

      // Execute transition:
      // 1. Write symbol to tape
      tape[head] = transition.writeSymbol;

      // 2. Move head
      if (transition.direction === 'R') {
        head++;
        // Dynamically extend tape right if needed
        if (head >= tape.length) {
          tape.push(blank);
        }
      } else if (transition.direction === 'L') {
        head--;
        // Dynamically extend tape left if needed
        if (head < 0) {
          tape.unshift(blank);
          head = 0;
        }
      }

      // 3. Update state
      currentState = transition.nextState;

      const rule = `δ(${transition.currentState}, '${transition.readSymbol}') = (${transition.nextState}, '${transition.writeSymbol}', ${transition.direction})`;
      const stepExplanation =
        transition.explanation ||
        `Step ${stepCount}: Read '${transition.readSymbol}' -> wrote '${transition.writeSymbol}', moved ${transition.direction}, entered state ${currentState}.`;

      steps.push({
        stepIndex: stepCount,
        currentState,
        remainingInput: '',
        consumedInput: '',
        currentSymbol: tape[head] || blank,
        tape: [...tape],
        headPosition: head,
        transitionUsed: {
          from: transition.currentState,
          input: transition.readSymbol,
          to: transition.nextState,
          explanation: rule
        },
        explanation: stepExplanation
      });
    }

    const accepted = currentState === tm.acceptState;
    let finalExplanation = '';

    if (accepted) {
      finalExplanation = `ACCEPTED: Turing machine entered accept state "${currentState}" after ${stepCount} steps.`;
    } else if (stepCount >= maxSteps) {
      finalExplanation = `SIMULATION STOPPED: Exceeded step limit (${maxSteps} steps). Possible non-terminating loop detected.`;
    } else {
      finalExplanation = `REJECTED: Turing machine entered reject state "${currentState}" after ${stepCount} steps.`;
    }

    return {
      accepted,
      finalState: currentState,
      steps,
      explanation: finalExplanation
    };
  }

  /**
   * Pre-configured benchmark Turing Machine for L = { a^n b^n c^n | n >= 1 }
   */
  static getAnBnCnTM(): TMData {
    return {
      states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q_accept', 'q_reject'],
      inputAlphabet: ['a', 'b', 'c'],
      tapeAlphabet: ['a', 'b', 'c', 'X', 'Y', 'Z', '□'],
      blankSymbol: '□',
      startState: 'q0',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      transitions: [
        {
          currentState: 'q0',
          readSymbol: 'a',
          nextState: 'q1',
          writeSymbol: 'X',
          direction: 'R',
          explanation: 'Marked "a" as "X", move Right to find corresponding "b"'
        },
        {
          currentState: 'q0',
          readSymbol: 'Y',
          nextState: 'q4',
          writeSymbol: 'Y',
          direction: 'R',
          explanation: 'All "a"s marked. Verify all "b"s and "c"s are marked'
        },
        { currentState: 'q1', readSymbol: 'a', nextState: 'q1', writeSymbol: 'a', direction: 'R' },
        { currentState: 'q1', readSymbol: 'Y', nextState: 'q1', writeSymbol: 'Y', direction: 'R' },
        {
          currentState: 'q1',
          readSymbol: 'b',
          nextState: 'q2',
          writeSymbol: 'Y',
          direction: 'R',
          explanation: 'Found matching "b", marked as "Y", move Right to find corresponding "c"'
        },
        { currentState: 'q2', readSymbol: 'b', nextState: 'q2', writeSymbol: 'b', direction: 'R' },
        { currentState: 'q2', readSymbol: 'Z', nextState: 'q2', writeSymbol: 'Z', direction: 'R' },
        {
          currentState: 'q2',
          readSymbol: 'c',
          nextState: 'q3',
          writeSymbol: 'Z',
          direction: 'L',
          explanation: 'Found matching "c", marked as "Z", rewind Left to find next "a"'
        },
        { currentState: 'q3', readSymbol: 'b', nextState: 'q3', writeSymbol: 'b', direction: 'L' },
        { currentState: 'q3', readSymbol: 'c', nextState: 'q3', writeSymbol: 'c', direction: 'L' },
        { currentState: 'q3', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', direction: 'L' },
        { currentState: 'q3', readSymbol: 'Z', nextState: 'q3', writeSymbol: 'Z', direction: 'L' },
        { currentState: 'q3', readSymbol: 'a', nextState: 'q3', writeSymbol: 'a', direction: 'L' },
        {
          currentState: 'q3',
          readSymbol: 'X',
          nextState: 'q0',
          writeSymbol: 'X',
          direction: 'R',
          explanation: 'Hit marked "X": move one step Right and start next round'
        },
        { currentState: 'q4', readSymbol: 'Y', nextState: 'q4', writeSymbol: 'Y', direction: 'R' },
        { currentState: 'q4', readSymbol: 'Z', nextState: 'q4', writeSymbol: 'Z', direction: 'R' },
        {
          currentState: 'q4',
          readSymbol: '□',
          nextState: 'q_accept',
          writeSymbol: '□',
          direction: 'R',
          explanation: 'Reached end blank: equal counts of a, b, c confirmed. ACCEPT!'
        }
      ]
    };
  }

  /**
   * Pre-configured Turing Machine for Palindromes over {a, b}
   */
  static getPalindromeTM(): TMData {
    return {
      states: ['q0', 'q_a', 'q_b', 'q_rev', 'q_accept', 'q_reject'],
      inputAlphabet: ['a', 'b'],
      tapeAlphabet: ['a', 'b', '□'],
      blankSymbol: '□',
      startState: 'q0',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      transitions: [
        { currentState: 'q0', readSymbol: 'a', nextState: 'q_a', writeSymbol: '□', direction: 'R' },
        { currentState: 'q0', readSymbol: 'b', nextState: 'q_b', writeSymbol: '□', direction: 'R' },
        { currentState: 'q0', readSymbol: '□', nextState: 'q_accept', writeSymbol: '□', direction: 'R' },
        { currentState: 'q_a', readSymbol: 'a', nextState: 'q_a', writeSymbol: 'a', direction: 'R' },
        { currentState: 'q_a', readSymbol: 'b', nextState: 'q_a', writeSymbol: 'b', direction: 'R' },
        { currentState: 'q_a', readSymbol: '□', nextState: 'q_rev', writeSymbol: '□', direction: 'L' },
        { currentState: 'q_b', readSymbol: 'a', nextState: 'q_b', writeSymbol: 'a', direction: 'R' },
        { currentState: 'q_b', readSymbol: 'b', nextState: 'q_b', writeSymbol: 'b', direction: 'R' },
        { currentState: 'q_b', readSymbol: '□', nextState: 'q_rev', writeSymbol: '□', direction: 'L' }
      ]
    };
  }

  /**
   * Pre-configured Turing Machine for L = { 0^n 1^n | n >= 1 } over alphabet {0, 1}
   */
  static getZeroNOneNTM(): TMData {
    return {
      states: ['q0', 'q1', 'q2', 'q3', 'q_accept', 'q_reject'],
      inputAlphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', 'X', 'Y', '□'],
      blankSymbol: '□',
      startState: 'q0',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      transitions: [
        { currentState: 'q0', readSymbol: '0', nextState: 'q1', writeSymbol: 'X', direction: 'R', explanation: 'Mark "0" as "X", move Right to find corresponding "1"' },
        { currentState: 'q0', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', direction: 'R', explanation: 'All "0"s marked. Verify only "1"s (marked as Y) remain' },
        { currentState: 'q1', readSymbol: '0', nextState: 'q1', writeSymbol: '0', direction: 'R' },
        { currentState: 'q1', readSymbol: 'Y', nextState: 'q1', writeSymbol: 'Y', direction: 'R' },
        { currentState: 'q1', readSymbol: '1', nextState: 'q2', writeSymbol: 'Y', direction: 'L', explanation: 'Found matching "1", mark as "Y", rewind Left' },
        { currentState: 'q2', readSymbol: '0', nextState: 'q2', writeSymbol: '0', direction: 'L' },
        { currentState: 'q2', readSymbol: 'Y', nextState: 'q2', writeSymbol: 'Y', direction: 'L' },
        { currentState: 'q2', readSymbol: 'X', nextState: 'q0', writeSymbol: 'X', direction: 'R', explanation: 'Hit marked "X": move one step Right and start next pair' },
        { currentState: 'q3', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', direction: 'R' },
        { currentState: 'q3', readSymbol: '□', nextState: 'q_accept', writeSymbol: '□', direction: 'R', explanation: 'Reached end blank: equal counts of 0 and 1 confirmed. ACCEPT!' }
      ]
    };
  }

  /**
   * Pre-configured Turing Machine for Binary Increment (w + 1)
   */
  static getBinaryIncrementTM(): TMData {
    return {
      states: ['q_scan_end', 'q_add', 'q_accept', 'q_reject'],
      inputAlphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', '□'],
      blankSymbol: '□',
      startState: 'q_scan_end',
      acceptState: 'q_accept',
      rejectState: 'q_reject',
      transitions: [
        { currentState: 'q_scan_end', readSymbol: '0', nextState: 'q_scan_end', writeSymbol: '0', direction: 'R' },
        { currentState: 'q_scan_end', readSymbol: '1', nextState: 'q_scan_end', writeSymbol: '1', direction: 'R' },
        { currentState: 'q_scan_end', readSymbol: '□', nextState: 'q_add', writeSymbol: '□', direction: 'L', explanation: 'Reached blank after binary number: move left to LSB' },
        { currentState: 'q_add', readSymbol: '0', nextState: 'q_accept', writeSymbol: '1', direction: 'S', explanation: '0 + 1 = 1 (no carry): write 1 and HALT' },
        { currentState: 'q_add', readSymbol: '1', nextState: 'q_add', writeSymbol: '0', direction: 'L', explanation: '1 + 1 = 0 (carry 1): write 0 and carry left' },
        { currentState: 'q_add', readSymbol: '□', nextState: 'q_accept', writeSymbol: '1', direction: 'S', explanation: 'Overflow carry at left boundary: write 1 and HALT' }
      ]
    };
  }
}
