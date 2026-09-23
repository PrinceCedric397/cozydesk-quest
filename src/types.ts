export type SkyMode = 'midnight' | 'twilight' | 'aurora' | 'rainy';

export type LampLighting = 'warm' | 'ember' | 'neon' | 'lavender' | 'off';

export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  zIndex: number;
}

export interface StickyNoteData {
  id: string;
  title: string;
  content: string;
  color: string;
  fontClass: string;
  rotation: number;
  isChecklist?: boolean;
  checkedItems?: boolean[];
  pinnedToDesk?: boolean;
}

export interface CorkboardNote {
  id: string;
  name: string;
  message: string;
  color: string;
  fontClass: string;
  emoji: string;
  createdAt: number;
  reactions: {
    heart: number;
    coffee: number;
    star: number;
    fire: number;
  };
  x?: number;
  y?: number;
  rotation?: number;
  category?: 'memo' | 'goal' | 'quote' | 'polaroid';
  authorTag?: string;
  authorId?: string;
  isPolaroid?: boolean;
  polaroidPhoto?: string;
  polaroidGradient?: string;
  polaroidDate?: string;
  polaroidTitle?: string;
  washiTapeColor?: string;
  polaroidImageUrl?: string;
  polaroidFilter?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  done: boolean;
  icon: string;
}

export type TttPlayer = 'X' | 'O';
export type TttCell = TttPlayer | null;
export type TttDifficulty = 'balanced' | 'chill' | 'pro';

export interface TttScore {
  x: number;
  o: number;
  ties: number;
  streak: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface SketchpadData {
  id: string;
  name: string;
  pixels: string[]; // 16x16 or 24x24 pixel hex/rgba strings, or '' for transparent
  gridSize: 16 | 24;
  showGrid: boolean;
  paperColor: string;
}
