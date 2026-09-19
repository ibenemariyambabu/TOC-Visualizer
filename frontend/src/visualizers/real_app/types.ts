import { ComputationStep, StepDiff, VisualEvent } from '../dcve/types.js';
import { AutomatonData, PDAData, TMData, SimulationResult } from '../../types/index.js';

export type LabViewMode = 'LEARNING' | 'MACHINE' | 'REAL_APPLICATION' | 'REAL_APP' | 'ARCADE' | 'EXAM';

export type MachineSkin =
  | 'computational_lab'
  | 'control_room'
  | 'machine_factory'
  | 'matrix_machine'
  | 'arcade'
  | 'cyber_monitor'
  | 'compiler_lab'
  | 'minimal_math';

export interface SkinStyle {
  id: MachineSkin;
  name: string;
  bgClass: string;
  panelClass: string;
  borderClass: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  fontClass: string;
  badgeStyle: string;

  // Direct style tokens for rich CSS computational lab panels
  bg?: string;
  panelBg?: string;
  subPanelBg?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  border?: string;
  borderRadius?: string;
  accentColor?: string;
  fontFamily?: string;
  shadow?: string;
  [key: string]: any;
}

export interface RealAppScenarioConfig {
  id: string;
  title: string;
  subtitle: string;
  domainName: string;
  metaphor: string;
  iconName: string;
  inputUnitName: string;
  stateRoleName: string;
  acceptedMeaning: string;
  rejectedMeaning: string;
}

export interface RealAppProps {
  machineType?: 'DFA' | 'NFA' | 'PDA' | 'TM' | 'CFG' | 'REGEX' | string;
  model?: AutomatonData | PDAData | TMData | any;
  machine?: any;
  simulationResult?: SimulationResult;
  computationSteps?: ComputationStep[];
  steps?: ComputationStep[];
  stepIndex: number;
  totalSteps?: number;
  currentStep: ComputationStep;
  inputString: string;
  alphabet?: string[];
  questionText?: string;
  onSelectStep?: (index: number) => void;
  onHighlightTransition?: (trans: { from: string; to: string; input?: string }) => void;
  activeTransition?: any;
  activeMatrixCell?: { from: string; input: string } | null;
  onMatrixCellClick?: (from: string, input: string) => void;
  onStateClick?: (state: string) => void;
  onTransitionClick?: (trans: any) => void;
  skin?: SkinStyle | any;
}
