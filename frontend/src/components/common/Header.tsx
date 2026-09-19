import React from 'react';
import { Search, Command, BookOpen, Sparkles, Award } from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  activeModuleTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, activeModuleTitle }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">TOC Visualizer</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                KTU 2024 Scheme
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Interactive Theory of Computation Laboratory</p>
          </div>
        </div>

        {activeModuleTitle && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span className="truncate max-w-xs font-medium text-slate-300">{activeModuleTitle}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Command Palette Button (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-all hover:border-indigo-500/50 group"
          title="Search topics, questions, theorems (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="hidden md:inline text-slate-400">Search topics, algorithms, proofs...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Award className="h-3.5 w-3.5" />
          <span>Active Learning</span>
        </div>
      </div>
    </header>
  );
};
