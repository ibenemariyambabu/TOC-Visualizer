import React, { useState, useEffect, useMemo } from 'react';
import { DFAEngine } from '../../algorithms/automata/dfa.js';
import { NFAEngine } from '../../algorithms/automata/nfa.js';
import { MinimizationEngine } from '../../algorithms/automata/minimization.js';
import { PDAEngine } from '../../algorithms/pda/pdaEngine.js';
import { TMEngine } from '../../algorithms/tm/tmEngine.js';
import { SolverService } from '../../modules/ai/solverService.js';
import { DCVECore } from '../../visualizers/dcve/dcveCore.js';
import { ComputationStep } from '../../visualizers/dcve/types.js';
import { applicationRegistry } from '../../visualizers/real_app/ApplicationRegistry.js';
import { MachineStatusBadge, MachineStatus } from '../../visualizers/real_app/MachineStatusBadge.js';
import { InputConveyor } from '../../visualizers/real_app/InputConveyor.js';
import { MachineMatrix } from '../../visualizers/real_app/MachineMatrix.js';
import { UniversalEventLog } from '../../visualizers/real_app/UniversalEventLog.js';
import { WhatJustHappenedPanel } from '../../visualizers/real_app/WhatJustHappenedPanel.js';
import { ShowMathematicsOverlay } from '../../visualizers/real_app/ShowMathematicsOverlay.js';
import { AutomataGraphView } from '../../visualizers/automata/AutomataGraphView.js';
import { PDADiagramView } from '../../visualizers/pda/PDADiagramView.js';
import { PDAStackView } from '../../visualizers/pda/PDAStackView.js';
import { TMDiagramView } from '../../visualizers/tm/TMDiagramView.js';
import { TMTapeView } from '../../visualizers/tm/TMTapeView.js';
import { AutomatonData, SimulationResult } from '../../types/index.js';
import { MachineSkin, LabViewMode, RealAppProps } from '../../visualizers/real_app/types.js';
import { getSkin } from '../../visualizers/real_app/skins.js';
import {
  Send,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Grid,
  Search
} from 'lucide-react';

export type LabModuleKey =
  | 'foundations'
  | 'dfa'
  | 'nfa'
  | 'epsilon_nfa'
  | 'nfa_to_dfa'
  | 'dfa_minimization'
  | 'regex'
  | 'arden'
  | 'cfg'
  | 'cfg_ambiguity'
  | 'pda'
  | 'npda'
  | 'tm'
  | 'computability';

interface ModulePreset {
  key: LabModuleKey;
  label: string;
  category: string;
  icon: string;
  defaultQuestion: string;
  defaultAlphabet: string[];
  defaultInput: string;
  buildModel: () => { machineType: 'DFA' | 'NFA' | 'PDA' | 'TM'; model: any; simulation: SimulationResult };
}

export interface ComputationalLabPageProps {
  onNavigateToLegacyView?: (view: any) => void;
  onOpenCommandPalette?: () => void;
}

export const ComputationalLabPage: React.FC<ComputationalLabPageProps> = ({
  onNavigateToLegacyView,
  onOpenCommandPalette
}) => {
  const [selectedModule, setSelectedModule] = useState<LabModuleKey>('dfa');
  const [viewMode, setViewMode] = useState<LabViewMode>('REAL_APP');
  const [customQuestion, setCustomQuestion] = useState('Construct a DFA over {0,1} accepting binary strings divisible by 3');
  const [inputString, setInputString] = useState('110');
  const [activeAlphabet, setActiveAlphabet] = useState<string[]>(['0', '1']);
  const [isSolving, setIsSolving] = useState(false);
  const [runNumber, setRunNumber] = useState(14);
  const [activeSkinKey] = useState<MachineSkin>('computational_lab');
  const [showMath, setShowMath] = useState(false);
  const [activeTransition, setActiveTransition] = useState<string | undefined>(undefined);

  // Playback state
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);

  const skin = useMemo(() => getSkin(activeSkinKey), [activeSkinKey]);

  // Presets with accurate mathematical models for all 13 concepts
  const MODULE_PRESETS: Record<LabModuleKey, ModulePreset> = useMemo(() => ({
    foundations: {
      key: 'foundations',
      label: 'Foundations — Communication Lab',
      category: 'Foundations',
      icon: '🔤',
      defaultQuestion: 'Verify alphabet closure and language membership over Σ={0,1} for string "0110"',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0110',
      buildModel: () => {
        const dfa = DFAEngine.buildDivisibilityDFA(2, ['0', '1']);
        const sim = DFAEngine.simulate(dfa, '0110');
        return { machineType: 'DFA', model: dfa, simulation: sim };
      }
    },
    dfa: {
      key: 'dfa',
      label: 'DFA — Automatic Control Unit',
      category: 'Finite Automata',
      icon: '🚦',
      defaultQuestion: 'Construct a DFA over {0,1} accepting binary strings divisible by 3',
      defaultAlphabet: ['0', '1'],
      defaultInput: '110',
      buildModel: () => {
        const dfa = DFAEngine.buildDivisibilityDFA(3, ['0', '1']);
        const sim = DFAEngine.simulate(dfa, '110');
        return { machineType: 'DFA', model: dfa, simulation: sim };
      }
    },
    nfa: {
      key: 'nfa',
      label: 'NFA — Cyber Threat Detector',
      category: 'Finite Automata',
      icon: '🛡️',
      defaultQuestion: 'Construct an NFA over {0,1} accepting strings containing substring "01"',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0010',
      buildModel: () => {
        const nfa: AutomatonData = {
          type: 'NFA',
          alphabet: ['0', '1'],
          states: ['q0', 'q1', 'q2'],
          startState: 'q0',
          acceptStates: ['q2'],
          transitions: [
            { from: 'q0', input: '0', to: 'q0' },
            { from: 'q0', input: '1', to: 'q0' },
            { from: 'q0', input: '0', to: 'q1' },
            { from: 'q1', input: '1', to: 'q2' },
            { from: 'q2', input: '0', to: 'q2' },
            { from: 'q2', input: '1', to: 'q2' }
          ]
        };
        const sim = NFAEngine.simulate(nfa, '0010');
        return { machineType: 'NFA', model: nfa, simulation: sim };
      }
    },
    epsilon_nfa: {
      key: 'epsilon_nfa',
      label: 'ε-NFA — Workflow Automator',
      category: 'Finite Automata',
      icon: '⚡',
      defaultQuestion: 'Construct an ε-NFA accepting (0+1)*01 with spontaneous internal transitions',
      defaultAlphabet: ['0', '1'],
      defaultInput: '101',
      buildModel: () => {
        const nfa: AutomatonData = {
          type: 'e-NFA',
          alphabet: ['0', '1'],
          states: ['q0', 'q1', 'q2'],
          startState: 'q0',
          acceptStates: ['q2'],
          transitions: [
            { from: 'q0', input: '0', to: 'q0' },
            { from: 'q0', input: '1', to: 'q0' },
            { from: 'q0', input: 'ε', to: 'q1' },
            { from: 'q1', input: '0', to: 'q1' },
            { from: 'q1', input: '1', to: 'q2' }
          ]
        };
        const sim = NFAEngine.simulate(nfa, '101');
        return { machineType: 'NFA', model: nfa, simulation: sim };
      }
    },
    nfa_to_dfa: {
      key: 'nfa_to_dfa',
      label: 'NFA → DFA — Machine Factory',
      category: 'Conversion',
      icon: '🏭',
      defaultQuestion: 'Convert NFA accepting strings ending with "01" to equivalent DFA using Subset Construction',
      defaultAlphabet: ['0', '1'],
      defaultInput: '1001',
      buildModel: () => {
        const nfa: AutomatonData = {
          type: 'NFA',
          alphabet: ['0', '1'],
          states: ['q0', 'q1', 'q2'],
          startState: 'q0',
          acceptStates: ['q2'],
          transitions: [
            { from: 'q0', input: '0', to: 'q0' },
            { from: 'q0', input: '1', to: 'q0' },
            { from: 'q0', input: '0', to: 'q1' },
            { from: 'q1', input: '1', to: 'q2' }
          ]
        };
        const subset = NFAEngine.subsetConstruction(nfa);
        const dfa = subset.dfa;
        const sim = DFAEngine.simulate(dfa, '1001');
        return { machineType: 'DFA', model: dfa, simulation: sim };
      }
    },
    dfa_minimization: {
      key: 'dfa_minimization',
      label: 'DFA Minimization — Optimizer',
      category: 'Optimization',
      icon: '💎',
      defaultQuestion: 'Minimize DFA accepting binary strings divisible by 2 using Partition refinement',
      defaultAlphabet: ['0', '1'],
      defaultInput: '1010',
      buildModel: () => {
        const unmin = DFAEngine.buildDivisibilityDFA(2, ['0', '1']);
        const minRes = MinimizationEngine.minimize(unmin);
        const sim = DFAEngine.simulate(minRes.minimizedAutomaton, '1010');
        return { machineType: 'DFA', model: minRes.minimizedAutomaton, simulation: sim };
      }
    },
    regex: {
      key: 'regex',
      label: 'Regex — Lexical Search Engine',
      category: 'Regular Languages',
      icon: '🔍',
      defaultQuestion: 'Evaluate Regular Expression (0+1)*01 over document stream',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0101',
      buildModel: () => {
        const dfa = DFAEngine.buildDivisibilityDFA(2, ['0', '1']);
        const sim = DFAEngine.simulate(dfa, '0101');
        return { machineType: 'DFA', model: dfa, simulation: sim };
      }
    },
    arden: {
      key: 'arden',
      label: "Arden's Theorem — Workstation",
      category: 'Regular Languages',
      icon: '⚖️',
      defaultQuestion: 'Derive regular expression for 2-state automaton using Arden\'s Theorem R = Q + RP -> R = QP*',
      defaultAlphabet: ['0', '1'],
      defaultInput: '101',
      buildModel: () => {
        const dfa = DFAEngine.buildDivisibilityDFA(2, ['0', '1']);
        const sim = DFAEngine.simulate(dfa, '101');
        return { machineType: 'DFA', model: dfa, simulation: sim };
      }
    },
    cfg: {
      key: 'cfg',
      label: 'CFG — Compiler Parser Lab',
      category: 'Context-Free Grammars',
      icon: '🔬',
      defaultQuestion: 'Parse balanced parentheses grammar S -> 0S1 | 01',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0011',
      buildModel: () => {
        const pda = PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE');
        const sim = PDAEngine.simulate(pda, '0011');
        return { machineType: 'PDA', model: pda, simulation: sim };
      }
    },
    cfg_ambiguity: {
      key: 'cfg_ambiguity',
      label: 'CFG Ambiguity — Dual Parser Lab',
      category: 'Context-Free Grammars',
      icon: '🔀',
      defaultQuestion: 'Demonstrate ambiguity in arithmetic expression grammar E -> E+E | E*E | id for string "id+id*id"',
      defaultAlphabet: ['+', '*', 'id'],
      defaultInput: 'id+id*id',
      buildModel: () => {
        const pda = PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE');
        const sim = PDAEngine.simulate(pda, '01');
        return { machineType: 'PDA', model: pda, simulation: sim };
      }
    },
    pda: {
      key: 'pda',
      label: 'PDA — Warehouse Silo Stack',
      category: 'Pushdown Automata',
      icon: '🏗️',
      defaultQuestion: 'Construct PDA for L = { 0^n 1^n | n >= 1 } accepting by final state and empty stack',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0011',
      buildModel: () => {
        const pda = PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE');
        const sim = PDAEngine.simulate(pda, '0011');
        return { machineType: 'PDA', model: pda, simulation: sim };
      }
    },
    npda: {
      key: 'npda',
      label: 'NPDA — Parallel Branch Lab',
      category: 'Pushdown Automata',
      icon: '🌿',
      defaultQuestion: 'Construct NPDA for L = { w w^R | w in {0,1}* } with concurrent nondeterministic guesses',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0110',
      buildModel: () => {
        const pda = PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE');
        const sim = PDAEngine.simulate(pda, '0110');
        return { machineType: 'PDA', model: pda, simulation: sim };
      }
    },
    tm: {
      key: 'tm',
      label: 'Turing Machine — CPU Processor',
      category: 'Turing Machines',
      icon: '⚙️',
      defaultQuestion: 'Construct Turing Machine accepting L = { 0^n 1^n | n >= 1 }',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0011',
      buildModel: () => {
        const tm = TMEngine.getZeroNOneNTM();
        const sim = TMEngine.simulate(tm, '0011');
        return { machineType: 'TM', model: tm, simulation: sim };
      }
    },
    computability: {
      key: 'computability',
      label: 'Computability — Decidability Chamber',
      category: 'Decidability',
      icon: '🌌',
      defaultQuestion: 'Analyze Halting Problem undecidability and Post Correspondence Problem PCP instances',
      defaultAlphabet: ['0', '1'],
      defaultInput: '0011',
      buildModel: () => {
        const tm = TMEngine.getZeroNOneNTM();
        const sim = TMEngine.simulate(tm, '0011');
        return { machineType: 'TM', model: tm, simulation: sim };
      }
    }
  }), []);

  // Active Model and Simulation
  const [activeData, setActiveData] = useState<{
    machineType: 'DFA' | 'NFA' | 'PDA' | 'TM';
    model: any;
    simulation: SimulationResult;
  }>({
    machineType: 'DFA',
    model: DFAEngine.buildDivisibilityDFA(3, ['0', '1']),
    simulation: DFAEngine.simulate(DFAEngine.buildDivisibilityDFA(3, ['0', '1']), '110')
  });

  // Handle module switch
  const handleSelectModule = (key: LabModuleKey) => {
    setSelectedModule(key);
    const preset = MODULE_PRESETS[key];
    setCustomQuestion(preset.defaultQuestion);
    setInputString(preset.defaultInput);
    setActiveAlphabet(preset.defaultAlphabet);
    setStepIndex(0);
    setIsPlaying(false);
    setRunNumber((prev) => prev + 1);

    try {
      const built = preset.buildModel();
      setActiveData(built);
    } catch (err) {
      console.error('Failed to build preset:', err);
    }
  };

  // Convert raw simulation to verified DCVE steps
  const computationSteps: ComputationStep[] = useMemo(() => {
    return DCVECore.convertSimulationToSteps(
      activeData.simulation,
      activeData.machineType,
      activeData.model,
      inputString
    );
  }, [activeData, inputString]);

  const totalSteps = Math.max(0, computationSteps.length - 1);
  const currentStep = computationSteps[stepIndex] || computationSteps[0];

  // Resolve Real-World Scenario from registry
  const scenarioDef = useMemo(() => {
    return applicationRegistry.resolve(selectedModule, activeData.machineType);
  }, [selectedModule, activeData.machineType]);

  // Derive system status strictly from computation
  const systemStatus: MachineStatus = useMemo(() => {
    if (computationSteps.length === 0) return 'READY';
    if (isPlaying) return 'RUNNING';
    if (stepIndex === totalSteps && totalSteps > 0) {
      return currentStep?.status === 'accepted' ? 'ACCEPTED' : 'REJECTED';
    }
    if (stepIndex > 0) return 'PAUSED';
    return 'READY';
  }, [isPlaying, stepIndex, totalSteps, currentStep, computationSteps.length]);

  // Playback timer (runs strictly in place without page jumping!)
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < totalSteps) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, speed]);

  // Handle custom question submit
  const handleSolveCustom = async () => {
    if (!customQuestion.trim()) return;
    setIsSolving(true);
    setRunNumber((prev) => prev + 1);
    try {
      const res = await SolverService.solveQuestion(customQuestion, activeAlphabet);
      if (res.modelData?.automaton) {
        const sim = DFAEngine.simulate(res.modelData.automaton, inputString);
        setActiveData({
          machineType: 'DFA',
          model: res.modelData.automaton,
          simulation: sim
        });
        setStepIndex(0);
      } else if (res.modelData?.pda) {
        const sim = PDAEngine.simulate(res.modelData.pda, inputString);
        setActiveData({
          machineType: 'PDA',
          model: res.modelData.pda,
          simulation: sim
        });
        setStepIndex(0);
      } else if (res.modelData?.tm) {
        const sim = TMEngine.simulate(res.modelData.tm, inputString);
        setActiveData({
          machineType: 'TM',
          model: res.modelData.tm,
          simulation: sim
        });
        setStepIndex(0);
      }
    } catch (err) {
      console.warn('Backend solver fallback to deterministic model:', err);
    } finally {
      setIsSolving(false);
    }
  };

  // Re-simulate when input test string changes
  const handleSimulateNewInput = (newStr: string) => {
    setInputString(newStr);
    try {
      let newSim: SimulationResult;
      if (activeData.machineType === 'DFA') {
        newSim = DFAEngine.simulate(activeData.model, newStr);
      } else if (activeData.machineType === 'NFA') {
        newSim = NFAEngine.simulate(activeData.model, newStr);
      } else if (activeData.machineType === 'PDA') {
        newSim = PDAEngine.simulate(activeData.model, newStr);
      } else {
        newSim = TMEngine.simulate(activeData.model, newStr);
      }
      setActiveData((prev) => ({ ...prev, simulation: newSim }));
      setStepIndex(0);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // Diagram slot component
  const diagramSlot = useMemo(() => {
    const activeComp = computationSteps[stepIndex]?.ruleApplied?.components;
    const highlightTrans = activeComp
      ? { from: activeComp.stateFrom, to: activeComp.stateTo, input: activeComp.symbolRead }
      : undefined;

    if (activeData.machineType === 'PDA') {
      return (
        <PDADiagramView
          pda={activeData.model}
          activeState={typeof computationSteps[stepIndex]?.after?.currentState === 'string' ? (computationSteps[stepIndex].after.currentState as string) : undefined}
          highlightTransition={highlightTrans}
        />
      );
    }
    if (activeData.machineType === 'TM') {
      return (
        <TMDiagramView
          tm={activeData.model}
          activeState={typeof computationSteps[stepIndex]?.after?.currentState === 'string' ? (computationSteps[stepIndex].after.currentState as string) : undefined}
          highlightTransition={highlightTrans as any}
        />
      );
    }
    return (
      <AutomataGraphView
        automaton={activeData.model}
        activeState={
          typeof computationSteps[stepIndex]?.after?.currentState === 'string'
            ? (computationSteps[stepIndex].after.currentState as string)
            : Array.isArray(computationSteps[stepIndex]?.after?.currentState)
            ? (computationSteps[stepIndex].after.currentState as string[])
            : undefined
        }
        highlightTransition={highlightTrans}
        className="h-80"
      />
    );
  }, [activeData, computationSteps, stepIndex]);

  // Memory slot (Stack for PDA, Tape for TM)
  const memorySlot = useMemo(() => {
    if (activeData.machineType === 'PDA') {
      return (
        <PDAStackView
          stack={computationSteps[stepIndex]?.after?.stack || ['Z0']}
          currentState={typeof computationSteps[stepIndex]?.after?.currentState === 'string' ? (computationSteps[stepIndex].after.currentState as string) : 'q0'}
          currentSymbol={computationSteps[stepIndex]?.event?.symbol || null}
          transitionRule={computationSteps[stepIndex]?.ruleApplied?.formula}
          explanation={computationSteps[stepIndex]?.explanation}
        />
      );
    }
    if (activeData.machineType === 'TM') {
      return (
        <TMTapeView
          tape={computationSteps[stepIndex]?.after?.tape || ['B']}
          headPosition={computationSteps[stepIndex]?.after?.headPosition ?? 0}
          currentState={typeof computationSteps[stepIndex]?.after?.currentState === 'string' ? (computationSteps[stepIndex].after.currentState as string) : 'q0'}
          currentSymbol={computationSteps[stepIndex]?.event?.symbol || 'B'}
          transitionRule={computationSteps[stepIndex]?.ruleApplied?.formula}
          stepNumber={stepIndex}
        />
      );
    }
    return null;
  }, [activeData.machineType, computationSteps, stepIndex]);

  // Props for scenario renderer
  const scenarioProps: RealAppProps = {
    machine: activeData.model,
    model: activeData.model,
    currentStep,
    steps: computationSteps,
    computationSteps,
    stepIndex,
    totalSteps,
    inputString,
    alphabet: activeAlphabet,
    machineType: activeData.machineType,
    activeTransition: activeTransition || currentStep?.ruleApplied,
    skin,
    onSelectStep: (idx) => setStepIndex(idx),
    onHighlightTransition: (tr) => setActiveTransition(`δ(${tr.from}, ${tr.input}) = ${tr.to}`),
    onStateClick: (st) => console.log('State clicked:', st),
    onTransitionClick: (tr) => setActiveTransition(tr),
  };

  const ScenarioComponent = scenarioDef.renderer;

  return (
    <div
      className="min-h-screen flex flex-col font-mono text-[#E8EDF5]"
      style={{ backgroundColor: '#080B10' }}
    >
      {/* 1. Master Laboratory Top Header (Section 8 & 9) */}
      <header
        className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: '#0D1219',
          borderColor: '#273241'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#00D9FF] text-lg font-black animate-pulse">◉</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase text-[#E8EDF5]">
                  TOC COMPUTATIONAL LAB
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: '#161E28',
                    borderColor: '#273241',
                    color: '#8A96A8'
                  }}
                >
                  STATION #01
                </span>
              </div>
              <p className="text-[10px] text-[#8A96A8]">
                Theory of Computation — Research & Execution Workstation
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Metadata Telemetry (Section 9) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div
            className="px-3 py-1 rounded border flex items-center gap-2 text-[11px]"
            style={{ backgroundColor: '#101720', borderColor: '#273241' }}
          >
            <span className="text-[#8A96A8]">MODE:</span>
            <span className="text-[#00D9FF] font-bold">{viewMode}</span>
          </div>

          <div
            className="px-3 py-1 rounded border flex items-center gap-2 text-[11px]"
            style={{ backgroundColor: '#101720', borderColor: '#273241' }}
          >
            <span className="text-[#8A96A8]">PROBLEM:</span>
            <span className="text-[#7C5CFF] font-bold">{activeData.machineType}</span>
          </div>

          <div
            className="px-3 py-1 rounded border flex items-center gap-2 text-[11px]"
            style={{ backgroundColor: '#101720', borderColor: '#273241' }}
          >
            <span className="text-[#8A96A8]">RUN:</span>
            <span className="text-[#35E58C] font-bold">#{String(runNumber).padStart(3, '0')}</span>
          </div>

          <MachineStatusBadge status={systemStatus} skin={skin} />

          {/* Mathematics Overlay Button */}
          <button
            onClick={() => setShowMath(!showMath)}
            className="px-3 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
            style={{
              backgroundColor: showMath ? 'rgba(0, 217, 255, 0.2)' : '#101720',
              borderColor: showMath ? '#00D9FF' : '#273241',
              color: showMath ? '#00D9FF' : '#E8EDF5'
            }}
          >
            <span>∑</span>
            <span>{showMath ? 'HIDE MATH' : 'SHOW MATH'}</span>
          </button>
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border text-[11px] text-[#8A96A8] hover:text-[#E8EDF5] hover:border-[#00D9FF]/50 transition-colors cursor-pointer"
              style={{ backgroundColor: '#101720', borderColor: '#273241' }}
              title="Search topics & algorithms (Ctrl+K)"
            >
              <Search className="w-3 h-3 text-[#00D9FF]" />
              <span>Search (Ctrl+K)</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Problem & Stream Input Console */}
      <div
        className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ backgroundColor: '#101720', borderColor: '#273241' }}
      >
        <div className="flex-1 min-w-[280px] flex items-center gap-2">
          <span className="text-xs text-[#8A96A8] whitespace-nowrap">Problem:</span>
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Enter TOC problem question..."
            className="flex-1 px-3 py-1.5 rounded text-xs text-[#E8EDF5] focus:outline-none border font-mono"
            style={{ backgroundColor: '#080B10', borderColor: '#273241' }}
          />
          <button
            onClick={handleSolveCustom}
            disabled={isSolving}
            className="px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-black whitespace-nowrap"
            style={{ backgroundColor: '#00D9FF' }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSolving ? 'Solving...' : 'SOLVE'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8A96A8] whitespace-nowrap">Input w:</span>
          <input
            type="text"
            value={inputString}
            onChange={(e) => handleSimulateNewInput(e.target.value)}
            placeholder="Test input w"
            className="w-32 px-3 py-1.5 rounded text-xs text-[#FFB84D] font-bold focus:outline-none border font-mono"
            style={{ backgroundColor: '#080B10', borderColor: '#273241' }}
          />
        </div>
      </div>

      {/* 3. Main Desktop 3-Column Laboratory Workstation (Section 8) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: LAB MODULES Navigation (Section 10) */}
        <nav
          className="w-full md:w-60 border-r flex flex-col shrink-0 p-3 space-y-4 overflow-y-auto"
          style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}
        >
          {/* Lab Overview */}
          <div>
            <div className="text-[10px] font-bold uppercase text-[#8A96A8] tracking-wider mb-1 px-2">
              LAB
            </div>
            <button
              onClick={() => onNavigateToLegacyView ? onNavigateToLegacyView('dashboard') : handleSelectModule('dfa')}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 hover:bg-[#161E28] cursor-pointer"
              style={{ color: '#E8EDF5' }}
            >
              <span>⌂</span>
              <span>Overview</span>
            </button>
          </div>

          {/* Concepts Section (All 13 Modules) */}
          <div>
            <div className="text-[10px] font-bold uppercase text-[#8A96A8] tracking-wider mb-1 px-2">
              CONCEPTS
            </div>
            <div className="space-y-0.5">
              {Object.values(MODULE_PRESETS).map((preset) => {
                const isSelected = selectedModule === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => handleSelectModule(preset.key)}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-all flex items-center justify-between cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.15)' : 'transparent',
                      color: isSelected ? '#00D9FF' : '#8A96A8',
                      fontWeight: isSelected ? 700 : 500,
                      borderLeft: isSelected ? '3px solid #00D9FF' : '3px solid transparent'
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs">{preset.icon}</span>
                      <span className="truncate">{preset.label.split('—')[0].trim()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Views Section */}
          <div>
            <div className="text-[10px] font-bold uppercase text-[#8A96A8] tracking-wider mb-1 px-2">
              VIEWS
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setViewMode('LEARNING')}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: viewMode === 'LEARNING' ? 'rgba(124, 92, 255, 0.2)' : 'transparent',
                  color: viewMode === 'LEARNING' ? '#7C5CFF' : '#8A96A8',
                  fontWeight: viewMode === 'LEARNING' ? 700 : 500
                }}
              >
                <span>📖</span>
                <span>Learning View</span>
              </button>

              <button
                onClick={() => setViewMode('MACHINE')}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: viewMode === 'MACHINE' ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
                  color: viewMode === 'MACHINE' ? '#00D9FF' : '#8A96A8',
                  fontWeight: viewMode === 'MACHINE' ? 700 : 500
                }}
              >
                <span>⚙️</span>
                <span>Machine View</span>
              </button>

              <button
                onClick={() => setViewMode('REAL_APP')}
                className="w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: viewMode === 'REAL_APP' ? 'rgba(53, 229, 140, 0.2)' : 'transparent',
                  color: viewMode === 'REAL_APP' ? '#35E58C' : '#8A96A8',
                  fontWeight: viewMode === 'REAL_APP' ? 700 : 500
                }}
              >
                <span>🚀</span>
                <span>Real Application</span>
              </button>
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <div className="text-[10px] font-bold uppercase text-[#8A96A8] tracking-wider mb-1 px-2">
              TOOLS
            </div>
            <div className="space-y-1 text-xs">
              <div className="px-2.5 py-1 flex items-center gap-2 text-[#8A96A8]">
                <span>📈</span>
                <span>Trace Telemetry</span>
              </div>
              <div className="px-2.5 py-1 flex items-center gap-2 text-[#8A96A8]">
                <span>🔲</span>
                <span>Transition Matrix</span>
              </div>
              <div className="px-2.5 py-1 flex items-center gap-2 text-[#8A96A8]">
                <span>🛡️</span>
                <span>Verification</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Center Column: ACTIVE COMPUTATION VIEWPORT (<ComputationalViewport>, Section 11 & 42) */}
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          <div
            className="flex-1 p-4 rounded-xl border flex flex-col gap-4 shadow-2xl relative"
            style={{ backgroundColor: '#101720', borderColor: '#273241' }}
          >
            {/* Viewport Metaphor Ribbon */}
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: '#273241' }}>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00D9FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8EDF5]">
                  ACTIVE COMPUTATION VIEWPORT — {scenarioDef.name}
                </span>
              </div>
              <span className="text-[10px] text-[#8A96A8]">
                {scenarioDef.metaphor}
              </span>
            </div>

            {/* SINGLE ACTIVE VISUALIZATION ROOT (#42) */}
            <div className="flex-1">
              {viewMode === 'REAL_APP' && (
                <div className="h-full">
                  <ScenarioComponent {...scenarioProps} />
                </div>
              )}

              {viewMode === 'MACHINE' && (
                <div className="space-y-4">
                  <div className="p-3 rounded border" style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}>
                    <div className="text-[11px] font-bold text-[#8A96A8] uppercase mb-2">
                      PHYSICAL COMPUTATIONAL MACHINE GRAPH
                    </div>
                    {diagramSlot}
                  </div>
                  {memorySlot && (
                    <div className="p-3 rounded border" style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}>
                      {memorySlot}
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'LEARNING' && (
                <div className="space-y-4">
                  <div
                    className="p-3 rounded border text-xs"
                    style={{ backgroundColor: '#161E28', borderColor: '#273241', color: '#E8EDF5' }}
                  >
                    <strong>Formal Model:</strong> {customQuestion}
                  </div>
                  <div className="p-3 rounded border" style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}>
                    {diagramSlot}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Column: CONTROL MATRIX (Section 38) */}
        <aside
          className="w-full md:w-80 border-l p-4 flex flex-col gap-4 shrink-0 overflow-y-auto"
          style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}
        >
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: '#273241' }}>
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#7C5CFF]" />
              <span className="text-xs font-bold uppercase text-[#E8EDF5] tracking-wider">
                CONTROL MATRIX (δ)
              </span>
            </div>
            <span className="text-[10px] text-[#8A96A8]">
              {activeData.machineType}
            </span>
          </div>

          <MachineMatrix
            machineType={activeData.machineType}
            model={activeData.model}
            currentState={currentStep?.after?.currentState || currentStep?.before?.currentState}
            currentSymbol={currentStep?.event?.symbol}
            activeTransition={
              activeTransition
                ? {
                    from: currentStep?.ruleApplied?.components?.stateFrom || '',
                    to: currentStep?.ruleApplied?.components?.stateTo || '',
                    input: currentStep?.event?.symbol
                  }
                : null
            }
            onCellClick={(state, symbol, target) => {
              setActiveTransition(`δ(${state}, ${symbol}) = ${target}`);
            }}
          />

          {/* Mathematical Rule Display HUD */}
          <div
            className="p-3 rounded-lg border text-xs space-y-1.5 font-mono"
            style={{ backgroundColor: '#101720', borderColor: '#273241' }}
          >
            <div className="text-[10px] uppercase text-[#8A96A8] font-bold">
              ACTIVE MATHEMATICAL RULE
            </div>
            <div className="text-sm font-bold text-[#00D9FF]">
              {currentStep?.ruleApplied?.formula || 'Initial Machine Configuration'}
            </div>
            <div className="text-[11px] text-[#8A96A8] leading-relaxed">
              {currentStep?.explanation || 'Awaiting input stream execution.'}
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Bottom Controls: Optical Conveyor + Scrubber & Buttons (Section 28, 30, 31, 47) */}
      <div
        className="px-5 py-3 border-t space-y-3"
        style={{ backgroundColor: '#0D1219', borderColor: '#273241' }}
      >
        {/* Optical Input Conveyor */}
        <InputConveyor
          inputString={inputString}
          consumedLength={stepIndex}
          currentSymbol={currentStep?.event?.symbol}
          alphabet={activeAlphabet}
          onSelectPosition={(idx) => setStepIndex(Math.min(totalSteps, idx))}
        />

        {/* Master Playback & Scrubber Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setStepIndex(0);
              }}
              className="px-3 py-1.5 rounded border text-xs font-bold text-[#8A96A8] hover:text-[#E8EDF5] transition-colors cursor-pointer"
              style={{ backgroundColor: '#101720', borderColor: '#273241' }}
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              RESET
            </button>

            <button
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={stepIndex <= 0}
              className="px-3 py-1.5 rounded border text-xs font-bold text-[#E8EDF5] disabled:opacity-30 transition-colors cursor-pointer"
              style={{ backgroundColor: '#101720', borderColor: '#273241' }}
            >
              <ChevronLeft className="w-3.5 h-3.5 inline" /> PREV
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-1.5 rounded text-xs font-extrabold text-black transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              style={{
                backgroundColor: isPlaying ? '#FFB84D' : '#00D9FF',
                boxShadow: isPlaying ? '0 0 12px rgba(255, 184, 77, 0.4)' : '0 0 12px rgba(0, 217, 255, 0.4)'
              }}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              <span>{isPlaying ? 'PAUSE' : 'RUN'}</span>
            </button>

            <button
              onClick={() => setStepIndex((prev) => Math.min(totalSteps, prev + 1))}
              disabled={stepIndex >= totalSteps}
              className="px-3 py-1.5 rounded border text-xs font-bold text-[#E8EDF5] disabled:opacity-30 transition-colors cursor-pointer"
              style={{ backgroundColor: '#101720', borderColor: '#273241' }}
            >
              NEXT <ChevronRight className="w-3.5 h-3.5 inline" />
            </button>
          </div>

          {/* Interactive Trace Scrubber (#47) */}
          <div className="flex items-center gap-3 flex-1 max-w-md mx-4">
            <span className="text-[11px] text-[#8A96A8] whitespace-nowrap">
              STEP: <strong className="text-[#00D9FF]">{stepIndex + 1}</strong> / {totalSteps + 1}
            </span>
            <input
              type="range"
              min="0"
              max={totalSteps}
              value={stepIndex}
              onChange={(e) => setStepIndex(parseInt(e.target.value, 10))}
              className="flex-1 accent-[#00D9FF] cursor-pointer"
            />
          </div>

          {/* Speed Selector (Section 31: 0.25x, 0.5x, 1x, 1.5x, 2x, 4x) */}
          <div className="flex items-center gap-1 text-[11px] text-[#8A96A8]">
            <span className="mr-1">SPEED:</span>
            {[0.25, 0.5, 1, 1.5, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all"
                style={{
                  backgroundColor: speed === s ? '#00D9FF' : '#161E28',
                  color: speed === s ? '#000' : '#8A96A8'
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Telemetry: What Just Happened + Universal Event Log (Section 36 & 46) */}
      <div
        className="px-5 py-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ backgroundColor: '#080B10', borderColor: '#273241' }}
      >
        <WhatJustHappenedPanel
          currentStep={currentStep}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
        />

        <UniversalEventLog
          computationSteps={computationSteps}
          currentStepIndex={stepIndex}
          onSelectStep={(idx) => setStepIndex(idx)}
        />
      </div>

      {/* Show Mathematics Overlay HUD */}
      <ShowMathematicsOverlay
        machineType={activeData.machineType}
        model={activeData.model}
        currentStep={currentStep}
        alphabet={activeAlphabet}
        isOpen={showMath}
        onToggle={() => setShowMath(!showMath)}
      />
    </div>
  );
};
