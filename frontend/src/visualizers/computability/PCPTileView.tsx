import React, { useState } from 'react';
import { PCPTile, PCPSimulationResult } from '../../types/index.js';
import { PCPEngine } from '../../algorithms/computability/pcpEngine.js';
import { CheckCircle2, XCircle, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';

export const PCPTileView: React.FC = () => {
  const benchmark = PCPEngine.getBenchmarkPCP();
  const [tiles] = useState<PCPTile[]>(benchmark.tiles);
  const [sequence, setSequence] = useState<number[]>([]);

  const simResult: PCPSimulationResult = PCPEngine.evaluateSequence(tiles, sequence);

  const handleAddTile = (tileId: number) => {
    setSequence([...sequence, tileId]);
  };

  const handleReset = () => {
    setSequence([]);
  };

  const handleApplySolution = () => {
    if (benchmark.solution) {
      setSequence(benchmark.solution);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono">
            Post Correspondence Problem (PCP) Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Click domino tiles to build a sequence where Top String = Bottom String
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplySolution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Solution [1, 2]</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Available Domino Tiles */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Available Domino Tiles (Click to append to sequence):
        </span>
        <div className="flex flex-wrap gap-4 pt-1">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleAddTile(tile.id)}
              className="group flex flex-col items-center border-2 border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950 p-3 shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-[10px] font-mono text-slate-500 mb-1">Tile #{tile.id}</span>
              {/* Domino Top */}
              <div className="w-16 py-1.5 bg-indigo-950/60 border border-indigo-500/40 rounded-t-md text-center font-mono font-bold text-sm text-indigo-200">
                {tile.top}
              </div>
              {/* Domino Divider */}
              <div className="w-16 h-0.5 bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
              {/* Domino Bottom */}
              <div className="w-16 py-1.5 bg-cyan-950/60 border border-cyan-500/40 rounded-b-md text-center font-mono font-bold text-sm text-cyan-200">
                {tile.bottom}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Sequence and String Concatenation */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Domino Sequence:</span>
          <span className="font-bold text-indigo-400">
            [{sequence.join(', ') || 'None selected'}]
          </span>
        </div>

        {/* Comparison Displays */}
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs">
            <span className="text-indigo-400 font-bold block text-[10px] uppercase">
              Top String Concatenation (T):
            </span>
            <span className="text-sm font-bold text-white tracking-widest">
              {simResult.topString || '∅'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs">
            <span className="text-cyan-400 font-bold block text-[10px] uppercase">
              Bottom String Concatenation (B):
            </span>
            <span className="text-sm font-bold text-white tracking-widest">
              {simResult.bottomString || '∅'}
            </span>
          </div>
        </div>

        {/* Evaluation Banner */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
            simResult.isMatch
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          {simResult.isMatch ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed font-sans">{simResult.explanation}</p>
        </div>
      </div>

      {/* Undecidability Theory Callout */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 space-y-1">
        <span className="font-bold text-purple-400 block uppercase tracking-wider text-[11px] font-mono">
          Why is PCP Undecidable?
        </span>
        <p className="leading-relaxed">
          The Post Correspondence Problem is proven undecidable by reduction from the Halting Problem: computation histories of any Turing Machine can be encoded directly into pairs of matching PCP domino tiles.
        </p>
      </div>
    </div>
  );
};
