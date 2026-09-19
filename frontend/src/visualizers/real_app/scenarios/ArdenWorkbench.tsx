import React from 'react';
import { RealAppProps } from '../types';

export const ArdenWorkbench: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    skin,
  } = props;

  const equations = (machine as any)?.equations || (currentStep as any)?.equations || [
    { variable: 'R0', expr: 'ε + R1·0 + R0·1', note: 'Initial state equation' },
    { variable: 'R1', expr: 'R0·0 + R1·1', note: 'Transition from R0 via 0' },
  ];

  const currentOp = currentStep?.explanation || currentStep?.event?.description || 'Awaiting algebraic reduction cycle...';
  const ardenRuleApplied = currentOp.toLowerCase().includes('arden') || currentOp.toLowerCase().includes('r = q + rp');
  const activeState = (typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : (currentStep as any)?.activeState || '');
  const stepIdx = (currentStep as any)?.stepIndex ?? (currentStep?.stepNumber !== undefined ? currentStep.stepNumber - 1 : 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        background: skin.panelBg,
        borderRadius: skin.borderRadius,
        border: skin.border,
        color: skin.textColor,
        fontFamily: skin.fontFamily,
      }}
    >
      {/* Header telemetry */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${skin.borderColor}`, paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚖️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>ARDEN EQUATION ANALYSIS WORKBENCH</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Automaton to Regular Expression Algebraic Reduction Engine</div>
          </div>
        </div>
        <div style={{ padding: '4px 8px', borderRadius: '4px', background: `${skin.accentColor}18`, border: `1px solid ${skin.accentColor}44`, fontSize: '11px', color: skin.accentColor, fontWeight: 600 }}>
          {ardenRuleApplied ? 'ARDEN THEOREM ACTIVE: R = QP*' : 'SUBSTITUTION & GAUSSIAN STAGE'}
        </div>
      </div>

      {/* Equations Workstation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {equations.map((eq: any, idx: number) => {
          const isActive = activeState === eq.variable || currentOp.includes(eq.variable);
          return (
            <div
              key={idx}
              style={{
                padding: '12px',
                borderRadius: skin.borderRadius,
                background: isActive ? `${skin.accentColor}15` : skin.subPanelBg,
                border: isActive ? `1.5px solid ${skin.accentColor}` : `1px solid ${skin.borderColor}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: skin.accentColor, fontSize: '14px' }}>
                  {eq.variable || `Eq ${idx + 1}`}
                </span>
                <span style={{ fontSize: '10px', color: skin.mutedTextColor }}>
                  {eq.note || `State coefficient system`}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  wordBreak: 'break-all',
                }}
              >
                {eq.variable ? `${eq.variable} = ${eq.expr}` : eq.expr || eq}
              </div>
            </div>
          );
        })}
      </div>

      {/* Algebraic Pipeline Stage: BEFORE -> OP -> AFTER */}
      <div
        style={{
          padding: '14px',
          background: skin.subPanelBg,
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: skin.mutedTextColor }}>
          CURRENT ALGEBRAIC TRANSFORMATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '10px', color: skin.mutedTextColor, marginBottom: '2px' }}>STEP CONTEXT</div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: skin.textColor }}>
              {currentStep ? `Phase ${stepIdx + 1}: ${activeState || 'System'}` : 'System Standby'}
            </div>
          </div>
          <div style={{ fontSize: '18px', color: skin.accentColor }}>➜</div>
          <div style={{ flex: 2, minWidth: '240px', padding: '10px', background: `${skin.accentColor}12`, borderRadius: '4px', border: `1px solid ${skin.accentColor}40` }}>
            <div style={{ fontSize: '10px', color: skin.accentColor, fontWeight: 700, marginBottom: '2px' }}>OPERATION & JUSTIFICATION</div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {currentOp}
            </div>
          </div>
        </div>
      </div>

      {/* Formal Arden Rule Reference Box */}
      <div
        style={{
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '4px',
          borderLeft: `3px solid ${skin.accentColor}`,
          fontSize: '11px',
          color: skin.mutedTextColor,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <strong style={{ color: skin.textColor }}>Arden's Rule:</strong> If <code style={{ color: skin.accentColor }}>P</code> does not contain <code style={{ color: skin.accentColor }}>ε</code>, then equation <code style={{ color: skin.accentColor }}>R = Q + RP</code> has unique solution <code style={{ color: skin.accentColor }}>R = QP*</code>.
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
          Linear System of Equations over Regular Expressions
        </div>
      </div>
    </div>
  );
};
