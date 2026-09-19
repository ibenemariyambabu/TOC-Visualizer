import React, { useMemo } from 'react';
import { TMData } from '../../types/index.js';
import { UniversalAutomataDiagram } from '../automata/UniversalAutomataDiagram.js';
import { TransitionModel, LayoutMode } from '../automata/tocLayoutEngine.js';

export interface TMDiagramViewProps {
  tm: TMData;
  activeState?: string;
  highlightTransition?: {
    from: string;
    to: string;
    readSymbol?: string;
    writeSymbol?: string;
    direction?: 'L' | 'R' | 'S';
  };
  onStateSelect?: (state: string) => void;
  onTransitionSelect?: (trans: any) => void;
  questionText?: string;
  layoutMode?: LayoutMode;
  title?: string;
}

export const TMDiagramView: React.FC<TMDiagramViewProps> = ({
  tm,
  activeState,
  highlightTransition,
  onStateSelect,
  onTransitionSelect,
  questionText,
  layoutMode = 'EXAM_STYLE',
  title = 'Turing Machine State Diagram'
}) => {
  // Convert TM transitions to TransitionModel array
  const diagramTransitions: TransitionModel[] = useMemo(() => {
    return tm.transitions.map((t) => ({
      from: t.currentState,
      to: t.nextState,
      input: t.readSymbol,
      readSymbol: t.readSymbol,
      writeSymbol: t.writeSymbol,
      direction: t.direction,
      explanation:
        t.explanation ||
        `δ(${t.currentState}, '${t.readSymbol}') → (${t.nextState}, '${t.writeSymbol}', ${t.direction})`
    }));
  }, [tm.transitions]);

  return (
    <UniversalAutomataDiagram
      states={tm.states}
      startState={tm.startState}
      acceptStates={tm.acceptState ? [tm.acceptState] : []}
      transitions={diagramTransitions}
      alphabet={tm.inputAlphabet}
      activeState={activeState}
      highlightTransition={
        highlightTransition
          ? {
              from: highlightTransition.from,
              to: highlightTransition.to,
              input: highlightTransition.readSymbol
            }
          : undefined
      }
      onStateSelect={onStateSelect}
      onTransitionSelect={onTransitionSelect}
      questionText={questionText}
      defaultLayoutMode={layoutMode}
      machineType="TM"
      title={title}
    />
  );
};
