import React, { useState } from 'react';
import { ArdenVisualizer } from '../../visualizers/regex/ArdenVisualizer.js';
import { StateEliminationVisualizer } from '../../visualizers/regex/StateEliminationVisualizer.js';
import { RegexEngine } from '../../algorithms/regex/regexEngine.js';
import { AutomataGraphView } from '../../visualizers/automata/AutomataGraphView.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { Repeat, ArrowRight, Network, Sparkles, Layers, BookOpen } from 'lucide-react';

export const RegexLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'regex_to_fa' | 'fa_to_regex_arden' | 'fa_to_regex_elim' | 'kleene_map'
  >('fa_to_regex_arden');

  const [currentQuestion, setCurrentQuestion] = useState('Solve using Arden theorem: X = aX + b');
  const [currentAlphabet, setCurrentAlphabet] = useState<string[]>(['a', 'b']);
  const [regexInput, setRegexInput] = useState('(a|b)*abb');
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');

  const regexPresets = [
    {
      label: 'Arden: X = aX + b',
      question: 'Solve using Arden theorem: X = aX + b',
      alphabet: ['a', 'b'],
      testString: 'ab'
    },
    {
      label: 'Arden: X = 0X + 1',
      question: 'Solve using Arden theorem: X = 0X + 1',
      alphabet: ['0', '1'],
      testString: '01'
    },
    {
      label: 'Thompson: (0+1)*01',
      question: 'Convert (0+1)*01 to equivalent ε-NFA',
      alphabet: ['0', '1'],
      testString: '0101'
    },
    {
      label: 'Thompson: (a+b)*ab',
      question: 'Convert (a+b)*ab to equivalent ε-NFA',
      alphabet: ['a', 'b'],
      testString: 'aab'
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
    setCurrentAlphabet(data.alphabet);

    try {
      const q = data.question.toLowerCase();
      if (q.includes('0+1') || q.includes('(0|1)')) {
        setRegexInput('(0|1)*01');
        setActiveTab('regex_to_fa');
      } else if (q.includes('a+b') || q.includes('(a|b)')) {
        setRegexInput('(a|b)*ab');
        setActiveTab('regex_to_fa');
      } else if (q.includes('arden')) {
        setActiveTab('fa_to_regex_arden');
      }

      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`
      );
    } finally {
      setIsSolving(false);
    }
  };

  const thompsonResult = RegexEngine.regexToNFA(regexInput);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Regex Conversion Lab
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Arden's Theorem, State Elimination, Thompson's Construction, and Kleene's Theorem (KTU 2024 Scheme)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('fa_to_regex_arden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'fa_to_regex_arden'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            FA → Regex (Arden's Method)
          </button>

          <button
            onClick={() => setActiveTab('fa_to_regex_elim')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'fa_to_regex_elim'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            FA → Regex (State Elimination)
          </button>

          <button
            onClick={() => setActiveTab('regex_to_fa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'regex_to_fa'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Regex → FA (Thompson's)
          </button>

          <button
            onClick={() => setActiveTab('kleene_map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'kleene_map'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Kleene's Theorem Map
          </button>
        </div>
      </div>

      {/* Reusable Question Workspace */}
      <QuestionWorkspace
        moduleName="Regex"
        initialQuestion={currentQuestion}
        initialAlphabet={currentAlphabet}
        presets={regexPresets}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      {/* Tab 1: Arden's Method */}
      {activeTab === 'fa_to_regex_arden' && (
        <div className="space-y-4">
          <ArdenVisualizer />
        </div>
      )}

      {/* Tab 2: State Elimination */}
      {activeTab === 'fa_to_regex_elim' && (
        <div className="space-y-4">
          <StateEliminationVisualizer />
        </div>
      )}

      {/* Tab 3: Thompson's Construction */}
      {activeTab === 'regex_to_fa' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 font-mono">
                Active Regular Expression:
              </span>
              <input
                type="text"
                value={regexInput}
                onChange={(e) => setRegexInput(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-indigo-300 font-mono font-bold text-sm focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-400">
              Generates equivalent ε-NFA compositionally
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase font-mono block">
                Resulting Thompson ε-NFA Diagram
              </span>
              <AutomataGraphView automaton={thompsonResult.nfa} />
            </div>

            <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Thompson Compositional Steps
              </span>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {thompsonResult.constructionSteps.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-850 space-y-1">
                    <div className="text-indigo-300 font-bold">
                      Step {idx + 1}: Thompson Composition Fragment
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Kleene's Theorem Tri-Directional Map */}
      {activeTab === 'kleene_map' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Kleene's Equivalence Theorem</h3>
            <p className="text-xs text-slate-400">
              A language is accepted by a Finite Automaton if and only if it can be defined by a Regular Expression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
              <span className="text-indigo-400 font-bold block text-sm">Regular Expressions (RE)</span>
              <p className="text-slate-400 font-sans">Declarative specification of language strings via union, concat, and star.</p>
              <div className="pt-2 text-slate-300">Convert to ε-NFA via <strong>Thompson's Construction</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <span className="text-cyan-400 font-bold block text-sm">Nondeterministic FA (NFA)</span>
              <p className="text-slate-400 font-sans">Automaton permitting multiple choice and ε transitions.</p>
              <div className="pt-2 text-slate-300">Convert to DFA via <strong>Subset Construction</strong></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">Deterministic FA (DFA)</span>
              <p className="text-slate-400 font-sans">Single unique transition for every state-symbol pair.</p>
              <div className="pt-2 text-slate-300">Convert to RE via <strong>Arden's Theorem</strong> or <strong>State Elimination</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
