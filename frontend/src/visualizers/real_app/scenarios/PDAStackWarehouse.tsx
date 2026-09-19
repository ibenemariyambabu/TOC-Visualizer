import React from 'react';
import { RealAppProps } from '../types';

export const PDAStackWarehouse: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    activeTransition,
    skin,
  } = props;

  // Stack state extraction
  const stack = currentStep?.after?.stack || (currentStep as any)?.stackState || (machine as any)?.initialStack || ['Z0'];
  const currentState = (typeof currentStep?.after?.currentState === 'string' ? currentStep.after.currentState : (currentStep as any)?.activeState || machine?.initialState || 'q0');
  const currentSymbol = currentStep?.event?.symbol || (currentStep as any)?.activeSymbol || 'ε';
  const remainingInput = currentStep?.after?.remainingInput || (currentStep as any)?.remainingInput || (currentStep?.after?.tape?.join('')) || '—';
  const ruleApplied = currentStep?.ruleApplied?.formula || activeTransition || currentStep?.explanation || 'δ(q0, ε, Z0) = (q0, Z0)';

  // Determine if top item is currently being pushed or popped
  const isPop = currentStep?.explanation?.toLowerCase().includes('pop') || ruleApplied.includes('ε');
  const isPush = currentStep?.explanation?.toLowerCase().includes('push') || (stack.length > 1 && !isPop);

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
          <span style={{ fontSize: '18px' }}>🏗️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>AUTOMATED WAREHOUSE & GANTRY STACK SYSTEM (PDA)</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>LIFO Cargo Silo, Optical Barcode Conveyor & Finite Control Unit</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              background: isPop ? 'rgba(239, 68, 68, 0.15)' : isPush ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isPop ? '#ef4444' : isPush ? '#22c55e' : skin.borderColor}`,
              color: isPop ? '#f87171' : isPush ? '#4ade80' : skin.mutedTextColor,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {isPop ? '▼ POP (UNLOAD CARGO)' : isPush ? '▲ PUSH (STACK CARGO)' : '■ NO STACK MUTATION'}
          </div>
          <div style={{ padding: '3px 8px', borderRadius: '4px', background: `${skin.accentColor}18`, border: `1px solid ${skin.accentColor}44`, fontSize: '11px', color: skin.accentColor, fontFamily: 'monospace' }}>
            DEPTH: {stack.length}
          </div>
        </div>
      </div>

      {/* Main Physical Warehouse Chassis: Finite Control Unit + Input Gantry + Vertical Silo Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Left: Finite Control Unit & Input Feeder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Finite Control Unit */}
          <div
            style={{
              padding: '14px',
              background: skin.subPanelBg,
              borderRadius: skin.borderRadius,
              border: `1px solid ${skin.borderColor}`,
              position: 'relative',
            }}
          >
            <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
              FINITE CONTROL HEAD (Q)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `${skin.accentColor}25`,
                    border: `2px solid ${skin.accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '16px',
                    color: skin.accentColor,
                    boxShadow: `0 0 12px ${skin.accentColor}33`,
                  }}
                >
                  {currentState}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Active Control State</div>
                  <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
                    {machine?.finalStates?.includes(currentState) ? '★ Accepting Configuration State' : 'Intermediate Transit State'}
                  </div>
                </div>
              </div>

              {/* Optical Scanner reading input */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: skin.mutedTextColor }}>SCANNED TOKEN</div>
                <div style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 800, color: skin.accentColor }}>
                  '{currentSymbol}'
                </div>
              </div>
            </div>
          </div>

          {/* Active delta equation box */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: skin.borderRadius,
              border: `1px solid ${skin.accentColor}44`,
            }}
          >
            <div style={{ fontSize: '10px', color: skin.accentColor, fontWeight: 700, marginBottom: '4px' }}>
              δ TRANSITION DISPATCH RULE
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: skin.textColor, wordBreak: 'break-all' }}>
              {ruleApplied}
            </div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor, marginTop: '4px' }}>
              {currentStep?.explanation || 'PDA evaluates (State, Input, Stack Top) -> (Next State, New Stack String)'}
            </div>
          </div>

          {/* Instantaneous Description (ID) Telemetry Box */}
          <div
            style={{
              padding: '12px',
              background: skin.subPanelBg,
              borderRadius: skin.borderRadius,
              border: `1px solid ${skin.borderColor}`,
            }}
          >
            <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              INSTANTANEOUS DESCRIPTION: (q, w, α)
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '4px',
                border: `1px solid ${skin.borderColor}`,
                color: skin.accentColor,
              }}
            >
              ({currentState}, "{remainingInput}", [{stack.join(', ')}])
            </div>
          </div>
        </div>

        {/* Right: Vertical Physical Stack / Silo Chassis */}
        <div
          style={{
            padding: '14px',
            background: skin.subPanelBg,
            borderRadius: skin.borderRadius,
            border: `1px solid ${skin.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, textTransform: 'uppercase' }}>
              CARGO SILO (LIFO STACK Γ)
            </div>
            <div style={{ fontSize: '10px', color: skin.accentColor, fontFamily: 'monospace' }}>
              TOP ➔ BOTTOM
            </div>
          </div>

          {/* Vertical Stack Containers */}
          <div
            style={{
              flex: 1,
              minHeight: '220px',
              maxHeight: '280px',
              border: `2px dashed ${skin.borderColor}`,
              borderRadius: '6px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              background: 'rgba(0,0,0,0.2)',
              justifyContent: stack.length > 0 ? 'flex-start' : 'center',
            }}
          >
            {stack.length === 0 ? (
              <div style={{ textAlign: 'center', color: skin.mutedTextColor, fontSize: '12px', padding: '20px 0' }}>
                Stack Empty (ε)
              </div>
            ) : (
              stack.map((item: string, idx: number) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: isTop ? `${skin.accentColor}28` : 'rgba(255,255,255,0.04)',
                      border: isTop ? `1.5px solid ${skin.accentColor}` : `1px solid ${skin.borderColor}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isTop ? skin.accentColor : skin.textColor,
                      boxShadow: isTop ? `0 0 8px ${skin.accentColor}25` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px' }}>📦</span>
                      <span>{item}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: isTop ? skin.accentColor : skin.mutedTextColor, fontWeight: 500 }}>
                      {isTop ? '◀ TOP OF STACK' : `Slot #${stack.length - idx}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '10px', color: skin.mutedTextColor }}>
            Bottom of Stack Bed (Initial Symbol: Z0)
          </div>
        </div>
      </div>
    </div>
  );
};
