import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Volume2, Disc3, Sparkles } from 'lucide-react';
import {
  startLoFi,
  stopLoFi,
  playCassetteClick,
  playMechanicalClick,
  playSoftHum,
  setLoFiVolume,
  getLoFiVolume,
  setLoFiBeatEnabled,
  getLoFiBeatEnabled,
} from '../../utils/audio';

interface LoFiRadioWidgetProps {
  onPlayQuest: () => void;
}

const TRACKS = [
  { key: 'tokyo', name: 'TOKYO RAIN', bpm: '74 BPM', tag: 'Neo-Soul', color: 'text-rose-300' },
  { key: 'study', name: 'COZY STUDY', bpm: '80 BPM', tag: 'ChillHop', color: 'text-amber-300' },
  { key: 'midnight', name: '3 AM SLEEPY', bpm: '68 BPM', tag: 'Late Night', color: 'text-indigo-300' },
  { key: 'cafe', name: 'RAINY CAFE', bpm: '84 BPM', tag: 'Bossa Jazz', color: 'text-emerald-300' },
  { key: 'nostalgia', name: 'CASSETTE', bpm: '76 BPM', tag: 'Tape Wobble', color: 'text-amber-400' },
  { key: 'stargaze', name: 'STARGAZING', bpm: '64 BPM', tag: 'Celestial', color: 'text-sky-300' },
];

export const LoFiRadioWidget: React.FC<LoFiRadioWidgetProps> = ({ onPlayQuest }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [drumsEnabled, setDrumsEnabled] = useState(() => getLoFiBeatEnabled());
  const [volume, setVolume] = useState(() => Math.max(0.14, getLoFiVolume()));

  const currentTrack = TRACKS[trackIndex];

  useEffect(() => {
    setLoFiVolume(volume);
    return () => {
      stopLoFi();
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setLoFiVolume(val);
  };

  const handleToggleBeat = () => {
    playMechanicalClick('key', 0.05);
    const nextVal = !drumsEnabled;
    setDrumsEnabled(nextVal);
    setLoFiBeatEnabled(nextVal);
  };

  const handleTogglePlay = () => {
    playCassetteClick();
    if (!isPlaying) {
      setIsPlaying(true);
      setLoFiVolume(volume);
      startLoFi(currentTrack.key, () => {
        setPulse((p) => !p);
      }, volume);
      onPlayQuest();
    } else {
      setIsPlaying(false);
      stopLoFi();
    }
  };

  const handleSelectTrack = (idx: number) => {
    if (idx === trackIndex) return;
    playMechanicalClick('key', 0.08);
    playSoftHum('cassette', 0.18, 0.03);
    setTrackIndex(idx);

    if (isPlaying) {
      startLoFi(TRACKS[idx].key, () => {
        setPulse((p) => !p);
      }, volume);
    }
  };

  const handleSkip = (dir: number) => {
    playMechanicalClick('key', 0.08);
    playSoftHum('cassette', 0.2, 0.03);
    const nextIdx = (trackIndex + dir + TRACKS.length) % TRACKS.length;
    handleSelectTrack(nextIdx);
  };

  const volumePercent = Math.round((volume / 0.28) * 100);

  return (
    <div className="w-64 bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 backdrop-blur-md select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold text-sky-300">LO-FI SYNTH 88.4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-sky-300 font-bold">{volumePercent}%</span>
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Cassette Tape Visualizer */}
      <div className="h-16 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between px-3 relative overflow-hidden">
        {/* Left Spool */}
        <div
          className={`w-8 h-8 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center text-[10px] text-amber-300 font-mono transition-transform ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: `${2.8}s` }}
        >
          ◎
        </div>

        {/* Center Track Info */}
        <div className="flex flex-col items-center max-w-[130px] text-center">
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-mono font-bold tracking-wider truncate ${currentTrack.color}`}>
              {currentTrack.name}
            </span>
          </div>
          <span
            className={`text-[9px] font-pixel tracking-wider ${
              isPlaying
                ? pulse
                  ? 'text-emerald-300 scale-105 transition-transform'
                  : 'text-sky-300'
                : 'text-slate-500'
            }`}
          >
            {isPlaying ? '♫ PLAYING ♫' : '-- PAUSED --'}
          </span>
          <div className="flex items-center gap-1 text-[8px] font-mono text-slate-400">
            <span>{currentTrack.bpm}</span>
            <span>•</span>
            <span className="text-sky-400 font-semibold">{currentTrack.tag}</span>
          </div>
        </div>

        {/* Right Spool */}
        <div
          className={`w-8 h-8 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center text-[10px] text-amber-300 font-mono transition-transform ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: `${2.8}s` }}
        >
          ◎
        </div>
      </div>

      {/* Track Quick Tabs */}
      <div className="grid grid-cols-3 gap-1">
        {TRACKS.map((t, idx) => {
          const isCurrent = idx === trackIndex;
          return (
            <button
              key={t.key}
              onClick={() => handleSelectTrack(idx)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono truncate transition cursor-pointer text-center border ${
                isCurrent
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/60 font-bold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title={`${t.name} (${t.tag}, ${t.bpm})`}
            >
              {t.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Volume Slider & Drums Toggle */}
      <div className="flex items-center justify-between gap-2 px-2 py-1 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 flex-1">
          <Volume2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <input
            type="range"
            min="0.04"
            max="0.28"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            title={`Lo-Fi Synth Volume: ${volumePercent}%`}
          />
        </div>

        {/* Beat Toggle */}
        <button
          onClick={handleToggleBeat}
          className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono border transition flex items-center gap-1 cursor-pointer ${
            drumsEnabled
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
          title={drumsEnabled ? 'Drums are ON (Click to hear ambient chords only)' : 'Drums are OFF (Click to enable Lo-Fi beat)'}
        >
          <Disc3 className={`w-3 h-3 ${drumsEnabled ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '4s' }} />
          <span>{drumsEnabled ? 'BEAT' : 'CHILL'}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-1.5 pt-0.5">
        <button
          onClick={() => handleSkip(-1)}
          className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono active:scale-95 transition cursor-pointer"
          title="Previous Track"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleTogglePlay}
          className={`flex-1 py-1.5 rounded-lg font-display font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
            isPlaying
              ? 'bg-[#ff9e80] hover:bg-amber-400 text-slate-950'
              : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause' : 'Play Lo-Fi'}</span>
        </button>

        <button
          onClick={() => handleSkip(1)}
          className="p-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono active:scale-95 transition cursor-pointer"
          title="Next Track"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
