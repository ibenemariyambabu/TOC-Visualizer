import React, { useState, useMemo } from 'react';
import { LabViewMode, MachineSkin, RealAppProps } from './types';
import { SKINS, getSkin } from './skins';
import { applicationRegistry } from './ApplicationRegistry';
import { MachineStatusBadge, MachineStatus } from './MachineStatusBadge';
import { InputConveyor } from './InputConveyor';
import { MachineMatrix } from './MachineMatrix';
import { UniversalEventLog } from './UniversalEventLog';
import { WhatJustHappenedPanel } from './WhatJustHappenedPanel';
import { ShowMathematicsOverlay } from './ShowMathematicsOverlay';
import { TOCArcadePanel } from './arcade/TOCArcadePanel';
import { ComputationStep } from '../dcve/types';

export interface RealApplicationShellProps {
  machineType?: string;
  problemType?: string;
  model: any;
  steps: ComputationStep[];
  currentStepIndex: number;
  inputString: string;
  isPlaying: boolean;
  speed?: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStep: (step: number) => void;
  onChangeSpeed?: (speed: number) => void;
  diagramSlot?: React.ReactNode;
  memorySlot?: React.ReactNode;
  initialMode?: LabViewMode;
  initialSkin?: MachineSkin;
  questionText?: string;
}

export const RealApplicationShell: React.FC<RealApplicationShellProps> = ({
  machineType = 'DFA',
  problemType,
  model,
  steps,
  currentStepIndex,
  inputString,
  isPlaying,
  speed = 1,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onJumpToStep,
  onChangeSpeed,
  diagramSlot,
  memorySlot,
  initialMode = 'REAL_APP',
  initialSkin = 'computational_lab',
  questionText = '',
}) => {
  const [viewMode, setViewMode] = useState<LabViewMode>(initialMode);
  const [currentSkinKey, setCurrentSkinKey] = useState<MachineSkin>(initialSkin);
  const [showMath, setShowMath] = useState<boolean>(false);
  const [activeTransition, setActiveTransition] = useState<string | undefined>(undefined);

  // Active Skin styling tokens
  const skin = useMemo(() => getSkin(currentSkinKey), [currentSkinKey]);

  // Resolve Real-World Scenario
  const scenarioDef = useMemo(() => {
    return applicationRegistry.resolve(problemType, machineType);
  }, [problemType, machineType]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = Math.max(0, steps.length - 1);

  // Derive system status
  const systemStatus: MachineStatus = useMemo(() => {
    if (steps.length === 0) return 'READY';
    if (isPlaying) return 'RUNNING';
    if (currentStepIndex === totalSteps && totalSteps > 0) {
      return currentStep?.status === 'accepted' ? 'ACCEPTED' : 'REJECTED';
    }
    if (currentStepIndex > 0) return 'PAUSED';
    return 'READY';
  }, [isPlaying, currentStepIndex, totalSteps, currentStep, steps.length]);

  // Shared props for scenario renderers
  const scenarioProps: RealAppProps = {
    machine: model,
    model: model,
    currentStep,
    steps,
    computationSteps: steps,
    stepIndex: currentStepIndex,
    totalSteps,
    inputString,
    alphabet: model?.alphabet || (machineType === 'PDA' ? model?.inputAlphabet : machineType === 'TM' ? model?.tapeAlphabet : ['0', '1']),
    machineType,
    activeTransition: activeTransition || currentStep?.ruleApplied,
    skin,
    onSelectStep: onJumpToStep,
    onHighlightTransition: (tr) => setActiveTransition(`δ(${tr.from}, ${tr.input}) = ${tr.to}`),
    onStateClick: (st) => console.log('State clicked:', st),
    onTransitionClick: (tr) => setActiveTransition(tr),
  };

  const ScenarioComponent = scenarioDef.renderer;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        background: skin.bg,
        borderRadius: skin.borderRadius,
        border: skin.border,
        color: skin.textColor,
        fontFamily: skin.fontFamily,
        boxShadow: skin.shadow,
        transition: 'all 0.3s ease',
      }}
    >
      {/* 1. Master Application Header (Section 5) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: `1px solid ${skin.borderColor}`,
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: skin.accentColor,
              boxShadow: `0 0 10px ${skin.accentColor}`,
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TOC COMPUTATIONAL LAB
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: `${skin.accentColor}22`,
                  border: `1px solid ${skin.accentColor}55`,
                  color: skin.accentColor,
                  fontWeight: 700,
                }}
              >
                MACHINE: {machineType.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor, marginTop: '2px' }}>
              {scenarioDef.name} — {scenarioDef.metaphor}
            </div>
          </div>
        </div>

        {/* Right Header: Status Badge, Math Toggle, Skin Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <MachineStatusBadge status={systemStatus} skin={skin} />

          {/* Show Mathematics HUD Toggle (#26) */}
          <button
            onClick={() => setShowMath(!showMath)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: showMath ? `${skin.accentColor}33` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${showMath ? skin.accentColor : skin.borderColor}`,
              color: showMath ? skin.accentColor : skin.textColor,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>∑</span>
            <span>{showMath ? 'HIDE MATHEMATICS' : 'SHOW MATHEMATICS'}</span>
          </button>

          {/* Machine Skin Selector (#30) */}
          <select
            value={currentSkinKey}
            onChange={(e) => setCurrentSkinKey(e.target.value as MachineSkin)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              background: skin.subPanelBg,
              border: `1px solid ${skin.borderColor}`,
              color: skin.textColor,
              fontSize: '11px',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {Object.entries(SKINS).map(([k, s]) => (
              <option key={k} value={k}>
                🎨 {(s as any).name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Mode Selector Bar (#3: Learning View / Machine View / Real App / Arcade) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: skin.subPanelBg,
          padding: '6px',
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setViewMode('LEARNING')}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            background: viewMode === 'LEARNING' ? skin.accentColor : 'transparent',
            color: viewMode === 'LEARNING' ? '#000' : skin.textColor,
            fontWeight: 700,
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          📖 MODE A: LEARNING VIEW
        </button>
        <button
          onClick={() => setViewMode('MACHINE')}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            background: viewMode === 'MACHINE' ? skin.accentColor : 'transparent',
            color: viewMode === 'MACHINE' ? '#000' : skin.textColor,
            fontWeight: 700,
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ⚙️ MODE B: MACHINE VIEW
        </button>
        <button
          onClick={() => setViewMode('REAL_APP')}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            background: viewMode === 'REAL_APP' ? skin.accentColor : 'transparent',
            color: viewMode === 'REAL_APP' ? '#000' : skin.textColor,
            fontWeight: 700,
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🚀 MODE C: REAL APPLICATION MODE
        </button>
        <button
          onClick={() => setViewMode('ARCADE')}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            background: viewMode === 'ARCADE' ? skin.accentColor : 'transparent',
            color: viewMode === 'ARCADE' ? '#000' : skin.textColor,
            fontWeight: 700,
            fontSize: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🕹️ TOC ARCADE
        </button>
      </div>

      {/* 3. Show Mathematics Overlay HUD (#26) */}
      <ShowMathematicsOverlay
        machineType={(machineType as any) || 'DFA'}
        model={model}
        currentStep={currentStep}
        alphabet={model?.alphabet || []}
        isOpen={showMath}
        onToggle={() => setShowMath(!showMath)}
      />

      {/* 4. Mechanical Optical Input Conveyor (#8) */}
      <InputConveyor
        inputString={inputString}
        consumedLength={currentStepIndex}
        currentSymbol={currentStep?.event?.symbol}
        alphabet={model?.alphabet || []}
        onSelectPosition={(idx) => onJumpToStep(Math.min(totalSteps, idx))}
      />

      {/* 5. Main Content Area Driven by Mode */}
      {viewMode === 'REAL_APP' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Domain-specific Real Application Scenario */}
          <ScenarioComponent {...scenarioProps} />

          {/* Machine Diagram & Matrix in dual-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {diagramSlot && (
              <div
                style={{
                  padding: '14px',
                  background: skin.panelBg,
                  borderRadius: skin.borderRadius,
                  border: skin.border,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                  SYNCHRONIZED STATE DIAGRAM
                </div>
                {diagramSlot}
                {memorySlot && <div style={{ marginTop: '12px' }}>{memorySlot}</div>}
              </div>
            )}

            {/* Matrix Control Panel (#7) */}
            <MachineMatrix
              machineType={(machineType as any) || 'DFA'}
              model={model}
              currentState={currentStep?.after?.currentState || currentStep?.before?.currentState}
              currentSymbol={currentStep?.event?.symbol}
              activeTransition={activeTransition ? { from: currentStep?.ruleApplied?.components?.stateFrom || '', to: currentStep?.ruleApplied?.components?.stateTo || '', input: currentStep?.event?.symbol } : null}
              onCellClick={(state, symbol, target) => {
                setActiveTransition(`δ(${state}, ${symbol}) = ${target}`);
              }}
            />
          </div>
        </div>
      )}

      {viewMode === 'MACHINE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {diagramSlot && (
              <div
                style={{
                  padding: '16px',
                  background: skin.panelBg,
                  borderRadius: skin.borderRadius,
                  border: skin.border,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                  HARDWARE CHASSIS & FINITE CONTROL
                </div>
                {diagramSlot}
              </div>
            )}
            {memorySlot && (
              <div
                style={{
                  padding: '16px',
                  background: skin.panelBg,
                  borderRadius: skin.borderRadius,
                  border: skin.border,
                }}
              >
                {memorySlot}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MachineMatrix
              machineType={(machineType as any) || 'DFA'}
              model={model}
              currentState={currentStep?.after?.currentState || currentStep?.before?.currentState}
              currentSymbol={currentStep?.event?.symbol}
              activeTransition={activeTransition ? { from: currentStep?.ruleApplied?.components?.stateFrom || '', to: currentStep?.ruleApplied?.components?.stateTo || '', input: currentStep?.event?.symbol } : null}
              onCellClick={(state, symbol, target) => {
                setActiveTransition(`δ(${state}, ${symbol}) = ${target}`);
              }}
            />
            <WhatJustHappenedPanel currentStep={currentStep} stepIndex={currentStepIndex} totalSteps={totalSteps} />
          </div>
        </div>
      )}

      {viewMode === 'LEARNING' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          <div
            style={{
              padding: '16px',
              background: skin.panelBg,
              borderRadius: skin.borderRadius,
              border: skin.border,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: skin.accentColor, textTransform: 'uppercase' }}>
              KTU PEDAGOGICAL BREAKDOWN & FORMAL DEFINITION
            </div>
            {questionText && (
              <div style={{ padding: '10px', background: skin.subPanelBg, borderRadius: '4px', fontSize: '12px', borderLeft: `3px solid ${skin.accentColor}` }}>
                <strong>Problem:</strong> {questionText}
              </div>
            )}
            {diagramSlot}
            {memorySlot}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <WhatJustHappenedPanel currentStep={currentStep} stepIndex={currentStepIndex} totalSteps={totalSteps} />
            <MachineMatrix
              machineType={(machineType as any) || 'DFA'}
              model={model}
              currentState={currentStep?.after?.currentState || currentStep?.before?.currentState}
              currentSymbol={currentStep?.event?.symbol}
              activeTransition={activeTransition ? { from: currentStep?.ruleApplied?.components?.stateFrom || '', to: currentStep?.ruleApplied?.components?.stateTo || '', input: currentStep?.event?.symbol } : null}
            />
          </div>
        </div>
      )}

      {viewMode === 'ARCADE' && (
        <TOCArcadePanel
          {...scenarioProps}
        />
      )}

      {/* 6. Telemetry & Contextual Explanation (#24, #25) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <WhatJustHappenedPanel currentStep={currentStep} stepIndex={currentStepIndex} totalSteps={totalSteps} />
        <UniversalEventLog
          computationSteps={steps}
          currentStepIndex={currentStepIndex}
          onSelectStep={onJumpToStep}
        />
      </div>

      {/* 7. Bottom Master Control Console (Previous / Play / Next / Reset / Speed) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          background: skin.subPanelBg,
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onPrev}
            disabled={currentStepIndex <= 0}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${skin.borderColor}`,
              color: currentStepIndex <= 0 ? skin.mutedTextColor : skin.textColor,
              fontSize: '12px',
              fontWeight: 700,
              cursor: currentStepIndex <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ◀ PREV
          </button>
          <button
            onClick={onPlayPause}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              background: skin.accentColor,
              border: 'none',
              color: '#000',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: `0 0 10px ${skin.accentColor}44`,
            }}
          >
            {isPlaying ? '▮▮ PAUSE' : '▶ PLAY'}
          </button>
          <button
            onClick={onNext}
            disabled={currentStepIndex >= totalSteps}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${skin.borderColor}`,
              color: currentStepIndex >= totalSteps ? skin.mutedTextColor : skin.textColor,
              fontSize: '12px',
              fontWeight: 700,
              cursor: currentStepIndex >= totalSteps ? 'not-allowed' : 'pointer',
            }}
          >
            NEXT ▶
          </button>
          <button
            onClick={onReset}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              background: 'transparent',
              border: `1px solid ${skin.borderColor}`,
              color: skin.mutedTextColor,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ↻ RESET
          </button>
        </div>

        {/* Step Counter Readout */}
        <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: skin.textColor }}>
          STEP: <span style={{ color: skin.accentColor }}>{currentStepIndex + 1}</span> / {totalSteps + 1}
        </div>

        {/* Speed Selector */}
        {onChangeSpeed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: skin.mutedTextColor }}>
            <span>SPEED:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '3px',
                  background: speed === s ? skin.accentColor : 'rgba(255,255,255,0.06)',
                  color: speed === s ? '#000' : skin.textColor,
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
