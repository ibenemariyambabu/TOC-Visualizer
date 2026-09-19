import { MachineSkin, SkinStyle } from './types.js';

export const MACHINE_SKINS: Record<MachineSkin, SkinStyle> = {
  computational_lab: {
    id: 'computational_lab',
    name: 'Computational Lab',
    bgClass: 'bg-[#080B10]',
    panelClass: 'bg-[#101720] border-[#273241]',
    borderClass: 'border-[#273241]',
    accentText: 'text-[#00D9FF]',
    accentBg: 'bg-[#00D9FF]',
    accentBorder: 'border-[#00D9FF]/40',
    fontClass: 'font-mono',
    badgeStyle: 'bg-[#161E28] text-[#00D9FF] border-[#00D9FF]/40',
    bg: '#080B10',
    panelBg: '#101720',
    subPanelBg: '#0D1219',
    textColor: '#E8EDF5',
    mutedTextColor: '#8A96A8',
    borderColor: '#273241',
    border: '1px solid #273241',
    borderRadius: '8px',
    accentColor: '#00D9FF',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    shadow: '0 10px 30px -5px rgba(0, 0, 0, 0.7)',
  },
  control_room: {
    id: 'control_room',
    name: 'Control Room (Industrial)',
    bgClass: 'bg-zinc-950',
    panelClass: 'bg-zinc-900/95 border-amber-500/30 shadow-inner',
    borderClass: 'border-zinc-800',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-600',
    accentBorder: 'border-amber-500/50',
    fontClass: 'font-mono',
    badgeStyle: 'bg-amber-950/60 text-amber-300 border-amber-500/40'
  },
  machine_factory: {
    id: 'machine_factory',
    name: 'Machine Factory',
    bgClass: 'bg-stone-950',
    panelClass: 'bg-stone-900/90 border-orange-500/30',
    borderClass: 'border-stone-800',
    accentText: 'text-orange-400',
    accentBg: 'bg-orange-600',
    accentBorder: 'border-orange-500/40',
    fontClass: 'font-mono',
    badgeStyle: 'bg-orange-950/60 text-orange-300 border-orange-500/30'
  },
  matrix_machine: {
    id: 'matrix_machine',
    name: 'Matrix Workstation',
    bgClass: 'bg-black',
    panelClass: 'bg-emerald-950/30 border-emerald-500/40 backdrop-blur',
    borderClass: 'border-emerald-900/60',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-400/50',
    fontClass: 'font-mono',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
  },
  arcade: {
    id: 'arcade',
    name: 'TOC Arcade',
    bgClass: 'bg-slate-950',
    panelClass: 'bg-purple-950/30 border-fuchsia-500/40 shadow-lg shadow-fuchsia-950/30',
    borderClass: 'border-fuchsia-900/50',
    accentText: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-600',
    accentBorder: 'border-fuchsia-500/50',
    fontClass: 'font-mono',
    badgeStyle: 'bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-500/40'
  },
  cyber_monitor: {
    id: 'cyber_monitor',
    name: 'Cybersecurity Monitor',
    bgClass: 'bg-slate-950',
    panelClass: 'bg-cyan-950/30 border-cyan-500/40',
    borderClass: 'border-cyan-900/50',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-600',
    accentBorder: 'border-cyan-500/50',
    fontClass: 'font-mono',
    badgeStyle: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40'
  },
  compiler_lab: {
    id: 'compiler_lab',
    name: 'Compiler Lab',
    bgClass: 'bg-slate-950',
    panelClass: 'bg-blue-950/30 border-blue-500/30',
    borderClass: 'border-blue-900/50',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-600',
    accentBorder: 'border-blue-500/40',
    fontClass: 'font-mono',
    badgeStyle: 'bg-blue-950/70 text-blue-300 border-blue-500/40'
  },
  minimal_math: {
    id: 'minimal_math',
    name: 'Minimal Mathematical',
    bgClass: 'bg-slate-950',
    panelClass: 'bg-slate-900/60 border-slate-800',
    borderClass: 'border-slate-800',
    accentText: 'text-slate-200',
    accentBg: 'bg-slate-700',
    accentBorder: 'border-slate-600',
    fontClass: 'font-mono',
    badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700'
  }
};

export const SKINS = MACHINE_SKINS;

const ACCENT_COLORS: Record<MachineSkin, string> = {
  computational_lab: '#00D9FF',
  control_room: '#f59e0b',
  machine_factory: '#f97316',
  matrix_machine: '#10b981',
  arcade: '#d946ef',
  cyber_monitor: '#06b6d4',
  compiler_lab: '#3b82f6',
  minimal_math: '#94a3b8',
};

export function getSkin(skinId?: MachineSkin): SkinStyle {
  const key: MachineSkin = (skinId && MACHINE_SKINS[skinId]) ? skinId : 'computational_lab';
  const base = MACHINE_SKINS[key];
  const accent = ACCENT_COLORS[key] || '#6366f1';

  return {
    ...base,
    bg: base.bg || (key === 'matrix_machine' ? '#000000' : '#020617'),
    panelBg: base.panelBg || '#0f172a',
    subPanelBg: base.subPanelBg || '#030712',
    textColor: base.textColor || '#f8fafc',
    mutedTextColor: base.mutedTextColor || '#94a3b8',
    borderColor: base.borderColor || '#1e293b',
    border: base.border || '1px solid #1e293b',
    borderRadius: base.borderRadius || '8px',
    accentColor: base.accentColor || accent,
    fontFamily: base.fontFamily || 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    shadow: base.shadow || '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  };
}
