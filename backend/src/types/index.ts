// ===============================================
// THEORY OF COMPUTATION - COMMON DATA CONTRACTS
// ===============================================

import { StateEliminationStep } from "../algorithms/regex/regexEngine";

// 1. AUTOMATA TYPES
export type AutomatonType = 'DFA' | 'NFA' | 'e-NFA';

export interface AutomatonTransition {
  from: string;
  input: string; // symbol or 'ε' / 'e' / ''
  to: string;
  explanation?: string;
}

export interface RegexASTNode {
  type: 'symbol' | 'empty' | 'epsilon' | 'union' | 'concat' | 'star';
  value?: string;
  left?: RegexASTNode;
  right?: RegexASTNode;
  child?: RegexASTNode;
}

export interface StateEliminationResult {
  regularExpression: string;
  steps: StateEliminationStep[];
  generalizedGraph: {
    states: string[];
    startState: string;
    acceptStates: string[];
    transitions: AutomatonTransition[];
    stateMeanings?: Record<string, string>; // "What are we remembering?"
    trapState?: string;
  };
}

export interface AutomatonData {
  id?: string;
  name?: string;
  type: AutomatonType;
  alphabet: string[];
  states: string[];
  startState: string;
  acceptStates: string[];
  transitions: AutomatonTransition[];
  stateMeanings?: Record<string, string>; // "What are we remembering?"
  trapState?: string;
}

export interface SimulationStep {
  stepIndex: number;
  currentState: string | string[];
  remainingInput: string;
  consumedInput: string;
  currentSymbol: string | null;
  transitionUsed?: AutomatonTransition;
  pdaTransitionUsed?: PDATransition;
  explanation: string;
  stack?: string[]; // for PDA
  tape?: string[]; // for TM
  tapeHead?: number; // for TM
  headPosition?: number; // for TM
}

export interface SimulationResult {
  accepted: boolean;
  finalState: string | string[];
  steps: SimulationStep[];
  explanation: string;
}

export interface TestResult {
  input: string;
  accepted: boolean;
  expected?: boolean;
  isCorrect?: boolean;
  path: string[];
}

// 2. MINIMIZATION TYPES
export interface MinimizationPartitionStep {
  iteration: number;
  partitions: string[][];
  reason: string;
  splits: {
    originalPartition: string[];
    symbol: string;
    subPartitions: string[][];
    explanation: string;
  }[];
}

export interface MinimizationResult {
  originalStateCount: number;
  minimizedStateCount: number;
  unreachableStatesRemoved: string[];
  steps: MinimizationPartitionStep[];
  minimizedAutomaton: AutomatonData;
  equivalentClasses: Record<string, string>;
  tableFillingMatrix?: {
    pairs: { state1: string; state2: string; marked: boolean; reason?: string }[];
  };
}

// 3. REGEX & GRAMMAR TYPES
export interface RegexASTNode {
  type: 'symbol' | 'concat' | 'union' | 'star' | 'empty' | 'epsilon';
  value?: string;
  left?: RegexASTNode;
  right?: RegexASTNode;
  child?: RegexASTNode;
}

export interface CFGProduction {
  from: string; // Non-terminal (e.g. S)
  to: string[]; // List of alternatives (e.g. ["aSb", "ε"])
}

export interface CFGGrammar {
  variables: string[]; // Non-terminals
  terminals: string[];
  startSymbol: string;
  productions: CFGProduction[];
}

export interface DerivationStep {
  stepNumber: number;
  sententialForm: string;
  targetNonTerminal: string;
  productionUsed: string;
  resultingSententialForm: string;
  reason: string;
}

export interface ParseTreeNode {
  id: string;
  symbol: string;
  isTerminal: boolean;
  children?: ParseTreeNode[];
}

// 4. PDA TYPES
export interface PDATransition {
  from: string;
  input: string; // terminal or 'ε'
  stackTop: string; // top symbol popped
  to: string;
  stackReplacement: string; // pushed symbols (or 'ε' for pop)
  explanation?: string;
  push?: string[];
}

export interface InstantaneousDescription {
  stepIndex: number;
  state: string;
  remainingInput: string;
  stackString: string; // top -> bottom convention, e.g. "AZ0" or "ε"
  stackArray: string[]; // elements from top to bottom
  formatted: string; // e.g. (q0, aaabb, Z0)
  transitionApplied?: string; // e.g. δ(q0, a, Z0) = {(q0, AZ0)}
  turnstileSymbol?: string; // e.g. "⊢", "⊢*", "⊢+"
  beforeConfig?: string; // configuration before move
  afterConfig?: string; // configuration after move
  consumedSymbol?: string; // input token consumed or 'ε'
  poppedSymbol?: string; // stack top popped
  pushedSymbols?: string; // replacement symbols pushed onto stack
  derivationSteps?: string[]; // step-by-step formal derivation breakdown
}

export interface IDValidationResult {
  isValid: boolean;
  errors: string[];
  stepsValidated: number;
}

export interface PDAComputationTreeNode {
  id: string;
  state: string;
  remainingInput: string;
  stack: string[];
  isAccepting: boolean;
  isDead: boolean;
  transitionUsed?: string;
  children: PDAComputationTreeNode[];
}

export interface PDASimplificationResult {
  originalStateCount: number;
  simplifiedStateCount: number;
  unreachableStatesRemoved: string[];
  uselessStatesRemoved: string[];
  redundantTransitionsRemoved: string[];
  simplifiedPDA: PDAData;
  reductionLog: string[];
  isEquivalent?: boolean;
  note?: string;
}

export interface PDAValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  isDeterministic: boolean;
}

export interface PDAData {
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  startState: string;
  initialStackSymbol: string;
  acceptStates: string[];
  acceptanceMode: 'FINAL_STATE' | 'EMPTY_STACK';
  transitions: PDATransition[];
  stateDescriptions?: Record<string, string>;
  isDeterministic?: boolean;
  strategyName?: string;
  whyItWorks?: string;
}

// 5. TURING MACHINE TYPES
export interface TMTransition {
  currentState: string;
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S'; // Left, Right, Stay
  explanation?: string;
}

export interface TMData {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  startState: string;
  acceptState: string;
  rejectState: string;
  transitions: TMTransition[];
}

// 6. COMPUTABILITY & REDUCTIONS & PCP
export interface PCPTile {
  id: number;
  top: string;
  bottom: string;
}

export interface PCPSimulationResult {
  sequence: number[];
  topString: string;
  bottomString: string;
  isMatch: boolean;
  explanation: string;
}

export interface PumpingLemmaStep {
  i: number;
  pumpedString: string;
  inLanguage: boolean;
  explanation: string;
}

export interface PumpingLemmaProof {
  language: string;
  isRegularProof: boolean; // true = proving non-regular, false = proving non-CFL
  assumedLength: string; // e.g. "p"
  chosenString: string; // e.g. "a^p b^p"
  decomposition: {
    description: string;
    parts: { name: string; value: string; condition: string }[];
  };
  pumpingAnalysis: PumpingLemmaStep[];
  contradiction: string;
  conclusion: string;
}

// 7. UNIVERSAL SOLVER SCHEMA
export interface UniversalSolverResponse {
  module: number;
  topic: string;
  subtopic: string;
  problemType: string;
  difficulty: number; // 1 to 7
  conceptsRequired: string[];
  visualizerType: 'DFA' | 'NFA' | 'e-NFA' | 'Minimization' | 'Regex' | 'CFG' | 'ParseTree' | 'PDA' | 'TM' | 'PumpingLemma' | 'Reduction' | 'PCP' | 'Chomsky';
  
  coreIdea: string;
  memoryExplanation?: Record<string, string>; // "What are we remembering?"
  
  steps: {
    stepNumber: number;
    title: string;
    action: string;
    explanation: string;
    stateBefore?: string;
    stateAfter?: string;
    why: string;
  }[];
  
  modelData?: {
    automaton?: AutomatonData;
    grammar?: CFGGrammar;
    pda?: PDAData;
    tm?: TMData;
    pumpingProof?: PumpingLemmaProof;
    pcpTiles?: PCPTile[];
  };
  
  testCases?: TestResult[];
  finalAnswer: string;
  formalAnswer: string;
  ktuExamAnswer: {
    twoMarks: string;
    fiveMarks: string;
    tenMarks: string;
  };
  commonMistakes: string[];
  memoryTip: string;
}
