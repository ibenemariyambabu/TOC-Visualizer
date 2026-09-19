import React from 'react';
import { RealAppProps } from '../types.js';
import { Shield, Zap, ArrowRight, Gauge, Activity } from 'lucide-react';

export const DFATrafficController: React.FC<RealAppProps> = ({
  model,
  currentStep,
  stepIndex,
  computationSteps,
  inputString,
  alphabet,
  onHighlightTransition
}) => {
  const currentState = typeof currentStep?.before?.currentState === 'string'
    ? currentStep.before.currentState
    : 'q0';

  const nextState = typeof currentStep?.after?.currentState === 'string'
    ? currentStep.after.currentState
    : currentState;

  const states: string[] = model?.states || [];
  const acceptStates: string[] = model?.acceptStates || [];
  const isAccepting = acceptStates.includes(nextState);

  // Map state indices to simulated traffic signals (Green, Amber, Red, Pedestrian)
  const getSignalColor = (st: string, idx: number) => {
    if (acceptStates.includes(st)) return 'bg-emerald-500 text-emerald-100 shadow-emerald-500/50';
    if (idx % 3 === 0) return 'bg-emerald-500 text-emerald-100 shadow-emerald-500/50';
    if (idx % 3 === 1) return 'bg-amber-500 text-amber-100 shadow-amber-500/50';
    return 'bg-rose-500 text-rose-100 shadow-rose-500/50';
  };

  return (
    <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5 font-mono text-slate-200">
      {/* Real-World Metaphor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gauge className="h-5 w-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Automatic Traffic & Industrial Controller
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Real-World Application: Deterministic Finite Automaton operating an automated sequence controller
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Controller State:</span>
          <span className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
            RELAY [{nextState}]
          </span>
        </div>
      </div>

      {/* Industrial Controller Console Board */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Physical Traffic Signal Light Housing (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center space-y-4 shadow-inner">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            SIGNAL HEAD ACTUATOR
          </span>

          {/* Traffic Signal Chassis */}
          <div className="w-24 p-3 bg-zinc-950 rounded-2xl border-2 border-zinc-700 shadow-2xl flex flex-col items-center space-y-3">
            {/* Red Light */}
            <div
              className={`w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                !isAccepting && nextState.toLowerCase().includes('red') || nextState === states[states.length - 1]
                  ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/60 ring-4 ring-rose-500/30 scale-105'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-800 opacity-40'
              }`}
            >
              STOP
            </div>

            {/* Amber Light */}
            <div
              className={`w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                nextState.toLowerCase().includes('yellow') || nextState.toLowerCase().includes('amber') || (states.length > 2 && nextState === states[1])
                  ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/60 ring-4 ring-amber-500/30 scale-105'
                  : 'bg-amber-950/40 border-amber-900/60 text-amber-800 opacity-40'
              }`}
            >
              WAIT
            </div>

            {/* Green Light */}
            <div
              className={`w-14 h-14 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                isAccepting || nextState.toLowerCase().includes('green') || nextState === states[0]
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/60 ring-4 ring-emerald-500/30 scale-105'
                  : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-800 opacity-40'
              }`}
            >
              GO
            </div>
          </div>

          <span className="text-[10px] text-zinc-400">
            {isAccepting ? '✓ ACCEPTANCE CONDITION ACTIVE' : 'PROCESSING SEQUENCE'}
          </span>
        </div>

        {/* Right Column: Automated Relays & Sensor Dispatch (8 cols) */}
        <div className="md:col-span-8 p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                State Relay Channels
              </span>
              <span className="text-[10px] text-zinc-500">
                {states.length} Active Switch Relays
              </span>
            </div>

            {/* State Relay Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {states.map((st, idx) => {
                const isActive = st === nextState;
                const isAccept = acceptStates.includes(st);

                return (
                  <div
                    key={st}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-2 ring-amber-400/40 scale-102'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold">RELAY #{idx}</span>
                      {isAccept && <span className="text-emerald-400 font-bold">ACCEPT</span>}
                    </div>
                    <div className="text-sm font-bold mt-1 text-slate-100 flex items-center gap-1.5">
                      {isActive && <Activity className="h-3.5 w-3.5 text-amber-400 animate-pulse" />}
                      <span>{st}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-World Sensor Event Stream */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
              <span>ACTIVE SENSOR DISPATCH:</span>
              <span className="text-amber-400">δ(q, a) = q'</span>
            </div>
            <div className="text-xs text-zinc-200 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>
                Sensor pulse token <strong className="text-amber-300">'{currentStep?.event?.symbol || 'INIT'}'</strong> triggered transition from relay <strong className="text-indigo-300">{currentState}</strong> to <strong className="text-emerald-300">{nextState}</strong>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
