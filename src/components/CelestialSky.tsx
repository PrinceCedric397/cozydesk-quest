import React, { useEffect, useRef } from 'react';
import { Sparkles, Moon, CloudRain, SunMedium } from 'lucide-react';
import { SkyMode } from '../types';
import { playChime } from '../utils/audio';

interface CelestialSkyProps {
  mode: SkyMode;
  onCycleMode: () => void;
  onRainToggle?: (enable: boolean) => void;
}

export const CelestialSky: React.FC<CelestialSkyProps> = ({
  mode,
  onCycleMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 260;
      canvas.height = canvas.parentElement?.clientHeight || 160;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 42 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.72),
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: (Math.random() * 0.02 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // Meteors
    const meteors: Array<{
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
    }> = [];

    // Raindrops for rainy mode
    const raindrops = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 8 + 4,
      speed: Math.random() * 4 + 3,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'rainy') {
        // Draw rain streaks
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1;
        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + 1, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x += 0.5;
          if (drop.y > canvas.height) {
            drop.y = -drop.len;
            drop.x = Math.random() * canvas.width;
          }
        });
      } else {
        // Draw stars with twinkle
        stars.forEach((star) => {
          star.alpha += star.speed;
          if (star.alpha > 0.95 || star.alpha < 0.15) {
            star.speed = -star.speed;
          }

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 235, ${star.alpha})`;
          ctx.shadowBlur = mode === 'aurora' ? 5 : 3;
          ctx.shadowColor = mode === 'aurora' ? '#34d399' : '#fef08a';
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Chance to spawn meteor
        if (Math.random() < 0.015 && meteors.length < 2) {
          meteors.push({
            x: Math.random() * (canvas.width * 0.7),
            y: Math.random() * 25,
            len: Math.random() * 32 + 20,
            speed: Math.random() * 4 + 3.5,
            alpha: 1,
          });
        }

        // Draw and update meteors
        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.len, m.y + m.len * 0.5);
          ctx.strokeStyle = `rgba(254, 240, 138, ${m.alpha})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          m.x += m.speed;
          m.y += m.speed * 0.5;
          m.alpha -= 0.035;

          if (m.alpha <= 0 || m.x > canvas.width || m.y > canvas.height) {
            meteors.splice(i, 1);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  const getSkyGradient = () => {
    switch (mode) {
      case 'twilight':
        return 'from-[#1a0c2e] via-[#3a184e] to-[#702459]';
      case 'aurora':
        return 'from-[#031c19] via-[#0b3835] to-[#1c1d42]';
      case 'rainy':
        return 'from-[#090d16] via-[#121927] to-[#1e2738]';
      default: // midnight
        return 'from-[#050713] via-[#0c1028] to-[#191533]';
    }
  };

  const getSkyTitle = () => {
    switch (mode) {
      case 'twilight':
        return 'TWILIGHT DUSK • 08:30 PM';
      case 'aurora':
        return 'AURORA BOREALIS • 03:15 AM';
      case 'rainy':
        return 'RAINY NIGHT • 01:20 AM';
      default:
        return 'MIDNIGHT SKY • 02:45 AM';
    }
  };

  const getModeBadge = () => {
    switch (mode) {
      case 'twilight':
        return { label: 'DUSK', icon: <SunMedium className="w-3 h-3 text-amber-400" /> };
      case 'aurora':
        return { label: 'AURORA', icon: <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> };
      case 'rainy':
        return { label: 'RAIN', icon: <CloudRain className="w-3 h-3 text-sky-400" /> };
      default:
        return { label: 'STARRY', icon: <Moon className="w-3 h-3 text-amber-200" /> };
    }
  };

  const badge = getModeBadge();

  return (
    <div
      id="celestialWindow"
      onClick={() => {
        playChime(620, 'triangle', 0.12);
        onCycleMode();
      }}
      className="absolute top-3 right-4 w-48 h-32 sm:w-64 sm:h-40 bg-slate-950 rounded-2xl border-4 border-slate-800/90 shadow-2xl overflow-hidden cursor-pointer z-0 flex flex-col group transition-all duration-300 hover:border-sky-400/60"
      title="Click window to change sky & atmosphere"
    >
      {/* Window Frame Titlebar */}
      <div className="bg-slate-900/95 px-2.5 py-1 flex items-center justify-between text-[9px] font-mono text-slate-300 border-b border-slate-800">
        <span className="flex items-center gap-1.5 font-bold truncate">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{getSkyTitle()}</span>
        </span>
        <span className="flex items-center gap-1 text-[8px] text-emerald-300 font-pixel bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
          {badge.icon}
          <span>{badge.label}</span>
        </span>
      </div>

      {/* Celestial Canvas Area */}
      <div className={`flex-1 relative overflow-hidden bg-gradient-to-b ${getSkyGradient()} transition-colors duration-700`}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Realistic Moon (hidden in rain mode) */}
        {mode !== 'rainy' && (
          <div
            className={`absolute top-2 right-4 w-9 h-9 sm:w-11 sm:h-11 rounded-full ${
              mode === 'twilight'
                ? 'bg-gradient-to-tr from-amber-200 to-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                : 'bg-gradient-to-tr from-amber-100 to-yellow-50 shadow-[0_0_20px_rgba(254,243,199,0.45)]'
            } pointer-events-none transition-all duration-700 flex items-center justify-center`}
          >
            <div className="w-full h-full rounded-full relative overflow-hidden opacity-90">
              <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-300/40" />
              <span className="absolute bottom-2.5 right-3 w-3 h-3 rounded-full bg-amber-300/35" />
              <span className="absolute top-4 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-300/50" />
            </div>
          </div>
        )}

        {/* Aurora Green Waves */}
        {mode === 'aurora' && (
          <div className="absolute inset-x-0 top-1 h-14 pointer-events-none opacity-40 flex justify-around animate-pulse">
            <div className="w-32 h-10 rounded-full bg-emerald-400/40 filter blur-xl -rotate-6" />
            <div className="w-28 h-8 rounded-full bg-teal-300/30 filter blur-lg rotate-12" />
          </div>
        )}

        {/* Distant City Skyline Silhouettes with Lit Windows */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none flex items-end justify-between px-1 opacity-95">
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
            <span>■ · ■</span>
            <span>· ■ ·</span>
            <span>■ ■ ·</span>
            <span>· · ■</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/95 text-[8px] font-mono text-center text-slate-400 py-0.5 border-t border-slate-800">
        Click to toggle night sky atmosphere
      </div>
    </div>
  );
};
