import React, { useState, useMemo, useEffect } from 'react';
import { X, Pin, Sparkles, Heart, Coffee, Star, Flame, Search, Maximize2, ArrowUpDown, Camera, ZoomIn, ZoomOut } from 'lucide-react';
import { CorkboardNote } from '../types';
import { playChime, playWinFanfare, playPinTackSound, playStampSound, playMechanicalClick, playPaperRustleSound } from '../utils/audio';
import { AddPolaroidModal } from './AddPolaroidModal';

interface CorkboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: CorkboardNote[];
  onAddNote: (note: Omit<CorkboardNote, 'id' | 'createdAt' | 'reactions'>) => void;
  onReactNote: (noteId: string, type: 'heart' | 'coffee' | 'star' | 'fire') => void;
  onOpenExpandedStudio?: () => void;
}

const COLOR_OPTIONS = [
  { val: '#fef08a', label: 'Butter Yellow' },
  { val: '#bbf7d0', label: 'Mint Green' },
  { val: '#fbcfe8', label: 'Sakura Pink' },
  { val: '#fed7aa', label: 'Warm Peach' },
  { val: '#bae6fd', label: 'Sky Blue' },
  { val: '#e9d5ff', label: 'Lavender' },
  { val: '#d7ba89', label: 'Kraft Paper' },
];

const EMOJI_OPTIONS = ['☕', '🎮', '✨', '🌿', '🎧', '🌙', '🐱', '📚'];

export const CorkboardModal: React.FC<CorkboardModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onReactNote,
  onOpenExpandedStudio,
}) => {
  const [authorName, setAuthorName] = useState('Anonymous');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [message, setMessage] = useState('');
  const [color, setColor] = useState('#fef08a');
  const [fontClass, setFontClass] = useState('font-hand');
  const [emoji, setEmoji] = useState('☕');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reactions'>('newest');
  const [isPolaroidModalOpen, setIsPolaroidModalOpen] = useState(false);
  const [cardZoom, setCardZoom] = useState<number>(1.0);

  // Keyboard zoom controls inside Corkboard modal
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
        setCardZoom((z) => Math.min(1.4, +(z + 0.15).toFixed(2)));
        playMechanicalClick('subtle', 0.05);
      } else if (
        e.key === '-' ||
        e.key === '_' ||
        ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_'))
      ) {
        e.preventDefault();
        setCardZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)));
        playMechanicalClick('subtle', 0.05);
      } else if (
        e.key === '0' ||
        ((e.ctrlKey || e.metaKey) && e.key === '0')
      ) {
        e.preventDefault();
        setCardZoom(1.0);
        playMechanicalClick('toggle', 0.06);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Memoized filter and sort
  const filteredAndSortedNotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = notes.filter((n) => {
      if (!q) return true;
      const titleMatch = n.polaroidTitle ? n.polaroidTitle.toLowerCase().includes(q) : false;
      return (
        n.name.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.emoji.includes(q) ||
        titleMatch
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      if (sortBy === 'reactions') {
        const totalA =
          (a.reactions?.heart || 0) +
          (a.reactions?.coffee || 0) +
          (a.reactions?.star || 0) +
          (a.reactions?.fire || 0);
        const totalB =
          (b.reactions?.heart || 0) +
          (b.reactions?.coffee || 0) +
          (b.reactions?.star || 0) +
          (b.reactions?.fire || 0);
        return totalB - totalA;
      }
      return 0;
    });
  }, [notes, searchQuery, sortBy]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const finalAuthor = isAnonymous
      ? 'Anonymous'
      : (authorName.trim() || 'Anonymous');

    onAddNote({
      name: finalAuthor,
      message: message.trim(),
      color,
      fontClass,
      emoji,
      category: 'memo',
    });

    setMessage('');
    playPinTackSound(0.12);
    setTimeout(() => playPaperRustleSound('flutter', 0.08), 80);
    setTimeout(() => playWinFanfare(), 180);
  };

  const getPushpinColor = (idx: number) => {
    const pinColors = ['bg-red-500', 'bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600'];
    return pinColors[idx % pinColors.length];
  };

  const getRotationClass = (idx: number) => {
    const rots = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1', '-rotate-3'];
    return rots[idx % rots.length];
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border-2 border-[#ff9e80] rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9e80]/20 text-[#ff9e80] border border-[#ff9e80]/40 flex items-center justify-center text-xl">
              📌
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Cozy Desk Bulletin Board</span>
                <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">
                  • Interactive Corkboard
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-400/20 text-emerald-400 border border-emerald-400/40 font-mono">
                  ● {notes.length} Notes Pinned
                </span>
                <span>Stamp reactions to encourage creators!</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExpandedStudio && (
              <button
                onClick={() => {
                  playPinTackSound(0.09);
                  onClose();
                  onOpenExpandedStudio();
                }}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                title="Expand to Full 2800x2200 Pannable Studio (F)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Expanded Studio</span>
                <span className="text-[9px] bg-amber-400/20 px-1 rounded border border-amber-400/30">F</span>
              </button>
            )}

            <button
              onClick={() => {
                playMechanicalClick('toggle', 0.08);
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input & Form Section */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={24}
                  value={isAnonymous ? 'Anonymous' : authorName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAuthorName(val);
                    if (isAnonymous && val !== 'Anonymous') {
                      setIsAnonymous(false);
                    }
                  }}
                  placeholder={isAnonymous ? 'Anonymous (Auto)' : 'Your Name (Optional)'}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none transition ${
                    isAnonymous
                      ? 'border-amber-400/50 text-amber-200/90 bg-amber-950/20'
                      : 'border-slate-700 focus:border-[#ff9e80]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsAnonymous((prev) => {
                      const next = !prev;
                      if (next) {
                        setAuthorName('Anonymous');
                      } else if (authorName === 'Anonymous') {
                        setAuthorName('');
                      }
                      return next;
                    });
                    playMechanicalClick('toggle', 0.05);
                  }}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition ${
                    isAnonymous
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                  title="Toggle automatic Anonymous author"
                >
                  {isAnonymous ? '✓ Anon' : '+ Name'}
                </button>
              </div>

              {/* Color Selector */}
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff9e80]"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.val} value={c.val}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Font Selector */}
              <select
                value={fontClass}
                onChange={(e) => setFontClass(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff9e80]"
              >
                <option value="font-hand">✍️ Handwriting (Caveat)</option>
                <option value="font-hand-alt">✏️ Casual (Gaegu)</option>
                <option value="font-pixel">🕹️ Pixel Typewriter</option>
                <option value="font-display">🖋️ Clean Display</option>
              </select>

              {/* Emoji Tag Selector */}
              <select
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff9e80]"
              >
                {EMOJI_OPTIONS.map((em) => (
                  <option key={em} value={em}>
                    {em} Badge
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                required
                maxLength={140}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a sweet memo, study advice, or inspiring thought..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#ff9e80] font-hand text-lg"
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#ff9e80] hover:bg-amber-400 text-slate-950 font-display font-bold text-xs rounded-lg transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pin Memo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick('subtle', 0.06);
                    setIsPolaroidModalOpen(true);
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-400/40 font-display font-bold text-xs rounded-lg transition active:scale-95 shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  title="Add curated polaroid with washi tape accent"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Polaroid</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search & Filter Bar with Sort by dropdown */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px] max-w-lg">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes & polaroids..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Sort by Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <label htmlFor="corkboard-sort-by" className="text-[11px] font-mono text-slate-400">
                Sort by:
              </label>
              <select
                id="corkboard-sort-by"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'newest' | 'oldest' | 'reactions');
                  playMechanicalClick('subtle', 0.05);
                }}
                className="bg-transparent text-amber-300 font-mono text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-slate-900 text-white">
                  Newest
                </option>
                <option value="oldest" className="bg-slate-900 text-white">
                  Oldest
                </option>
                <option value="reactions" className="bg-slate-900 text-white">
                  Most Reactions
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => {
                  setCardZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)));
                  playMechanicalClick('subtle', 0.05);
                }}
                className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded active:scale-90 transition cursor-pointer"
                title="Zoom Out Notes (-)"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardZoom(1.0);
                  playMechanicalClick('toggle', 0.06);
                }}
                className="px-1.5 text-[10px] font-mono font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                title="Reset Notes Zoom (100%)"
              >
                {Math.round(cardZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardZoom((z) => Math.min(1.4, +(z + 0.15).toFixed(2)));
                  playMechanicalClick('subtle', 0.05);
                }}
                className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded active:scale-90 transition cursor-pointer"
                title="Zoom In Notes (+)"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                playMechanicalClick('subtle', 0.06);
                setIsPolaroidModalOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
            >
              <Camera className="w-3 h-3 text-amber-400" />
              <span>+ Add Polaroid</span>
            </button>

            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Showing {filteredAndSortedNotes.length} of {notes.length}
            </span>
          </div>
        </div>

        {/* Corkboard Surface Wall */}
        <div className="flex-1 cork-texture p-4 sm:p-6 overflow-y-auto min-h-[320px]">
          {filteredAndSortedNotes.length === 0 ? (
            <div className="text-center py-16 text-amber-950 font-hand text-2xl">
              No notes match your filter! Pin a memo or add a curated polaroid! 📌
            </div>
          ) : (
            <div
              style={{
                transform: cardZoom !== 1 ? `scale(${cardZoom})` : undefined,
                transformOrigin: 'top center',
              }}
              className={`transition-transform duration-150 grid gap-5 ${
                cardZoom < 0.85
                  ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4'
                  : cardZoom > 1.2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredAndSortedNotes.map((note, idx) => {
                // If it's a Polaroid with washi tape
                if (note.isPolaroid) {
                  return (
                    <div
                      key={note.id}
                      className={`bg-[#fdfbf7] p-3.5 pb-4 rounded-sm shadow-2xl text-slate-900 flex flex-col justify-between min-h-[260px] transform ${getRotationClass(
                        idx
                      )} border border-black/15 relative transition-transform hover:scale-105 duration-200 select-none`}
                    >
                      {/* Washi Tape Accent at Top */}
                      <div
                        style={{
                          backgroundColor:
                            note.washiTapeColor || 'rgba(254, 240, 138, 0.85)',
                        }}
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 washi-tape -rotate-2 z-20 pointer-events-none"
                      />

                      {/* Pushpin at Top Left */}
                      <div className="absolute -top-2 left-3 z-30">
                        <div className="pushpin-head bg-red-600 shadow-md" />
                      </div>

                      {/* Photo Area with Gradient and Scene Art */}
                      <div
                        className={`w-full h-36 rounded-sm bg-gradient-to-br ${
                          note.polaroidGradient || 'from-slate-700 via-sky-900 to-indigo-950'
                        } p-3 flex flex-col justify-between text-white relative overflow-hidden shadow-inner border border-black/10 mt-1`}
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
                        <p className="font-hand text-lg text-slate-900 leading-snug line-clamp-3">
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
                            onClick={() => {
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
                            onClick={() => {
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
                            onClick={() => {
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
                            onClick={() => {
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

                // Regular Sticky Note
                return (
                  <div
                    key={note.id}
                    style={{ backgroundColor: note.color }}
                    className={`p-4 rounded-md shadow-xl text-slate-900 flex flex-col justify-between min-h-[155px] transform ${getRotationClass(
                      idx
                    )} border-t-4 border-black/15 paper-folded relative transition-transform hover:scale-105 duration-200 select-none`}
                  >
                    {/* Pushpin Header */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className={`pushpin-head ${getPushpinColor(idx)}`} />
                    </div>

                    {/* Note Meta */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-black/10 mt-1">
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs">
                        <span>{note.emoji}</span>
                        <span className="truncate max-w-[130px] flex items-center gap-1">
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
                    <p className={`text-lg text-slate-900 leading-snug my-2 break-words ${note.fontClass}`}>
                      "{note.message}"
                    </p>

                    {/* Reactions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
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
                          onClick={() => {
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
                          onClick={() => {
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
                          onClick={() => {
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

                      <span className="text-[9px] font-hand font-bold opacity-60 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Pinned
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Curated Polaroid Modal */}
      <AddPolaroidModal
        isOpen={isPolaroidModalOpen}
        onClose={() => setIsPolaroidModalOpen(false)}
        onAddPolaroid={onAddNote}
      />
    </div>
  );
};
