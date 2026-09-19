import React, { useState } from 'react';
import { Play, Plus, CheckCircle2, XCircle, ArrowDown } from 'lucide-react';
import { TestResult } from '../../types/index.js';

interface TapeStringSimulatorProps {
  inputString: string;
  consumedLength: number;
  onSimulateString: (str: string) => void;
  testCases?: TestResult[];
  onAddTestCase?: (str: string) => void;
}

export const TapeStringSimulator: React.FC<TapeStringSimulatorProps> = ({
  inputString,
  consumedLength,
  onSimulateString,
  testCases,
  onAddTestCase
}) => {
  const [customInput, setCustomInput] = useState('');
  const [newTestInput, setNewTestInput] = useState('');

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput !== undefined) {
      onSimulateString(customInput);
    }
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTestCase && newTestInput.trim()) {
      onAddTestCase(newTestInput.trim());
      setNewTestInput('');
    }
  };

  const chars = inputString.length > 0 ? inputString.split('') : ['ε'];

  return (
    <div className="space-y-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
      {/* String Input and Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleTestSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter test string (e.g. aabb, ab, ba)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Trace</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 text-[11px]">Presets:</span>
          {['ab', 'aab', 'ba', 'abb', 'aba', 'bbab'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setCustomInput(preset);
                onSimulateString(preset);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Horizontal Tape */}
      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg overflow-x-auto">
        <div className="text-[10px] uppercase font-mono font-semibold text-slate-500 mb-2 flex items-center justify-between">
          <span>Input Tape & Reading Head</span>
          <span>Length: {inputString.length} symbols</span>
        </div>

        <div className="flex items-center justify-center gap-1 min-w-max py-2">
          {chars.map((ch, idx) => {
            const isConsumed = idx < consumedLength;
            const isCurrent = idx === consumedLength;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Reading Head Pointer Arrow */}
                <div className="h-4 flex items-center justify-center">
                  {isCurrent && (
                    <ArrowDown className="h-4 w-4 text-amber-400 animate-bounce" />
                  )}
                </div>

                {/* Tape Cell */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm border transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20 scale-105'
                      : isConsumed
                      ? 'bg-slate-900 border-slate-700 text-slate-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200'
                  }`}
                >
                  {ch}
                </div>

                {/* Index label */}
                <span className="text-[9px] font-mono text-slate-600 mt-1">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multiple Test Cases Table (Section 12 Requirement) */}
      {testCases && testCases.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-850">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Test Cases Suite</span>
            <span className="text-[11px] text-slate-500">
              {testCases.filter((t) => t.accepted).length} / {testCases.length} Accepted
            </span>
          </div>

          <div className="rounded-lg border border-slate-850 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-850">
                <tr>
                  <th className="py-1.5 px-3">Test String</th>
                  <th className="py-1.5 px-3">Result</th>
                  <th className="py-1.5 px-3">Execution Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono">
                {testCases.map((tc, idx) => (
                  <tr
                    key={idx}
                    onClick={() => onSimulateString(tc.input)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-200">
                      {tc.input === '' ? 'ε' : tc.input}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        {tc.accepted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        )}
                        <span className={tc.accepted ? 'text-emerald-400' : 'text-rose-400'}>
                          {tc.accepted ? 'Accept' : 'Reject'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                      {tc.path.join(' → ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
