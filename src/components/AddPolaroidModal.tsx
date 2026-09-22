import React, { useState } from 'react';
import { X, Camera, Sparkles, Check, Heart, Pin } from 'lucide-react';
import {
  CURATED_POLAROID_PRESETS,
  WASHI_TAPE_OPTIONS,
  CuratedPolaroidPreset,
} from '../data/curatedPolaroids';
import { CorkboardNote } from '../types';
import {
  playCameraShutterSound,
  playPinTackSound,
  playPaperRustleSound,
  playMechanicalClick,
  playWinFanfare,
} from '../utils/audio';

interface AddPolaroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPolaroid: (note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => void;
  defaultCoordinates?: { x: number; y: number } | null;
}

export const AddPolaroidModal: React.FC<AddPolaroidModalProps> = ({
  isOpen,
  onClose,
  onAddPolaroid,
  defaultCoordinates,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<CuratedPolaroidPreset>(
    CURATED_POLAROID_PRESETS[0]
  );
  const [selectedWashi, setSelectedWashi] = useState<string>(
    CURATED_POLAROID_PRESETS[0].defaultWashi
  );
  const [customTitle, setCustomTitle] = useState<string>(CURATED_POLAROID_PRESETS[0].title);
  const [customCaption, setCustomCaption] = useState<string>(CURATED_POLAROID_PRESETS[0].desc);
  const [customDate, setCustomDate] = useState<string>(CURATED_POLAROID_PRESETS[0].date);
  const [photographer, setPhotographer] = useState<string>('Cozy Wanderer');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CuratedPolaroidPreset) => {
    setSelectedPreset(preset);
    setCustomTitle(preset.title);
    setCustomCaption(preset.desc);
    setCustomDate(preset.date);
    setSelectedWashi(preset.defaultWashi);
    playPaperRustleSound('lift', 0.07);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCaption.trim() || !customTitle.trim()) return;

    playCameraShutterSound(0.09);
    setTimeout(() => playPinTackSound(0.1), 120);
    setTimeout(() => playWinFanfare(), 220);

    onAddPolaroid({
      name: photographer.trim() || 'Cozy Wanderer',
      message: customCaption.trim(),
      color: '#fdfbf7', // Classic warm polaroid photo paper
      fontClass: 'font-hand',
      emoji: selectedPreset.icon,
      isPolaroid: true,
      polaroidTitle: customTitle.trim(),
      polaroidPhoto: selectedPreset.icon,
      polaroidGradient: selectedPreset.gradient,
      polaroidDate: customDate.trim() || 'TODAY',
      washiTapeColor: selectedWashi,
      category: 'polaroid',
      x: defaultCoordinates?.x,
      y: defaultCoordinates?.y,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-xl shadow-inner">
              📸
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Curated Polaroid Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Washi Tape Edition
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Select a cozy scene, choose your washi tape accent, and pin a lasting memory
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2 columns (Left: Presets & Customizer, Right: Live Tactile Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0c0e17]">
          {/* Left Column: Preset Gallery & Customizer Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* 1. Curated Scenes Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Choose Curated Scene</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {CURATED_POLAROID_PRESETS.length} cozy scenes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CURATED_POLAROID_PRESETS.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2 rounded-xl text-left border transition-all flex flex-col items-center justify-between text-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-2xl mt-0.5">{p.icon}</div>
                      <span className="text-[11px] font-display font-bold text-white truncate w-full">
                        {p.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Washi Tape Accents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Select Washi Tape Accent</span>
                </label>
                <span className="text-[10px] font-mono text-slate-400">Tactile tape strip</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {WASHI_TAPE_OPTIONS.map((w) => {
                  const isSelected = selectedWashi === w.color;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWashi(w.color);
                        playPaperRustleSound('drop', 0.05);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-left ${
                        isSelected
                          ? 'bg-slate-800 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: w.color }}
                        className="w-5 h-3.5 rounded-sm washi-tape border border-black/20 shrink-0"
                      />
                      <span className="text-[11px] font-mono text-slate-200 truncate">{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Text & Details Form */}
            <form onSubmit={handleSubmit} id="polaroid-form" className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">
                    Scene Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={28}
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-display font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">
                    Date / Season Stamp
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">
                  Handwritten Caption / Memory
                </label>
                <textarea
                  required
                  maxLength={120}
                  rows={2}
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="A quiet thought or sweet memory from your cozy desk..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-hand text-lg leading-snug"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">
                  Photographer / Signature
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </form>
          </div>

          {/* Right Column: Live Tactile Polaroid Preview on Cork Surface (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between cork-texture p-6 rounded-2xl border-2 border-amber-950/60 shadow-2xl relative overflow-hidden min-h-[380px]">
            <div className="w-full flex items-center justify-between mb-4 z-10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-100 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">
                Tactile Preview
              </span>
              <span className="text-[10px] font-mono text-amber-200/80">Pushpin + Washi Tape</span>
            </div>

            {/* The Polaroid Card */}
            <div className="w-full max-w-[270px] bg-[#fdfbf7] p-3.5 pb-4 rounded-sm shadow-2xl text-slate-900 relative transform -rotate-1 transition-all hover:rotate-0 hover:scale-105 duration-200">
              {/* Washi Tape Strip at top */}
              <div
                style={{ backgroundColor: selectedWashi }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-2 z-20"
              />

              {/* Pushpin at top left */}
              <div className="absolute -top-2 left-3 z-30">
                <div className="pushpin-head bg-red-600 shadow-md" />
              </div>

              {/* Photo Area with Gradient and Scene Art */}
              <div
                className={`w-full h-40 rounded-sm bg-gradient-to-br ${selectedPreset.gradient} p-3 flex flex-col justify-between text-white relative overflow-hidden shadow-inner border border-black/10`}
              >
                {/* Visual grain & glare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                <div className="text-3xl filter drop-shadow">{selectedPreset.icon}</div>

                <div className="relative z-10">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-200 font-bold">
                    {customDate || 'OCT 2026'}
                  </div>
                  <div className="text-sm font-display font-bold leading-tight drop-shadow">
                    {customTitle || 'Cozy Memory'}
                  </div>
                </div>
              </div>

              {/* Handwritten Caption */}
              <div className="mt-3 px-1 min-h-[48px] flex flex-col justify-between">
                <p className="font-hand text-xl text-slate-900 leading-tight">
                  "{customCaption || 'A quiet evening at the desk...'}"
                </p>
                <div className="text-right text-[10px] font-mono text-slate-400 mt-1">
                  — {photographer || 'Cozy Desk'}
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="w-full mt-6 z-10">
              <button
                type="submit"
                form="polaroid-form"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ff9e80] via-amber-400 to-[#ff9e80] hover:brightness-110 text-slate-950 font-display font-bold text-sm rounded-xl transition active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
              >
                <Camera className="w-4 h-4 fill-slate-950" />
                <span>Pin Polaroid to Board 📸</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
