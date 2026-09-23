import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Square,
  Pin,
  Trash2,
  Palette,
  Type,
  GripHorizontal,
  Plus,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Edit3,
  Share2,
} from 'lucide-react';
import { StickyNoteData } from '../../types';
import { playMechanicalClick, playPaperRustleSound, playPinTackSound } from '../../utils/audio';

interface StickyNoteWidgetProps {
  note: StickyNoteData;
  onUpdate: (updated: StickyNoteData) => void;
  onDelete?: (id: string) => void;
  onPinToCorkboard: (note: StickyNoteData) => void;
  isHighlighted?: boolean;
}

const PASTEL_COLORS = [
  { name: 'Yellow', hex: '#fef08a' },
  { name: 'Mint', hex: '#bbf7d0' },
  { name: 'Pink', hex: '#fbcfe8' },
  { name: 'Peach', hex: '#fed7aa' },
  { name: 'Sky', hex: '#bae6fd' },
  { name: 'Lavender', hex: '#e9d5ff' },
  { name: 'Kraft', hex: '#d7ba89' },
];

const FONTS = [
  { label: 'Handwriting', cls: 'font-hand', badge: 'Caveat' },
  { label: 'Casual Gaegu', cls: 'font-hand-alt', badge: 'Gaegu' },
  { label: 'Pixel Retro', cls: 'font-pixel', badge: 'VT323' },
  { label: 'Clean Display', cls: 'font-display', badge: 'Space' },
];

export const StickyNoteWidget: React.FC<StickyNoteWidgetProps> = ({
  note,
  onUpdate,
  onDelete,
  onPinToCorkboard,
  isHighlighted = false,
}) => {
  const [newChecklistText, setNewChecklistText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const editItemInputRef = useRef<HTMLInputElement | null>(null);
  const addInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus new notes if highlighted
  useEffect(() => {
    if (isHighlighted && contentInputRef.current) {
      contentInputRef.current.focus();
    }
  }, [isHighlighted]);

  // Focus editing input when active
  useEffect(() => {
    if (editingItemIdx !== null && editItemInputRef.current) {
      editItemInputRef.current.focus();
      editItemInputRef.current.select();
    }
  }, [editingItemIdx]);

  // Parse lines for checklist
  const lines = (note.content || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const checkedArray = note.checkedItems || [];
  const completedCount = lines.filter((_, i) => !!checkedArray[i]).length;
  const totalCount = lines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentColor = note.color || PASTEL_COLORS[0].hex;
  const currentFont = note.fontClass || FONTS[0].cls;
  const currentFontObj = FONTS.find((f) => f.cls === currentFont) || FONTS[0];
  const rotation = note.rotation ?? 0;

  const handleSelectColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playPaperRustleSound('flutter', 0.08);
    onUpdate({ ...note, color: hex });
    setShowColorPicker(false);
  };

  const handleSelectFont = (fontCls: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('subtle', 0.06);
    onUpdate({ ...note, fontClass: fontCls });
    setShowFontPicker(false);
  };

  const handleToggleChecklistMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('toggle', 0.07);
    const nextMode = !note.isChecklist;
    onUpdate({
      ...note,
      isChecklist: nextMode,
      checkedItems: nextMode
        ? note.checkedItems || new Array(lines.length).fill(false)
        : note.checkedItems,
    });
  };

  const handleToggleTilt = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPaperRustleSound('flutter', 0.06);
    const isStraight = Math.abs(rotation) < 0.2;
    onUpdate({
      ...note,
      rotation: isStraight ? 2.5 : 0,
    });
  };

  const handleTogglePinToDesk = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPinned = !note.pinnedToDesk;
    if (nextPinned) {
      playPinTackSound(0.12);
    } else {
      playPaperRustleSound('flutter', 0.08);
    }
    onUpdate({
      ...note,
      pinnedToDesk: nextPinned,
    });
  };

  const toggleCheckItem = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('key', 0.07);
    setTimeout(() => playPaperRustleSound('scribble', 0.06), 40);

    const updated = [...(note.checkedItems || new Array(lines.length).fill(false))];
    while (updated.length < lines.length) updated.push(false);
    updated[idx] = !updated[idx];

    onUpdate({ ...note, checkedItems: updated });
  };

  const handleStartEditItem = (idx: number, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItemIdx(idx);
    setEditingItemText(text);
  };

  const handleSaveEditItem = (idx: number) => {
    if (editingItemIdx === null) return;
    const trimmed = editingItemText.trim();
    if (!trimmed) {
      handleDeleteChecklistItem(idx);
    } else {
      const updatedLines = [...lines];
      updatedLines[idx] = trimmed;
      onUpdate({
        ...note,
        content: updatedLines.join('\n'),
      });
      playMechanicalClick('key', 0.06);
    }
    setEditingItemIdx(null);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newChecklistText.trim();
    if (!trimmed) return;

    playMechanicalClick('key', 0.08);
    setTimeout(() => playPaperRustleSound('scribble', 0.06), 40);

    const updatedContent =
      note.content && note.content.trim().length > 0
        ? `${note.content.trim()}\n${trimmed}`
        : trimmed;
    const updatedChecked = [...(note.checkedItems || []), false];

    setNewChecklistText('');
    onUpdate({
      ...note,
      content: updatedContent,
      checkedItems: updatedChecked,
    });

    // Keep focused for rapidly adding tasks
    setTimeout(() => {
      addInputRef.current?.focus();
    }, 10);
  };

  const handleDeleteChecklistItem = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playPaperRustleSound('scribble', 0.06);
    const remainingLines = lines.filter((_, i) => i !== idx);
    const remainingChecked = (note.checkedItems || []).filter((_, i) => i !== idx);
    onUpdate({
      ...note,
      content: remainingLines.join('\n'),
      checkedItems: remainingChecked,
    });
    if (editingItemIdx === idx) {
      setEditingItemIdx(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...note, content: e.target.value });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...note, title: e.target.value });
  };

  return (
    <div
      style={{
        backgroundColor: currentColor,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`w-72 text-slate-900 p-3 shadow-xl rounded-md flex flex-col justify-between border-t-4 border-black/15 paper-folded relative group transition-all duration-200 select-none ${
        isHighlighted
          ? 'ring-2 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-[1.02]'
          : 'hover:shadow-2xl'
      }`}
    >
      {/* 3D Pushpin or Washi Tape Top Accent with Tactile Grab Handle */}
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform z-10"
        title={note.pinnedToDesk ? 'Pinned firmly to desk (Click to unpin)' : 'Click to pin memo to desk'}
        onClick={handleTogglePinToDesk}
        data-no-drag
      >
        {note.pinnedToDesk ? (
          <div className="pushpin-head bg-rose-500 flex items-center justify-center shadow-lg ring-2 ring-rose-300/80 scale-110">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 pointer-events-none" />
          </div>
        ) : Math.abs(Math.round(rotation)) % 2 === 0 ? (
          <div className="pushpin-head bg-amber-600/90 flex items-center justify-center shadow-md hover:bg-rose-500 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 pointer-events-none" />
          </div>
        ) : (
          <div className="w-18 h-4.5 washi-tape flex items-center justify-center text-[8px] font-mono text-slate-700 font-bold gap-1 shadow-sm rounded-sm">
            <GripHorizontal className="w-2.5 h-2.5 opacity-60" />
            <span>MEMO</span>
          </div>
        )}
      </div>

      {/* Note Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-black/10 mt-1 cursor-grab active:cursor-grabbing gap-1">
        {/* Title Input */}
        <input
          type="text"
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          value={note.title}
          onChange={handleTitleChange}
          className="bg-transparent font-mono font-bold text-xs tracking-wider uppercase text-black/85 outline-none min-w-0 flex-1 max-w-[95px] placeholder:text-black/35 hover:bg-black/5 px-1 py-0.5 rounded cursor-text select-text transition truncate"
          placeholder="Title..."
          title="Click to rename note title"
        />

        {/* Action Controls */}
        <div
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-0.5 relative shrink-0"
        >
          {/* Color Swatch Toggle Button */}
          <button
            type="button"
            data-no-drag
            onClick={(e) => {
              e.stopPropagation();
              playPaperRustleSound('flutter', 0.05);
              setShowColorPicker(!showColorPicker);
              setShowFontPicker(false);
            }}
            className={`p-1.5 rounded-lg transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center ${
              showColorPicker
                ? 'bg-black/20 text-black shadow-inner'
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title="Choose Pastel Note Color"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Typography Font Toggle Button */}
          <button
            type="button"
            data-no-drag
            onClick={(e) => {
              e.stopPropagation();
              playMechanicalClick('subtle', 0.06);
              setShowFontPicker(!showFontPicker);
              setShowColorPicker(false);
            }}
            className={`p-1.5 rounded-lg transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center ${
              showFontPicker
                ? 'bg-black/20 text-black shadow-inner'
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title={`Font: ${currentFontObj.label} (Click to change)`}
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {/* Checklist Mode Toggle */}
          <button
            type="button"
            data-no-drag
            onClick={handleToggleChecklistMode}
            className={`p-1.5 rounded-lg transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center ${
              note.isChecklist
                ? 'bg-black/20 text-black font-bold ring-1 ring-black/20'
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title={note.isChecklist ? 'Switch to Plain Memo' : 'Switch to Interactive Checklist'}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          {/* Straighten / Tilt Toggle */}
          <button
            type="button"
            data-no-drag
            onClick={handleToggleTilt}
            className="p-1.5 rounded-lg hover:bg-black/10 text-black/60 hover:text-black transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
            title={Math.abs(rotation) < 0.2 ? 'Add playful tilt' : 'Straighten note (0°)'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Pin / Unpin to Desk Board */}
          <button
            type="button"
            data-no-drag
            onClick={handleTogglePinToDesk}
            className={`p-1.5 rounded-lg transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center ${
              note.pinnedToDesk
                ? 'bg-rose-500/20 text-rose-800 font-bold ring-1 ring-rose-500/50 shadow-inner'
                : 'hover:bg-black/10 text-black/60 hover:text-black'
            }`}
            title={
              note.pinnedToDesk
                ? 'Pinned to Desk Board (Click to unpin & move freely)'
                : 'Pin to Desk Board (Lock in place)'
            }
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinnedToDesk ? 'fill-rose-600 text-rose-700' : ''}`} />
          </button>

          {/* Pin a Copy to Community Corkboard */}
          <button
            type="button"
            data-no-drag
            onClick={() => {
              playPinTackSound(0.09);
              onPinToCorkboard(note);
            }}
            className="p-1.5 rounded-lg hover:bg-black/10 text-black/60 hover:text-black transition cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
            title="Pin a copy to Community Corkboard Bulletin"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Memo */}
          {onDelete && (
            <button
              id={`delete-sticky-${note.id}`}
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                playPaperRustleSound('drop', 0.08);
                onDelete(note.id);
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-700 hover:text-rose-900 transition cursor-pointer shrink-0 border border-rose-400/30 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
              title="Delete memo"
              aria-label="Delete memo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Color Palette Popover Bar */}
          {showColorPicker && (
            <div
              data-no-drag
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-30 bg-slate-900/95 border border-slate-700/80 p-2 rounded-xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            >
              {PASTEL_COLORS.map((c) => {
                const isSelected = currentColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    data-no-drag
                    onClick={(e) => handleSelectColor(c.hex, e)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full border border-black/20 flex items-center justify-center transition cursor-pointer hover:scale-110 ${
                      isSelected ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Font Family Popover Menu */}
          {showFontPicker && (
            <div
              data-no-drag
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-30 bg-slate-900/95 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl flex flex-col gap-1 backdrop-blur-md w-36 animate-in fade-in zoom-in-95 duration-150"
            >
              {FONTS.map((f) => {
                const isSelected = currentFont === f.cls;
                return (
                  <button
                    key={f.cls}
                    type="button"
                    data-no-drag
                    onClick={(e) => handleSelectFont(f.cls, e)}
                    className={`px-2 py-1 rounded text-left text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-200 font-bold border border-amber-400/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${f.cls}`}
                  >
                    <span>{f.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-300" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Note Body Area */}
      {note.isChecklist ? (
        <div
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          className="my-1.5 flex flex-col gap-1 min-h-[90px] max-h-[175px] overflow-y-auto pr-1"
        >
          {/* Progress Header if items exist */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between text-[10px] font-mono text-black/65 px-1 pb-1 border-b border-black/10 mb-0.5">
              <span>
                {completedCount}/{totalCount} completed
              </span>
              <div className="w-16 h-1.5 bg-black/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Checklist Items List */}
          {lines.length === 0 && (
            <p className="text-xs text-black/40 italic font-mono py-2 text-center">
              No tasks yet. Type below & press Enter!
            </p>
          )}

          {lines.map((text, idx) => {
            const isDone = !!checkedArray[idx];
            const isEditing = editingItemIdx === idx;

            return (
              <div
                key={idx}
                className="group/item flex items-center justify-between gap-1.5 text-sm font-hand leading-tight py-0.5 px-1 rounded hover:bg-black/5 transition"
              >
                {/* Checkbox button */}
                <button
                  type="button"
                  data-no-drag
                  onClick={(e) => toggleCheckItem(idx, e)}
                  className="cursor-pointer shrink-0 text-left p-0.5 rounded hover:bg-black/10 transition"
                  title={isDone ? 'Mark task as incomplete' : 'Mark task as done'}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-black/65 shrink-0" />
                  )}
                </button>

                {/* Inline Editing or Text View */}
                {isEditing ? (
                  <input
                    ref={editItemInputRef}
                    type="text"
                    data-no-drag
                    value={editingItemText}
                    onChange={(e) => setEditingItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditItem(idx);
                      if (e.key === 'Escape') setEditingItemIdx(null);
                    }}
                    onBlur={() => handleSaveEditItem(idx)}
                    className="flex-1 bg-white/70 text-slate-950 font-medium px-1.5 py-0.5 rounded text-sm outline-none border border-black/30 select-text"
                  />
                ) : (
                  <span
                    onClick={(e) => handleStartEditItem(idx, text, e)}
                    className={`flex-1 break-words cursor-text select-text transition ${
                      isDone
                        ? 'line-through text-black/40 font-normal'
                        : 'text-slate-900 font-medium'
                    }`}
                    title="Click text to edit"
                  >
                    {text}
                  </span>
                )}

                {/* Action buttons (Edit & Delete) */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition">
                  {!isEditing && (
                    <button
                      type="button"
                      data-no-drag
                      onClick={(e) => handleStartEditItem(idx, text, e)}
                      className="text-black/40 hover:text-black transition p-0.5 rounded cursor-pointer"
                      title="Edit task text"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    data-no-drag
                    onClick={(e) => handleDeleteChecklistItem(idx, e)}
                    className="text-black/40 hover:text-rose-700 transition p-0.5 rounded cursor-pointer"
                    title="Remove task"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Add Checklist Item */}
          <form
            onSubmit={handleAddChecklistItem}
            data-no-drag
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 pt-1.5 border-t border-black/10 mt-1"
          >
            <input
              ref={addInputRef}
              type="text"
              data-no-drag
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="+ Add task (press Enter)..."
              className="flex-1 bg-black/5 hover:bg-black/10 focus:bg-white/70 text-xs font-mono px-2 py-1 rounded outline-none placeholder:text-black/40 text-black select-text transition"
            />
            <button
              type="submit"
              data-no-drag
              disabled={!newChecklistText.trim()}
              className="p-1 bg-black/10 hover:bg-black/20 disabled:opacity-30 rounded text-black transition cursor-pointer"
              title="Add task item (Enter)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <div
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          className="my-1.5 flex flex-col flex-1"
        >
          <textarea
            ref={contentInputRef}
            data-no-drag
            value={note.content}
            onChange={handleTextChange}
            rows={3}
            placeholder="Click to write notes, tasks, or cozy thoughts..."
            className={`w-full bg-transparent resize-none border-none outline-none text-slate-900 leading-snug text-lg min-h-[85px] max-h-[175px] placeholder:text-black/35 select-text cursor-text ${currentFont}`}
          />
        </div>
      )}

      {/* Footer Meta & Tactile Drag Hint */}
      <div className="flex items-center justify-between text-[9px] font-mono text-black/50 pt-1 border-t border-black/10 cursor-grab active:cursor-grabbing">
        <span className="flex items-center gap-1">
          {note.pinnedToDesk ? (
            <span className="flex items-center gap-1 text-rose-700 font-bold">
              <Pin className="w-2.5 h-2.5 fill-rose-600" />
              <span>Pinned on desk</span>
            </span>
          ) : (
            <>
              <GripHorizontal className="w-2.5 h-2.5 opacity-60" />
              <span>Drag Desk Note</span>
            </>
          )}
        </span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              type="button"
              data-no-drag
              onClick={(e) => {
                e.stopPropagation();
                playPaperRustleSound('drop', 0.08);
                onDelete(note.id);
              }}
              className="text-black/50 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer transition font-mono text-[9px] hover:underline"
              title="Delete memo"
            >
              <Trash2 className="w-2.5 h-2.5 text-rose-600" />
              <span>Delete</span>
            </button>
          )}
          <span className="font-hand text-xs font-bold text-black/70">~ cozy memo ~</span>
        </div>
      </div>
    </div>
  );
};
