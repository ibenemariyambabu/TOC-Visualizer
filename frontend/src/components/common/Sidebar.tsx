import React, { useState } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Cpu,
  Binary,
  Layers,
  FileCode2,
  Box,
  Binary as TMIcon,
  HelpCircle,
  GraduationCap,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  BookMarked,
  FileText,
  Repeat,
  Sliders,
  Workflow,
  Rocket
} from 'lucide-react';

export type NavView =
  | 'computational_lab'
  | 'dashboard'
  | 'solver'
  | 'foundations_lab'
  | 'automata_lab'
  | 'regex_lab'
  | 'cfg_lab'
  | 'pda_lab'
  | 'tm_lab'
  | 'computability_lab'
  | 'exam_mode'
  | 'my_lab';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const [modulesExpanded, setModulesExpanded] = useState(true);
  const [labsExpanded, setLabsExpanded] = useState(true);

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Core Nav */}
        <div className="space-y-1.5">
          {/* Flagship: TOC Computational Lab */}
          <button
            onClick={() => onNavigate('computational_lab')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              currentView === 'computational_lab'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-indigo-600/30 border border-indigo-400'
                : 'bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Rocket className="h-4 w-4 text-cyan-300 animate-pulse" />
              <span>Computational Lab</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-200 border border-cyan-400/40">
              NEW
            </span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('solver')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              currentView === 'solver'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-indigo-500/20'
                : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/40 border border-indigo-800/40'
            }`}
          >
            <BrainCircuit className="h-4 w-4 text-cyan-300" />
            <span>Universal Problem Solver</span>
          </button>
        </div>

        {/* Modules Section */}
        <div>
          <button
            onClick={() => setModulesExpanded(!modulesExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 hover:text-slate-200"
          >
            <span>KTU Syllabus Modules</span>
            {modulesExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {modulesExpanded && (
            <div className="space-y-1 pl-1">
              <button
                onClick={() => onNavigate('automata_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'automata_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="truncate">Mod 1: Foundations & FA</span>
              </button>

              <button
                onClick={() => onNavigate('regex_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'regex_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="truncate">Mod 1: Regex & Arden's Thm</span>
              </button>

              <button
                onClick={() => onNavigate('cfg_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'cfg_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="truncate">Mod 2: CFG & Parse Trees</span>
              </button>

              <button
                onClick={() => onNavigate('pda_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'pda_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="truncate">Mod 2: Pushdown Automata</span>
              </button>

              <button
                onClick={() => onNavigate('tm_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'tm_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="truncate">Mod 3: Turing Machines</span>
              </button>

              <button
                onClick={() => onNavigate('computability_lab')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                  currentView === 'computability_lab'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="truncate">Mod 4: Computability & PCP</span>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Labs Section */}
        <div>
          <button
            onClick={() => setLabsExpanded(!labsExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1 hover:text-slate-200"
          >
            <span>Interactive Labs</span>
            {labsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>

          {labsExpanded && (
            <div className="space-y-1">
              <button
                onClick={() => onNavigate('foundations_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'foundations_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Foundations Lab</span>
              </button>

              <button
                onClick={() => onNavigate('automata_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'automata_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>Automata Lab</span>
              </button>

              <button
                onClick={() => onNavigate('regex_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'regex_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Repeat className="h-3.5 w-3.5 text-cyan-400" />
                <span>Regex & Arden Lab</span>
              </button>

              <button
                onClick={() => onNavigate('cfg_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'cfg_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>CFG & Parse Lab</span>
              </button>

              <button
                onClick={() => onNavigate('pda_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'pda_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>PDA Stack Lab</span>
              </button>

              <button
                onClick={() => onNavigate('tm_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'tm_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <TMIcon className="h-3.5 w-3.5 text-rose-400" />
                <span>Turing Machine Lab</span>
              </button>

              <button
                onClick={() => onNavigate('computability_lab')}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentView === 'computability_lab'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Workflow className="h-3.5 w-3.5 text-purple-400" />
                <span>PCP & Computability</span>
              </button>
            </div>
          )}
        </div>

        {/* Practice & My Lab */}
        <div className="pt-2 border-t border-slate-800 space-y-1">
          <button
            onClick={() => onNavigate('exam_mode')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'exam_mode'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span>KTU Exam Simulator</span>
          </button>

          <button
            onClick={() => onNavigate('my_lab')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'my_lab'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <BookMarked className="h-4 w-4 text-amber-400" />
            <span>My TOC Notebook & Lab</span>
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
        <span>KTU S5 Computer Science</span>
        <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
};
