import React from 'react';
import { X, CheckCircle2, Clock, Sparkles, Trophy, Award, Circle, Compass, RotateCcw, ArrowRight } from 'lucide-react';
import { Quest } from '../types';
import { StarterStepsState, STARTER_STEP_DEFINITIONS } from './onboarding/FirstStepsCard';
import { playMechanicalClick, playChime } from '../utils/audio';

const QUEST_WIDGET_MAP: Record<string, string> = {
  play_tictactoe: 'widget-tictactoe',
  pomo_focus: 'widget-pomodoro',
  lamp_toggle: 'widget-lamp',
  play_lofi: 'widget-boombox',
  water_succulent: 'widget-plant',
  feed_pet: 'widget-pet',
  sip_coffee: 'widget-coffee',
  pin_corkboard: 'widget-sticky-1',
};

const STARTER_WIDGET_MAP: Record<string, string> = {
  play_lofi: 'widget-boombox',
  drink_coffee: 'widget-coffee',
  tictactoe_move: 'widget-tictactoe',
  expanded_board_note: 'widget-sticky-1',
};

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  currentXp: number;
  maxXp: number;
  starterSteps?: StarterStepsState;
  isStarterCompleted?: boolean;
  onOpenTour?: () => void;
  onFocusWidget?: (widgetId: string) => void;
  onResetProgress?: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  quests,
  currentXp,
  maxXp,
  starterSteps,
  isStarterCompleted,
  onOpenTour,
  onFocusWidget,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  const doneCount = quests.filter((q) => q.done).length;
  const progressPct = Math.min(100, Math.round((currentXp / maxXp) * 100));

  const getRankInfo = () => {
    if (currentXp >= 150) {
      return { rank: 'LVL 3 • COZY ZEN MASTER', color: 'text-emerald-400 bg-emerald-400/20 border-emerald-400/40' };
    }
    if (currentXp >= 70) {
      return { rank: 'LVL 2 • DESK VIBE SPECIALIST', color: 'text-sky-300 bg-sky-400/20 border-sky-400/40' };
    }
    return { rank: 'LVL 1 • NEAT ROOKIE', color: 'text-amber-300 bg-amber-400/20 border-amber-400/40' };
  };

  const rank = getRankInfo();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-3.5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            playMechanicalClick('toggle', 0.08);
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xl font-bold font-pixel">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-1.5">
              <span>Cozy Desk Quests</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Complete daily tactile interactions to level up
            </p>
          </div>
        </div>

        {/* Level Rank Badge & Bar */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold font-pixel ${rank.color}`}>
              {rank.rank}
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              {currentXp} / {maxXp} XP
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Beginner's First Steps Checklist Section */}
        {starterSteps && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🌱</span>
                <span className="font-display font-bold text-xs text-amber-200">
                  Beginner's First Steps
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
                +50 Starter XP
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {STARTER_STEP_DEFINITIONS.map((item) => {
                const done = starterSteps[item.id];
                return (
                  <div
                    key={`modal-${item.id}`}
                    onClick={() => {
                      if (!done && onFocusWidget && STARTER_WIDGET_MAP[item.id]) {
                        playMechanicalClick('toggle', 0.08);
                        onClose();
                        onFocusWidget(STARTER_WIDGET_MAP[item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono border transition ${
                      done
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-amber-400/40 cursor-pointer'
                    }`}
                    title={done ? 'Completed!' : 'Click to jump to widget on desk'}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className={done ? 'line-through text-emerald-400/80' : ''}>
                        {item.label}
                      </span>
                    </div>
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 shrink-0">
                        <span>Locate</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quests List Header */}
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1">
          <span>Daily Desk Quests</span>
          <span className="text-[10px] text-slate-500 lowercase">click uncompleted quest to locate widget</span>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {quests.map((q) => (
            <div
              key={q.id}
              onClick={() => {
                if (!q.done && onFocusWidget && QUEST_WIDGET_MAP[q.id]) {
                  playMechanicalClick('toggle', 0.08);
                  onClose();
                  onFocusWidget(QUEST_WIDGET_MAP[q.id]);
                }
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                q.done
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/60 hover:border-amber-400/40 cursor-pointer'
              }`}
              title={q.done ? 'Quest Completed!' : 'Click to jump to widget on desk'}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl select-none">{q.icon}</span>
                <div>
                  <div
                    className={`text-xs font-display font-bold ${
                      q.done ? 'line-through text-emerald-400/80' : 'text-slate-100'
                    }`}
                  >
                    {q.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    +{q.xp} XP • {q.description}
                  </div>
                </div>
              </div>

              <div className="text-sm shrink-0">
                {q.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    <span>Go</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Quests Complete:
          </span>
          <span className="text-emerald-400 font-bold font-pixel text-sm">
            {doneCount} / {quests.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetProgress && (
            <button
              onClick={() => {
                playMechanicalClick('toggle', 0.08);
                onResetProgress();
              }}
              className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 font-mono text-xs rounded-xl border border-slate-800 transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              title="Reset today's quests and first steps to test fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {onOpenTour && (
            <button
              onClick={() => {
                playMechanicalClick('toggle', 0.08);
                onClose();
                onOpenTour();
              }}
              className="flex-1 py-2.5 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 font-mono text-xs rounded-xl border border-amber-400/40 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Replay Tour</span>
            </button>
          )}

          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs rounded-xl transition border border-slate-700 active:scale-95 cursor-pointer"
          >
            Back to Desk 🏡
          </button>
        </div>
      </div>
    </div>
  );
};
