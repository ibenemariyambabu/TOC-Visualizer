import React, { useState, useEffect } from 'react';
import { BookMarked, Bookmark, FileText, AlertTriangle, Trash2, Plus, CheckCircle2 } from 'lucide-react';

interface SavedProblem {
  id: string;
  question: string;
  topic: string;
  difficulty: number;
  finalAnswer: string;
  notes?: string;
  timestamp: string;
}

export const MyTOCLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'saved' | 'notes' | 'mistakes'>('saved');
  const [savedProblems, setSavedProblems] = useState<SavedProblem[]>([]);
  const [personalNotes, setPersonalNotes] = useState<string>('');

  useEffect(() => {
    // Load from LocalStorage
    const storedProblems = localStorage.getItem('toc_saved_problems');
    if (storedProblems) {
      try {
        setSavedProblems(JSON.parse(storedProblems));
      } catch {}
    } else {
      // Benchmark initial items
      const initial: SavedProblem[] = [
        {
          id: '1',
          question: 'Design a DFA for strings containing substring ab',
          topic: 'DFA Substring',
          difficulty: 3,
          finalAnswer: '3-state DFA with states {q0, q1, q2} and accept state q2.',
          notes: 'Remember: states represent the matched prefix progress!',
          timestamp: new Date().toLocaleDateString()
        },
        {
          id: '2',
          question: "Solve X = aX + b using Arden's Theorem",
          topic: "Arden's Theorem",
          difficulty: 3,
          finalAnswer: 'X = a*b',
          notes: 'Check condition: epsilon must not be in P!',
          timestamp: new Date().toLocaleDateString()
        }
      ];
      setSavedProblems(initial);
      localStorage.setItem('toc_saved_problems', JSON.stringify(initial));
    }

    const storedNotes = localStorage.getItem('toc_personal_notes');
    if (storedNotes) setPersonalNotes(storedNotes);
  }, []);

  const handleSaveNotes = (text: string) => {
    setPersonalNotes(text);
    localStorage.setItem('toc_personal_notes', text);
  };

  const handleDeleteProblem = (id: string) => {
    const updated = savedProblems.filter((p) => p.id !== id);
    setSavedProblems(updated);
    localStorage.setItem('toc_saved_problems', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">My TOC Lab & Notebook</h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal repository of saved problems, models, notes, and mistake tracker
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved Problems ({savedProblems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'mistakes'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Mistake Tracker (Weak Areas)</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>My Personal Notes</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Saved Problems */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedProblems.length > 0 ? (
            savedProblems.map((prob) => (
              <div
                key={prob.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                      {prob.topic}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Level {prob.difficulty} • Saved on {prob.timestamp}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteProblem(prob.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remove from Saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-sm font-semibold text-slate-100">{prob.question}</h3>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-xs font-mono text-slate-300">
                  <span className="text-indigo-400 font-bold block mb-1">Answer:</span>
                  {prob.finalAnswer}
                </div>

                {prob.notes && (
                  <div className="text-xs text-amber-300/90 font-mono italic">
                    Note: "{prob.notes}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No problems saved yet. Click "Save" on any problem in the Universal Solver!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mistake Tracker (Section 20 Requirement) */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
              Diagnostic Analysis: My Weak Areas
            </span>
            <p className="text-xs text-slate-400">
              Concepts where recurring mistakes occur. Focus revision on these core theoretical points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">DFA Trap States</span>
                <span className="text-xs font-mono font-bold text-rose-400">4 Mistakes</span>
              </div>
              <p className="text-xs text-slate-400">
                Forgetting to define transitions for all alphabet symbols from trap states.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Pumping Lemma Logic</span>
                <span className="text-xs font-mono font-bold text-rose-400">7 Mistakes</span>
              </div>
              <p className="text-xs text-slate-400">
                Pumping Lemma proves NON-regularity, not regularity! Check condition |xy| ≤ p.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Arden's Term Ordering</span>
                <span className="text-xs font-mono font-bold text-rose-400">2 Mistakes</span>
              </div>
              <p className="text-xs text-slate-400">
                Applying X = PX + Q as X = QP* instead of X = P*Q. Order matters!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Personal Notes */}
      {activeTab === 'notes' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Scratchpad & Personal Theory Notes
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="h-3 w-3" /> Auto-saved
            </span>
          </div>

          <textarea
            value={personalNotes}
            onChange={(e) => handleSaveNotes(e.target.value)}
            rows={12}
            placeholder="Write down exam formulas, theorems, state invariants, or reminders here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
