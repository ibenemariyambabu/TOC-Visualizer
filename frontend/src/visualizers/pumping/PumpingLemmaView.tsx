import React, { useState } from 'react';
import { PumpingLemmaProof } from '../../types/index.js';
import { AlertTriangle, CheckCircle2, XCircle, Sliders, ArrowRight } from 'lucide-react';

interface PumpingLemmaViewProps {
  proof: PumpingLemmaProof;
}

export const PumpingLemmaView: React.FC<PumpingLemmaViewProps> = ({ proof }) => {
  const [pumpI, setPumpI] = useState<number>(2);

  const currentPumpStep = proof.pumpingAnalysis.find((s) => s.i === pumpI) || {
    i: pumpI,
    pumpedString: `xy^${pumpI}z`,
    inLanguage: false,
    explanation: `For i = ${pumpI}, the pumped string violates the language invariant balance.`
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
      {/* Proof Header */}
      <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 block">
            {proof.isRegularProof ? 'Regular Language Pumping Lemma' : 'Context-Free Pumping Lemma'}
          </span>
          <h3 className="text-base font-bold text-slate-100 font-mono">
            {proof.language}
          </h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
          Non-Regularity Proof
        </div>
      </div>

      {/* String Decomposition (x | y | z) */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Assumed Pumping Length: p = {proof.assumedLength}</span>
          <span>Chosen String: w = {proof.chosenString}</span>
        </div>

        {/* Visual colored segments */}
        <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto">
          {proof.decomposition.parts.map((part) => {
            const isPumpTarget = part.name === 'y' || part.name === 'v' || part.name === 'x';
            return (
              <div
                key={part.name}
                className={`flex flex-col items-center px-4 py-2.5 rounded-lg border font-mono font-bold text-sm shadow-md transition-all ${
                  isPumpTarget
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30 scale-105'
                    : 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                }`}
              >
                <span className="text-base">{part.value}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase">
                  {part.name} ({part.condition})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Pump Multiplier Slider (i = 0, 1, 2, 3) */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono uppercase">
            <Sliders className="h-4 w-4 text-amber-400" />
            <span>Pump Multiplier: i = {pumpI}</span>
          </div>

          <div className="flex gap-2 font-mono text-xs">
            {[0, 1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => setPumpI(val)}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  pumpI === val
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                i = {val}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Pumped String Result */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Resulting Pumped String (xy^{pumpI}z):</span>
            <div className="flex items-center gap-1.5 font-bold">
              {currentPumpStep.inLanguage ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> In Language (i=1)
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Violates Language (∉ L)
                </span>
              )}
            </div>
          </div>

          <div className="text-sm font-bold text-amber-300 py-1">
            {currentPumpStep.pumpedString}
          </div>

          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {currentPumpStep.explanation}
          </p>
        </div>
      </div>

      {/* Contradiction Alert & Conclusion */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4" />
          <span>Contradiction & Non-Regularity Proof</span>
        </div>
        <p className="text-slate-200 leading-relaxed font-medium">
          {proof.contradiction}
        </p>
        <p className="text-emerald-300 font-bold pt-1">
          {proof.conclusion}
        </p>
      </div>
    </div>
  );
};
