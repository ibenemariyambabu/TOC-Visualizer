import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, X, Cpu, Repeat, FileCode2, Layers, Binary, Workflow } from 'lucide-react';
import { NavView } from './Sidebar.js';

interface CommandItem {
  title: string;
  category: string;
  action: () => void;
  icon: any;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  onNavigate: (view: NavView) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectQuery,
  onNavigate
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : {};
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    {
      title: 'Design DFA for substring "ab"',
      category: 'DFA Solver',
      icon: Cpu,
      action: () => {
        onSelectQuery('Design a DFA over {a,b} that accepts all strings containing the substring "ab"');
        onNavigate('solver');
        onClose();
      }
    },
    {
      title: 'Design DFA for binary numbers divisible by 3',
      category: 'DFA Solver',
      icon: Cpu,
      action: () => {
        onSelectQuery('Design a DFA over {0,1} that accepts binary numbers divisible by 3');
        onNavigate('solver');
        onClose();
      }
    },
    {
      title: "Arden's Theorem: Solve X = aX + b",
      category: "Arden's Theorem",
      icon: Repeat,
      action: () => {
        onSelectQuery("Solve the regular expression equation X = aX + b using Arden's Theorem");
        onNavigate('regex_lab');
        onClose();
      }
    },
    {
      title: 'Subset Construction (NFA to DFA)',
      category: 'Conversions',
      icon: Cpu,
      action: () => {
        onNavigate('automata_lab');
        onClose();
      }
    },
    {
      title: 'DFA Minimization (Partition Refinement)',
      category: 'Minimization',
      icon: Cpu,
      action: () => {
        onNavigate('automata_lab');
        onClose();
      }
    },
    {
      title: 'Prove L = { a^n b^n } is not regular (Pumping Lemma)',
      category: 'Pumping Lemma',
      icon: Repeat,
      action: () => {
        onSelectQuery('Prove that L = { a^n b^n | n >= 0 } is not regular using the Pumping Lemma');
        onNavigate('solver');
        onClose();
      }
    },
    {
      title: 'Ambiguity Explorer (Dual Parse Trees)',
      category: 'CFG Lab',
      icon: FileCode2,
      action: () => {
        onNavigate('cfg_lab');
        onClose();
      }
    },
    {
      title: 'Simulate PDA for L = { a^n b^n }',
      category: 'PDA Lab',
      icon: Layers,
      action: () => {
        onNavigate('pda_lab');
        onClose();
      }
    },
    {
      title: 'Simulate Turing Machine for L = { a^n b^n c^n }',
      category: 'TM Lab',
      icon: Binary,
      action: () => {
        onNavigate('tm_lab');
        onClose();
      }
    },
    {
      title: 'Prove Halting Problem is Undecidable',
      category: 'Computability',
      icon: Workflow,
      action: () => {
        onSelectQuery('Prove that the Halting Problem of Turing Machines is undecidable');
        onNavigate('solver');
        onClose();
      }
    },
    {
      title: 'Post Correspondence Problem (PCP Domino Puzzle)',
      category: 'Computability',
      icon: Workflow,
      action: () => {
        onNavigate('computability_lab');
        onClose();
      }
    },
    {
      title: 'Launch KTU Exam Simulator (Timed)',
      category: 'Exam Mode',
      icon: Sparkles,
      action: () => {
        onNavigate('exam_mode');
        onClose();
      }
    }
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="h-4 w-4 text-indigo-400" />
          <input
            type="text"
            placeholder="Type a question, topic, or command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-200">{item.title}</span>
                      <span className="ml-2 text-[10px] text-slate-500 font-mono">[{item.category}]</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands. Press Enter to ask in the Universal Solver.
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[10px] text-slate-500">
          <span>Navigate with arrows, select with Enter</span>
          <span className="font-mono">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
