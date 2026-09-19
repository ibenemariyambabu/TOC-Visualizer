import React from 'react';
import { RegexEngine } from '../../algorithms/regex/regexEngine.js';
import { AutomatonData } from '../../types/index.js';
import { ArrowRight, Layers, Table } from 'lucide-react';

interface StateEliminationVisualizerProps {
  automaton?: AutomatonData;
}

export const StateEliminationVisualizer: React.FC<StateEliminationVisualizerProps> = ({ automaton }) => {
  const defaultFA: AutomatonData = automaton || {
    type: 'DFA',
    alphabet: ['a', 'b'],
    states: ['q0', 'q1'],
    startState: 'q0',
    acceptStates: ['q1'],
    transitions: [
      { from: 'q0', input: 'a', to: 'q0' },
      { from: 'q0', input: 'b', to: 'q1' },
      { from: 'q1', input: 'b', to: 'q1' }
    ]
  };

  const result = RegexEngine.faToRegexStateElimination(defaultFA);

  return (
    <div className="space-y-6">
      {/* Method Comparison: Arden vs State Elimination */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Table className="h-4 w-4 text-cyan-400" />
          <span>Conversion Methods Comparison</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-800">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2.5">Feature</th>
                <th className="p-2.5 text-indigo-400">Arden's Theorem (Method A)</th>
                <th className="p-2.5 text-cyan-400">State Elimination (Method B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
              <tr>
                <td className="p-2.5 font-bold">Main Mechanism</td>
                <td className="p-2.5">Solve regular language equations algebraically</td>
                <td className="p-2.5">Systematically remove states and accumulate path regex</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Visual Format</td>
                <td className="p-2.5">System of equations (R_i = Σ R_j · a_ji)</td>
                <td className="p-2.5">Generalized Transition Graph (GTG)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Loop Handling</td>
                <td className="p-2.5">Arden's rule: X = PX + Q ⟹ X = P*Q</td>
                <td className="p-2.5">Loop bypass: R_ij = R_ik · (R_kk)* · R_kj</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* State Elimination Formula Visual Card */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center font-mono">
        <span className="text-[11px] text-slate-500 uppercase">State Elimination Core Rule</span>
        <div className="text-sm font-bold text-cyan-300 py-1">
          R_ij(new) = R_ij(old) + R_ik · (R_kk)* · R_kj
        </div>
        <p className="text-[11px] text-slate-400">
          When state q_k is removed, all paths passing through q_k from q_i to q_j are combined with the self-loop (R_kk)*.
        </p>
      </div>

      {/* Step-by-Step Elimination Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Step-by-Step Elimination History
        </h3>

        <div className="space-y-2">
          {result.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-400 uppercase">
                  Step {step.stepNumber}: Eliminated State {step.eliminatedState}
                </span>
                <span className="text-slate-500">
                  Remaining: [{step.remainingStates.join(', ') || 'Start, Accept'}]
                </span>
              </div>
              <div className="text-slate-200 py-1">{step.explanation}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Regular Expression */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-cyan-400 uppercase block font-mono">
            Derived Regular Expression
          </span>
          <span className="text-base font-mono font-bold text-white">
            {result.regularExpression}
          </span>
        </div>
        <div className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
          State Elimination
        </div>
      </div>
    </div>
  );
};
