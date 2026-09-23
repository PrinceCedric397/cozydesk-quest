import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Pin,
  CheckSquare,
  Lightbulb,
  Maximize2,
  CircleHelp,
  Menu,
  X,
  RotateCcw,
  Sun,
  Moon,
  CloudRain,
  Eye,
  LogOut,
  Cloud,
} from 'lucide-react';
import { LampLighting, SkyMode } from '../types';
import { playMechanicalClick, playPinTackSound, playHoverSound } from '../utils/audio';
import { useFirebase } from '../firebase/FirebaseContext';

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
  skyMode?: SkyMode;
  onCycleSky?: () => void;
  onResetLayout?: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
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
  skyMode = 'midnight',
  onCycleSky,
  onResetLayout,
  isZenMode = false,
  onToggleZenMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, authLoading, syncStatus, signInWithGoogle, signOutUser } = useFirebase();
  const pct = Math.min(100, Math.round((currentXp / maxXp) * 100));

  const getRankBadge = () => {
    if (currentXp >= 150) {
      return {
        text: 'LVL 3 • COZY ZEN MASTER',
        shortText: 'LVL 3',
        cls: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/40 animate-pulse',
      };
    }
    if (currentXp >= 70) {
      return {
        text: 'LVL 2 • DESK VIBE SPECIALIST',
        shortText: 'LVL 2',
        cls: 'bg-sky-400/20 text-sky-400 border-sky-400/40',
      };
    }
    return {
      text: 'LVL 1 • NEAT ROOKIE',
      shortText: 'LVL 1',
      cls: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    };
  };

  const rank = getRankBadge();

  return (
    <>
      <header
        id="top-nav"
        data-tour="tour-top-bar"
        className="relative z-30 flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-lg select-none min-h-[52px]"
      >
        {/* Brand & Rank */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#ff9e80] to-amber-400 text-slate-950 flex items-center justify-center font-pixel text-xl shadow-md font-bold border border-amber-300/40 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-display font-extrabold text-xs sm:text-base tracking-wide text-white flex items-center gap-1">
                <span>CozyDesk</span>
                <span className="hidden sm:inline">Quest</span>
              </h1>
              {/* Full rank on desktop, compact on mobile */}
              <span
                className={`border font-pixel text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md font-bold ${rank.cls}`}
              >
                <span className="sm:hidden">{rank.shortText}</span>
                <span className="hidden sm:inline">{rank.text}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden lg:block">
              Tactile Desk Sandbox • Mini-Games, Synthesizer, Ambient Window & Notes
            </p>
          </div>
        </div>

        {/* XP Bar (Responsive: compact on mobile, full width on desktop) */}
        <div
          id="tour-status-bar"
          className="flex-1 max-w-[110px] xs:max-w-[150px] sm:max-w-md mx-2 sm:mx-6 flex flex-col gap-0.5 sm:gap-1"
        >
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono">
            <span className="text-slate-400 truncate flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="hidden xs:inline">XP</span>
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              {currentXp}/{maxXp}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Desktop Header Actions (hidden on < 768px mobile) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
          {/* Help / Tutorial Button */}
          <button
            id="btnTourHelp"
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              onOpenTour();
            }}
            onMouseEnter={() => playHoverSound(0.015, 600)}
            className="px-2.5 py-1.5 bg-amber-400/15 hover:bg-amber-400/25 active:scale-95 border border-amber-400/40 text-amber-300 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer min-h-[36px]"
            title="Tutorial & Help Walkthrough (?)"
          >
            <CircleHelp className="w-3.5 h-3.5 text-amber-400" />
            <span>Tour</span>
          </button>

          {/* Quests Button */}
          <button
            id="btnQuests"
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              onOpenQuests();
            }}
            onMouseEnter={() => playHoverSound(0.015, 640)}
            className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer min-h-[36px]"
            title="View Daily Desk Quests"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>Quests</span>
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
            className="px-3 py-1.5 bg-[#ff9e80]/15 hover:bg-[#ff9e80]/25 text-[#ff9e80] border border-[#ff9e80]/40 active:scale-95 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer min-h-[36px]"
            title="Open Bulletin Corkboard"
          >
            <Pin className="w-3.5 h-3.5 text-[#ff9e80]" />
            <span>Corkboard</span>
            <span>({corkNotesCount})</span>
          </button>

          {/* Expanded Board Studio Button */}
          <button
            id="btn-expanded-board"
            data-tour="tour-expanded-board-btn"
            onClick={() => {
              playPinTackSound(0.09);
              onOpenExpandedStudio();
            }}
            onMouseEnter={() => playHoverSound(0.015, 720)}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-400/50 active:scale-95 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer min-h-[36px]"
            title="Open 2800x2200 Pannable & Zoomable Expanded Corkboard Studio (Press F)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Expanded Board</span>
            <span className="text-[9px] font-mono opacity-70 bg-amber-400/20 px-1 rounded border border-amber-400/30">
              F
            </span>
          </button>

          {/* Desk Lamp Button */}
          <button
            onClick={onCycleLighting}
            onMouseEnter={() => playHoverSound(0.015, 560)}
            className={`px-2.5 py-1.5 active:scale-95 border rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer min-h-[36px] ${
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
            <span>Lamp</span>
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
            className="p-2 bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-xs transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={isMuted ? 'Unmute Audio & SFX' : 'Mute Audio & SFX'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {/* Firebase Authentication & Cloud Sync Button */}
          {authLoading ? (
            <div className="px-2.5 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-400 flex items-center gap-1.5 min-h-[36px]">
              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-mono">Firebase...</span>
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl text-xs font-display font-medium text-slate-200 flex items-center gap-2 transition cursor-pointer min-h-[36px]"
                title={`Logged in as ${user.displayName || user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full ring-1 ring-emerald-400/60 object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[72px] truncate text-[11px] font-mono text-emerald-300">
                  {user.displayName?.split(' ')[0] || 'Explorer'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Cloud Synced" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-2">
                  <div className="px-2 py-1.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.displayName || 'Cozy Explorer'}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>Firebase Firestore Synced</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      await signOutUser();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-2.5 py-1.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-200 border border-sky-400/40 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm min-h-[36px]"
              title="Sign in with Google to sync desk progress and post to Community Corkboard"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile Header Right Slot: Audio toggle + Hamburger Menu (>= 44x44px touch targets) */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 active:scale-95 transition cursor-pointer touch-manipulation"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Audio"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-sky-400" />
            )}
          </button>

          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              setIsMobileMenuOpen((prev) => !prev);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 active:scale-95 transition cursor-pointer touch-manipulation shadow-sm"
            title="Desk Quick Tools"
            aria-label="Open Desk Quick Tools"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Quick Tools Drawer / Bottom Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in">
          <div
            className="bg-slate-900 border-t-2 border-amber-400/60 rounded-t-3xl p-4 shadow-2xl flex flex-col gap-3.5 max-h-[80dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle */}
            <div className="w-10 h-1.5 bg-slate-600 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-sm text-white">Desk Controls & Tools</h3>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Firebase User Card */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full ring-1 ring-emerald-400 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold shrink-0">
                      {(user.displayName || user.email || 'U')[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {user.displayName || 'Cozy Explorer'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Firebase Synced</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">Guest Mode</div>
                  <div className="text-[10px] text-slate-400 font-mono">Sign in to cloud sync desk</div>
                </div>
              )}
              {user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOutUser();
                  }}
                  className="px-2.5 py-1 text-xs text-rose-300 border border-rose-500/40 rounded-lg hover:bg-rose-500/20 transition shrink-0"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signInWithGoogle();
                  }}
                  className="px-3 py-1.5 text-xs text-sky-200 bg-sky-500/20 border border-sky-400/40 rounded-lg font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Lamp Lighting */}
              <button
                onClick={() => {
                  onCycleLighting();
                  playMechanicalClick('switch', 0.08);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-left active:scale-95 transition min-h-[48px]"
              >
                <Lightbulb
                  className={`w-5 h-5 shrink-0 ${
                    lampLighting !== 'off' ? 'text-amber-300 fill-amber-300/40' : 'text-slate-500'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-white">Desk Lamp</div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase">
                    {lampLighting}
                  </div>
                </div>
              </button>

              {/* Sky Atmosphere */}
              {onCycleSky && (
                <button
                  onClick={() => {
                    onCycleSky();
                    playMechanicalClick('toggle', 0.08);
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-left active:scale-95 transition min-h-[48px]"
                >
                  <Moon className="w-5 h-5 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Window Sky</div>
                    <div className="text-[10px] font-mono text-sky-300 uppercase truncate">
                      {skyMode}
                    </div>
                  </div>
                </button>
              )}

              {/* Corkboard Bulletin */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  playPinTackSound(0.09);
                  onOpenCorkboard();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-left active:scale-95 transition min-h-[48px]"
              >
                <Pin className="w-5 h-5 text-[#ff9e80] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Corkboard</div>
                  <div className="text-[10px] font-mono text-[#ff9e80]">
                    {corkNotesCount} Notes
                  </div>
                </div>
              </button>

              {/* Spotlight Tour / Help */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  playMechanicalClick('toggle', 0.08);
                  onOpenTour();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-left active:scale-95 transition min-h-[48px]"
              >
                <CircleHelp className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Tutorial Tour</div>
                  <div className="text-[10px] font-mono text-amber-300">Guided Help</div>
                </div>
              </button>

              {/* Expanded Board Studio */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  playPinTackSound(0.09);
                  onOpenExpandedStudio();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-left active:scale-95 transition min-h-[48px] col-span-2"
              >
                <Maximize2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-200">Expanded Corkboard Studio</div>
                  <div className="text-[10px] font-mono text-amber-300">Pannable 2800x2200 Board</div>
                </div>
              </button>
            </div>

            {/* Utility Rows */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800">
              {onResetLayout && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onResetLayout();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono text-sky-300 active:scale-98 transition min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    Reset Widget Layout
                  </span>
                  <span className="text-[10px] text-slate-500">Auto-align</span>
                </button>
              )}

              {onToggleZenMode && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleZenMode();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-mono text-amber-300 active:scale-98 transition min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    {isZenMode ? 'Exit Zen Mode' : 'Enter Zen Focus Mode'}
                  </span>
                  <span className="text-[10px] text-slate-500">Hide toolbars</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 bg-slate-800 text-slate-300 font-mono text-xs rounded-xl active:scale-98 transition min-h-[44px]"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

