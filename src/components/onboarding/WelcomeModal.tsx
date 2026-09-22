import React from 'react';
import { Sparkles, Compass, ArrowRight, X, Coffee, Radio, Pin, Gamepad2, CheckCircle2 } from 'lucide-react';
import { playMechanicalClick, playChime } from '../../utils/audio';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onExploreFreely?: () => void;
  onDismiss?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onExploreFreely,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onExploreFreely) onExploreFreely();
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="cozydesk-welcome-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-fade-in select-none"
    >
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-[0_0_50px_rgba(251,191,36,0.25)] flex flex-col gap-5 relative overflow-hidden text-slate-100">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => {
            playMechanicalClick('toggle', 0.08);
            handleClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition cursor-pointer"
          title="Close and Explore Freely"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Badges */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-[#ff9e80] text-slate-950 flex items-center justify-center font-pixel text-2xl shadow-lg shadow-amber-500/30 border border-amber-300">
            <span>☕</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                Bagong Dating?
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Interactive Desk & Corkboard
              </span>
            </div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-wide flex items-center gap-1.5 mt-0.5">
              <span>Welcome to CozyDesk Quest!</span>
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300/40 shrink-0" />
            </h2>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-amber-100/90 leading-relaxed font-sans bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl">
          Ang iyong personal interactive workspace, mini-games, at public bulletin corkboard.
        </p>

        {/* Quick feature overview pills */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
            <Radio className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Lo-Fi Beat Radio</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
            <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Pixel Mini-Games</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
            <Pin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Infinite Corkboard</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
            <Coffee className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">Daily Quests & XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            onClick={() => {
              playChime(587.33, 'triangle', 0.15, 0.1);
              onStartTour();
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-extrabold text-sm rounded-xl shadow-lg shadow-amber-400/25 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
          >
            <Compass className="w-4 h-4" />
            <span>Start Quick Tour (1 min)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              handleClose();
            }}
            className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-mono text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            Explore Freely
          </button>
        </div>
      </div>
    </div>
  );
};
