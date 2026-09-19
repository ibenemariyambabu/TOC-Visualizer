import React from 'react';
import {
  BrainCircuit,
  Cpu,
  Repeat,
  FileCode2,
  Layers,
  Binary,
  Workflow,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Award,
  Flame,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { NavView } from '../../components/common/Sidebar.js';

interface DashboardPageProps {
  onNavigate: (view: NavView) => void;
  onSelectQuery: (query: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectQuery }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Hero Banner (Section 39 Requirement) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/25 shadow-2xl relative overflow-hidden bg-grid-pattern">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KTU 2024 Scheme Syllabus Aligned</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            THEORY OF COMPUTATION
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Understand it. Visualize it. Solve it.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            From DFA state transitions to undecidability proofs — see the logic, intermediate state, and output after every single step.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('solver')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Ask a TOC Question</span>
            </button>

            <button
              onClick={() => onNavigate('automata_lab')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
            >
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>Open Automata Lab</span>
            </button>

            <button
              onClick={() => onNavigate('exam_mode')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              <span>KTU Exam Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Problems Solved</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">24</span>
          <span className="text-[10px] text-emerald-400 block font-mono">100% verified logic</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">5 Days</span>
          <span className="text-[10px] text-slate-400 block font-mono">Active revision</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Accuracy</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">87.5%</span>
          <span className="text-[10px] text-emerald-400 block font-mono">+4% this week</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Saved Notebook</span>
            <Bookmark className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">12 Items</span>
          <span className="text-[10px] text-slate-400 block font-mono">Ready for exam review</span>
        </div>
      </div>

      {/* 4-Module Syllabus Mastery Progress (Section 21 Requirement) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
          KTU Syllabus Mastery Progress
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200">
                Module 1: Foundations, Finite Automata, Regex & Arden's Theorem
              </span>
              <span className="text-indigo-400 font-bold">75%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div className="h-full bg-indigo-500 rounded-full w-[75%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200">
                Module 2: Context-Free Grammars, Parse Trees & Pushdown Automata
              </span>
              <span className="text-cyan-400 font-bold">50%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div className="h-full bg-cyan-500 rounded-full w-[50%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200">
                Module 3: Turing Machines & Chomsky Hierarchy
              </span>
              <span className="text-rose-400 font-bold">35%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div className="h-full bg-rose-500 rounded-full w-[35%]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200">
                Module 4: Computability, Halting Problem & Post Correspondence Problem
              </span>
              <span className="text-purple-400 font-bold">20%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div className="h-full bg-purple-500 rounded-full w-[20%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Labs Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
          Interactive Problem-Solving Laboratories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('automata_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all shadow hover:shadow-indigo-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Cpu className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">Automata Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build DFAs and NFAs, test arbitrary strings, run subset construction and state minimization.
            </p>
          </div>

          <div
            onClick={() => onNavigate('regex_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow hover:shadow-cyan-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Repeat className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">Regex & Arden Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arden's Theorem equation solver ($X = PX + Q$), State Elimination, Thompson's construction, and Kleene's map.
            </p>
          </div>

          <div
            onClick={() => onNavigate('cfg_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow hover:shadow-emerald-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCode2 className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">CFG & Parse Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leftmost vs Rightmost derivations, dual parse tree ambiguity viewer, and CNF transformation.
            </p>
          </div>

          <div
            onClick={() => onNavigate('pda_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all shadow hover:shadow-amber-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">Pushdown Automata Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Animated vertical stack machine, matching counting states, and acceptance tracing.
            </p>
          </div>

          <div
            onClick={() => onNavigate('tm_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all shadow hover:shadow-rose-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Binary className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">Turing Machine Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Infinite bi-directional tape, read/write head, benchmark presets for $a^n b^n c^n$, and 8-question invariant guide.
            </p>
          </div>

          <div
            onClick={() => onNavigate('computability_lab')}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all shadow hover:shadow-purple-500/10 group space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Workflow className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white">PCP & Computability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Post Correspondence Problem domino puzzle, Cantor diagonalization matrix, and Halting problem paradox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
