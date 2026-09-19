import React from 'react';
import { RealAppProps } from '../types';

export const CFGCompilerLab: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    skin,
  } = props;

  // Grammar extraction
  const variables = (machine as any)?.variables || ['S', 'A', 'B'];
  const terminals = (machine as any)?.terminals || machine?.alphabet || ['a', 'b'];
  const startSymbol = (machine as any)?.startSymbol || 'S';
  const productions = (machine as any)?.productions || (machine as any)?.rules || [];

  // Parse derivation information from currentStep
  const currentDerivation = currentStep?.after?.tape?.join('') || (currentStep as any)?.tapeState?.join('') || currentStep?.event?.description || currentStep?.explanation || startSymbol;
  const currentRule = currentStep?.ruleApplied?.formula || currentStep?.explanation || 'Awaiting derivation step';

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
          <span style={{ fontSize: '18px' }}>🔬</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>COMPILER FRONTEND PARSER LAB</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Context-Free Grammar Parsing, Lexical Tokens & AST Synthesis</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: `${skin.accentColor}18`, border: `1px solid ${skin.accentColor}44`, fontSize: '11px', color: skin.accentColor, fontFamily: 'monospace' }}>
            START: {startSymbol}
          </span>
          <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontSize: '11px', color: skin.mutedTextColor, fontFamily: 'monospace' }}>
            |V|={variables.length} |Σ|={terminals.length}
          </span>
        </div>
      </div>

      {/* Compiler pipeline stages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {/* Stage 1: Lexical Tokens */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            STAGE 1: LEXICAL TOKENS (Σ)
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {terminals.map((t: string, i: number) => (
              <span
                key={i}
                style={{
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${skin.borderColor}`,
                  fontSize: '12px',
                  color: skin.accentColor,
                }}
              >
                TOKEN('{t}')
              </span>
            ))}
          </div>
        </div>

        {/* Stage 2: Non-Terminals / Syntactic Categories */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            STAGE 2: SYNTACTIC VARIABLES (V)
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {variables.map((v: string, i: number) => (
              <span
                key={i}
                style={{
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: v === startSymbol ? `${skin.accentColor}25` : 'rgba(0,0,0,0.3)',
                  border: v === startSymbol ? `1px solid ${skin.accentColor}` : `1px solid ${skin.borderColor}`,
                  fontSize: '12px',
                  color: v === startSymbol ? skin.accentColor : skin.textColor,
                  fontWeight: 600,
                }}
              >
                &lt;{v}&gt;{v === startSymbol ? ' (root)' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Stage 3: Current Sentential Form */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            STAGE 3: ACTIVE SENTENTIAL FORM
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '4px',
              border: `1px solid ${skin.accentColor}44`,
              color: skin.accentColor,
              letterSpacing: '0.1em',
              wordBreak: 'break-all',
            }}
          >
            {currentDerivation}
          </div>
        </div>
      </div>

      {/* Production Rules Chamber & Applied Expansion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '14px' }}>
        {/* Grammar Rules List */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}`, maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
            GRAMMAR PRODUCTION RULES (P)
          </div>
          {productions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {productions.map((prod: any, idx: number) => {
                const head = prod.head || prod.variable || prod.from || 'S';
                const body = Array.isArray(prod.body) ? prod.body.join(' | ') : (prod.body || prod.to || prod);
                return (
                  <div
                    key={idx}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span style={{ color: skin.accentColor, fontWeight: 700 }}>{head}</span>
                    <span style={{ color: skin.mutedTextColor, margin: '0 6px' }}>→</span>
                    <span style={{ color: skin.textColor }}>{body}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: skin.mutedTextColor, fontStyle: 'italic' }}>
              CFG production rules loaded from active grammar model
            </div>
          )}
        </div>

        {/* Applied Derivation Expansion */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
              DERIVATION STEP IN PROGRESS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: skin.mutedTextColor }}>OPERATION:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: skin.accentColor, fontWeight: 600 }}>
                {currentRule}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor, lineHeight: '1.5' }}>
              In a compiler frontend, context-free parsing substitutes production RHS into non-terminals to synthesize an Abstract Syntax Tree (AST).
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: `1px solid ${skin.borderColor}`, fontSize: '11px' }}>
            <span style={{ color: skin.mutedTextColor }}>Derivation: Leftmost / Canonical</span>
            <span style={{ color: skin.accentColor, fontWeight: 600 }}>Step #{currentStep ? (currentStep.stepNumber ?? (currentStep as any).stepIndex + 1) : 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
