import React, { useState } from 'react';
import { GitBranch, CheckCircle2, XCircle, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { PDAComputationTreeNode } from '../../types/index.js';

interface PDAComputationTreeViewProps {
  rootNode: PDAComputationTreeNode;
}

const TreeNodeComponent: React.FC<{
  node: PDAComputationTreeNode;
  isRoot?: boolean;
  level?: number;
}> = ({ node, isRoot = false, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 3);

  const hasChildren = node.children && node.children.length > 0;
  const stackDisplay = node.stack.length > 0 ? [...node.stack].reverse().join('') : 'ε';

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:bg-slate-800 text-slate-400"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <div
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-2.5 transition-all ${
            node.isAccepting
              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
              : node.isDead
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <span className="text-slate-100 font-bold">
            ({node.state}, {node.remainingInput === '' ? 'ε' : node.remainingInput}, {stackDisplay})
          </span>

          {node.transitionUsed && (
            <span className="text-[10px] text-slate-500 font-sans truncate max-w-xs">
              [{node.transitionUsed}]
            </span>
          )}

          {node.isAccepting && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold">
              <CheckCircle2 className="h-3 w-3" />
              <span>Accepting Branch</span>
            </span>
          )}

          {node.isDead && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] uppercase font-bold">
              <XCircle className="h-3 w-3" />
              <span>Dead Branch</span>
            </span>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="pl-6 border-l border-slate-800 space-y-1.5 ml-2">
          {node.children.map((child) => (
            <TreeNodeComponent key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const PDAComputationTreeView: React.FC<PDAComputationTreeViewProps> = ({ rootNode }) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Nondeterministic Computation Tree
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-sans">
          Traces all parallel computation branches for NPDAs
        </span>
      </div>

      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 overflow-x-auto max-h-80 overflow-y-auto">
        <TreeNodeComponent node={rootNode} isRoot={true} />
      </div>
    </div>
  );
};
