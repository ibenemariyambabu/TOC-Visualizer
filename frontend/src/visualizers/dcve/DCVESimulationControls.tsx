import React, { useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Sliders,
  Sparkles,
  Eye,
  GraduationCap,
  FlaskConical,
  FileText,
  Rocket,
  Cpu,
  Gamepad2
} from 'lucide-react';
import { DCVEViewMode, MotionMode } from './types.js';

interface DCVESimulationControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onJumpToStep?: (step: number) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  viewMode?: DCVEViewMode;
  onChangeViewMode?: (mode: DCVEViewMode) => void;
  motionMode?: MotionMode;
  onChangeMotionMode?: (mode: MotionMode) => void;
  onFitView?: () => void;
  isAccepted?: boolean | null;
  statusText?: string;
  className?: string;
}

export const DCVESimulationControls: React.FC<DCVESimulationControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onJumpToStep,
  speed,
  onChangeSpeed,
  viewMode = 'LAB',
  onChangeViewMode,
  motionMode = 'FULL',
  onChangeMotionMode,
  onFitView,
  isAccepted,
  statusText,
  className = ''
}) => {
  // Section 6: Universal Keyboard Shortcuts Listener
  // Space = Play/Pause, ArrowRight = Next, ArrowLeft = Prev, R = Reset, F = Fit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentStep < totalSteps) onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentStep > 0) onPrev();
          break;
        case 'KeyR':
          e.preventDefault();
          onReset();
          break;
        case 'KeyF':
          if (onFitView) {
            e.preventDefault();
            onFitView();
          }
          break;
        default:
          break;
      }
    },
    [onPlayPause, onNext, onPrev, onReset, onFitView, currentStep, totalSteps]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl space-y-3 font-mono text-xs ${className}`}>
      {/* Top Row: Navigation Controls & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Step Indicator & Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-bold text-slate-300">
            <span className="text-indigo-400">Step {currentStep}</span>
            <span className="text-slate-600">/</span>
            <span>{totalSteps}</span>
          </div>

          {statusText && (
            <div
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                isAccepted === true
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : isAccepted === false
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isAccepted === true
                    ? 'bg-emerald-400 animate-ping'
                    : isAccepted === false
                    ? 'bg-rose-400'
                    : 'bg-indigo-400 animate-pulse'
                }`}
              />
              <span>{statusText}</span>
            </div>
          )}
        </div>

        {/* Primary Playback Buttons */}
        <div className="flex items-center gap-1">
          {/* Jump to Start */}
          <button
            onClick={() => onJumpToStep ? onJumpToStep(0) : onReset()}
            disabled={currentStep <= 0}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Jump to Start (First Step)"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            onClick={onPrev}
            disabled={currentStep <= 0}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Step (Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={onPlayPause}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Next Step */}
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Step (Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Jump to End */}
          <button
            onClick={() => onJumpToStep && onJumpToStep(totalSteps)}
            disabled={currentStep >= totalSteps}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Jump to End (Final Step)"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Reset Simulation (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Motion Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400">
            <FastForward className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={speed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              title="Simulation Speed"
            >
              <option value={0.25}>0.25x (Slow-Mo)</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>

          {/* Motion Mode (Section 47) */}
          {onChangeMotionMode && (
            <select
              value={motionMode}
              onChange={(e) => onChangeMotionMode(e.target.value as MotionMode)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono hidden sm:inline"
              title="Motion & Animation Mode"
            >
              <option value="FULL">Motion: Full</option>
              <option value="REDUCED">Motion: Reduced</option>
              <option value="OFF">Motion: Off</option>
            </select>
          )}

          {onFitView && (
            <button
              onClick={onFitView}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              title="Fit Diagram to View (F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Step Scrubber Slider & Presentation View Selector (Section 52-54) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
        {/* Step Slider */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Scrubber:</span>
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={currentStep}
            onChange={(e) => onJumpToStep && onJumpToStep(Number(e.target.value))}
            className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* View Mode Switcher (Section 52-54: Lab / Learning / Exam) */}
        {onChangeViewMode && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
            <button
              onClick={() => onChangeViewMode('REAL_APP')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'REAL_APP'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Real Application Mode: Domain-specific realistic simulated systems"
            >
              <Rocket className="w-3 h-3 text-cyan-400" />
              <span>Real App</span>
            </button>

            <button
              onClick={() => onChangeViewMode('MACHINE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'MACHINE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Machine View: Physical computational apparatus & state matrix"
            >
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>Machine</span>
            </button>

            <button
              onClick={() => onChangeViewMode('LAB')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'LAB'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full interactive virtual lab experience"
            >
              <FlaskConical className="w-3 h-3" />
              <span>Lab</span>
            </button>

            <button
              onClick={() => onChangeViewMode('LEARNING')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'LEARNING'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Teaching-oriented mode with expanded pedagogical explanations"
            >
              <GraduationCap className="w-3 h-3" />
              <span>Learning</span>
            </button>

            <button
              onClick={() => onChangeViewMode('EXAM')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'EXAM'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Exam-oriented compact presentation with formal definition and derivation"
            >
              <FileText className="w-3 h-3" />
              <span>Exam</span>
            </button>

            <button
              onClick={() => onChangeViewMode('ARCADE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewMode === 'ARCADE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="TOC Arcade: Gamified mission objectives and test waves"
            >
              <Gamepad2 className="w-3 h-3 text-rose-400" />
              <span>Arcade</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
