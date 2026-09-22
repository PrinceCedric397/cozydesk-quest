import React from 'react';
import { Plus, RotateCcw, Sun, Moon, CloudRain, Maximize2, Minimize2, Pin, ZoomIn, ZoomOut } from 'lucide-react';
import { playMechanicalClick, playPinTackSound, playHoverSound } from '../utils/audio';

interface DeskFooterProps {
  onSpawnSticky: () => void;
  onResetLayout: () => void;
  isNight: boolean;
  onToggleDayNight: () => void;
  isRainActive: boolean;
  onToggleRain: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenExpandedStudio: () => void;
  deskScale?: number;
  onZoomInDesk?: () => void;
  onZoomOutDesk?: () => void;
  onResetDeskZoom?: () => void;
}

export const DeskFooter: React.FC<DeskFooterProps> = ({
  onSpawnSticky,
  onResetLayout,
  isNight,
  onToggleDayNight,
  isRainActive,
  onToggleRain,
  isZenMode,
  onToggleZenMode,
  onOpenExpandedStudio,
  deskScale = 1.0,
  onZoomInDesk,
  onZoomOutDesk,
  onResetDeskZoom,
}) => {
  return (
    <footer
      id="tour-bottom-dock"
      className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md select-none"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[85vw] no-scrollbar">
        <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 hidden sm:inline shrink-0">
          Desk Tools:
        </span>

        {/* Desk Zoom Controls */}
        {onZoomInDesk && onZoomOutDesk && onResetDeskZoom && (
          <div className="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-lg p-0.5 shadow-inner mr-1 shrink-0">
            <button
              onClick={onZoomOutDesk}
              onMouseEnter={() => playHoverSound(0.012, 500)}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded active:scale-90 transition cursor-pointer"
              title="Zoom Out Desk (-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={onResetDeskZoom}
              onMouseEnter={() => playHoverSound(0.012, 550)}
              className="px-1.5 text-[10px] font-mono font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
              title="Reset Desk Zoom to 100% (0)"
            >
              {Math.round(deskScale * 100)}%
            </button>
            <button
              onClick={onZoomInDesk}
              onMouseEnter={() => playHoverSound(0.012, 600)}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded active:scale-90 transition cursor-pointer"
              title="Zoom In Desk (+)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Expanded Board Button */}
        <button
          onClick={() => {
            playPinTackSound(0.09);
            onOpenExpandedStudio();
          }}
          onMouseEnter={() => playHoverSound(0.015, 620)}
          className="shrink-0 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-xs rounded-lg border border-amber-400/40 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer text-amber-300 shadow-sm"
          title="Open Expanded Corkboard Studio (2800x2200 px Canvas) [Press F]"
        >
          <Pin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">Expanded Board</span>
          <span className="text-[9px] bg-amber-400/20 px-1 rounded border border-amber-400/30 hidden xs:inline">
            F
          </span>
        </button>

        {/* Spawn Sticky Button */}
        <button
          id="btnSpawnSticky"
          onClick={onSpawnSticky}
          onMouseEnter={() => playHoverSound(0.015, 660)}
          className="shrink-0 px-3 py-1 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 hover:text-amber-200 text-xs rounded-lg border border-amber-400/50 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer shadow-sm ring-1 ring-amber-400/20"
          title="Add a new draggable sticky note (Press N)"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">Sticky</span>
          <span className="text-[9px] bg-amber-400/25 text-amber-200 px-1 rounded border border-amber-400/40 hidden xs:inline">
            N
          </span>
        </button>

        {/* Reset Positions */}
        <button
          onClick={onResetLayout}
          onMouseEnter={() => playHoverSound(0.015, 580)}
          className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer text-sky-300"
          title="Rearrange all desk widgets into clean default layout"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Pos</span>
        </button>

        {/* Day / Night Toggle */}
        <button
          onClick={onToggleDayNight}
          onMouseEnter={() => playHoverSound(0.015, 700)}
          className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          title="Toggle Room Daylight or Cozy Night Ambient"
        >
          {isNight ? (
            <Moon className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">{isNight ? 'Night' : 'Day'}</span>
        </button>

        {/* Rain Sound Toggle */}
        <button
          onClick={onToggleRain}
          onMouseEnter={() => playHoverSound(0.015, 520)}
          className={`shrink-0 px-2.5 py-1 text-xs rounded-lg border font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer ${
            isRainActive
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Toggle soft generative window rain sound"
        >
          <CloudRain className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Rain Sound</span>
        </button>

        {/* Zen Mode */}
        <button
          onClick={() => {
            playMechanicalClick('toggle', 0.08);
            onToggleZenMode();
          }}
          onMouseEnter={() => playHoverSound(0.015, 600)}
          className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer text-slate-300"
          title="Toggle Zen Mode (hide toolbars for pure focus)"
        >
          {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Zen Mode</span>
        </button>
      </div>

      {/* Touch drag indicator */}
      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <span className="hidden md:inline">Drag any widget to rearrange</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    </footer>
  );
};
