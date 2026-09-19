import React, { useState, useEffect } from 'react';
import { AutomatonData, SimulationResult } from '../../types/index.js';
import { AutomataGraphView } from '../../visualizers/automata/AutomataGraphView.js';
import { DCVELabWrapper } from '../../visualizers/dcve/DCVELabWrapper.js';
import { TapeStringSimulator } from '../../visualizers/automata/TapeStringSimulator.js';
import { MinimizationEngine } from '../../algorithms/automata/minimization.js';
import { NFAEngine } from '../../algorithms/automata/nfa.js';
import { DFAEngine } from '../../algorithms/automata/dfa.js';
import { SolverService } from '../../modules/ai/solverService.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { Cpu, Repeat, Minimize2, Play, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const AutomataLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playground' | 'subset' | 'minimization'>('playground');

  // Question & Automaton state
  const [currentQuestion, setCurrentQuestion] = useState(
    'Construct a DFA over {0,1} accepting binary strings divisible by 3'
  );
  const [currentAlphabet, setCurrentAlphabet] = useState<string[]>(['0', '1']);
  const [testString, setTestString] = useState('110');
  const [automaton, setAutomaton] = useState<AutomatonData>(() =>
    DFAEngine.buildDivisibilityDFA(3, ['0', '1'])
  );
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() =>
    DFAEngine.simulate(DFAEngine.buildDivisibilityDFA(3, ['0', '1']), '110')
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');
  const [explanation, setExplanation] = useState(
    'Every binary number read left-to-right updates remainder r\' = (2 * r + bit) mod 3. State qi represents remainder i.'
  );

  const totalSteps = simulationResult ? Math.max(0, simulationResult.steps.length - 1) : 0;

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

  const automataPresets = [
    {
      label: 'Divisible by 3 ({0,1})',
      question: 'Construct a DFA over {0,1} accepting binary strings divisible by 3',
      alphabet: ['0', '1'],
      testString: '110'
    },
    {
      label: 'Divisible by 5 ({0,1})',
      question: 'Construct a DFA over {0,1} accepting binary strings divisible by 5',
      alphabet: ['0', '1'],
      testString: '1010'
    },
    {
      label: 'Ends with 101 ({0,1})',
      question: 'Construct a DFA over {0,1} for strings ending in 101',
      alphabet: ['0', '1'],
      testString: '0101'
    },
    {
      label: 'Contains substring "ab" ({a,b,c})',
      question: 'Construct a DFA over {a,b,c} containing substring ab',
      alphabet: ['a', 'b', 'c'],
      testString: 'cabac'
    },
    {
      label: 'Starts with "01" ({0,1})',
      question: 'Construct a DFA over {0,1} for strings starting with 01',
      alphabet: ['0', '1'],
      testString: '011'
    },
    {
      label: 'Even number of 1s ({0,1})',
      question: 'Construct a DFA over {0,1} accepting strings with even number of 1s',
      alphabet: ['0', '1'],
      testString: '101'
    }
  ];

  const handleSolve = async (data: {
    question: string;
    alphabet: string[];
    parameters: Record<string, any>;
    testString: string;
    mode: 'LEARN' | 'EXAM';
  }) => {
    setIsSolving(true);
    setCurrentQuestion(data.question);
    setCurrentAlphabet(data.alphabet);
    setTestString(data.testString);

    try {
      const sol = await SolverService.solveQuestion(data.question, data.alphabet);
      if (sol.modelData?.automaton) {
        setAutomaton(sol.modelData.automaton);
        setExplanation(sol.coreIdea);
        const sim = DFAEngine.simulate(sol.modelData.automaton, data.testString);
        setSimulationResult(sim);
        setStepIndex(0);
      }
      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`
      );
    } finally {
      setIsSolving(false);
    }
  };

  const handleSimulateString = (str: string) => {
    setTestString(str);
    const sim = DFAEngine.simulate(automaton, str);
    setSimulationResult(sim);
    setStepIndex(0);
  };

  // Benchmark NFA ending in 'ab' for Subset tab
  const benchmarkNFA: AutomatonData = {
    type: 'NFA',
    alphabet: currentAlphabet.length > 0 ? currentAlphabet : ['0', '1'],
    states: ['q0', 'q1', 'q2'],
    startState: 'q0',
    acceptStates: ['q2'],
    transitions: [
      { from: 'q0', input: currentAlphabet[0] || '0', to: 'q0' },
      { from: 'q0', input: currentAlphabet[1] || '1', to: 'q0' },
      { from: 'q0', input: currentAlphabet[0] || '0', to: 'q1' },
      { from: 'q1', input: currentAlphabet[1] || '1', to: 'q2' }
    ]
  };

  const subsetResult = NFAEngine.subsetConstruction(benchmarkNFA);
  const minResult = MinimizationEngine.minimize(automaton);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Automata Lab</h2>
          <p className="text-xs text-slate-400 mt-1">
            DFA, NFA, Subset Construction, and State Minimization Studio (KTU 2024 Scheme)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'playground'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Interactive DFA / NFA</span>
          </button>

          <button
            onClick={() => setActiveTab('subset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'subset'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Subset Construction (NFA → DFA)</span>
          </button>

          <button
            onClick={() => setActiveTab('minimization')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'minimization'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>DFA Minimization (P0, P1...)</span>
          </button>
        </div>
      </div>

      {/* Reusable Question Workspace Component */}
      <QuestionWorkspace
        moduleName="Automata"
        initialQuestion={currentQuestion}
        initialAlphabet={currentAlphabet}
        initialTestString={testString}
        presets={automataPresets}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      {activeTab === 'playground' && (
        <div className="space-y-6">
          {/* Invariant Explanation Banner */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
              Mathematical Design Invariant
            </span>
            <p className="text-xs text-slate-300">{explanation}</p>
          </div>

          {/* Dynamic Computational Visualization Engine (DCVE) */}
          <DCVELabWrapper
            machineType={automaton.type === 'NFA' || automaton.type === 'e-NFA' ? 'NFA' : 'DFA'}
            model={automaton}
            simulationResult={
              simulationResult || {
                accepted: false,
                steps: [],
                finalState: automaton.startState || 'q0',
                explanation: 'Initial state'
              }
            }
            inputString={testString}
            stepIndex={stepIndex}
            isPlaying={isPlaying}
            speed={speed}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={() => setStepIndex((prev) => Math.min(totalSteps, prev + 1))}
            onPrev={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            onReset={() => {
              setIsPlaying(false);
              setStepIndex(0);
            }}
            onJumpToStep={(s) => setStepIndex(s)}
            onChangeSpeed={setSpeed}
            onSimulateInput={handleSimulateString}
            diagramSlot={
              <AutomataGraphView
                automaton={automaton}
                activeState={simulationResult?.steps[stepIndex]?.currentState}
                highlightTransition={
                  simulationResult?.steps[stepIndex]?.transitionUsed
                    ? {
                        from: simulationResult.steps[stepIndex].transitionUsed.from,
                        to: simulationResult.steps[stepIndex].transitionUsed.to,
                        input: simulationResult.steps[stepIndex].transitionUsed.input
                      }
                    : undefined
                }
                questionText={currentQuestion}
              />
            }
            alphabet={currentAlphabet}
            questionText={currentQuestion}
          />
        </div>
      )}

      {activeTab === 'subset' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original NFA */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase font-mono block">
                Source NFA
              </span>
              <AutomataGraphView automaton={benchmarkNFA} />
            </div>

            {/* Generated DFA */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase font-mono block">
                Resulting Deterministic DFA via Subset Construction
              </span>
              <AutomataGraphView automaton={subsetResult.dfa} />
            </div>
          </div>

          {/* Step-by-Step Subset Construction Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              Step-by-Step Subset Discovery Log
            </span>
            <div className="space-y-2">
              {subsetResult.steps.map((step) => (
                <div key={step.stepIndex} className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>Step {step.stepIndex}: Subset {step.subsetName} on '{step.symbol}'</span>
                    <span>Target: {step.newSubsetName}</span>
                  </div>
                  <p className="text-slate-400 font-sans">{step.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'minimization' && (
        <div className="space-y-6">
          {/* Comparison Stats Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Original States</span>
                <span className="text-lg font-bold text-slate-200">{minResult.originalStateCount} States</span>
              </div>
              <div className="text-indigo-400 text-lg">→</div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Minimized States</span>
                <span className="text-lg font-bold text-emerald-400">{minResult.minimizedStateCount} States</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              Hopcroft Partition Refinement
            </span>
          </div>

          {/* Side-by-Side Diagram Visualization: Source DFA vs Minimized DFA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono">
                  Source DFA ({automaton.states.length} states)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Original Automaton</span>
              </div>
              <AutomataGraphView automaton={automaton} />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono">
                  Minimized DFA ({minResult.minimizedStateCount} states)
                </span>
                <span className="text-[10px] text-emerald-500 font-mono">Merged Equivalence Classes</span>
              </div>
              <AutomataGraphView automaton={minResult.minimizedAutomaton} />
            </div>
          </div>

          {/* State Merge Correspondence Table (Section 12) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              State Merge Correspondence (Equivalence Classes)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {Object.entries(minResult.equivalentClasses || {}).map(([orig, minClass]) => (
                <div
                  key={orig}
                  className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-400">
                    Original State <strong>{orig}</strong>
                  </span>
                  <span className="text-emerald-400 font-bold">➔ {minClass}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partition Steps (P0 -> P1 -> P2...) */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Equivalence Partition Refinement History
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {minResult.steps.map((step) => (
                <div key={step.iteration} className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>Iteration P{step.iteration}</span>
                    <span className="text-slate-500">{step.partitions.length} Groups</span>
                  </div>

                  <div className="flex flex-wrap gap-2 py-1">
                    {step.partitions.map((group, gIdx) => (
                      <div key={gIdx} className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-bold">
                        [{group.join(', ')}]
                      </div>
                    ))}
                  </div>

                  <p className="text-slate-400 font-sans text-xs">{step.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
