import React from 'react';
import { PDAData } from '../../types/index.js';
import { UniversalAutomataDiagram } from '../automata/UniversalAutomataDiagram.js';

export interface PDADiagramViewProps {
  pda: PDAData;
  activeState?: string;
  highlightTransition?: { from: string; to: string; input?: string };
  questionText?: string;
}

export const PDADiagramView: React.FC<PDADiagramViewProps> = ({
  pda,
  activeState,
  highlightTransition,
  questionText
}) => {
  const pdaTransitions = pda.transitions.map((t) => ({
    from: t.from,
    to: t.to,
    input: t.input,
    stackTop: t.stackTop,
    stackReplacement: t.stackReplacement,
    explanation: t.explanation
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
        <span>
          Transition Syntax:{' '}
          <strong className="text-indigo-300">input, stackTop → stackReplacement</strong>
        </span>
        <span>
          Acceptance Mode:{' '}
          <strong
            className={
              pda.acceptanceMode === 'EMPTY_STACK' ||
              String(pda.acceptanceMode).toUpperCase().includes('EMPTY')
                ? 'text-amber-400'
                : 'text-emerald-400'
            }
          >
            {pda.acceptanceMode}
          </strong>
        </span>
      </div>
      <UniversalAutomataDiagram
        machineType="PDA"
        states={pda.states}
        alphabet={pda.inputAlphabet}
        startState={pda.startState}
        acceptStates={pda.acceptStates}
        transitions={pdaTransitions}
        activeState={activeState}
        highlightTransition={highlightTransition}
        questionText={questionText}
        title="Pushdown Automaton (PDA) State Diagram"
        subtitle={`Strategy: ${pda.strategyName || 'Stack Accounting'}`}
      />
    </div>
  );
};
