import React, { useState, useRef, useEffect } from 'react';
import {
  Coffee,
  RotateCcw,
  Sparkles,
  Flame,
  Plus,
  Droplets,
  Palette,
  ChevronDown,
  ChevronUp,
  Heart,
  Smile,
  Cookie,
  Thermometer,
} from 'lucide-react';
import {
  playCoffeeSipSound,
  playCeramicClinkSound,
  playSoftHum,
  playChime,
  playCoffeePourSound,
  playSpoonStirSound,
  playSugarPlopSound,
  playMechanicalClick,
  playWinFanfare,
} from '../../utils/audio';

interface CoffeeMugWidgetProps {
  onSipQuest?: () => void;
}

export type DrinkType =
  | 'latte'
  | 'espresso'
  | 'matcha'
  | 'cocoa'
  | 'macchiato'
  | 'iced';

export type MugColor =
  | 'cream'
  | 'terracotta'
  | 'sage'
  | 'charcoal'
  | 'mustard'
  | 'rose';

interface DrinkConfig {
  id: DrinkType;
  name: string;
  liquidGradient: string;
  foamColor: string;
  hasFoam: boolean;
  defaultTemp: 'hot' | 'warm' | 'chilled';
  emoji: string;
}

const DRINKS: Record<DrinkType, DrinkConfig> = {
  latte: {
    id: 'latte',
    name: 'Oat Latte',
    liquidGradient: 'from-[#422214] via-[#6d4128] to-[#cbb293]',
    foamColor: '#f1dec9',
    hasFoam: true,
    defaultTemp: 'hot',
    emoji: '☕',
  },
  espresso: {
    id: 'espresso',
    name: 'Dark Roast',
    liquidGradient: 'from-[#190d07] via-[#2d180f] to-[#5a331c]',
    foamColor: '#966039',
    hasFoam: true,
    defaultTemp: 'hot',
    emoji: '☕',
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Latte',
    liquidGradient: 'from-[#1c3a1e] via-[#2d5d31] to-[#609966]',
    foamColor: '#d6efc7',
    hasFoam: true,
    defaultTemp: 'hot',
    emoji: '🍵',
  },
  cocoa: {
    id: 'cocoa',
    name: 'Hot Cocoa',
    liquidGradient: 'from-[#2b170c] via-[#432314] to-[#63361d]',
    foamColor: '#e0c8b6',
    hasFoam: true,
    defaultTemp: 'hot',
    emoji: '🍫',
  },
  macchiato: {
    id: 'macchiato',
    name: 'Caramel Macchiato',
    liquidGradient: 'from-[#3a1d0d] via-[#6b3c1a] to-[#d48b3c]',
    foamColor: '#f3e5d0',
    hasFoam: true,
    defaultTemp: 'hot',
    emoji: '🍮',
  },
  iced: {
    id: 'iced',
    name: 'Iced Cold Brew',
    liquidGradient: 'from-[#1a0e08]/90 via-[#3a2012]/85 to-[#522d19]/80',
    foamColor: '#d9beaa',
    hasFoam: false,
    defaultTemp: 'chilled',
    emoji: '🧊',
  },
};

const LATTE_ARTS = [
  { icon: '☕', name: 'Heart' },
  { icon: '🌿', name: 'Fern' },
  { icon: '🐱', name: 'Kitty' },
  { icon: '⭐', name: 'Star' },
  { icon: '🌸', name: 'Sakura' },
  { icon: '🐻', name: 'Bear' },
  { icon: '🌀', name: 'Zen Swirl' },
];

const MUG_STYLES: Record<
  MugColor,
  {
    name: string;
    bodyClass: string;
    borderClass: string;
    rimClass: string;
    handleClass: string;
    shadowColor: string;
  }
> = {
  cream: {
    name: 'Classic Bone China',
    bodyClass: 'bg-[#f4efe6]',
    borderClass: 'border-[#d4c8b8]',
    rimClass: 'bg-[#e7dcd0]',
    handleClass: 'border-[#d4c8b8]',
    shadowColor: 'rgba(212,200,184,0.3)',
  },
  terracotta: {
    name: 'Warm Terracotta',
    bodyClass: 'bg-[#c2623a]',
    borderClass: 'border-[#8f3f1e]',
    rimClass: 'bg-[#dd7a4f]',
    handleClass: 'border-[#8f3f1e]',
    shadowColor: 'rgba(194,98,58,0.35)',
  },
  sage: {
    name: 'Cozy Forest Sage',
    bodyClass: 'bg-[#435e47]',
    borderClass: 'border-[#2d4231]',
    rimClass: 'bg-[#55765a]',
    handleClass: 'border-[#2d4231]',
    shadowColor: 'rgba(67,94,71,0.35)',
  },
  charcoal: {
    name: 'Midnight Matte',
    bodyClass: 'bg-[#292f3d]',
    borderClass: 'border-[#1b202a]',
    rimClass: 'bg-[#3b4356]',
    handleClass: 'border-[#1b202a]',
    shadowColor: 'rgba(41,47,61,0.4)',
  },
  mustard: {
    name: 'Vintage Diner Yellow',
    bodyClass: 'bg-[#d8972b]',
    borderClass: 'border-[#9b6616]',
    rimClass: 'bg-[#e8a93d]',
    handleClass: 'border-[#9b6616]',
    shadowColor: 'rgba(216,151,43,0.35)',
  },
  rose: {
    name: 'Dusty Rose Ceramic',
    bodyClass: 'bg-[#b6586d]',
    borderClass: 'border-[#813444]',
    rimClass: 'bg-[#cd6e84]',
    handleClass: 'border-[#813444]',
    shadowColor: 'rgba(182,88,109,0.35)',
  },
};

const COZY_THOUGHTS = [
  'Velvety, warm, & rich ☕',
  'Warmth spreads to your fingertips ✨',
  'Caffeine focus boosted! ⚡',
  'Deep inhale... pure roast aroma 🌿',
  'Notes of toasted cocoa & hazelnut 🌰',
  'The perfect desk companion 💛',
  'A soothing sip of serenity ☁️',
  'Freshly pulled crema bliss 🌟',
];

export const CoffeeMugWidget: React.FC<CoffeeMugWidgetProps> = ({ onSipQuest }) => {
  const [level, setLevel] = useState<number>(85);
  const [drinkType, setDrinkType] = useState<DrinkType>('latte');
  const [latteArtIndex, setLatteArtIndex] = useState<number>(0);
  const [mugColor, setMugColor] = useState<MugColor>('cream');
  const [mugDecal, setMugDecal] = useState<string>('☕');
  const [temperature, setTemperature] = useState<'hot' | 'warm' | 'chilled' | 'cold'>('hot');
  const [sugarCubes, setSugarCubes] = useState<number>(1);
  const [hasCinnamon, setHasCinnamon] = useState<boolean>(true);
  const [marshmallowCount, setMarshmallowCount] = useState<number>(2);

  // Interaction animation states
  const [isSipping, setIsSipping] = useState<boolean>(false);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [droppingSugar, setDroppingSugar] = useState<boolean>(false);
  const [thought, setThought] = useState<string | null>(null);
  const [cupsToday, setCupsToday] = useState<number>(3);
  const [sipsTotal, setSipsTotal] = useState<number>(12);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<'brew' | 'customize' | 'toppings'>('brew');

  const thoughtTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentDrink = DRINKS[drinkType];
  const currentMug = MUG_STYLES[mugColor];

  // Helper to show momentary thought bubble
  const showThought = (msg: string) => {
    if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    setThought(msg);
    thoughtTimerRef.current = setTimeout(() => {
      setThought(null);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (thoughtTimerRef.current) clearTimeout(thoughtTimerRef.current);
    };
  }, []);

  // 1. Take a Sip Interaction
  const handleSip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isSipping || isPouring) return;

    if (level <= 15) {
      playCeramicClinkSound(0.06);
      showThought('Mug is almost empty! Click Refill or Brew ☕');
      return;
    }

    setIsSipping(true);
    playCoffeeSipSound();

    // Decrease level
    setLevel((prev) => Math.max(5, prev - 20));
    setSipsTotal((prev) => prev + 1);

    // Random cozy thought
    const randomMsg = COZY_THOUGHTS[Math.floor(Math.random() * COZY_THOUGHTS.length)];
    showThought(randomMsg);

    if (onSipQuest) {
      onSipQuest();
    }

    setTimeout(() => {
      setIsSipping(false);
      playCeramicClinkSound(0.04);
    }, 750);
  };

  // 2. Brew Fresh / Refill Interaction
  const handleBrewOrRefill = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPouring) return;

    setIsPouring(true);
    playCoffeePourSound(0.08);

    // Animate fill level
    setLevel(15);
    setTimeout(() => {
      setLevel(100);
      setTemperature(currentDrink.defaultTemp);
      setCupsToday((prev) => prev + 1);
      playCeramicClinkSound(0.08);
      playSoftHum('steam', 0.5, 0.04);
      setTimeout(() => playChime(640, 'triangle', 0.18, 0.08), 90);
      showThought(`Freshly brewed hot ${currentDrink.name}! ✨`);
      setIsPouring(false);
    }, 700);

    if (onSipQuest) {
      onSipQuest();
    }
  };

  // 3. Stir with Spoon
  const handleStir = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStirring) return;

    setIsStirring(true);
    playSpoonStirSound(0.07);
    showThought('Stirring with teaspoon... silky swirl! 🥄');

    setTimeout(() => {
      setIsStirring(false);
      playCeramicClinkSound(0.06);
    }, 1400);
  };

  // 4. Add Sugar Cube
  const handleAddSugar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sugarCubes >= 4 || droppingSugar) return;

    setDroppingSugar(true);
    playSugarPlopSound(0.07);

    setTimeout(() => {
      setSugarCubes((prev) => prev + 1);
      setDroppingSugar(false);
      showThought(`Added sugar cube (${sugarCubes + 1} cubes) 🍬`);
    }, 600);
  };

  // 5. Dust Cinnamon / Spices
  const handleToggleCinnamon = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('subtle', 0.06);
    playSoftHum('steam', 0.15, 0.02);
    setHasCinnamon((prev) => {
      const next = !prev;
      showThought(next ? 'Dusted with fragrant cinnamon & nutmeg 🍂' : 'Plain foam');
      return next;
    });
  };

  // 6. Add Extra Marshmallow (for cocoa / lattes)
  const handleAddMarshmallow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (marshmallowCount >= 5) return;
    playSugarPlopSound(0.05);
    setMarshmallowCount((prev) => prev + 1);
    showThought(`Added mini marshmallow (${marshmallowCount + 1}) ☁️`);
  };

  // 7. Reheat / Warm Up
  const handleReheat = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('toggle', 0.06);
    playSoftHum('steam', 0.45, 0.05);
    setTemperature('hot');
    showThought('Heated to steaming 85°C on mug warmer! 🔥');
  };

  // 8. Cycle Latte Art
  const handleCycleLatteArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMechanicalClick('key', 0.05);
    playCeramicClinkSound(0.04);
    const nextIdx = (latteArtIndex + 1) % LATTE_ARTS.length;
    setLatteArtIndex(nextIdx);
    showThought(`Poured ${LATTE_ARTS[nextIdx].name} latte art! 🎨`);
  };

  // 9. Change Drink Type
  const handleSelectDrink = (type: DrinkType) => {
    playMechanicalClick('switch', 0.06);
    setDrinkType(type);
    const cfg = DRINKS[type];
    setTemperature(cfg.defaultTemp);
    playCoffeePourSound(0.05);
    setLevel(90);
    showThought(`Switched order to ${cfg.name}! ${cfg.emoji}`);
  };

  return (
    <div className="relative flex flex-col items-center select-none w-52 bg-stone-900/90 border border-stone-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md transition-all">
      {/* Widget Header & Drag Bar */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1 border-b border-stone-800 text-[10px] font-mono text-stone-300">
        <div className="flex items-center gap-1.5 cursor-grab">
          <Coffee className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-amber-200 tracking-wide">COZY CAFE</span>
          <span className="text-[8px] text-stone-600 tracking-tighter">⋮⋮</span>
        </div>

        {/* Temperature Badge & Reheat Button */}
        <button
          onClick={temperature !== 'hot' && currentDrink.id !== 'iced' ? handleReheat : undefined}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition ${
            temperature === 'hot'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
              : temperature === 'chilled'
              ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
              : 'bg-stone-800 text-stone-300 hover:text-amber-200 cursor-pointer'
          }`}
          title={temperature !== 'hot' ? 'Click to reheat coffee' : 'Steaming hot'}
        >
          {temperature === 'hot' ? (
            <Flame className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
          ) : temperature === 'chilled' ? (
            <span className="text-[9px]">🧊</span>
          ) : (
            <Thermometer className="w-2.5 h-2.5 text-stone-400" />
          )}
          <span>{temperature === 'hot' ? '85°C' : temperature === 'chilled' ? '4°C' : '48°C'}</span>
        </button>
      </div>

      {/* Floating Cozy Thought Bubble */}
      {thought && (
        <div className="absolute -top-7 inset-x-2 z-30 flex justify-center pointer-events-none animate-bounce">
          <div className="bg-amber-100 text-stone-900 text-[9px] font-hand font-bold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 whitespace-nowrap">
            {thought}
          </div>
        </div>
      )}

      {/* Main Mug Display Container */}
      <div className="relative flex flex-col items-center justify-center my-1">
        {/* Animated Steam Particles (Active when hot or warm) */}
        {level > 15 && temperature === 'hot' && (
          <div
            onClick={() => {
              playSoftHum('steam', 0.22, 0.03);
              showThought('Fragrant coffee steam wisps away... ~~~');
            }}
            className="h-6 flex items-center justify-center gap-1.5 -mb-1 cursor-pointer z-10"
            title="Warm fragrant steam (click to wisp)"
          >
            <span className="steam-particle text-amber-100/90 text-sm font-hand drop-shadow">~</span>
            <span className="steam-particle steam-delay-1 text-stone-100 text-base font-hand drop-shadow">~</span>
            <span className="steam-particle steam-delay-2 text-amber-200/90 text-sm font-hand drop-shadow">~</span>
          </div>
        )}

        {/* Cold condensation particles for iced drink */}
        {currentDrink.id === 'iced' && (
          <div className="h-6 flex items-center justify-center gap-1 text-[9px] text-sky-300 font-mono -mb-1">
            <span>*</span>
            <span className="animate-pulse">·</span>
            <span>*</span>
          </div>
        )}

        {!(level > 15 && temperature === 'hot') && currentDrink.id !== 'iced' && (
          <div className="h-6 -mb-1 flex items-center justify-center text-[9px] text-stone-500 font-mono">
            {level <= 15 ? '☕ empty' : 'cozy warm'}
          </div>
        )}

        {/* Pouring Liquid Stream Animation */}
        {isPouring && (
          <div className="absolute -top-4 w-2 h-14 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950 rounded-full animate-coffee-pour z-20 shadow-md" />
        )}

        {/* Dropping Sugar Cube Animation */}
        {droppingSugar && (
          <div className="absolute -top-3 w-3 h-3 bg-white border border-stone-200 rounded shadow-md animate-sugar-plop z-20" />
        )}

        {/* Tactile 3D Ceramic Mug */}
        <button
          type="button"
          onClick={handleSip}
          className={`relative flex items-center cursor-pointer transition-transform duration-300 group outline-none ${
            isSipping ? 'animate-coffee-sip' : 'hover:scale-105 active:scale-95'
          }`}
          title="Click to take a warm sip! ☕"
        >
          {/* Mug Body */}
          <div
            className={`w-16 h-18 ${currentMug.bodyClass} border-2 ${currentMug.borderClass} rounded-b-2xl shadow-xl flex flex-col justify-end p-1 overflow-hidden relative transition-colors duration-300`}
            style={{ boxShadow: `0 8px 16px -2px ${currentMug.shadowColor}` }}
          >
            {/* Ceramic Rim Highlight */}
            <div className={`absolute top-0 inset-x-0 h-1.5 ${currentMug.rimClass} z-10`} />

            {/* Coffee Liquid & Foam Interior */}
            <div
              className={`w-full bg-gradient-to-t ${currentDrink.liquidGradient} rounded-b-xl transition-all duration-500 relative flex flex-col items-center justify-start overflow-hidden`}
              style={{ height: `${Math.max(8, level)}%` }}
            >
              {/* Foam Layer on Top */}
              {currentDrink.hasFoam && level >= 20 && (
                <div
                  className={`w-full h-4 rounded-t-sm flex items-center justify-center border-b border-amber-900/30 transition-all ${
                    isStirring ? 'animate-liquid-vortex' : ''
                  }`}
                  style={{ backgroundColor: currentDrink.foamColor }}
                >
                  {/* Latte Art or Crema Embellishment */}
                  {level >= 35 && (
                    <span className="text-[10px] font-mono leading-none select-none filter drop-shadow-sm font-bold text-amber-950/80">
                      {LATTE_ARTS[latteArtIndex].icon}
                    </span>
                  )}

                  {/* Cinnamon / Cocoa Sprinkles on Foam */}
                  {hasCinnamon && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-75">
                      <span className="text-[6px] text-amber-950">·</span>
                      <span className="text-[7px] text-amber-900 font-bold">·</span>
                      <span className="text-[6px] text-amber-950">·</span>
                    </div>
                  )}
                </div>
              )}

              {/* Floating Mini Marshmallows (Hot Cocoa / Sweet Latte) */}
              {(currentDrink.id === 'cocoa' || drinkType === 'latte') &&
                level >= 30 &&
                Array.from({ length: marshmallowCount }).map((_, i) => (
                  <span
                    key={`marsh-${i}`}
                    className={`absolute text-[8px] select-none filter drop-shadow pointer-events-none ${
                      isStirring ? 'animate-liquid-vortex' : 'bobbing'
                    }`}
                    style={{
                      top: `${4 + (i % 2) * 5}px`,
                      left: `${6 + i * 14}px`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  >
                    ☁️
                  </span>
                ))}

              {/* Clinking Ice Cubes for Iced Brew */}
              {currentDrink.id === 'iced' && level >= 25 && (
                <div
                  className={`absolute inset-x-0 top-1 flex justify-center gap-1 text-[9px] pointer-events-none ${
                    isStirring ? 'animate-liquid-vortex' : ''
                  }`}
                >
                  <span className="bg-white/40 border border-white/60 rounded-[2px] w-2.5 h-2.5 inline-block shadow-inner" />
                  <span className="bg-white/40 border border-white/60 rounded-[2px] w-2.5 h-2.5 inline-block shadow-inner" />
                </div>
              )}

              {/* Stirring Vortex Liquid Effect */}
              {isStirring && (
                <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-liquid-vortex pointer-events-none" />
              )}
            </div>

            {/* Mug Decal Graphic on Ceramic Exterior */}
            {mugDecal !== 'none' && (
              <div className="absolute bottom-1 inset-x-0 flex items-center justify-center pointer-events-none z-10 opacity-70">
                <span className="text-[8px] font-mono font-bold tracking-tighter text-stone-900/70 bg-stone-100/50 px-1 rounded-sm shadow-xs">
                  {mugDecal}
                </span>
              </div>
            )}
          </div>

          {/* Mug Handle */}
          <div
            className={`w-4 h-10 border-2 ${currentMug.handleClass} border-l-0 rounded-r-xl -ml-0.5 shadow-md`}
          />

          {/* Teaspoon (Visible when stirring) */}
          {isStirring && (
            <div className="absolute -top-3 left-7 w-1 h-12 bg-gradient-to-b from-stone-200 via-stone-400 to-stone-500 rounded-full shadow-md animate-spoon-stir pointer-events-none z-20" />
          )}
        </button>

        {/* Wooden / Cork Coaster Beneath Mug */}
        <div className="w-20 h-2 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border border-amber-950 rounded-full mt-0.5 shadow-md flex items-center justify-center">
          <div className="w-12 h-1 bg-amber-950/60 rounded-full" />
        </div>
      </div>

      {/* Main Status & Quick Action Buttons */}
      <div className="w-full flex flex-col gap-1.5 mt-1.5">
        {/* Level Status & Drink Title */}
        <div className="flex items-center justify-between text-[9px] font-mono px-1 text-stone-400">
          <span className="text-amber-300 font-bold truncate max-w-[100px]">
            {currentDrink.name}
          </span>
          <span className={level <= 15 ? 'text-rose-400 font-bold' : 'text-stone-300'}>
            {level <= 15 ? 'Empty!' : `${level}%`}
          </span>
        </div>

        {/* Primary Action Buttons: Sip / Refill / Stir */}
        <div className="grid grid-cols-3 gap-1 w-full">
          <button
            onClick={handleSip}
            className="py-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 rounded-lg text-[10px] font-mono font-bold shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
            title="Take a warm sip"
          >
            <Coffee className="w-2.5 h-2.5" />
            <span>Sip</span>
          </button>

          <button
            onClick={handleBrewOrRefill}
            className="py-1 bg-stone-700 hover:bg-stone-600 active:scale-95 text-stone-100 rounded-lg text-[10px] font-mono font-bold shadow-md transition flex items-center justify-center gap-1 cursor-pointer"
            title="Brew a fresh full cup"
          >
            <RotateCcw className="w-2.5 h-2.5 text-amber-300" />
            <span>Brew</span>
          </button>

          <button
            onClick={handleStir}
            disabled={isStirring || level <= 10}
            className="py-1 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 rounded-lg text-[10px] font-mono font-bold shadow-md transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
            title="Stir coffee with spoon"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Stir</span>
          </button>
        </div>

        {/* Expandable Customizer Tray (Barista Menu) */}
        <div className="w-full pt-1 border-t border-stone-800/80">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-[9px] font-mono text-stone-400 hover:text-stone-200 transition py-0.5 px-1 cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <Palette className="w-2.5 h-2.5 text-amber-400" />
              <span>Barista Options</span>
            </span>
            {isMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {isMenuOpen && (
            <div className="flex flex-col gap-2 mt-1.5 pt-1.5 border-t border-stone-800 text-[9px] font-mono">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg">
                <button
                  onClick={() => setMenuTab('brew')}
                  className={`flex-1 py-0.5 rounded text-center transition cursor-pointer ${
                    menuTab === 'brew' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'
                  }`}
                >
                  Brew
                </button>
                <button
                  onClick={() => setMenuTab('toppings')}
                  className={`flex-1 py-0.5 rounded text-center transition cursor-pointer ${
                    menuTab === 'toppings'
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'text-stone-400'
                  }`}
                >
                  Add-ins
                </button>
                <button
                  onClick={() => setMenuTab('customize')}
                  className={`flex-1 py-0.5 rounded text-center transition cursor-pointer ${
                    menuTab === 'customize'
                      ? 'bg-amber-600 text-stone-950 font-bold'
                      : 'text-stone-400'
                  }`}
                >
                  Mug
                </button>
              </div>

              {/* TAB 1: BREW DRINK TYPE */}
              {menuTab === 'brew' && (
                <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto pr-0.5">
                  {(Object.keys(DRINKS) as DrinkType[]).map((key) => {
                    const d = DRINKS[key];
                    const isSelected = drinkType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectDrink(key)}
                        className={`p-1 rounded text-left flex items-center gap-1 border transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
                            : 'bg-stone-800/60 border-stone-750 text-stone-400 hover:bg-stone-750'
                        }`}
                      >
                        <span>{d.emoji}</span>
                        <span className="truncate">{d.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: TOPPINGS & CONDIMENTS */}
              {menuTab === 'toppings' && (
                <div className="flex flex-col gap-1.5">
                  {/* Sugar Cubes */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Sugar ({sugarCubes})</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleAddSugar}
                        disabled={sugarCubes >= 4}
                        className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded border border-stone-700 disabled:opacity-30 cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-2 h-2" />
                        <span>Cube</span>
                      </button>
                      {sugarCubes > 0 && (
                        <button
                          onClick={() => {
                            setSugarCubes(0);
                            playMechanicalClick('subtle', 0.05);
                          }}
                          className="px-1 py-0.5 text-stone-500 hover:text-stone-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cinnamon Shaker */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Cinnamon Dust</span>
                    <button
                      onClick={handleToggleCinnamon}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold border transition cursor-pointer ${
                        hasCinnamon
                          ? 'bg-amber-800/80 border-amber-600 text-amber-100'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}
                    >
                      {hasCinnamon ? 'Dusted ✓' : 'None'}
                    </button>
                  </div>

                  {/* Marshmallows */}
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Marshmallows ({marshmallowCount})</span>
                    <button
                      onClick={handleAddMarshmallow}
                      disabled={marshmallowCount >= 5}
                      className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded border border-stone-700 disabled:opacity-30 cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-2 h-2" />
                      <span>Mini</span>
                    </button>
                  </div>

                  {/* Latte Art design selection */}
                  {currentDrink.hasFoam && (
                    <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                      <span className="text-stone-300">Latte Art</span>
                      <button
                        onClick={handleCycleLatteArt}
                        className="px-2 py-0.5 bg-stone-800 hover:bg-stone-750 text-amber-300 rounded border border-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{LATTE_ARTS[latteArtIndex].icon}</span>
                        <span>{LATTE_ARTS[latteArtIndex].name}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MUG GLAZE & DECAL */}
              {menuTab === 'customize' && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-stone-400">Ceramic Color:</span>
                  <div className="grid grid-cols-6 gap-1">
                    {(Object.keys(MUG_STYLES) as MugColor[]).map((col) => {
                      const style = MUG_STYLES[col];
                      const isCur = mugColor === col;
                      return (
                        <button
                          key={col}
                          onClick={() => {
                            setMugColor(col);
                            playCeramicClinkSound(0.04);
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                            style.bodyClass
                          } ${isCur ? 'ring-2 ring-amber-400 border-white' : 'border-stone-800'}`}
                          title={style.name}
                        />
                      );
                    })}
                  </div>

                  <span className="text-stone-400 mt-1">Mug Decal:</span>
                  <div className="flex items-center gap-1">
                    {['☕', 'COZY', 'DEV', '🐾', '✨', 'none'].map((dec) => (
                      <button
                        key={dec}
                        onClick={() => {
                          setMugDecal(dec);
                          playMechanicalClick('subtle', 0.05);
                        }}
                        className={`flex-1 py-0.5 rounded text-[8px] font-bold border transition cursor-pointer ${
                          mugDecal === dec
                            ? 'bg-amber-600 text-stone-950 border-amber-500'
                            : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}
                      >
                        {dec === 'none' ? 'None' : dec}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Mini Stats */}
        <div className="w-full flex items-center justify-between text-[8px] font-mono text-stone-500 pt-1 border-t border-stone-800/60">
          <span>☕ Cups: {cupsToday}</span>
          <span>Sips: {sipsTotal}</span>
          <span className="text-amber-400/90 font-bold">⚡ {sipsTotal * 5}mg</span>
        </div>
      </div>
    </div>
  );
};
