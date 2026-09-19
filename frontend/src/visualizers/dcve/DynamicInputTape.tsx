import React from 'react';
import { Check, ArrowUp, Sparkles } from 'lucide-react';

interface DynamicInputTapeProps {
  inputString: string;
  consumedLength: number;
  currentSymbol?: string;
  alphabet?: string[];
  onSelectPosition?: (index: number) => void;
  className?: string;
}

export const DynamicInputTape: React.FC<DynamicInputTapeProps> = ({
  inputString,
  consumedLength,
  currentSymbol,
  alphabet = ['0', '1'],
  onSelectPosition,
  className = ''
}) => {
  // Tokenize input string (handles multi-character tokens if applicable or standard single characters)
  const tokens = inputString ? inputString.split('') : [];
  const isEpsilon = tokens.length === 0;

  return (
    <div className={`p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 font-mono ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Input Tape Tokens
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
            Length: {tokens.length}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Consumed ({Math.min(consumedLength, tokens.length)})
          </span>
          <span className="flex items-center gap-1 text-indigo-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Active Head
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-700" /> Remaining ({Math.max(0, tokens.length - consumedLength)})
          </span>
        </div>
      </div>

      {/* Tape Cells View */}
      {isEpsilon ? (
        <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
          <div className="px-3 py-1.5 rounded bg-purple-950/40 border border-purple-800/60 text-purple-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ε (Empty String)</span>
          </div>
          <span className="text-slate-400 text-xs">
            Zero input tokens consumed. Machine operates exclusively on initial state and spontaneous ε-transitions.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto pb-1.5 pt-1">
          <div className="flex items-center gap-1.5 min-w-max">
            {tokens.map((token, idx) => {
              const isConsumed = idx < consumedLength;
              const isCurrent = idx === consumedLength;
              const isPending = idx > consumedLength;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  {/* Tape Cell */}
                  <button
                    onClick={() => onSelectPosition && onSelectPosition(idx)}
                    disabled={!onSelectPosition}
                    className={`relative w-10 h-11 flex items-center justify-center rounded-lg text-sm font-bold font-mono transition-all select-none border ${
                      isCurrent
                        ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105 z-10'
                        : isConsumed
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                    title={`Token [${idx}]: '${token}' (${isConsumed ? 'Consumed' : isCurrent ? 'Active Scanned Token' : 'Pending'})`}
                  >
                    {isConsumed && (
                      <Check className="w-3 h-3 text-emerald-400 absolute top-1 right-1 opacity-70" />
                    )}
                    <span>{token}</span>
                  </button>

                  {/* Indicator Arrow */}
                  <div className="h-4 flex items-center justify-center">
                    {isCurrent && (
                      <div className="flex flex-col items-center animate-bounce text-indigo-400">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Index badge */}
                  <span className={`text-[9px] font-mono ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>
                    {idx}
                  </span>
                </div>
              );
            })}

            {/* End of Input Marker */}
            <div className="flex flex-col items-center gap-1 pl-2 border-l border-slate-800">
              <div className={`w-10 h-11 flex items-center justify-center rounded-lg border text-xs font-mono font-bold select-none ${
                consumedLength >= tokens.length
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600'
              }`}>
                EOF
              </div>
              <div className="h-4 flex items-center justify-center">
                {consumedLength >= tokens.length && (
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                )}
              </div>
              <span className="text-[9px] text-slate-600">End</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
