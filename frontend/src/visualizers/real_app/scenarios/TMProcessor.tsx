import React from 'react';
import { RealAppProps } from '../types';

export const TMProcessor: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    activeTransition,
    skin,
  } = props;

  const currentState = (typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : (currentStep as any)?.activeState || machine?.initialState || 'q0');
  const tape = (currentStep?.after?.tape && currentStep.after.tape.length > 0)
    ? currentStep.after.tape
    : (currentStep as any)?.tapeState || ['B', '0', '1', '1', '0', 'B'];
  const headPos = currentStep?.after?.headPosition ?? (currentStep as any)?.headPosition ?? 1;
  const currentSymbol = tape[headPos] || currentStep?.event?.symbol || (currentStep as any)?.activeSymbol || 'B';
  const ruleApplied = currentStep?.ruleApplied?.formula || activeTransition || 'δ(q0, 0) = (q1, 1, R)';

  // Parse TM action from rule or explanation (e.g. read, write, direction)
  const isRight = ruleApplied.includes(', R') || ruleApplied.includes(',R');
  const isLeft = ruleApplied.includes(', L') || ruleApplied.includes(',L');
  const moveDirection = isRight ? 'RIGHT (►)' : isLeft ? 'LEFT (◄)' : 'STATIONARY (■)';

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
          <span style={{ fontSize: '18px' }}>⚙️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>TURING MACHINE COMPUTATIONAL PROCESSOR (CPU)</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Infinite Linear Memory Tape, R/W Magnetic Head & Micro-code Control Unit</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: `${skin.accentColor}18`, border: `1px solid ${skin.accentColor}44`, fontSize: '11px', color: skin.accentColor, fontFamily: 'monospace' }}>
            HEAD AT ADDR: 0x0{headPos}
          </span>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: skin.mutedTextColor, fontFamily: 'monospace' }}>
            HEAD VECTOR: {moveDirection}
          </span>
        </div>
      </div>

      {/* TM Micro-Architecture Core: Control Unit & State Register */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
        {/* State Register */}
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
              STATE INSTRUCTION REGISTER (Q)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: `2px solid ${skin.accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: skin.accentColor,
                  boxShadow: `0 0 14px ${skin.accentColor}33`,
                }}
              >
                {currentState}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Active Program State</div>
                <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
                  {machine?.finalStates?.includes(currentState) ? '★ Halting Accept State' : 'Computational Loop'}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '10px', color: skin.mutedTextColor, borderTop: `1px solid ${skin.borderColor}`, paddingTop: '6px' }}>
            Blank Symbol: <code style={{ color: skin.accentColor }}>B</code> (or <code style={{ color: skin.accentColor }}>_</code> / <code style={{ color: skin.accentColor }}>Δ</code>)
          </div>
        </div>

        {/* 4-Phase Micro-Cycle: READ -> WRITE -> MOVE -> STATE */}
        <div
          style={{
            padding: '14px',
            background: skin.subPanelBg,
            borderRadius: skin.borderRadius,
            border: `1px solid ${skin.borderColor}`,
          }}
        >
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
            TM EXECUTION CYCLE PIPELINE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: `1px solid ${skin.borderColor}`, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: skin.mutedTextColor, marginBottom: '2px' }}>1. READ</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: skin.accentColor }}>
                '{currentSymbol}'
              </div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: `1px solid ${skin.borderColor}`, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: skin.mutedTextColor, marginBottom: '2px' }}>2. WRITE</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: skin.textColor }}>
                BUS MUT
              </div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: `1px solid ${skin.borderColor}`, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: skin.mutedTextColor, marginBottom: '2px' }}>3. HEAD MOVE</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: skin.accentColor }}>
                {isRight ? 'R ►' : isLeft ? '◄ L' : '—'}
              </div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: `1px solid ${skin.borderColor}`, textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: skin.mutedTextColor, marginBottom: '2px' }}>4. NEXT STATE</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700, color: skin.textColor }}>
                {currentState}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '12px', color: skin.accentColor, wordBreak: 'break-all' }}>
            {ruleApplied}
          </div>
        </div>
      </div>

      {/* Physical Infinite Linear Tape Track */}
      <div
        style={{
          padding: '16px',
          background: skin.subPanelBg,
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase' }}>
          <span>◄ LEFT INFINITE BUS</span>
          <span>MAGNETIC MEMORY TAPE TRACK</span>
          <span>RIGHT INFINITE BUS ►</span>
        </div>

        {/* Read/Write Head Pointer */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', overflowX: 'auto', maxWidth: '100%', padding: '10px 0' }}>
          {tape.map((symbol: string, idx: number) => {
            const isHead = idx === headPos;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                {isHead && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'bounce 1s infinite' }}>
                    <span style={{ fontSize: '10px', color: skin.accentColor, fontWeight: 800 }}>R/W HEAD</span>
                    <span style={{ fontSize: '16px', color: skin.accentColor, marginTop: '-4px' }}>▼</span>
                  </div>
                )}
                {!isHead && <div style={{ height: '26px' }} />}

                {/* Tape Cell */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '4px',
                    background: isHead ? `${skin.accentColor}30` : 'rgba(0,0,0,0.4)',
                    border: isHead ? `2px solid ${skin.accentColor}` : `1px solid ${skin.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isHead ? skin.accentColor : skin.textColor,
                    boxShadow: isHead ? `0 0 12px ${skin.accentColor}40` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {symbol || 'B'}
                </div>
                <span style={{ fontSize: '9px', color: isHead ? skin.accentColor : skin.mutedTextColor, fontFamily: 'monospace' }}>
                  [{idx}]
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
