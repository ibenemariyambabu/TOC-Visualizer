import React, { useMemo } from 'react';
import { AutomatonData, PDAData, TMData } from '../../types/index.js';
import { Grid, Sparkles, Table as TableIcon } from 'lucide-react';

interface MachineMatrixProps {
  machineType: 'DFA' | 'NFA' | 'PDA' | 'TM';
  model: AutomatonData | PDAData | TMData | any;
  currentState?: string | string[];
  currentSymbol?: string | null;
  activeTransition?: { from: string; to: string; input?: string } | null;
  onCellClick?: (from: string, input: string, to?: string) => void;
  className?: string;
}

export const MachineMatrix: React.FC<MachineMatrixProps> = ({
  machineType,
  model,
  currentState,
  currentSymbol,
  activeTransition,
  onCellClick,
  className = ''
}) => {
  const states: string[] = useMemo(() => model?.states || [], [model]);
  const alphabet: string[] = useMemo(() => {
    if (machineType === 'PDA' && model?.inputAlphabet) return model.inputAlphabet;
    if (machineType === 'TM' && (model?.tapeAlphabet || model?.inputAlphabet)) return model.tapeAlphabet || model.inputAlphabet;
    return model?.alphabet || [];
  }, [machineType, model]);

  // Matrix cells map: state -> symbol -> destination(s)
  const matrixData = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};

    for (const st of states) {
      map[st] = {};
      for (const sym of alphabet) {
        map[st][sym] = '-';
      }
    }

    if (machineType === 'DFA' || machineType === 'NFA') {
      const transitions = model?.transitions || [];
      for (const t of transitions) {
        if (!map[t.from]) map[t.from] = {};
        if (map[t.from][t.input] && map[t.from][t.input] !== '-') {
          map[t.from][t.input] += `, ${t.to}`;
        } else {
          map[t.from][t.input] = t.to;
        }
      }
    } else if (machineType === 'PDA') {
      const transitions = model?.transitions || [];
      for (const t of transitions) {
        if (!map[t.from]) map[t.from] = {};
        const dest = `(${t.to}, ${t.stackReplacement || 'ε'})`;
        map[t.from][t.input] = map[t.from][t.input] && map[t.from][t.input] !== '-' ? `${map[t.from][t.input]}, ${dest}` : dest;
      }
    } else if (machineType === 'TM') {
      const transitions = model?.transitions || [];
      for (const t of transitions) {
        if (!map[t.currentState]) map[t.currentState] = {};
        const dest = `(${t.nextState}, ${t.writeSymbol}, ${t.direction})`;
        map[t.currentState][t.readSymbol] = dest;
      }
    }

    return map;
  }, [machineType, model, states, alphabet]);

  const currStStr = typeof currentState === 'string' ? currentState : Array.isArray(currentState) ? currentState.join(',') : '';

  return (
    <div className={`p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <div className="flex items-center gap-2">
          <Grid className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Machine Transition Matrix (Q × Σ → Q)
          </span>
        </div>
        <span className="text-[10px] text-slate-500 uppercase">Interactive Matrix Sync</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 text-slate-400">
              <th className="p-2 font-bold text-slate-500 uppercase text-[10px] bg-slate-900/60 sticky left-0 z-10">
                State \ Symbol
              </th>
              {alphabet.map((sym) => (
                <th
                  key={sym}
                  className={`p-2 text-center font-bold text-[11px] transition-colors ${
                    currentSymbol === sym ? 'text-amber-400 bg-amber-500/10' : 'text-cyan-300'
                  }`}
                >
                  '{sym}'
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map((st) => {
              const isCurrentRow = currStStr === st || (Array.isArray(currentState) && currentState.includes(st));

              return (
                <tr
                  key={st}
                  className={`border-b border-slate-850/80 transition-colors ${
                    isCurrentRow ? 'bg-indigo-950/30' : 'hover:bg-slate-900/40'
                  }`}
                >
                  {/* Row State Header */}
                  <td
                    className={`p-2 font-bold sticky left-0 z-10 flex items-center gap-1.5 transition-colors ${
                      isCurrentRow ? 'text-amber-300 bg-slate-900 font-extrabold' : 'text-indigo-400 bg-slate-950'
                    }`}
                  >
                    {isCurrentRow && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />}
                    <span>{st}</span>
                    {st === (model.startState || 'q0') && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                        START
                      </span>
                    )}
                    {((model.acceptStates && model.acceptStates.includes(st)) || model.acceptState === st) && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 font-normal border border-emerald-800/40">
                        FINAL
                      </span>
                    )}
                  </td>

                  {/* Columns */}
                  {alphabet.map((sym) => {
                    const cellVal = matrixData[st]?.[sym] || '-';
                    const isCellActive =
                      isCurrentRow &&
                      currentSymbol === sym &&
                      cellVal !== '-';

                    const isHighlightTransition =
                      activeTransition &&
                      activeTransition.from === st &&
                      (activeTransition.input === sym || !activeTransition.input);

                    return (
                      <td
                        key={sym}
                        onClick={() => cellVal !== '-' && onCellClick && onCellClick(st, sym, cellVal)}
                        className={`p-2 text-center transition-all ${
                          cellVal !== '-' ? 'cursor-pointer hover:font-bold' : 'cursor-default text-slate-700'
                        } ${
                          isCellActive
                            ? 'bg-amber-500/20 text-amber-200 font-extrabold ring-1 ring-amber-400/80 shadow-sm'
                            : isHighlightTransition
                            ? 'bg-indigo-600/30 text-indigo-200 font-bold ring-1 ring-indigo-400'
                            : cellVal !== '-'
                            ? 'text-slate-300 hover:text-white hover:bg-slate-850'
                            : ''
                        }`}
                        title={
                          cellVal !== '-'
                            ? `δ(${st}, '${sym}') = ${cellVal} (Click to inspect / highlight)`
                            : `No transition defined for δ(${st}, '${sym}')`
                        }
                      >
                        {cellVal}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
