import React from 'react';
import { RealAppProps } from '../types';

export const CFGAmbiguityLab: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    skin,
  } = props;
  const isAmbiguous = (machine as any)?.isAmbiguous ?? true;
  const trees = (machine as any)?.ambiguousTrees || (machine as any)?.derivationTrees || [];
  const inputString = (machine as any)?.ambiguousString || (currentStep as any)?.inputString || 'id + id * id';

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
          <span style={{ fontSize: '18px' }}>🔀</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>COMPETING PARSER LAB — AMBIGUITY DETECTOR</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Comparative Syntactic Branch Evaluation on Identical Terminal Sequence</div>
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: isAmbiguous ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            border: `1px solid ${isAmbiguous ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
            color: isAmbiguous ? '#f87171' : '#4ade80',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {isAmbiguous ? 'AMBIGUITY CONFIRMED (MULTIPLE ASTs)' : 'UNAMBIGUOUS DERIVATION'}
        </div>
      </div>

      {/* Target Terminal String */}
      <div style={{ padding: '10px 14px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
          COMPETING TERMINAL STRING: <strong style={{ color: skin.textColor, fontFamily: 'monospace', fontSize: '13px' }}>w = "{inputString}"</strong>
        </div>
        <div style={{ fontSize: '11px', color: skin.accentColor, fontFamily: 'monospace' }}>
          SAME INPUT ➔ MULTIPLE VALID PARSE TREES
        </div>
      </div>

      {/* Dual Parser Comparison Arena */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {/* Branch A */}
        <div
          style={{
            padding: '14px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: skin.borderRadius,
            border: `1.5px solid ${skin.accentColor}55`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: skin.accentColor }}>PARSER PATH A (Parse Tree 1)</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: `${skin.accentColor}22`, borderRadius: '3px', color: skin.accentColor }}>
              Left-Associative / Branch A
            </span>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div>S ➔ E + E</div>
            <div style={{ paddingLeft: '14px', color: skin.accentColor }}>➔ id + E</div>
            <div style={{ paddingLeft: '28px', color: skin.textColor }}>➔ id + (E * E)</div>
            <div style={{ paddingLeft: '42px', color: skin.mutedTextColor }}>➔ id + id * id</div>
          </div>
          <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
            Grouping interpretation: <code style={{ color: skin.textColor }}>id + (id * id)</code>
          </div>
        </div>

        {/* Branch B */}
        <div
          style={{
            padding: '14px',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: skin.borderRadius,
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#f87171' }}>PARSER PATH B (Parse Tree 2)</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '3px', color: '#f87171' }}>
              Right-Associative / Branch B
            </span>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.6',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div>S ➔ E * E</div>
            <div style={{ paddingLeft: '14px', color: '#f87171' }}>➔ (E + E) * E</div>
            <div style={{ paddingLeft: '28px', color: skin.textColor }}>➔ (id + id) * E</div>
            <div style={{ paddingLeft: '42px', color: skin.mutedTextColor }}>➔ id + id * id</div>
          </div>
          <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>
            Grouping interpretation: <code style={{ color: skin.textColor }}>(id + id) * id</code>
          </div>
        </div>
      </div>

      {/* Compiler impact warning note */}
      <div
        style={{
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: skin.borderRadius,
          fontSize: '11px',
          color: skin.textColor,
          lineHeight: '1.4',
        }}
      >
        <strong style={{ color: '#f87171' }}>Compiler Consequence:</strong> A grammar with multiple parse trees generates ambiguous semantics (e.g. arithmetic precedence errors in code generation). Disambiguation requires rewriting productions or introducing operator precedence declarations.
      </div>
    </div>
  );
};
