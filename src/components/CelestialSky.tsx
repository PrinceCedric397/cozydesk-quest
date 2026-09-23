import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Moon,
  CloudRain,
  SunMedium,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { SkyMode } from '../types';
import { playChime, playMechanicalClick, playHoverSound } from '../utils/audio';

interface CelestialSkyProps {
  mode: SkyMode;
  onCycleMode: () => void;
  onSelectMode?: (mode: SkyMode) => void;
  isRainActive?: boolean;
  onToggleRain?: () => void;
  className?: string;
}

const SKY_MODES: Array<{
  id: SkyMode;
  title: string;
  shortLabel: string;
  time: string;
  description: string;
}> = [
  {
    id: 'midnight',
    title: 'MIDNIGHT SKY',
    shortLabel: 'STARRY',
    time: '02:45 AM',
    description: 'Crisp midnight air, glowing moon & shooting meteors',
  },
  {
    id: 'twilight',
    title: 'TWILIGHT DUSK',
    shortLabel: 'DUSK',
    time: '08:30 PM',
    description: 'Amber-violet twilight sunset & emerging evening stars',
  },
  {
    id: 'aurora',
    title: 'AURORA BOREALIS',
    shortLabel: 'AURORA',
    time: '03:15 AM',
    description: 'Ethereal emerald ribbons wavering in the arctic stratosphere',
  },
  {
    id: 'rainy',
    title: 'RAINY NIGHT',
    shortLabel: 'RAIN',
    time: '01:20 AM',
    description: 'Gentle raindrops beating on cedar sill with distant mist',
  },
];

export const CelestialSky: React.FC<CelestialSkyProps> = ({
  mode,
  onCycleMode,
  onSelectMode,
  isRainActive = false,
  onToggleRain,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Canvas visual rendering engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display crispness
    const updateSize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth && parent.clientWidth > 50 ? parent.clientWidth : 288;
      const h = parent?.clientHeight && parent.clientHeight > 50 ? parent.clientHeight : 140;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 22 : 46;
    const raindropCount = isMobile ? 24 : 45;

    // Stars
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * (canvas.width / (window.devicePixelRatio || 1) || 288),
      y: Math.random() * ((canvas.height / (window.devicePixelRatio || 1) || 140) * 0.72),
      radius: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // Meteors (shooting stars)
    const meteors: Array<{
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
    }> = [];

    // Raindrops
    const raindrops = Array.from({ length: raindropCount }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 160,
      len: Math.random() * 8 + 6,
      speed: Math.random() * 4 + 4,
    }));

    // Splashes hitting sill / rooftops
    const splashes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    let waveOffset = 0;

    const render = () => {
      const renderW = canvas.width / (window.devicePixelRatio || 1) || 288;
      const renderH = canvas.height / (window.devicePixelRatio || 1) || 140;

      ctx.clearRect(0, 0, renderW, renderH);

      if (mode === 'rainy') {
        // Draw falling raindrops
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
        ctx.lineWidth = 1.2;

        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 1, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 0.6; // slight diagonal wind

          if (drop.y > renderH - 8) {
            // Spawn tiny water droplet splash
            if (Math.random() > 0.65 && splashes.length < 16) {
              splashes.push({
                x: drop.x,
                y: renderH - 4,
                vx: (Math.random() - 0.5) * 1.8,
                vy: -(Math.random() * 1.5 + 0.8),
                alpha: 0.8,
              });
            }
            drop.y = -drop.len;
            drop.x = Math.random() * (renderW + 40);
          }
        });

        // Render water droplet splashes
        ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.arc(s.x, s.y, 0.8, 0, Math.PI * 2);
          ctx.fill();

          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.15; // gravity
          s.alpha -= 0.05;
          if (s.alpha <= 0) {
            splashes.splice(i, 1);
          }
        }
      } else {
        // Aurora flowing wave ribbons
        if (mode === 'aurora') {
          waveOffset += 0.012;
          ctx.save();
          // Aurora Emerald Wave 1
          const grad1 = ctx.createLinearGradient(0, 0, renderW, 0);
          grad1.addColorStop(0, 'rgba(52, 211, 153, 0)');
          grad1.addColorStop(0.3, 'rgba(52, 211, 153, 0.25)');
          grad1.addColorStop(0.6, 'rgba(45, 212, 191, 0.35)');
          grad1.addColorStop(1, 'rgba(129, 140, 248, 0)');

          ctx.fillStyle = grad1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= renderW; x += 12) {
            const y = Math.sin(x * 0.018 + waveOffset) * 14 + Math.cos(x * 0.035 - waveOffset) * 8 + 24;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(renderW, 0);
          ctx.closePath();
          ctx.fill();

          // Aurora Cyan/Violet Wave 2
          const grad2 = ctx.createLinearGradient(0, 0, renderW, 0);
          grad2.addColorStop(0, 'rgba(147, 51, 234, 0)');
          grad2.addColorStop(0.4, 'rgba(56, 189, 248, 0.22)');
          grad2.addColorStop(0.8, 'rgba(168, 85, 247, 0.25)');
          grad2.addColorStop(1, 'rgba(52, 211, 153, 0)');

          ctx.fillStyle = grad2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= renderW; x += 12) {
            const y = Math.cos(x * 0.022 - waveOffset * 1.2) * 12 + Math.sin(x * 0.04 + waveOffset) * 7 + 34;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(renderW, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Draw twinkling stars
        stars.forEach((star) => {
          star.alpha += star.speed;
          if (star.alpha > 0.95 || star.alpha < 0.15) {
            star.speed = -star.speed;
          }

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle =
            mode === 'twilight'
              ? `rgba(254, 243, 199, ${star.alpha * 0.8})`
              : mode === 'aurora'
              ? `rgba(209, 250, 229, ${star.alpha})`
              : `rgba(255, 255, 240, ${star.alpha})`;

          if (!isMobile && star.radius > 1.2) {
            ctx.shadowBlur = mode === 'aurora' ? 5 : 3;
            ctx.shadowColor = mode === 'aurora' ? '#34d399' : '#fef08a';
          }
          ctx.fill();
          if (!isMobile) ctx.shadowBlur = 0;
        });

        // Chance to spawn shooting meteors
        const meteorProb = isMobile ? 0.007 : 0.018;
        if (Math.random() < meteorProb && meteors.length < 2) {
          meteors.push({
            x: Math.random() * (renderW * 0.75),
            y: Math.random() * 20,
            len: Math.random() * 32 + 22,
            speed: Math.random() * 4.5 + 3.5,
            alpha: 1,
          });
        }

        // Draw shooting meteors
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.len, m.y + m.len * 0.45);
          ctx.strokeStyle =
            mode === 'aurora'
              ? `rgba(167, 243, 208, ${m.alpha})`
              : `rgba(254, 240, 138, ${m.alpha})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          m.x += m.speed;
          m.y += m.speed * 0.45;
          m.alpha -= 0.038;

          if (m.alpha <= 0 || m.x > renderW || m.y > renderH) {
            meteors.splice(i, 1);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  const handleSwitchMode = (targetMode: SkyMode) => {
    playMechanicalClick('toggle', 0.09);
    playChime(640, 'triangle', 0.14);
    if (onSelectMode) {
      onSelectMode(targetMode);
    } else {
      onCycleMode();
    }
  };

  const handleNextMode = () => {
    playMechanicalClick('toggle', 0.09);
    playChime(680, 'triangle', 0.14);
    onCycleMode();
  };

  const handlePrevMode = () => {
    playMechanicalClick('toggle', 0.09);
    playChime(580, 'triangle', 0.14);
    const order: SkyMode[] = ['midnight', 'twilight', 'aurora', 'rainy'];
    const curIdx = order.indexOf(mode);
    const prevIdx = (curIdx - 1 + order.length) % order.length;
    if (onSelectMode) {
      onSelectMode(order[prevIdx]);
    } else {
      onCycleMode();
    }
  };

  const handleWindowAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Interactive click directly on the glass window pane
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setClickRipple({ x, y, id: Date.now() });
    setTimeout(() => {
      setClickRipple((cur) => (cur && Date.now() - cur.id >= 600 ? null : cur));
    }, 600);

    if (mode === 'rainy') {
      // Trigger distant thunder flash
      setLightningFlash(true);
      playChime(220, 'sine', 0.35, 0.06);
      setTimeout(() => setLightningFlash(false), 120);
    } else {
      playChime(740, 'triangle', 0.16);
    }

    onCycleMode();
  };

  const currentConfig = SKY_MODES.find((s) => s.id === mode) || SKY_MODES[0];

  const getSkyGradient = () => {
    switch (mode) {
      case 'twilight':
        return 'from-[#190b2b] via-[#3d164d] to-[#6d2153]';
      case 'aurora':
        return 'from-[#031c19] via-[#093532] to-[#151739]';
      case 'rainy':
        return 'from-[#080d16] via-[#101724] to-[#1b2333]';
      default: // midnight
        return 'from-[#040612] via-[#0a0f26] to-[#16122f]';
    }
  };

  const getModeBadge = () => {
    switch (mode) {
      case 'twilight':
        return {
          label: 'DUSK',
          icon: <SunMedium className="w-3 h-3 text-amber-400" />,
          colorCls: 'text-amber-300 border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30',
        };
      case 'aurora':
        return {
          label: 'AURORA',
          icon: <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />,
          colorCls: 'text-emerald-300 border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30',
        };
      case 'rainy':
        return {
          label: 'RAIN',
          icon: <CloudRain className="w-3 h-3 text-sky-300" />,
          colorCls: 'text-sky-300 border-sky-500/50 bg-sky-500/20 hover:bg-sky-500/30',
        };
      default:
        return {
          label: 'STARRY',
          icon: <Moon className="w-3 h-3 text-amber-200" />,
          colorCls: 'text-amber-200 border-amber-400/40 bg-slate-800/90 hover:bg-slate-700',
        };
    }
  };

  const badge = getModeBadge();

  return (
    <div
      ref={containerRef}
      id="celestialWindow"
      className={`w-72 h-44 bg-slate-950 rounded-2xl border-2 border-slate-700/80 shadow-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:border-sky-400/70 select-none ${className}`}
    >
      {/* Window Frame Titlebar with Drag Zone & Quick Controls */}
      <div className="bg-slate-900/95 px-2.5 py-1.5 flex items-center justify-between text-[9px] font-mono text-slate-300 border-b border-slate-800 shrink-0">
        {/* Title & Arrow Buttons */}
        <div className="flex items-center gap-1.5 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              mode === 'rainy'
                ? 'bg-sky-400 animate-pulse'
                : mode === 'aurora'
                ? 'bg-emerald-400 animate-pulse'
                : mode === 'twilight'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-amber-300 animate-pulse'
            }`}
          />
          <span className="font-bold truncate text-[9px] tracking-wide text-slate-200">
            {currentConfig.title} • {currentConfig.time}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Previous / Next Mode Mini Arrows */}
          <div data-no-drag className="flex items-center bg-slate-950/80 rounded border border-slate-800 p-0.5">
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                handlePrevMode();
              }}
              onMouseEnter={() => playHoverSound(0.01, 560)}
              className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
              title="Previous Sky Mode"
            >
              <ChevronLeft className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                handleNextMode();
              }}
              onMouseEnter={() => playHoverSound(0.01, 620)}
              className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
              title="Next Sky Mode"
            >
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Interactive Mode Cycle / Toggle Badge */}
          <button
            type="button"
            data-no-drag
            onClick={(e) => {
              e.stopPropagation();
              handleNextMode();
            }}
            onMouseEnter={() => playHoverSound(0.012, 650)}
            className={`flex items-center gap-1 text-[8px] font-pixel px-1.5 py-0.5 rounded border transition active:scale-95 cursor-pointer shadow-sm ${badge.colorCls}`}
            title={`Current Sky: ${currentConfig.title}. Click to switch!`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </button>

          {/* Rain Sound Toggle Button (Available when in rainy mode or if rain is active) */}
          {onToggleRain && (mode === 'rainy' || isRainActive) && (
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                onToggleRain();
              }}
              onMouseEnter={() => playHoverSound(0.012, 540)}
              className={`p-1 rounded text-[8px] border transition cursor-pointer active:scale-95 ${
                isRainActive
                  ? 'bg-sky-500/25 text-sky-300 border-sky-400/60 shadow-sm'
                  : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={isRainActive ? 'Rain Sound: Active (Click to mute)' : 'Turn On Rain Audio'}
            >
              {isRainActive ? <Volume2 className="w-2.5 h-2.5 text-sky-400" /> : <VolumeX className="w-2.5 h-2.5" />}
            </button>
          )}

          {/* Drag Handle Indicator */}
          <div
            className="text-[9px] text-slate-500 font-mono tracking-tighter cursor-grab active:cursor-grabbing px-0.5 py-0.5 hover:text-slate-300 transition"
            title="Drag window anywhere on desk"
          >
            <GripVertical className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Celestial Canvas Area (Interactive glass window pane) */}
      <div
        data-no-drag
        onClick={handleWindowAreaClick}
        className={`flex-1 relative overflow-hidden bg-gradient-to-b ${getSkyGradient()} transition-colors duration-700 cursor-pointer group/pane`}
        title="Click window pane to switch night sky atmosphere"
      >
        {/* Distant Thunder Lightning Flash Overlay */}
        <div
          className={`absolute inset-0 bg-sky-100/40 pointer-events-none transition-opacity duration-150 z-20 ${
            lightningFlash ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Dynamic Canvas Stars & Rain */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Realistic Moon (Shown in non-rainy modes) */}
        {mode !== 'rainy' && (
          <div
            className={`absolute top-2 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full ${
              mode === 'twilight'
                ? 'bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-50 shadow-[0_0_26px_rgba(251,191,36,0.6)]'
                : mode === 'aurora'
                ? 'bg-gradient-to-tr from-emerald-100 to-teal-50 shadow-[0_0_22px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-tr from-amber-100 to-yellow-50 shadow-[0_0_22px_rgba(254,243,199,0.5)]'
            } pointer-events-none transition-all duration-700 flex items-center justify-center z-10`}
          >
            <div className="w-full h-full rounded-full relative overflow-hidden opacity-90">
              <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-300/40" />
              <span className="absolute bottom-2.5 right-3 w-3 h-3 rounded-full bg-amber-300/35" />
              <span className="absolute top-4 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-300/50" />
            </div>
          </div>
        )}

        {/* Translucent Windowpane Glass Sheen Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.06] z-10" />

        {/* Click Ripple Effect */}
        {clickRipple && (
          <span
            style={{ left: clickRipple.x, top: clickRipple.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 animate-ping pointer-events-none z-20"
          />
        )}

        {/* Distant City Skyline Silhouettes with Lit Windows */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between px-1 opacity-95 z-10">
          <svg className="w-full h-11 text-[#070913]" preserveAspectRatio="none" viewBox="0 0 200 60" fill="currentColor">
            <rect x="0" y="25" width="22" height="35" />
            <rect x="25" y="15" width="18" height="45" />
            <rect x="46" y="32" width="15" height="28" />
            <polygon points="53,10 49,32 58,32" />
            <rect x="64" y="20" width="28" height="40" />
            <rect x="95" y="8" width="24" height="52" />
            <polygon points="107,0 105,8 109,8" />
            <rect x="122" y="28" width="20" height="32" />
            <rect x="145" y="18" width="26" height="42" />
            <rect x="174" y="30" width="26" height="30" />
          </svg>
          <div className="absolute inset-x-0 bottom-1 flex justify-around text-[6px] text-amber-300 font-mono opacity-80 tracking-widest pointer-events-none select-none">
            <span className={mode === 'rainy' ? 'text-sky-300' : 'text-amber-300'}>■ · ■</span>
            <span>· ■ ·</span>
            <span>■ ■ ·</span>
            <span className={mode === 'twilight' ? 'text-orange-300' : 'text-amber-300'}>· · ■</span>
          </div>
        </div>
      </div>

      {/* Interactive Bottom Atmosphere Bar & Quick Selectors */}
      <div className="bg-slate-900/95 px-2 py-1 border-t border-slate-800 flex items-center justify-between text-[8px] font-mono text-slate-400 shrink-0">
        <button
          type="button"
          data-no-drag
          onClick={(e) => {
            e.stopPropagation();
            handleNextMode();
          }}
          onMouseEnter={() => playHoverSound(0.01, 600)}
          className="text-left hover:text-sky-300 transition flex items-center gap-1 cursor-pointer truncate"
          title="Click to toggle to next sky mode"
        >
          <span className="text-amber-400">✨</span>
          <span className="truncate">Click to toggle atmosphere</span>
        </button>

        {/* Mode Indicators Dots / Direct Clickers */}
        <div data-no-drag className="flex items-center gap-1 ml-2 shrink-0">
          {SKY_MODES.map((s) => {
            const isActive = s.id === mode;
            return (
              <button
                key={s.id}
                type="button"
                data-no-drag
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitchMode(s.id);
                }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? s.id === 'rainy'
                      ? 'bg-sky-400 ring-2 ring-sky-400/50 scale-125'
                      : s.id === 'aurora'
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/50 scale-125'
                      : s.id === 'twilight'
                      ? 'bg-amber-400 ring-2 ring-amber-400/50 scale-125'
                      : 'bg-indigo-400 ring-2 ring-indigo-400/50 scale-125'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Switch to ${s.title}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
