import React, { useState } from 'react';
import { RealAppProps } from '../types';

interface TestWaveItem {
  input: string;
  expected: boolean;
  actual?: boolean;
  passed?: boolean;
  failStep?: number;
  expectedRule?: string;
  actualRule?: string;
}

export const TOCArcadePanel: React.FC<RealAppProps> = ({
  machine,
  currentStep,
  skin,
  onTransitionClick,
}) => {
  // Test wave strings derived from machine language or standard patterns
  const [testWave, setTestWave] = useState<TestWaveItem[]>([
    { input: '101', expected: true },
    { input: '1001', expected: false },
    { input: '1101', expected: true },
    { input: '000', expected: false },
    { input: '01010', expected: true },
  ]);

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestWaveItem[] | null>(null);
  const [selectedFailure, setSelectedFailure] = useState<TestWaveItem | null>(null);

  // Objectives checklist
  const stateCount = machine?.states?.length || 0;
  const finalCount = machine?.finalStates?.length || 0;
  const hasInitial = !!machine?.initialState;
  const objectives = [
    { title: 'Machine Initialized with Valid Start State (q0)', completed: hasInitial },
    { title: `State Graph Populated (${stateCount} states registered)`, completed: stateCount > 0 },
    { title: `Acceptance Condition Formulated (${finalCount} final states)`, completed: finalCount > 0 },
    { title: 'Test Wave Integrity Verified (100% test pass rate)', completed: testResults?.every(r => r.passed) ?? false },
  ];

  const handleRunTestWave = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      // Simulate validation against the machine's actual final states / language
      const results: TestWaveItem[] = testWave.map((item, idx) => {
        // Real deterministic check simulation: does it reach a final state?
        // To be faithful: simulate using machine transitions if possible
        let curr = machine?.initialState || 'q0';
        let failAt: number | undefined;
        let expR: string | undefined;
        let actR: string | undefined;

        for (let i = 0; i < item.input.length; i++) {
          const char = item.input[i];
          const next = machine?.transitions?.[curr]?.[char];
          if (!next && !failAt) {
            failAt = i + 1;
            expR = `δ(${curr}, '${char}') = valid_target`;
            actR = `δ(${curr}, '${char}') = UNDEFINED`;
          }
          if (next) {
            curr = Array.isArray(next) ? next[0] : next;
          }
        }

        const isFinal = machine?.finalStates?.includes(curr) ?? false;
        const passed = isFinal === item.expected;

        return {
          ...item,
          actual: isFinal,
          passed,
          failStep: passed ? undefined : (failAt || item.input.length),
          expectedRule: passed ? undefined : (expR || `End in ${item.expected ? 'F' : 'Q - F'}`),
          actualRule: passed ? undefined : (actR || `Ended in ${curr} (${isFinal ? 'F' : 'non-F'})`),
        };
      });

      setTestResults(results);
      setIsRunningTests(false);
      const firstFail = results.find(r => !r.passed);
      if (firstFail) {
        setSelectedFailure(firstFail);
      } else {
        setSelectedFailure(null);
      }
    }, 400);
  };

  const passCount = testResults?.filter(r => r.passed).length || 0;

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
          <span style={{ fontSize: '18px' }}>🕹️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em' }}>TOC ARCADE: MISSION DISPATCH CONSOLE</div>
            <div style={{ fontSize: '11px', color: skin.mutedTextColor }}>Gamified Objective Verification & Automated Test Wave Diagnostics</div>
          </div>
        </div>
        <button
          onClick={handleRunTestWave}
          disabled={isRunningTests}
          style={{
            padding: '6px 14px',
            borderRadius: '4px',
            background: skin.accentColor,
            color: '#000',
            fontWeight: 800,
            fontSize: '12px',
            border: 'none',
            cursor: isRunningTests ? 'not-allowed' : 'pointer',
            opacity: isRunningTests ? 0.7 : 1,
            boxShadow: `0 0 12px ${skin.accentColor}55`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isRunningTests ? 'SCANNING WAVES...' : '▶ RUN TEST WAVE'}
        </button>
      </div>

      {/* Grid: Mission Objectives + Test Waves Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
        {/* Objectives */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
            TACTICAL MISSION OBJECTIVES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {objectives.map((obj, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  background: obj.completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${obj.completed ? 'rgba(34, 197, 94, 0.3)' : skin.borderColor}`,
                  fontSize: '12px',
                }}
              >
                <span style={{ fontSize: '14px', color: obj.completed ? '#4ade80' : skin.mutedTextColor }}>
                  {obj.completed ? '☑' : '☐'}
                </span>
                <span style={{ color: obj.completed ? skin.textColor : skin.mutedTextColor }}>
                  {obj.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Test Wave Radar */}
        <div style={{ padding: '12px', background: skin.subPanelBg, borderRadius: skin.borderRadius, border: `1px solid ${skin.borderColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: skin.mutedTextColor, textTransform: 'uppercase' }}>
              INPUT TEST WAVE RADAR
            </div>
            {testResults && (
              <span style={{ fontSize: '11px', fontWeight: 800, color: passCount === testResults.length ? '#4ade80' : '#f87171' }}>
                {passCount}/{testResults.length} PASSED
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(testResults || testWave).map((item, idx) => {
              const isPassed = item.passed;
              const hasResult = item.passed !== undefined;
              return (
                <div
                  key={idx}
                  onClick={() => !isPassed && hasResult && setSelectedFailure(item)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${hasResult ? (isPassed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)') : skin.borderColor}`,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    cursor: !isPassed && hasResult ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ color: skin.textColor }}>w = "{item.input}"</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: skin.mutedTextColor }}>
                      Exp: {item.expected ? 'ACCEPT' : 'REJECT'}
                    </span>
                    {hasResult ? (
                      <span style={{ color: isPassed ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                        {isPassed ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    ) : (
                      <span style={{ color: skin.mutedTextColor }}>PENDING</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Debug Inspector on Failure */}
      {selectedFailure && (
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.4)',
            borderRadius: skin.borderRadius,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '12px', color: '#f87171' }}>
              ⚠️ MACHINE DEBUGGER: FAILURE DETECTED ON "{selectedFailure.input}"
            </span>
            <span style={{ fontSize: '11px', color: skin.mutedTextColor }}>
              Fault at Step #{selectedFailure.failStep}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
            <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <span style={{ color: '#4ade80' }}>Expected: </span>
              {selectedFailure.expectedRule}
            </div>
            <div style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <span style={{ color: '#f87171' }}>Actual: </span>
              {selectedFailure.actualRule}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
