import React, { useState } from 'react';
import { PCPTileView } from '../../visualizers/computability/PCPTileView.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { Layers, Workflow, HelpCircle, Binary, AlertOctagon, BookOpen, CheckCircle2 } from 'lucide-react';

export const ComputabilityLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pcp' | 'chomsky' | 'diagonalization' | 'halting'>('pcp');
  const [currentQuestion, setCurrentQuestion] = useState('Prove that the Halting Problem is undecidable using diagonalization');
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');

  const computabilityPresets = [
    {
      label: 'Halting Problem',
      question: 'Prove that the Halting Problem is undecidable using diagonalization',
      alphabet: ['0', '1'],
      testString: ''
    },
    {
      label: 'Post Correspondence Problem',
      question: 'Demonstrate whether this PCP domino set has a matching sequence',
      alphabet: ['0', '1'],
      testString: ''
    },
    {
      label: 'Chomsky Hierarchy',
      question: 'Classify languages across Regular, CFL, CSL, and Recursively Enumerable',
      alphabet: ['a', 'b', 'c'],
      testString: ''
    },
    {
      label: "Rice's Theorem",
      question: "Explain why any non-trivial semantic property of RE languages is undecidable",
      alphabet: ['0', '1'],
      testString: ''
    }
  ];

  const handleSolve = async (data: {
    question: string;
    alphabet: string[];
    parameters: Record<string, any>;
    testString: string;
    mode: 'LEARN' | 'EXAM';
  }) => {
    setIsSolving(true);
    setCurrentQuestion(data.question);

    try {
      const q = data.question.toLowerCase();
      if (q.includes('pcp') || q.includes('domino') || q.includes('post correspondence')) {
        setActiveTab('pcp');
      } else if (q.includes('chomsky') || q.includes('hierarchy')) {
        setActiveTab('chomsky');
      } else if (q.includes('halting')) {
        setActiveTab('halting');
      } else if (q.includes('diagonal') || q.includes('cantor')) {
        setActiveTab('diagonalization');
      }

      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`
      );
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Computability & Undecidability Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Post Correspondence Problem (PCP), Chomsky Hierarchy, Diagonalization, and the Halting Paradox (KTU 2024 Scheme)
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('pcp')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'pcp'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            PCP Domino Puzzle
          </button>

          <button
            onClick={() => setActiveTab('chomsky')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'chomsky'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Chomsky Hierarchy
          </button>

          <button
            onClick={() => setActiveTab('diagonalization')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'diagonalization'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Diagonalization Matrix
          </button>

          <button
            onClick={() => setActiveTab('halting')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'halting'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Halting Problem Paradox
          </button>
        </div>
      </div>

      {/* Reusable Question Workspace */}
      <QuestionWorkspace
        moduleName="Computability"
        initialQuestion={currentQuestion}
        presets={computabilityPresets}
        showAlphabetEditor={false}
        showTestString={false}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      {/* Tab 1: PCP */}
      {activeTab === 'pcp' && (
        <div className="space-y-4">
          <PCPTileView />
        </div>
      )}

      {/* Tab 2: Chomsky Hierarchy */}
      {activeTab === 'chomsky' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Chomsky Hierarchy of Formal Languages</h3>
            <p className="text-xs text-slate-400">
              Four nested levels of expressiveness, computational models, and grammar production formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold block w-fit">
                Type 3: Regular
              </span>
              <div className="text-slate-300"><strong>Machine:</strong> DFA / NFA</div>
              <div className="text-slate-400"><strong>Grammar:</strong> A → aB | a</div>
              <p className="text-slate-500 font-sans text-xs pt-2 border-t border-slate-850">
                Recognizes token patterns, modulo counters, prefixes/suffixes. Zero unbounded counting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold block w-fit">
                Type 2: Context-Free
              </span>
              <div className="text-slate-300"><strong>Machine:</strong> Pushdown Automaton (PDA)</div>
              <div className="text-slate-400"><strong>Grammar:</strong> A → α</div>
              <p className="text-slate-500 font-sans text-xs pt-2 border-t border-slate-850">
                Single LIFO stack. Handles nested structures, palindromes, 0^n 1^n.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold block w-fit">
                Type 1: Context-Sensitive
              </span>
              <div className="text-slate-300"><strong>Machine:</strong> Linear Bounded Automaton</div>
              <div className="text-slate-400"><strong>Grammar:</strong> αAβ → αγβ</div>
              <p className="text-slate-500 font-sans text-xs pt-2 border-t border-slate-850">
                Bounded tape storage. Recognizes languages like a^n b^n c^n.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold block w-fit">
                Type 0: Unrestricted (RE)
              </span>
              <div className="text-slate-300"><strong>Machine:</strong> Turing Machine</div>
              <div className="text-slate-400"><strong>Grammar:</strong> α → β</div>
              <p className="text-slate-500 font-sans text-xs pt-2 border-t border-slate-850">
                Universal computation. Recognizes all recursively enumerable languages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Diagonalization Matrix */}
      {activeTab === 'diagonalization' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Cantor's Diagonalization Argument</h3>
            <p className="text-xs text-slate-400">
              Visualizing how flipping the diagonal elements constructs a language outside any countable enumeration.
            </p>
          </div>

          <div className="overflow-x-auto p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2 text-left">Machine \ Input</th>
                  <th className="p-2">w1</th>
                  <th className="p-2">w2</th>
                  <th className="p-2">w3</th>
                  <th className="p-2">w4</th>
                  <th className="p-2">...</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-850">
                  <td className="p-2 text-left font-bold text-indigo-400">M1</td>
                  <td className="p-2 bg-indigo-500/20 text-indigo-300 font-bold">ACCEPT</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2">LOOP</td>
                  <td className="p-2">...</td>
                </tr>
                <tr className="border-b border-slate-850">
                  <td className="p-2 text-left font-bold text-indigo-400">M2</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2 bg-indigo-500/20 text-indigo-300 font-bold">REJECT</td>
                  <td className="p-2">LOOP</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2">...</td>
                </tr>
                <tr className="border-b border-slate-850">
                  <td className="p-2 text-left font-bold text-indigo-400">M3</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2 bg-indigo-500/20 text-indigo-300 font-bold">ACCEPT</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2">...</td>
                </tr>
                <tr className="border-b border-slate-850">
                  <td className="p-2 text-left font-bold text-indigo-400">M4</td>
                  <td className="p-2">LOOP</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2 bg-indigo-500/20 text-indigo-300 font-bold">LOOP</td>
                  <td className="p-2">...</td>
                </tr>
                <tr className="bg-rose-500/10 text-rose-300 font-bold">
                  <td className="p-2 text-left">Flipped Diagonal (D)</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2">ACCEPT</td>
                  <td className="p-2">REJECT</td>
                  <td className="p-2">HALT</td>
                  <td className="p-2">...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Halting Problem Paradox */}
      {activeTab === 'halting' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">The Halting Problem Undecidability Proof</h3>
            <p className="text-xs text-slate-400">
              Step-by-step contradiction derivation proving that no general algorithm can decide program halting.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-indigo-400 font-bold block text-sm">Step 1: Indirect Assumption</span>
              <p className="text-slate-300 font-sans">
                Assume there exists a hypothetical decider Turing Machine <strong>H(&lt;M, w&gt;)</strong>:
              </p>
              <div className="text-emerald-400">H(&lt;M, w&gt;) = ACCEPT if M halts on w</div>
              <div className="text-rose-400">H(&lt;M, w&gt;) = REJECT if M loops forever on w</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block text-sm">Step 2: Construct Diagonal Machine D</span>
              <p className="text-slate-300 font-sans">
                Construct machine <strong>D(&lt;M&gt;)</strong> that invokes H on (&lt;M, &lt;M&gt;&gt;) and inverts the output:
              </p>
              <div className="text-slate-200">If H accepts &lt;M, &lt;M&gt;&gt; → D LOOPS forever</div>
              <div className="text-slate-200">If H rejects &lt;M, &lt;M&gt;&gt; → D HALTS immediately</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <span className="text-rose-400 font-bold block text-sm">Step 3: Self-Referential Paradox</span>
              <p className="font-sans text-slate-300">
                What happens when D is executed on its own description <strong>&lt;D&gt;</strong>?
              </p>
              <div className="font-bold text-rose-200 py-1">
                D(&lt;D&gt;) halts ⟺ D(&lt;D&gt;) loops forever!
              </div>
              <p className="font-sans text-slate-300">
                Since a program cannot simultaneously halt and loop, the assumption that decider H exists is impossible.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <strong>Conclusion:</strong> The Halting Problem (H_TM) is UNDECIDABLE (not recursive).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
