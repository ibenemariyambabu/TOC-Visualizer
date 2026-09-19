import React, { useState, useEffect } from 'react';
import { TMTapeView } from '../../visualizers/tm/TMTapeView.js';
import { TMDiagramView } from '../../visualizers/tm/TMDiagramView.js';
import { DCVELabWrapper } from '../../visualizers/dcve/DCVELabWrapper.js';
import { VisualizerControls } from '../../visualizers/shared/VisualizerControls.js';
import { TMEngine } from '../../algorithms/tm/tmEngine.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { TMData, SimulationResult } from '../../types/index.js';
import { Binary, Play, RotateCcw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const TMLab: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(
    'Construct a Turing Machine for L = { 0^n 1^n | n >= 1 }'
  );
  const [currentAlphabet, setCurrentAlphabet] = useState<string[]>(['0', '1']);
  const [inputString, setInputString] = useState('0011');
  const [tm, setTm] = useState<TMData>(() => TMEngine.getZeroNOneNTM());
  const [simulation, setSimulation] = useState<SimulationResult>(() =>
    TMEngine.simulate(TMEngine.getZeroNOneNTM(), '0011')
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');

  const handleSimulateInput = (newStr: string) => {
    setInputString(newStr);
    const sim = TMEngine.simulate(tm, newStr);
    setSimulation(sim);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const tmPresets = [
    {
      label: '0^n 1^n (Binary)',
      question: 'Construct a Turing Machine for L = { 0^n 1^n | n >= 1 }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'a^n b^n c^n (Non-CFL)',
      question: 'Construct a Turing Machine for L = { a^n b^n c^n | n >= 1 }',
      alphabet: ['a', 'b', 'c'],
      testString: 'aabbcc'
    },
    {
      label: 'Palindromes w w^R',
      question: 'Construct a Turing Machine recognizing palindromes',
      alphabet: ['a', 'b'],
      testString: 'abba'
    },
    {
      label: 'Binary Incrementer',
      question: 'Design a Turing Machine that increments a binary number by 1',
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
    setInputString(data.testString);

    try {
      const q = data.question.toLowerCase();
      let targetTm: TMData;

      if (q.includes('increment') || q.includes('binary increment')) {
        targetTm = TMEngine.getBinaryIncrementTM();
      } else if (q.includes('palindrome')) {
        targetTm = TMEngine.getPalindromeTM();
      } else if (q.includes('0^n1^n') || q.includes('0^n 1^n') || data.alphabet.includes('0')) {
        targetTm = TMEngine.getZeroNOneNTM();
      } else {
        targetTm = TMEngine.getAnBnCnTM();
      }

      setTm(targetTm);
      const sim = TMEngine.simulate(targetTm, data.testString);
      setSimulation(sim);
      setStepIndex(0);
      setIsPlaying(false);

      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`
      );
    } finally {
      setIsSolving(false);
    }
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Turing Machine Lab</h2>
          <p className="text-xs text-slate-400 mt-1">
            Infinite Tape, Read/Write Head, Bidirectional Movement, and Invariant Verification (KTU 2024 Scheme)
          </p>
        </div>
      </div>

      {/* Reusable Question Workspace */}
      <QuestionWorkspace
        moduleName="Turing Machine"
        initialQuestion={currentQuestion}
        initialAlphabet={currentAlphabet}
        initialTestString={inputString}
        presets={tmPresets}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      {/* Dynamic Computational Visualization Engine (DCVE) */}
      <DCVELabWrapper
        machineType="TM"
        model={tm}
        simulationResult={simulation}
        inputString={inputString}
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
        onSimulateInput={handleSimulateInput}
        diagramSlot={
          <TMDiagramView
            tm={tm}
            activeState={
              typeof currentStep?.currentState === 'string' ? currentStep.currentState : 'q0'
            }
            highlightTransition={
              currentStep?.transitionUsed
                ? {
                    from: currentStep.transitionUsed.from,
                    to: currentStep.transitionUsed.to,
                    readSymbol: currentStep.transitionUsed.input
                  }
                : undefined
            }
            questionText={currentQuestion}
          />
        }
        memorySlot={
          <TMTapeView
            tape={currentStep?.tape || ['0', '1', '□']}
            headPosition={currentStep?.headPosition || 0}
            currentState={
              typeof currentStep?.currentState === 'string' ? currentStep.currentState : 'q0'
            }
            currentSymbol={currentStep?.currentSymbol || (currentAlphabet[0] || '0')}
            transitionRule={currentStep?.transitionUsed?.explanation}
            stepNumber={stepIndex}
          />
        }
        alphabet={currentAlphabet}
        questionText={currentQuestion}
      />

        {/* Formal TM 7-Tuple & Transition Table */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
          <span className="text-indigo-400 font-bold uppercase block text-xs">
            Formal 7-Tuple Specification: M = (Q, Σ, Γ, δ, q0, B, F)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div><strong>States Q:</strong> &#123;{tm.states.join(', ')}&#125;</div>
            <div><strong>Input Σ:</strong> &#123;{tm.inputAlphabet.join(', ')}&#125;</div>
            <div><strong>Tape Γ:</strong> &#123;{tm.tapeAlphabet.join(', ')}&#125;</div>
            <div><strong>Blank B:</strong> '{tm.blankSymbol}' | <strong>Accept:</strong> {tm.acceptState}</div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-bold block mb-1">
              Transition Function δ(q, X) → (q', Y, D):
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
              {tm.transitions.map((t, idx) => (
                <div key={idx} className="flex justify-between text-slate-400 border-b border-slate-850 py-0.5">
                  <span>δ({t.currentState}, '{t.readSymbol}')</span>
                  <span className="text-indigo-300 font-bold">
                    → ({t.nextState}, '{t.writeSymbol}', {t.direction})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};
