import React, { useState, useEffect, useRef } from 'react';
import { LampLighting } from '../../types';
import { playLampFlickerSound } from '../../utils/audio';
import { Power, Sparkles, Sun, Flame, Zap, Moon } from 'lucide-react';

interface DeskLampWidgetProps {
  lighting: LampLighting;
  onCycleLighting: () => void;
  onSetLighting?: (light: LampLighting) => void;
  onLampQuest: () => void;
}

export const DeskLampWidget: React.FC<DeskLampWidgetProps> = ({
  lighting,
  onCycleLighting,
  onSetLighting,
  onLampQuest,
}) => {
  const isLampOn = lighting !== 'off';
  const [flickerClass, setFlickerClass] = useState<'animate-retro-flicker-on' | 'animate-retro-flicker-off' | ''>('');
  const [isFlickering, setIsFlickering] = useState(false);
  const prevLightingRef = useRef<LampLighting>(lighting);

  useEffect(() => {
    if (prevLightingRef.current !== lighting) {
      const isTurningOff = lighting === 'off';
      const anim = isTurningOff ? 'animate-retro-flicker-off' : 'animate-retro-flicker-on';
      setFlickerClass(anim);
      setIsFlickering(true);
      playLampFlickerSound(!isTurningOff);

      const duration = isTurningOff ? 480 : 680;
      const timer = setTimeout(() => {
        setFlickerClass('');
        setIsFlickering(false);
      }, duration);

      prevLightingRef.current = lighting;
      return () => clearTimeout(timer);
    }
  }, [lighting]);

  const handleTogglePower = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLampOn) {
      if (onSetLighting) {
        onSetLighting('off');
      } else {
        onCycleLighting();
      }
    } else {
      if (onSetLighting) {
        onSetLighting('warm');
      } else {
        onCycleLighting();
      }
    }
    onLampQuest();
  };

  const handleSelectMode = (e: React.MouseEvent, mode: LampLighting) => {
    e.stopPropagation();
    if (onSetLighting) {
      onSetLighting(mode);
    } else {
      onCycleLighting();
    }
    onLampQuest();
  };

  const handleTriggerManualFlicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlickerClass('animate-retro-flicker-on');
    setIsFlickering(true);
    playLampFlickerSound(true);
    setTimeout(() => {
      setFlickerClass('');
      setIsFlickering(false);
    }, 680);
  };

  const getLampHeadClasses = () => {
    switch (lighting) {
      case 'warm':
        return 'from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_45px_rgba(251,191,36,0.85)] border-amber-300 text-amber-950 ring-4 ring-amber-400/50';
      case 'ember':
        return 'from-orange-400 via-amber-600 to-orange-700 shadow-[0_0_45px_rgba(249,115,22,0.85)] border-orange-400 text-orange-950 ring-4 ring-orange-500/50';
      case 'neon':
        return 'from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_45px_rgba(56,189,248,0.85)] border-cyan-300 text-cyan-950 ring-4 ring-cyan-400/50';
      case 'lavender':
        return 'from-purple-300 via-violet-400 to-indigo-500 shadow-[0_0_45px_rgba(168,85,247,0.75)] border-purple-300 text-purple-950 ring-4 ring-purple-400/50';
      case 'off':
      default:
        return 'from-slate-700 via-slate-800 to-slate-900 border-slate-700 text-slate-500 opacity-60';
    }
  };

  const getBeamGradient = () => {
    switch (lighting) {
      case 'warm':
        return 'from-amber-300/45 via-amber-400/20 to-transparent';
      case 'ember':
        return 'from-orange-400/50 via-amber-500/20 to-transparent';
      case 'neon':
        return 'from-cyan-400/45 via-sky-400/20 to-transparent';
      case 'lavender':
        return 'from-purple-400/45 via-violet-400/20 to-transparent';
      default:
        return null;
    }
  };

  const getLightLabel = () => {
    switch (lighting) {
      case 'warm':
        return 'Golden Warm (2700K)';
      case 'ember':
        return 'Candle Ember 🔥';
      case 'neon':
        return 'Cyber Neon ⚡';
      case 'lavender':
        return 'Lavender Dream 💜';
      case 'off':
        return 'Lamp Turned Off 🌙';
    }
  };

  const beamGrad = getBeamGradient();

  return (
    <div className="relative flex flex-col items-center select-none group w-52 p-2 bg-slate-900/85 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-2xl">
      {/* Drag Handle Top Bar */}
      <div className="w-full flex items-center justify-between pb-1 px-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 font-bold text-amber-300">
          <Sparkles className="w-3 h-3" />
          <span>DESK LAMP</span>
        </span>
        <div className="flex items-center gap-1.5">
          {isFlickering && (
            <span className="text-[8px] font-mono font-bold text-amber-300 animate-pulse bg-amber-500/20 px-1 py-0.5 rounded border border-amber-400/40">
              ⚡ FLICKERING
            </span>
          )}
          <span className="text-[9px] text-slate-500 cursor-grab">⋮⋮ Drag</span>
        </div>
      </div>

      {/* Lamp Physical Apparatus */}
      <div className="relative flex flex-col items-center mt-2">
        {/* Realistic Light Beam projecting down with synchronized retro flicker */}
        {isLampOn && beamGrad && (
          <div
            className={`absolute top-10 w-44 h-36 bg-gradient-to-b ${beamGrad} pointer-events-none rounded-b-full filter blur-md -z-0 ${flickerClass}`}
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}
          />
        )}

        {/* Lamp Shade / Head Button with Retro Incandescent Startup Flicker */}
        <button
          type="button"
          onClick={handleTogglePower}
          className={`w-20 h-16 bg-gradient-to-b ${getLampHeadClasses()} border-2 rounded-t-full shadow-2xl flex flex-col items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer relative z-10 ${flickerClass}`}
          title="Click to turn lamp ON / OFF (Retro Bulb Startup Flicker)"
        >
          {/* Visible Glowing Retro Tungsten Filament Inside Bulb */}
          <div className="relative flex items-center justify-center">
            <svg
              className={`w-8 h-8 transition-colors duration-200 ${
                isLampOn ? 'text-slate-950' : 'text-slate-400'
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Bulb outline */}
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
              {/* Retro coiled filament wire */}
              {isLampOn && (
                <path
                  d="M9 9a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1 3 0"
                  className="stroke-amber-100 fill-none filter drop-shadow-[0_0_3px_#fff]"
                  strokeWidth="2.2"
                />
              )}
            </svg>

            {/* Micro Filament Glow Center */}
            {isLampOn && (
              <span className="absolute w-2 h-2 rounded-full bg-white filter blur-[1px] animate-ping opacity-75" />
            )}
          </div>

          <span className="text-[8px] font-mono font-extrabold uppercase tracking-wider mt-0.5">
            {isLampOn ? 'ON' : 'OFF'}
          </span>

          {/* Under-lip light diffuser */}
          {isLampOn && (
            <span className="absolute -bottom-1 inset-x-2 h-1.5 bg-white/95 rounded-full filter blur-[1px]" />
          )}
        </button>

        {/* Lamp Neck (Sturdy Brass / Steel Gooseneck) */}
        <div className="w-4 h-10 bg-slate-700 border-x-2 border-slate-900 relative z-0 flex items-center justify-center">
          <div className="w-1.5 h-7 bg-slate-500 rounded-full" />
        </div>

        {/* Lamp Heavy Weighted Base */}
        <div className="w-28 h-7 bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600 rounded-full shadow-lg flex items-center justify-between px-3 z-10">
          <span className="text-[8px] font-mono text-slate-300 font-bold flex items-center gap-1">
            <Power className="w-2.5 h-2.5 text-amber-300" />
            POWER
          </span>
          {/* Tactile Rocker Switch */}
          <button
            type="button"
            onClick={handleTogglePower}
            className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer shadow-inner border border-slate-900 ${
              isLampOn ? 'bg-amber-400 justify-end' : 'bg-slate-950 justify-start'
            }`}
            title="Toggle Retro Lamp Power"
          >
            <span
              className={`w-3 h-3 rounded-full bg-slate-900 shadow-md transform transition-transform ${
                isFlickering ? 'animate-ping' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Active Light Status Label with Flicker Re-trigger Action */}
      <div className="mt-2 text-center flex items-center justify-center gap-1.5">
        <span className="text-[10px] font-mono text-amber-200 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 shadow-inner">
          {getLightLabel()}
        </span>
        {isLampOn && (
          <button
            type="button"
            onClick={handleTriggerManualFlicker}
            className="text-[9px] font-mono text-amber-300/80 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition cursor-pointer active:scale-95"
            title="Simulate retro filament warm-up flicker again"
          >
            ⚡ Flicker
          </button>
        )}
      </div>

      {/* Quick Color Mode Picker Buttons */}
      <div className="grid grid-cols-5 gap-1 mt-2 w-full pt-1.5 border-t border-slate-800/80">
        <button
          type="button"
          onClick={(e) => handleSelectMode(e, 'warm')}
          className={`py-1 rounded text-center text-xs transition active:scale-95 flex flex-col items-center cursor-pointer ${
            lighting === 'warm'
              ? 'bg-amber-400 text-slate-950 font-bold ring-2 ring-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
          }`}
          title="Golden Warm Lighting"
        >
          <Sun className="w-3 h-3" />
          <span className="text-[8px] font-mono">Warm</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleSelectMode(e, 'ember')}
          className={`py-1 rounded text-center text-xs transition active:scale-95 flex flex-col items-center cursor-pointer ${
            lighting === 'ember'
              ? 'bg-orange-500 text-slate-950 font-bold ring-2 ring-orange-300'
              : 'bg-slate-800 hover:bg-slate-700 text-orange-400'
          }`}
          title="Candle Ember Lighting"
        >
          <Flame className="w-3 h-3" />
          <span className="text-[8px] font-mono">Ember</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleSelectMode(e, 'neon')}
          className={`py-1 rounded text-center text-xs transition active:scale-95 flex flex-col items-center cursor-pointer ${
            lighting === 'neon'
              ? 'bg-cyan-400 text-slate-950 font-bold ring-2 ring-cyan-300'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
          }`}
          title="Cyber Neon Lighting"
        >
          <Zap className="w-3 h-3" />
          <span className="text-[8px] font-mono">Neon</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleSelectMode(e, 'lavender')}
          className={`py-1 rounded text-center text-xs transition active:scale-95 flex flex-col items-center cursor-pointer ${
            lighting === 'lavender'
              ? 'bg-purple-400 text-slate-950 font-bold ring-2 ring-purple-300'
              : 'bg-slate-800 hover:bg-slate-700 text-purple-300'
          }`}
          title="Lavender Dream Lighting"
        >
          <Sparkles className="w-3 h-3" />
          <span className="text-[8px] font-mono">Dream</span>
        </button>

        <button
          type="button"
          onClick={(e) => handleSelectMode(e, 'off')}
          className={`py-1 rounded text-center text-xs transition active:scale-95 flex flex-col items-center cursor-pointer ${
            lighting === 'off'
              ? 'bg-slate-700 text-white font-bold ring-2 ring-slate-500'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
          }`}
          title="Turn Lamp Off"
        >
          <Moon className="w-3 h-3" />
          <span className="text-[8px] font-mono">Off</span>
        </button>
      </div>
    </div>
  );
};
