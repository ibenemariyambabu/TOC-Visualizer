import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface VisualizerControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  statusText?: string;
  isAccepted?: boolean | null;
}

export const VisualizerControls: React.FC<VisualizerControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  speed,
  onChangeSpeed,
  statusText,
  isAccepted
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg backdrop-blur-md">
      {/* Step Counter and Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono font-semibold text-slate-300 border border-slate-700">
          <span className="text-indigo-400">Step {currentStep}</span>
          <span className="text-slate-500">/</span>
          <span>{totalSteps}</span>
        </div>

        {statusText && (
          <div
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
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
                  : 'bg-indigo-400'
              }`}
            />
            <span>{statusText}</span>
          </div>
        )}
      </div>

      {/* Main Playback Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          title="Reset to Step 0"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={onPrev}
          disabled={currentStep <= 0}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-700"
          title="Previous Step"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-transparent hover:border-slate-700"
          title="Next Step"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FastForward className="h-3.5 w-3.5 text-slate-500" />
        <span className="hidden sm:inline">Speed:</span>
        <select
          value={speed}
          onChange={(e) => onChangeSpeed(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1.0x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2.0x</option>
        </select>
      </div>
    </div>
  );
};
