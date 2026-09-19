import React from 'react';
import { RealAppProps } from '../types.js';
import { Factory, Cog, ArrowRight, CheckCircle2, Box, Layers } from 'lucide-react';

export const NFAToDFAFactory: React.FC<RealAppProps> = ({
  model,
  currentStep,
  stepIndex,
  computationSteps
}) => {
  const currentState = currentStep?.after?.currentState;
  const states: string[] = model?.states || [];

  return (
    <div className="p-5 rounded-2xl bg-stone-950 border border-orange-900/40 space-y-5 font-mono text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-900/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Factory className="h-5 w-5 animate-pulse text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Machine Conversion & Subset Assembly Factory
            </h3>
            <p className="text-xs text-orange-400/80 font-sans">
              Real-World Application: Subset Construction compiling non-deterministic branching into sealed deterministic modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Assembly Status:</span>
          <span className="px-3 py-1 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs">
            SUBSET COMPILATION ACTIVE
          </span>
        </div>
      </div>

      {/* Assembly Chamber Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-8 p-4 rounded-xl bg-stone-900/80 border border-orange-900/40 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cog className="h-4 w-4 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
              Active Subset Manufacturing Chamber
            </span>
            <span className="text-[10px] text-stone-400">
              Power Set Space: 2^|Q| = <strong>{Math.pow(2, states.length)}</strong> Max Subsets
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-950 border border-orange-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Manufactured DFA State Module:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                DETERMINISTIC
              </span>
            </div>

            <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-400 text-center font-bold text-base text-orange-200 shadow-md">
              &#123;{Array.isArray(currentState) ? currentState.join(', ') : typeof currentState === 'string' ? currentState : 'q0'}&#125;
            </div>

            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              In this conversion stage, the NFA's simultaneous branches are encapsulated into a single unified DFA state unit. Any future incoming input transitions will update this entire subset deterministically.
            </p>
          </div>
        </div>

        {/* Factory Output Ledger (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-stone-900/80 border border-orange-900/40 space-y-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            MANUFACTURED STATES
          </span>

          <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
            {states.map((st, idx) => (
              <div key={st} className="flex justify-between items-center p-2 rounded bg-stone-950 border border-stone-800 text-stone-300">
                <span className="font-bold text-orange-300">{st}</span>
                <span className="text-[10px] text-stone-500">Sub-Module #{idx + 1}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-stone-400 text-center font-sans">
            Every manufactured DFA state represents a verified subset of NFA states.
          </div>
        </div>
      </div>
    </div>
  );
};
