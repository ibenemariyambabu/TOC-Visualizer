import React from 'react';
import { RealAppProps } from '../types.js';
import { ShieldAlert, ShieldCheck, Terminal, AlertTriangle, GitBranch, Radio } from 'lucide-react';

export const NFACyberDetector: React.FC<RealAppProps> = ({
  model,
  currentStep,
  stepIndex,
  computationSteps,
  inputString,
  alphabet
}) => {
  const activeStates = Array.isArray(currentStep?.after?.currentState)
    ? currentStep.after.currentState
    : [typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : 'q0'];

  const acceptStates: string[] = model?.acceptStates || [];
  const hasAcceptingBranch = activeStates.some((st) => acceptStates.includes(st));

  // Map symbols to cyber threat events
  const getPayloadName = (sym?: string) => {
    if (!sym) return 'SYSTEM_PROBE';
    switch (sym) {
      case '0':
      case 'a':
        return 'AUTH_LOGIN';
      case '1':
      case 'b':
        return 'ELEVATE_PRIVILEGE';
      case 'c':
      case '2':
        return 'DATA_EXFIL';
      default:
        return `PACKET_${sym.toUpperCase()}`;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-900/50 space-y-5 font-mono text-slate-200 shadow-xl shadow-cyan-950/20">
      {/* SOC Threat Monitor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-5 w-5 animate-pulse text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              SOC Cyber Threat & Intrusion Detector
            </h3>
            <p className="text-xs text-cyan-400/80 font-sans">
              Real-World Application: Nondeterministic Finite Automaton scanning simultaneous concurrent attack paths
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Threat Vectors:</span>
          <span className="px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs">
            {activeStates.length} Concurrent Active Paths
          </span>
        </div>
      </div>

      {/* Concurrent Threat Vector Radar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Active Vector Matrix (8 cols) */}
        <div className="md:col-span-8 p-4 rounded-xl bg-slate-900/80 border border-cyan-900/40 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
              Nondeterministic Branching Threads
            </span>
            <span className="text-[10px] text-slate-400">
              Payload: <strong className="text-amber-300">{getPayloadName(currentStep?.event?.symbol)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeStates.map((st, idx) => {
              const isMatch = acceptStates.includes(st);

              return (
                <div
                  key={st + idx}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isMatch
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/40 animate-pulse'
                      : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>THREAD_ID #0{idx + 1}</span>
                    {isMatch ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> SIGNATURE MATCH
                      </span>
                    ) : (
                      <span className="text-cyan-400">MONITORING</span>
                    )}
                  </div>
                  <div className="text-base font-bold mt-1 text-slate-100 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>State: {st}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 font-sans">
                    {isMatch
                      ? 'Target signature reached. Input matches configured exploit pattern.'
                      : 'Concurrent path exploring non-deterministic state branch.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Level Status Dial (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/80 border border-cyan-900/40 flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            DETECTION THREAT LEVEL
          </span>

          <div
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center p-3 shadow-2xl transition-all ${
              hasAcceptingBranch
                ? 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-rose-950/60 animate-pulse'
                : 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-cyan-950/40'
            }`}
          >
            {hasAcceptingBranch ? (
              <>
                <ShieldAlert className="h-8 w-8 text-rose-400 mb-1" />
                <span className="text-[11px] font-extrabold uppercase text-rose-300">ALERT</span>
                <span className="text-[8px] text-rose-400">SIGNATURE</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-8 w-8 text-cyan-400 mb-1" />
                <span className="text-[11px] font-extrabold uppercase text-cyan-300">SECURE</span>
                <span className="text-[8px] text-cyan-400">INSPECTING</span>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-300 font-sans">
            {hasAcceptingBranch ? (
              <strong className="text-rose-400">EXPLOIT ACCEPTED: An active branch reached an accepting state.</strong>
            ) : (
              <span>NFA actively evaluating all possible computational paths without backtracking.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
