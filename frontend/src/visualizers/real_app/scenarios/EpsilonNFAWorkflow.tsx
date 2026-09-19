import React from 'react';
import { RealAppProps } from '../types.js';
import { Workflow, FastForward, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export const EpsilonNFAWorkflow: React.FC<RealAppProps> = ({
  model,
  currentStep,
  stepIndex,
  computationSteps
}) => {
  const currentState = typeof currentStep?.before?.currentState === 'string'
    ? currentStep.before.currentState
    : 'q0';

  const nextState = typeof currentStep?.after?.currentState === 'string'
    ? currentStep.after.currentState
    : currentState;

  const isEpsilonMove =
    currentStep?.ruleApplied?.components?.symbolRead === 'ε' ||
    currentStep?.event?.type === 'EPSILON_MOVE' ||
    currentStep?.event?.symbol === 'ε';

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-purple-900/50 space-y-5 font-mono text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Workflow className="h-5 w-5 animate-pulse text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Enterprise Workflow Automation Engine
            </h3>
            <p className="text-xs text-purple-400/80 font-sans">
              Real-World Application: ε-NFA modeling spontaneous internal task triggers without external input
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Transition Class:</span>
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold border ${
              isEpsilonMove
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}
          >
            {isEpsilonMove ? 'SPONTANEOUS ε-DISPATCH' : 'STANDARD INPUT DISPATCH'}
          </span>
        </div>
      </div>

      {/* Workflow Task Pipeline Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-8 p-4 rounded-xl bg-slate-900/80 border border-purple-900/40 space-y-4">
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
            Automated Task Pipeline Nodes
          </span>

          <div className="flex items-center gap-3 overflow-x-auto py-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/40 text-center shrink-0 min-w-[120px]">
              <span className="text-[10px] text-slate-500 block">SOURCE NODE</span>
              <span className="text-sm font-bold text-indigo-300">{currentState}</span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isEpsilonMove ? 'bg-purple-500/30 text-purple-200 border-purple-400' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {isEpsilonMove ? 'ε (0 INPUT)' : `'${currentStep?.event?.symbol || 'token'}'`}
              </span>
              <ArrowRight className="h-4 w-4 text-purple-400 my-1" />
            </div>

            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-400 text-center shrink-0 min-w-[120px] shadow-lg shadow-purple-950/40">
              <span className="text-[10px] text-purple-400 block">ACTIVE TARGET</span>
              <span className="text-sm font-bold text-purple-200">{nextState}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-purple-900/30 text-xs text-slate-300 font-sans space-y-1">
            <div className="flex items-center gap-2 text-purple-300 font-bold font-mono">
              <Zap className="h-3.5 w-3.5" />
              <span>{isEpsilonMove ? 'Immediate Microtask Triggered' : 'External Input Consumed'}</span>
            </div>
            <p>
              {isEpsilonMove
                ? 'The system advanced state without consuming any input from the conveyor belt, demonstrating formal graph reachability through epsilon-closure.'
                : 'The system read an external event token and executed the registered deterministic or branching rule.'}
            </p>
          </div>
        </div>

        {/* Telemetry Metric (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/80 border border-purple-900/40 flex flex-col justify-between space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            DISPATCH METRICS
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">Input Consumed:</span>
              <strong className={isEpsilonMove ? 'text-purple-300' : 'text-emerald-400'}>
                {isEpsilonMove ? '0 Tokens' : '1 Token'}
              </strong>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">Move Type:</span>
              <strong className={isEpsilonMove ? 'text-purple-400' : 'text-cyan-400'}>
                {isEpsilonMove ? 'Spontaneous ε' : 'Standard Read'}
              </strong>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-850">
              <span className="text-slate-400">Current Node:</span>
              <strong className="text-slate-200">{nextState}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center font-sans">
            ε-transitions enable modular workflow composition and lambda-free conversion.
          </div>
        </div>
      </div>
    </div>
  );
};
