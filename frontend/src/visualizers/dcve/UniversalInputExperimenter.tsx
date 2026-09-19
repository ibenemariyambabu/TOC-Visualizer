import React, { useState } from 'react';
import { TestCaseModel } from './types.js';
import { Play, Sparkles, CheckCircle2, XCircle, RefreshCw, Plus, Tag } from 'lucide-react';

interface UniversalInputExperimenterProps {
  currentInput: string;
  alphabet: string[];
  testCases?: TestCaseModel[];
  onSimulateInput: (newString: string) => void;
  className?: string;
}

export const UniversalInputExperimenter: React.FC<UniversalInputExperimenterProps> = ({
  currentInput,
  alphabet = ['0', '1'],
  testCases = [],
  onSimulateInput,
  className = ''
}) => {
  const [customInput, setCustomInput] = useState(currentInput);

  const handleApply = (str: string) => {
    setCustomInput(str);
    onSimulateInput(str);
  };

  const handleAppendSymbol = (sym: string) => {
    const next = customInput + sym;
    setCustomInput(next);
  };

  return (
    <div className={`p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 font-mono text-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
            Universal Input Experimenter (Section 26)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500">
          Alphabet Σ = &#123;{alphabet.join(', ')}&#125;
        </span>
      </div>

      {/* Input Box + Token Buttons */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter input string (or leave blank for ε)..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 text-sm"
          />

          <button
            onClick={() => handleApply(customInput)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Simulate</span>
          </button>

          <button
            onClick={() => handleApply('')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold transition-colors border border-slate-700"
            title="Simulate Empty String ε"
          >
            ε (Empty)
          </button>
        </div>

        {/* Alphabet Token Quick Inserters */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 mr-1">Quick Append:</span>
          {alphabet.map((sym) => (
            <button
              key={sym}
              onClick={() => handleAppendSymbol(sym)}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold transition-colors"
            >
              +{sym}
            </button>
          ))}
          <button
            onClick={() => setCustomInput('')}
            className="px-2 py-1 rounded text-slate-500 hover:text-rose-400 text-[10px] ml-auto"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Representative Test Cases Suite (Section 55) */}
      {testCases && testCases.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Representative Benchmark Suite
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {testCases.map((tc, idx) => {
              const isSelected = currentInput === tc.input;
              return (
                <button
                  key={idx}
                  onClick={() => handleApply(tc.input)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <span className="font-bold text-amber-300 block truncate">
                      {tc.displayLabel || (tc.input === '' ? 'ε (empty)' : `'${tc.input}'`)}
                    </span>
                    <span className="text-[10px] text-slate-500 block capitalize">
                      {tc.category.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold shrink-0">
                    {tc.expectedOutcome ? (
                      <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        ACCEPT
                      </span>
                    ) : (
                      <span className="text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/40">
                        REJECT
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
