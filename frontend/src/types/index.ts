export type AutomatonType = 'DFA' | 'NFA' | 'e-NFA';

export interface AutomatonTransition {
  from: string;
  input: string;
  to: string;
  explanation?: string;
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
  stateMeanings?: Record<string, string>;
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
}

export interface ArdenSolverStep {
  stepNumber: number;
  title: string;
  action: string;
  currentEquation: string;
  ruleUsed: string;
  whatChanged: string;
  why: string;
  highlightVariable?: string;
}

export interface ArdenSystemResult {
  generatedEquations: Record<string, string>;
  stateToEquationMap: Record<string, string>;
  steps: ArdenSolverStep[];
  finalRegularExpression: string;
  uniquenessWarning?: string;
  validationResults: {
    string: string;
    faAccepts: boolean;
    regexMatches: boolean;
    match: boolean;
  }[];
}

export interface StateEliminationStep {
  stepNumber: number;
  eliminatedState: string;
  remainingStates: string[];
  formula: string;
  explanation: string;
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
    acceptState: string;
    transitions: { from: string; to: string; regex: string }[];
  };
}

export interface CFGProduction {
  from: string;
  to: string[];
}

export interface CFGGrammar {
  variables: string[];
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

export interface AmbiguityResult {
  isAmbiguous: boolean;
  testString: string;
  parseTreeA?: ParseTreeNode;
  parseTreeB?: ParseTreeNode;
  explanation: string;
  disambiguationGuide: string;
}

export interface PDATransition {
  from: string;
  input: string;
  stackTop: string;
  to: string;
  stackReplacement: string;
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

export interface TMTransition {
  currentState: string;
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  direction: 'L' | 'R' | 'S';
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
  isRegularProof: boolean;
  assumedLength: string;
  chosenString: string;
  decomposition: {
    description: string;
    parts: { name: string; value: string; condition: string }[];
  };
  pumpingAnalysis: PumpingLemmaStep[];
  contradiction: string;
  conclusion: string;
}

export interface UniversalSolverResponse {
  module: number;
  topic: string;
  subtopic: string;
  problemType: string;
  difficulty: number;
  conceptsRequired: string[];
  visualizerType: 'DFA' | 'NFA' | 'e-NFA' | 'Minimization' | 'Regex' | 'CFG' | 'ParseTree' | 'PDA' | 'TM' | 'PumpingLemma' | 'Reduction' | 'PCP' | 'Chomsky';
  coreIdea: string;
  memoryExplanation?: Record<string, string>;
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
