import React, { useState } from 'react';
import { HelpCircle, Brain, AlertTriangle, Lightbulb, CheckCircle2, XCircle, ArrowRight, Layers, BookmarkPlus, Copy, Check } from 'lucide-react';
import { SimulationStep } from '../../types/index.js';

interface StepExplanationPanelProps {
  currentStepData?: SimulationStep;
  currentStepIndex: number;
  totalSteps: number;
  stateMeanings?: Record<string, string>;
  commonMistakes?: string[];
  memoryTip?: string;
  isAccepted?: boolean | null;
  ktuExamAnswer?: {
    twoMarks: string;
    fiveMarks: string;
    tenMarks: string;
  };
  onSave?: () => void;
}

export const StepExplanationPanel: React.FC<StepExplanationPanelProps> = ({
  currentStepData,
  currentStepIndex,
  totalSteps,
  stateMeanings,
  commonMistakes,
  memoryTip,
  isAccepted,
  ktuExamAnswer,
  onSave
}) => {
  const [showWhy, setShowWhy] = useState(false);
  const [activeExamTab, setActiveExamTab] = useState<'2' | '5' | '10'>('5');
  const [copied, setCopied] = useState(false);

  const currentStateName = currentStepData
    ? typeof currentStepData.currentState === 'string'
      ? currentStepData.currentState
      : currentStepData.currentState.join(', ')
    : 'q0';

  const currentMemoryMeaning = stateMeanings?.[currentStateName];

  const handleCopyExamAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Brain className="h-4 w-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Step-by-Step Logic & Explanation
          </h2>
        </div>

        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition-colors border border-slate-700"
            title="Save to My TOC Lab"
          >
            <BookmarkPlus className="h-3.5 w-3.5 text-amber-400" />
            <span>Save</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Step Badge & Current Action */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide">
              Step {currentStepIndex} of {totalSteps}
            </span>
            {isAccepted !== null && currentStepIndex === totalSteps && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                  isAccepted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isAccepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                <span>{isAccepted ? 'ACCEPTED' : 'REJECTED'}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              What happened?
            </h3>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {currentStepData?.explanation || 'Simulation initialized. Ready to process input string.'}
            </p>
          </div>

          {/* Machine State Snapshot Cards */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Current State</span>
              <span className="font-mono font-bold text-indigo-300 text-sm">{currentStateName}</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Read Symbol</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {currentStepData?.currentSymbol ?? 'None (Start)'}
              </span>
            </div>
          </div>
        </div>

        {/* The Core Pedagogical "WHY?" Button (Section 9 Requirement) */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Conceptual Reason
              </span>
            </div>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all active:scale-95"
            >
              {showWhy ? 'Hide WHY?' : 'Click WHY?'}
            </button>
          </div>

          {showWhy ? (
            <div className="pt-2 text-xs text-slate-300 space-y-2 border-t border-indigo-500/20 animate-in fade-in">
              <p className="leading-relaxed font-normal">
                {currentStepData?.transitionUsed?.explanation ||
                  currentStepData?.explanation ||
                  'The automaton transitions deterministically according to the language invariant being tracked by the state.'}
              </p>
              {currentMemoryMeaning && (
                <p className="text-indigo-300 font-medium">
                  State Meaning: "{currentMemoryMeaning}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Click the button above to understand WHY this specific transition was taken instead of memorizing it.
            </p>
          )}
        </div>

        {/* "What Are We Remembering?" Feature (Section 10 Requirement) */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Memory of the Automaton</span>
          </div>

          {currentMemoryMeaning ? (
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200">
              <span className="font-bold text-cyan-400 block mb-0.5">State {currentStateName}:</span>
              "{currentMemoryMeaning}"
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Each state encodes a specific equivalence condition of the language read so far.
            </p>
          )}
        </div>

        {/* Common Mistakes & Memory Tips */}
        {(commonMistakes && commonMistakes.length > 0) || memoryTip ? (
          <div className="space-y-3 pt-2">
            {memoryTip && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-300 mb-0.5">Memory Trick / Shortcut:</span>
                  <span>{memoryTip}</span>
                </div>
              </div>
            )}

            {commonMistakes && commonMistakes.length > 0 && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1 text-xs text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Common Student Mistake</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
                  {commonMistakes.map((mistake, idx) => (
                    <li key={idx}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* KTU Exam Answer Generator (Section 24 Requirement) */}
        {ktuExamAnswer && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>KTU Exam Answer</span>
              </div>
              <div className="flex gap-1">
                {(['2', '5', '10'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveExamTab(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                      activeExamTab === m
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap relative group">
              {activeExamTab === '2' && ktuExamAnswer.twoMarks}
              {activeExamTab === '5' && ktuExamAnswer.fiveMarks}
              {activeExamTab === '10' && ktuExamAnswer.tenMarks}

              <button
                onClick={() =>
                  handleCopyExamAnswer(
                    activeExamTab === '2'
                      ? ktuExamAnswer.twoMarks
                      : activeExamTab === '5'
                      ? ktuExamAnswer.fiveMarks
                      : ktuExamAnswer.tenMarks
                  )
                }
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy Exam Answer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
