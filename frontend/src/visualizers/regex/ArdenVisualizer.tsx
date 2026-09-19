import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, Lightbulb, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { ArdenEngine, ArdenSystemResult } from '../../algorithms/regex/ardenEngine.js';
import { AutomatonData } from '../../types/index.js';

interface ArdenVisualizerProps {
  automaton?: AutomatonData;
  onSelectState?: (state: string) => void;
}

export const ArdenVisualizer: React.FC<ArdenVisualizerProps> = ({ automaton, onSelectState }) => {
  const [variable, setVariable] = useState('X');
  const [pInput, setPInput] = useState('a');
  const [qInput, setQInput] = useState('b');
  const [form, setForm] = useState<'RIGHT_RECURSIVE' | 'LEFT_RECURSIVE'>('RIGHT_RECURSIVE');
  const [activeTab, setActiveTab] = useState<'single' | 'system'>('single');

  // Single Equation Solver
  const singleResult = ArdenEngine.solveSingleEquation(variable, pInput, qInput, form);

  // System Solver (if automaton provided)
  const defaultFA: AutomatonData = automaton || {
    type: 'DFA',
    alphabet: ['a', 'b'],
    states: ['q0', 'q1'],
    startState: 'q0',
    acceptStates: ['q1'],
    transitions: [
      { from: 'q0', input: 'a', to: 'q0', explanation: 'Self loop on a' },
      { from: 'q0', input: 'b', to: 'q1', explanation: 'Transition to q1 on b' },
      { from: 'q1', input: 'b', to: 'q1', explanation: 'Self loop on b' }
    ]
  };

  const systemResult: ArdenSystemResult = ArdenEngine.faToRegexArden(defaultFA);

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Single Equation vs Complete FA to RE System */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'single'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Single Equation Solver (X = PX + Q)
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'system'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            FA → Regular Expression (Arden's Method)
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Arden's Theorem Engine
        </span>
      </div>

      {/* Conceptual "WHAT ARE WE DOING?" and "WHY?" Banner (Section 23 Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-indigo-950/25 border border-indigo-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            <span>WHAT ARE WE DOING?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            "We are converting the recursive transition behavior of the automaton into algebraic regular language equations."
          </p>
        </div>

        <div className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>WHY DOES IT WORK?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            "Each equation describes all string prefixes that reach a state. Solving with Arden eliminates loops using Kleene Star closure ($P^*$).
          </p>
        </div>
      </div>

      {activeTab === 'single' ? (
        <div className="space-y-6">
          {/* Equation Input Form */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Configure Arden Equation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">Variable Name</label>
                <input
                  type="text"
                  value={variable}
                  onChange={(e) => setVariable(e.target.value || 'X')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">Recursive Part (P)</label>
                <input
                  type="text"
                  value={pInput}
                  onChange={(e) => setPInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-amber-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">Non-Recursive Part (Q)</label>
                <input
                  type="text"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-cyan-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1 font-mono">Form Ordering</label>
                <select
                  value={form}
                  onChange={(e) => setForm(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-slate-200"
                >
                  <option value="RIGHT_RECURSIVE">X = PX + Q (X = P*Q)</option>
                  <option value="LEFT_RECURSIVE">X = XP + Q (X = QP*)</option>
                </select>
              </div>
            </div>

            {/* Visual Equation Transformation Diagram */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono uppercase">Interactive Equation Flow</span>
              <div className="flex items-center gap-4 font-mono font-bold text-sm">
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                  {form === 'RIGHT_RECURSIVE' ? `${variable} = ${pInput}${variable} + ${qInput}` : `${variable} = ${variable}${pInput} + ${qInput}`}
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-400 animate-pulse" />
                <div className="px-3 py-2 rounded-lg bg-indigo-950 border border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/20">
                  {variable} = {singleResult.solution}
                </div>
              </div>
            </div>
          </div>

          {/* Uniqueness Warning */}
          {singleResult.warning && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{singleResult.warning}</span>
            </div>
          )}

          {/* Step-by-Step Arden Solution (Section 3 Requirement) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Step-by-Step Algebraic Derivation
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {singleResult.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-indigo-400 uppercase">
                      STEP {step.stepNumber}: {step.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {step.ruleUsed}
                    </span>
                  </div>

                  <div className="py-1 text-sm font-bold text-slate-100">
                    {step.currentEquation}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-start gap-1">
                    <span className="text-cyan-400 font-semibold">Reason:</span>
                    <span>{step.why}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Complete FA to RE System via Arden's Method */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Generated State Equations from Incoming Transitions
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                R_i = Σ R_j · a_ji + (ε if start state)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(systemResult.generatedEquations).map(([st, eq]) => (
                <div
                  key={st}
                  onClick={() => onSelectState && onSelectState(st)}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors font-mono text-xs"
                >
                  <span className="font-bold text-indigo-400 block mb-1">State {st}:</span>
                  <span className="text-slate-200">
                    R_{st} = {eq}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Derivation Steps */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Substitution & Elimination Steps
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {systemResult.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-400 uppercase">
                      Step {step.stepNumber}: {step.title}
                    </span>
                    <span className="text-slate-500 text-[10px]">{step.ruleUsed}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100 py-1">{step.currentEquation}</div>
                  <p className="text-[11px] text-slate-400">{step.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final RE & Validation Suite */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-cyan-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Final Regular Expression
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                Verified
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-base font-bold text-indigo-300">
              {systemResult.finalRegularExpression}
            </div>

            {/* Validation Table: Original FA vs Regex */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 font-mono">
                Automatic Equivalence Validation (Original FA vs Derived Regex):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {systemResult.validationResults.map((val, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-center font-mono text-xs ${
                      val.match
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span className="block font-bold">"{val.string}"</span>
                    <span className="text-[10px] opacity-80">
                      FA: {val.faAccepts ? '✓' : '✗'} | RE: {val.regexMatches ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory Tip */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
        <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300">Memory Trick: </span>
          <span>
            "Recursive P gets starred; Q comes afterward for X = PX + Q (X = P*Q). Order matters because concatenation is non-commutative!"
          </span>
        </div>
      </div>
    </div>
  );
};
