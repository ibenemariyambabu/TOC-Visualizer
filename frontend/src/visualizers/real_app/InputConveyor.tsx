import React from 'react';
import { Tokenizer } from '../../algorithms/common/tokenizer.js';
import { ArrowDown, Check, Disc, Eye, Zap } from 'lucide-react';

interface InputConveyorProps {
  inputString: string;
  consumedLength: number;
  currentSymbol?: string;
  alphabet: string[];
  onSelectPosition?: (index: number) => void;
  className?: string;
}

export const InputConveyor: React.FC<InputConveyorProps> = ({
  inputString,
  consumedLength,
  currentSymbol,
  alphabet,
  onSelectPosition,
  className = ''
}) => {
  const isEpsilon = Tokenizer.isEpsilon(inputString) || inputString.trim() === '';
  const tokens = isEpsilon ? [] : Tokenizer.tokenizeInputString(inputString, alphabet);

  return (
    <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono ${className}`}>
      {/* Header telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-850 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <span className="font-bold text-slate-200 tracking-wider uppercase text-[11px]">
            Input Conveyor & Optical Scanner
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            Stream Length: <strong className="text-slate-200">{tokens.length}</strong>
          </span>
          <span>
            Consumed: <strong className="text-emerald-400">{Math.min(consumedLength, tokens.length)}</strong>
          </span>
          <span>
            Remaining: <strong className="text-cyan-400">{Math.max(0, tokens.length - consumedLength)}</strong>
          </span>
        </div>
      </div>

      {/* Physical Conveyor Track */}
      <div className="relative pt-6 pb-3 overflow-x-auto">
        {/* Scanner Head Assembly positioned above current index */}
        <div className="relative min-w-max flex items-end gap-2 px-6">
          {isEpsilon ? (
            <div className="flex items-center gap-3 py-3 px-5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs">
              <Disc className="h-4 w-4 animate-spin text-purple-400" />
              <span>
                <strong>EMPTY INPUT STREAM (ε)</strong> — Machine starts and halts immediately at initial configuration.
              </span>
            </div>
          ) : (
            tokens.map((token, idx) => {
              const isConsumed = idx < consumedLength;
              const isCurrent = idx === consumedLength;

              return (
                <div key={idx} className="flex flex-col items-center group">
                  {/* Optical Scanner Reticle */}
                  {isCurrent && (
                    <div className="flex flex-col items-center -mt-6 mb-1.5 animate-bounce text-amber-400">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 uppercase tracking-wider whitespace-nowrap">
                        ▼ SCANNER
                      </span>
                    </div>
                  )}

                  {/* Token Carriage Cart */}
                  <button
                    onClick={() => onSelectPosition && onSelectPosition(idx)}
                    title={`Token [${idx}]: '${token}' (${isConsumed ? 'Consumed' : isCurrent ? 'Active Under Scanner' : 'Queued'})`}
                    className={`relative w-12 h-14 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400/50'
                        : isConsumed
                        ? 'bg-slate-900/60 border-emerald-500/40 text-slate-500 hover:text-slate-300'
                        : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {/* Index Marker */}
                    <span className="absolute top-1 left-1.5 text-[8px] text-slate-500 font-bold">
                      #{idx}
                    </span>

                    {/* Consumed status checkmark */}
                    {isConsumed && (
                      <span className="absolute top-1 right-1.5 text-emerald-400">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Token Value */}
                    <span
                      className={`text-base font-bold ${
                        isCurrent
                          ? 'text-amber-200 font-extrabold scale-110'
                          : isConsumed
                          ? 'text-slate-500 line-through'
                          : 'text-slate-100'
                      }`}
                    >
                      {token}
                    </span>

                    {/* Conveyor Wheels */}
                    <div className="absolute -bottom-1.5 flex gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full border ${isCurrent ? 'bg-amber-400 border-amber-300' : 'bg-slate-800 border-slate-700'}`} />
                      <div className={`h-1.5 w-1.5 rounded-full border ${isCurrent ? 'bg-amber-400 border-amber-300' : 'bg-slate-800 border-slate-700'}`} />
                    </div>
                  </button>

                  {/* Belt track tick mark */}
                  <div className="h-2 w-0.5 bg-slate-800 mt-2" />
                </div>
              );
            })
          )}

          {/* End of Stream / Ejection Chute */}
          {!isEpsilon && (
            <div className="flex flex-col items-center pl-2">
              <div
                className={`w-14 h-14 rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] font-bold ${
                  consumedLength >= tokens.length
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <span>⊣ EOF</span>
                <span className="text-[8px] opacity-75">EXHAUST</span>
              </div>
              <div className="h-2 w-0.5 bg-slate-800 mt-2" />
            </div>
          )}
        </div>

        {/* Industrial Conveyor Belt Rails */}
        <div className="h-1.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-full border border-slate-700/60 mt-1 mx-2" />
      </div>
    </div>
  );
};
