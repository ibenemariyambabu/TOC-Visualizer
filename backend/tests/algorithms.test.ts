import { describe, it, expect } from 'vitest';
import { DFAEngine } from '../src/algorithms/automata/dfa.js';
import { NFAEngine } from '../src/algorithms/automata/nfa.js';
import { MinimizationEngine } from '../src/algorithms/automata/minimization.js';
import { RegexEngine } from '../src/algorithms/regex/regexEngine.js';
import { ArdenEngine } from '../src/algorithms/regex/ardenEngine.js';
import { CFGEngine } from '../src/algorithms/cfg/cfgEngine.js';
import { PDAEngine } from '../src/algorithms/pda/pdaEngine.js';
import { TMEngine } from '../src/algorithms/tm/tmEngine.js';
import { PCPEngine } from '../src/algorithms/computability/pcpEngine.js';
import { PumpingLemmaEngine } from '../src/algorithms/pumping/pumpingEngine.js';
import { Tokenizer } from '../src/algorithms/common/tokenizer.js';
import { SolverService } from '../src/modules/ai/solverService.js';
import { AutomatonData } from '../src/types/index.js';

describe('TOC Deterministic Algorithm Engine', () => {
  // 1. DFA Tests
  it('DFA correctly recognizes substring "ab"', () => {
    const substringDFA: AutomatonData = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: ['q0', 'q1', 'q2'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', input: 'a', to: 'q1' },
        { from: 'q0', input: 'b', to: 'q0' },
        { from: 'q1', input: 'a', to: 'q1' },
        { from: 'q1', input: 'b', to: 'q2' },
        { from: 'q2', input: 'a', to: 'q2' },
        { from: 'q2', input: 'b', to: 'q2' }
      ]
    };

    expect(DFAEngine.simulate(substringDFA, 'ab').accepted).toBe(true);
    expect(DFAEngine.simulate(substringDFA, 'aab').accepted).toBe(true);
    expect(DFAEngine.simulate(substringDFA, 'bba').accepted).toBe(false);
    expect(DFAEngine.simulate(substringDFA, 'bab').accepted).toBe(true);
  });

  // 2. Subset Construction Tests
  it('NFA Subset Construction converts NFA ending with "ab" to valid DFA', () => {
    const nfa: AutomatonData = {
      type: 'NFA',
      alphabet: ['a', 'b'],
      states: ['q0', 'q1', 'q2'],
      startState: 'q0',
      acceptStates: ['q2'],
      transitions: [
        { from: 'q0', input: 'a', to: 'q0' },
        { from: 'q0', input: 'b', to: 'q0' },
        { from: 'q0', input: 'a', to: 'q1' },
        { from: 'q1', input: 'b', to: 'q2' }
      ]
    };

    const res = NFAEngine.subsetConstruction(nfa);
    expect(res.dfa.type).toBe('DFA');
    expect(res.dfa.states.length).toBeGreaterThanOrEqual(3);
    
    // Simulate converted DFA
    expect(DFAEngine.simulate(res.dfa, 'ab').accepted).toBe(true);
    expect(DFAEngine.simulate(res.dfa, 'aab').accepted).toBe(true);
    expect(DFAEngine.simulate(res.dfa, 'aba').accepted).toBe(false);
  });

  // 3. DFA Minimization Tests
  it('DFA Minimization reduces redundant states', () => {
    const dfaWithRedundant: AutomatonData = {
      type: 'DFA',
      alphabet: ['0', '1'],
      states: ['A', 'B', 'C', 'D'],
      startState: 'A',
      acceptStates: ['C', 'D'],
      transitions: [
        { from: 'A', input: '0', to: 'B' },
        { from: 'A', input: '1', to: 'A' },
        { from: 'B', input: '0', to: 'B' },
        { from: 'B', input: '1', to: 'C' },
        { from: 'C', input: '0', to: 'C' },
        { from: 'C', input: '1', to: 'D' },
        { from: 'D', input: '0', to: 'C' },
        { from: 'D', input: '1', to: 'D' }
      ]
    };

    const result = MinimizationEngine.minimize(dfaWithRedundant);
    expect(result.minimizedStateCount).toBeLessThanOrEqual(result.originalStateCount);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  // 4. Arden's Theorem Tests
  it("Arden's Theorem solves X = aX + b as a*b", () => {
    const res = ArdenEngine.solveSingleEquation('X', 'a', 'b');
    expect(res.solution).toBe('a*b');
    expect(res.steps.length).toBe(5);
  });

  // 5. Regex to NFA (Thompson) Tests
  it("Thompson's construction generates ε-NFA for (a|b)*abb", () => {
    const result = RegexEngine.regexToNFA('(a|b)*abb');
    expect(result.nfa.states.length).toBeGreaterThan(5);
    expect(result.nfa.alphabet).toContain('a');
    expect(result.nfa.alphabet).toContain('b');
  });

  // 6. CFG Derivation Tests
  it('CFG generates leftmost derivation for a^n b^n', () => {
    const grammar = {
      variables: ['S'],
      terminals: ['a', 'b'],
      startSymbol: 'S',
      productions: [{ from: 'S', to: ['aSb', 'ε'] }]
    };

    const derivation = CFGEngine.deriveLeftmost(grammar, 'aabb');
    expect(derivation.success).toBe(true);
    expect(derivation.steps.length).toBe(3);
    expect(derivation.steps[derivation.steps.length - 1].resultingSententialForm).toBe('aabb');
  });

  // 7. PDA Tests
  it('PDA correctly accepts a^n b^n and rejects unmatched strings', () => {
    const pda = PDAEngine.getAnBnPDA();
    expect(PDAEngine.simulate(pda, 'ab').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aabb').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aaabbb').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aab').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'abb').accepted).toBe(false);
  });

  // 8. Turing Machine Tests
  it('Turing Machine correctly accepts a^n b^n c^n', () => {
    const tm = TMEngine.getAnBnCnTM();
    expect(TMEngine.simulate(tm, 'abc').accepted).toBe(true);
    expect(TMEngine.simulate(tm, 'aabbcc').accepted).toBe(true);
    expect(TMEngine.simulate(tm, 'aabcc').accepted).toBe(false);
  });

  // 9. PCP Tests
  it('PCP engine detects matching and mismatching sequences', () => {
    const bench = PCPEngine.getBenchmarkPCP();
    const matchRes = PCPEngine.evaluateSequence(bench.tiles, bench.solution || [1, 2]);
    expect(matchRes.isMatch).toBe(true);
    expect(matchRes.topString).toBe(matchRes.bottomString);

    const failRes = PCPEngine.evaluateSequence(bench.tiles, [2, 1]);
    expect(failRes.isMatch).toBe(false);
  });

  // 10. Pumping Lemma Tests
  it('Pumping Lemma generates proof decomposition for a^n b^n', () => {
    const proof = PumpingLemmaEngine.getRegularProof('anbn', 4);
    expect(proof.isRegularProof).toBe(true);
    expect(proof.pumpingAnalysis.length).toBeGreaterThan(1);
    expect(proof.contradiction).toContain('xy^i z ∉ L');
  });

  // 11. Arden's Theorem System Solver
  it("Arden's Theorem converts FA to Regular Expression through system equations", () => {
    const fa: AutomatonData = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: ['q0', 'q1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: [
        { from: 'q0', input: 'a', to: 'q0' },
        { from: 'q0', input: 'b', to: 'q1' },
        { from: 'q1', input: 'b', to: 'q1' }
      ]
    };

    const res = ArdenEngine.faToRegexArden(fa);
    expect(res.finalRegularExpression).toBeDefined();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.validationResults.length).toBeGreaterThan(0);
  });

  // 12. State Elimination FA to Regex
  it('State Elimination converts DFA to Regular Expression', () => {
    const fa: AutomatonData = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: ['q0', 'q1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: [
        { from: 'q0', input: 'a', to: 'q0' },
        { from: 'q0', input: 'b', to: 'q1' },
        { from: 'q1', input: 'b', to: 'q1' }
      ]
    };

    const res = RegexEngine.faToRegexStateElimination(fa);
    expect(res.regularExpression).toBeDefined();
    expect(res.steps.length).toBeGreaterThan(0);
  });

  // 13. Regex Validation against FA
  it('Regex validation correctly validates strings between FA and RE', () => {
    const fa: AutomatonData = {
      type: 'DFA',
      alphabet: ['a', 'b'],
      states: ['q0', 'q1'],
      startState: 'q0',
      acceptStates: ['q1'],
      transitions: [
        { from: 'q0', input: 'a', to: 'q0' },
        { from: 'q0', input: 'b', to: 'q1' },
        { from: 'q1', input: 'b', to: 'q1' }
      ]
    };

    const results = ArdenEngine.validateRegexAgainstFA(fa, 'a*b+', ['b', 'ab', 'aab', 'bb', 'a', '']);
    expect(results.length).toBe(6);
    const bResult = results.find(r => r.string === 'b');
    expect(bResult?.faAccepts).toBe(true);
    expect(bResult?.match).toBe(true);

    const aResult = results.find(r => r.string === 'a');
    expect(aResult?.faAccepts).toBe(false);
    expect(aResult?.match).toBe(true);
  });

  // 14. Universal Tokenizer Tests (Requirement 3, 4, 5, 6)
  it('Tokenizer correctly parses various alphabets and handles epsilon', () => {
    expect(Tokenizer.parseAlphabet('{0,1}')).toEqual(['0', '1']);
    expect(Tokenizer.parseAlphabet('{a, b, c}')).toEqual(['a', 'b', 'c']);
    expect(Tokenizer.parseAlphabet('{0, 1, 2}')).toEqual(['0', '1', '2']);
    expect(Tokenizer.parseAlphabet('{x, y}')).toEqual(['x', 'y']);

    // Symbols must be string tokens, never JavaScript numbers
    const tokens = Tokenizer.tokenizeInputString('010101', ['0', '1']);
    expect(tokens).toEqual(['0', '1', '0', '1', '0', '1']);
    expect(typeof tokens[0]).toBe('string');

    // Epsilon tokenization produces empty token array (0 transitions)
    expect(Tokenizer.tokenizeInputString('ε', ['0', '1'])).toEqual([]);
    expect(Tokenizer.tokenizeInputString('', ['0', '1'])).toEqual([]);
    expect(Tokenizer.isEpsilon('ε')).toBe(true);
    expect(Tokenizer.isEpsilon('lambda')).toBe(true);
    expect(Tokenizer.isEmptySet('∅')).toBe(true);
  });

  // 15. Arbitrary Modulus Divisibility DFA Tests (Requirement 17)
  it('DFA correctly recognizes binary strings divisible by 3', () => {
    const dfa3 = DFAEngine.buildDivisibilityDFA(3, ['0', '1']);
    expect(dfa3.states.length).toBe(3);
    expect(dfa3.acceptStates).toEqual(['q0']);

    // 0 (0), 3 (11), 6 (110), 9 (1001), 12 (1100), 15 (1111) are divisible by 3
    expect(DFAEngine.simulate(dfa3, '0').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa3, '11').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa3, '110').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa3, '1001').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa3, '1100').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa3, '1111').accepted).toBe(true);

    // 1 (1), 2 (10), 4 (100), 5 (101), 7 (111) are NOT divisible by 3
    expect(DFAEngine.simulate(dfa3, '1').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa3, '10').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa3, '100').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa3, '101').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa3, '111').accepted).toBe(false);
  });

  it('DFA correctly recognizes binary strings divisible by 5', () => {
    const dfa5 = DFAEngine.buildDivisibilityDFA(5, ['0', '1']);
    expect(dfa5.states.length).toBe(5);
    expect(dfa5.acceptStates).toEqual(['q0']);

    // 0 (0), 5 (101), 10 (1010), 15 (1111), 20 (10100) are divisible by 5
    expect(DFAEngine.simulate(dfa5, '0').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa5, '101').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa5, '1010').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa5, '1111').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa5, '10100').accepted).toBe(true);

    // 1 (1), 2 (10), 3 (11), 4 (100), 6 (110) are NOT divisible by 5
    expect(DFAEngine.simulate(dfa5, '1').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa5, '10').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa5, '11').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa5, '100').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa5, '110').accepted).toBe(false);
  });

  // 16. Substring & Suffix DFA over 3-symbol and binary alphabets (Requirement 3, 51)
  it('DFA correctly recognizes substring "ab" over alphabet {a,b,c}', () => {
    const dfa = DFAEngine.buildSubstringDFA('ab', ['a', 'b', 'c']);
    expect(dfa.alphabet).toEqual(['a', 'b', 'c']);
    expect(DFAEngine.simulate(dfa, 'ab').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, 'cabac').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, 'ccab').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, 'abccab').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, 'cba').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa, 'aca').accepted).toBe(false);
  });

  it('DFA correctly recognizes strings ending in "101" over {0,1}', () => {
    const dfa = DFAEngine.buildSuffixDFA('101', ['0', '1']);
    expect(DFAEngine.simulate(dfa, '101').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, '0101').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, '1101').accepted).toBe(true);
    expect(DFAEngine.simulate(dfa, '1010').accepted).toBe(false);
    expect(DFAEngine.simulate(dfa, '01').accepted).toBe(false);
  });

  // 17. Non-Regular Language Guard (Requirement 18, 46)
  it('SolverService guards against creating a fake DFA for 0^n 1^n', async () => {
    const res = await SolverService.solveQuestion('Construct a DFA for L = { 0^n 1^n | n >= 1 }');
    expect(res.finalAnswer).toContain('CANNOT CONSTRUCT DFA');
    expect(res.finalAnswer).toContain('NON-REGULAR');
    expect(res.visualizerType).toBe('PumpingLemma');
  });

  // 18. Non-CFL Language Guard (Requirement 19, 46)
  it('PDAEngine detects non-context-free language a^n b^n c^n', () => {
    const nonCFL = PDAEngine.detectNonCFL('Construct PDA for L = { a^n b^n c^n | n >= 1 }');
    expect(nonCFL).not.toBeNull();
    expect(nonCFL?.suggestedModel).toBe('Turing Machine');
  });

  // 19. PDA for 0^n 1^n (Requirement 19, 51)
  it('PDA correctly accepts 0^n 1^n over {0,1}', () => {
    const pda = PDAEngine.getZeroNOneNPDA();
    expect(pda.inputAlphabet).toEqual(['0', '1']);
    expect(PDAEngine.simulate(pda, '01').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '0011').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '000111').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '001').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, '011').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, '10').accepted).toBe(false);
  });

  // 20. Turing Machine for 0^n 1^n and Binary Incrementer (Requirement 22, 23, 51)
  it('Turing Machine correctly recognizes 0^n 1^n over {0,1}', () => {
    const tm = TMEngine.getZeroNOneNTM();
    expect(TMEngine.simulate(tm, '01').accepted).toBe(true);
    expect(TMEngine.simulate(tm, '0011').accepted).toBe(true);
    expect(TMEngine.simulate(tm, '001').accepted).toBe(false);
    expect(TMEngine.simulate(tm, '10').accepted).toBe(false);
  });

  it('Turing Machine correctly increments binary number by 1', () => {
    const tm = TMEngine.getBinaryIncrementTM();
    const sim1 = TMEngine.simulate(tm, '101');
    expect(sim1.accepted).toBe(true);
    // 101 + 1 = 110: verify tape has 1, 1, 0
    const finalTape1 = sim1.steps[sim1.steps.length - 1].tape?.filter(c => c !== '□').join('');
    expect(finalTape1).toBe('110');

    const sim2 = TMEngine.simulate(tm, '111');
    expect(sim2.accepted).toBe(true);
    const finalTape2 = sim2.steps[sim2.steps.length - 1].tape?.filter(c => c !== '□').join('');
    expect(finalTape2).toBe('1000');
  });

  // 21. Arden Theorem with 0 and 1 (Requirement 8, 9)
  it("Arden's Theorem solves X = 0X + 1 correctly over {0,1}", () => {
    const res = ArdenEngine.solveSingleEquation('X', '0', '1');
    expect(res.solution).toBe('0*1');
  });
});

describe('PDA Multi-Model Engine & Formal Representation Suite', () => {
  // Case 1: a^n b^n with Final State and Empty Stack
  it('Case 1: a^n b^n accepts matching counts and rejects mismatches (Final State & Empty Stack)', () => {
    const pdaFinal = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    expect(pdaFinal.acceptanceMode).toBe('final_state');
    expect(pdaFinal.acceptStates.length).toBeGreaterThan(0);
    expect(PDAEngine.simulate(pdaFinal, 'ab').accepted).toBe(true);
    expect(PDAEngine.simulate(pdaFinal, 'aabb').accepted).toBe(true);
    expect(PDAEngine.simulate(pdaFinal, 'aaabbb').accepted).toBe(true);
    expect(PDAEngine.simulate(pdaFinal, 'aab').accepted).toBe(false);
    expect(PDAEngine.simulate(pdaFinal, 'abb').accepted).toBe(false);
    expect(PDAEngine.simulate(pdaFinal, 'ba').accepted).toBe(false);

    // Empty stack mode
    const pdaEmpty = PDAEngine.buildEqualCountsPDA('a', 'b', 'empty_stack');
    expect(pdaEmpty.acceptanceMode).toBe('empty_stack');
    expect(PDAEngine.simulate(pdaEmpty, 'ab').accepted).toBe(true);
    expect(PDAEngine.simulate(pdaEmpty, 'aabb').accepted).toBe(true);
    expect(PDAEngine.simulate(pdaEmpty, 'aab').accepted).toBe(false);
  });

  // Case 2: 0^n 1^n over {0,1}
  it('Case 2: 0^n 1^n correctly uses symbols "0" and "1"', () => {
    const pda = PDAEngine.buildEqualCountsPDA('0', '1', 'final_state');
    expect(pda.inputAlphabet).toEqual(['0', '1']);
    expect(PDAEngine.simulate(pda, '01').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '0011').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '000111').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '001').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, '011').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, '10').accepted).toBe(false);
  });

  // Case 3: Balanced Parentheses
  it('Case 3: Balanced Parentheses accepts well-nested brackets and rejects ill-formed ones', () => {
    const pda = PDAEngine.buildBalancedParenthesesPDA('final_state');
    expect(pda.inputAlphabet).toEqual(['(', ')']);
    expect(PDAEngine.simulate(pda, '()').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '(())').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '()()').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '((()))').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, '(()())').accepted).toBe(true);

    expect(PDAEngine.simulate(pda, '(').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, ')').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, '())').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, ')(()').accepted).toBe(false);
  });

  // Case 4: Palindromes over {a,b} (Marked & Even NPDA)
  it('Case 4: Palindromes over {a,b} (w c w^R and even w w^R)', () => {
    const marked = PDAEngine.buildPalindromeMarkedPDA(['a', 'b'], 'c', 'final_state');
    expect(PDAEngine.simulate(marked, 'aca').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, 'abcba').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, 'abbcbba').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, 'acb').accepted).toBe(false);
    expect(PDAEngine.simulate(marked, 'abcca').accepted).toBe(false);

    // NPDA for even palindromes w w^R
    const evenNPDA = PDAEngine.buildPalindromeEvenNPDA(['a', 'b'], 'final_state');
    expect(evenNPDA.isDeterministic).toBe(false);
    expect(PDAEngine.simulate(evenNPDA, 'abba').accepted).toBe(true);
    expect(PDAEngine.simulate(evenNPDA, 'baab').accepted).toBe(true);
    expect(PDAEngine.simulate(evenNPDA, 'aabbaa').accepted).toBe(true);
    expect(PDAEngine.simulate(evenNPDA, 'aba').accepted).toBe(false);
    expect(PDAEngine.simulate(evenNPDA, 'abbb').accepted).toBe(false);
  });

  // Case 5: Palindromes over {0,1}
  it('Case 5: Palindromes over {0,1} (w c w^R and even w w^R)', () => {
    const marked = PDAEngine.buildPalindromeMarkedPDA(['0', '1'], '#', 'final_state');
    expect(PDAEngine.simulate(marked, '0#0').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, '01#10').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, '011#110').accepted).toBe(true);
    expect(PDAEngine.simulate(marked, '01#01').accepted).toBe(false);

    const evenNPDA = PDAEngine.buildPalindromeEvenNPDA(['0', '1'], 'final_state');
    expect(PDAEngine.simulate(evenNPDA, '0110').accepted).toBe(true);
    expect(PDAEngine.simulate(evenNPDA, '1001').accepted).toBe(true);
    expect(PDAEngine.simulate(evenNPDA, '0101').accepted).toBe(false);
  });

  // Case 6: a^n b^m (independent counts) without unnecessary counting stack
  it('Case 6: a^n b^m does NOT use a counting stack and accepts any n,m >= 1', () => {
    const pda = PDAEngine.buildIndependentBlocksPDA('a', 'b', 'final_state');
    expect(pda.strategyName).toContain('Independent Block');
    
    // Test different counts n != m
    const sim1 = PDAEngine.simulate(pda, 'ab');
    expect(sim1.accepted).toBe(true);

    const sim2 = PDAEngine.simulate(pda, 'aaabb');
    expect(sim2.accepted).toBe(true);

    const sim3 = PDAEngine.simulate(pda, 'abbbbb');
    expect(sim3.accepted).toBe(true);

    // Mismatches (e.g. out of order or missing block)
    expect(PDAEngine.simulate(pda, 'ba').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'a').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'b').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'aba').accepted).toBe(false);

    // Verify stack was NOT used for counting: stack throughout remains of size 1 ([Z])
    for (const step of sim2.steps) {
      expect(step.stack?.length).toBe(1);
      expect(step.stack?.[0]).toBe('Z');
    }
  });

  // Case 7: Non-CFL Language Guard for a^n b^n c^n
  it('Case 7: Non-CFL guard rejects a^n b^n c^n without fabricating a fake PDA', () => {
    const query = 'Construct a PDA for L = { a^n b^n c^n | n >= 1 }';
    const nonCFL = PDAEngine.detectNonCFL(query);
    expect(nonCFL).not.toBeNull();
    expect(nonCFL?.reason).toContain('Pumping Lemma');
    expect(nonCFL?.suggestedModel).toBe('Turing Machine');

    // constructPDAForQuery should guard and throw error instead of fabricating a fake PDA
    expect(() => PDAEngine.constructPDAForQuery(query)).toThrowError(/Context-Free Pumping Lemma/);
  });

  // Case 8: a^n b^n c^m (matching prefix, looping suffix)
  it('Case 8: a^n b^n c^m enforces a count = b count and allows any c count >= 1', () => {
    const pda = PDAEngine.buildMatchingWithExtraPDA('a', 'b', 'c', 'final_state');
    expect(PDAEngine.simulate(pda, 'abc').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aabbc').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aabbcccc').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aaabbbccc').accepted).toBe(true);

    // Reject unequal a and b
    expect(PDAEngine.simulate(pda, 'aabbbc').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'aaabbc').accepted).toBe(false);
    // Reject missing c
    expect(PDAEngine.simulate(pda, 'aabb').accepted).toBe(false);
  });

  // Case 9: Equal counts unordered Na(w) = Nb(w)
  it('Case 9: Na(w) = Nb(w) accepts any interleaving with equal counts', () => {
    const pda = PDAEngine.buildEqualCountsUnorderedPDA('a', 'b', 'final_state');
    expect(PDAEngine.simulate(pda, 'ab').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'ba').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'aabb').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'abab').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'baba').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'abba').accepted).toBe(true);
    expect(PDAEngine.simulate(pda, 'baab').accepted).toBe(true);

    // Reject unequal counts
    expect(PDAEngine.simulate(pda, 'a').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'b').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'aab').accepted).toBe(false);
    expect(PDAEngine.simulate(pda, 'abb').accepted).toBe(false);
  });

  // Case 10: PDA Validator checks 8 formal constraints
  it('Case 10: PDA Validator verifies formal constraints and flags errors', () => {
    const validPDA = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const validResult = PDAEngine.validatePDA(validPDA);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    // Corrupted PDA: invalid destination state and unknown stack replacement symbol
    const brokenPDA = {
      ...validPDA,
      transitions: [
        ...validPDA.transitions,
        { from: 'q0', input: 'a', stackTop: 'Z', to: 'qNonExistent', stackReplacement: 'X_UNKNOWN', push: ['X_UNKNOWN'] }
      ]
    };
    const invalidResult = PDAEngine.validatePDA(brokenPDA);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some(e => e.includes('qNonExistent'))).toBe(true);
  });

  // Case 11: PDA Simplification Pipeline
  it('Case 11: PDA Simplification removes unreachable/useless states while preserving language equivalence', () => {
    const original = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    // Add unreachable state and redundant transition
    const pdaWithRedundancy = {
      ...original,
      states: [...original.states, 'qUnreachable', 'qDeadEnd'],
      transitions: [
        ...original.transitions,
        { from: 'qUnreachable', input: 'a', stackTop: 'Z', to: 'qUnreachable', stackReplacement: 'Z' },
        { from: 'q0', input: 'a', stackTop: 'Z', to: 'qDeadEnd', stackReplacement: 'Z' } // dead end
      ]
    };

    const simRes = PDAEngine.simplifyPDA(pdaWithRedundancy);
    expect(simRes.reductionLog.length).toBeGreaterThan(0);
    expect(simRes.simplifiedPDA.states).not.toContain('qUnreachable');
    expect(simRes.simplifiedPDA.states).not.toContain('qDeadEnd');
    expect(simRes.isEquivalent).toBe(true);

    // Note clarifying it is NOT generic DFA-style minimization
    expect(simRes.note).toContain('not have a general unique minimal form');
  });

  // Case 12: Instantaneous Descriptions trace and NPDA Computation Tree
  it('Case 12: Generates formal Instantaneous Descriptions and NPDA Computation Tree', () => {
    const pda = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const ids = PDAEngine.generateIDs(pda, 'aabb');

    expect(ids.length).toBeGreaterThan(0);
    expect(ids[0].formatted).toMatch(/\(q0,\s*aabb,\s*Z\)/);
    expect(ids[ids.length - 1].formatted).toMatch(/\(q2,\s*ε,\s*Z\)/);

    // Format transition function
    const deltaFormatted = PDAEngine.formatTransitionFunction(pda);
    expect(deltaFormatted.length).toBe(pda.transitions.length);
    expect(deltaFormatted[0]).toContain('δ(');

    // NPDA Computation Tree
    const evenNPDA = PDAEngine.buildPalindromeEvenNPDA(['a', 'b'], 'final_state');
    const compTree = PDAEngine.buildComputationTree(evenNPDA, 'abba', 8);
    expect(compTree).toBeDefined();
    expect(compTree.state).toBe(evenNPDA.startState);
    expect(compTree.remainingInput).toBe('abba');
  });
});

describe('PDA Instantaneous Description (ID) Formal Suite', () => {
  // Test 1: Formal (q, w, α) format and top → bottom stack orientation convention
  it('ID Format follows (q, w, α) with explicit top → bottom stack orientation', () => {
    const pda = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const ids = PDAEngine.generateIDs(pda, 'aaabbb');

    // Step 0: (q0, aaabbb, Z)
    expect(ids[0].formatted).toBe('(q0, aaabbb, Z)');
    expect(ids[0].state).toBe('q0');
    expect(ids[0].remainingInput).toBe('aaabbb');
    expect(ids[0].stackString).toBe('Z');

    // Step 3: (q0, bbb, AAAZ) -> Leftmost symbol 'A' is the top of stack
    const step3 = ids[3];
    expect(step3.state).toBe('q0');
    expect(step3.remainingInput).toBe('bbb');
    expect(step3.stackString).toBe('AAAZ');
    expect(step3.stackArray[0]).toBe('A'); // TOP is index 0
    expect(step3.stackArray[step3.stackArray.length - 1]).toBe('Z'); // BASE is last index
    expect(step3.formatted).toBe('(q0, bbb, AAAZ)');
  });

  // Test 2: Terminal acceptance conditions (Final State vs Empty Stack)
  it('Distinguishes Final State acceptance (qf, ε, α) from Empty Stack acceptance (q, ε, ε)', () => {
    // 1. Final State
    const pdaFinal = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const idsFinal = PDAEngine.generateIDs(pdaFinal, 'ab');
    const lastFinal = idsFinal[idsFinal.length - 1];
    expect(lastFinal.state).toBe('q2'); // q2 is in acceptStates
    expect(lastFinal.remainingInput).toBe('ε');
    expect(lastFinal.stackString).toBe('Z'); // base Z remains
    expect(pdaFinal.acceptStates).toContain(lastFinal.state);

    // 2. Empty Stack
    const pdaEmpty = PDAEngine.buildEqualCountsPDA('a', 'b', 'empty_stack');
    const idsEmpty = PDAEngine.generateIDs(pdaEmpty, 'ab');
    const lastEmpty = idsEmpty[idsEmpty.length - 1];
    expect(lastEmpty.remainingInput).toBe('ε');
    expect(lastEmpty.stackString).toBe('ε'); // stack is completely empty!
    expect(lastEmpty.stackArray.length).toBe(0);
  });

  // Test 3: Step-by-Step 7-Point Formal Derivation generated directly from δ
  it('Generates 7-step derivation breakdown directly from applied transition rule', () => {
    const pda = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const ids = PDAEngine.generateIDs(pda, 'ab');

    // Step 1: reading 'a', pushing A above Z
    const step1 = ids[1];
    expect(step1.beforeConfig).toBe('(q0, ab, Z)');
    expect(step1.afterConfig).toBe('(q0, b, AZ)');
    expect(step1.consumedSymbol).toBe('a');
    expect(step1.poppedSymbol).toBe('Z');
    expect(step1.pushedSymbols).toBe('AZ');
    expect(step1.transitionApplied).toBe('δ(q0, a, Z) = {(q0, AZ)}');

    expect(step1.derivationSteps).toBeDefined();
    expect(step1.derivationSteps?.length).toBe(7);
    expect(step1.derivationSteps?.[0]).toContain("Read symbol: 'a'");
    expect(step1.derivationSteps?.[2]).toContain("Stack top: 'Z' (orientation: top → bottom)");
    expect(step1.derivationSteps?.[3]).toContain('δ(q0, a, Z) = {(q0, AZ)}');
    expect(step1.derivationSteps?.[6]).toContain('New configuration reached: (q0, b, AZ)');
  });

  // Test 4: Automated Mathematical ID Validator (validateIDTrace)
  it('validateIDTrace verifies consecutive transitions and catches illegal moves', () => {
    const pda = PDAEngine.buildEqualCountsPDA('a', 'b', 'final_state');
    const validIDs = PDAEngine.generateIDs(pda, 'aabb');

    // Valid trace must pass with 0 errors
    const validResult = PDAEngine.validateIDTrace(pda, validIDs);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors.length).toBe(0);
    expect(validResult.stepsValidated).toBe(validIDs.length - 1);

    // Corrupted trace: illegally teleport state or fabricate stack
    const corruptedIDs = [
      ...validIDs.slice(0, 2),
      {
        ...validIDs[2],
        state: 'qNonExistent'
      },
      ...validIDs.slice(3)
    ];

    const invalidResult = PDAEngine.validateIDTrace(pda, corruptedIDs);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
    expect(invalidResult.errors[0]).toContain('is not permitted by transition function δ');
  });

  // Test 5: NPDA Branch ID extraction for nondeterministic midpoint guessing
  it('getComputationBranches extracts full ID sequence for each NPDA branch', () => {
    const evenNPDA = PDAEngine.buildPalindromeEvenNPDA(['a', 'b'], 'final_state');
    const compTree = PDAEngine.buildComputationTree(evenNPDA, 'abba', 8);
    const branches = PDAEngine.getComputationBranches(compTree);

    expect(branches.length).toBeGreaterThan(1);
    const acceptingBranch = branches.find((b) => b.isAccepting);
    expect(acceptingBranch).toBeDefined();
    expect(acceptingBranch?.ids.length).toBeGreaterThan(3);

    // Initial ID of branch must be root
    expect(acceptingBranch?.ids[0].formatted).toBe('(q0, abba, Z)');
    // Terminal ID of accepting branch must have ε remaining input and state q2
    const lastID = acceptingBranch?.ids[acceptingBranch.ids.length - 1];
    expect(lastID?.state).toBe('q2');
    expect(lastID?.remainingInput).toBe('ε');
  });

  // Test 6: Universal Solver recognizes requests for Instantaneous Descriptions
  it('SolverService resolves queries explicitly asking for Instantaneous Descriptions', async () => {
    const res = await SolverService.solveQuestion(
      'Construct a PDA for L = { a^n b^n | n >= 1 } and show the instantaneous descriptions for input aaabbb'
    );

    expect(res.visualizerType).toBe('PDA');
    expect(res.modelData?.pda).toBeDefined();
    expect(res.subtopic).toContain('Instantaneous Descriptions');

    // Step 4 must contain complete turnstile trace
    const idStep = res.steps.find((s) => s.title.includes('Instantaneous Descriptions'));
    expect(idStep).toBeDefined();
    expect(idStep?.action).toContain('(q0, aaabbb, Z)');
    expect(idStep?.action).toContain('⊢');
    expect(idStep?.explanation).toContain('Derivation theorem');

    // Final answer must show turnstile theorem
    expect(res.finalAnswer).toContain('(q0, aaabbb, Z) ⊢*');
    expect(res.finalAnswer).toContain('[ACCEPTED');
  });
});

