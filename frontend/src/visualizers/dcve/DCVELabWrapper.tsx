import React, { useState, useMemo } from 'react';
import { ComputationStep, DCVEViewMode, MotionMode, TestCaseModel } from './types.js';
import { DCVECore } from './dcveCore.js';
import { StepAnatomyPanel } from './StepAnatomyPanel.js';
import { DCVESimulationControls } from './DCVESimulationControls.js';
import { DynamicInputTape } from './DynamicInputTape.js';
import { UniversalInputExperimenter } from './UniversalInputExperimenter.js';
import { NFAComputationTreeView } from './NFAComputationTreeView.js';
import { SimulationResult, AutomatonData, PDAData, TMData } from '../../types/index.js';
import { BookOpen, Layers, Terminal, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { RealApplicationShell } from '../real_app/RealApplicationShell.js';

interface DCVELabWrapperProps {
  machineType: 'DFA' | 'NFA' | 'PDA' | 'TM';
  model: AutomatonData | PDAData | TMData | any;
  simulationResult: SimulationResult;
  inputString: string;
  stepIndex: number;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
  onChangeSpeed: (speed: number) => void;
  onSimulateInput: (newString: string) => void;
  diagramSlot: React.ReactNode;
  memorySlot?: React.ReactNode; // StackView for PDA, TapeView for TM
  alphabet: string[];
  questionText?: string;
  className?: string;
}

export const DCVELabWrapper: React.FC<DCVELabWrapperProps> = ({
  machineType,
  model,
  simulationResult,
  inputString,
  stepIndex,
  isPlaying,
  speed,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onJumpToStep,
  onChangeSpeed,
  onSimulateInput,
  diagramSlot,
  memorySlot,
  alphabet,
  questionText = '',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<DCVEViewMode>('REAL_APP');
  const [motionMode, setMotionMode] = useState<MotionMode>('FULL');

  // Convert raw simulation to canonical ComputationStep sequence with verified diffs
  const computationSteps: ComputationStep[] = useMemo(() => {
    return DCVECore.convertSimulationToSteps(
      simulationResult,
      machineType,
      model,
      inputString
    );
  }, [simulationResult, machineType, model, inputString]);

  const currentStep = computationSteps[stepIndex] || computationSteps[0];
  const totalSteps = Math.max(0, computationSteps.length - 1);

  // Representative test cases
  const testCases: TestCaseModel[] = useMemo(() => {
    return DCVECore.generateRepresentativeTestCases(alphabet, questionText);
  }, [alphabet, questionText]);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Dynamic Visual Input Tape (Section 8) */}
      <DynamicInputTape
        inputString={inputString}
        consumedLength={stepIndex}
        currentSymbol={currentStep?.event.symbol}
        alphabet={alphabet}
        onSelectPosition={(idx) => onJumpToStep(Math.min(totalSteps, idx))}
      />

      {/* Real Application / Computational Machine / TOC Arcade Mode */}
      {(viewMode === 'REAL_APP' || viewMode === 'MACHINE' || viewMode === 'ARCADE') && (
        <RealApplicationShell
          machineType={machineType}
          problemType={machineType}
          model={model}
          steps={computationSteps}
          currentStepIndex={stepIndex}
          inputString={inputString}
          isPlaying={isPlaying}
          speed={speed}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrev={onPrev}
          onReset={onReset}
          onJumpToStep={onJumpToStep}
          onChangeSpeed={onChangeSpeed}
          diagramSlot={diagramSlot}
          memorySlot={memorySlot}
          initialMode={viewMode === 'ARCADE' ? 'ARCADE' : viewMode === 'MACHINE' ? 'MACHINE' : 'REAL_APP'}
          questionText={questionText}
        />
      )}

      {/* 2. Main Presentation based on View Mode (Section 52-54: Lab View / Learning View / Exam View) */}
      {viewMode === 'LAB' && (
        <div className="space-y-5">
          {/* Main Visual Grid: Diagram / Memory + Step Anatomy */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left/Center Column: Diagram & Optional Memory Slot */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 shadow-lg">
                {diagramSlot}
              </div>

              {memorySlot && (
                <div className="space-y-2">
                  {memorySlot}
                </div>
              )}

              {/* NFA Computation Tree if NFA */}
              {machineType === 'NFA' && (
                <NFAComputationTreeView
                  steps={simulationResult.steps}
                  currentStepIndex={stepIndex}
                  acceptStates={model.acceptStates || []}
                />
              )}
            </div>

            {/* Right Column: Step Anatomy Panel */}
            <div className="lg:col-span-5 space-y-4">
              <StepAnatomyPanel
                currentStep={currentStep}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'LEARNING' && (
        <div className="space-y-5">
          {/* Pedagogical Banner */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 font-mono text-xs">
            <span className="text-indigo-400 font-bold uppercase tracking-wider block">
              Learning Mode — Step-by-Step Pedagogical Breakdown
            </span>
            <p className="text-slate-300 font-sans text-sm">
              Focus on how the machine operates, why each mathematical state change occurs, and which rule dictates the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 space-y-4">
              {diagramSlot}
              {memorySlot}
            </div>
            <div className="lg:col-span-6 space-y-4">
              <StepAnatomyPanel
                currentStep={currentStep}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                viewMode="LEARNING"
              />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'EXAM' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5 font-mono text-xs">
          {/* Formal Exam Summary (Section 52) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm">
              KTU Textbook Exam Specification
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
              Deterministic Solution
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>{diagramSlot}</div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">
                  Formal Machine Model:
                </span>
                <div className="text-slate-300 text-xs">
                  <div><strong>States Q:</strong> &#123;{(model.states || []).join(', ')}&#125;</div>
                  <div><strong>Alphabet Σ:</strong> &#123;{(alphabet || []).join(', ')}&#125;</div>
                  {machineType === 'PDA' && model.stackAlphabet && (
                    <div><strong>Stack Alphabet Γ:</strong> &#123;{model.stackAlphabet.join(', ')}&#125;</div>
                  )}
                  {machineType === 'PDA' && model.initialStackSymbol && (
                    <div><strong>Initial Stack Symbol Z₀:</strong> {model.initialStackSymbol}</div>
                  )}
                  {machineType === 'PDA' && model.acceptanceMode && (
                    <div><strong>Acceptance Mode:</strong> {model.acceptanceMode === 'EMPTY_STACK' ? 'Empty Stack (N(M))' : 'Final State (L(M))'}</div>
                  )}
                  {machineType === 'TM' && model.tapeAlphabet && (
                    <div><strong>Tape Alphabet Γ:</strong> &#123;{model.tapeAlphabet.join(', ')}&#125;</div>
                  )}
                  {machineType === 'TM' && model.blankSymbol && (
                    <div><strong>Blank Symbol:</strong> {model.blankSymbol}</div>
                  )}
                  <div><strong>Start:</strong> {model.startState || model.initialState || 'q0'}</div>
                  <div><strong>Accept F:</strong> &#123;{(model.acceptStates || (model.acceptState ? [model.acceptState] : [])).join(', ')}&#125;</div>
                </div>
              </div>

              {memorySlot && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  {memorySlot}
                </div>
              )}

              <StepAnatomyPanel
                currentStep={currentStep}
                stepIndex={stepIndex}
                totalSteps={totalSteps}
                viewMode="EXAM"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Universal Simulation Controls (Section 6 & 41) */}
      <DCVESimulationControls
        currentStep={stepIndex}
        totalSteps={totalSteps}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrev={onPrev}
        onReset={onReset}
        onJumpToStep={onJumpToStep}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        motionMode={motionMode}
        onChangeMotionMode={setMotionMode}
        isAccepted={stepIndex === totalSteps ? simulationResult.accepted : null}
        statusText={
          stepIndex === totalSteps
            ? simulationResult.accepted
              ? 'ACCEPTED'
              : 'REJECTED'
            : isPlaying
            ? 'Simulating...'
            : 'Paused'
        }
      />

      {/* 4. Universal Input Experimenter (Section 26 & 37) */}
      <UniversalInputExperimenter
        currentInput={inputString}
        alphabet={alphabet}
        testCases={testCases}
        onSimulateInput={onSimulateInput}
      />
    </div>
  );
};
