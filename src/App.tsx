import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CelestialSky } from './components/CelestialSky';
import { DeskHeader } from './components/DeskHeader';
import { DeskFooter } from './components/DeskFooter';
import { TicTacToeWidget } from './components/widgets/TicTacToeWidget';
import { PomodoroWidget } from './components/widgets/PomodoroWidget';
import { DeskLampWidget } from './components/widgets/DeskLampWidget';
import { LoFiRadioWidget } from './components/widgets/LoFiRadioWidget';
import { PlantWidget } from './components/widgets/PlantWidget';
import { PixelPetWidget } from './components/widgets/PixelPetWidget';
import { CoffeeMugWidget } from './components/widgets/CoffeeMugWidget';
import { StickyNoteWidget } from './components/widgets/StickyNoteWidget';
import { CorkboardModal } from './components/CorkboardModal';
import { QuestModal } from './components/QuestModal';
import { ExpandedCorkboardStudio } from './components/ExpandedCorkboardStudio';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { SpotlightTour } from './components/onboarding/SpotlightTour';
import { FirstStepsCard, StarterStepsState } from './components/onboarding/FirstStepsCard';
import confetti from 'canvas-confetti';
import {
  SkyMode,
  LampLighting,
  WidgetPosition,
  StickyNoteData,
  CorkboardNote,
  Quest,
} from './types';
import {
  getAudioContext,
  setAudioMuted,
  getIsAudioMuted,
  playChime,
  playWinFanfare,
  toggleAmbientRain,
  playMechanicalClick,
  playPaperRustleSound,
  playDeskSlideSound,
  playWoodThudSound,
  playPinTackSound,
  playStampSound,
  playItemPickupSound,
  playItemDropSound,
  playWidgetHoverSound,
} from './utils/audio';

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'play_tictactoe',
    title: 'Win at Pixel Tic-Tac-Toe',
    description: 'Score a winning row vs the AI or friend',
    xp: 25,
    done: false,
    icon: '❌⭕',
  },
  {
    id: 'pomo_focus',
    title: 'Start a Pomodoro Sprint',
    description: 'Activate the focus clock countdown',
    xp: 20,
    done: false,
    icon: '⏱️',
  },
  {
    id: 'lamp_toggle',
    title: 'Toggle Cozy Desk Lamp',
    description: 'Cycle ambient lighting warmth',
    xp: 20,
    done: false,
    icon: '💡',
  },
  {
    id: 'play_lofi',
    title: 'Spin Lo-Fi Beat Cassette',
    description: 'Listen to warm generative chords',
    xp: 25,
    done: false,
    icon: '📻',
  },
  {
    id: 'water_succulent',
    title: 'Hydrate the Desk Plant',
    description: 'Sprinkle water on the growing succulent',
    xp: 25,
    done: false,
    icon: '🌱',
  },
  {
    id: 'feed_pet',
    title: 'Feed or Cuddle Pixel Pet',
    description: 'Interact with your Tamagotchi friend',
    xp: 25,
    done: false,
    icon: '👾',
  },
  {
    id: 'sip_coffee',
    title: 'Sip Steaming Coffee',
    description: 'Enjoy a warm sip or fresh refill',
    xp: 15,
    done: false,
    icon: '☕',
  },
  {
    id: 'pin_corkboard',
    title: 'Pin a Note on Corkboard',
    description: 'Leave a memo on the community wall',
    xp: 20,
    done: false,
    icon: '📌',
  },
];

const INITIAL_CORKBOARD_NOTES: CorkboardNote[] = [
  {
    id: 'pol-rainy-window',
    name: 'Rainy Day Reverie',
    emoji: '🌧️',
    color: '#fdfbf7',
    fontClass: 'font-hand',
    message: 'Warm amber glow and gentle rain on the cedar sill.',
    createdAt: Date.now() - 4800000,
    reactions: { heart: 28, coffee: 19, star: 24, fire: 7 },
    isPolaroid: true,
    polaroidTitle: 'Rainy Window',
    polaroidPhoto: '🌧️',
    polaroidGradient: 'from-slate-700 via-sky-900 to-indigo-950',
    polaroidDate: 'OCT 2026',
    washiTapeColor: 'rgba(186, 230, 253, 0.85)',
    category: 'polaroid',
    x: 1820,
    y: 1140,
  },
  {
    id: 'pol-croissant-cat',
    name: 'Pixel Sanctuary',
    emoji: '🐾',
    color: '#fdfbf7',
    fontClass: 'font-hand',
    message: 'Curled like a warm croissant beside the keyboard.',
    createdAt: Date.now() - 3600000,
    reactions: { heart: 35, coffee: 14, star: 31, fire: 18 },
    isPolaroid: true,
    polaroidTitle: 'Croissant Nap',
    polaroidPhoto: '🐾',
    polaroidGradient: 'from-amber-700 via-orange-900 to-stone-900',
    polaroidDate: 'SUNDAY',
    washiTapeColor: 'rgba(254, 215, 170, 0.85)',
    category: 'polaroid',
    x: 2110,
    y: 1150,
  },
  {
    id: 'note-welcome',
    name: 'CozyDesk Bot',
    emoji: '☕',
    color: '#fef08a',
    fontClass: 'font-hand',
    message: 'Welcome to your cozy sanctuary! Play Tic-Tac-Toe, turn on Lo-Fi beats, and customize your desk.',
    createdAt: Date.now() - 2800000,
    reactions: { heart: 9, coffee: 6, star: 14, fire: 4 },
  },
  {
    id: 'note-sky',
    name: 'Starlight',
    emoji: '🌙',
    color: '#bae6fd',
    fontClass: 'font-hand-alt',
    message: 'Clicking the night window to cycle through Aurora Borealis and Twilight Dusk is pure bliss while studying!',
    createdAt: Date.now() - 1900000,
    reactions: { heart: 16, coffee: 4, star: 11, fire: 8 },
  },
  {
    id: 'note-strategy',
    name: 'RetroChampion',
    emoji: '🎮',
    color: '#fbcfe8',
    fontClass: 'font-pixel',
    message: 'TACTIC: Always seize the center cell in Tic-Tac-Toe to force the AI into defense mode!',
    createdAt: Date.now() - 1100000,
    reactions: { heart: 7, coffee: 3, star: 18, fire: 12 },
  },
];

const INITIAL_STICKY_NOTES: StickyNoteData[] = [
  {
    id: 'sticky-1',
    title: 'Pinned Memo',
    content: '✨ Hydrate with water, take 3 deep breaths, and relax your shoulders.',
    color: '#fef08a',
    fontClass: 'font-hand',
    rotation: -2,
    isChecklist: false,
    pinnedToDesk: true,
  },
  {
    id: 'sticky-2',
    title: "Today's Focus",
    content: 'Win 1 match of Tic-Tac-Toe vs AI\nDrink warm coffee\nListen to Lo-Fi chords',
    color: '#bbf7d0',
    fontClass: 'font-hand',
    rotation: 2,
    isChecklist: true,
    pinnedToDesk: false,
  },
];

export default function App() {
  const deskCanvasRef = useRef<HTMLDivElement | null>(null);

  // Ambience State
  const [skyMode, setSkyMode] = useState<SkyMode>('midnight');
  const [lampLighting, setLampLighting] = useState<LampLighting>('warm');
  const [lampFlickerClass, setLampFlickerClass] = useState<string>('');
  const prevLampRef = useRef<LampLighting>(lampLighting);
  const [isNightTheme, setIsNightTheme] = useState(true);
  const [isRainActive, setIsRainActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [isCorkboardOpen, setIsCorkboardOpen] = useState(false);
  const [isExpandedStudioOpen, setIsExpandedStudioOpen] = useState(false);

  // Onboarding & Spotlight Tour State
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    try {
      return localStorage.getItem('has_seen_cozydesk_tour') === 'true';
    } catch {
      return false;
    }
  });
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('has_seen_cozydesk_tour') !== 'true';
    } catch {
      return false;
    }
  });
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  // Beginner's "First Steps" Checklist State
  const [starterSteps, setStarterSteps] = useState<StarterStepsState>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_starter_steps_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      play_lofi: false,
      drink_coffee: false,
      tictactoe_move: false,
      expanded_board_note: false,
    };
  });

  const [hasAwardedStarterXp, setHasAwardedStarterXp] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cozydesk_starter_awarded_v1') === 'true';
    } catch {
      return false;
    }
  });

  const updateStarterStep = useCallback((key: keyof StarterStepsState) => {
    setStarterSteps((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem('cozydesk_starter_steps_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlightedStickyId, setHighlightedStickyId] = useState<string | null>(null);

  // Quests & XP
  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_quests_v2');
      return saved ? JSON.parse(saved) : INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  const [currentXp, setCurrentXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_xp_v2');
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  const maxXp = 175;

  // Award +50 XP and celebratory fanfare upon completing all 4 starter steps
  useEffect(() => {
    const allDone = Object.values(starterSteps).every(Boolean);
    if (allDone && !hasAwardedStarterXp) {
      setHasAwardedStarterXp(true);
      try {
        localStorage.setItem('cozydesk_starter_awarded_v1', 'true');
      } catch {}
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
      });
      playWinFanfare();
      setCurrentXp((prev) => prev + 50);
      setToastMessage('🎉 Starter Quest Complete! +50 Starter XP Awarded! 🌟');
    }
  }, [starterSteps, hasAwardedStarterXp]);

  // Corkboard Notes
  const [corkNotes, setCorkNotes] = useState<CorkboardNote[]>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_corkboard_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasPolaroid = parsed.some((n: CorkboardNote) => n.isPolaroid);
          if (!hasPolaroid) {
            return [...INITIAL_CORKBOARD_NOTES.filter((n) => n.isPolaroid), ...parsed];
          }
          return parsed;
        }
      }
      return INITIAL_CORKBOARD_NOTES;
    } catch {
      return INITIAL_CORKBOARD_NOTES;
    }
  });

  // Sticky Notes
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_stickies_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((n: StickyNoteData) => {
            if (n.id === 'sticky-1' && n.pinnedToDesk === undefined) {
              return { ...n, pinnedToDesk: true };
            }
            return n;
          });
        }
      }
      return INITIAL_STICKY_NOTES;
    } catch {
      return INITIAL_STICKY_NOTES;
    }
  });

  // Widget Positions
  const [positions, setPositions] = useState<Record<string, WidgetPosition>>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_positions_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultPositions();
  });

  function getDefaultPositions(): Record<string, WidgetPosition> {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile) {
      return {
        'widget-tictactoe': { id: 'widget-tictactoe', x: 10, y: 10, zIndex: 10 },
        'widget-pomodoro': { id: 'widget-pomodoro', x: 10, y: 340, zIndex: 11 },
        'widget-lamp': { id: 'widget-lamp', x: 190, y: 220, zIndex: 12 },
        'widget-boombox': { id: 'widget-boombox', x: 10, y: 560, zIndex: 13 },
        'widget-plant': { id: 'widget-plant', x: 10, y: 240, zIndex: 14 },
        'widget-pet': { id: 'widget-pet', x: 190, y: 390, zIndex: 15 },
        'widget-coffee': { id: 'widget-coffee', x: 190, y: 110, zIndex: 16 },
        'widget-sticky-1': { id: 'widget-sticky-1', x: 10, y: 730, zIndex: 17 },
        'widget-sticky-2': { id: 'widget-sticky-2', x: 10, y: 920, zIndex: 18 },
      };
    }
    return {
      'widget-tictactoe': { id: 'widget-tictactoe', x: 24, y: 20, zIndex: 10 },
      'widget-pomodoro': { id: 'widget-pomodoro', x: 305, y: 20, zIndex: 11 },
      'widget-lamp': { id: 'widget-lamp', x: 535, y: 20, zIndex: 12 },
      'widget-boombox': { id: 'widget-boombox', x: 24, y: 315, zIndex: 13 },
      'widget-plant': { id: 'widget-plant', x: 255, y: 180, zIndex: 14 },
      'widget-pet': { id: 'widget-pet', x: 375, y: 180, zIndex: 15 },
      'widget-coffee': { id: 'widget-coffee', x: 540, y: 235, zIndex: 16 },
      'widget-sticky-1': { id: 'widget-sticky-1', x: 300, y: 330, zIndex: 17 },
      'widget-sticky-2': { id: 'widget-sticky-2', x: 610, y: 320, zIndex: 18 },
    };
  }

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('cozydesk_quests_v2', JSON.stringify(quests));
      localStorage.setItem('cozydesk_xp_v2', JSON.stringify(currentXp));
    } catch {}
  }, [quests, currentXp]);

  useEffect(() => {
    try {
      localStorage.setItem('cozydesk_corkboard_v2', JSON.stringify(corkNotes));
    } catch {}
  }, [corkNotes]);

  useEffect(() => {
    try {
      localStorage.setItem('cozydesk_stickies_v2', JSON.stringify(stickyNotes));
    } catch {}
  }, [stickyNotes]);

  useEffect(() => {
    try {
      localStorage.setItem('cozydesk_positions_v2', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Synchronize retro incandescent lightbulb flicker with ambient room glow
  useEffect(() => {
    if (prevLampRef.current !== lampLighting) {
      const isOff = lampLighting === 'off';
      const animCls = isOff ? 'animate-retro-flicker-off' : 'animate-retro-flicker-on';
      setLampFlickerClass(animCls);
      const timer = setTimeout(() => {
        setLampFlickerClass('');
      }, isOff ? 480 : 680);
      prevLampRef.current = lampLighting;
      return () => clearTimeout(timer);
    }
  }, [lampLighting]);

  // Desk Scale (Zoom In / Zoom Out on Desk Workspace)
  const [deskScale, setDeskScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_zoom_v1');
      return saved ? Math.min(1.4, Math.max(0.65, Number(saved))) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const deskScaleRef = useRef<number>(deskScale);
  useEffect(() => {
    deskScaleRef.current = deskScale;
  }, [deskScale]);

  const handleZoomInDesk = useCallback(() => {
    setDeskScale((prev) => {
      const next = Math.min(1.4, +(prev + 0.1).toFixed(2));
      try {
        localStorage.setItem('cozydesk_zoom_v1', String(next));
      } catch {}
      playMechanicalClick('subtle', 0.05);
      showToast(`Desk Zoom: ${Math.round(next * 100)}% 🔍`);
      return next;
    });
  }, []);

  const handleZoomOutDesk = useCallback(() => {
    setDeskScale((prev) => {
      const next = Math.max(0.65, +(prev - 0.1).toFixed(2));
      try {
        localStorage.setItem('cozydesk_zoom_v1', String(next));
      } catch {}
      playMechanicalClick('subtle', 0.05);
      showToast(`Desk Zoom: ${Math.round(next * 100)}% 🔍`);
      return next;
    });
  }, []);

  const handleResetDeskZoom = useCallback(() => {
    setDeskScale(1.0);
    try {
      localStorage.setItem('cozydesk_zoom_v1', '1.0');
    } catch {}
    playMechanicalClick('toggle', 0.06);
    showToast('Desk Zoom: 100% 🔍');
  }, []);

  // Keyboard Shortcuts: 'F' toggles Expanded Corkboard Studio, 'Esc' closes it or active modal, +/-/0 for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === 'Escape') {
        if (isExpandedStudioOpen) {
          setIsExpandedStudioOpen(false);
          playMechanicalClick('toggle', 0.08);
          return;
        }
        if (isCorkboardOpen) {
          setIsCorkboardOpen(false);
          return;
        }
        if (isQuestsOpen) {
          setIsQuestsOpen(false);
          return;
        }
        if (isZenMode) {
          setIsZenMode(false);
          return;
        }
      }

      if (!isInput && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsExpandedStudioOpen((prev) => {
          const next = !prev;
          if (next) {
            playPinTackSound(0.09);
            setIsCorkboardOpen(false);
          } else {
            playMechanicalClick('toggle', 0.08);
          }
          return next;
        });
        return;
      }

      // Quick spawn sticky note shortcut (N)
      if (!isInput && (e.key === 'n' || e.key === 'N') && !isExpandedStudioOpen && !isCorkboardOpen && !isQuestsOpen) {
        e.preventDefault();
        handleSpawnSticky();
        return;
      }

      // Desk Zoom shortcuts when no modal is open
      if (!isInput && !isExpandedStudioOpen && !isCorkboardOpen && !isQuestsOpen) {
        if (
          e.key === '+' ||
          e.key === '=' ||
          ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+'))
        ) {
          e.preventDefault();
          handleZoomInDesk();
        } else if (
          e.key === '-' ||
          e.key === '_' ||
          ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_'))
        ) {
          e.preventDefault();
          handleZoomOutDesk();
        } else if (
          e.key === '0' ||
          ((e.ctrlKey || e.metaKey) && e.key === '0')
        ) {
          e.preventDefault();
          handleResetDeskZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isExpandedStudioOpen,
    isCorkboardOpen,
    isQuestsOpen,
    isZenMode,
    handleZoomInDesk,
    handleZoomOutDesk,
    handleResetDeskZoom,
  ]);

  // Unlock Web Audio API context on first user gesture for instant hover sounds
  useEffect(() => {
    const handleGesture = () => {
      getAudioContext();
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('mousemove', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('mousemove', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  const completeQuest = (questId: string) => {
    if (questId === 'play_lofi') {
      updateStarterStep('play_lofi');
    } else if (questId === 'sip_coffee') {
      updateStarterStep('drink_coffee');
    }

    setQuests((prev) => {
      const target = prev.find((q) => q.id === questId);
      if (target && !target.done) {
        const updated = prev.map((q) => (q.id === questId ? { ...q, done: true } : q));
        setCurrentXp((xp) => xp + target.xp);
        playWinFanfare();
        showToast(`Quest Complete: ${target.title} (+${target.xp} XP!) 🎉`);
        return updated;
      }
      return prev;
    });
  };

  // Drag & Drop Engine with Boundary Clamping
  const activeDrag = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    pointerId: number;
  } | null>(null);

  const handlePointerDown = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    // Bring clicked widget or sticky note to front if not already topmost
    const currentPos = positions[id] || { id, x: 20, y: 20, zIndex: 10 };
    const validZIndices = Object.values(positions).map((p) =>
      typeof p?.zIndex === 'number' && !isNaN(p.zIndex) ? p.zIndex : 10
    );
    const highestZ = Math.max(20, ...validZIndices);
    if ((currentPos.zIndex || 0) < highestZ) {
      setPositions((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || currentPos), zIndex: highestZ + 1 },
      }));
    }

    // Avoid dragging when typing or clicking buttons/selects/interactive controls
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('select') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-no-drag]')
    ) {
      return;
    }

    // If note is pinned to desk, prevent dragging and provide tactile feedback
    if (id.startsWith('widget-sticky-')) {
      const stickyId = id.replace('widget-', '');
      const targetNote = stickyNotes.find((n) => n.id === stickyId);
      if (targetNote?.pinnedToDesk) {
        playPinTackSound(0.08);
        showToast('📌 Note is pinned to the desk! Click the pushpin to unpin and drag.');
        return;
      }
    }

    activeDrag.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentPos.x,
      origY: currentPos.y,
      pointerId: e.pointerId,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
    playItemPickupSound(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDrag.current) return;
    const { id, startX, startY, origX, origY } = activeDrag.current;
    const currentScale = deskScaleRef.current || 1.0;
    const dx = (e.clientX - startX) / currentScale;
    const dy = (e.clientY - startY) / currentScale;

    // Subtle tactile felt desk mat sliding friction feedback
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      playDeskSlideSound(0.025);
    }

    const canvas = deskCanvasRef.current;
    const maxW = canvas ? (canvas.clientWidth / currentScale) - 100 : 800;
    const maxH = canvas ? (canvas.clientHeight / currentScale) - 80 : 600;

    const newX = Math.max(0, Math.min(origX + dx, maxW));
    const newY = Math.max(0, Math.min(origY + dy, maxH));

    setPositions((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { id, zIndex: 10 }),
        x: newX,
        y: newY,
      },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeDrag.current) {
      const draggedId = activeDrag.current.id;
      try {
        e.currentTarget.releasePointerCapture(activeDrag.current.pointerId);
      } catch {}
      activeDrag.current = null;
      // Play satisfying tactile settling sound based on widget material (paper, ceramic, clay, brass)
      playItemDropSound(draggedId);
    }
  };

  const handleWidgetHover = (widgetId: string) => {
    if (activeDrag.current) return;
    playWidgetHoverSound(widgetId);
  };

  // Ambience Controls
  const handleCycleSky = () => {
    const modes: SkyMode[] = ['midnight', 'twilight', 'aurora', 'rainy'];
    const nextMode = modes[(modes.indexOf(skyMode) + 1) % modes.length];
    setSkyMode(nextMode);
    playMechanicalClick('toggle', 0.08);
    if (nextMode === 'rainy') {
      setIsRainActive(true);
      toggleAmbientRain(true);
      showToast('Rainy Night & Window Drops 🌧️');
    } else {
      showToast(`Sky: ${nextMode.toUpperCase()} 🌌`);
    }
  };

  const handleCycleLighting = () => {
    const lights: LampLighting[] = ['warm', 'ember', 'neon', 'lavender', 'off'];
    const nextLight = lights[(lights.indexOf(lampLighting) + 1) % lights.length];
    setLampLighting(nextLight);
    completeQuest('lamp_toggle');
    showToast(`Desk Lamp: ${nextLight === 'off' ? 'OFF' : nextLight.toUpperCase()} 💡`);
  };

  const handleSetLighting = (light: LampLighting) => {
    setLampLighting(light);
    completeQuest('lamp_toggle');
    showToast(`Desk Lamp: ${light === 'off' ? 'OFF' : light.toUpperCase()} 💡`);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
    showToast(nextMuted ? 'Sound Muted 🔇' : 'Sound Enabled 🔊');
  };

  const handleToggleRain = () => {
    const nextRain = !isRainActive;
    setIsRainActive(nextRain);
    toggleAmbientRain(nextRain);
    if (nextRain) setSkyMode('rainy');
    showToast(nextRain ? 'Soft Rain Sound: ON 🌧️' : 'Rain Sound: OFF');
  };

  const handleToggleDayNight = () => {
    const next = !isNightTheme;
    setIsNightTheme(next);
    showToast(next ? 'Cozy Midnight Mode 🌙' : 'Warm Daylight Mode ☀️');
    playMechanicalClick('switch', 0.08);
  };

  // Sticky Management
  const handleSpawnSticky = () => {
    const id = `sticky-dyn-${Date.now()}`;
    const colors = ['#fef08a', '#bbf7d0', '#fbcfe8', '#fed7aa', '#bae6fd', '#e9d5ff'];
    const pickColor = colors[stickyNotes.length % colors.length];

    const newSticky: StickyNoteData = {
      id,
      title: `Memo #${stickyNotes.length + 1}`,
      content: '',
      color: pickColor,
      fontClass: 'font-hand',
      rotation: Math.random() * 6 - 3,
      isChecklist: false,
    };

    setStickyNotes((prev) => [...prev, newSticky]);

    // Position new note in an open, visible area of the desk canvas
    const canvas = deskCanvasRef.current;
    const currentScale = deskScaleRef.current || 1.0;
    const scrollX = canvas ? canvas.scrollLeft / currentScale : 0;
    const scrollY = canvas ? canvas.scrollTop / currentScale : 0;
    const viewW = canvas ? canvas.clientWidth / currentScale : 800;
    const viewH = canvas ? canvas.clientHeight / currentScale : 600;

    // Center in the visible desk viewport or open desk zone, fanning out nicely
    const count = stickyNotes.length;
    const baseCenterX = Math.max(40, scrollX + (viewW * 0.45) - 110);
    const baseCenterY = Math.max(40, scrollY + (viewH * 0.45) - 90);
    const fanOffsetX = ((count * 36) % 216) - 72;
    const fanOffsetY = ((count * 32) % 160) - 50;

    const x = Math.round(baseCenterX + fanOffsetX);
    const y = Math.round(baseCenterY + fanOffsetY);

    const validZIndices = Object.values(positions).map((p) =>
      typeof p?.zIndex === 'number' && !isNaN(p.zIndex) ? p.zIndex : 10
    );
    const maxZ = Math.max(20, ...validZIndices) + 1;

    setPositions((prev) => ({
      ...prev,
      [`widget-${id}`]: { id: `widget-${id}`, x, y, zIndex: maxZ },
    }));

    setHighlightedStickyId(id);
    setTimeout(() => {
      setHighlightedStickyId((cur) => (cur === id ? null : cur));
    }, 2400);

    playPaperRustleSound('lift', 0.12);
    showToast(`New Draggable Sticky Note #${count + 1} added! 📝`);
  };

  const handleUpdateSticky = (updated: StickyNoteData) => {
    setStickyNotes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSticky = (id: string) => {
    setStickyNotes((prev) => prev.filter((s) => s.id !== id));
    setPositions((prev) => {
      const copy = { ...prev };
      delete copy[`widget-${id}`];
      return copy;
    });
    playPaperRustleSound('drop', 0.09);
    showToast('Sticky Note removed');
  };

  const handlePinToCorkboard = (note: StickyNoteData) => {
    const corkNote: CorkboardNote = {
      id: `cork-${Date.now()}`,
      name: note.title || 'Desk Memo',
      message: note.content,
      color: note.color,
      fontClass: note.fontClass,
      emoji: '📌',
      createdAt: Date.now(),
      reactions: { heart: 1, coffee: 0, star: 1, fire: 0 },
    };

    setCorkNotes((prev) => [corkNote, ...prev]);
    completeQuest('pin_corkboard');
    updateStarterStep('expanded_board_note');
    setIsCorkboardOpen(true);
    playPinTackSound(0.09);
    showToast('Desk note pinned to Bulletin Corkboard! 📌');
  };

  // Corkboard Note Adding
  const handleAddCorkNote = (data: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => {
    const newNote: CorkboardNote = {
      id: `cork-${Date.now()}`,
      ...data,
      createdAt: Date.now(),
      reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
    };
    setCorkNotes((prev) => [newNote, ...prev]);
    completeQuest('pin_corkboard');
    updateStarterStep('expanded_board_note');
    playPinTackSound(0.09);
    showToast('Your note was pinned to the bulletin board! 📌');
  };

  const handleReactCorkNote = (
    noteId: string,
    type: 'heart' | 'coffee' | 'star' | 'fire'
  ) => {
    playStampSound(0.09);
    setCorkNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            reactions: {
              ...n.reactions,
              [type]: n.reactions[type] + 1,
            },
          };
        }
        return n;
      })
    );
  };

  const handleUpdateCorkNotePosition = (id: string, x: number, y: number) => {
    setCorkNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
  };

  const handleResetLayout = () => {
    const defaults = getDefaultPositions();
    // Neatly arrange existing custom or extra sticky notes in the desk notes zone
    stickyNotes.forEach((note, index) => {
      const widgetKey = `widget-${note.id}`;
      if (!defaults[widgetKey]) {
        defaults[widgetKey] = {
          id: widgetKey,
          x: 300 + ((index % 3) * 270),
          y: 330 + Math.floor(index / 3) * 220,
          zIndex: 17 + index,
        };
      }
    });
    setPositions(defaults);
    playWoodThudSound(140, 0.08);
    setTimeout(() => playPaperRustleSound('flutter', 0.07), 60);
    showToast('Desk items rearranged to default positions! 🧹');
  };

  // Ambient Lighting Gradient computation
  const getAmbientOverlayStyle = () => {
    const lampPos = positions['widget-lamp'] || { x: 535, y: 20 };
    const cx = Math.max(60, lampPos.x + 40);
    const cy = Math.max(60, lampPos.y + 40);

    if (!isNightTheme) {
      if (lampLighting !== 'off') {
        return {
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255, 240, 180, 0.42) 0%, rgba(255, 215, 140, 0.15) 35%, rgba(15, 23, 42, 0.22) 100%)`,
        };
      }
      return {
        background:
          'radial-gradient(circle at 50% 30%, rgba(255, 245, 215, 0.35) 0%, rgba(200, 230, 255, 0.10) 60%, rgba(15, 23, 42, 0.22) 100%)',
      };
    }

    switch (lampLighting) {
      case 'warm':
        return {
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255, 235, 140, 0.40) 0%, rgba(251, 191, 36, 0.18) 35%, rgba(180, 100, 20, 0.08) 60%, rgba(10, 12, 20, 0.70) 100%)`,
        };
      case 'ember':
        return {
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255, 150, 60, 0.45) 0%, rgba(249, 115, 22, 0.22) 35%, rgba(180, 60, 10, 0.08) 60%, rgba(10, 12, 20, 0.70) 100%)`,
        };
      case 'neon':
        return {
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(56, 189, 248, 0.38) 0%, rgba(14, 165, 233, 0.20) 35%, rgba(3, 105, 161, 0.08) 60%, rgba(10, 12, 20, 0.72) 100%)`,
        };
      case 'lavender':
        return {
          background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(216, 180, 254, 0.40) 0%, rgba(168, 85, 247, 0.20) 35%, rgba(107, 33, 168, 0.08) 60%, rgba(10, 12, 20, 0.70) 100%)`,
        };
      case 'off':
      default:
        return {
          background:
            'radial-gradient(circle at 50% 50%, rgba(12, 16, 28, 0.65) 0%, rgba(4, 6, 14, 0.90) 100%)',
        };
    }
  };

  const questsDoneCount = quests.filter((q) => q.done).length;

  return (
    <div className="font-sans text-slate-100 flex flex-col justify-between h-screen w-screen relative overflow-hidden bg-[#0d0f17]">
      {/* Ambient Lighting Overlay with Retro Bulb Startup / Shutdown Flicker */}
      <div
        key={`ambient-glow-${lampLighting}-${lampFlickerClass ? 'flicker' : 'static'}`}
        style={getAmbientOverlayStyle()}
        className={`fixed inset-0 pointer-events-none transition-all duration-300 z-[25] ${lampFlickerClass}`}
      />

      {/* Header */}
      {!isZenMode && (
        <DeskHeader
          currentXp={currentXp}
          maxXp={maxXp}
          questsDoneCount={questsDoneCount}
          totalQuests={quests.length}
          corkNotesCount={corkNotes.length}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenQuests={() => {
            playChime(440, 'sine', 0.08);
            setIsQuestsOpen(true);
          }}
          onOpenTour={() => {
            playMechanicalClick('toggle', 0.08);
            setIsTourActive(true);
          }}
          onOpenCorkboard={() => {
            playChime(500, 'sine', 0.08);
            setIsCorkboardOpen(true);
          }}
          onOpenExpandedStudio={() => {
            playPinTackSound(0.09);
            setIsExpandedStudioOpen(true);
          }}
          lampLighting={lampLighting}
          onCycleLighting={handleCycleLighting}
        />
      )}

      {/* Main Desk Workspace Canvas */}
      <main
        ref={deskCanvasRef}
        className="relative flex-1 w-full h-full desk-pattern overflow-auto select-none"
      >
        {/* Desk Surface Wood Rim (Background bottom desk mat edge) */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#120d0b] via-[#18110f]/80 to-transparent pointer-events-none z-0" />

        {/* Scaled Workspace Gadget Surface */}
        <div
          style={{
            transform: deskScale !== 1 ? `scale(${deskScale})` : undefined,
            transformOrigin: 'top left',
            width: deskScale !== 1 ? `${(100 / deskScale).toFixed(2)}%` : '100%',
            height: deskScale !== 1 ? `${(100 / deskScale).toFixed(2)}%` : '100%',
          }}
          className="relative z-10 w-full h-full will-change-transform"
        >
          {/* Celestial Sky Window on Wall */}
          <div onMouseEnter={() => handleWidgetHover('widget-sky')}>
            <CelestialSky mode={skyMode} onCycleMode={handleCycleSky} />
          </div>

        {/* GADGET 1: Tic-Tac-Toe Arcade Widget */}
        <div
          id="widget-tictactoe"
          style={{
            left: `${positions['widget-tictactoe']?.x ?? 24}px`,
            top: `${positions['widget-tictactoe']?.y ?? 20}px`,
            zIndex: positions['widget-tictactoe']?.zIndex ?? 10,
          }}
          onPointerDown={(e) => handlePointerDown('widget-tictactoe', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-tictactoe')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <TicTacToeWidget
            onWinQuest={() => completeQuest('play_tictactoe')}
            onPlayerMove={() => updateStarterStep('tictactoe_move')}
          />
        </div>

        {/* GADGET 2: Focus Clock / Pomodoro Widget */}
        <div
          id="widget-pomodoro"
          style={{
            left: `${positions['widget-pomodoro']?.x ?? 305}px`,
            top: `${positions['widget-pomodoro']?.y ?? 20}px`,
            zIndex: positions['widget-pomodoro']?.zIndex ?? 11,
          }}
          onPointerDown={(e) => handlePointerDown('widget-pomodoro', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-pomodoro')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <PomodoroWidget onSprintComplete={() => completeQuest('pomo_focus')} />
        </div>

        {/* GADGET 3: Desk Lamp Widget */}
        <div
          id="widget-lamp"
          style={{
            left: `${positions['widget-lamp']?.x ?? 535}px`,
            top: `${positions['widget-lamp']?.y ?? 20}px`,
            zIndex: positions['widget-lamp']?.zIndex ?? 12,
          }}
          onPointerDown={(e) => handlePointerDown('widget-lamp', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-lamp')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <DeskLampWidget
            lighting={lampLighting}
            onCycleLighting={handleCycleLighting}
            onSetLighting={handleSetLighting}
            onLampQuest={() => completeQuest('lamp_toggle')}
          />
        </div>

        {/* GADGET 4: Lo-Fi Radio Boombox */}
        <div
          id="widget-boombox"
          style={{
            left: `${positions['widget-boombox']?.x ?? 24}px`,
            top: `${positions['widget-boombox']?.y ?? 315}px`,
            zIndex: positions['widget-boombox']?.zIndex ?? 13,
          }}
          onPointerDown={(e) => handlePointerDown('widget-boombox', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-boombox')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <LoFiRadioWidget onPlayQuest={() => completeQuest('play_lofi')} />
        </div>

        {/* GADGET 5: Waterable Desk Succulent */}
        <div
          id="widget-plant"
          style={{
            left: `${positions['widget-plant']?.x ?? 255}px`,
            top: `${positions['widget-plant']?.y ?? 180}px`,
            zIndex: positions['widget-plant']?.zIndex ?? 14,
          }}
          onPointerDown={(e) => handlePointerDown('widget-plant', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-plant')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <PlantWidget onWaterQuest={() => completeQuest('water_succulent')} />
        </div>

        {/* GADGET 6: Pixel Pet Tamagotchi */}
        <div
          id="widget-pet"
          style={{
            left: `${positions['widget-pet']?.x ?? 375}px`,
            top: `${positions['widget-pet']?.y ?? 180}px`,
            zIndex: positions['widget-pet']?.zIndex ?? 15,
          }}
          onPointerDown={(e) => handlePointerDown('widget-pet', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-pet')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <PixelPetWidget onPetQuest={() => completeQuest('feed_pet')} />
        </div>

        {/* GADGET 7: Steaming Coffee Mug */}
        <div
          id="widget-coffee"
          style={{
            left: `${positions['widget-coffee']?.x ?? 540}px`,
            top: `${positions['widget-coffee']?.y ?? 235}px`,
            zIndex: positions['widget-coffee']?.zIndex ?? 16,
          }}
          onPointerDown={(e) => handlePointerDown('widget-coffee', e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => handleWidgetHover('widget-coffee')}
          className="absolute cursor-grab active:cursor-grabbing touch-none transition-shadow will-change-transform"
        >
          <CoffeeMugWidget onSipQuest={() => completeQuest('sip_coffee')} />
        </div>

        {/* GADGET 8+: Draggable Sticky Notes */}
        {stickyNotes.map((note) => {
          const widgetKey = `widget-${note.id}`;
          const currentPos = positions[widgetKey] || {
            id: widgetKey,
            x: 200,
            y: 340,
            zIndex: 17,
          };

          return (
            <div
              key={note.id}
              id={widgetKey}
              style={{
                left: `${currentPos.x}px`,
                top: `${currentPos.y}px`,
                zIndex: currentPos.zIndex,
              }}
              onPointerDown={(e) => handlePointerDown(widgetKey, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onMouseEnter={() => handleWidgetHover(widgetKey)}
              className={`absolute touch-none transition-shadow will-change-transform ${
                note.pinnedToDesk ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <StickyNoteWidget
                note={note}
                onUpdate={handleUpdateSticky}
                onDelete={handleDeleteSticky}
                onPinToCorkboard={handlePinToCorkboard}
                isHighlighted={highlightedStickyId === note.id}
              />
            </div>
          );
        })}
        </div>
      </main>

      {/* Footer Tools */}
      {!isZenMode && (
        <DeskFooter
          onSpawnSticky={handleSpawnSticky}
          onResetLayout={handleResetLayout}
          isNight={isNightTheme}
          onToggleDayNight={handleToggleDayNight}
          isRainActive={isRainActive}
          onToggleRain={handleToggleRain}
          isZenMode={isZenMode}
          onToggleZenMode={() => {
            setIsZenMode(!isZenMode);
            showToast(!isZenMode ? 'Zen Mode: Press ESC or tool to exit' : 'Zen Mode deactivated');
          }}
          onOpenExpandedStudio={() => {
            playPinTackSound(0.09);
            setIsExpandedStudioOpen(true);
          }}
          deskScale={deskScale}
          onZoomInDesk={handleZoomInDesk}
          onZoomOutDesk={handleZoomOutDesk}
          onResetDeskZoom={handleResetDeskZoom}
        />
      )}

      {/* Floating Zen Mode Re-entry Button (if in Zen Mode) */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-40 bg-slate-900/90 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-xs shadow-2xl backdrop-blur-md hover:bg-slate-800 transition active:scale-95 cursor-pointer"
        >
          Exit Zen Mode ✕
        </button>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-slate-900/95 text-emerald-300 border border-emerald-400/40 font-mono text-xs shadow-2xl backdrop-blur-md pointer-events-none transition-all flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Beginner's First Steps Checklist Card (Bottom Right Floating Widget) */}
      {!isZenMode && (
        <FirstStepsCard
          steps={starterSteps}
          isCompleted={Object.values(starterSteps).every(Boolean)}
          onOpenExpandedStudio={() => setIsExpandedStudioOpen(true)}
        />
      )}

      {/* Modals */}
      <QuestModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        currentXp={currentXp}
        maxXp={maxXp}
        starterSteps={starterSteps}
        isStarterCompleted={Object.values(starterSteps).every(Boolean)}
        onOpenTour={() => {
          setIsQuestsOpen(false);
          setIsTourActive(true);
        }}
      />

      <CorkboardModal
        isOpen={isCorkboardOpen}
        onClose={() => setIsCorkboardOpen(false)}
        notes={corkNotes}
        onAddNote={handleAddCorkNote}
        onReactNote={handleReactCorkNote}
        onOpenExpandedStudio={() => {
          playPinTackSound(0.09);
          setIsExpandedStudioOpen(true);
        }}
      />

      {/* Expanded Corkboard Studio (2800x2200 px Canvas) */}
      <ExpandedCorkboardStudio
        isOpen={isExpandedStudioOpen}
        onClose={() => setIsExpandedStudioOpen(false)}
        notes={corkNotes}
        onAddNote={handleAddCorkNote}
        onReactNote={handleReactCorkNote}
        onUpdateNotePosition={handleUpdateCorkNotePosition}
      />

      {/* Welcome Modal for First-Time Visitors */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onStartTour={() => {
          setIsWelcomeModalOpen(false);
          setIsTourActive(true);
        }}
        onDismiss={() => {
          setIsWelcomeModalOpen(false);
          setHasSeenTour(true);
          try {
            localStorage.setItem('has_seen_cozydesk_tour', 'true');
          } catch {}
        }}
      />

      {/* Interactive Spotlight Tour Walkthrough */}
      <SpotlightTour
        isOpen={isTourActive}
        onClose={() => {
          setIsTourActive(false);
          setHasSeenTour(true);
          try {
            localStorage.setItem('has_seen_cozydesk_tour', 'true');
          } catch {}
        }}
        onOpenExpandedStudio={() => setIsExpandedStudioOpen(true)}
      />
    </div>
  );
}
