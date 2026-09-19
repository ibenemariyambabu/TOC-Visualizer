import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  CheckCircle2,
  ChevronRight,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Table as TableIcon,
  GitBranch,
  Info
} from 'lucide-react';
import { InstantaneousDescription, PDAData, PDAComputationTreeNode } from '../../types/index.js';
import { PDAEngine } from '../../algorithms/pda/pdaEngine.js';

interface InstantaneousDescriptionsPanelProps {
  pda: PDAData;
  descriptions: InstantaneousDescription[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  computationTree?: PDAComputationTreeNode;
  testString?: string;
  acceptanceMode?: 'FINAL_STATE' | 'EMPTY_STACK';
}

export const InstantaneousDescriptionsPanel: React.FC<InstantaneousDescriptionsPanelProps> = ({
  pda,
  descriptions,
  currentStepIndex,
  onSelectStep,
  computationTree,
  testString = '',
  acceptanceMode = pda.acceptanceMode || 'FINAL_STATE'
}) => {
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('main');

  // NPDA Branches
  const npdaBranches = useMemo(() => {
    if (!computationTree) return [];
    return PDAEngine.getComputationBranches(computationTree);
  }, [computationTree]);

  // Determine active descriptions based on branch selection
  const activeDescriptions = useMemo(() => {
    if (selectedBranchId !== 'main' && npdaBranches.length > 0) {
      const branch = npdaBranches.find((b) => b.branchId === selectedBranchId);
      if (branch && branch.ids.length > 0) {
        return branch.ids;
      }
    }
    return descriptions;
  }, [selectedBranchId, npdaBranches, descriptions]);

  const totalSteps = Math.max(0, activeDescriptions.length - 1);
  const activeIndex = Math.min(currentStepIndex, totalSteps);
  const activeDesc = activeDescriptions[activeIndex] || activeDescriptions[0];

  // Automated Mathematical Validation (Section 12 Requirement)
  const validation = useMemo(() => {
    return PDAEngine.validateIDTrace(pda, activeDescriptions);
  }, [pda, activeDescriptions]);

  // Turnstile Sequence Text
  const fullTurnstileSequence = useMemo(() => {
    return activeDescriptions.map((d, i) => (i === 0 ? d.formatted : `⊢ ${d.formatted}`)).join('\n');
  }, [activeDescriptions]);

  // Summary theorem: (q0, w, Z0) ⊢* (q_term, ε, α)
  const summaryTheorem = useMemo(() => {
    if (activeDescriptions.length === 0) return '';
    const first = activeDescriptions[0].formatted;
    const last = activeDescriptions[activeDescriptions.length - 1];

    const isAccepted =
      acceptanceMode === 'EMPTY_STACK'
        ? last.stackString === 'ε' && last.remainingInput === 'ε'
        : pda.acceptStates.includes(last.state) && last.remainingInput === 'ε';

    const statusTag = isAccepted
      ? acceptanceMode === 'EMPTY_STACK'
        ? '[ACCEPTED: Empty Stack reached]'
        : `[ACCEPTED: Final State ${last.state} reached]`
      : '[REJECTED]';

    return `${first} ⊢* ${last.formatted}   ${statusTag}`;
  }, [activeDescriptions, acceptanceMode, pda.acceptStates]);

  // Playback timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        if (activeIndex < totalSteps) {
          if (onSelectStep) onSelectStep(activeIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeIndex, totalSteps, speed, onSelectStep]);

  const handleCopyTrace = () => {
    navigator.clipboard.writeText(fullTurnstileSequence);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  const handleCopyTable = () => {
    const header = '| Step | State | Unread Input | Stack (top → bottom) | Transition Applied | Move |\n|---|---|---|---|---|---|\n';
    const rows = activeDescriptions
      .map(
        (d, i) =>
          `| ${i} | ${d.state} | ${d.remainingInput} | ${d.stackString} | ${
            d.transitionApplied || '—'
          } | ${i === 0 ? d.formatted : `⊢ ${d.formatted}`} |`
      )
      .join('\n');
    navigator.clipboard.writeText(header + rows);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleStepJump = (idx: number) => {
    setIsPlaying(false);
    if (onSelectStep) onSelectStep(idx);
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 font-mono text-xs shadow-2xl">
      {/* Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-5 w-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>Instantaneous Descriptions (IDs) & Configurations</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                (q, w, α)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Formal step-by-step configuration transitions generated strictly from transition function δ.
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
            <span>Stack Orientation: </span>
            <strong className="text-cyan-300">top → bottom</strong>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
              acceptanceMode === 'EMPTY_STACK'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
            }`}
          >
            Mode: {acceptanceMode === 'EMPTY_STACK' ? 'Empty Stack (N)' : 'Final State (L)'}
          </div>

          <button
            onClick={handleCopyTrace}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
            title="Copy formal turnstile sequence"
          >
            {copiedTrace ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy ⊢ Trace</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] transition-colors"
            title="Copy markdown table"
          >
            {copiedTable ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Table Copied!</span>
              </>
            ) : (
              <>
                <TableIcon className="h-3.5 w-3.5" />
                <span>Copy Table</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowTable(!showTable)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] border transition-colors ${
              showTable
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>{showTable ? 'Hide Table' : 'Show Table'}</span>
          </button>
        </div>
      </div>

      {/* NPDA Computation Branch Selector (Section 8 Requirement) */}
      {npdaBranches.length > 1 && (
        <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-purple-300 text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <GitBranch className="h-4 w-4" />
              <span>Nondeterministic Branches (NPDA):</span>
            </span>
            <span className="text-[11px] text-purple-400">
              Select an explored computation branch to inspect its complete ID sequence:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBranchId('main')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                selectedBranchId === 'main'
                  ? 'bg-purple-600 text-white border-purple-500 shadow'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Winning / Default Trace
            </button>
            {npdaBranches.map((branch, bIdx) => (
              <button
                key={branch.branchId}
                onClick={() => setSelectedBranchId(branch.branchId)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  selectedBranchId === branch.branchId
                    ? 'bg-purple-600 text-white border-purple-500 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>Branch #{bIdx + 1}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                    branch.isAccepting
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {branch.isAccepting ? 'ACCEPT' : 'DEAD'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Turnstile Derivation Summary Theorem (Section 2 & 7) */}
      <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold">
            Formal Multi-Step Derivation Theorem (⊢*)
          </span>
          <span className="text-[10px] text-slate-500">
            ⊢ = one step | ⊢* = reflexive transitive closure
          </span>
        </div>
        <div className="text-sm font-bold text-emerald-300 tracking-wide break-all">
          {summaryTheorem}
        </div>
      </div>

      {/* Active Step Focus: Before -> Transition -> After & 7-Step Derivation (Section 4, 6, 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: 3-Box Transition Highlight (Section 4) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Step #{activeIndex} Transition Details
              </span>
              <span className="text-[11px] text-slate-500">
                {activeIndex === 0 ? 'Initial Configuration' : `Move #${activeIndex}`}
              </span>
            </div>

            {/* Before vs After Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
              {/* Box 1: Configuration Before */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Configuration Before (ID)
                </span>
                <div className="text-xs font-bold text-indigo-300 break-all">
                  {activeDesc.beforeConfig || activeDesc.formatted}
                </div>
              </div>

              {/* Box 2: Applied Rule */}
              <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-800/40 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block">
                  Applied Rule δ
                </span>
                <div className="text-xs font-bold text-amber-300">
                  {activeDesc.transitionApplied ? (
                    <span>{activeDesc.transitionApplied}</span>
                  ) : (
                    <span className="text-slate-500 font-sans italic">Start state initialized</span>
                  )}
                </div>
              </div>

              {/* Box 3: Configuration After */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Configuration After (ID)
                </span>
                <div className="text-xs font-bold text-emerald-300 break-all">
                  {activeDesc.formatted}
                </div>
              </div>
            </div>

            {/* Transition Delta Breakdown Tags */}
            {activeIndex > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-850 text-[11px]">
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span>State: </span>
                  <strong className="text-white">{activeDesc.state}</strong>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span>Input Consumed: </span>
                  <strong className="text-amber-400">'{activeDesc.consumedSymbol || 'ε'}'</strong>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span>Stack Top Popped: </span>
                  <strong className="text-rose-400">'{activeDesc.poppedSymbol || 'ε'}'</strong>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span>Pushed Replacement: </span>
                  <strong className="text-emerald-400">'{activeDesc.pushedSymbols || 'ε'}'</strong>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  <span>Unread Input: </span>
                  <strong className="text-cyan-400">'{activeDesc.remainingInput}'</strong>
                </div>
              </div>
            )}

            {/* Formal 7-Step Derivation Breakdown (Section 9 Requirement) */}
            <div className="pt-2 border-t border-slate-850 space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                <span>Formal Step Derivation Explanation</span>
              </span>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-1 font-sans text-xs text-slate-300 leading-relaxed">
                {activeDesc.derivationSteps && activeDesc.derivationSteps.length > 0 ? (
                  activeDesc.derivationSteps.map((stepStr, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-mono text-[11px] font-bold">›</span>
                      <span>{stepStr}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">
                    Step #0: PDA initialized in start state "{pda.startState}" with initial stack symbol "{pda.initialStackSymbol}" and input string "{testString || 'ε'}".
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playback Controls & Slider (Section 4) */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStepJump(0)}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                title="First Step"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleStepJump(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                title="Previous Step"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => handleStepJump(Math.min(totalSteps, activeIndex + 1))}
                disabled={activeIndex >= totalSteps}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                title="Next Step"
              >
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleStepJump(totalSteps)}
                disabled={activeIndex >= totalSteps}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                title="Last Step"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* Slider & Step Count */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <span className="text-[11px] text-slate-400 font-bold w-16">
                #{activeIndex} / #{totalSteps}
              </span>
              <input
                type="range"
                min={0}
                max={totalSteps}
                value={activeIndex}
                onChange={(e) => handleStepJump(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Speed selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500">Speed:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    speed === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stack Beaker Alongside Active ID (Section 6 Requirement) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Physical Stack View (top → bottom)</span>
              </div>
              <span className="text-[10px] text-slate-500">
                Depth: {activeDesc.stackArray.length}
              </span>
            </div>

            {/* Beaker Representation */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 rounded-xl border border-slate-850 min-h-[220px]">
              {activeDesc.stackArray.length === 0 ? (
                <div className="text-slate-500 italic text-center p-4">
                  Stack is Empty (ε)
                </div>
              ) : (
                <div className="w-48 flex flex-col border-2 border-t-0 border-slate-600 rounded-b-xl p-1 bg-slate-950 space-y-1 shadow-inner">
                  {activeDesc.stackArray.map((sym, sIdx) => {
                    const isTop = sIdx === 0;
                    const isBottom = sIdx === activeDesc.stackArray.length - 1;

                    return (
                      <div
                        key={sIdx}
                        className={`flex items-center justify-between px-3 py-1.5 rounded font-mono font-bold text-xs border transition-all ${
                          isTop
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-md animate-pulse'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-base text-white">{sym}</span>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-sans">
                          {isTop && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/40 text-indigo-300 font-bold">
                              TOP
                            </span>
                          )}
                          {isBottom && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              BASE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stack Orientation Definition Callout (Section 1) */}
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
              <div>
                <strong>Convention:</strong> In ID <span className="font-mono text-cyan-300">{activeDesc.formatted}</span>, stack string is written <strong className="text-white font-mono">{activeDesc.stackString}</strong> where the <em>first character</em> is the TOP element.
              </div>
            </div>
          </div>

          {/* Automated ID Validation Status (Section 12 Requirement) */}
          <div
            className={`p-3 rounded-xl border text-[11px] font-sans flex items-start gap-2 ${
              validation.isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {validation.isValid ? (
              <>
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-bold font-mono text-xs">
                    ✓ Formal δ Validation Passed ({validation.stepsValidated} moves)
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Every step in this sequence strictly satisfies the PDA transition relation δ: Q × (Σ ∪ {'{ε}'}) × Γ → P(Q × Γ*).
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="font-bold font-mono text-xs">
                    ⚠ Validation Error in ID Sequence
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10px]">
                    {validation.errors.map((err, errIdx) => (
                      <li key={errIdx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Turnstile Stream Sequence (Section 2) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Complete Turnstile Trace Progression (⊢)
        </span>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 max-h-48 overflow-y-auto space-y-1 pr-2">
          {activeDescriptions.map((desc, idx) => {
            const isActive = idx === activeIndex;
            const isFirst = idx === 0;
            const isLast = idx === activeDescriptions.length - 1;

            return (
              <div
                key={idx}
                onClick={() => handleStepJump(idx)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-600/25 border border-indigo-500/60 text-indigo-200 shadow font-bold'
                    : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                }`}
              >
                <span className="text-[10px] text-slate-600 w-6 shrink-0">#{idx}</span>
                <span className="text-amber-400">{isFirst ? ' ' : '⊢'}</span>
                <span className="text-slate-200 font-bold tracking-wider">{desc.formatted}</span>
                {desc.transitionApplied && (
                  <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
                    via {desc.transitionApplied}
                  </span>
                )}
                {isActive && (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-sans font-bold uppercase">
                    Active Step
                  </span>
                )}
                {isLast && !isActive && (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-sans">
                    Terminal
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ID Table (Section 5 Requirement) */}
      {showTable && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Structured Instantaneous Description Table
            </span>
            <span className="text-[10px] text-slate-500">
              Click any row to jump and simulate that step
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                  <th className="p-2.5 w-14">Step</th>
                  <th className="p-2.5">Current State</th>
                  <th className="p-2.5">Remaining Input</th>
                  <th className="p-2.5">Stack (top → bottom)</th>
                  <th className="p-2.5">Transition Applied</th>
                  <th className="p-2.5">Formal Move (⊢)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {activeDescriptions.map((desc, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <tr
                      key={idx}
                      onClick={() => handleStepJump(idx)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-200 font-bold'
                          : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <td className="p-2.5 text-slate-500 font-bold">#{idx}</td>
                      <td className="p-2.5 font-bold text-white">{desc.state}</td>
                      <td className="p-2.5 text-cyan-300 font-bold">{desc.remainingInput}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{desc.stackString}</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">
                        {desc.transitionApplied ? (
                          <span className="text-amber-400">{desc.transitionApplied}</span>
                        ) : (
                          <span className="italic text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-200">
                        <span className="text-amber-400 mr-1">{idx === 0 ? '' : '⊢'}</span>
                        <span>{desc.formatted}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
