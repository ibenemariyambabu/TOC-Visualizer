import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Download,
  Info,
  ShieldCheck,
  Crosshair,
  Layers,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';
import {
  TOCLayoutEngine,
  LayoutMode,
  NodePosition,
  TransitionModel,
  RoutedEdge,
  DiagramQualityReport
} from './tocLayoutEngine.js';

export interface UniversalAutomataDiagramProps {
  machineType?: 'DFA' | 'NFA' | 'ENFA' | 'PDA' | 'TM' | 'MINIMIZATION' | 'SUBSET' | 'e-NFA' | string;
  states: string[];
  alphabet: string[];
  startState: string;
  acceptStates: string[];
  transitions: TransitionModel[];
  activeState?: string | string[];
  highlightTransition?: { from: string; to: string; input?: string };
  questionText?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  defaultLayoutMode?: LayoutMode;
  onStateSelect?: (state: string) => void;
  onTransitionSelect?: (transition: TransitionModel) => void;
}

export const UniversalAutomataDiagram: React.FC<UniversalAutomataDiagramProps> = ({
  machineType = 'DFA',
  states,
  alphabet,
  startState,
  acceptStates,
  transitions,
  activeState,
  highlightTransition,
  questionText,
  title,
  subtitle,
  className = '',
  defaultLayoutMode = 'EXAM_STYLE',
  onStateSelect,
  onTransitionSelect
}) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(defaultLayoutMode);
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Inspector inspection states
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<RoutedEdge | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // 1. Compute TOC-Aware Layout Positions
  const { positions, bounds } = useMemo(() => {
    return TOCLayoutEngine.computeLayout(
      states,
      startState,
      acceptStates,
      transitions,
      alphabet,
      layoutMode,
      questionText,
      customPositions
    );
  }, [states, startState, acceptStates, transitions, alphabet, layoutMode, questionText, customPositions]);

  // 2. Route Edges with collision avoidance and bidirectional separation
  const routedEdges = useMemo(() => {
    return TOCLayoutEngine.routeEdges(transitions, positions, 24);
  }, [transitions, positions]);

  // 3. Automated Diagram Quality Verification (Section 25)
  const qualityReport: DiagramQualityReport = useMemo(() => {
    return TOCLayoutEngine.validateDiagramQuality(
      states,
      startState,
      acceptStates,
      transitions,
      positions,
      routedEdges
    );
  }, [states, startState, acceptStates, transitions, positions, routedEdges]);

  // Reset view to fit bounds
  const handleFitView = useCallback(() => {
    if (!containerRef.current) return;
    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    const scaleX = (containerW - 80) / bounds.width;
    const scaleY = (containerH - 80) / bounds.height;
    const fitScale = Math.min(1.5, Math.max(0.45, Math.min(scaleX, scaleY)));

    const centerX = bounds.minX + bounds.width / 2;
    const centerY = bounds.minY + bounds.height / 2;

    setZoom(fitScale);
    setPan({
      x: Math.round(containerW / 2 - centerX * fitScale),
      y: Math.round(containerH / 2 - centerY * fitScale)
    });
  }, [bounds]);

  // Focus active state during simulation
  const handleFocusActive = useCallback(() => {
    if (!activeState || !containerRef.current) return;
    const targetState = Array.isArray(activeState) ? activeState[0] : activeState;
    const nodePos = positions[targetState];
    if (!nodePos) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();
    setPan({
      x: Math.round(containerW / 2 - nodePos.x * zoom),
      y: Math.round(containerH / 2 - nodePos.y * zoom)
    });
  }, [activeState, positions, zoom]);

  // Reset view on initial mount or major state change
  useEffect(() => {
    handleFitView();
  }, [states.length, layoutMode, handleFitView]);

  // Drag-and-drop state positioning
  const handleMouseDownNode = (state: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNode(state);
    if (layoutMode !== 'CUSTOM') {
      // Switch to custom mode seamlessly while preserving existing positions
      const currentFlat: Record<string, { x: number; y: number }> = {};
      for (const [k, v] of Object.entries(positions)) {
        currentFlat[k] = { x: v.x, y: v.y };
      }
      setCustomPositions(currentFlat);
      setLayoutMode('CUSTOM');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - pan.x) / zoom);
      const y = Math.round((e.clientY - rect.top - pan.y) / zoom);
      setCustomPositions((prev) => ({
        ...prev,
        [draggingNode]: { x, y }
      }));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleStartPan = (e: React.MouseEvent) => {
    // Only start pan if clicking the background canvas directly
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'diagram-bg') {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const isStateActive = (state: string) => {
    if (!activeState) return false;
    if (typeof activeState === 'string') return activeState === state;
    return activeState.includes(state);
  };

  // Export SVG as file
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${machineType.toLowerCase()}_diagram_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[480px] bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden select-none flex flex-col ${className}`}
    >
      {/* 1. Header Toolbar with Title & Layout Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-4 bg-slate-900/90 border-b border-slate-800 text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-400 uppercase tracking-wider font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            {title || `${machineType} State Transition Diagram`}
          </span>
          {subtitle && (
            <span className="text-slate-500 hidden sm:inline text-[11px]">
              • {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Mode Selector (Section 19) */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Layout:</span>
            <select
              value={layoutMode}
              onChange={(e) => {
                const nextMode = e.target.value as LayoutMode;
                setLayoutMode(nextMode);
                if (nextMode !== 'CUSTOM') {
                  setCustomPositions({});
                }
              }}
              className="bg-transparent text-white text-[11px] font-medium focus:outline-none cursor-pointer"
            >
              <option value="EXAM_STYLE" className="bg-slate-900 text-white">
                Exam Style (Textbook)
              </option>
              <option value="LEFT_TO_RIGHT" className="bg-slate-900 text-white">
                Left → Right
              </option>
              <option value="TOP_TO_BOTTOM" className="bg-slate-900 text-white">
                Top → Bottom
              </option>
              <option value="COMPACT" className="bg-slate-900 text-white">
                Compact Grid
              </option>
              <option value="CUSTOM" className="bg-slate-900 text-white">
                Custom (User Dragged)
              </option>
            </select>
          </div>

          {/* Quality Audit Button (Section 25) */}
          <button
            onClick={() => setShowAuditModal(true)}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
              qualityReport.passed
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/50'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-400 hover:bg-amber-900/50'
            }`}
            title="Automata Diagram Quality Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit {qualityReport.score}%</span>
          </button>

          {/* Zoom / Viewport Controls (Section 18) */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFitView}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Fit to Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            {activeState && (
              <button
                onClick={handleFocusActive}
                className="p-1 rounded hover:bg-slate-700 text-indigo-400 hover:text-white"
                title="Center Active State"
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={handleExportSVG}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Export SVG"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas */}
      <div className="relative flex-1 w-full overflow-hidden bg-grid-pattern cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          id="diagram-bg"
          className="w-full h-full"
          onMouseDown={handleStartPan}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            {/* Standard Gray Arrowhead */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#64748B" />
            </marker>

            {/* Active Highlighted Indigo Arrowhead */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#818CF8" />
            </marker>

            {/* Selected Cyan Arrowhead */}
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38BDF8" />
            </marker>

            {/* Trap Arrowhead */}
            <marker
              id="arrow-trap"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#F43F5E" />
            </marker>

            {/* Glow Filter for Active Elements */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Root Pan/Zoom Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* 1. Transitions / Edges */}
            {routedEdges.map((edge) => {
              const isSelected = selectedEdge?.id === edge.id;
              const isHighlighted =
                highlightTransition &&
                highlightTransition.from === edge.from &&
                highlightTransition.to === edge.to;

              const isTrapTarget = positions[edge.to]?.isTrap;

              const strokeColor = isHighlighted
                ? '#818CF8'
                : isSelected
                ? '#38BDF8'
                : isTrapTarget
                ? '#E11D48'
                : '#475569';

              const marker = isHighlighted
                ? 'url(#arrow-active)'
                : isSelected
                ? 'url(#arrow-selected)'
                : isTrapTarget
                ? 'url(#arrow-trap)'
                : 'url(#arrow-default)';

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdge(edge);
                    setSelectedState(null);
                    if (onTransitionSelect && edge.transitions.length > 0) {
                      onTransitionSelect(edge.transitions[0]);
                    }
                  }}
                >
                  {/* Invisible broad hitbox for easy clicking */}
                  <path
                    d={edge.pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="18"
                  />

                  {/* Main Visible Path */}
                  <path
                    d={edge.pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isHighlighted || isSelected ? 2.75 : 1.75}
                    strokeDasharray={edge.isEpsilon ? '4 3' : undefined}
                    markerEnd={marker}
                    className="transition-colors duration-150"
                  />

                  {/* Animated flow dash when active */}
                  {isHighlighted && (
                    <path
                      d={edge.pathData}
                      fill="none"
                      stroke="#A5B4FC"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Label Plate Background */}
                  {(() => {
                    const labelW = Math.max(38, edge.label.length * 7.5 + 16);
                    return (
                      <g transform={`translate(${edge.labelX}, ${edge.labelY})`}>
                        <rect
                          x={-labelW / 2}
                          y="-11"
                          width={labelW}
                          height="22"
                          rx="5"
                          fill={isHighlighted ? '#1E1B4B' : isSelected ? '#082F49' : '#0F172A'}
                          stroke={isHighlighted ? '#818CF8' : isSelected ? '#38BDF8' : '#334155'}
                          strokeWidth={isHighlighted || isSelected ? 1.5 : 1}
                          className="shadow-sm"
                        />

                        {/* Label Text */}
                        <text
                          textAnchor="middle"
                          dy="4"
                          className={`text-[11px] font-mono font-bold select-none ${
                            isHighlighted
                              ? 'fill-indigo-300'
                              : isSelected
                              ? 'fill-cyan-300'
                              : edge.isEpsilon
                              ? 'fill-purple-300'
                              : 'fill-amber-300'
                          }`}
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* 2. State Nodes */}
            {states.map((st) => {
              const pos = positions[st] || { x: 100, y: 100, isAccept: false, isStart: false, isTrap: false };
              const isStart = pos.isStart;
              const isAccept = pos.isAccept;
              const isTrap = pos.isTrap;
              const active = isStateActive(st);
              const isSelected = selectedState === st;
              const nodeR = Math.max(24, Math.min(38, Math.round(st.length * 4.2 + 8)));

              return (
                <g
                  key={st}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleMouseDownNode(st, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedState(st);
                    setSelectedEdge(null);
                    if (onStateSelect) onStateSelect(st);
                  }}
                  className="cursor-grab active:cursor-grabbing group"
                >
                  {/* Start State Arrow (Section 5) */}
                  {isStart && (
                    <g>
                      <line
                        x1={-nodeR - 32}
                        y1="0"
                        x2={-nodeR - 4}
                        y2="0"
                        stroke="#818CF8"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow-active)"
                      />
                      <text
                        x={-nodeR - 36}
                        y="4"
                        textAnchor="end"
                        className="text-[10px] font-mono font-bold fill-indigo-400 select-none uppercase tracking-wider"
                      >
                        start
                      </text>
                    </g>
                  )}

                  {/* Active Simulation Pulsing Halo (Section 23) */}
                  {active && (
                    <circle
                      r={nodeR + 9}
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="3.5"
                      className="animate-pulse"
                      filter="url(#glow)"
                      opacity="0.85"
                    />
                  )}

                  {/* Selected State Ring */}
                  {isSelected && (
                    <circle
                      r={nodeR + 7}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Double Ring for Final / Accepting States (Section 6) */}
                  {isAccept && (
                    <circle
                      r={nodeR + 4}
                      fill="none"
                      stroke={
                        active
                          ? '#818CF8'
                          : isSelected
                          ? '#38BDF8'
                          : '#10B981'
                      }
                      strokeWidth="2"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={nodeR}
                    fill={
                      active
                        ? '#1E1B4B'
                        : isSelected
                        ? '#082F49'
                        : isTrap
                        ? '#2A0812'
                        : isAccept
                        ? '#064E3B'
                        : '#0F172A'
                    }
                    stroke={
                      active
                        ? '#818CF8'
                        : isSelected
                        ? '#38BDF8'
                        : isTrap
                        ? '#F43F5E'
                        : isAccept
                        ? '#10B981'
                        : '#475569'
                    }
                    strokeWidth={isTrap ? 2.5 : 2}
                    className="transition-colors duration-150 group-hover:stroke-indigo-400 shadow-lg"
                  />

                  {/* State Name */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    className={`${st.length > 5 ? 'text-[10px]' : 'text-xs'} font-mono font-bold select-none ${
                      active
                        ? 'fill-white'
                        : isSelected
                        ? 'fill-cyan-200'
                        : isTrap
                        ? 'fill-rose-300'
                        : isAccept
                        ? 'fill-emerald-200'
                        : 'fill-slate-100'
                    }`}
                  >
                    {st}
                  </text>

                  {/* Trap indicator badge below node (Section 3) */}
                  {isTrap && (
                    <g transform="translate(0, 36)">
                      <rect
                        x="-16"
                        y="-7"
                        width="32"
                        height="14"
                        rx="3"
                        fill="#4C0519"
                        stroke="#BE123C"
                        strokeWidth="0.8"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        className="text-[8px] font-mono font-bold fill-rose-300 uppercase tracking-tighter"
                      >
                        TRAP
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Instructions Overlay */}
        <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-500 font-mono flex items-center gap-2 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800/80 backdrop-blur-sm pointer-events-none">
          <Move className="h-3 w-3 text-slate-400" />
          <span>Drag nodes to position • Drag canvas to pan • Click state/edge to inspect δ</span>
        </div>
      </div>

      {/* 3. Interactive State & Transition Inspector Drawer (Section 22) */}
      {(selectedState || selectedEdge) && (
        <div className="p-3 px-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
          {selectedState ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {selectedState}
                </span>
                <span className="text-slate-400">
                  Role:{' '}
                  <strong className="text-indigo-300">
                    {positions[selectedState]?.isStart ? 'Initial State' : ''}
                    {positions[selectedState]?.isAccept ? ' Accepting (Final)' : ''}
                    {positions[selectedState]?.isTrap ? ' Trap/Dead State' : ''}
                    {!positions[selectedState]?.isStart &&
                    !positions[selectedState]?.isAccept &&
                    !positions[selectedState]?.isTrap
                      ? 'Processing State'
                      : ''}
                  </strong>
                </span>
              </div>

              {/* Outgoing transitions summary */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                <span className="text-slate-500">Outgoing:</span>
                {transitions
                  .filter((t) => t.from === selectedState)
                  .map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 text-amber-300"
                    >
                      δ({t.from}, {t.input || t.readSymbol || 'ε'}) = {t.to}
                    </span>
                  ))}
                {transitions.filter((t) => t.from === selectedState).length === 0 && (
                  <span className="text-slate-500 italic">None (dead end)</span>
                )}
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 text-sm bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {selectedEdge.from} ➔ {selectedEdge.to}
                </span>
                <span className="text-slate-400">
                  Label: <strong className="text-indigo-300">{selectedEdge.label}</strong>
                </span>
              </div>

              {/* Formal Transition Rules (Section 22) */}
              <div className="flex items-center gap-2 font-mono text-[11px]">
                {selectedEdge.transitions.map((t, idx) => {
                  let formalRule = `δ(${t.from}, ${t.input}) = ${t.to}`;
                  if (t.stackTop !== undefined && t.stackReplacement !== undefined) {
                    formalRule = `δ(${t.from}, ${t.input || 'ε'}, ${t.stackTop}) = {(${t.to}, ${t.stackReplacement})}`;
                  } else if (t.readSymbol !== undefined && t.writeSymbol !== undefined) {
                    formalRule = `δ(${t.from}, ${t.readSymbol}) = (${t.to}, ${t.writeSymbol}, ${t.direction})`;
                  }
                  return (
                    <span
                      key={idx}
                      className="bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800 text-indigo-200"
                    >
                      {formalRule}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            onClick={() => {
              setSelectedState(null);
              setSelectedEdge(null);
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Automated Diagram Quality Audit Modal (Section 25) */}
      {showAuditModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">
                  Automata Diagram Quality Audit (Section 25 Compliance)
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {qualityReport.checks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs"
                >
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                      c.passed
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {c.passed ? 'PASS' : 'WARN'}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-200 block">{c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Overall Layout Score: <strong className="text-emerald-400">{qualityReport.score}%</strong></span>
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-sans text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
