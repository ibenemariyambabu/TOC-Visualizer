import React from 'react';
import { RealAppProps } from '../types';

export const GeneralComputationalLab: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    activeTransition,
    skin,
    onStateClick,
    onTransitionClick,
  } = props;

  const currentState = (typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : (currentStep as any)?.activeState || machine?.initialState || 'q0');
  const currentSymbol = currentStep?.event?.symbol || (currentStep as any)?.activeSymbol || '—';
  const states = machine?.states || [currentState];
  const finalStates = machine?.finalStates || [];
  const alphabet = machine?.alphabet || [];
  const explanation = currentStep?.explanation || 'Universal computational device ready for input sequence evaluation.';

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${skin.borderColor}`, paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>GENERAL COMPUTATIONAL LAB</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Universal Abstract Machine Computational Workstation</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: `${skin.accentColor}18`, border: `1px solid ${skin.accentColor}44`, fontSize: '11px', color: skin.accentColor, fontFamily: 'monospace' }}>
            |Q|={states.length}
          </span>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: skin.mutedTextColor, fontFamily: 'monospace' }}>
            |Σ|={alphabet.length}
          </span>
        </div>
      </div>

      {/* Machine Core Overview: Active Register + Optical Token Chute */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
        {/* Active State Register */}
        <div
          style={{
            padding: '14px',
            background: skin.subPanelBg,
            borderRadius: skin.borderRadius,
            border: `1px solid ${skin.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              ACTIVE STATE REGISTER
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `${skin.accentColor}25`,
                  border: `2px solid ${skin.accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: skin.accentColor,
                  boxShadow: `0 0 12px ${skin.accentColor}33`,
                }}
              >
                {currentState}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{currentState}</div>
                <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
                  {finalStates.includes(currentState) ? '★ Final / Accepting State' : 'Intermediate State'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', borderTop: `1px solid ${skin.borderColor}`, paddingTop: '8px' }}>
            {states.slice(0, 8).map((st) => (
              <span
                key={st}
                onClick={() => onStateClick?.(st)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  background: st === currentState ? `${skin.accentColor}33` : 'rgba(255,255,255,0.05)',
                  border: st === currentState ? `1px solid ${skin.accentColor}` : '1px solid transparent',
                  color: st === currentState ? skin.accentColor : skin.textColor,
                }}
              >
                {st}
              </span>
            ))}
            {states.length > 8 && (
              <span style={{ fontSize: '10px', color: skin.mutedTextColor }}>+{states.length - 8} more</span>
            )}
          </div>
        </div>

        {/* Transition Execution & Mathematical Justification */}
        <div
          style={{
            padding: '14px',
            background: skin.subPanelBg,
            borderRadius: skin.borderRadius,
            border: `1px solid ${skin.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase' }}>
                CURRENT TRANSITION RULE
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: skin.accentColor }}>
                SCANNED: '{currentSymbol}'
              </div>
            </div>

            <div
              onClick={() => activeTransition && onTransitionClick?.(activeTransition)}
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                fontWeight: 700,
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                border: `1px solid ${skin.accentColor}44`,
                color: skin.accentColor,
                cursor: activeTransition ? 'pointer' : 'default',
              }}
            >
              {activeTransition || `δ(${currentState}, ${currentSymbol})`}
            </div>

            <div style={{ fontSize: '12px', color: skin.textColor, marginTop: '8px', lineHeight: '1.5' }}>
              {explanation}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: skin.mutedTextColor, borderTop: `1px solid ${skin.borderColor}`, paddingTop: '8px', marginTop: '10px' }}>
            <span>Alphabet: &#123;{alphabet.join(', ')}&#125;</span>
            <span>Step #{currentStep ? (currentStep.stepNumber ?? (currentStep as any).stepIndex + 1) : 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
