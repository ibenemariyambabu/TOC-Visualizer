import React, { useState } from 'react';
import { ParseTreeView } from '../../visualizers/cfg/ParseTreeView.js';
import { CFGEngine } from '../../algorithms/cfg/cfgEngine.js';
import { CFGGrammar } from '../../types/index.js';
import { QuestionWorkspace } from '../../components/common/QuestionWorkspace.js';
import { FileCode2, ArrowRight, Layers, Sliders, CheckCircle2 } from 'lucide-react';

export const CFGLab: React.FC = () => {
  const [derivationMode, setDerivationMode] = useState<'LEFTMOST' | 'RIGHTMOST'>('LEFTMOST');
  const [targetString, setTargetString] = useState('0011');
  const [currentQuestion, setCurrentQuestion] = useState('Derive string 0011 using CFG for L = { 0^n 1^n }');
  const [currentAlphabet, setCurrentAlphabet] = useState<string[]>(['0', '1']);
  const [isSolving, setIsSolving] = useState(false);
  const [solvedHash, setSolvedHash] = useState('');

  const [grammar, setGrammar] = useState<CFGGrammar>({
    variables: ['S'],
    terminals: ['0', '1'],
    startSymbol: 'S',
    productions: [{ from: 'S', to: ['0S1', 'ε'] }]
  });

  const cfgPresets = [
    {
      label: '0^n 1^n (Binary)',
      question: 'Derive string 0011 using CFG for L = { 0^n 1^n }',
      alphabet: ['0', '1'],
      testString: '0011'
    },
    {
      label: 'a^n b^n (Standard)',
      question: 'Derive string aabb using CFG for L = { a^n b^n }',
      alphabet: ['a', 'b'],
      testString: 'aabb'
    },
    {
      label: 'Balanced Parentheses',
      question: 'Derive (()) using CFG for balanced parentheses',
      alphabet: ['(', ')'],
      testString: '(())'
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
    setTargetString(data.testString);

    try {
      const a = data.alphabet[0] || '0';
      const b = data.alphabet[1] || '1';
      const updatedGrammar: CFGGrammar = {
        variables: ['S'],
        terminals: [a, b],
        startSymbol: 'S',
        productions: [{ from: 'S', to: [`${a}S${b}`, 'ε'] }]
      };
      setGrammar(updatedGrammar);
      setSolvedHash(
        `${data.question.trim()}_${[...data.alphabet].sort().join(',')}_${JSON.stringify(data.parameters)}`
      );
    } finally {
      setIsSolving(false);
    }
  };

  const derivation =
    derivationMode === 'LEFTMOST'
      ? CFGEngine.deriveLeftmost(grammar, targetString)
      : CFGEngine.deriveRightmost(grammar, targetString);

  const cnfResult = CFGEngine.toCNF(grammar);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Context-Free Grammar Lab</h2>
          <p className="text-xs text-slate-400 mt-1">
            Derivations (Leftmost vs Rightmost), Ambiguity, and Normal Forms (CNF/GNF) (KTU 2024 Scheme)
          </p>
        </div>

        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => setDerivationMode('LEFTMOST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              derivationMode === 'LEFTMOST'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Leftmost Derivation
          </button>
          <button
            onClick={() => setDerivationMode('RIGHTMOST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              derivationMode === 'RIGHTMOST'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Rightmost Derivation
          </button>
        </div>
      </div>

      {/* Question Workspace */}
      <QuestionWorkspace
        moduleName="CFG"
        initialQuestion={currentQuestion}
        initialAlphabet={currentAlphabet}
        initialTestString={targetString}
        presets={cfgPresets}
        onSolve={handleSolve}
        isSolving={isSolving}
        solvedQuestionHash={solvedHash}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Derivation Steps Column */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-indigo-400 font-bold uppercase block">
              Active Production Rules (G = (V, T, P, S))
            </span>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
              {grammar.productions.map((p, idx) => (
                <div key={idx}>{p.from} → {p.to.join(' | ')}</div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {derivationMode} Derivation Steps for "{targetString}"
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                {derivation.steps.length} Steps
              </span>
            </div>

            <div className="space-y-2">
              {derivation.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1"
                >
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>Step {step.stepNumber}: Expand [{step.targetNonTerminal}]</span>
                    <span className="text-slate-400">Rule: {step.productionUsed}</span>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm tracking-widest py-1">
                    ⇒ {step.resultingSententialForm}
                  </div>
                  <p className="text-slate-400 font-sans text-xs">{step.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Parse Tree Canvas Column */}
        <div className="lg:col-span-7 space-y-4">
          <ParseTreeView isAmbiguousDemo={false} />

          {/* CNF Conversion Panel */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Chomsky Normal Form (CNF) Equivalent
            </span>
            <p className="text-slate-400 font-sans text-xs">
              Every production satisfies A → BC or A → a.
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 space-y-1">
              {cnfResult.cnfGrammar.productions.map((p, idx) => (
                <div key={idx}>{p.from} → {p.to.join(' | ')}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
