import React, { useState } from 'react';
import {
  ComputationStep,
  StepDiff,
  FormalRule,
  DCVEViewMode
} from './types.js';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Brain,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  Code2
} from 'lucide-react';

interface StepAnatomyPanelProps {
  currentStep?: ComputationStep;
  stepIndex: number;
  totalSteps: number;
  viewMode?: DCVEViewMode;
  showMathematicsDefault?: boolean;
  onToggleMathematics?: (show: boolean) => void;
  className?: string;
}

export const StepAnatomyPanel: React.FC<StepAnatomyPanelProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  viewMode = 'LAB',
  showMathematicsDefault = true,
  onToggleMathematics,
  className = ''
}) => {
  const [showMath, setShowMath] = useState<boolean>(showMathematicsDefault);
  const [showWhyAccordion, setShowWhyAccordion] = useState<boolean>(true);

  const toggleMath = () => {
    const next = !showMath;
    setShowMath(next);
    if (onToggleMathematics) onToggleMathematics(next);
  };

  if (!currentStep) {
    return (
      <div className={`p-5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs text-center font-mono ${className}`}>
        No active computation step. Press 'Play' or 'Next' to begin simulation.
      </div>
    );
  }

  const isAccepted = currentStep.status === 'accepted';
  const isRejected = currentStep.status === 'rejected';
  const isComplete = isAccepted || isRejected;

  const currentState = typeof currentStep.after.currentState === 'string'
    ? currentStep.after.currentState
    : currentStep.after.currentState.join(', ');

  const prevState = typeof currentStep.before.currentState === 'string'
    ? currentStep.before.currentState
    : currentStep.before.currentState.join(', ');

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-0 ${className}`}>
      {/* 1. Header Bar with Step Badge, Status, and Math Toggle */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>STEP {stepIndex} / {totalSteps}</span>
          </div>

          {isComplete && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs ${
                isAccepted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{isAccepted ? '✓ ACCEPTED' : '✕ REJECTED'}</span>
            </div>
          )}
        </div>

        {/* Show Mathematics Toggle (Section 51) */}
        <button
          onClick={toggleMath}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
            showMath
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle formal mathematical formulas vs visual explanation"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{showMath ? 'Math: Formal δ' : 'Math: Intuitive'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4 font-mono text-xs">
        {/* 2. Three-Column Anatomy Grid: Event | Current Configuration | Rule Applied */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column A: Input Event */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              1. Input Event
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Read:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                {currentStep.event.symbol ? `'${currentStep.event.symbol}'` : 'ε (none)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              <span>Remaining: </span>
              <strong className="text-slate-200">'{currentStep.after.remainingInput || 'ε'}'</strong>
            </div>
          </div>

          {/* Column B: Current Configuration */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              2. Current Configuration
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">State:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700 text-indigo-200 font-bold">
                {currentState}
              </span>
            </div>
            {currentStep.after.instantaneousDescription && (
              <div className="text-[11px] text-slate-300 truncate" title={currentStep.after.instantaneousDescription}>
                <span className="text-slate-500">ID: </span>
                <span className="text-cyan-300 font-bold">{currentStep.after.instantaneousDescription}</span>
              </div>
            )}
          </div>

          {/* Column C: Rule Applied */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              3. Rule Applied
            </span>
            <div className="text-indigo-300 font-bold text-[11px] truncate" title={currentStep.ruleApplied.formula}>
              {currentStep.ruleApplied.formula}
            </div>
            <p className="text-[10px] text-slate-400 font-sans line-clamp-2">
              {currentStep.ruleApplied.explanation}
            </p>
          </div>
        </div>

        {/* 3. "What Changed?" Compact Diff Panel (Section 50) */}
        <div className="p-3 rounded-lg bg-slate-950/90 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>What Changed? (Mathematical Diff)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {/* State diff */}
            <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="text-slate-500">State:</span>
              <span className="text-slate-400">{prevState}</span>
              <ArrowRight className="w-3 h-3 text-indigo-400" />
              <span className="text-emerald-400 font-bold">{currentState}</span>
            </div>

            {/* Input diff */}
            {currentStep.event.symbol && (
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <span className="text-slate-500">Consumed:</span>
                <span className="text-amber-300 font-bold">'{currentStep.event.symbol}'</span>
              </div>
            )}

            {/* Stack diff if applicable */}
            {currentStep.diff.stackChanged && currentStep.diff.stackChanged.action !== 'NONE' && (
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <span className="text-slate-500">Stack:</span>
                <span className={`font-bold ${
                  currentStep.diff.stackChanged.action === 'PUSH' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {currentStep.diff.stackChanged.action} ({currentStep.diff.stackChanged.symbols.join('')})
                </span>
              </div>
            )}

            {/* Tape diff if applicable */}
            {currentStep.diff.tapeChanged && (
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <span className="text-slate-500">Tape[{currentStep.diff.tapeChanged.cellIndex}]:</span>
                <span className="text-amber-300">{currentStep.diff.tapeChanged.from} ➔ {currentStep.diff.tapeChanged.to}</span>
                <span className="text-slate-500">({currentStep.diff.tapeChanged.moveDir})</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. "Why Did This Happen?" Accordion (Section 49) */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
          <button
            onClick={() => setShowWhyAccordion(!showWhyAccordion)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Why did this transition occur?</span>
            </div>
            <span className="text-[10px] text-slate-500">{showWhyAccordion ? 'Hide' : 'Explain'}</span>
          </button>

          {showWhyAccordion && (
            <p className="text-xs font-sans text-slate-300 leading-relaxed pt-1.5 border-t border-slate-850">
              {currentStep.why}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
