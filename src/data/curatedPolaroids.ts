export interface CuratedPolaroidPreset {
  id: string;
  title: string;
  icon: string;
  desc: string;
  gradient: string;
  date: string;
  defaultWashi: string;
  defaultTapeName: string;
}

export interface WashiTapeOption {
  id: string;
  name: string;
  color: string;
  patternLabel: string;
  patternCss: string;
  backgroundSize?: string;
  borderPattern?: string;
}

export const WASHI_TAPE_OPTIONS: WashiTapeOption[] = [
  {
    id: 'butter',
    name: 'Butter Yellow',
    patternLabel: 'Gingham Grid',
    color: 'rgba(254, 240, 138, 0.88)',
    patternCss:
      'linear-gradient(rgba(202, 138, 4, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(202, 138, 4, 0.28) 1px, transparent 1px)',
    backgroundSize: '8px 8px',
  },
  {
    id: 'sakura',
    name: 'Sakura Pink',
    patternLabel: 'Polka Dots',
    color: 'rgba(251, 207, 232, 0.88)',
    patternCss: 'radial-gradient(circle, rgba(219, 39, 119, 0.35) 1.5px, transparent 1.5px)',
    backgroundSize: '8px 8px',
  },
  {
    id: 'mint',
    name: 'Mint Green',
    patternLabel: 'Botanical Twill',
    color: 'rgba(187, 247, 208, 0.88)',
    patternCss:
      'repeating-linear-gradient(45deg, rgba(22, 163, 74, 0.28), rgba(22, 163, 74, 0.28) 2.5px, transparent 2.5px, transparent 6.5px)',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    patternLabel: 'Rain Pinstripes',
    color: 'rgba(186, 230, 253, 0.88)',
    patternCss:
      'repeating-linear-gradient(135deg, rgba(2, 132, 199, 0.32), rgba(2, 132, 199, 0.32) 2px, transparent 2px, transparent 6px)',
  },
  {
    id: 'peach',
    name: 'Warm Peach',
    patternLabel: 'Cross Check',
    color: 'rgba(254, 215, 170, 0.88)',
    patternCss:
      'repeating-linear-gradient(0deg, rgba(234, 88, 12, 0.22) 0 3px, transparent 3px 6px), repeating-linear-gradient(90deg, rgba(234, 88, 12, 0.22) 0 3px, transparent 3px 6px)',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist',
    patternLabel: 'Starry Flecks',
    color: 'rgba(233, 213, 255, 0.88)',
    patternCss: 'radial-gradient(circle, rgba(147, 51, 234, 0.36) 1.5px, transparent 1.5px)',
    backgroundSize: '10px 10px',
  },
  {
    id: 'kraft',
    name: 'Vintage Kraft',
    patternLabel: 'Fibrous Grain',
    color: 'rgba(215, 175, 130, 0.92)',
    patternCss:
      'repeating-linear-gradient(90deg, rgba(120, 53, 15, 0.2) 0 1px, transparent 1px 4px, rgba(120, 53, 15, 0.26) 4px 5px, transparent 5px 9px)',
  },
  {
    id: 'gold',
    name: 'Gold Foil',
    patternLabel: 'Metallic Shimmer',
    color: 'rgba(253, 224, 71, 0.9)',
    patternCss:
      'linear-gradient(115deg, rgba(254, 240, 138, 0.95) 0%, rgba(202, 138, 4, 0.85) 30%, rgba(254, 249, 195, 0.98) 50%, rgba(234, 179, 8, 0.85) 70%, rgba(254, 240, 138, 0.95) 100%)',
  },
];

export const getWashiTapeOption = (colorOrId: string): WashiTapeOption => {
  return (
    WASHI_TAPE_OPTIONS.find((w) => w.id === colorOrId || w.color === colorOrId) ||
    WASHI_TAPE_OPTIONS[0]
  );
};

export const CURATED_POLAROID_PRESETS: CuratedPolaroidPreset[] = [
  {
    id: 'rainy-window',
    title: 'Rainy Window',
    icon: '🌧️',
    desc: 'Warm amber glow and gentle rain on the cedar sill.',
    gradient: 'from-slate-700 via-sky-900 to-indigo-950',
    date: 'OCT 2026',
    defaultWashi: 'rgba(186, 230, 253, 0.85)',
    defaultTapeName: 'Sky Blue',
  },
  {
    id: 'lofi-radio',
    title: 'Midnight Lo-Fi',
    icon: '📻',
    desc: 'Analog cassette tape loops and vinyl dust at 2 AM.',
    gradient: 'from-purple-950 via-indigo-900 to-amber-950',
    date: 'AUTUMN',
    defaultWashi: 'rgba(254, 240, 138, 0.85)',
    defaultTapeName: 'Butter Yellow',
  },
  {
    id: 'pixel-cat',
    title: 'Croissant Nap',
    icon: '🐾',
    desc: 'Curled like a warm croissant beside the warm keyboard.',
    gradient: 'from-amber-700 via-orange-900 to-stone-900',
    date: 'SUNDAY',
    defaultWashi: 'rgba(254, 215, 170, 0.85)',
    defaultTapeName: 'Warm Peach',
  },
  {
    id: 'first-succulent',
    title: 'Succulent Sprout',
    icon: '🌿',
    desc: 'Quiet little leaf reaching toward the desk lamp beam.',
    gradient: 'from-emerald-900 via-teal-950 to-slate-900',
    date: 'GROWTH',
    defaultWashi: 'rgba(187, 247, 208, 0.85)',
    defaultTapeName: 'Mint Green',
  },
  {
    id: 'pourover-coffee',
    title: 'Pour-Over Coffee',
    icon: '☕',
    desc: 'Fresh roasted cedar aroma with swirling hazelnut steam.',
    gradient: 'from-amber-900 via-yellow-950 to-stone-900',
    date: 'MORNING',
    defaultWashi: 'rgba(254, 240, 138, 0.85)',
    defaultTapeName: 'Butter Yellow',
  },
  {
    id: 'aurora-sky',
    title: 'Boreal Aurora',
    icon: '🌌',
    desc: 'Curtains of emerald starlight shimmering over quiet pines.',
    gradient: 'from-teal-950 via-emerald-900 to-indigo-950',
    date: 'EQUINOX',
    defaultWashi: 'rgba(233, 213, 255, 0.85)',
    defaultTapeName: 'Lavender Mist',
  },
  {
    id: 'study-corner',
    title: 'Midnight Study',
    icon: '📚',
    desc: 'Pages turning slowly beneath golden lamplight.',
    gradient: 'from-amber-950 via-stone-900 to-zinc-950',
    date: 'NIGHT OWL',
    defaultWashi: 'rgba(215, 175, 130, 0.85)',
    defaultTapeName: 'Vintage Kraft',
  },
  {
    id: 'retro-arcade',
    title: 'Arcade High Score',
    icon: '👾',
    desc: 'Flickering neon grid and pixel victory fanfare.',
    gradient: 'from-indigo-900 via-purple-950 to-pink-950',
    date: 'LEVEL 99',
    defaultWashi: 'rgba(251, 207, 232, 0.85)',
    defaultTapeName: 'Sakura Pink',
  },
  {
    id: 'beeswax-candle',
    title: 'Beeswax Candle',
    icon: '🕯️',
    desc: 'Gentle flame dancing with hints of wild honey and cedar.',
    gradient: 'from-orange-800 via-amber-950 to-stone-900',
    date: 'EVENING',
    defaultWashi: 'rgba(253, 224, 71, 0.85)',
    defaultTapeName: 'Gold Foil',
  },
  {
    id: 'matcha-tea',
    title: 'Ceremonial Matcha',
    icon: '🍵',
    desc: 'Whisked jade froth in an earthen stoneware bowl.',
    gradient: 'from-teal-900 via-emerald-950 to-stone-900',
    date: 'MINDFUL',
    defaultWashi: 'rgba(187, 247, 208, 0.85)',
    defaultTapeName: 'Mint Green',
  },
];

// ==========================================
// VINTAGE PHOTO FILTER PRESETS
// ==========================================
export interface VintageFilterPreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  cssFilter: string;
  canvasFilter: string;
  hasGrain?: boolean;
  hasBloom?: boolean;
  sampleIcon: string;
}

export const VINTAGE_FILTERS: VintageFilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    badge: 'RAW',
    desc: 'Clean, natural optical capture with pure balance',
    cssFilter: 'none',
    canvasFilter: 'none',
    sampleIcon: '✨',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    badge: 'GOLDEN',
    desc: 'Golden hour sepia warmth, boosted tones & amber glow',
    cssFilter: 'sepia(0.38) saturate(1.28) contrast(1.06) brightness(1.04) hue-rotate(-8deg)',
    canvasFilter: 'sepia(38%) saturate(128%) contrast(106%) brightness(104%) hue-rotate(-8deg)',
    sampleIcon: '🌅',
  },
  {
    id: 'cozy-grain',
    name: 'Cozy Grain',
    badge: '35MM GRAIN',
    desc: 'Fine silver-halide analog film grain with rich contrast',
    cssFilter: 'contrast(1.2) saturate(1.08) brightness(0.98)',
    canvasFilter: 'contrast(120%) saturate(108%) brightness(98%)',
    hasGrain: true,
    sampleIcon: '🎞️',
  },
  {
    id: 'vintage-lofi',
    name: 'Vintage Lo-Fi',
    badge: 'ANALOG TAPE',
    desc: 'Lifted matte shadows, desaturated tones & subtle cyan tint',
    cssFilter: 'contrast(0.92) saturate(0.78) sepia(0.24) hue-rotate(12deg) brightness(1.06)',
    canvasFilter: 'contrast(92%) saturate(78%) sepia(24%) hue-rotate(12deg) brightness(106%)',
    sampleIcon: '📼',
  },
  {
    id: 'bw-noir',
    name: 'B&W Noir',
    badge: 'MONOCHROME',
    desc: 'Dramatic high-contrast monochrome with velvety blacks',
    cssFilter: 'grayscale(1) contrast(1.35) brightness(0.96)',
    canvasFilter: 'grayscale(100%) contrast(135%) brightness(96%)',
    sampleIcon: '🎬',
  },
  {
    id: 'soft-bloom',
    name: 'Soft Bloom',
    badge: 'DREAMY',
    desc: 'Dreamy diffused highlights with gentle pastel bloom',
    cssFilter: 'contrast(1.06) brightness(1.12) saturate(1.22)',
    canvasFilter: 'contrast(106%) brightness(112%) saturate(122%)',
    hasBloom: true,
    sampleIcon: '🌸',
  },
];

export const getFilterPreset = (filterId?: string): VintageFilterPreset => {
  return VINTAGE_FILTERS.find((f) => f.id === filterId) || VINTAGE_FILTERS[0];
};

export const FILM_GRAIN_SVG_DATA =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.28'/%3E%3C/svg%3E";

