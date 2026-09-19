import React from 'react';
import { CheckCircle2, XCircle, Play, Pause, AlertTriangle, Disc, Square } from 'lucide-react';

export type MachineStatusType =
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'HALTED'
  | 'LIMIT_REACHED';

export type MachineStatus = MachineStatusType;

interface MachineStatusBadgeProps {
  status: MachineStatusType;
  stepIndex?: number;
  totalSteps?: number;
  skin?: any;
  className?: string;
}

export const MachineStatusBadge: React.FC<MachineStatusBadgeProps> = ({
  status,
  stepIndex,
  totalSteps,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'RUNNING':
        return {
          label: 'RUNNING',
          icon: <Play className="h-3.5 w-3.5 animate-pulse text-amber-400" />,
          colorClass: 'bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-amber-900/30',
          dotClass: 'bg-amber-400 animate-ping'
        };
      case 'ACCEPTED':
        return {
          label: 'ACCEPTED',
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
          colorClass: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60 shadow-emerald-900/40',
          dotClass: 'bg-emerald-400'
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          icon: <XCircle className="h-3.5 w-3.5 text-rose-400" />,
          colorClass: 'bg-rose-950/70 text-rose-300 border-rose-500/60 shadow-rose-900/40',
          dotClass: 'bg-rose-400'
        };
      case 'HALTED':
        return {
          label: 'HALTED',
          icon: <Square className="h-3 w-3 text-cyan-400" />,
          colorClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-cyan-900/30',
          dotClass: 'bg-cyan-400'
        };
      case 'LIMIT_REACHED':
        return {
          label: 'LIMIT REACHED',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />,
          colorClass: 'bg-orange-950/60 text-orange-300 border-orange-500/50',
          dotClass: 'bg-orange-400'
        };
      case 'PAUSED':
        return {
          label: 'PAUSED',
          icon: <Pause className="h-3 w-3 text-slate-400" />,
          colorClass: 'bg-slate-900/80 text-slate-300 border-slate-700',
          dotClass: 'bg-slate-400'
        };
      case 'READY':
      default:
        return {
          label: 'READY',
          icon: <Disc className="h-3.5 w-3.5 text-indigo-400" />,
          colorClass: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 shadow-indigo-900/30',
          dotClass: 'bg-indigo-400'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all ${config.colorClass} ${className}`}
      role="status"
      aria-label={`Machine status: ${config.label}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass.replace(' animate-ping', '')}`} />
      </span>
      <span className="flex items-center gap-1.5">
        {config.icon}
        <span>{config.label}</span>
      </span>
      {typeof stepIndex === 'number' && typeof totalSteps === 'number' && totalSteps > 0 && (
        <span className="text-[10px] opacity-75 pl-1.5 border-l border-current/20">
          [{stepIndex}/{totalSteps}]
        </span>
      )}
    </div>
  );
};
