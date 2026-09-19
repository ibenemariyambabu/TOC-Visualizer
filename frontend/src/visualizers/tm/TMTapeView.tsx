import React from 'react';
import { ArrowDown, HelpCircle, FastForward } from 'lucide-react';

interface TMTapeViewProps {
  tape: string[];
  headPosition: number;
  currentState: string;
  currentSymbol: string;
  transitionRule?: string;
  stepNumber: number;
}

export const TMTapeView: React.FC<TMTapeViewProps> = ({
  tape,
  headPosition,
  currentState,
  currentSymbol,
  transitionRule,
  stepNumber
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      {/* TM Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
            TM State: {currentState}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
            Head reads: '{currentSymbol}'
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
            Step: {stepNumber}
          </span>
        </div>

        {transitionRule && (
          <div className="px-3 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300">
            {transitionRule}
          </div>
        )}
      </div>

      {/* Infinite Bi-directional Tape Visualization */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500 mb-2">
          <span>← Infinite Left Blank Cells (□)</span>
          <span className="text-amber-400 font-bold">Turing Machine Infinite Tape</span>
          <span>Infinite Right Blank Cells (□) →</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-3 min-w-max">
          {tape.map((sym, idx) => {
            const isHead = idx === headPosition;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Movable Tape Head Pointer */}
                <div className="h-5 flex items-center justify-center">
                  {isHead && <ArrowDown className="h-5 w-5 text-rose-400 animate-bounce" />}
                </div>

                {/* Tape Cell */}
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-base border transition-all ${
                    isHead
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-lg shadow-rose-500/25 scale-110'
                      : sym === '□'
                      ? 'bg-slate-950 border-slate-850 text-slate-600'
                      : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  {sym}
                </div>

                {/* Cell coordinate */}
                <span className="text-[9px] font-mono text-slate-600 mt-1">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 8 Invariant Questions (TM Design Method - Section 3 requirement) */}
      <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 text-xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Turing Machine Design Invariant Check</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
          <div>1. Marked symbol: X, Y, Z</div>
          <div>2. Head sweep: L ↔ R passes</div>
          <div>3. Accept invariant: all symbols balanced</div>
          <div>4. Reject condition: premature blank or mismatch</div>
        </div>
      </div>
    </div>
  );
};
