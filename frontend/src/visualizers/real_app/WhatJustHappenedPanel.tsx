import React from 'react';
import { ComputationStep } from '../dcve/types.js';
import { HelpCircle, ArrowRight, Layers, Cpu, CornerDownRight, CheckCircle2, XCircle } from 'lucide-react';

interface WhatJustHappenedPanelProps {
  currentStep: ComputationStep;
  stepIndex: number;
  totalSteps: number;
  className?: string;
}

export const WhatJustHappenedPanel: React.FC<WhatJustHappenedPanelProps> = ({
  currentStep,
  stepIndex,
  totalSteps,
  className = ''
}) => {
  const diff = currentStep?.diff;
  const rule = currentStep?.ruleApplied;
  const stateFrom = rule?.components?.stateFrom || (typeof currentStep?.before?.currentState === 'string' ? currentStep.before.currentState : 'q0');
  const stateTo = rule?.components?.stateTo || (typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : 'q0');
  const symbolRead = currentStep?.event?.symbol || rule?.components?.symbolRead || 'ε';

  return (
    <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            What Just Happened? (Operational Diff)
          </span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase">
          Step {stepIndex} of {totalSteps}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Visual State Transition Pill */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-slate-400 font-bold">STATE TRANSITION</span>
            {currentStep.status === 'accepted' ? (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> ACCEPTED
              </span>
            ) : currentStep.status === 'rejected' ? (
              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                <XCircle className="h-3 w-3" /> REJECTED
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
              {stateFrom}
            </span>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <span>read '{symbolRead}'</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
              {stateTo}
            </span>
          </div>
        </div>

        {/* Applied Rule Breakdown */}
        {rule && (
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">
              APPLIED FORMAL RULE
            </span>
            <div className="text-cyan-300 font-bold font-mono">
              {rule.formula}
            </div>
            <p className="text-slate-400 font-sans text-xs">
              {rule.explanation}
            </p>
          </div>
        )}

        {/* Memory Diff: Stack or Tape */}
        {diff && (diff.stackChanged || diff.tapeChanged) && (
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 space-y-1">
            <span className="text-[10px] uppercase text-amber-400 font-bold block">
              MEMORY MUTATION
            </span>
            {diff.stackChanged && (
              <div className="text-slate-300 flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>
                  Stack: <strong>[{diff.stackChanged.from.join(', ') || '∅'}]</strong> →{' '}
                  <strong className="text-emerald-300">[{diff.stackChanged.to.join(', ') || '∅'}]</strong> ({diff.stackChanged.action})
                </span>
              </div>
            )}
            {diff.tapeChanged && (
              <div className="text-slate-300 flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>
                  Tape Cell #{diff.tapeChanged.cellIndex}: '{diff.tapeChanged.from}' →{' '}
                  <strong className="text-emerald-300">'{diff.tapeChanged.to}'</strong> | Head: #{diff.tapeChanged.headFrom} → #{diff.tapeChanged.headTo} ({diff.tapeChanged.moveDir})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Why Did This Happen Reason */}
        {currentStep.why && (
          <div className="pt-2 border-t border-slate-850">
            <span className="text-[10px] uppercase text-indigo-400 font-bold block mb-1">
              MATHEMATICAL JUSTIFICATION
            </span>
            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              {currentStep.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
