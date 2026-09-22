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
  borderPattern?: string;
}

export const WASHI_TAPE_OPTIONS: WashiTapeOption[] = [
  { id: 'butter', name: 'Butter Yellow', color: 'rgba(254, 240, 138, 0.85)' },
  { id: 'sakura', name: 'Sakura Pink', color: 'rgba(251, 207, 232, 0.85)' },
  { id: 'mint', name: 'Mint Green', color: 'rgba(187, 247, 208, 0.85)' },
  { id: 'sky', name: 'Sky Blue', color: 'rgba(186, 230, 253, 0.85)' },
  { id: 'peach', name: 'Warm Peach', color: 'rgba(254, 215, 170, 0.85)' },
  { id: 'lavender', name: 'Lavender Mist', color: 'rgba(233, 213, 255, 0.85)' },
  { id: 'kraft', name: 'Vintage Kraft', color: 'rgba(215, 175, 130, 0.85)' },
  { id: 'gold', name: 'Gold Foil', color: 'rgba(253, 224, 71, 0.85)' },
];

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
