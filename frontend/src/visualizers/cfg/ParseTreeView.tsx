import React, { useState } from 'react';
import { ParseTreeNode } from '../../types/index.js';
import { CFGEngine } from '../../algorithms/cfg/cfgEngine.js';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ParseTreeViewProps {
  parseTree?: ParseTreeNode;
  isAmbiguousDemo?: boolean;
}

export const ParseTreeView: React.FC<ParseTreeViewProps> = ({ isAmbiguousDemo = false }) => {
  const [showDualTrees, setShowDualTrees] = useState(isAmbiguousDemo);
  const ambiguityDemo = CFGEngine.demonstrateAmbiguity();

  // Recursive tree renderer
  const renderTreeNode = (node: ParseTreeNode) => {
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div
          className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-md transition-all ${
            node.isTerminal
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
              : 'bg-indigo-950 border border-indigo-500 text-indigo-300'
          }`}
        >
          {node.symbol}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="relative pt-4 flex items-start gap-4">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Interactive Parse Tree Visualizer
          </h3>
          <p className="text-xs text-slate-400">
            Green = Terminals • Purple = Non-Terminal Variables
          </p>
        </div>

        <button
          onClick={() => setShowDualTrees(!showDualTrees)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            showDualTrees
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {showDualTrees ? 'Dual Ambiguity View (Active)' : 'Inspect Ambiguity Dual Trees'}
        </button>
      </div>

      {showDualTrees ? (
        /* Ambiguity Demonstration Side-by-Side */
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-300 mb-0.5">
                Grammar Ambiguity Detected on String: "{ambiguityDemo.testString}"
              </span>
              <span>{ambiguityDemo.explanation}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tree A */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase block">
                Parse Tree A: (id + id) * id  [+ grouped first]
              </span>
              <div className="p-4 bg-slate-950/80 rounded-lg flex items-center justify-center overflow-x-auto min-h-[220px]">
                {ambiguityDemo.parseTreeA && renderTreeNode(ambiguityDemo.parseTreeA)}
              </div>
            </div>

            {/* Tree B */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase block">
                Parse Tree B: id + (id * id)  [* grouped first]
              </span>
              <div className="p-4 bg-slate-950/80 rounded-lg flex items-center justify-center overflow-x-auto min-h-[220px]">
                {ambiguityDemo.parseTreeB && renderTreeNode(ambiguityDemo.parseTreeB)}
              </div>
            </div>
          </div>

          {/* Disambiguation Guide */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <span className="font-bold text-emerald-400 uppercase block">
              How to Disambiguate Arithmetic Grammars:
            </span>
            <pre className="text-slate-300 leading-relaxed overflow-x-auto bg-slate-900 p-3 rounded-lg border border-slate-850">
              {ambiguityDemo.disambiguationGuide}
            </pre>
          </div>
        </div>
      ) : (
        /* Single Parse Tree */
        <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center overflow-x-auto min-h-[280px]">
          {ambiguityDemo.parseTreeA && renderTreeNode(ambiguityDemo.parseTreeA)}
        </div>
      )}
    </div>
  );
};
