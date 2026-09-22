import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  Undo2,
  Trash2,
  Grid,
  Sparkles,
  Download,
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SketchpadData } from '../../types';
import {
  playMechanicalClick,
  playPaperRustleSound,
  playPixelDotSound,
} from '../../utils/audio';

interface SketchpadWidgetProps {
  data: SketchpadData;
  onUpdate: (updated: SketchpadData) => void;
  onDoodleDrawn?: () => void;
}

// Retro 16-color pixel art palette
const PIXEL_PALETTE = [
  '#000000', // Ink Black
  '#475569', // Slate Gray
  '#94a3b8', // Cool Silver
  '#ffffff', // Crisp White
  '#ef4444', // Warm Ruby
  '#f97316', // Tangerine
  '#f59e0b', // Amber Gold
  '#eab308', // Lemon Yellow
  '#22c55e', // Grass Green
  '#10b981', // Emerald Mint
  '#06b6d4', // Cyan Sky
  '#3b82f6', // Classic Azure
  '#6366f1', // Indigo Purple
  '#a855f7', // Vivid Violet
  '#ec4899', // Sakura Pink
  '#854d0e', // Cedar Brown
];

// Fun quick presets to inspire cozy pixel art
const PRESETS: Array<{ name: string; icon: string; size: 16; getPixels: () => string[] }> = [
  {
    name: 'Cozy Heart',
    icon: '❤️',
    size: 16,
    getPixels: () => {
      const p = new Array(256).fill('');
      const r = '#ef4444';
      const dr = '#991b1b';
      const wh = '#ffffff';
      const pts = [
        [3, 4], [3, 5], [3, 9], [3, 10],
        [4, 3], [4, 6], [4, 8], [4, 11],
        [5, 2], [5, 7], [5, 12],
        [6, 2], [6, 12],
        [7, 3], [7, 11],
        [8, 4], [8, 10],
        [9, 5], [9, 9],
        [10, 6], [10, 8],
        [11, 7],
      ];
      // outline
      pts.forEach(([y, x]) => { p[y * 16 + x] = dr; });
      // fill
      for (let y = 4; y <= 10; y++) {
        for (let x = 3; x <= 11; x++) {
          const idx = y * 16 + x;
          if (!p[idx] && x >= 3 && x <= 11) {
            p[idx] = r;
          }
        }
      }
      // highlight
      p[5 * 16 + 4] = wh;
      p[6 * 16 + 4] = wh;
      return p;
    },
  },
  {
    name: 'Star Sparkle',
    icon: '⭐',
    size: 16,
    getPixels: () => {
      const p = new Array(256).fill('');
      const yel = '#f59e0b';
      const gold = '#d97706';
      const wh = '#fef08a';
      // Center 8,8
      const shape = [
        [7, 7], [7, 8], [8, 7], [8, 8],
        [6, 7], [6, 8], [9, 7], [9, 8],
        [5, 7], [5, 8], [10, 7], [10, 8],
        [4, 7], [4, 8], [11, 7], [11, 8],
        [7, 5], [7, 6], [7, 9], [7, 10],
        [8, 5], [8, 6], [8, 9], [8, 10],
        [7, 3], [7, 4], [7, 11], [7, 12],
        [8, 3], [8, 4], [8, 11], [8, 12],
        [6, 6], [6, 9], [9, 6], [9, 9],
      ];
      shape.forEach(([y, x]) => { p[y * 16 + x] = yel; });
      p[7 * 16 + 7] = wh;
      p[7 * 16 + 8] = wh;
      p[8 * 16 + 7] = wh;
      p[8 * 16 + 8] = gold;
      return p;
    },
  },
  {
    name: 'Pixel Coffee',
    icon: '☕',
    size: 16,
    getPixels: () => {
      const p = new Array(256).fill('');
      const br = '#854d0e';
      const wh = '#ffffff';
      const st = '#94a3b8';
      // Mug body
      for (let y = 6; y <= 12; y++) {
        for (let x = 4; x <= 10; x++) {
          p[y * 16 + x] = wh;
        }
      }
      // Coffee top
      for (let x = 5; x <= 9; x++) {
        p[6 * 16 + x] = br;
      }
      // Handle
      p[8 * 16 + 11] = wh;
      p[9 * 16 + 11] = wh;
      p[10 * 16 + 11] = wh;
      p[9 * 16 + 12] = wh;
      // Steam
      p[3 * 16 + 6] = st;
      p[4 * 16 + 7] = st;
      p[2 * 16 + 8] = st;
      p[3 * 16 + 9] = st;
      return p;
    },
  },
  {
    name: 'Sprout',
    icon: '🌱',
    size: 16,
    getPixels: () => {
      const p = new Array(256).fill('');
      const gr = '#22c55e';
      const dg = '#15803d';
      const br = '#78350f';
      // Soil
      for (let x = 5; x <= 10; x++) p[13 * 16 + x] = br;
      // Stem
      p[12 * 16 + 7] = dg;
      p[11 * 16 + 7] = dg;
      p[10 * 16 + 7] = dg;
      p[9 * 16 + 8] = gr;
      p[8 * 16 + 8] = gr;
      // Left leaf
      p[9 * 16 + 6] = gr;
      p[8 * 16 + 5] = gr;
      p[9 * 16 + 5] = dg;
      // Right leaf
      p[7 * 16 + 9] = gr;
      p[7 * 16 + 10] = gr;
      p[8 * 16 + 10] = dg;
      return p;
    },
  },
];

export const SketchpadWidget: React.FC<SketchpadWidgetProps> = ({
  data,
  onUpdate,
  onDoodleDrawn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(PIXEL_PALETTE[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[][]>([]);
  const lastDrawnCellRef = useRef<number | null>(null);

  const gridSize = data.gridSize || 16;
  const totalPixels = gridSize * gridSize;

  // Ensure pixels array matches gridSize length
  const pixels = (data.pixels && data.pixels.length === totalPixels)
    ? data.pixels
    : new Array(totalPixels).fill('');

  // Draw pixels on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / gridSize;

    ctx.clearRect(0, 0, width, height);

    // Render paper background
    ctx.fillStyle = data.paperColor || '#fefce8'; // warm parchment
    ctx.fillRect(0, 0, width, height);

    // Render pixel grid lines if enabled
    if (data.showGrid) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= gridSize; i++) {
        const pos = Math.round(i * cellSize);
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(width, pos);
        ctx.stroke();
      }
    }

    // Render filled pixels
    for (let i = 0; i < pixels.length; i++) {
      const color = pixels[i];
      if (color) {
        const x = (i % gridSize) * cellSize;
        const y = Math.floor(i / gridSize) * cellSize;

        ctx.fillStyle = color;
        // Clean crisp pixel rectangle
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cellSize), Math.ceil(cellSize));
      }
    }
  }, [pixels, gridSize, data.showGrid, data.paperColor]);

  // Coordinate mapper from pointer event to cell index
  const getCellIndex = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): number | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;

      const col = Math.floor((x / rect.width) * gridSize);
      const row = Math.floor((y / rect.height) * gridSize);

      if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return null;
      return row * gridSize + col;
    },
    [gridSize]
  );

  const applyPixel = (cellIdx: number) => {
    if (cellIdx === lastDrawnCellRef.current) return;
    lastDrawnCellRef.current = cellIdx;

    const currentColor = pixels[cellIdx];
    const targetColor = isEraser ? '' : selectedColor;

    if (currentColor === targetColor) return;

    // Push previous state to undo history (limit to 20 states)
    setHistory((prev) => [...prev.slice(-19), [...pixels]]);

    const newPixels = [...pixels];
    newPixels[cellIdx] = targetColor;

    onUpdate({
      ...data,
      pixels: newPixels,
    });

    const colorIdx = PIXEL_PALETTE.indexOf(selectedColor);
    playPixelDotSound(colorIdx >= 0 ? colorIdx : 0, isEraser);
    onDoodleDrawn?.();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation(); // Prevent dragging parent widget
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    setIsDrawing(true);
    lastDrawnCellRef.current = null;
    const idx = getCellIndex(e);
    if (idx !== null) {
      applyPixel(idx);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const idx = getCellIndex(e);
    if (idx !== null) {
      applyPixel(idx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      setIsDrawing(false);
      lastDrawnCellRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    playPaperRustleSound('flutter', 0.08);
    const prevPixels = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    onUpdate({
      ...data,
      pixels: prevPixels,
    });
  };

  const handleClear = () => {
    if (pixels.every((p) => !p)) return;
    playPaperRustleSound('drop', 0.1);
    setHistory((prev) => [...prev.slice(-19), [...pixels]]);
    onUpdate({
      ...data,
      pixels: new Array(totalPixels).fill(''),
    });
  };

  const handleToggleGrid = () => {
    playMechanicalClick('subtle', 0.06);
    onUpdate({
      ...data,
      showGrid: !data.showGrid,
    });
  };

  const handleToggleResolution = () => {
    playMechanicalClick('toggle', 0.06);
    const nextSize: 16 | 24 = gridSize === 16 ? 24 : 16;
    onUpdate({
      ...data,
      gridSize: nextSize,
      pixels: new Array(nextSize * nextSize).fill(''),
    });
    setHistory([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playMechanicalClick('key', 0.08);

    // Create a high-res exported image for crisp pixel art
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 512;
    exportCanvas.height = 512;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    expCtx.imageSmoothingEnabled = false;
    expCtx.drawImage(canvas, 0, 0, 512, 512);

    const link = document.createElement('a');
    link.download = `cozydesk-sketch-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    playPaperRustleSound('scribble', 0.12);
    setHistory((prev) => [...prev.slice(-19), [...pixels]]);
    onUpdate({
      ...data,
      gridSize: 16,
      pixels: preset.getPixels(),
    });
    onDoodleDrawn?.();
  };

  const activePixelsCount = pixels.filter(Boolean).length;

  return (
    <div className="w-68 sm:w-72 bg-amber-50/95 dark:bg-stone-900/95 rounded-2xl p-3 shadow-xl border border-amber-900/20 dark:border-amber-500/20 backdrop-blur-md select-none">
      {/* Wooden / Vintage Header with Brass Spiral Binding */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/15 dark:border-stone-800">
        <div className="flex items-center gap-2">
          {/* Wire spiral binding rings */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-full bg-linear-to-b from-stone-400 via-stone-300 to-stone-500 shadow-xs border border-stone-600/40"
              />
            ))}
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
              <span className="text-amber-600 dark:text-amber-400">✎</span> Pixel Sketchpad
            </h3>
            <p className="text-[10px] text-stone-500 font-mono">
              {gridSize}×{gridSize} grid • {activePixelsCount} pixels
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleResolution}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/50 dark:bg-stone-800 hover:bg-amber-300/60 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-200 transition cursor-pointer"
            title={`Switch to ${gridSize === 16 ? '24×24' : '16×16'} resolution`}
          >
            {gridSize}²
          </button>
          <button
            onClick={handleToggleGrid}
            className={`p-1 rounded transition cursor-pointer ${
              data.showGrid
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                : 'text-stone-400 hover:bg-amber-100 dark:hover:bg-stone-800'
            }`}
            title={data.showGrid ? 'Hide Grid' : 'Show Grid'}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 rounded text-stone-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title="Export PNG doodle"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* HTML5 Pixel Art Canvas Surface */}
      <div className="relative flex justify-center items-center p-2 rounded-xl bg-amber-100/60 dark:bg-stone-950/70 border border-amber-900/10 dark:border-stone-800 shadow-inner">
        <canvas
          ref={canvasRef}
          width={224}
          height={224}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="rounded-lg shadow-sm cursor-crosshair touch-none image-pixelated block"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Primary Tool Selector (Pen vs Eraser vs Undo vs Clear) */}
      <div className="flex items-center justify-between mt-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setIsEraser(false);
              playMechanicalClick('subtle', 0.05);
            }}
            className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
              !isEraser
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>Draw</span>
          </button>

          <button
            onClick={() => {
              setIsEraser(true);
              playMechanicalClick('subtle', 0.05);
            }}
            className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
              isEraser
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
            }`}
          >
            <Eraser className="w-3 h-3" />
            <span>Erase</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            title="Undo stroke"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1 rounded-lg bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950 transition cursor-pointer"
            title="Clear canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pixel Palette Color Picker */}
      <div className="mt-2.5 pt-2 border-t border-amber-900/10 dark:border-stone-800">
        <div className="grid grid-cols-8 gap-1.5">
          {PIXEL_PALETTE.map((color) => {
            const isSelected = !isEraser && selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setIsEraser(false);
                  playMechanicalClick('subtle', 0.04);
                }}
                className={`w-6 h-6 rounded-md transition transform active:scale-90 relative cursor-pointer border ${
                  isSelected
                    ? 'scale-110 ring-2 ring-amber-500 shadow-md z-10 border-white'
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: color === '#ffffff' || color === '#fef08a' ? '#000' : '#fff',
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cozy Inspiration Templates */}
      <div className="mt-2.5 pt-2 border-t border-amber-900/10 dark:border-stone-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
        </span>
        <div className="flex items-center gap-1">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleLoadPreset(preset)}
              className="text-xs px-1.5 py-0.5 rounded bg-amber-200/40 dark:bg-stone-800 hover:bg-amber-300/60 dark:hover:bg-stone-700 transition cursor-pointer"
              title={`Load "${preset.name}" preset`}
            >
              {preset.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
