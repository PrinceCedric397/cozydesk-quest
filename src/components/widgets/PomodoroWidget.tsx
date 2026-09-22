import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles } from 'lucide-react';
import { PomodoroMode } from '../../types';
import { playMechanicalClick, playChime } from '../../utils/audio';

interface PomodoroWidgetProps {
  onSprintComplete: () => void;
}

const PRESET_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ onSprintComplete }) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(PRESET_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed session
      setIsRunning(false);
      playChime(880, 'triangle', 0.4, 0.15);
      setTimeout(() => playChime(1046.5, 'triangle', 0.5, 0.15), 250);

      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        onSprintComplete();
        // Switch to short break
        setMode('shortBreak');
        setTimeLeft(PRESET_DURATIONS.shortBreak);
      } else {
        setMode('work');
        setTimeLeft(PRESET_DURATIONS.work);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, onSprintComplete]);

  const toggleTimer = () => {
    playMechanicalClick('switch', 0.09);
    if (!isRunning) {
      playChime(660, 'sine', 0.08);
      onSprintComplete(); // trigger starting quest if needed
    } else {
      playChime(440, 'sine', 0.06);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(PRESET_DURATIONS[mode]);
    playMechanicalClick('toggle', 0.08);
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(PRESET_DURATIONS[newMode]);
    playMechanicalClick('key', 0.08);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalTime = PRESET_DURATIONS[mode];
  const progressPct = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="w-52 bg-slate-900/95 border-2 border-amber-300 rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-2 backdrop-blur-md">
      {/* Titlebar */}
      <div className="w-full flex justify-between items-center pb-1 border-b border-slate-800">
        <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FOCUS CLOCK</span>
        </span>
        <span
          className={`text-[9px] font-pixel px-1.5 py-0.5 rounded font-bold ${
            mode === 'work'
              ? 'bg-amber-300/20 text-amber-300'
              : 'bg-emerald-400/20 text-emerald-400'
          }`}
        >
          {mode === 'work' ? 'FOCUS' : 'REST'}
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex w-full bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
        <button
          onClick={() => switchMode('work')}
          className={`flex-1 py-1 rounded transition ${
            mode === 'work'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          25m
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-1 rounded transition ${
            mode === 'shortBreak'
              ? 'bg-emerald-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          5m
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-1 rounded transition ${
            mode === 'longBreak'
              ? 'bg-sky-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          15m
        </button>
      </div>

      {/* Timer Display & Circular Glow */}
      <div className="relative flex flex-col items-center justify-center my-0.5 w-full py-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
        <div className="text-3xl font-pixel font-bold text-emerald-300 tracking-widest">
          {formatTime(timeLeft)}
        </div>
        {/* Progress Mini Bar */}
        <div className="w-3/4 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 w-full">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-1.5 rounded-lg text-xs font-display font-bold active:scale-95 shadow-md transition flex items-center justify-center gap-1.5 ${
            isRunning
              ? 'bg-[#ff9e80] hover:bg-amber-400 text-slate-950'
              : 'bg-amber-300 hover:bg-amber-200 text-slate-950'
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono active:scale-95 border border-slate-700"
          title="Reset Timer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        <button
          onClick={() => switchMode(mode === 'work' ? 'shortBreak' : 'work')}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-[#ff9e80] rounded-lg text-xs active:scale-95 border border-slate-700"
          title="Toggle Focus / Break"
        >
          <Coffee className="w-3 h-3" />
        </button>
      </div>

      {/* Sessions completed tally */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/80">
        <span>Completed sprints:</span>
        <span className="text-amber-300 font-bold">{sessionsCompleted} 🔥</span>
      </div>
    </div>
  );
};
