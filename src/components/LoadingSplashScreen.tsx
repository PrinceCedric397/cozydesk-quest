import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, RefreshCw, Radio, CloudRain, Wind, Check, ChevronRight } from 'lucide-react';
import {
  playMechanicalClick,
  playPaperRustleSound,
  playChime,
  playCassetteClick,
  playSoftHum,
  getAudioContext,
} from '../utils/audio';

interface LoadingSplashScreenProps {
  onEnterWorkspace: (options: {
    startAudio: boolean;
    audioChoice: 'lofi' | 'rain' | 'hum' | 'none';
    lofiTrackKey?: string;
  }) => void;
}

const DAILY_VIBES_AND_TIPS = [
  {
    tag: 'Daily Vibe',
    text: 'Breathe in calm, breathe out noise.',
    icon: '✨',
  },
  {
    tag: 'Desk Tip',
    text: 'Stay hydrated, take breaks, and drag gadgets anywhere you like!',
    icon: '☕',
  },
  {
    tag: 'Daily Vibe',
    text: 'A steaming cup of coffee makes any task 50% cozier.',
    icon: '☕',
  },
  {
    tag: 'Desk Tip',
    text: 'Click the window sky anytime to cycle between Midnight, Twilight, and Aurora.',
    icon: '🌌',
  },
  {
    tag: 'Daily Vibe',
    text: 'Slow down. There is no rush inside your cozy zone.',
    icon: '🌱',
  },
  {
    tag: 'Desk Tip',
    text: 'Pin your personal memos, sticky notes, or polaroids on the infinite Corkboard Studio.',
    icon: '📌',
  },
  {
    tag: 'Daily Vibe',
    text: 'Let the generative lo-fi jazz chords untangle your thoughts.',
    icon: '📻',
  },
  {
    tag: 'Desk Tip',
    text: 'Toggle the desk lamp to switch between warm amber filament and retro phosphor glow.',
    icon: '💡',
  },
  {
    tag: 'Daily Vibe',
    text: 'Small moments of quiet focus build great things.',
    icon: '⏳',
  },
  {
    tag: 'Desk Tip',
    text: 'Play a round of Pixel Tic-Tac-Toe against the AI to earn daily quest XP!',
    icon: '👾',
  },
  {
    tag: 'Daily Vibe',
    text: 'Gentle rain on the glass, warm illumination on the cedar desk.',
    icon: '🌧️',
  },
  {
    tag: 'Desk Tip',
    text: 'Feed or cuddle your Pixel Pet to keep its happiness bar full.',
    icon: '🐾',
  },
];

export const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({ onEnterWorkspace }) => {
  // Session check
  const isReturningSession = typeof window !== 'undefined' && sessionStorage.getItem('cozydesk_session_loaded') === 'true';

  // Loading progress
  const [progress, setProgress] = useState(0);
  const [loadingStageText, setLoadingStageText] = useState('Initializing procedural Lo-Fi synthesizer...');
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Audio preference states
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedAudioType, setSelectedAudioType] = useState<'lofi' | 'rain' | 'hum'>('lofi');

  // Daily Vibe / Tip of the day index
  const [vibeIndex, setVibeIndex] = useState(() => Math.floor(Math.random() * DAILY_VIBES_AND_TIPS.length));
  const currentVibe = DAILY_VIBES_AND_TIPS[vibeIndex];

  // Animated steam particles offset
  const [cassetteSpoolAngle, setCassetteSpoolAngle] = useState(0);

  // Rotation animation for cassette spools during loading
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const animateSpool = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setCassetteSpoolAngle((prev) => (prev + dt * 140) % 360);
      animId = requestAnimationFrame(animateSpool);
    };
    animId = requestAnimationFrame(animateSpool);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Smooth loading progression
  useEffect(() => {
    // If user already loaded this session, accelerate (around 320ms)
    // If fresh visit, smooth duration around 1.5 seconds (1500ms)
    const targetDuration = isReturningSession ? 350 : 1500;
    const intervalTime = 25;
    const totalSteps = targetDuration / intervalTime;
    const increment = 100 / totalSteps;

    let currentVal = 0;
    const timer = setInterval(() => {
      currentVal += increment;
      if (currentVal >= 100) {
        currentVal = 100;
        clearInterval(timer);
        setProgress(100);
        setLoadingStageText('Workspace ready! ✨');
        setTimeout(() => {
          setIsReadyToEnter(true);
        }, 150);
      } else {
        setProgress(Math.floor(currentVal));
        if (currentVal < 30) {
          setLoadingStageText('Initializing procedural Lo-Fi synthesizer...');
        } else if (currentVal < 60) {
          setLoadingStageText('Arranging desk gadgets & warming up coffee...');
        } else if (currentVal < 85) {
          setLoadingStageText('Connecting to Corkboard Bulletin wall...');
        } else {
          setLoadingStageText('Tuning ambient acoustics...');
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isReturningSession]);

  const handleNextVibe = () => {
    playPaperRustleSound('flutter', 0.08);
    setVibeIndex((prev) => (prev + 1) % DAILY_VIBES_AND_TIPS.length);
  };

  const handleToggleAudio = () => {
    playMechanicalClick('toggle', 0.08);
    setAudioEnabled((prev) => !prev);
  };

  const handleSelectAudioType = (type: 'lofi' | 'rain' | 'hum') => {
    playMechanicalClick('key', 0.07);
    setSelectedAudioType(type);
    if (!audioEnabled) {
      setAudioEnabled(true);
    }
  };

  const handleEnterWorkspace = () => {
    // Audio unlock gesture required by browser
    getAudioContext();

    playMechanicalClick('switch', 0.09);
    playChime(523.25, 'sine', 0.25, 0.07);

    // Save session flag
    try {
      sessionStorage.setItem('cozydesk_session_loaded', 'true');
    } catch {}

    // Trigger workspace enter callback
    onEnterWorkspace({
      startAudio: audioEnabled,
      audioChoice: audioEnabled ? selectedAudioType : 'none',
      lofiTrackKey: 'tokyo',
    });

    // Start smooth fade-out
    setIsFadingOut(true);
    setTimeout(() => {
      setIsMounted(false);
    }, 550);
  };

  const handleQuickSkip = () => {
    setProgress(100);
    setLoadingStageText('Workspace ready! ✨');
    setIsReadyToEnter(true);
  };

  if (!isMounted) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to CozyDesk Quest"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 select-none bg-[#090b10] text-slate-100 transition-opacity duration-500 ease-out overflow-y-auto ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Lighting & Atmosphere */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 38%, rgba(245, 158, 11, 0.14) 0%, rgba(30, 25, 22, 0.45) 45%, rgba(9, 11, 16, 0.98) 95%)',
        }}
      />

      {/* Subtle Dust Motes / Stars in background */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute top-[18%] left-[22%] w-1.5 h-1.5 rounded-full bg-amber-200/60 blur-[0.5px] animate-pulse" />
        <div className="absolute top-[28%] right-[25%] w-1 h-1 rounded-full bg-amber-300/50 blur-[0.5px] animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[68%] left-[30%] w-1 h-1 rounded-full bg-amber-400/40 blur-[0.5px] animate-pulse" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-[75%] right-[28%] w-1.5 h-1.5 rounded-full bg-sky-200/50 blur-[0.5px] animate-pulse" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Main Cozy Center Card */}
      <div className="relative w-full max-w-lg z-10 flex flex-col items-center my-auto">
        {/* Skip button for returning users or fast bypass */}
        {!isReadyToEnter && (
          <button
            onClick={handleQuickSkip}
            className="absolute -top-10 right-0 text-xs font-mono text-amber-300/70 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-900/60"
            title="Fast forward loading"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Centerpiece Animation Container */}
        <div className="relative mb-4 sm:mb-6 flex flex-col items-center">
          {/* Warm Ambient Glow behind illustrations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Steaming Coffee Cup & Vintage Cassette Tape Artwork */}
          <div className="relative flex items-center justify-center gap-5 sm:gap-7 py-2">
            {/* SVG Steaming Coffee Cup */}
            <div className="relative flex flex-col items-center">
              {/* Animated Rising Steam Particles */}
              <div className="h-14 w-16 relative overflow-visible pointer-events-none flex justify-center">
                {/* Steam Vapor 1 */}
                <div
                  className="absolute bottom-1 w-2.5 h-8 border-l-2 border-amber-200/60 rounded-full blur-[1px] animate-[steamRise_2.4s_ease-in-out_infinite]"
                  style={{ transformOrigin: 'bottom center', left: '30%' }}
                />
                {/* Steam Vapor 2 */}
                <div
                  className="absolute bottom-1 w-3 h-10 border-r-2 border-amber-100/70 rounded-full blur-[1px] animate-[steamRise_2.8s_ease-in-out_infinite]"
                  style={{ transformOrigin: 'bottom center', left: '48%', animationDelay: '0.8s' }}
                />
                {/* Steam Vapor 3 */}
                <div
                  className="absolute bottom-1 w-2.5 h-7 border-l-2 border-amber-200/50 rounded-full blur-[1px] animate-[steamRise_2.2s_ease-in-out_infinite]"
                  style={{ transformOrigin: 'bottom center', left: '65%', animationDelay: '1.5s' }}
                />
              </div>

              {/* Ceramic Mug Graphic */}
              <div className="relative -mt-2">
                <svg
                  width="72"
                  height="64"
                  viewBox="0 0 72 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.25)]"
                >
                  {/* Saucer / Mug Base Shadow */}
                  <ellipse cx="34" cy="58" rx="28" ry="4.5" fill="#0b0e14" opacity="0.75" />
                  <ellipse cx="34" cy="57" rx="26" ry="3.5" fill="#2d221c" />

                  {/* Mug Handle */}
                  <path
                    d="M 50 18 C 65 18 68 40 50 44"
                    stroke="#a85d34"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 50 20 C 62 20 65 38 50 42"
                    stroke="#c87948"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Mug Ceramic Body */}
                  <path
                    d="M 12 16 L 16 52 C 16 56 22 58 34 58 C 46 58 52 56 52 52 L 56 16 Z"
                    fill="url(#mugGradient)"
                  />

                  {/* Mug Body Highlights */}
                  <path
                    d="M 17 18 L 20 50 C 20 52 24 53 30 53"
                    stroke="rgba(255, 237, 213, 0.45)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Coffee Rim / Lip */}
                  <ellipse cx="34" cy="16" rx="22" ry="7" fill="#d97736" stroke="#b45309" strokeWidth="1" />
                  <ellipse cx="34" cy="16" rx="20" ry="5.5" fill="#78350f" />

                  {/* Hot Dark Roast Coffee Liquid */}
                  <ellipse cx="34" cy="16.5" rx="18" ry="4.5" fill="#381a07" />
                  {/* Coffee crema swirl */}
                  <path
                    d="M 24 16.5 C 28 14.5 38 18 44 16"
                    stroke="#9a5223"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <ellipse cx="28" cy="15.5" rx="3" ry="1.2" fill="#d97706" opacity="0.6" />

                  {/* Pixel Heart or Cozy Icon on Mug Body */}
                  <rect x="32" y="32" width="4" height="4" fill="#fef3c7" opacity="0.9" />
                  <rect x="28" y="28" width="4" height="4" fill="#fef3c7" opacity="0.9" />
                  <rect x="36" y="28" width="4" height="4" fill="#fef3c7" opacity="0.9" />
                  <rect x="24" y="24" width="4" height="4" fill="#fef3c7" opacity="0.9" />
                  <rect x="32" y="24" width="4" height="4" fill="#fef3c7" opacity="0.9" />
                  <rect x="40" y="24" width="4" height="4" fill="#fef3c7" opacity="0.9" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="mugGradient" x1="12" y1="16" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#e07a3f" />
                      <stop offset="0.45" stopColor="#c26128" />
                      <stop offset="1" stopColor="#8c3e14" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Vintage Cassette Tape Reel Graphic */}
            <div className="relative">
              <svg
                width="104"
                height="68"
                viewBox="0 0 104 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
              >
                {/* Cassette Shell Outer */}
                <rect x="2" y="2" width="100" height="64" rx="7" fill="#181b24" stroke="#333b4e" strokeWidth="2" />
                <rect x="6" y="6" width="92" height="56" rx="5" fill="#12141c" stroke="#252b39" strokeWidth="1" />

                {/* Screw Holes at four corners */}
                <circle cx="8" cy="8" r="1.5" fill="#475569" />
                <circle cx="96" cy="8" r="1.5" fill="#475569" />
                <circle cx="8" cy="60" r="1.5" fill="#475569" />
                <circle cx="96" cy="60" r="1.5" fill="#475569" />

                {/* Label Area */}
                <path
                  d="M 12 12 H 92 V 46 H 76 L 70 52 H 34 L 28 46 H 12 Z"
                  fill="#fbf5e8"
                  stroke="#e2d9c4"
                  strokeWidth="0.8"
                />

                {/* Cassette Label Header Stripes */}
                <rect x="16" y="15" width="72" height="3" fill="#e11d48" />
                <rect x="16" y="19" width="72" height="2" fill="#f59e0b" />

                {/* Tape Title on Label */}
                <text x="20" y="27" fill="#1e293b" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                  COZY CHILL • VOL 1
                </text>
                <text x="76" y="27" fill="#64748b" fontSize="5.5" fontFamily="monospace">
                  A-SIDE
                </text>

                {/* Center Tape Window Cutout */}
                <rect x="22" y="30" width="60" height="20" rx="3.5" fill="#0f1118" stroke="#334155" strokeWidth="1" />

                {/* Magnetic Tape Ribbon between spools */}
                <rect x="36" y="37" width="32" height="5" fill="#3f271a" />

                {/* Left Spool (Rotating) */}
                <g transform={`translate(34, 40) rotate(${cassetteSpoolAngle})`}>
                  <circle cx="0" cy="0" r="7.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <circle cx="0" cy="0" r="3.5" fill="#0f1118" />
                  {/* Spool Teeth */}
                  <rect x="-1" y="-7.5" width="2" height="3" fill="#64748b" />
                  <rect x="-1" y="4.5" width="2" height="3" fill="#64748b" />
                  <rect x="-7.5" y="-1" width="3" height="2" fill="#64748b" />
                  <rect x="4.5" y="-1" width="3" height="2" fill="#64748b" />
                </g>

                {/* Right Spool (Rotating) */}
                <g transform={`translate(70, 40) rotate(${cassetteSpoolAngle})`}>
                  <circle cx="0" cy="0" r="7.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <circle cx="0" cy="0" r="3.5" fill="#0f1118" />
                  {/* Spool Teeth */}
                  <rect x="-1" y="-7.5" width="2" height="3" fill="#64748b" />
                  <rect x="-1" y="4.5" width="2" height="3" fill="#64748b" />
                  <rect x="-7.5" y="-1" width="3" height="2" fill="#64748b" />
                  <rect x="4.5" y="-1" width="3" height="2" fill="#64748b" />
                </g>

                {/* Bottom Trapezoid Deck Guide */}
                <polygon points="32,54 72,54 66,64 38,64" fill="#1e2433" stroke="#333b4e" strokeWidth="0.8" />
                <circle cx="43" cy="59" r="1.8" fill="#475569" />
                <circle cx="61" cy="59" r="1.8" fill="#475569" />
              </svg>
            </div>
          </div>

          {/* App Title with Warm Soft Neon Glow */}
          <h1 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl text-amber-100 tracking-wide text-center drop-shadow-[0_0_18px_rgba(251,191,36,0.6)]">
            CozyDesk Quest
          </h1>

          {/* Subtitle */}
          <p className="mt-1 text-xs sm:text-sm text-amber-200/80 font-mono tracking-tight text-center max-w-sm px-2">
            Preparing your cozy workspace & tuning ambient frequencies...
          </p>
        </div>

        {/* Content Box: Switches between Loading Stage and Ready-to-Enter State */}
        <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col gap-4">
          {!isReadyToEnter ? (
            /* --- Phase 1: Dynamic Loading Progress Bar --- */
            <div className="flex flex-col gap-3">
              {/* Progress Header with Monospace Percent */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="truncate">{loadingStageText}</span>
                </span>
                <span className="text-amber-200 font-bold tabular-nums ml-2 shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Retro Progress Track */}
              <div className="w-full h-3 bg-slate-950/90 rounded-lg p-0.5 border border-amber-900/60 overflow-hidden relative shadow-inner">
                {/* Track Tick marks for retro feel */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, rgba(251, 191, 36, 0.4) 1px, transparent 1px)',
                    backgroundSize: '12px 100%',
                  }}
                />

                {/* Active Gold / Amber Bar */}
                <div
                  className="h-full rounded-md bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-75 relative shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${progress}%` }}
                >
                  {/* Leading edge light */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 blur-[1px] rounded-r-md" />
                </div>
              </div>

              {/* Subtle status indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{isReturningSession ? 'Session cached' : 'Loading desk canvas'}</span>
                <span>[ 44.1 kHz WebAudio ]</span>
              </div>
            </div>
          ) : (
            /* --- Phase 2: Interactive Welcome Interstitial / Audio Unlock --- */
            <div className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>Welcome to your virtual desk space.</span>
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Your tactile sanctuary for study, focus, lo-fi chords, and creative calm.
                </p>
              </div>

              {/* Audio Consent Controls */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label
                    onClick={handleToggleAudio}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-slate-200 select-none group"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        audioEnabled
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'border-slate-600 bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="group-hover:text-amber-200 transition-colors">
                      Enable ambient room sound / Lo-Fi on start
                    </span>
                  </label>
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>

                {/* Sound Flavor Quick Selection (if audio enabled) */}
                {audioEnabled && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => handleSelectAudioType('lofi')}
                      className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedAudioType === 'lofi'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Radio className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">Lo-Fi Radio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAudioType('rain')}
                      className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedAudioType === 'rain'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CloudRain className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">Window Rain</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAudioType('hum')}
                      className={`py-1.5 px-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedAudioType === 'hum'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Wind className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">Room Hum</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Prominent CTA Enter Button */}
              <button
                type="button"
                onClick={handleEnterWorkspace}
                className="w-full py-3 sm:py-3.5 px-5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-display font-extrabold text-sm sm:text-base rounded-xl shadow-[0_0_25px_rgba(251,191,36,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200/90 group"
              >
                <span>Enter Workspace</span>
                <span className="text-lg group-hover:scale-110 transition-transform">☕</span>
              </button>
            </div>
          )}

          {/* Daily Vibe / Tip of the Day Footer */}
          <div className="border-t border-slate-800/90 pt-3 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-sm shrink-0 mt-0.5">{currentVibe.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold">
                  {currentVibe.tag}
                </span>
                <p className="text-slate-300 font-sans text-xs italic leading-snug">
                  "{currentVibe.text}"
                </p>
              </div>
            </div>

            {/* Shuffle / Next Vibe Button */}
            <button
              type="button"
              onClick={handleNextVibe}
              className="text-slate-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
              title="Next daily vibe or tip"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quiet footer metadata */}
        <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span>CozyDesk Quest</span>
          <span aria-hidden="true">·</span>
          <span>Tactile Desk Sanctuary</span>
          <span aria-hidden="true">·</span>
          <span>v1.2</span>
        </div>
      </div>
    </div>
  );
};
