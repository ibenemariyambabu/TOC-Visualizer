import React from 'react';
import { Layers, ArrowDown, ArrowUp } from 'lucide-react';

interface PDAStackViewProps {
  stack: string[];
  currentState: string;
  currentSymbol: string | null;
  transitionRule?: string;
  explanation?: string;
}

export const PDAStackView: React.FC<PDAStackViewProps> = ({
  stack,
  currentState,
  currentSymbol,
  transitionRule,
  explanation
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Top Transition Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            PDA Pushdown Stack & Transition
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold">
            State: {currentState}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
            Reading: {currentSymbol || 'ε'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
            Stack Depth: {stack.length}
          </span>
        </div>
      </div>

      {/* Stack & Transition Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Animated Vertical Stack */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] uppercase font-mono font-bold text-amber-400 mb-1 flex items-center gap-1">
            <ArrowDown className="h-3 w-3 animate-bounce" />
            <span>Top of Stack</span>
          </div>

          <div className="w-36 min-h-[220px] max-h-[260px] overflow-y-auto p-2 bg-slate-950 border-2 border-t-0 border-amber-500/40 rounded-b-xl flex flex-col-reverse items-center gap-1.5 shadow-inner">
            {stack.length === 0 ? (
              <div className="text-xs font-mono text-slate-600 italic my-auto">Stack is Empty</div>
            ) : (
              stack.map((item, idx) => {
                const isTop = idx === stack.length - 1;
                const isBase = item === 'Z' || item === 'Z0';

                return (
                  <div
                    key={idx}
                    className={`w-full py-2 rounded-md flex items-center justify-center font-mono font-bold text-sm shadow transition-all ${
                      isTop
                        ? 'bg-amber-500/25 border border-amber-400 text-amber-200 scale-105'
                        : isBase
                        ? 'bg-slate-800 border border-slate-700 text-slate-400'
                        : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-200'
                    }`}
                  >
                    <span>{item}</span>
                    {isTop && (
                      <span className="ml-2 text-[9px] text-amber-300 uppercase font-sans font-semibold">
                        (TOP)
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">Stack Base</span>
        </div>

        {/* Transition Explanation Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Transition Function Applied
            </span>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-amber-300">
              {transitionRule || `δ(${currentState}, ${currentSymbol || 'ε'}, ${stack[stack.length - 1] || 'Z'})`}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              What happened to the Stack?
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {explanation || 'Stack stores count of symbols to ensure matching conditions.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
