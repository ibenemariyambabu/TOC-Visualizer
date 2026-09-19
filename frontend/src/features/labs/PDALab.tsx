import React, { useState, useEffect, useMemo } from 'react';
import { PDAStackView } from '../../visualizers/pda/PDAStackView.js';
import { InstantaneousDescriptionsPanel } from '../../visualizers/pda/InstantaneousDescriptionsPanel.js';
import { PDAComputationTreeView } from '../../visualizers/pda/PDAComputationTreeView.js';
import { PDADiagramView } from '../../visualizers/pda/PDADiagramView.js';
import { DCVELabWrapper } from '../../visualizers/dcve/DCVELabWrapper.js';
import { PDAEngine } from '../../algorithms/pda/pdaEngine.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { PDAData, SimulationResult, PDASimplificationResult } from '../../types/index.js';
import {
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Terminal,
  Cpu,
  GitBranch,
  Minimize2,
  CheckCircle2,
  HelpCircle,
  Table
} from 'lucide-react';

export const PDALab: React.FC = () => {
  // Acceptance Mode state
  const [acceptanceMode, setAcceptanceMode] = useState<'FINAL_STATE' | 'EMPTY_STACK'>('FINAL_STATE');

  // Question & Machine state
  const [currentQuestion, setCurrentQuestion] = useState(
    'Construct a PDA for L = { 0^n 1^n | n >= 1 }'
  );
  const [currentAlphabet, setCurrentAlphabet] = useState<string[]>(['0', '1']);
  const [testString, setTestString] = useState('0011');
  const [pda, setPda] = useState<PDAData>(() =>
    PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE')
  );

  // Active view tab inside PDA Studio
  const [activeTab, setActiveTab] = useState<'simulator' | 'ids' | 'formal' | 'computation_tree' | 'simplification'>('simulator');

  // Simulation state
  const [simulation, setSimulation] = useState<SimulationResult>(() =>
    PDAEngine.simulate(
      PDAEngine.constructPDAForQuery('Construct a PDA for L = { 0^n 1^n | n >= 1 }', ['0', '1'], 'FINAL_STATE'),
      '0011'
    )
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');
  const [nonCflNotice, setNonCflNotice] = useState<{ reason: string; suggestedModel: string } | null>(null);

  // Presets covering all major PDA problem classes (Section 4 & 35)
  const pdaPresets = [
    {
      label: '0^n 1^n (Binary Equal Counts)',
      question: 'Construct a PDA for L = { 0^n 1^n | n >= 1 }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'a^n b^n (Standard)',
      question: 'Construct a PDA for L = { a^n b^n | n >= 1 }',
      alphabet: ['a', 'b'],
      testString: 'aabb'
    },
    {
      label: 'a^n b^m (Independent Counts)',
      question: 'Construct a PDA for L = { a^n b^m | n, m >= 1 }',
      alphabet: ['a', 'b'],
      testString: 'aab'
    },
    {
      label: 'a^n b^n c^m (Matching with Extra)',
      question: 'Construct a PDA for L = { a^n b^n c^m | n, m >= 1 }',
      alphabet: ['a', 'b', 'c'],
      testString: 'aabbc'
    },
    {
      label: 'Equal a & b: N_a(w) = N_b(w)',
      question: 'Construct a PDA for strings with equal number of a and b',
      alphabet: ['a', 'b'],
      testString: 'ababb'
    },
    {
      label: 'Even Palindromes: w w^R (NPDA)',
      question: 'Construct a PDA for even palindromes w w^R',
      alphabet: ['0', '1'],
      testString: '0110'
    },
    {
      label: 'Marked Palindromes: w c w^R',
      question: 'Construct a PDA for marked palindromes w c w^R',
      alphabet: ['a', 'b', 'c'],
      testString: 'abcba'
    },
    {
      label: 'Balanced Parentheses ()',
      question: 'Construct a PDA accepting balanced parentheses',
      alphabet: ['(', ')'],
      testString: '(())'
    },
    {
      label: 'Non-CFL Guard: a^n b^n c^n',
      question: 'Construct a PDA for L = { a^n b^n c^n | n >= 1 }',
      alphabet: ['a', 'b', 'c'],
      testString: 'aabbcc'
    }
  ];

  // Re-run solver when question or acceptance mode changes
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
      const nonCfl = PDAEngine.detectNonCFL(data.question);
      if (nonCfl) {
        setNonCflNotice(nonCfl);
      } else {
        setNonCflNotice(null);
        const constructedPda = PDAEngine.constructPDAForQuery(
          data.question,
          data.alphabet,
          acceptanceMode
        );
        setPda(constructedPda);

        const sim = PDAEngine.simulate(constructedPda, data.testString);
        setSimulation(sim);
        setStepIndex(0);
        setIsPlaying(false);
      }

      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${acceptanceMode}_${JSON.stringify(
          data.parameters
        )}`
      );
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSolving(false);
    }
  };

  // Re-run simulation ONLY when test string changes (Section 24 Requirement)
  const handleSimulateStringOnly = (newStr: string) => {
    setTestString(newStr);
    const sim = PDAEngine.simulate(pda, newStr);
    setSimulation(sim);
    setStepIndex(0);
    setIsPlaying(false);
  };

  // Switch acceptance mode and regenerate PDA
  const handleToggleAcceptanceMode = (newMode: 'FINAL_STATE' | 'EMPTY_STACK') => {
    setAcceptanceMode(newMode);
    if (!nonCflNotice) {
      const updatedPda = PDAEngine.constructPDAForQuery(currentQuestion, currentAlphabet, newMode);
      setPda(updatedPda);
      const sim = PDAEngine.simulate(updatedPda, testString);
      setSimulation(sim);
      setStepIndex(0);
      setIsPlaying(false);
    }
  };

  // Playback timer
  const totalSteps = simulation.steps.length - 1;
  const currentStep = simulation.steps[stepIndex] || simulation.steps[0];

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

  // Derived data
  const instantaneousDescriptions = useMemo(
    () => PDAEngine.generateIDs(pda, testString),
    [pda, testString]
  );
  const deltaNotation = useMemo(() => PDAEngine.formatTransitionFunction(pda), [pda]);
  const simplificationResult = useMemo(() => PDAEngine.simplifyPDA(pda), [pda]);
  const computationTree = useMemo(
    () => PDAEngine.buildComputationTree(pda, testString),
    [pda, testString]
  );
  const validationResult = useMemo(() => PDAEngine.validatePDA(pda), [pda]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pushdown Automata Lab</h2>
          <p className="text-xs text-slate-400 mt-1">
            Formal 7-Tuple, δ Notation, Stack Execution, Instantaneous Descriptions & Simplification (KTU 2024 Scheme)
          </p>
        </div>

        {/* Acceptance Mode Switcher (Section 3 Requirement) */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2">Acceptance:</span>
          <button
            onClick={() => handleToggleAcceptanceMode('FINAL_STATE')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              acceptanceMode === 'FINAL_STATE'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Final State (q ∈ F)
          </button>
          <button
            onClick={() => handleToggleAcceptanceMode('EMPTY_STACK')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              acceptanceMode === 'EMPTY_STACK'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Empty Stack (Stack = ∅)
          </button>
        </div>
      </div>

      {/* Editable Question Workspace */}
      <QuestionWorkspace
        moduleName="PDA"
        initialQuestion={currentQuestion}
        initialAlphabet={currentAlphabet}
        initialTestString={testString}
        presets={pdaPresets}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      {/* Non-CFL Language Guard (Section 5 Requirement) */}
      {nonCflNotice && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3 font-mono text-xs shadow-xl">
          <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>THEORETICAL LIMITATION: Language is NOT Context-Free!</span>
          </div>
          <p className="font-sans text-slate-200 text-sm leading-relaxed">{nonCflNotice.reason}</p>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-500/20 text-slate-300 font-sans">
            <strong>KTU Syllabus Guidance:</strong> A Pushdown Automaton cannot recognize this language because it has only <strong>one LIFO stack</strong>. Comparing 3 independent exponents simultaneously requires at least two stacks (which is computationally equivalent to a <strong>Turing Machine</strong>).
          </div>
        </div>
      )}

      {!nonCflNotice && (
        <div className="space-y-6">
          {/* Formal Strategy & Language Formalization Banner (Section 30) */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">
                Construction Strategy
              </span>
              <span className="text-sm font-bold text-slate-100">{pda.strategyName}</span>
              <p className="text-slate-400 font-sans text-xs">{pda.whyItWorks}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                <span>Determinism: </span>
                <strong className={validationResult.isDeterministic ? 'text-cyan-400' : 'text-purple-400'}>
                  {validationResult.isDeterministic ? 'DPDA (Deterministic)' : 'NPDA (Nondeterministic)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Sub-Tabs for Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Interactive Simulation & Stack</span>
            </button>

            <button
              onClick={() => setActiveTab('ids')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'ids'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Instantaneous Descriptions (IDs)</span>
            </button>

            <button
              onClick={() => setActiveTab('formal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'formal'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>7-Tuple & Transition Table</span>
            </button>

            <button
              onClick={() => setActiveTab('computation_tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'computation_tree'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Computation Tree (NPDA)</span>
            </button>

            <button
              onClick={() => setActiveTab('simplification')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'simplification'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Equivalent Simplified PDA</span>
            </button>
          </div>

          {/* Tab 1: Interactive Simulation & Stack Runner */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* Dynamic Computational Visualization Engine (DCVE) Core */}
              <DCVELabWrapper
                machineType="PDA"
                model={pda}
                simulationResult={simulation}
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
                onJumpToStep={(idx) => {
                  setIsPlaying(false);
                  setStepIndex(idx);
                }}
                onChangeSpeed={setSpeed}
                onSimulateInput={handleSimulateStringOnly}
                diagramSlot={
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono block">
                      PDA State Transition Graph
                    </span>
                    <PDADiagramView
                      pda={pda}
                      activeState={
                        typeof currentStep?.currentState === 'string' ? currentStep.currentState : 'q0'
                      }
                      highlightTransition={
                        currentStep?.transitionUsed
                          ? {
                              from: currentStep.transitionUsed.from,
                              to: currentStep.transitionUsed.to,
                              input: currentStep.transitionUsed.input
                            }
                          : undefined
                      }
                    />
                  </div>
                }
                memorySlot={
                  <PDAStackView
                    stack={currentStep?.stack || ['Z0']}
                    currentState={
                      typeof currentStep?.currentState === 'string' ? currentStep.currentState : 'q0'
                    }
                    currentSymbol={currentStep?.currentSymbol || (currentAlphabet[0] || '0')}
                    transitionRule={currentStep?.transitionUsed?.explanation}
                    explanation={currentStep?.explanation}
                  />
                }
                alphabet={currentAlphabet}
                questionText={currentQuestion}
              />

              {/* Instantaneous Descriptions (IDs) Panel (Section 10) */}
              <InstantaneousDescriptionsPanel
                pda={pda}
                descriptions={instantaneousDescriptions}
                currentStepIndex={stepIndex}
                onSelectStep={(idx) => {
                  setStepIndex(idx);
                  setIsPlaying(false);
                }}
                computationTree={computationTree}
                testString={testString}
                acceptanceMode={acceptanceMode}
              />
            </div>
          )}

          {/* Tab 2: Dedicated Instantaneous Descriptions (IDs) Suite */}
          {activeTab === 'ids' && (
            <div className="space-y-6">
              <InstantaneousDescriptionsPanel
                pda={pda}
                descriptions={instantaneousDescriptions}
                currentStepIndex={stepIndex}
                onSelectStep={(idx) => {
                  setStepIndex(idx);
                  setIsPlaying(false);
                }}
                computationTree={computationTree}
                testString={testString}
                acceptanceMode={acceptanceMode}
              />
            </div>
          )}

          {/* Tab 2: Formal 7-Tuple & Transition Table (Section 1, 2, 14, 15) */}
          {activeTab === 'formal' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Formal 7-Tuple Definition Box */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                    Formal 7-Tuple Mathematical Model
                  </span>
                  <div className="text-base font-bold text-slate-100">
                    P = (Q, Σ, Γ, δ, q0, Z0, F)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">STATES SET (Q)</span>
                    <div className="text-indigo-300 font-bold">&#123;{pda.states.join(', ')}&#125;</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">INPUT ALPHABET (Σ)</span>
                    <div className="text-cyan-300 font-bold">&#123;{pda.inputAlphabet.join(', ')}&#125;</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">STACK ALPHABET (Γ)</span>
                    <div className="text-amber-300 font-bold">&#123;{pda.stackAlphabet.join(', ')}&#125;</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">START STATE (q0)</span>
                    <div className="text-slate-200 font-bold">{pda.startState}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">BASE STACK SYMBOL (Z0)</span>
                    <div className="text-amber-400 font-bold">{pda.initialStackSymbol}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-slate-500 font-bold block text-[10px]">ACCEPT STATES (F)</span>
                    <div className="text-emerald-400 font-bold">
                      {pda.acceptanceMode === 'EMPTY_STACK'
                        ? '∅ (Acceptance by Empty Stack)'
                        : `\u007B${pda.acceptStates.join(', ')}\u007D`}
                    </div>
                  </div>
                </div>

                {/* State Meanings Table (Section 8) */}
                {pda.stateDescriptions && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">
                      State Semantic Meaning Invariants:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
                      {Object.entries(pda.stateDescriptions).map(([st, desc]) => (
                        <div key={st} className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                          <span className="text-xs font-mono font-bold text-indigo-400">{st}:</span>
                          <p className="text-xs text-slate-300">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit Transition Function δ List (Section 2) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                  Transition Function δ: Q × (Σ ∪ &#123;ε&#125;) × Γ → P(Q × Γ*)
                </span>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 max-h-56 overflow-y-auto space-y-1.5 text-slate-300">
                  {deltaNotation.map((line, idx) => (
                    <div key={idx} className="hover:text-indigo-300 transition-colors">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transition Table Matrix (Section 15) */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Structured Transition Table Matrix
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="p-2.5">Current State (q)</th>
                        <th className="p-2.5">Input Symbol (a)</th>
                        <th className="p-2.5">Stack Top (X)</th>
                        <th className="p-2.5">Next State (q')</th>
                        <th className="p-2.5">Stack Replacement (γ)</th>
                        <th className="p-2.5">Semantic Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      {pda.transitions.map((t, idx) => (
                        <tr key={idx} className="border-b border-slate-850 hover:bg-slate-950/60">
                          <td className="p-2.5 font-bold text-indigo-400">{t.from}</td>
                          <td className="p-2.5 text-cyan-300">{t.input}</td>
                          <td className="p-2.5 text-amber-300">{t.stackTop}</td>
                          <td className="p-2.5 font-bold text-indigo-300">{t.to}</td>
                          <td className="p-2.5 font-bold text-emerald-400">{t.stackReplacement}</td>
                          <td className="p-2.5 text-slate-400 font-sans text-xs">{t.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Computation Tree for NPDA (Section 12 & 13) */}
          {activeTab === 'computation_tree' && (
            <PDAComputationTreeView rootNode={computationTree} />
          )}

          {/* Tab 4: Equivalent Simplified PDA (Section 19, 20, 21) */}
          {activeTab === 'simplification' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Critical Mathematical Disclaimer (Section 19 & 21) */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 space-y-1.5 font-sans">
                <div className="flex items-center gap-2 font-bold text-indigo-400 text-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>Mathematical Note on PDA Minimization vs Simplification</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike Deterministic Finite Automata (DFA), <strong>Pushdown Automata do not possess a general, canonical minimal state algorithm</strong>. The equivalence problem for general NPDAs is undecidable. The pipeline below produces an <strong>equivalent simplified PDA</strong> by eliminating unreachable states, dead-end useless states, and redundant transitions while rigorously preserving language behavior.
                </p>
              </div>

              {/* Simplification Stats */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Original States</span>
                    <span className="text-lg font-bold text-slate-200">
                      {simplificationResult.originalStateCount} States
                    </span>
                  </div>
                  <div className="text-indigo-400 text-lg">→</div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Simplified States</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {simplificationResult.simplifiedStateCount} States
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  Language Equivalence Preserved
                </span>
              </div>

              {/* Reduction Log */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Simplification Pipeline Log
                </span>
                <div className="space-y-2">
                  {simplificationResult.reductionLog.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
