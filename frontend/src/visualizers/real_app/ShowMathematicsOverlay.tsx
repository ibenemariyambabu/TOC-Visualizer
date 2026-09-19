import React, { useState } from 'react';
import { ComputationStep } from '../dcve/types.js';
import { BookOpen, ChevronDown, ChevronUp, Code2, Eye, EyeOff } from 'lucide-react';

interface ShowMathematicsOverlayProps {
  machineType: 'DFA' | 'NFA' | 'PDA' | 'TM' | 'CFG' | 'REGEX';
  model: any;
  currentStep: ComputationStep;
  alphabet: string[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const ShowMathematicsOverlay: React.FC<ShowMathematicsOverlayProps> = ({
  machineType,
  model,
  currentStep,
  alphabet,
  isOpen,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`rounded-xl border font-mono text-xs transition-all ${isOpen ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-900/60 border-slate-800'} ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-850/40 rounded-xl transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-slate-200 tracking-wider uppercase text-xs">
            [ {isOpen ? 'HIDE MATHEMATICS' : 'SHOW MATHEMATICS'} ]
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            Formal δ, 7-Tuple & Instantaneous Description
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Mathematical Panel */}
      {isOpen && (
        <div className="p-4 border-t border-indigo-500/20 space-y-4 animate-in fade-in duration-150">
          {/* Active Mathematical Transition Rule */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-indigo-500/30 space-y-1.5">
            <span className="text-[10px] uppercase text-indigo-400 font-bold block">
              ACTIVE TRANSITION FORMULA δ:
            </span>
            <div className="text-sm font-bold text-cyan-300">
              {currentStep?.ruleApplied?.formula || 'δ(q0, ε) = q0'}
            </div>
            <p className="text-slate-400 font-sans text-xs">
              {currentStep?.ruleApplied?.explanation}
            </p>
          </div>

          {/* Instantaneous Description (ID) */}
          {currentStep?.before?.instantaneousDescription && (
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-amber-400 font-bold block">
                INSTANTANEOUS DESCRIPTION (ID CONFIGURATION):
              </span>
              <div className="text-xs font-bold text-amber-200">
                {currentStep.before.instantaneousDescription}
                {currentStep.after.instantaneousDescription && (
                  <>
                    <span className="text-slate-400 px-2">⊢</span>
                    <span className="text-emerald-300">{currentStep.after.instantaneousDescription}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Formal Tuple Specification */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] text-slate-300">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">
              FORMAL MACHINE DEFINITION:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>States Q:</strong> &#123;{(model?.states || []).join(', ')}&#125;
              </div>
              <div>
                <strong>Alphabet Σ:</strong> &#123;{(alphabet || []).join(', ')}&#125;
              </div>
              <div>
                <strong>Start State q0:</strong> {model?.startState || model?.initialState || 'q0'}
              </div>
              <div>
                <strong>Accept States F:</strong> &#123;{(model?.acceptStates || (model?.acceptState ? [model.acceptState] : [])).join(', ')}&#125;
              </div>
              {machineType === 'PDA' && model?.stackAlphabet && (
                <>
                  <div>
                    <strong>Stack Alphabet Γ:</strong> &#123;{model.stackAlphabet.join(', ')}&#125;
                  </div>
                  <div>
                    <strong>Base Stack Symbol Z0:</strong> {model.initialStackSymbol || 'Z0'}
                  </div>
                </>
              )}
              {machineType === 'TM' && (
                <>
                  <div>
                    <strong>Tape Alphabet Γ:</strong> &#123;{(model?.tapeAlphabet || []).join(', ')}&#125;
                  </div>
                  <div>
                    <strong>Blank Symbol B:</strong> '{model?.blankSymbol || '□'}'
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
