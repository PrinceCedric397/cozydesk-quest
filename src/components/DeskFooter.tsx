import React, { useState } from 'react';
import {
  Plus,
  RotateCcw,
  Sun,
  Moon,
  CloudRain,
  Minimize2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Trophy,
  LayoutGrid,
  Radio,
  Timer,
  Lightbulb,
  Gamepad2,
  StickyNote,
  Coffee,
  Sparkles,
  Bot,
  ChevronUp,
  ChevronDown,
  Grid,
} from 'lucide-react';
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
  onOpenExpandedStudio?: () => void;
  deskScale?: number;
  onZoomInDesk?: () => void;
  onZoomOutDesk?: () => void;
  onResetDeskZoom?: () => void;
  onOpenQuests?: () => void;
  questsDoneCount?: number;
  totalQuests?: number;
  onFocusWidget?: (widgetId: string) => void;
  activeFocusedWidget?: string | null;
  onAutoStackMobile?: () => void;
  isGridSnapEnabled?: boolean;
  onToggleGridSnap?: () => void;
}

const QUICK_WIDGETS = [
  { id: 'widget-sky', label: 'Sky', icon: Moon, emoji: '🌌' },
  { id: 'widget-pomodoro', label: 'Clock', icon: Timer, emoji: '⏱️' },
  { id: 'widget-lamp', label: 'Lamp', icon: Lightbulb, emoji: '💡' },
  { id: 'widget-pet', label: 'Pet', icon: Bot, emoji: '👾' },
  { id: 'widget-tictactoe', label: 'Games', icon: Gamepad2, emoji: '🎮' },
  { id: 'widget-boombox', label: 'Lo-Fi', icon: Radio, emoji: '🎧' },
  { id: 'widget-notes', label: 'Notes', icon: StickyNote, emoji: '📌' },
  { id: 'widget-coffee', label: 'Mug', icon: Coffee, emoji: '☕' },
  { id: 'widget-plant', label: 'Plant', icon: Sparkles, emoji: '🌱' },
];

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
  onOpenQuests,
  questsDoneCount = 0,
  totalQuests = 5,
  onFocusWidget,
  activeFocusedWidget = null,
  onAutoStackMobile,
  isGridSnapEnabled = true,
  onToggleGridSnap,
}) => {
  const [showQuickDrawer, setShowQuickDrawer] = useState(true);

  return (
    <footer
      id="bottom-toolbar"
      data-tour="tour-bottom-dock"
      className="relative z-30 flex flex-col bg-slate-900/95 border-t border-slate-800 backdrop-blur-md select-none shrink-0"
    >
      {/* Mobile Horizontal Quick Widget Drawer (Scrollable Dock) */}
      <div className="md:hidden border-b border-slate-800/80 bg-slate-950/80 px-2 py-1.5 transition-all">
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span>QUICK GADGETS:</span>
            {activeFocusedWidget && (
              <span className="text-amber-300 font-bold">
                Focused: {QUICK_WIDGETS.find((w) => w.id === activeFocusedWidget)?.label || 'Item'}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowQuickDrawer((p) => !p)}
            className="text-[10px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-0.5 p-1 touch-manipulation cursor-pointer"
          >
            <span>{showQuickDrawer ? 'Hide' : 'Show'}</span>
            {showQuickDrawer ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {showQuickDrawer && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar scroll-smooth">
            {QUICK_WIDGETS.map((w) => {
              const Icon = w.icon;
              const isFocused = activeFocusedWidget === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    playMechanicalClick('key', 0.08);
                    if (onFocusWidget) {
                      onFocusWidget(w.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-all active:scale-95 touch-manipulation min-h-[44px] cursor-pointer border ${
                    isFocused
                      ? 'bg-amber-400/25 text-amber-200 border-amber-400/60 font-bold shadow-md ring-1 ring-amber-400/40'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                  title={`Focus ${w.label}`}
                >
                  <span className="text-sm">{w.emoji}</span>
                  <span className="font-medium">{w.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 min-h-[48px]">
        {/* Mobile Ergonomic Navigation Tabs (< 768px) */}
        <div className="flex md:hidden items-center justify-around w-full gap-1">
          {/* Quests Button */}
          {onOpenQuests && (
            <button
              onClick={() => {
                playMechanicalClick('toggle', 0.08);
                onOpenQuests();
              }}
              className="flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-200 border border-slate-700 min-h-[44px] transition relative cursor-pointer"
              title="Daily Quests"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="text-[10px] font-mono font-bold mt-0.5">Quests</span>
              {questsDoneCount < totalQuests && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ff9e80] animate-ping" />
              )}
            </button>
          )}

          {/* New Sticky Note */}
          <button
            id="btnSpawnStickyMobile"
            onClick={onSpawnSticky}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-[#ff9e80]/20 active:bg-[#ff9e80]/30 text-[#ff9e80] border border-[#ff9e80]/40 min-h-[44px] transition cursor-pointer"
            title="Add New Sticky Note"
          >
            <Plus className="w-4 h-4 text-[#ff9e80]" />
            <span className="text-[10px] font-mono font-bold mt-0.5">+Note</span>
          </button>

          {/* Auto Stack / Clean Layout */}
          <button
            onClick={() => {
              playMechanicalClick('switch', 0.08);
              if (onAutoStackMobile) {
                onAutoStackMobile();
              } else {
                onResetLayout();
              }
            }}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 text-sky-300 border border-slate-700 min-h-[44px] transition cursor-pointer"
            title="Organize / Auto-Stack Widgets for Mobile Stage"
          >
            <LayoutGrid className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-mono font-bold mt-0.5">Stack</span>
          </button>

          {/* Day / Night Ambient Toggle */}
          <button
            onClick={onToggleDayNight}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-slate-800/90 active:bg-slate-700 text-slate-300 border border-slate-700 min-h-[44px] transition cursor-pointer"
            title="Toggle Day/Night"
          >
            {isNight ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-[10px] font-mono mt-0.5">{isNight ? 'Night' : 'Day'}</span>
          </button>
        </div>

        {/* Desktop Dock Actions (>= 768px) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[85vw] no-scrollbar">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 shrink-0">
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

          {/* Grid Snap Toggle */}
          {onToggleGridSnap && (
            <button
              onClick={onToggleGridSnap}
              onMouseEnter={() => playHoverSound(0.015, 610)}
              className={`shrink-0 px-2.5 py-1 text-xs rounded-lg border font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer ${
                isGridSnapEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
              title="Toggle Grid Snapping (16px grid or free-form drag)"
            >
              <Grid className="w-3.5 h-3.5 text-amber-400" />
              <span>Snap: {isGridSnapEnabled ? '16px' : 'Free'}</span>
            </button>
          )}

          {/* Reset Positions / Auto-arrange */}
          <button
            onClick={onResetLayout}
            onMouseEnter={() => playHoverSound(0.015, 580)}
            className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 font-mono flex items-center gap-1.5 active:scale-95 transition cursor-pointer text-sky-300"
            title="Auto-arrange all desk widgets into clean 3-column default layout"
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

        {/* Desktop status indicator */}
        <div className="hidden md:flex text-[11px] font-mono text-slate-400 items-center gap-2">
          <span>Drag any widget to rearrange</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </footer>
  );
};

