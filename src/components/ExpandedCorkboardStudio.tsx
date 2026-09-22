import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
  Pin,
  Heart,
  Coffee,
  Star,
  Flame,
  Sparkles,
  MapPin,
  Compass,
  CheckCircle2,
  Camera,
  Layers,
} from 'lucide-react';
import { CorkboardNote } from '../types';
import { AddPolaroidModal } from './AddPolaroidModal';
import {
  playPinTackSound,
  playStampSound,
  playPaperRustleSound,
  playMechanicalClick,
  playDeskSlideSound,
  playWoodThudSound,
  playWinFanfare,
} from '../utils/audio';

interface ExpandedCorkboardStudioProps {
  isOpen: boolean;
  onClose: () => void;
  notes: CorkboardNote[];
  onAddNote: (note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'> & { x?: number; y?: number }) => void;
  onReactNote: (noteId: string, type: 'heart' | 'coffee' | 'star' | 'fire') => void;
  onUpdateNotePosition?: (id: string, x: number, y: number) => void;
}

// Giant canvas dimensions
const BOARD_WIDTH = 2800;
const BOARD_HEIGHT = 2200;

// Curated Polaroids for cozy tactile bulletin realism
const CURATED_POLAROIDS = [
  {
    id: 'pol-1',
    title: 'Rainy Night Sanctuary',
    date: 'Autumn Chill',
    desc: 'Warm glow and rain dripping on the pane',
    x: 420,
    y: 1250,
    rot: -3,
    tapeColor: 'rgba(254, 240, 138, 0.65)',
    icon: '🌧️',
    gradient: 'from-slate-900 via-sky-950 to-indigo-950',
  },
  {
    id: 'pol-2',
    title: 'Midnight Lo-Fi Radio',
    date: '02:45 AM',
    desc: 'Analog cassette chords loop endlessly',
    x: 1480,
    y: 1320,
    rot: 2,
    tapeColor: 'rgba(186, 230, 253, 0.65)',
    icon: '📻',
    gradient: 'from-amber-950 via-stone-900 to-purple-950',
  },
  {
    id: 'pol-3',
    title: 'Sleeping Pixel Cat',
    date: 'Nap Time',
    desc: 'Found asleep on the warm laptop keyboard',
    x: 950,
    y: 1180,
    rot: -1.5,
    tapeColor: 'rgba(251, 207, 232, 0.65)',
    icon: '🐾',
    gradient: 'from-pink-950 via-slate-900 to-amber-950',
  },
  {
    id: 'pol-4',
    title: 'Succulent First Sprout',
    date: 'Day 14',
    desc: 'Thriving with gentle desk lamp warmth',
    x: 2020,
    y: 1210,
    rot: 3.5,
    tapeColor: 'rgba(187, 247, 208, 0.65)',
    icon: '🌱',
    gradient: 'from-emerald-950 via-slate-900 to-teal-950',
  },
];

// Curated Sticky Reminders pinned across zones
const CURATED_BOARD_MEMOS = [
  {
    id: 'memo-zone-1',
    title: '🎯 Sprint Goals',
    content: '1. Win 3 matches of Tic-Tac-Toe\n2. Maintain 25min Pomodoro flow\n3. Leave encouraging memo for friends',
    color: '#fed7aa',
    x: 1880,
    y: 280,
    rot: -2,
    fontClass: 'font-hand',
  },
  {
    id: 'memo-zone-2',
    title: '☕ Cozy Reminder',
    content: 'Take deep breaths. Your pace is already enough.\nDrink hot tea and hydrate often!',
    color: '#fef08a',
    x: 2180,
    y: 620,
    rot: 2.5,
    fontClass: 'font-hand-alt',
  },
  {
    id: 'memo-zone-3',
    title: '✨ Creative Spark',
    content: '"In the middle of the noise, the quiet corners are where ideas bloom."',
    color: '#bae6fd',
    x: 280,
    y: 720,
    rot: -3.5,
    fontClass: 'font-hand',
  },
];

export const ExpandedCorkboardStudio: React.FC<ExpandedCorkboardStudioProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onReactNote,
  onUpdateNotePosition,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pan & Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(0.65);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMinimap, setShowMinimap] = useState(true);

  // Synchronous Refs to eliminate race conditions and stale closures during zoom/pan
  const scaleRef = useRef<number>(0.65);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasAutoCenteredRef = useRef<boolean>(false);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Note position overrides if user drags notes inside studio
  const [notePositions, setNotePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Add Note Modal State inside Studio
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddPolaroidModalOpen, setIsAddPolaroidModalOpen] = useState(false);
  const [modalAuthor, setModalAuthor] = useState('Anonymous');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [modalColor, setModalColor] = useState('#fef08a');
  const [modalFont, setModalFont] = useState('font-hand');
  const [modalEmoji, setModalEmoji] = useState('☕');
  const [pendingPinCoords, setPendingPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [showOnboardingHint, setShowOnboardingHint] = useState(false);

  // Onboarding Hint Banner on first time opening Expanded Studio (fades out after 6s)
  useEffect(() => {
    if (isOpen) {
      try {
        const seen = localStorage.getItem('has_seen_corkboard_hint');
        if (!seen) {
          setShowOnboardingHint(true);
          const timer = setTimeout(() => {
            setShowOnboardingHint(false);
            try {
              localStorage.setItem('has_seen_corkboard_hint', 'true');
            } catch {}
          }, 6000);
          return () => clearTimeout(timer);
        }
      } catch {}
    } else {
      setShowOnboardingHint(false);
    }
  }, [isOpen]);

  // Pan interaction tracking ref
  const panStartRef = useRef<{
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origPanX: 0, origPanY: 0, hasMoved: false });

  // Note dragging ref
  const activeNoteDragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Center Canvas Function (Stable: does not recreate on scale changes, preventing zoom resets)
  const centerCanvas = useCallback((targetScale?: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const s = targetScale !== undefined ? targetScale : scaleRef.current;
    const cx = (rect.width - BOARD_WIDTH * s) / 2;
    const cy = (rect.height - BOARD_HEIGHT * s) / 2;
    setPan({ x: cx, y: cy });
    panRef.current = { x: cx, y: cy };
    if (targetScale !== undefined) {
      const clamped = Math.min(3.0, Math.max(0.25, targetScale));
      setScale(clamped);
      scaleRef.current = clamped;
    }
    playWoodThudSound(180, 0.06);
  }, []);

  // Initial auto-centering strictly once on modal opening
  useEffect(() => {
    if (isOpen) {
      if (!hasAutoCenteredRef.current) {
        hasAutoCenteredRef.current = true;
        const timer = setTimeout(() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const fitScale = Math.min(
              Math.max(rect.width / (BOARD_WIDTH * 0.95), 0.35),
              0.75
            );
            centerCanvas(fitScale);
          }
        }, 50);
        playPaperRustleSound('lift', 0.1);
        return () => clearTimeout(timer);
      }
    } else {
      hasAutoCenteredRef.current = false;
    }
  }, [isOpen, centerCanvas]);

  // Default coordinate layout algorithm for notes that don't have explicit x/y
  const getNoteCoords = useCallback(
    (note: CorkboardNote, idx: number): { x: number; y: number; rot: number } => {
      if (notePositions[note.id]) {
        return {
          x: notePositions[note.id].x,
          y: notePositions[note.id].y,
          rot: note.rotation ?? ((idx * 7) % 6 - 3),
        };
      }
      if (note.x !== undefined && note.y !== undefined) {
        return {
          x: note.x,
          y: note.y,
          rot: note.rotation ?? ((idx * 7) % 6 - 3),
        };
      }
      if (note.isPolaroid) {
        const pCol = idx % 3;
        const pRow = Math.floor(idx / 3);
        return {
          x: 1820 + pCol * 290,
          y: 1140 + pRow * 350,
          rot: note.rotation ?? ((idx * 5) % 6 - 3),
        };
      }
      // Grid clustering across the central bulletin zone
      const colCount = 4;
      const col = idx % colCount;
      const row = Math.floor(idx / colCount);
      const startX = 640;
      const startY = 320;
      const cellW = 340;
      const cellH = 260;
      const jitterX = ((idx * 23) % 40) - 20;
      const jitterY = ((idx * 37) % 30) - 15;
      const rot = ((idx * 11) % 7) - 3.5;

      return {
        x: startX + col * cellW + jitterX,
        y: startY + row * cellH + jitterY,
        rot,
      };
    },
    [notePositions]
  );

  // Zoom towards center of viewport
  const zoomTowardsCenter = useCallback((nextScale: number) => {
    if (!containerRef.current) return;
    const clampedScale = Math.min(3.0, Math.max(0.25, +nextScale.toFixed(3)));
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const currentScale = scaleRef.current;
    const currentPan = panRef.current;

    const canvasX = (centerX - currentPan.x) / currentScale;
    const canvasY = (centerY - currentPan.y) / currentScale;

    const newPanX = centerX - canvasX * clampedScale;
    const newPanY = centerY - canvasY * clampedScale;

    scaleRef.current = clampedScale;
    panRef.current = { x: newPanX, y: newPanY };

    setScale(clampedScale);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  // Zoom buttons
  const handleZoomIn = useCallback(() => {
    const next = Math.min(3.0, +(scaleRef.current * 1.25).toFixed(2));
    zoomTowardsCenter(next);
    playMechanicalClick('subtle', 0.05);
  }, [zoomTowardsCenter]);

  const handleZoomOut = useCallback(() => {
    const next = Math.max(0.25, +(scaleRef.current / 1.25).toFixed(2));
    zoomTowardsCenter(next);
    playMechanicalClick('subtle', 0.05);
  }, [zoomTowardsCenter]);

  const handleZoom100 = useCallback(() => {
    zoomTowardsCenter(1.0);
    playMechanicalClick('toggle', 0.06);
  }, [zoomTowardsCenter]);

  // Keyboard Shortcuts for Zoom In/Out/100% inside Expanded Studio
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (
        e.key === '+' ||
        e.key === '=' ||
        ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+'))
      ) {
        e.preventDefault();
        handleZoomIn();
      } else if (
        e.key === '-' ||
        e.key === '_' ||
        ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_'))
      ) {
        e.preventDefault();
        handleZoomOut();
      } else if (
        e.key === '0' ||
        ((e.ctrlKey || e.metaKey) && e.key === '0')
      ) {
        e.preventDefault();
        handleZoom100();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleZoomIn, handleZoomOut, handleZoom100]);

  // Mouse Wheel & Trackpad Pinch Zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const onWheel = (e: WheelEvent) => {
      // Don't zoom if event originated inside a nested modal, input, or dropdown
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('[role="dialog"]')
      ) {
        return;
      }

      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentScale = scaleRef.current;
      const currentPan = panRef.current;

      // Trackpad pinch-to-zoom has e.ctrlKey === true
      let zoomFactor: number;
      if (e.ctrlKey) {
        zoomFactor = Math.exp(-e.deltaY * 0.01);
      } else {
        zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      }

      const newScale = Math.min(3.0, Math.max(0.25, +(currentScale * zoomFactor).toFixed(3)));
      if (Math.abs(newScale - currentScale) < 0.001) return;

      const canvasX = (mouseX - currentPan.x) / currentScale;
      const canvasY = (mouseY - currentPan.y) / currentScale;

      const newPanX = mouseX - canvasX * newScale;
      const newPanY = mouseY - canvasY * newScale;

      scaleRef.current = newScale;
      panRef.current = { x: newPanX, y: newPanY };

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [isOpen]);

  // Pointer Down on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking an interactive button or note drag handle, don't pan canvas
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('[data-note-item]')
    ) {
      return;
    }

    setIsDraggingCanvas(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panRef.current.x,
      origPanY: panRef.current.y,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move on Canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Canvas Panning
    if (isDraggingCanvas) {
      const dx = e.clientX - panStartRef.current.startX;
      const dy = e.clientY - panStartRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        panStartRef.current.hasMoved = true;
        playDeskSlideSound(0.015);
      }
      const newPan = {
        x: panStartRef.current.origPanX + dx,
        y: panStartRef.current.origPanY + dy,
      };
      panRef.current = newPan;
      setPan(newPan);
      return;
    }

    // Note Reposition Dragging
    if (activeNoteDragRef.current) {
      const { id, startX, startY, origX, origY } = activeNoteDragRef.current;
      const currentScale = scaleRef.current;
      const dx = (e.clientX - startX) / currentScale;
      const dy = (e.clientY - startY) / currentScale;
      const newX = Math.max(80, Math.min(BOARD_WIDTH - 300, origX + dx));
      const newY = Math.max(80, Math.min(BOARD_HEIGHT - 250, origY + dy));

      setNotePositions((prev) => ({
        ...prev,
        [id]: { x: newX, y: newY },
      }));
    }
  };

  // Pointer Up on Canvas
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }

    if (activeNoteDragRef.current) {
      const { id } = activeNoteDragRef.current;
      const pos = notePositions[id];
      if (pos && onUpdateNotePosition) {
        onUpdateNotePosition(id, pos.x, pos.y);
      }
      activeNoteDragRef.current = null;
      playPinTackSound(0.08);
    }
  };

  // Touch tracking for pinch-to-zoom
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
    midX: number;
    midY: number;
    initialPan: { x: number; y: number };
    isPinching: boolean;
  }>({
    initialDist: 0,
    initialScale: 1,
    midX: 0,
    midY: 0,
    initialPan: { x: 0, y: 0 },
    isPinching: false,
  });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const rect = containerRef.current?.getBoundingClientRect();
      const midX = (t1.clientX + t2.clientX) / 2 - (rect?.left || 0);
      const midY = (t1.clientY + t2.clientY) / 2 - (rect?.top || 0);

      touchStateRef.current = {
        initialDist: dist,
        initialScale: scaleRef.current,
        midX,
        midY,
        initialPan: { ...panRef.current },
        isPinching: true,
      };
      setIsDraggingCanvas(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (touchStateRef.current.initialDist > 0) {
        const factor = dist / touchStateRef.current.initialDist;
        const newScale = Math.min(3.0, Math.max(0.25, +(touchStateRef.current.initialScale * factor).toFixed(3)));

        const rect = containerRef.current?.getBoundingClientRect();
        const curMidX = (t1.clientX + t2.clientX) / 2 - (rect?.left || 0);
        const curMidY = (t1.clientY + t2.clientY) / 2 - (rect?.top || 0);

        const canvasX = (touchStateRef.current.midX - touchStateRef.current.initialPan.x) / touchStateRef.current.initialScale;
        const canvasY = (touchStateRef.current.midY - touchStateRef.current.initialPan.y) / touchStateRef.current.initialScale;

        const newPanX = curMidX - canvasX * newScale;
        const newPanY = curMidY - canvasY * newScale;

        scaleRef.current = newScale;
        panRef.current = { x: newPanX, y: newPanY };

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchStateRef.current.isPinching) {
      touchStateRef.current.isPinching = false;
    }
  };

  // Double Click / Direct click to pin note at point
  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const boardX = Math.round((clientX - pan.x) / scale);
    const boardY = Math.round((clientY - pan.y) / scale);

    if (boardX > 100 && boardX < BOARD_WIDTH - 200 && boardY > 100 && boardY < BOARD_HEIGHT - 200) {
      setPendingPinCoords({ x: boardX, y: boardY });
      setIsAnonymous(true);
      setModalAuthor('Anonymous');
      setIsAddModalOpen(true);
      playPinTackSound(0.1);
    }
  };

  // Start Note Drag
  const handleNotePointerDown = (
    noteId: string,
    currentX: number,
    currentY: number,
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    activeNoteDragRef.current = {
      id: noteId,
      startX: e.clientX,
      startY: e.clientY,
      origX: currentX,
      origY: currentY,
    };
    playPaperRustleSound('lift', 0.08);
  };

  // Submit New Note
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMessage.trim()) return;

    // Automatic anonymous if anonymous toggle is active or if custom name was left blank
    const finalAuthor = isAnonymous
      ? 'Anonymous'
      : (modalAuthor.trim() || 'Anonymous');

    const targetCoords = pendingPinCoords || {
      x: Math.round(-pan.x / scale + (containerRef.current ? containerRef.current.clientWidth / 2 / scale : 1000)),
      y: Math.round(-pan.y / scale + (containerRef.current ? containerRef.current.clientHeight / 2 / scale : 800)),
    };

    onAddNote({
      name: finalAuthor,
      message: modalMessage.trim(),
      color: modalColor,
      fontClass: modalFont,
      emoji: modalEmoji,
      x: targetCoords.x,
      y: targetCoords.y,
    });

    setModalMessage('');
    setIsAddModalOpen(false);
    setPendingPinCoords(null);
    playPinTackSound(0.12);
    setTimeout(() => playWinFanfare(), 150);
  };

  // Minimap Navigation: Click on minimap to jump
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetBoardX = (clickX / rect.width) * BOARD_WIDTH;
    const targetBoardY = (clickY / rect.height) * BOARD_HEIGHT;

    if (containerRef.current) {
      const vW = containerRef.current.clientWidth;
      const vH = containerRef.current.clientHeight;
      setPan({
        x: -(targetBoardX * scale) + vW / 2,
        y: -(targetBoardY * scale) + vH / 2,
      });
      playDeskSlideSound(0.04);
    }
  };

  // Filtered Notes
  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      n.name.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.emoji.includes(q)
    );
  });

  if (!isOpen) return null;

  // Viewport rect calculation for Minimap
  const viewportWidth = containerRef.current?.clientWidth || 1000;
  const viewportHeight = containerRef.current?.clientHeight || 700;
  const minimapScale = 240 / BOARD_WIDTH;
  const minimapW = 240;
  const minimapH = Math.round(BOARD_HEIGHT * minimapScale);

  const viewMiniX = Math.max(0, (-pan.x / scale) * minimapScale);
  const viewMiniY = Math.max(0, (-pan.y / scale) * minimapScale);
  const viewMiniW = Math.min(minimapW, (viewportWidth / scale) * minimapScale);
  const viewMiniH = Math.min(minimapH, (viewportHeight / scale) * minimapScale);

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] text-slate-100 flex flex-col select-none overflow-hidden animate-fade-in">
      {/* Top Floating Studio Command Bar */}
      <header className="relative z-40 px-3 sm:px-6 py-2.5 bg-slate-900/95 border-b border-amber-900/50 backdrop-blur-md flex items-center justify-between shadow-2xl">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff9e80] to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md border border-amber-300/40">
            <Pin className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>Expanded Corkboard Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  2800 × 2200 px
                </span>
              </h2>
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden md:flex items-center gap-2">
              <span>Pannable & Zoomable Tactile Bulletin Canvas</span>
              <span>•</span>
              <span className="text-emerald-400">● {notes.length} Notes Pinned</span>
              <span>•</span>
              <span>Double-click canvas to pin</span>
            </p>
          </div>
        </div>

        {/* Center: Search & Add */}
        <div className="flex items-center gap-2 max-w-xs sm:max-w-sm flex-1 mx-2 sm:mx-6">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search corkboard notes..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            onClick={() => {
              setPendingPinCoords(null);
              setIsAnonymous(true);
              setModalAuthor('Anonymous');
              setIsAddModalOpen(true);
              playPinTackSound(0.08);
            }}
            className="px-3 py-1 bg-[#ff9e80] hover:bg-amber-400 text-slate-950 font-display font-bold text-xs rounded-lg transition active:scale-95 shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Pin a brand new note on the board"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Pin Note</span>
          </button>

          <button
            onClick={() => {
              setPendingPinCoords(null);
              setIsAddPolaroidModalOpen(true);
              playPinTackSound(0.08);
            }}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-display font-bold text-xs rounded-lg transition active:scale-95 shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Pin a curated polaroid with washi tape accent"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Polaroid</span>
          </button>
        </div>

        {/* Right: Zoom & Close Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Step Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shadow-inner">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg active:scale-90 transition cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span
              onClick={handleZoom100}
              className="px-2 text-[11px] font-mono font-bold text-amber-300 cursor-pointer hover:underline"
              title="Click to reset to 100%"
            >
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg active:scale-90 transition cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            <button
              onClick={handleZoom100}
              className="px-1.5 py-1 hover:bg-slate-800 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded-md active:scale-90 transition cursor-pointer"
              title="100% Native Scale"
            >
              100%
            </button>

            <button
              onClick={() => centerCanvas()}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-sky-300 rounded-md active:scale-90 transition cursor-pointer flex items-center gap-1"
              title="Center Canvas in viewport"
            >
              <Compass className="w-3 h-3" />
              <span className="hidden sm:inline">Center</span>
            </button>
          </div>

          {/* Close / Return to Desk */}
          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              onClose();
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/70 hover:text-red-300 hover:border-red-500/40 text-slate-200 border border-slate-700 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer ml-1"
            title="Return to Cozy Desk [Esc or F]"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Desk (Esc)</span>
          </button>
        </div>
      </header>

      {/* Main Pan / Zoom Viewport Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onDoubleClick={handleCanvasDoubleClick}
        className={`relative flex-1 w-full h-full overflow-hidden bg-[#07090f] ${
          isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
        } touch-none select-none`}
      >
        {/* Animated Background Ambience Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

        {/* Transformed Giant 2800 x 2200 px Corkboard Canvas */}
        <div
          style={{
            width: `${BOARD_WIDTH}px`,
            height: `${BOARD_HEIGHT}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
          className="absolute cork-texture rounded-3xl border-[28px] border-[#3e2715] shadow-[0_30px_100px_rgba(0,0,0,0.85)] relative overflow-hidden will-change-transform"
        >
          {/* Beveled Inner Wooden Shadow & Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.65)] rounded-2xl z-20" />

          {/* Canvas Decorative Header Banner */}
          <div className="absolute top-8 left-12 right-12 flex items-center justify-between pointer-events-none z-10 border-b-2 border-dashed border-[#5a3818]/60 pb-3">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-xl bg-[#3e2715]/80 text-[#ffcca0] font-display font-extrabold text-lg border border-[#5a3818] shadow-md flex items-center gap-2">
                📌 Cozy Desk Community Corkboard Sanctuary
              </span>
              <span className="text-xs font-mono text-amber-950/80 font-bold">
                Zone Canvas [2800 × 2200 px] • Drag any note to reposition
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-amber-950/80 font-bold">
              <span>Double-click empty cork to pin</span>
              <span>•</span>
              <span>Scroll wheel to zoom</span>
            </div>
          </div>

          {/* SVG Twine Strings Connecting Pins */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
            {/* String from Note 1 to Polaroid */}
            <path
              d="M 680 420 Q 800 620, 950 1180"
              fill="none"
              stroke="#6b401d"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* String from Polaroid to Goals */}
            <path
              d="M 980 1180 Q 1400 800, 1880 280"
              fill="none"
              stroke="#8a4f20"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
            {/* String between Memos */}
            <path
              d="M 1880 320 Q 2000 480, 2180 620"
              fill="none"
              stroke="#5a310f"
              strokeWidth="2"
            />
          </svg>

          {/* ZONE 1 LABEL: Community Notes & Study Wall */}
          <div className="absolute top-20 left-16 pointer-events-none z-10">
            <div className="px-3 py-1 bg-amber-950/30 text-amber-950 rounded border border-amber-950/40 text-xs font-mono font-bold tracking-wider uppercase">
              Section A • Community Notes & Study Wall
            </div>
          </div>

          {/* ZONE 2 LABEL: Goals & Daily Focus */}
          <div className="absolute top-20 right-16 pointer-events-none z-10">
            <div className="px-3 py-1 bg-amber-950/30 text-amber-950 rounded border border-amber-950/40 text-xs font-mono font-bold tracking-wider uppercase">
              Section B • Goals, Habits & Sprints
            </div>
          </div>

          {/* ZONE 3 LABEL: Polaroids & Wall of Memories */}
          <div className="absolute bottom-24 left-16 pointer-events-none z-10">
            <div className="px-3 py-1 bg-amber-950/30 text-amber-950 rounded border border-amber-950/40 text-xs font-mono font-bold tracking-wider uppercase">
              Section C • Polaroids & Wall of Memories
            </div>
          </div>

          {/* ZONE 4 LABEL: Cozy Coffee Quotes */}
          <div className="absolute bottom-24 right-16 pointer-events-none z-10">
            <div className="px-3 py-1 bg-amber-950/30 text-amber-950 rounded border border-amber-950/40 text-xs font-mono font-bold tracking-wider uppercase">
              Section D • Cozy Inspiration & Quotes
            </div>
          </div>

          {/* Curated Static Memos pinned on board */}
          {CURATED_BOARD_MEMOS.map((memo) => (
            <div
              key={memo.id}
              style={{
                left: `${memo.x}px`,
                top: `${memo.y}px`,
                backgroundColor: memo.color,
                transform: `rotate(${memo.rot}deg)`,
              }}
              className="absolute w-72 p-5 rounded-md shadow-2xl text-slate-900 border-t-4 border-black/15 paper-folded z-10 select-none pointer-events-auto hover:z-30 transition-shadow"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="pushpin-head bg-amber-700" />
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-900 pb-1.5 border-b border-black/15">
                {memo.title}
              </h4>
              <p className={`text-xl text-slate-800 leading-snug my-3 whitespace-pre-line ${memo.fontClass}`}>
                {memo.content}
              </p>
              <div className="text-[10px] font-mono text-black/50 text-right">
                📌 Pinned Milestone
              </div>
            </div>
          ))}

          {/* Curated Tactile Polaroids pinned on board */}
          {CURATED_POLAROIDS.map((pol) => (
            <div
              key={pol.id}
              style={{
                left: `${pol.x}px`,
                top: `${pol.y}px`,
                transform: `rotate(${pol.rot}deg)`,
              }}
              className="absolute w-64 bg-white p-3 pb-5 rounded-sm shadow-2xl border border-black/20 z-10 select-none hover:z-30 hover:scale-105 transition-all duration-200 pointer-events-auto"
            >
              {/* Washi Tape Accent */}
              <div
                style={{ backgroundColor: pol.tapeColor }}
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-2"
              />

              {/* Pushpin */}
              <div className="absolute -top-2 left-4">
                <div className="pushpin-head bg-red-600" />
              </div>

              {/* Photo Area */}
              <div
                className={`w-full h-44 rounded-sm bg-gradient-to-br ${pol.gradient} p-4 flex flex-col justify-between text-white relative overflow-hidden shadow-inner border border-black/10`}
              >
                <div className="text-3xl">{pol.icon}</div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-200">
                    {pol.date}
                  </div>
                  <div className="text-sm font-display font-bold leading-tight">
                    {pol.title}
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-2.5 px-1">
                <p className="font-hand text-xl text-slate-900 leading-tight">
                  "{pol.desc}"
                </p>
              </div>
            </div>
          ))}

          {/* Interactive User Pinned Notes and Polaroids (corkNotes) */}
          {filteredNotes.map((note, idx) => {
            const coords = getNoteCoords(note, idx);
            const isHighlighted =
              searchQuery &&
              (note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (note.polaroidTitle &&
                  note.polaroidTitle.toLowerCase().includes(searchQuery.toLowerCase())));

            // If Polaroid Card
            if (note.isPolaroid) {
              return (
                <div
                  key={note.id}
                  data-note-item
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    transform: `rotate(${coords.rot}deg) ${isHighlighted ? 'scale(1.12)' : ''}`,
                  }}
                  className={`absolute w-72 bg-[#fdfbf7] p-3.5 pb-4 rounded-sm shadow-2xl text-slate-900 flex flex-col justify-between border border-black/15 z-20 cursor-grab active:cursor-grabbing hover:z-30 transition-shadow select-none ${
                    isHighlighted ? 'ring-4 ring-amber-400 z-40' : ''
                  }`}
                  onPointerDown={(e) => handleNotePointerDown(note.id, coords.x, coords.y, e)}
                >
                  {/* Washi Tape Accent */}
                  <div
                    style={{
                      backgroundColor: note.washiTapeColor || 'rgba(254, 240, 138, 0.85)',
                    }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-2 z-20 pointer-events-none"
                  />

                  {/* Pushpin */}
                  <div className="absolute -top-2 left-3 z-30">
                    <div className="pushpin-head bg-red-600 shadow-md" />
                  </div>

                  {/* Photo Area with Gradient and Scene Art */}
                  <div
                    className={`w-full h-40 rounded-sm bg-gradient-to-br ${
                      note.polaroidGradient || 'from-slate-700 via-sky-900 to-indigo-950'
                    } p-3.5 flex flex-col justify-between text-white relative overflow-hidden shadow-inner border border-black/10 mt-1`}
                  >
                    <div className="text-3xl filter drop-shadow">
                      {note.polaroidPhoto || note.emoji || '📸'}
                    </div>
                    <div className="relative z-10">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-200 font-bold">
                        {note.polaroidDate || 'OCT 2026'}
                      </div>
                      <div className="text-xs font-display font-bold leading-tight drop-shadow truncate">
                        {note.polaroidTitle || note.name}
                      </div>
                    </div>
                  </div>

                  {/* Handwritten Caption */}
                  <div className="mt-2.5 px-1 flex-1 flex flex-col justify-between">
                    <p className="font-hand text-xl text-slate-900 leading-snug line-clamp-3">
                      "{note.message}"
                    </p>
                    <div className="text-right text-[10px] font-mono text-slate-400 mt-1">
                      — {note.name}
                    </div>
                  </div>

                  {/* Reactions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-mono mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStampSound(0.08);
                          onReactNote(note.id, 'heart');
                        }}
                        className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/15 text-[11px] flex items-center gap-0.5 active:scale-90 transition cursor-pointer"
                        title="Cheer with love"
                      >
                        <Heart className="w-3 h-3 text-red-600 fill-current" />
                        <span className="font-bold">{note.reactions.heart}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStampSound(0.08);
                          onReactNote(note.id, 'coffee');
                        }}
                        className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/15 text-[11px] flex items-center gap-0.5 active:scale-90 transition cursor-pointer"
                        title="Buy a coffee"
                      >
                        <Coffee className="w-3 h-3 text-amber-800" />
                        <span className="font-bold">{note.reactions.coffee}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStampSound(0.08);
                          onReactNote(note.id, 'star');
                        }}
                        className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/15 text-[11px] flex items-center gap-0.5 active:scale-90 transition cursor-pointer"
                        title="Award star"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="font-bold">{note.reactions.star}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStampSound(0.08);
                          onReactNote(note.id, 'fire');
                        }}
                        className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/15 text-[11px] flex items-center gap-0.5 active:scale-90 transition cursor-pointer"
                        title="Awesome fire vibe"
                      >
                        <Flame className="w-3 h-3 text-orange-600 fill-current" />
                        <span className="font-bold">{note.reactions.fire}</span>
                      </button>
                    </div>

                    <span className="text-[9px] font-mono text-amber-800/80 font-bold flex items-center gap-0.5">
                      📷 Polaroid
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={note.id}
                data-note-item
                style={{
                  left: `${coords.x}px`,
                  top: `${coords.y}px`,
                  backgroundColor: note.color,
                  transform: `rotate(${coords.rot}deg) ${isHighlighted ? 'scale(1.12)' : ''}`,
                }}
                className={`absolute w-80 p-5 rounded-md shadow-2xl text-slate-900 flex flex-col justify-between min-h-[160px] border-t-4 border-black/15 paper-folded z-20 cursor-grab active:cursor-grabbing hover:z-30 transition-shadow ${
                  isHighlighted ? 'ring-4 ring-amber-400 z-40' : ''
                }`}
                onPointerDown={(e) => handleNotePointerDown(note.id, coords.x, coords.y, e)}
              >
                {/* Pushpin Header */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 cursor-pointer" title="Drag note by pushpin">
                  <div className={`pushpin-head ${idx % 2 === 0 ? 'bg-red-600' : 'bg-emerald-600'}`} />
                </div>

                {/* Note Meta */}
                <div className="flex items-center justify-between pb-1.5 border-b border-black/10 mt-1">
                  <div className="flex items-center gap-1.5 font-sans font-bold text-xs">
                    <span>{note.emoji}</span>
                    <span className="truncate max-w-[140px] flex items-center gap-1">
                      <span>{note.name || 'Anonymous'}</span>
                      {(note.name === 'Anonymous' || !note.name) && (
                        <span className="text-[9px] font-mono font-medium opacity-65 bg-black/10 px-1 py-0.5 rounded text-black/80">
                          anon
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-black/50">
                    {new Date(note.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Message Content */}
                <p className={`text-2xl text-slate-900 leading-snug my-3 break-words ${note.fontClass}`}>
                  "{note.message}"
                </p>

                {/* Reactions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playStampSound(0.08);
                        onReactNote(note.id, 'heart');
                      }}
                      className="px-2 py-0.5 rounded bg-black/5 hover:bg-black/15 text-xs flex items-center gap-1 active:scale-90 transition cursor-pointer"
                      title="Cheer with love"
                    >
                      <Heart className="w-3.5 h-3.5 text-red-600 fill-current" />
                      <span className="font-bold">{note.reactions.heart}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playStampSound(0.08);
                        onReactNote(note.id, 'coffee');
                      }}
                      className="px-2 py-0.5 rounded bg-black/5 hover:bg-black/15 text-xs flex items-center gap-1 active:scale-90 transition cursor-pointer"
                      title="Gift coffee"
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-800" />
                      <span className="font-bold">{note.reactions.coffee}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playStampSound(0.08);
                        onReactNote(note.id, 'star');
                      }}
                      className="px-2 py-0.5 rounded bg-black/5 hover:bg-black/15 text-xs flex items-center gap-1 active:scale-90 transition cursor-pointer"
                      title="Award star"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span className="font-bold">{note.reactions.star}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playStampSound(0.08);
                        onReactNote(note.id, 'fire');
                      }}
                      className="px-2 py-0.5 rounded bg-black/5 hover:bg-black/15 text-xs flex items-center gap-1 active:scale-90 transition cursor-pointer"
                      title="Awesome fire vibe"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-600 fill-current" />
                      <span className="font-bold">{note.reactions.fire}</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-hand font-bold opacity-60 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> Pinned
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Corkboard Onboarding Hint Banner (6-second auto fade out) */}
      {showOnboardingHint && (
        <div
          id="corkboard-onboarding-hint"
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] sm:max-w-xl px-4 py-2.5 rounded-2xl bg-slate-900/95 border-2 border-amber-400/80 text-amber-100 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in text-xs font-mono select-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <p className="leading-snug text-[11px] sm:text-xs">
              <span className="text-amber-300 font-bold">Tip:</span> Double-click anywhere on the cork to pin a note, or drag the canvas to pan around! Check the Radar Minimap for note clusters.
            </p>
          </div>
          <button
            onClick={() => {
              setShowOnboardingHint(false);
              try {
                localStorage.setItem('has_seen_corkboard_hint', 'true');
              } catch {}
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title="Dismiss Hint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Bottom Studio Controls & Mini-Map Radar */}
      <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-2xl">
        <span className="text-[11px] font-mono text-slate-300 flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>[Drag] Pan</span>
          <span>•</span>
          <span>[Wheel] Zoom</span>
          <span>•</span>
          <span>[F] Toggle Studio</span>
          <span>•</span>
          <span>[Esc] Close</span>
        </span>
      </div>

      {/* Interactive Floating Minimap / Viewport Radar */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-amber-900/60 shadow-2xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 px-1">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Canvas Radar</span>
            </span>
            <button
              onClick={() => setShowMinimap(false)}
              className="text-slate-400 hover:text-white"
              title="Hide minimap"
            >
              ✕
            </button>
          </div>

          <div
            onClick={handleMinimapClick}
            style={{ width: `${minimapW}px`, height: `${minimapH}px` }}
            className="cork-texture rounded-lg border-2 border-amber-950/80 relative overflow-hidden cursor-crosshair shadow-inner"
            title="Click to pan camera"
          >
            {/* Miniature note markers */}
            {notes.map((n, i) => {
              const pos = getNoteCoords(n, i);
              return (
                <div
                  key={`mini-${n.id}`}
                  style={{
                    left: `${pos.x * minimapScale}px`,
                    top: `${pos.y * minimapScale}px`,
                    backgroundColor: n.color,
                  }}
                  className="absolute w-3.5 h-2.5 rounded-[1px] shadow-sm border border-black/20 pointer-events-none"
                />
              );
            })}

            {/* Camera Viewport Indicator Box */}
            <div
              style={{
                left: `${viewMiniX}px`,
                top: `${viewMiniY}px`,
                width: `${viewMiniW}px`,
                height: `${viewMiniH}px`,
              }}
              className="absolute border-2 border-amber-400 bg-amber-400/20 rounded shadow-[0_0_12px_rgba(251,191,36,0.6)] pointer-events-none transition-all duration-75"
            />
          </div>
        </div>
      )}

      {/* Re-open Minimap button if hidden */}
      {!showMinimap && (
        <button
          onClick={() => setShowMinimap(true)}
          className="absolute bottom-4 right-4 z-40 px-3 py-1.5 bg-slate-900/90 text-amber-300 border border-slate-700 rounded-xl text-xs font-mono shadow-2xl cursor-pointer hover:bg-slate-800"
        >
          🗺️ Show Radar
        </button>
      )}

      {/* Add Note Modal inside Studio */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-[#ff9e80] rounded-2xl w-full max-w-lg shadow-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📌</span>
                <h3 className="font-display font-bold text-white text-base">
                  Pin New Memo to Corkboard
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span>Author Name</span>
                      <span className="text-[9px] text-amber-400/90 font-medium">
                        (Optional)
                      </span>
                    </label>

                    {/* Anonymous Quick Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAnonymous((prev) => {
                          const next = !prev;
                          if (next) {
                            setModalAuthor('Anonymous');
                          } else if (modalAuthor === 'Anonymous') {
                            setModalAuthor('');
                          }
                          return next;
                        });
                        playMechanicalClick('toggle', 0.05);
                      }}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition flex items-center gap-1 cursor-pointer select-none ${
                        isAnonymous
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title="Toggle automatic Anonymous posting"
                    >
                      <span>{isAnonymous ? '✓ Anonymous' : '+ Custom Name'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={24}
                      value={isAnonymous ? 'Anonymous' : modalAuthor}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModalAuthor(val);
                        if (isAnonymous && val !== 'Anonymous') {
                          setIsAnonymous(false);
                        }
                      }}
                      placeholder={isAnonymous ? 'Anonymous (Automatic)' : 'e.g. Dreamer (or blank for Anonymous)'}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition font-mono ${
                        isAnonymous
                          ? 'border-amber-400/50 text-amber-200/90 bg-amber-950/20'
                          : 'border-slate-700 focus:border-[#ff9e80]'
                      }`}
                    />
                    {isAnonymous && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-amber-400/80 bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-400/30 pointer-events-none">
                        Auto Anon
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                    <span>
                      {isAnonymous
                        ? '⚡ Automatically posting as Anonymous'
                        : 'Optional — empty name defaults to Anonymous'}
                    </span>
                    {isAnonymous ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAnonymous(false);
                          setModalAuthor('');
                          playMechanicalClick('subtle', 0.05);
                        }}
                        className="text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                      >
                        Custom name
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAnonymous(true);
                          setModalAuthor('Anonymous');
                          playMechanicalClick('subtle', 0.05);
                        }}
                        className="text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                      >
                        Make Anonymous
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Paper Color
                  </label>
                  <select
                    value={modalColor}
                    onChange={(e) => setModalColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9e80]"
                  >
                    <option value="#fef08a">Butter Yellow</option>
                    <option value="#bbf7d0">Mint Green</option>
                    <option value="#fbcfe8">Sakura Pink</option>
                    <option value="#fed7aa">Warm Peach</option>
                    <option value="#bae6fd">Sky Blue</option>
                    <option value="#e9d5ff">Lavender</option>
                    <option value="#d7ba89">Kraft Paper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Handwriting Font
                  </label>
                  <select
                    value={modalFont}
                    onChange={(e) => setModalFont(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9e80]"
                  >
                    <option value="font-hand">✍️ Handwriting (Caveat)</option>
                    <option value="font-hand-alt">✏️ Casual (Gaegu)</option>
                    <option value="font-pixel">🕹️ Pixel Typewriter</option>
                    <option value="font-display">🖋️ Clean Display</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">
                    Badge Emoji
                  </label>
                  <select
                    value={modalEmoji}
                    onChange={(e) => setModalEmoji(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#ff9e80]"
                  >
                    {['☕', '🎮', '✨', '🌿', '🎧', '🌙', '🐱', '📚', '💡', '🌱'].map((em) => (
                      <option key={em} value={em}>
                        {em} Badge
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  maxLength={160}
                  rows={3}
                  value={modalMessage}
                  onChange={(e) => setModalMessage(e.target.value)}
                  placeholder="Share a study tip, comforting memory, or favorite quote..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#ff9e80] font-hand text-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff9e80] hover:bg-amber-400 text-slate-950 font-display font-bold text-xs rounded-lg transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pin to Studio Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Curated Polaroid Modal inside Studio */}
      <AddPolaroidModal
        isOpen={isAddPolaroidModalOpen}
        onClose={() => setIsAddPolaroidModalOpen(false)}
        onAddPolaroid={onAddNote}
        defaultCoordinates={pendingPinCoords}
      />
    </div>
  );
};
