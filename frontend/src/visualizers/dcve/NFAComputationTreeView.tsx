import React from 'react';
import { GitBranch, CheckCircle2, XCircle, Skull, Play } from 'lucide-react';
import { SimulationStep } from '../../types/index.js';

interface NFAComputationTreeViewProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  acceptStates: string[];
  className?: string;
}

export const NFAComputationTreeView: React.FC<NFAComputationTreeViewProps> = ({
  steps,
  currentStepIndex,
  acceptStates,
  className = ''
}) => {
  const acceptSet = new Set(acceptStates);

  return (
    <div className={`p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 font-mono text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
            Nondeterministic Computation Tree (Section 9 & 21)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          Parallel Branch Exploration
        </span>
      </div>

      {/* Tree Levels by Step */}
      <div className="space-y-3 overflow-x-auto pb-2">
        {steps.map((step, sIdx) => {
          const isCurrent = sIdx === currentStepIndex;
          const isPast = sIdx < currentStepIndex;
          const isFuture = sIdx > currentStepIndex;

          const activeStates = Array.isArray(step.currentState)
            ? step.currentState
            : [step.currentState];

          const isDeadBranch = activeStates.length === 0;
          const hasAccepting = activeStates.some((s) => acceptSet.has(s));

          return (
            <div
              key={sIdx}
              className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                  : isPast
                  ? 'bg-slate-950/50 border-slate-800/80 opacity-85'
                  : 'bg-slate-950/20 border-slate-850 opacity-40'
              }`}
            >
              {/* Level header */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-300">Level {sIdx}:</span>
                  <span>Scanned: {step.currentSymbol ? `'${step.currentSymbol}'` : 'ε / Start'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Remaining: '{step.remainingInput || 'ε'}'</span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white font-bold text-[9px]">
                      CURRENT
                    </span>
                  )}
                </div>
              </div>

              {/* Active Nodes at this step */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {isDeadBranch ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-bold">
                    <Skull className="w-3.5 h-3.5" />
                    <span>Dead Branch (No transitions available on '{step.currentSymbol}')</span>
                  </div>
                ) : (
                  activeStates.map((st, nIdx) => {
                    const isAccept = acceptSet.has(st);
                    return (
                      <div
                        key={nIdx}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-transform ${
                          isAccept
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span>{st}</span>
                        {isAccept && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 rounded">
                            ACCEPT
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
