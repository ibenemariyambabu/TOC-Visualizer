import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RotateCcw,
  Plus,
  X,
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Play,
  CheckCircle2,
  HelpCircle,
  Copy
} from 'lucide-react';
import { Tokenizer } from '../../algorithms/common/tokenizer.js';
import { QuestionLibraryStore, SavedQuestion } from '../../modules/storage/questionLibrary.js';

export interface PresetItem {
  label: string;
  question: string;
  alphabet?: string[];
  parameters?: Record<string, any>;
  testString?: string;
}

export interface QuestionWorkspaceProps {
  moduleName: string; // e.g. 'Automata', 'Regex', 'PDA', 'TM', 'CFG', 'Computability'
  initialQuestion?: string;
  initialAlphabet?: string[];
  initialParameters?: Record<string, any>;
  initialTestString?: string;
  presets?: PresetItem[];
  showAlphabetEditor?: boolean;
  showParameterEditor?: boolean;
  parameterName?: string;
  parameterLabel?: string;
  showTestString?: boolean;
  onSolve: (data: {
    question: string;
    alphabet: string[];
    parameters: Record<string, any>;
    testString: string;
    mode: 'LEARN' | 'EXAM';
  }) => void;
  isSolving?: boolean;
  // External hash indicator to track stale solution
  solvedQuestionHash?: string;
}

export const QuestionWorkspace: React.FC<QuestionWorkspaceProps> = ({
  moduleName,
  initialQuestion = 'Construct a DFA over {0,1} accepting binary strings divisible by 3',
  initialAlphabet = ['0', '1'],
  initialParameters = {},
  initialTestString = '110',
  presets = [],
  showAlphabetEditor = true,
  showParameterEditor = false,
  parameterName = 'modulus',
  parameterLabel = 'Modulus (m)',
  showTestString = true,
  onSolve,
  isSolving = false,
  solvedQuestionHash = ''
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [alphabet, setAlphabet] = useState<string[]>(initialAlphabet);
  const [parameters, setParameters] = useState<Record<string, any>>(initialParameters);
  const [testString, setTestString] = useState(initialTestString);
  const [mode, setMode] = useState<'LEARN' | 'EXAM'>('LEARN');

  // New symbol input state
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  // Saved feedback
  const [isSaved, setIsSaved] = useState(false);

  // Compute current state hash to check against solvedQuestionHash
  const currentHash = useMemo(() => {
    return `${question.trim()}_${[...alphabet].sort().join(',')}_${JSON.stringify(parameters)}`;
  }, [question, alphabet, parameters]);

  const isStale = Boolean(solvedQuestionHash && solvedQuestionHash !== currentHash);

  // Quick alphabet presets
  const standardAlphabets = [
    { label: '{0, 1}', symbols: ['0', '1'] },
    { label: '{a, b}', symbols: ['a', 'b'] },
    { label: '{a, b, c}', symbols: ['a', 'b', 'c'] },
    { label: '{0, 1, 2}', symbols: ['0', '1', '2'] },
    { label: '{x, y}', symbols: ['x', 'y'] }
  ];

  // Auto-detect alphabet when user types e.g. "over {0,1}" or "on {a,b,c}"
  useEffect(() => {
    const detected = Tokenizer.extractAlphabetFromQuestion(question);
    if (detected && detected.length > 0) {
      const isDifferent =
        detected.length !== alphabet.length ||
        !detected.every((sym) => alphabet.includes(sym));
      if (isDifferent) {
        setAlphabet(detected);
      }
    }
  }, [question]);

  const handleAddSymbol = () => {
    if (!newSymbol.trim()) return;
    const clean = newSymbol.trim();
    if (clean === 'ε' || clean === 'lambda' || clean === 'λ') {
      alert('Note: ε represents the empty string, not an alphabet symbol. Test strings can be empty.');
      setNewSymbol('');
      setIsAddingSymbol(false);
      return;
    }
    if (!alphabet.includes(clean)) {
      setAlphabet([...alphabet, clean]);
    }
    setNewSymbol('');
    setIsAddingSymbol(false);
  };

  const handleRemoveSymbol = (sym: string) => {
    if (alphabet.length <= 1) {
      alert('An alphabet must contain at least one symbol.');
      return;
    }
    setAlphabet(alphabet.filter((s) => s !== sym));
  };

  const handleApplyPreset = (preset: PresetItem) => {
    setQuestion(preset.question);
    if (preset.alphabet) setAlphabet(preset.alphabet);
    if (preset.parameters) setParameters(preset.parameters);
    if (preset.testString !== undefined) setTestString(preset.testString);

    // Automatically trigger solve for presets
    onSolve({
      question: preset.question,
      alphabet: preset.alphabet || alphabet,
      parameters: preset.parameters || parameters,
      testString: preset.testString !== undefined ? preset.testString : testString,
      mode
    });
  };

  const handleGenerate = () => {
    onSolve({
      question,
      alphabet,
      parameters,
      testString,
      mode
    });
  };

  const handleReset = () => {
    setQuestion(initialQuestion);
    setAlphabet(initialAlphabet);
    setParameters(initialParameters);
    setTestString(initialTestString);
  };

  const handleSaveToLibrary = () => {
    QuestionLibraryStore.save({
      module: moduleName,
      question,
      alphabet,
      parameters,
      testString
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-5 md:p-6 space-y-5 backdrop-blur-md">
      {/* Top Header: Module Badge, Learn vs Exam Mode, Save to Library */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            {moduleName} Lab Workspace
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Universal Editable Question Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Learn Mode vs Exam Mode Toggle (Requirement 37) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMode('LEARN')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                mode === 'LEARN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Learn Mode: Detailed mathematical steps, memory logic, why it works"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Learn Mode</span>
            </button>
            <button
              onClick={() => setMode('EXAM')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                mode === 'EXAM'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Exam Mode: Focus on formal KTU exam format (2/5/10 marks)"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Exam Mode</span>
            </button>
          </div>

          {/* Save Question */}
          <button
            onClick={handleSaveToLibrary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isSaved
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Save this question to Question Library for future reuse"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-3.5 w-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="h-3.5 w-3.5" />
                <span>Save Question</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Question Chips */}
      {presets.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            KTU Syllabus Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Question Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>Problem Statement</span>
            <span className="text-[10px] text-indigo-400 font-mono font-normal">
              (Fully editable — change parameters or language anytime)
            </span>
          </label>
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Construct a DFA over {0,1} accepting binary strings divisible by 3"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all"
          />
        </div>
      </div>

      {/* Alphabet & Parameter Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Alphabet Editor (Requirement 3, 4, 27) */}
        {showAlphabetEditor && (
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Alphabet Σ = &#123;{alphabet.join(', ')}&#125;
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">Quick:</span>
                {standardAlphabets.map((sa, i) => (
                  <button
                    key={i}
                    onClick={() => setAlphabet(sa.symbols)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-indigo-300 font-mono"
                  >
                    {sa.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              {alphabet.map((sym) => (
                <div
                  key={sym}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-xs shadow-sm"
                >
                  <span>{sym}</span>
                  <button
                    onClick={() => handleRemoveSymbol(sym)}
                    className="hover:text-red-400 transition-colors ml-0.5"
                    title={`Remove '${sym}' from alphabet`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {isAddingSymbol ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    maxLength={3}
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSymbol();
                      if (e.key === 'Escape') setIsAddingSymbol(false);
                    }}
                    placeholder="sym"
                    autoFocus
                    className="w-14 px-2 py-0.5 rounded bg-slate-900 border border-indigo-500 text-white font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleAddSymbol}
                    className="px-2 py-0.5 rounded bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAddingSymbol(false)}
                    className="p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingSymbol(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add symbol</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Optional Parameter Editor */}
        {showParameterEditor && (
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">{parameterLabel}</span>
            <input
              type="text"
              value={parameters[parameterName] ?? ''}
              onChange={(e) =>
                setParameters({ ...parameters, [parameterName]: e.target.value })
              }
              placeholder="e.g. 3"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Input/Test String Runner */}
        {showTestString && (
          <div className={showParameterEditor ? 'md:col-span-3 space-y-2' : 'md:col-span-5 space-y-2'}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Input String (w)</span>
              <div className="flex gap-1 font-mono text-[10px]">
                {alphabet.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTestString((prev) => prev + s)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    +{s}
                  </button>
                ))}
                <button
                  onClick={() => setTestString('ε')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 hover:text-amber-300"
                  title="Empty string (epsilon)"
                >
                  ε
                </button>
                <button
                  onClick={() => setTestString('')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  title="Clear input"
                >
                  Clear
                </button>
              </div>
            </div>

            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter string to test e.g. 0101"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 tracking-wider"
            />
          </div>
        )}
      </div>

      {/* Stale Solution Invalidation Warning (Requirement 28 & 29) */}
      {isStale && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong>Question modified:</strong> The previously displayed solution is out of date. Click{' '}
            <strong>[Generate Solution]</strong> to regenerate the automaton, grammar, and formal steps.
          </span>
        </div>
      )}

      {/* Action Buttons: Generate Solution & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-500">
          Deterministic KTU Solver Engine • Modulo Remainder Arithmetic • KMP Substring Machine
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={isSolving || !question.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSolving ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Solving...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Solution</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
