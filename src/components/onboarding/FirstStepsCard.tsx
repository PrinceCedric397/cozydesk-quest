import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Award,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMechanicalClick, playChime, playWinFanfare } from '../../utils/audio';

export interface StarterStepsState {
  play_lofi: boolean;
  drink_coffee: boolean;
  tictactoe_move: boolean;
  expanded_board_note: boolean;
}

interface FirstStepsCardProps {
  steps: StarterStepsState;
  isCompleted: boolean;
  onOpenExpandedStudio: () => void;
  onStepClick?: (id: keyof StarterStepsState) => void;
}

export const STARTER_STEP_DEFINITIONS = [
  {
    id: 'play_lofi' as keyof StarterStepsState,
    label: 'Play Lo-Fi audio',
    icon: '🎧',
    desc: 'Turn on cassette radio beats',
  },
  {
    id: 'drink_coffee' as keyof StarterStepsState,
    label: 'Drink a sip of warm coffee',
    icon: '☕',
    desc: 'Take a soothing sip from the mug',
  },
  {
    id: 'tictactoe_move' as keyof StarterStepsState,
    label: 'Make 1 move in Tic-Tac-Toe',
    icon: '🕹️',
    desc: 'Tap any cell in the mini-game',
  },
  {
    id: 'expanded_board_note' as keyof StarterStepsState,
    label: 'Open Expanded Board & drop a sticky note',
    icon: '📌',
    desc: 'Press F or click Expanded Board',
  },
];

export const FirstStepsCard: React.FC<FirstStepsCardProps> = ({
  steps,
  isCompleted,
  onOpenExpandedStudio,
  onStepClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('cozydesk_first_steps_collapsed');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.innerWidth < 768;
    } catch {
      return false;
    }
  });

  const completedCount = Object.values(steps).filter(Boolean).length;
  const totalSteps = STARTER_STEP_DEFINITIONS.length;
  const pct = Math.round((completedCount / totalSteps) * 100);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cozydesk_first_steps_collapsed', String(next));
      } catch {}
      playMechanicalClick('toggle', 0.06);
      return next;
    });
  };

  return (
    <div
      id="tour-first-steps-card"
      className="fixed bottom-24 md:bottom-14 right-3 sm:right-6 z-35 max-w-[280px] sm:max-w-xs select-none transition-all duration-300 pointer-events-auto"
    >
      {isCollapsed ? (
        /* Minimized floating pill */
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-amber-400/50 text-amber-300 font-mono text-xs shadow-2xl backdrop-blur-md active:scale-95 transition cursor-pointer"
          title="Expand Beginner's First Steps Checklist"
        >
          <span className="text-sm">🌱</span>
          <span className="font-bold font-display text-[11px] sm:text-xs">First Steps</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              isCompleted
                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/40'
                : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
            }`}
          >
            {completedCount}/{totalSteps}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        /* Expanded tactile card */
        <div className="bg-slate-900/95 border-2 border-amber-400/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 text-slate-100 ring-1 ring-amber-400/30">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xs">
                🌱
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>First Steps</span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/30">
                    +50 XP
                  </span>
                </h4>
              </div>
            </div>

            <button
              onClick={toggleCollapse}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Minimize Checklist"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400">
                {isCompleted ? '🎉 All steps completed!' : `${completedCount} of ${totalSteps} finished`}
              </span>
              <span className="font-bold text-emerald-400">{pct}%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="flex flex-col gap-1.5 pt-0.5">
            {STARTER_STEP_DEFINITIONS.map((item) => {
              const done = steps[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playMechanicalClick('toggle', 0.06);
                    if (item.id === 'expanded_board_note') {
                      onOpenExpandedStudio();
                    } else if (onStepClick) {
                      onStepClick(item.id);
                    }
                  }}
                  className={`flex items-center justify-between p-1.5 px-2 rounded-xl text-xs font-mono transition border cursor-pointer ${
                    done
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-amber-400/40'
                  }`}
                  title={done ? 'Completed! Click to locate on desk' : 'Click to locate widget on desk'}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span
                      className={`truncate text-[11px] ${
                        done ? 'line-through text-emerald-400/80' : 'text-slate-200'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div className="shrink-0 ml-1.5">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950/80" />
                    ) : item.id === 'expanded_board_note' ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Celebration or Hint message */}
          {isCompleted ? (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2 text-center text-[10px] font-mono text-emerald-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Galing! Natapos mo ang starter checklist (+50 XP)!</span>
            </div>
          ) : (
            <div className="text-[10px] font-mono text-slate-400 text-center">
              Matapos ang 4 para sa <span className="text-amber-300 font-bold">+50 XP bonus</span>!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
