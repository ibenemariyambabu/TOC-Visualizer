import { SimulationStep, SimulationResult, AutomatonData, PDAData, TMData } from '../../types/index.js';

export type DCVEViewMode = 'LAB' | 'LEARNING' | 'EXAM' | 'REAL_APP' | 'MACHINE' | 'ARCADE';
export type MotionMode = 'FULL' | 'REDUCED' | 'OFF';

export type VisualEventType =
  | 'STATE_CHANGE'
  | 'INPUT_READ'
  | 'INPUT_CONSUMED'
  | 'INPUT_REMAINING_CHANGED'
  | 'TRANSITION_APPLIED'
  | 'STACK_PUSH'
  | 'STACK_POP'
  | 'STACK_REPLACE'
  | 'TAPE_READ'
  | 'TAPE_WRITE'
  | 'TAPE_MOVE'
  | 'BRANCH_CREATED'
  | 'BRANCH_TERMINATED'
  | 'PARTITION_CREATED'
  | 'PARTITION_SPLIT'
  | 'STATES_MERGED'
  | 'EPSILON_MOVE'
  | 'PRODUCTION_APPLIED'
  | 'TREE_NODE_CREATED'
  | 'EQUATION_TRANSFORMED'
  | 'ACCEPT'
  | 'REJECT'
  | 'HALT'
  | 'LOOP_DETECTED';

export interface VisualEvent {
  type: VisualEventType;
  sourceId?: string;
  mathematicalOperation: string;
  payload: Record<string, any>;
  description: string;
}

export interface StepConfiguration {
  currentState: string | string[];
  remainingInput: string;
  consumedInput: string;
  currentSymbol?: string;
  stack?: string[];
  tape?: string[];
  headPosition?: number;
  activeBranches?: string[];
  instantaneousDescription?: string;
}

export interface FormalRule {
  machineType: 'DFA' | 'NFA' | 'PDA' | 'TM' | 'CFG' | 'REGEX';
  formula: string;
  explanation: string;
  components: {
    stateFrom: string;
    symbolRead?: string;
    stackTop?: string;
    stateTo: string;
    stackReplacement?: string;
    symbolWrite?: string;
    headDirection?: 'L' | 'R' | 'S' | string;
  };
}

export interface StepDiff {
  stateChanged?: { from: string | string[]; to: string | string[] };
  inputChanged?: { from: string; to: string; consumed: string };
  stackChanged?: { from: string[]; to: string[]; action: 'PUSH' | 'POP' | 'REPLACE' | 'NONE'; symbols: string[] };
  tapeChanged?: { cellIndex: number; from: string; to: string; headFrom: number; headTo: number; moveDir: string };
  summary: string;
}

export interface ComputationStep {
  stepNumber: number;
  before: StepConfiguration;
  event: {
    type: string;
    symbol?: string;
    description: string;
  };
  ruleApplied: FormalRule;
  after: StepConfiguration;
  inputConsumed: string[];
  stateChanges: { from: string | string[]; to: string | string[] }[];
  memoryChanges: {
    type: 'STACK' | 'TAPE' | 'PARTITION' | 'TREE';
    before: any;
    after: any;
    diffSummary: string;
  }[];
  visualEvents: VisualEvent[];
  explanation: string;
  why: string;
  diff: StepDiff;
  status: 'running' | 'accepted' | 'rejected' | 'halted' | 'stuck';
}

export interface TestCaseModel {
  input: string;
  displayLabel?: string;
  category: 'REPRESENTATIVE' | 'VALID' | 'INVALID' | 'EDGE_CASE' | 'EPSILON' | 'RANDOM';
  expectedOutcome: boolean;
  actualOutcome?: boolean;
  notes?: string;
}
