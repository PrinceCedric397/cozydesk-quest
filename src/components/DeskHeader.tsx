import React from 'react';
import { Sparkles, Trophy, Volume2, VolumeX, Pin, CheckSquare, Lightbulb, Maximize2, CircleHelp } from 'lucide-react';
import { LampLighting } from '../types';
import { playMechanicalClick, playPinTackSound, playHoverSound } from '../utils/audio';

interface DeskHeaderProps {
  currentXp: number;
  maxXp: number;
  questsDoneCount: number;
  totalQuests: number;
  corkNotesCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenQuests: () => void;
  onOpenTour: () => void;
  onOpenCorkboard: () => void;
  onOpenExpandedStudio: () => void;
  lampLighting: LampLighting;
  onCycleLighting: () => void;
}

export const DeskHeader: React.FC<DeskHeaderProps> = ({
  currentXp,
  maxXp,
  questsDoneCount,
  totalQuests,
  corkNotesCount,
  isMuted,
  onToggleMute,
  onOpenQuests,
  onOpenTour,
  onOpenCorkboard,
  onOpenExpandedStudio,
  lampLighting,
  onCycleLighting,
}) => {
  const pct = Math.min(100, Math.round((currentXp / maxXp) * 100));

  const getRankBadge = () => {
    if (currentXp >= 150) {
      return {
        text: 'LVL 3 • COZY ZEN MASTER',
        cls: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40 animate-pulse',
      };
    }
    if (currentXp >= 70) {
      return {
        text: 'LVL 2 • DESK VIBE SPECIALIST',
        cls: 'bg-sky-400/20 text-sky-400 border-sky-400/40',
      };
    }
    return {
      text: 'LVL 1 • NEAT ROOKIE',
      cls: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    };
  };

  const rank = getRankBadge();

  return (
    <header
      id="tour-top-bar"
      className="relative z-30 flex items-center justify-between p-2.5 sm:px-6 sm:py-3 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-lg select-none"
    >
      {/* Brand & Rank */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff9e80] to-amber-400 text-slate-950 flex items-center justify-center font-pixel text-xl shadow-md font-bold border border-amber-300/40">
          <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-display font-extrabold text-xs sm:text-base tracking-wide text-white flex items-center gap-1.5">
              <span>CozyDesk Quest</span>
              <span className="text-[10px] text-sky-400 font-mono px-1.5 py-0.2 bg-sky-400/10 rounded border border-sky-400/30 hidden xs:inline">
                v2.5
              </span>
            </h1>
            <span
              className={`border font-pixel text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold ${rank.cls}`}
            >
              {rank.text}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono hidden md:block">
            Tactile Desk Sandbox • Mini-Games, Synthesizer, Focus Clock, Ambient Window & Notes
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <div
        id="tour-status-bar"
        className="flex-1 max-w-[120px] xs:max-w-xs sm:max-w-md mx-2 sm:mx-6 flex flex-col gap-0.5 sm:gap-1"
      >
        <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono">
          <span className="text-slate-400 truncate flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-300" />
            QUESTS ({questsDoneCount}/{totalQuests})
          </span>
          <span className="text-emerald-400 font-bold font-mono">
            {currentXp} / {maxXp} XP
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Persistent Help / Tutorial Button */}
        <button
          id="btnTourHelp"
          onClick={() => {
            playMechanicalClick('toggle', 0.08);
            onOpenTour();
          }}
          onMouseEnter={() => playHoverSound(0.015, 600)}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-400/15 hover:bg-amber-400/25 active:scale-95 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Tutorial & Help Walkthrough (?)"
        >
          <CircleHelp className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Tour</span>
        </button>

        {/* Quests Button */}
        <button
          id="btnQuests"
          onClick={() => {
            playMechanicalClick('toggle', 0.08);
            onOpenQuests();
          }}
          onMouseEnter={() => playHoverSound(0.015, 640)}
          className="px-2 sm:px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="View Daily Desk Quests"
        >
          <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Quests</span>
          {questsDoneCount < totalQuests && (
            <span className="w-2 h-2 rounded-full bg-[#ff9e80] animate-ping" />
          )}
        </button>

        {/* Corkboard Bulletin Button */}
        <button
          onClick={() => {
            playPinTackSound(0.09);
            onOpenCorkboard();
          }}
          onMouseEnter={() => playHoverSound(0.015, 680)}
          className="px-2 sm:px-3 py-1.5 bg-[#ff9e80]/15 hover:bg-[#ff9e80]/25 text-[#ff9e80] border border-[#ff9e80]/40 active:scale-95 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Open Bulletin Corkboard"
        >
          <Pin className="w-3.5 h-3.5 text-[#ff9e80]" />
          <span className="hidden xs:inline">Corkboard</span>
          <span>({corkNotesCount})</span>
        </button>

        {/* Expanded Board Studio Button */}
        <button
          id="tour-expanded-board-btn"
          onClick={() => {
            playPinTackSound(0.09);
            onOpenExpandedStudio();
          }}
          onMouseEnter={() => playHoverSound(0.015, 720)}
          className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-400/50 active:scale-95 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          title="Open 2800x2200 Pannable & Zoomable Expanded Corkboard Studio (Press F)"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Expanded Board</span>
          <span className="hidden lg:inline text-[9px] font-mono opacity-70 bg-amber-400/20 px-1 rounded border border-amber-400/30">
            F
          </span>
        </button>

        {/* Desk Lamp Button */}
        <button
          onClick={onCycleLighting}
          onMouseEnter={() => playHoverSound(0.015, 560)}
          className={`px-2 sm:px-2.5 py-1.5 active:scale-95 border rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
            lampLighting !== 'off'
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30'
              : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title="Cycle Desk Lamp Lighting"
        >
          <Lightbulb
            className={`w-3.5 h-3.5 ${
              lampLighting !== 'off' ? 'text-amber-300 fill-amber-300/40' : 'text-slate-500'
            }`}
          />
          <span className="hidden md:inline">Lamp</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              lampLighting !== 'off' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
        </button>

        {/* Audio Mute Button */}
        <button
          onClick={onToggleMute}
          onMouseEnter={() => playHoverSound(0.015, 500)}
          className="p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs transition cursor-pointer"
          title={isMuted ? 'Unmute Audio & SFX' : 'Mute Audio & SFX'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-sky-400" />
          )}
        </button>
      </div>
    </header>
  );
};
