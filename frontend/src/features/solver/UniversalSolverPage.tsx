import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  HelpCircle,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import { UniversalSolverResponse, SimulationResult } from '../../types/index.js';
import { AutomataGraphView } from '../../visualizers/automata/AutomataGraphView.js';
import { TapeStringSimulator } from '../../visualizers/automata/TapeStringSimulator.js';
import { VisualizerControls } from '../../visualizers/shared/VisualizerControls.js';
import { StepExplanationPanel } from '../../visualizers/shared/StepExplanationPanel.js';
import { ArdenVisualizer } from '../../visualizers/regex/ArdenVisualizer.js';
import { ParseTreeView } from '../../visualizers/cfg/ParseTreeView.js';
import { PDAStackView } from '../../visualizers/pda/PDAStackView.js';
import { PDADiagramView } from '../../visualizers/pda/PDADiagramView.js';
import { InstantaneousDescriptionsPanel } from '../../visualizers/pda/InstantaneousDescriptionsPanel.js';
import { TMTapeView } from '../../visualizers/tm/TMTapeView.js';
import { TMDiagramView } from '../../visualizers/tm/TMDiagramView.js';
import { PumpingLemmaView } from '../../visualizers/pumping/PumpingLemmaView.js';
import { PCPTileView } from '../../visualizers/computability/PCPTileView.js';
import { DFAEngine } from '../../algorithms/automata/dfa.js';
import { PDAEngine } from '../../algorithms/pda/pdaEngine.js';
import { TMEngine } from '../../algorithms/tm/tmEngine.js';
import { DCVELabWrapper } from '../../visualizers/dcve/DCVELabWrapper.js';
import { SolverService } from '../../modules/ai/solverService.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { Tokenizer } from '../../algorithms/common/tokenizer.js';

interface UniversalSolverPageProps {
  initialQuery?: string;
  onSaveToNotebook?: (item: any) => void;
}

export const UniversalSolverPage: React.FC<UniversalSolverPageProps> = ({
  initialQuery = 'Construct a DFA over {0,1} accepting binary strings divisible by 3',
  onSaveToNotebook
}) => {
  const [solution, setSolution] = useState<UniversalSolverResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');

  // Simulation playback state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [testString, setTestString] = useState('110');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'LEARN' | 'EXAM'>('LEARN');

  const solverPresets = [
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
      label: 'Non-Regular Guard (0^n 1^n)',
      question: 'Construct a DFA for L = { 0^n 1^n | n >= 1 }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'PDA for 0^n 1^n',
      question: 'Construct a PDA for L = { 0^n 1^n | n >= 1 }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'TM for 0^n 1^n',
      question: 'Construct a Turing Machine for L = { 0^n 1^n | n >= 1 }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'Thompson (0+1)*01',
      question: 'Convert (0+1)*01 to equivalent ε-NFA',
      alphabet: ['0', '1'],
      testString: '0101'
    },
    {
      label: 'Arden Theorem (X = aX + b)',
      question: 'Solve using Arden theorem: X = aX + b',
      alphabet: ['a', 'b'],
      testString: 'ab'
    },
    {
      label: 'Halting Problem Proof',
      question: 'Prove that the Halting Problem is undecidable',
      alphabet: ['0', '1'],
      testString: ''
    }
  ];

  // Solve query dynamically
  const handleSolve = async (data: {
    question: string;
    alphabet: string[];
    parameters: Record<string, any>;
    testString: string;
    mode: 'LEARN' | 'EXAM';
  }) => {
    if (!data.question.trim()) return;

    setLoading(true);
    setViewMode(data.mode);
    setTestString(data.testString);

    try {
      const sol = await SolverService.solveQuestion(data.question, data.alphabet);
      setSolution(sol);

      // Compute and track solved hash
      const hash = `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`;
      setSolvedHash(hash);

      // Run initial simulation if automaton/PDA/TM present
      if (sol.modelData?.automaton) {
        const sim = DFAEngine.simulate(sol.modelData.automaton, data.testString);
        setSimulationResult(sim);
        setCurrentStepIndex(0);
      } else if (sol.modelData?.pda) {
        const sim = PDAEngine.simulate(sol.modelData.pda, data.testString);
        setSimulationResult(sim);
        setCurrentStepIndex(0);
      } else if (sol.modelData?.tm) {
        const sim = TMEngine.simulate(sol.modelData.tm, data.testString);
        setSimulationResult(sim);
        setCurrentStepIndex(0);
      } else {
        setSimulationResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const alpha = Tokenizer.extractAlphabetFromQuestion(initialQuery) || ['0', '1'];
    handleSolve({
      question: initialQuery,
      alphabet: alpha,
      parameters: {},
      testString: '110',
      mode: 'LEARN'
    });
  }, [initialQuery]);

  // Playback timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && simulationResult) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < simulationResult.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, simulationResult, speed]);

  const handleSimulateCustomString = (str: string) => {
    setTestString(str);
    if (solution?.modelData?.automaton) {
      const sim = DFAEngine.simulate(solution.modelData.automaton, str);
      setSimulationResult(sim);
      setCurrentStepIndex(0);
    } else if (solution?.modelData?.pda) {
      const sim = PDAEngine.simulate(solution.modelData.pda, str);
      setSimulationResult(sim);
      setCurrentStepIndex(0);
    } else if (solution?.modelData?.tm) {
      const sim = TMEngine.simulate(solution.modelData.tm, str);
      setSimulationResult(sim);
      setCurrentStepIndex(0);
    }
  };

  const handleSave = () => {
    if (onSaveToNotebook && solution) {
      onSaveToNotebook({
        question: initialQuery,
        topic: solution.topic,
        difficulty: solution.difficulty,
        finalAnswer: solution.finalAnswer,
        timestamp: new Date().toISOString()
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const currentStepData = simulationResult?.steps[currentStepIndex];
  const totalSteps = simulationResult ? simulationResult.steps.length - 1 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Universal Editable Question Workspace */}
      <QuestionWorkspace
        moduleName="Universal Solver"
        initialQuestion={initialQuery}
        initialAlphabet={['0', '1']}
        initialTestString={testString}
        presets={solverPresets}
        onSolve={handleSolve}
        isSolving={loading}
        solvedQuestionHash={solvedHash}
      />

      {solution && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Classification & Metadata Badges Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                Module {solution.module}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {solution.topic}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {solution.subtopic}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-mono font-bold">
                Difficulty: Level {solution.difficulty} / 7
              </span>
              {viewMode === 'EXAM' && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  KTU Exam Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved to My TOC Lab!
                </span>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <BookmarkCheck className="h-4 w-4 text-amber-400" />
                  <span>Save Problem & Notes</span>
                </button>
              )}
            </div>
          </div>

          {/* Core Reasoning Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              <span>Core Logic & Concept Required</span>
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {solution.coreIdea}
            </p>
          </div>
          {/* Dynamic Computational Visualization Engine (DCVE) for Executable Automata */}
          {['DFA', 'PDA', 'TM'].includes(solution.visualizerType) && simulationResult ? (
            <div className="space-y-6">
              {solution.visualizerType === 'DFA' && solution.modelData?.automaton && (
                <DCVELabWrapper
                  machineType="DFA"
                  model={solution.modelData.automaton}
                  simulationResult={simulationResult}
                  inputString={testString}
                  stepIndex={currentStepIndex}
                  isPlaying={isPlaying}
                  speed={speed}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onNext={() =>
                    setCurrentStepIndex((prev) => Math.min(totalSteps, prev + 1))
                  }
                  onPrev={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  onReset={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                  }}
                  onJumpToStep={(idx) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  onChangeSpeed={setSpeed}
                  onSimulateInput={handleSimulateCustomString}
                  diagramSlot={
                    <AutomataGraphView
                      automaton={solution.modelData.automaton}
                      activeState={currentStepData?.currentState}
                      highlightTransition={
                        currentStepData?.transitionUsed
                          ? {
                              from: currentStepData.transitionUsed.from,
                              to: currentStepData.transitionUsed.to,
                              input: currentStepData.transitionUsed.input
                            }
                          : undefined
                      }
                    />
                  }
                  alphabet={solution.modelData.automaton.alphabet || ['0', '1']}
                  questionText={initialQuery}
                />
              )}

              {solution.visualizerType === 'PDA' && solution.modelData?.pda && (
                <div className="space-y-6">
                  <DCVELabWrapper
                    machineType="PDA"
                    model={solution.modelData.pda}
                    simulationResult={simulationResult}
                    inputString={testString}
                    stepIndex={currentStepIndex}
                    isPlaying={isPlaying}
                    speed={speed}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onNext={() =>
                      setCurrentStepIndex((prev) => Math.min(totalSteps, prev + 1))
                    }
                    onPrev={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                    onReset={() => {
                      setIsPlaying(false);
                      setCurrentStepIndex(0);
                    }}
                    onJumpToStep={(idx) => {
                      setIsPlaying(false);
                      setCurrentStepIndex(idx);
                    }}
                    onChangeSpeed={setSpeed}
                    onSimulateInput={handleSimulateCustomString}
                    diagramSlot={
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono block">
                          PDA State Transition Graph (input, stack-top → replacement)
                        </span>
                        <PDADiagramView
                          pda={solution.modelData.pda}
                          activeState={
                            typeof currentStepData?.currentState === 'string'
                              ? currentStepData.currentState
                              : 'q0'
                          }
                          highlightTransition={
                            currentStepData?.transitionUsed
                              ? {
                                  from: currentStepData.transitionUsed.from,
                                  to: currentStepData.transitionUsed.to,
                                  input: currentStepData.transitionUsed.input
                                }
                              : undefined
                          }
                        />
                      </div>
                    }
                    memorySlot={
                      <PDAStackView
                        stack={currentStepData?.stack || ['Z0']}
                        currentState={
                          typeof currentStepData?.currentState === 'string'
                            ? currentStepData.currentState
                            : 'q0'
                        }
                        currentSymbol={currentStepData?.currentSymbol || 'a'}
                        transitionRule={currentStepData?.transitionUsed?.explanation}
                        explanation={currentStepData?.explanation}
                      />
                    }
                    alphabet={solution.modelData.pda.inputAlphabet || ['0', '1']}
                    questionText={initialQuery}
                  />

                  <InstantaneousDescriptionsPanel
                    pda={solution.modelData.pda}
                    descriptions={PDAEngine.generateIDs(
                      solution.modelData.pda,
                      simulationResult || testString
                    )}
                    currentStepIndex={currentStepIndex}
                    onSelectStep={(idx) => setCurrentStepIndex(idx)}
                    testString={testString}
                    acceptanceMode={solution.modelData.pda.acceptanceMode}
                  />
                </div>
              )}

              {solution.visualizerType === 'TM' && solution.modelData?.tm && (
                <DCVELabWrapper
                  machineType="TM"
                  model={solution.modelData.tm}
                  simulationResult={simulationResult}
                  inputString={testString}
                  stepIndex={currentStepIndex}
                  isPlaying={isPlaying}
                  speed={speed}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onNext={() =>
                    setCurrentStepIndex((prev) => Math.min(totalSteps, prev + 1))
                  }
                  onPrev={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  onReset={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(0);
                  }}
                  onJumpToStep={(idx) => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  onChangeSpeed={setSpeed}
                  onSimulateInput={handleSimulateCustomString}
                  diagramSlot={
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono block">
                        Turing Machine State Diagram (read → write, direction)
                      </span>
                      <TMDiagramView
                        tm={solution.modelData.tm}
                        activeState={
                          typeof currentStepData?.currentState === 'string'
                            ? currentStepData.currentState
                            : 'q0'
                        }
                        highlightTransition={
                          currentStepData?.transitionUsed
                            ? {
                                from: currentStepData.transitionUsed.from,
                                to: currentStepData.transitionUsed.to,
                                readSymbol: currentStepData.transitionUsed.input
                              }
                            : undefined
                        }
                      />
                    </div>
                  }
                  memorySlot={
                    <TMTapeView
                      tape={currentStepData?.tape || ['a', 'b', 'c', '□']}
                      headPosition={currentStepData?.headPosition || 0}
                      currentState={
                        typeof currentStepData?.currentState === 'string'
                          ? currentStepData.currentState
                          : 'q0'
                      }
                      currentSymbol={currentStepData?.currentSymbol || 'a'}
                      transitionRule={currentStepData?.transitionUsed?.explanation}
                      stepNumber={currentStepIndex}
                    />
                  }
                  alphabet={solution.modelData.tm.inputAlphabet || ['0', '1']}
                  questionText={initialQuery}
                />
              )}

              {/* Dedicated KTU Exam Preparation & Model Answers Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <StepExplanationPanel
                  currentStepData={currentStepData}
                  currentStepIndex={currentStepIndex}
                  totalSteps={totalSteps}
                  stateMeanings={solution.memoryExplanation}
                  commonMistakes={solution.commonMistakes}
                  memoryTip={solution.memoryTip}
                  isAccepted={
                    currentStepIndex === totalSteps ? simulationResult?.accepted : null
                  }
                  ktuExamAnswer={solution.ktuExamAnswer}
                  onSave={handleSave}
                />
              </div>
            </div>
          ) : (
            /* Split Screen Layout for Non-Machine / Proof / CFG Topics */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                {solution.visualizerType === 'Regex' && (
                  <ArdenVisualizer automaton={solution.modelData?.automaton} />
                )}

                {solution.visualizerType === 'ParseTree' && (
                  <ParseTreeView isAmbiguousDemo={true} />
                )}

                {solution.visualizerType === 'PumpingLemma' && solution.modelData?.pumpingProof && (
                  <PumpingLemmaView proof={solution.modelData.pumpingProof} />
                )}

                {solution.visualizerType === 'PCP' && <PCPTileView />}

                {solution.visualizerType === 'Reduction' && (
                  <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                      Cantor Diagonalization & Self-Reference Paradox
                    </span>
                    <div className="p-4 bg-slate-950 rounded-lg font-mono text-xs text-slate-300 space-y-2">
                      <div className="text-amber-300 font-bold">Assume Decider H(&lt;M, w&gt;) exists</div>
                      <div>Construct Inverted Machine D(&lt;M&gt;) = NOT(H(&lt;M, &lt;M&gt;&gt;))</div>
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300">
                        Evaluating D(&lt;D&gt;): D halts ⟺ D loops forever (Direct Contradiction!)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 h-[640px]">
                <StepExplanationPanel
                  currentStepData={currentStepData}
                  currentStepIndex={currentStepIndex}
                  totalSteps={totalSteps}
                  stateMeanings={solution.memoryExplanation}
                  commonMistakes={solution.commonMistakes}
                  memoryTip={solution.memoryTip}
                  isAccepted={
                    currentStepIndex === totalSteps ? simulationResult?.accepted : null
                  }
                  ktuExamAnswer={solution.ktuExamAnswer}
                  onSave={handleSave}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
