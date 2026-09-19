import React from 'react';
import { AutomatonData } from '../../types/index.js';
import { UniversalAutomataDiagram } from './UniversalAutomataDiagram.js';

export interface AutomataGraphViewProps {
  automaton: AutomatonData;
  activeState?: string | string[];
  highlightTransition?: { from: string; to: string; input?: string };
  questionText?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const AutomataGraphView: React.FC<AutomataGraphViewProps> = ({
  automaton,
  activeState,
  highlightTransition,
  questionText,
  title,
  subtitle,
  className
}) => {
  return (
    <UniversalAutomataDiagram
      machineType={automaton.type || 'DFA'}
      states={automaton.states}
      alphabet={automaton.alphabet}
      startState={automaton.startState}
      acceptStates={automaton.acceptStates}
      transitions={automaton.transitions}
      activeState={activeState}
      highlightTransition={highlightTransition}
      questionText={questionText}
      title={title || `${automaton.type || 'Automaton'} Diagram`}
      subtitle={subtitle}
      className={className}
    />
  );
};
