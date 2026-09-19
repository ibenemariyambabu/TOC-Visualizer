import React from 'react';
import { RealAppProps } from '../types';

export const ComputabilityChamber: React.FC<RealAppProps> = (props) => {
  const {
    machine = props.model,
    currentStep,
    skin,
  } = props;

  const problemName = (machine as any)?.problemName || currentStep?.event?.description || currentStep?.explanation || 'Halting Problem (HALT_TM)';
  const decidabilityStatus = (machine as any)?.decidabilityStatus || 'UNDECIDABLE';
  const isDecidable = decidabilityStatus.toUpperCase() === 'DECIDABLE';
  const reductionTarget = (machine as any)?.reductionTarget || 'A_TM (Acceptance Problem)';
  const formalProof = currentStep?.explanation || 'Proof by diagonalization and reduction to the universal halting problem.';

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
          <span style={{ fontSize: '18px' }}>🌌</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>THEORETICAL COMPUTABILITY CHAMBER</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Decidability Oracle, Church-Turing Boundary & Reduction Pipeline</div>
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: isDecidable ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isDecidable ? '#22c55e' : '#ef4444'}`,
            color: isDecidable ? '#4ade80' : '#f87171',
            fontSize: '11px',
            fontWeight: 800,
          }}
        >
          {decidabilityStatus}
        </div>
      </div>

      {/* Conceptual Reduction Pipeline: PROBLEM -> FORMALIZATION -> ANALYSIS -> CLASSIFICATION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {/* Step 1: Formal Language Formulation */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            1. PROBLEM ENCODING
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: skin.textColor, wordBreak: 'break-all' }}>
            {problemName}
          </div>
          <div style={{ fontSize: '11px', color: skin.mutedTextColor, marginTop: '4px' }}>
            Encoded as language of machine representations &lt;M, w&gt;
          </div>
        </div>

        {/* Step 2: Diagonalization / Reduction Bridge */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            2. MAPPING REDUCTION (≤m)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: skin.accentColor, wordBreak: 'break-all' }}>
            {reductionTarget}
          </div>
          <div style={{ fontSize: '11px', color: skin.mutedTextColor, marginTop: '4px' }}>
            Algorithmic reduction establishes hardness ceiling
          </div>
        </div>

        {/* Step 3: Decider Oracle Test */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '10px', color: skin.mutedTextColor, fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            3. UNIVERSAL DECIDER?
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: isDecidable ? '#4ade80' : '#f87171' }}>
            {isDecidable ? 'TOTALLY HALTING TM EXISTS' : 'CONTRADICTION BY DIAGONALIZATION'}
          </div>
          <div style={{ fontSize: '11px', color: skin.mutedTextColor, marginTop: '4px' }}>
            {isDecidable ? 'Recursive Language (Decidable)' : 'Not Turing-Decidable'}
          </div>
        </div>
      </div>

      {/* Formal Theoretical Justification Box */}
      <div
        style={{
          padding: '14px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: skin.accentColor, textTransform: 'uppercase' }}>
          CHURCH-TURING THEORETICAL ANALYSIS & PROOF
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6', color: skin.textColor }}>
          {formalProof}
        </div>
      </div>

      {/* Universal Hierarchy Visual Reference */}
      <div
        style={{
          padding: '10px 14px',
          background: skin.subPanelBg,
          borderRadius: skin.borderRadius,
          border: `1px solid ${skin.borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11px',
          color: skin.mutedTextColor,
        }}
      >
        <div>
          <strong>Chomsky & Computability Hierarchy:</strong> Regular ⊂ Context-Free ⊂ Decidable (Recursive) ⊂ Recognizable (Recursively Enumerable)
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '10px', padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
          Rice's Theorem / Post Correspondence Problem
        </div>
      </div>
    </div>
  );
};
