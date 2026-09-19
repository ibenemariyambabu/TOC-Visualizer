import React from 'react';
import { RealAppProps } from '../types.js';
import { Search, FileSearch, CheckCircle2, Sparkles, Terminal } from 'lucide-react';

export const RegexSearchEngine: React.FC<RealAppProps> = ({
  model,
  currentStep,
  inputString,
  questionText = ''
}) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-blue-900/40 space-y-5 font-mono text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/30 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Search className="h-5 w-5 animate-pulse text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Pattern Detection & Regular Expression Search Engine
            </h3>
            <p className="text-xs text-blue-400/80 font-sans">
              Real-World Application: Thompson NFA / Regex matcher scanning streaming text payloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Engine Core:</span>
          <span className="px-3 py-1 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-xs">
            LINEAR-TIME REGEX MATCHER
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-8 p-4 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">
              PATTERN QUERY DEFINITION:
            </span>
            <div className="text-sm font-bold text-cyan-300">
              {questionText || 'Target Regular Expression Expression'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Text Payload Stream:</span>
              <span className="text-emerald-400 text-[10px] font-bold">STREAM BUFFER</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 text-sm font-bold text-slate-100 flex items-center gap-2 overflow-x-auto">
              {inputString.split('').map((char, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-blue-300"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/80 border border-blue-900/40 flex flex-col justify-between space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CONSTRUCTION OPERATIONS
          </span>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-300">
              <span className="font-bold text-blue-400">UNION (a | b):</span>
              <p className="text-[10px] text-slate-500 font-sans">Parallel branch fragment routing.</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-300">
              <span className="font-bold text-cyan-400">CONCAT (ab):</span>
              <p className="text-[10px] text-slate-500 font-sans">Sequential submachine chaining.</p>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-850 text-slate-300">
              <span className="font-bold text-purple-400">KLEENE STAR (a*):</span>
              <p className="text-[10px] text-slate-500 font-sans">Zero-or-more feedback loop.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
