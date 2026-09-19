import React, { useRef, useEffect } from 'react';
import { ComputationStep, VisualEvent } from '../dcve/types.js';
import { Terminal, ArrowRight, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { VisualEventRegistry } from '../dcve/visualEventRegistry.js';

interface UniversalEventLogProps {
  computationSteps: ComputationStep[];
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
  className?: string;
}

export const UniversalEventLog: React.FC<UniversalEventLogProps> = ({
  computationSteps,
  currentStepIndex,
  onSelectStep,
  className = ''
}) => {
  const activeLogRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLogRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeLogRef.current;
      const elemTop = element.offsetTop - container.offsetTop;
      const elemBottom = elemTop + element.clientHeight;
      if (elemTop < container.scrollTop) {
        container.scrollTop = elemTop;
      } else if (elemBottom > container.scrollTop + container.clientHeight) {
        container.scrollTop = elemBottom - container.clientHeight;
      }
    }
  }, [currentStepIndex]);

  return (
    <div className={`p-4 rounded-xl bg-[#101720] border border-[#273241] space-y-3 font-mono ${className}`}>
      <div className="flex items-center justify-between border-b border-[#273241] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-[#00D9FF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#E8EDF5]">
            Machine Telemetry & Universal Event Log
          </span>
        </div>
        <span className="text-[10px] text-[#8A96A8] uppercase font-mono">
          {computationSteps.length} Logged Cycles
        </span>
      </div>

      <div ref={containerRef} className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
        {computationSteps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;
          const primaryEvent = step.visualEvents?.[0] || {
            type: step.status === 'accepted' ? 'ACCEPT' : step.status === 'rejected' ? 'REJECT' : 'STATE_CHANGE',
            mathematicalOperation: step.ruleApplied?.formula || 'Initial State',
            description: step.event?.description || step.explanation
          };

          const eventMeta = VisualEventRegistry.getMetadata(primaryEvent.type as any);

          return (
            <div
              key={idx}
              ref={isActive ? activeLogRef : null}
              onClick={() => onSelectStep(idx)}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-400/60'
                  : isPast
                  ? 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  : 'bg-slate-950 border-slate-900 text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-500 text-white font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{idx.toString().padStart(2, '0')}
                </span>

                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 border"
                  style={{
                    backgroundColor: `${eventMeta.color}15`,
                    borderColor: `${eventMeta.color}40`,
                    color: eventMeta.color
                  }}
                >
                  {primaryEvent.type}
                </span>

                <span className="truncate text-slate-300">
                  {primaryEvent.mathematicalOperation}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
                {step.status === 'accepted' && (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="h-3 w-3" /> ACCEPT
                  </span>
                )}
                {step.status === 'rejected' && (
                  <span className="text-rose-400 flex items-center gap-1 font-bold">
                    <XCircle className="h-3 w-3" /> REJECT
                  </span>
                )}
                <ArrowRight className="h-3 w-3 opacity-40" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
