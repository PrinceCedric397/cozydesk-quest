import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFirebase, getOrCreateGuestId } from './firebase/FirebaseContext';
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
import { LoadingSplashScreen } from './components/LoadingSplashScreen';
import { SignInToPostModal } from './components/SignInToPostModal';
import { User as FirebaseUser } from 'firebase/auth';
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
  startLoFi,
  toggleAmbientRain,
  playSoftHum,
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

const INITIAL_CORKBOARD_IDS = new Set(INITIAL_CORKBOARD_NOTES.map((n) => n.id));

const INITIAL_STICKY_NOTES: StickyNoteData[] = [
  {
    id: 'sticky-1',
    title: 'Self-Care Affirmations',
    content: '✨ Hydrate with cool water\n✨ Take 3 deep, grounding breaths\n✨ Drop and relax your shoulders\n✨ You are making great progress today!',
    color: '#fef08a',
    fontClass: 'font-hand',
    rotation: -1.5,
    isChecklist: false,
    pinnedToDesk: true,
  },
  {
    id: 'sticky-2',
    title: "Today's Task Checklist",
    content: 'Complete a 25m Focus Sprint\nWin 1 match of Pixel Tic-Tac-Toe\nSpin ambient Lo-Fi cassette beats\nTake a warm coffee & stretch break',
    color: '#bbf7d0',
    fontClass: 'font-hand',
    rotation: 1.5,
    isChecklist: true,
    checkedItems: [false, false, false, false],
    pinnedToDesk: true,
  },
];

export default function App() {
  const deskCanvasRef = useRef<HTMLDivElement | null>(null);

  // Firebase Context
  const {
    user,
    authError,
    clearAuthError,
    cloudCorkNotes,
    isCorkNotesLoadedFromCloud,
    addCorkNoteCloud,
    reactCorkNoteCloud,
    updateCorkNotePositionCloud,
    deleteCorkNoteCloud,
    saveUserProfileCloud,
    loadUserProfileCloud,
  } = useFirebase();

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
  const [isDeskPinAuthOpen, setIsDeskPinAuthOpen] = useState(false);
  const [pendingDeskPinNote, setPendingDeskPinNote] = useState<StickyNoteData | null>(null);

  // Onboarding & Spotlight Tour State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [hasSeenTour, setHasSeenTour] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('cozydesk_tour_completed') === 'true' ||
        localStorage.getItem('has_seen_cozydesk_tour') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const isTourActiveRef = useRef<boolean>(false);

  useEffect(() => {
    isTourActiveRef.current = isTourActive;
  }, [isTourActive]);

  // Beginner's "First Steps" Checklist State
  const [starterSteps, setStarterSteps] = useState<StarterStepsState>(() => {
    try {
      const savedV2 = localStorage.getItem('cozydesk_starter_steps_v2');
      if (savedV2) return JSON.parse(savedV2);

      const savedV1 = localStorage.getItem('cozydesk_starter_steps_v1');
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        // If only play_lofi was true from the initial splash entry bug and no other task done, clean it
        if (parsed.play_lofi && !parsed.drink_coffee && !parsed.tictactoe_move && !parsed.expanded_board_note) {
          parsed.play_lofi = false;
        }
        return parsed;
      }
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
    // In the tour, tasks and starter steps should not be automatically completed
    if (isTourActiveRef.current) return;

    setStarterSteps((prev) => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try {
        localStorage.setItem('cozydesk_starter_steps_v2', JSON.stringify(next));
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
      if (saved) {
        const parsed: Quest[] = JSON.parse(saved);
        // If only play_lofi was completed from the splash screen auto-complete bug, reset it
        const doneQuests = parsed.filter((q) => q.done);
        if (doneQuests.length === 1 && doneQuests[0].id === 'play_lofi') {
          return parsed.map((q) => (q.id === 'play_lofi' ? { ...q, done: false } : q));
        }
        return parsed;
      }
      return INITIAL_QUESTS;
    } catch {
      return INITIAL_QUESTS;
    }
  });

  const [currentXp, setCurrentXp] = useState<number>(() => {
    try {
      const savedQuests = localStorage.getItem('cozydesk_quests_v2');
      const savedXp = localStorage.getItem('cozydesk_xp_v2');
      if (savedQuests) {
        const parsed: Quest[] = JSON.parse(savedQuests);
        const doneQuests = parsed.filter((q) => q.done);
        if (doneQuests.length === 1 && doneQuests[0].id === 'play_lofi' && Number(savedXp) === 25) {
          return 0;
        }
      }
      return savedXp ? JSON.parse(savedXp) : 0;
    } catch {
      return 0;
    }
  });

  const maxXp = 225;

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

  // Grid Snapping Setting (16px grid or free-form drag)
  const [isGridSnapEnabled, setIsGridSnapEnabled] = useState<boolean>(true);

  // Sticky Notes
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_stickies_v3');
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
      // Migrate from v2 if available
      const oldSaved = localStorage.getItem('cozydesk_stickies_v2');
      if (oldSaved) {
        return INITIAL_STICKY_NOTES;
      }
    } catch {
      return INITIAL_STICKY_NOTES;
    }
    return INITIAL_STICKY_NOTES;
  });

  // Widget Positions
  const [positions, setPositions] = useState<Record<string, WidgetPosition>>(() => {
    try {
      const saved = localStorage.getItem('cozydesk_positions_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultPositions();
  });

  function getDefaultPositions(): Record<string, WidgetPosition> {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      return {
        'widget-sky': { id: 'widget-sky', x: 16, y: 16, zIndex: 10 },
        'widget-lamp': { id: 'widget-lamp', x: 16, y: 204, zIndex: 11 },
        'widget-pet': { id: 'widget-pet', x: 16, y: 448, zIndex: 12 },
        'widget-pomodoro': { id: 'widget-pomodoro', x: 16, y: 662, zIndex: 13 },
        'widget-tictactoe': { id: 'widget-tictactoe', x: 16, y: 906, zIndex: 14 },
        'widget-boombox': { id: 'widget-boombox', x: 16, y: 1260, zIndex: 15 },
        'widget-sticky-1': { id: 'widget-sticky-1', x: 16, y: 1574, zIndex: 16 },
        'widget-sticky-2': { id: 'widget-sticky-2', x: 16, y: 1808, zIndex: 17 },
        'widget-coffee': { id: 'widget-coffee', x: 16, y: 2062, zIndex: 18 },
        'widget-plant': { id: 'widget-plant', x: 16, y: 2276, zIndex: 19 },
      };
    }

    // 3-Column Balanced Desktop Grid (16px–24px clean gutters, zero overlap)
    // Left Column: Entertainment & Games (Pixel Tic-Tac-Toe top, Lo-Fi Synth below)
    // Center Column: Desk Ambience & Focus (Plant, Desk Lamp, Companion Pet, Focus Clock, Coffee Mug)
    // Right Column: Personal Organization & Sky View (Midnight Sky, Self-Care Affirmations, Task Checklist)
    return {
      'widget-tictactoe': { id: 'widget-tictactoe', x: 24, y: 20, zIndex: 10 },
      'widget-boombox': { id: 'widget-boombox', x: 24, y: 374, zIndex: 11 },
      'widget-plant': { id: 'widget-plant', x: 304, y: 180, zIndex: 12 },
      'widget-lamp': { id: 'widget-lamp', x: 480, y: 20, zIndex: 13 },
      'widget-pet': { id: 'widget-pet', x: 496, y: 264, zIndex: 14 },
      'widget-pomodoro': { id: 'widget-pomodoro', x: 480, y: 478, zIndex: 15 },
      'widget-coffee': { id: 'widget-coffee', x: 712, y: 180, zIndex: 16 },
      'widget-sky': { id: 'widget-sky', x: 940, y: 20, zIndex: 17 },
      'widget-sticky-1': { id: 'widget-sticky-1', x: 940, y: 204, zIndex: 18 },
      'widget-sticky-2': { id: 'widget-sticky-2', x: 940, y: 408, zIndex: 19 },
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
      localStorage.setItem('cozydesk_stickies_v3', JSON.stringify(stickyNotes));
    } catch {}
  }, [stickyNotes]);

  useEffect(() => {
    try {
      localStorage.setItem('cozydesk_positions_v3', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  // Corkboard notes to display: merges real-time Firebase cloud collection with local notes,
  // strictly eliminating all duplicates (by ID, signature, or legacy un-reconciled IDs)
  const displayCorkNotes = useMemo(() => {
    const cloudIds = new Set(cloudCorkNotes.map((n) => n.id));

    const localFiltered = corkNotes.filter((localNote) => {
      // If cloud notes exist, exclude static initial template seeds
      if (isCorkNotesLoadedFromCloud && cloudCorkNotes.length > 0 && INITIAL_CORKBOARD_IDS.has(localNote.id)) {
        return false;
      }
      // If exact ID exists in cloud, omit local copy
      if (cloudIds.has(localNote.id)) {
        return false;
      }
      // Fuzzy deduplication: if cloud has a note with identical author, message, and created within 60s
      const isAlreadyInCloud = cloudCorkNotes.some(
        (cn) =>
          cn.name.trim() === localNote.name.trim() &&
          cn.message.trim() === localNote.message.trim() &&
          Boolean(cn.isPolaroid) === Boolean(localNote.isPolaroid) &&
          Math.abs(cn.createdAt - localNote.createdAt) < 60000
      );
      if (isAlreadyInCloud) {
        return false;
      }
      return true;
    });

    const combined = isCorkNotesLoadedFromCloud && cloudCorkNotes.length > 0
      ? [...localFiltered, ...cloudCorkNotes]
      : corkNotes;

    // Final strict deduplication pass
    const seenIds = new Set<string>();
    const seenSignatures = new Set<string>();
    const result: CorkboardNote[] = [];

    for (const note of combined) {
      if (seenIds.has(note.id)) continue;

      const timeBucket = Math.round(note.createdAt / 15000);
      const sig = `${note.name.trim()}::${note.message.trim()}::${note.isPolaroid ? note.polaroidTitle || '' : ''}::${timeBucket}`;
      if (seenSignatures.has(sig)) continue;

      seenIds.add(note.id);
      seenSignatures.add(sig);
      result.push(note);
    }

    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [isCorkNotesLoadedFromCloud, cloudCorkNotes, corkNotes]);

  // Clean up any legacy or duplicate local notes in state/localStorage once cloud notes load
  useEffect(() => {
    if (!isCorkNotesLoadedFromCloud || cloudCorkNotes.length === 0) return;
    const cloudIds = new Set(cloudCorkNotes.map((n) => n.id));
    setCorkNotes((prev) => {
      const cleaned = prev.filter((localNote) => {
        if (cloudIds.has(localNote.id)) return false;
        const matchesCloud = cloudCorkNotes.some(
          (cn) =>
            cn.name.trim() === localNote.name.trim() &&
            cn.message.trim() === localNote.message.trim() &&
            Boolean(cn.isPolaroid) === Boolean(localNote.isPolaroid) &&
            Math.abs(cn.createdAt - localNote.createdAt) < 60000
        );
        return !matchesCloud;
      });
      if (cleaned.length !== prev.length) {
        return cleaned;
      }
      return prev;
    });
  }, [isCorkNotesLoadedFromCloud, cloudCorkNotes]);

  // Hydrate user profile from Firebase Firestore on sign-in
  useEffect(() => {
    if (!user) return;
    let active = true;
    loadUserProfileCloud(user.uid)
      .then((cloudProfile) => {
        if (!active || !cloudProfile) return;
        if (typeof cloudProfile.xp === 'number') setCurrentXp(cloudProfile.xp);
        if (Array.isArray(cloudProfile.quests) && cloudProfile.quests.length > 0) setQuests(cloudProfile.quests);
        if (cloudProfile.starterSteps) setStarterSteps(cloudProfile.starterSteps);
        if (Array.isArray(cloudProfile.stickyNotes) && cloudProfile.stickyNotes.length > 0) setStickyNotes(cloudProfile.stickyNotes);
        if (cloudProfile.positions) setPositions(cloudProfile.positions);
        if (cloudProfile.skyMode) setSkyMode(cloudProfile.skyMode);
        if (cloudProfile.lampLighting) setLampLighting(cloudProfile.lampLighting);
        if (!user.isAnonymous) {
          setToastMessage(`Welcome back, ${user.displayName || 'Cozy Explorer'}! Desk synced from Cloud ☁️`);
        }
      })
      .catch((err) => {
        console.warn('Notice loading cloud profile:', err);
      });
    return () => {
      active = false;
    };
  }, [user, loadUserProfileCloud]);

  // Toast for auth notices
  useEffect(() => {
    if (authError) {
      showToast(`⚠️ ${authError}`);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  // Sync state to Firebase Cloud when user is logged in
  useEffect(() => {
    if (!user) return;
    saveUserProfileCloud({
      xp: currentXp,
      quests,
      starterSteps,
      stickyNotes,
      positions,
      skyMode,
      lampLighting,
    }).catch((err) => {
      console.warn('Notice saving cloud profile:', err);
    });
  }, [user, currentXp, quests, starterSteps, stickyNotes, positions, skyMode, lampLighting, saveUserProfileCloud]);

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
            updateStarterStep('expanded_board_note');
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
    // In the tour, tasks and quests should not be automatically completed
    if (isTourActiveRef.current) return;

    if (questId === 'play_lofi') {
      updateStarterStep('play_lofi');
    } else if (questId === 'sip_coffee') {
      updateStarterStep('drink_coffee');
    } else if (questId === 'play_tictactoe') {
      updateStarterStep('tictactoe_move');
    } else if (questId === 'pin_corkboard') {
      updateStarterStep('expanded_board_note');
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

  const handleOpenExpandedStudio = () => {
    setIsExpandedStudioOpen(true);
    setIsCorkboardOpen(false);
    updateStarterStep('expanded_board_note');
    playPinTackSound(0.09);
  };

  const handleResetProgress = () => {
    setQuests(INITIAL_QUESTS);
    setStarterSteps({
      play_lofi: false,
      drink_coffee: false,
      tictactoe_move: false,
      expanded_board_note: false,
    });
    setHasAwardedStarterXp(false);
    setCurrentXp(0);
    try {
      localStorage.removeItem('cozydesk_starter_awarded_v1');
      localStorage.setItem(
        'cozydesk_starter_steps_v2',
        JSON.stringify({
          play_lofi: false,
          drink_coffee: false,
          tictactoe_move: false,
          expanded_board_note: false,
        })
      );
      localStorage.setItem('cozydesk_quests_v2', JSON.stringify(INITIAL_QUESTS));
      localStorage.setItem('cozydesk_xp_v2', '0');
    } catch {}
    playMechanicalClick('toggle', 0.08);
    showToast('Quests & First Steps reset to fresh state! 🌟');
  };

  const handleEnterWorkspace = useCallback(
    (options: {
      startAudio: boolean;
      audioChoice: 'lofi' | 'rain' | 'hum' | 'none';
      lofiTrackKey?: string;
    }) => {
      setShowSplash(false);

      if (options.startAudio) {
        if (options.audioChoice === 'lofi') {
          startLoFi(options.lofiTrackKey || 'tokyo');
          // Note: Do not auto-complete the task or quest on entry. The user must manually click play on the radio widget.
          showToast('📻 Lo-Fi beat synthesizer activated');
        } else if (options.audioChoice === 'rain') {
          setIsRainActive(true);
          toggleAmbientRain(true);
          showToast('🌧️ Gentle window rain started');
        } else if (options.audioChoice === 'hum') {
          playSoftHum('electronic', 3.5, 0.05);
          showToast('🕯️ Warm ambient desk hum activated');
        }
      }

      if (!hasSeenTour) {
        setTimeout(() => {
          setIsWelcomeModalOpen(true);
        }, 550);
      }
    },
    [hasSeenTour]
  );

  // Drag & Drop Engine with Boundary Clamping
  const activeDrag = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    pointerId: number;
  } | null>(null);

  // Ensure the actively clicked or touched widget or sticky note is brought strictly to the front
  const bringWidgetToFront = useCallback((id: string) => {
    setPositions((prev) => {
      const current = prev[id] || { id, x: 20, y: 20, zIndex: 10 };
      const allZ = Object.values(prev).map((p) =>
        typeof p?.zIndex === 'number' && !isNaN(p.zIndex) ? p.zIndex : 10
      );
      const highestZ = Math.max(10, ...allZ);
      const isTopmost =
        current.zIndex > 10 &&
        current.zIndex >= highestZ &&
        allZ.filter((z) => z === current.zIndex).length === 1;

      if (!isTopmost) {
        return {
          ...prev,
          [id]: { ...current, zIndex: highestZ + 1 },
        };
      }
      return prev;
    });
  }, []);

  const handlePointerDown = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    // Bring actively clicked/dragged widget to front immediately
    bringWidgetToFront(id);

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

    const currentPos = positions[id] || { id, x: 20, y: 20, zIndex: 10 };
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
    const maxW = canvas ? canvas.clientWidth / currentScale - 100 : 800;
    const maxH = canvas ? canvas.clientHeight / currentScale - 80 : 600;

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

      // Clean grid-snapping on drop if enabled (16px grid)
      if (isGridSnapEnabled) {
        setPositions((prev) => {
          const item = prev[draggedId];
          if (!item) return prev;
          const snappedX = Math.round(item.x / 16) * 16;
          const snappedY = Math.round(item.y / 16) * 16;
          if (snappedX === item.x && snappedY === item.y) return prev;
          return {
            ...prev,
            [draggedId]: {
              ...item,
              x: snappedX,
              y: snappedY,
            },
          };
        });
      }

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
      setIsRainActive(false);
      toggleAmbientRain(false);
      showToast(`Sky: ${nextMode.toUpperCase()} 🌌`);
    }
  };

  const handleSelectSky = (targetMode: SkyMode) => {
    setSkyMode(targetMode);
    playMechanicalClick('toggle', 0.08);
    if (targetMode === 'rainy') {
      setIsRainActive(true);
      toggleAmbientRain(true);
      showToast('Rainy Night & Window Drops 🌧️');
    } else {
      setIsRainActive(false);
      toggleAmbientRain(false);
      showToast(`Sky: ${targetMode.toUpperCase()} 🌌`);
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
    if (nextRain && skyMode !== 'rainy') {
      setSkyMode('rainy');
    }
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

  const handlePinToCorkboard = async (note: StickyNoteData) => {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestId = getOrCreateGuestId();
    const currentAuthorId = user?.uid || `guest_${guestId}`;
    const authorName = note.title || (user ? user.displayName || 'Desk Memo' : 'Desk Memo');

    const noteData = {
      name: authorName,
      message: note.content,
      color: note.color,
      fontClass: note.fontClass,
      emoji: '📌',
      category: 'memo' as const,
    };

    const newLocalNote: CorkboardNote = {
      id: noteId,
      authorId: currentAuthorId,
      createdAt: Date.now(),
      reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
      ...noteData,
    };

    setCorkNotes((prev) => [newLocalNote, ...prev.filter((n) => n.id !== noteId)]);
    completeQuest('pin_corkboard');
    updateStarterStep('expanded_board_note');
    setIsCorkboardOpen(true);
    playPinTackSound(0.09);

    try {
      await addCorkNoteCloud(noteData, noteId);
      showToast('Desk note pinned to Community Corkboard (Live in Cloud)! 📌☁️');
    } catch (err) {
      console.warn('Notice adding note to cloud:', err);
      showToast('Pinned to your desk corkboard! 📌');
    }
  };

  const handleDeskPinAuthSuccess = async (signedInUser: FirebaseUser) => {
    setIsDeskPinAuthOpen(false);
    if (pendingDeskPinNote) {
      const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const noteData = {
        name: pendingDeskPinNote.title || signedInUser.displayName || 'Desk Memo',
        message: pendingDeskPinNote.content,
        color: pendingDeskPinNote.color,
        fontClass: pendingDeskPinNote.fontClass,
        emoji: '📌',
        category: 'memo' as const,
      };

      const newLocalNote: CorkboardNote = {
        id: noteId,
        authorId: signedInUser.uid,
        createdAt: Date.now(),
        reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
        ...noteData,
      };

      setCorkNotes((prev) => [newLocalNote, ...prev.filter((n) => n.id !== noteId)]);
      completeQuest('pin_corkboard');
      updateStarterStep('expanded_board_note');
      setIsCorkboardOpen(true);
      playPinTackSound(0.09);

      try {
        await addCorkNoteCloud(noteData, noteId);
        showToast('Desk note pinned to Community Corkboard (Live in Cloud)! 📌☁️');
      } catch (err) {
        console.warn('Notice adding note to cloud after sign in:', err);
      }

      setPendingDeskPinNote(null);
    }
  };

  // Corkboard Note Adding
  const handleAddCorkNote = async (data: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => {
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const guestId = getOrCreateGuestId();
    const currentAuthorId = user?.uid || `guest_${guestId}`;

    const newLocalNote: CorkboardNote = {
      id: noteId,
      authorId: currentAuthorId,
      createdAt: Date.now(),
      reactions: { heart: 1, coffee: 0, star: 0, fire: 0 },
      ...data,
    };

    // Immediately persist to local corkboard state with the exact same canonical ID
    setCorkNotes((prev) => [newLocalNote, ...prev.filter((n) => n.id !== noteId)]);
    completeQuest('pin_corkboard');
    updateStarterStep('expanded_board_note');
    playPinTackSound(0.09);

    try {
      await addCorkNoteCloud(data, noteId);
      showToast(user ? 'Pinned to Community Corkboard (Live in Cloud)! 📌☁️' : 'Pinned & Synced to Community Corkboard! 📌☁️');
    } catch (err) {
      console.warn('Notice adding note to cloud, saved locally:', err);
      showToast('Pinned to your desk corkboard! 📌');
    }
  };

  const handleReactCorkNote = (
    noteId: string,
    type: 'heart' | 'coffee' | 'star' | 'fire'
  ) => {
    playStampSound(0.09);
    const isCloudNote = cloudCorkNotes.some((n) => n.id === noteId);
    if (isCloudNote) {
      reactCorkNoteCloud(noteId, type).catch((err) => {
        console.warn('Notice reacting in cloud:', err);
      });
    }

    setCorkNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            reactions: {
              ...n.reactions,
              [type]: (n.reactions?.[type] || 0) + 1,
            },
          };
        }
        return n;
      })
    );
  };

  const handleUpdateCorkNotePosition = (id: string, x: number, y: number) => {
    const cloudNote = cloudCorkNotes.find((n) => n.id === id);
    if (cloudNote && user && cloudNote.authorId === user.uid) {
      updateCorkNotePositionCloud(id, x, y).catch((err) => {
        console.warn('Notice updating position in cloud:', err);
      });
    }

    setCorkNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
  };

  const handleDeleteCorkNote = async (id: string) => {
    // 1. Remove optimistically from local state
    setCorkNotes((prev) => prev.filter((n) => n.id !== id));
    playPaperRustleSound('flutter', 0.08);

    // 2. Delete from cloud
    try {
      await deleteCorkNoteCloud(id);
      showToast('Note removed from Corkboard 🗑️');
    } catch {
      // Fallback
    }
  };

  const handleResetLayout = () => {
    const defaults = getDefaultPositions();
    // Neatly arrange existing custom or extra sticky notes on the right column
    stickyNotes.forEach((note, index) => {
      const widgetKey = `widget-${note.id}`;
      if (!defaults[widgetKey]) {
        defaults[widgetKey] = {
          id: widgetKey,
          x: 940,
          y: 638 + (index - 2) * 230,
          zIndex: 20 + index,
        };
      }
    });
    setPositions(defaults);
    playWoodThudSound(140, 0.08);
    setTimeout(() => playPaperRustleSound('flutter', 0.07), 60);
    showToast('3-Column Balanced Layout Applied! 🧹✨');
  };

  // Mobile Focus & Quick Widget Navigation
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(null);

  const handleFocusWidget = (targetId: string) => {
    setIsQuestsOpen(false);
    setIsCorkboardOpen(false);
    setIsExpandedStudioOpen(false);

    let actualId = targetId;
    if (targetId === 'widget-notes') {
      actualId = stickyNotes.length > 0 ? `widget-${stickyNotes[0].id}` : 'widget-sticky-1';
    }

    bringWidgetToFront(actualId);
    setFocusedWidgetId(actualId);
    setTimeout(() => {
      setFocusedWidgetId((cur) => (cur === actualId ? null : cur));
    }, 2800);

    setTimeout(() => {
      const el = document.getElementById(actualId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        el.classList.add('ring-4', 'ring-amber-400', 'animate-pulse');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-amber-400', 'animate-pulse');
        }, 2200);
      }
    }, 80);
  };

  // Mobile Auto-Stacking Stage Organizer (< 768px)
  const handleAutoStackMobile = () => {
    const paddingX = 16;
    let currentY = 16;
    const stacked: Record<string, WidgetPosition> = {};
    let z = 10;

    // Follow the clear 3-column conceptual hierarchy on mobile:
    // 1. Midnight Sky view
    // 2. Desk Ambience & Focus (Lamp, Pet, Focus Clock)
    // 3. Entertainment & Games (Tic-Tac-Toe, Lo-Fi Synth)
    // 4. Personal Organization (Sticky Notes)
    // 5. Desk Accessories (Coffee, Plant)
    const coreOrder: { id: string; h: number }[] = [
      { id: 'widget-sky', h: 188 },
      { id: 'widget-lamp', h: 244 },
      { id: 'widget-pet', h: 214 },
      { id: 'widget-pomodoro', h: 244 },
      { id: 'widget-tictactoe', h: 354 },
      { id: 'widget-boombox', h: 314 },
    ];

    coreOrder.forEach(({ id, h }) => {
      stacked[id] = { id, x: paddingX, y: currentY, zIndex: z++ };
      currentY += h;
    });

    stickyNotes.forEach((note) => {
      const widgetKey = `widget-${note.id}`;
      stacked[widgetKey] = { id: widgetKey, x: paddingX, y: currentY, zIndex: z++ };
      currentY += 234;
    });

    const accessoryOrder: { id: string; h: number }[] = [
      { id: 'widget-coffee', h: 214 },
      { id: 'widget-plant', h: 174 },
    ];

    accessoryOrder.forEach(({ id, h }) => {
      stacked[id] = { id, x: paddingX, y: currentY, zIndex: z++ };
      currentY += h;
    });

    setPositions(stacked);
    playWoodThudSound(220, 0.08);
    showToast('Clean Mobile Stage Stacking Applied! 🧹📱');
    if (deskCanvasRef.current) {
      deskCanvasRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Ambient Lighting Gradient computation
  const getAmbientOverlayStyle = () => {
    const lampPos = positions['widget-lamp'] || { x: 480, y: 20 };
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
    <div className="font-sans text-slate-100 flex flex-col justify-between h-screen h-[100dvh] w-screen relative overflow-hidden bg-[#0d0f17]">
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
          corkNotesCount={displayCorkNotes.length}
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
          onOpenExpandedStudio={handleOpenExpandedStudio}
          lampLighting={lampLighting}
          onCycleLighting={handleCycleLighting}
          skyMode={skyMode}
          onCycleSky={handleCycleSky}
        />
      )}

      {/* Main Desk Workspace Canvas */}
      <main
        ref={deskCanvasRef}
        className="relative flex-1 w-full h-full desk-pattern overflow-auto select-none touch-manipulation"
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
          {/* GADGET 0: Celestial Sky Window (Right Column Top) */}
          <div
            id="widget-sky"
            style={{
              transform: `translate3d(${positions['widget-sky']?.x ?? 940}px, ${positions['widget-sky']?.y ?? 20}px, 0)`,
              zIndex: positions['widget-sky']?.zIndex ?? 17,
            }}
            onPointerDown={(e) => handlePointerDown('widget-sky', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-sky')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-sky'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <CelestialSky
              mode={skyMode}
              onCycleMode={handleCycleSky}
              onSelectMode={handleSelectSky}
              isRainActive={isRainActive}
              onToggleRain={handleToggleRain}
            />
          </div>

          {/* GADGET 1: Tic-Tac-Toe Arcade Widget (Left Column Top) */}
          <div
            id="widget-tictactoe"
            style={{
              transform: `translate3d(${positions['widget-tictactoe']?.x ?? 24}px, ${positions['widget-tictactoe']?.y ?? 20}px, 0)`,
              zIndex: positions['widget-tictactoe']?.zIndex ?? 10,
            }}
            onPointerDown={(e) => handlePointerDown('widget-tictactoe', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-tictactoe')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-tictactoe'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <div id="tictactoe-widget" className="w-full h-full">
              <TicTacToeWidget
                onWinQuest={() => completeQuest('play_tictactoe')}
                onPlayerMove={() => updateStarterStep('tictactoe_move')}
              />
            </div>
          </div>

          {/* GADGET 2: Lo-Fi Radio Boombox (Left Column Bottom) */}
          <div
            id="widget-boombox"
            style={{
              transform: `translate3d(${positions['widget-boombox']?.x ?? 24}px, ${positions['widget-boombox']?.y ?? 374}px, 0)`,
              zIndex: positions['widget-boombox']?.zIndex ?? 11,
            }}
            onPointerDown={(e) => handlePointerDown('widget-boombox', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-boombox')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-boombox'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <div id="lofi-synth-card" className="w-full h-full">
              <LoFiRadioWidget onPlayQuest={() => completeQuest('play_lofi')} />
            </div>
          </div>

          {/* GADGET 3: Waterable Desk Succulent (Center Column Left Accessory) */}
          <div
            id="widget-plant"
            style={{
              transform: `translate3d(${positions['widget-plant']?.x ?? 304}px, ${positions['widget-plant']?.y ?? 180}px, 0)`,
              zIndex: positions['widget-plant']?.zIndex ?? 12,
            }}
            onPointerDown={(e) => handlePointerDown('widget-plant', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-plant')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-plant'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <PlantWidget onWaterQuest={() => completeQuest('water_succulent')} />
          </div>

          {/* GADGET 4: Desk Lamp Widget (Center Column Top) */}
          <div
            id="widget-lamp"
            style={{
              transform: `translate3d(${positions['widget-lamp']?.x ?? 480}px, ${positions['widget-lamp']?.y ?? 20}px, 0)`,
              zIndex: positions['widget-lamp']?.zIndex ?? 13,
            }}
            onPointerDown={(e) => handlePointerDown('widget-lamp', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-lamp')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-lamp'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <DeskLampWidget
              lighting={lampLighting}
              onCycleLighting={handleCycleLighting}
              onSetLighting={handleSetLighting}
              onLampQuest={() => completeQuest('lamp_toggle')}
            />
          </div>

          {/* GADGET 5: Pixel Pet Tamagotchi (Center Column Middle) */}
          <div
            id="widget-pet"
            style={{
              transform: `translate3d(${positions['widget-pet']?.x ?? 496}px, ${positions['widget-pet']?.y ?? 264}px, 0)`,
              zIndex: positions['widget-pet']?.zIndex ?? 14,
            }}
            onPointerDown={(e) => handlePointerDown('widget-pet', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-pet')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-pet'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <PixelPetWidget onPetQuest={() => completeQuest('feed_pet')} />
          </div>

          {/* GADGET 6: Focus Clock / Pomodoro Widget (Center Column Bottom) */}
          <div
            id="widget-pomodoro"
            style={{
              transform: `translate3d(${positions['widget-pomodoro']?.x ?? 480}px, ${positions['widget-pomodoro']?.y ?? 478}px, 0)`,
              zIndex: positions['widget-pomodoro']?.zIndex ?? 15,
            }}
            onPointerDown={(e) => handlePointerDown('widget-pomodoro', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-pomodoro')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-pomodoro'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <div id="pomodoro-timer" className="w-full h-full">
              <PomodoroWidget onSprintComplete={() => completeQuest('pomo_focus')} />
            </div>
          </div>

          {/* GADGET 7: Steaming Coffee Mug (Center Column Right Accessory) */}
          <div
            id="widget-coffee"
            style={{
              transform: `translate3d(${positions['widget-coffee']?.x ?? 712}px, ${positions['widget-coffee']?.y ?? 180}px, 0)`,
              zIndex: positions['widget-coffee']?.zIndex ?? 16,
            }}
            onPointerDown={(e) => handlePointerDown('widget-coffee', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => handleWidgetHover('widget-coffee')}
            className={`absolute top-0 left-0 cursor-grab active:cursor-grabbing touch-none rounded-2xl will-change-transform transition-[box-shadow,ring] duration-300 ${
              focusedWidgetId === 'widget-coffee'
                ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                : ''
            }`}
          >
            <div id="desk-gadgets-area" className="w-full h-full">
              <CoffeeMugWidget onSipQuest={() => completeQuest('sip_coffee')} />
            </div>
          </div>

          {/* GADGET 8+: Draggable Sticky Notes (Right Column) */}
          {stickyNotes.map((note) => {
            const widgetKey = `widget-${note.id}`;
            const defaultPos = {
              id: widgetKey,
              x: 940,
              y: note.id === 'sticky-1' ? 204 : note.id === 'sticky-2' ? 408 : 638,
              zIndex: note.id === 'sticky-1' ? 18 : 19,
            };
            const currentPos = positions[widgetKey] || defaultPos;
            const isFocused = focusedWidgetId === widgetKey;

            return (
              <div
                key={note.id}
                id={widgetKey}
                style={{
                  transform: `translate3d(${currentPos.x}px, ${currentPos.y}px, 0)`,
                  zIndex: currentPos.zIndex,
                }}
                onPointerDown={(e) => handlePointerDown(widgetKey, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseEnter={() => handleWidgetHover(widgetKey)}
                className={`absolute top-0 left-0 touch-none will-change-transform rounded-2xl transition-[box-shadow,ring] duration-300 ${
                  note.pinnedToDesk ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                } ${
                  isFocused
                    ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)] animate-pulse'
                    : ''
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
          onOpenExpandedStudio={handleOpenExpandedStudio}
          isGridSnapEnabled={isGridSnapEnabled}
          onToggleGridSnap={() => {
            const next = !isGridSnapEnabled;
            setIsGridSnapEnabled(next);
            showToast(next ? 'Grid Snapping: 16px Enabled 📏' : 'Free-Form Drag Enabled 🕊️');
          }}
          deskScale={deskScale}
          onZoomInDesk={handleZoomInDesk}
          onZoomOutDesk={handleZoomOutDesk}
          onResetDeskZoom={handleResetDeskZoom}
          onOpenQuests={() => {
            playChime(440, 'sine', 0.08);
            setIsQuestsOpen(true);
          }}
          questsDoneCount={questsDoneCount}
          totalQuests={quests.length}
          onFocusWidget={handleFocusWidget}
          activeFocusedWidget={focusedWidgetId}
          onAutoStackMobile={handleAutoStackMobile}
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
          onOpenExpandedStudio={handleOpenExpandedStudio}
          onStepClick={(stepId) => {
            const map: Record<string, string> = {
              play_lofi: 'widget-boombox',
              drink_coffee: 'widget-coffee',
              tictactoe_move: 'widget-tictactoe',
              expanded_board_note: 'btn-expanded-board',
            };
            if (map[stepId]) handleFocusWidget(map[stepId]);
          }}
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
        onFocusWidget={handleFocusWidget}
        onResetProgress={handleResetProgress}
        onOpenTour={() => {
          setIsQuestsOpen(false);
          setIsTourActive(true);
        }}
      />

      <CorkboardModal
        isOpen={isCorkboardOpen}
        onClose={() => setIsCorkboardOpen(false)}
        notes={displayCorkNotes}
        onAddNote={handleAddCorkNote}
        onReactNote={handleReactCorkNote}
        onDeleteNote={handleDeleteCorkNote}
        onOpenExpandedStudio={handleOpenExpandedStudio}
      />

      {/* Expanded Corkboard Studio (2800x2200 px Canvas) */}
      <ExpandedCorkboardStudio
        isOpen={isExpandedStudioOpen}
        onClose={() => setIsExpandedStudioOpen(false)}
        notes={displayCorkNotes}
        onAddNote={handleAddCorkNote}
        onReactNote={handleReactCorkNote}
        onUpdateNotePosition={handleUpdateCorkNotePosition}
        onDeleteNote={handleDeleteCorkNote}
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
            localStorage.setItem('cozydesk_tour_completed', 'true');
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
            localStorage.setItem('cozydesk_tour_completed', 'true');
            localStorage.setItem('has_seen_cozydesk_tour', 'true');
          } catch {}
        }}
        onComplete={() => {
          setIsTourActive(false);
          setHasSeenTour(true);
          try {
            localStorage.setItem('cozydesk_tour_completed', 'true');
            localStorage.setItem('has_seen_cozydesk_tour', 'true');
          } catch {}
        }}
        onSkip={() => {
          setIsTourActive(false);
          setHasSeenTour(true);
          try {
            localStorage.setItem('cozydesk_tour_completed', 'true');
            localStorage.setItem('has_seen_cozydesk_tour', 'true');
          } catch {}
        }}
        onOpenExpandedStudio={handleOpenExpandedStudio}
      />

      {/* Atmospheric Retro-Cozy Loading Screen & Welcome Splash Screen */}
      {showSplash && (
        <LoadingSplashScreen onEnterWorkspace={handleEnterWorkspace} />
      )}

      {/* Guest Desk Sticky Pinning Authentication Prompt */}
      <SignInToPostModal
        isOpen={isDeskPinAuthOpen}
        onClose={() => setIsDeskPinAuthOpen(false)}
        onSuccess={handleDeskPinAuthSuccess}
        pendingItem={
          pendingDeskPinNote
            ? {
                type: 'note',
                name: pendingDeskPinNote.title || 'Desk Memo',
                message: pendingDeskPinNote.content,
                color: pendingDeskPinNote.color,
                fontClass: pendingDeskPinNote.fontClass,
                emoji: '📌',
              }
            : null
        }
      />
    </div>
  );
}
