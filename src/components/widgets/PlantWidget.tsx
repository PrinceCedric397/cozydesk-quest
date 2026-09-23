import React, { useState, useEffect } from 'react';
import { Droplet, Sparkles, Wind, Heart, RefreshCw } from 'lucide-react';
import {
  playWaterTrickleSound,
  playWoodThudSound,
  playPaperRustleSound,
  playWinFanfare,
  playPlantMistSound,
  playLeafRustleSound,
  playChime,
} from '../../utils/audio';

interface PlantWidgetProps {
  onWaterQuest?: () => void;
}

interface PlantVariety {
  id: string;
  name: string;
  species: string;
  emoji: string;
  potStyle: string;
  potBorder: string;
  potRim: string;
  soilStyle: string;
  accent: string;
  leafHue: string;
}

const PLANT_VARIETIES: PlantVariety[] = [
  {
    id: 'succulent',
    name: 'Jade Succulent',
    species: 'Haworthia Retusa',
    emoji: '🪴',
    potStyle: 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900',
    potBorder: 'border-amber-950',
    potRim: 'bg-amber-600',
    soilStyle: 'bg-[#27180e]',
    accent: '#10b981',
    leafHue: 'text-emerald-400',
  },
  {
    id: 'monstera',
    name: 'Swiss Monstera',
    species: 'Monstera Deliciosa',
    emoji: '🌿',
    potStyle: 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900',
    potBorder: 'border-stone-950',
    potRim: 'bg-stone-600',
    soilStyle: 'bg-[#1e1510]',
    accent: '#059669',
    leafHue: 'text-teal-400',
  },
  {
    id: 'sakura',
    name: 'Cherry Blossom',
    species: 'Prunus Bonsai',
    emoji: '🌸',
    potStyle: 'bg-gradient-to-b from-[#883d35] via-[#6f2f28] to-[#4e1d18]',
    potBorder: 'border-[#38110d]',
    potRim: 'bg-[#a34b41]',
    soilStyle: 'bg-[#2b1712]',
    accent: '#ec4899',
    leafHue: 'text-pink-300',
  },
  {
    id: 'zen_bonsai',
    name: 'Zen Pine Bonsai',
    species: 'Pinus Thunbergii',
    emoji: '✨🪴',
    potStyle: 'bg-gradient-to-b from-emerald-900 via-slate-900 to-stone-950',
    potBorder: 'border-emerald-950',
    potRim: 'bg-emerald-800',
    soilStyle: 'bg-[#151a14]',
    accent: '#f59e0b',
    leafHue: 'text-emerald-300',
  },
  {
    id: 'cactus',
    name: 'Desert Bloom',
    species: 'Echinopsis Calochlora',
    emoji: '🌵',
    potStyle: 'bg-gradient-to-b from-orange-700 via-orange-800 to-amber-950',
    potBorder: 'border-amber-950',
    potRim: 'bg-orange-600',
    soilStyle: 'bg-[#3b271a]',
    accent: '#f97316',
    leafHue: 'text-lime-400',
  },
];

export const PlantWidget: React.FC<PlantWidgetProps> = ({ onWaterQuest }) => {
  const [moisture, setMoisture] = useState(65);
  const [stage, setStage] = useState(2);
  const [varietyIndex, setVarietyIndex] = useState(0);
  const [isWobbling, setIsWobbling] = useState(false);
  const [drops, setDrops] = useState<{ id: number; x: number }[]>([]);
  const [isMisting, setIsMisting] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [growthPoints, setGrowthPoints] = useState(40);

  const currentVariety = PLANT_VARIETIES[varietyIndex];

  // Natural slow evaporation
  useEffect(() => {
    const timer = setInterval(() => {
      setMoisture((m) => Math.max(15, m - 1));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleWater = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playWaterTrickleSound();
    playWoodThudSound(210, 0.05);
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 450);

    // Spawn 3 falling water droplets
    const newDrops = [
      { id: Date.now(), x: -10 },
      { id: Date.now() + 1, x: 4 },
      { id: Date.now() + 2, x: 16 },
    ];
    setDrops((prev) => [...prev, ...newDrops]);
    setTimeout(() => {
      setDrops((prev) => prev.slice(3));
    }, 800);

    // Boost moisture & growth
    const newMoisture = Math.min(100, moisture + 25);
    const newGrowth = growthPoints + 20;

    setMoisture(newMoisture);
    if (newGrowth >= 100) {
      setGrowthPoints(10);
      setStage((s) => Math.min(s + 1, 4));
      playWinFanfare();
      setSparkleActive(true);
      setTimeout(() => setSparkleActive(false), 2000);
    } else {
      setGrowthPoints(newGrowth);
    }

    if (onWaterQuest) onWaterQuest();
  };

  const handleMist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMisting(true);
    playPlantMistSound();
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 400);
    setTimeout(() => setIsMisting(false), 700);

    setMoisture((m) => Math.min(100, m + 12));
    setGrowthPoints((g) => g + 10);
    setSparkleActive(true);
    setTimeout(() => setSparkleActive(false), 1400);

    if (onWaterQuest) onWaterQuest();
  };

  const handlePetPlant = (e: React.MouseEvent) => {
    e.stopPropagation();
    playLeafRustleSound();
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 350);

    if (onWaterQuest) onWaterQuest();

    // Floating heart affection
    const heart = { id: Date.now(), x: Math.random() * 20 - 10 };
    setHearts((prev) => [...prev, heart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heart.id));
    }, 900);
  };

  const handleCycleVariety = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (varietyIndex + 1) % PLANT_VARIETIES.length;
    setVarietyIndex(next);
    playLeafRustleSound();
    playChime(640, 'triangle', 0.12, 0.05);
  };

  const isThirsty = moisture < 30;
  const isLush = moisture >= 60;

  return (
    <div className="flex flex-col items-center select-none group relative">
      {/* Top Quick Actions */}
      <div className="flex items-center gap-1.5 mb-1.5 opacity-95 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleWater}
          className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono text-sky-300 rounded-lg border border-slate-700/80 shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer touch-manipulation min-h-[34px]"
          title="Pour fresh water"
        >
          <Droplet className="w-3.5 h-3.5 fill-current" />
          <span>Water</span>
        </button>
        <button
          onClick={handleMist}
          className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono text-emerald-300 rounded-lg border border-slate-700/80 shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer touch-manipulation min-h-[34px]"
          title="Spritz foliage with fine mist"
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Mist</span>
        </button>
        <button
          onClick={handleCycleVariety}
          className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-[10px] font-mono text-amber-300 rounded-lg border border-slate-700/80 shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer touch-manipulation min-h-[34px]"
          title="Switch plant species"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Species</span>
        </button>
      </div>

      {/* Main Interactive Plant Pot Assembly */}
      <div
        data-no-drag
        onClick={handlePetPlant}
        className="relative flex flex-col items-center cursor-pointer transition-transform duration-200 active:scale-95"
        title="Click plant to gently pet leaves or hydrate with tools above"
      >
        {/* Floating Affection Hearts */}
        {hearts.map((h) => (
          <span
            key={h.id}
            style={{ left: `calc(50% + ${h.x}px)` }}
            className="absolute -top-3 text-rose-400 text-xs animate-bounce pointer-events-none z-20"
          >
            💚
          </span>
        ))}

        {/* Falling Water Droplets Animation */}
        {drops.map((drop) => (
          <span
            key={drop.id}
            style={{ left: `calc(50% + ${drop.x}px)` }}
            className="absolute -top-4 text-sky-400 text-xs animate-bounce pointer-events-none z-20"
          >
            💧
          </span>
        ))}

        {/* Fine Mist Cloud Animation */}
        {isMisting && (
          <div className="absolute -top-6 inset-x-0 h-16 flex items-center justify-center pointer-events-none z-20">
            <div className="w-16 h-12 rounded-full bg-sky-300/30 blur-sm animate-mist" />
          </div>
        )}

        {/* Plant Foliage Visual Layer */}
        <div
          className={`relative transition-transform duration-300 filter drop-shadow-lg ${
            isWobbling ? 'scale-115 rotate-6' : 'hover:scale-105 animate-leaf-sway'
          }`}
        >
          {/* Main Plant Graphic with Soft Glow */}
          <div className="text-4xl filter drop-shadow-md select-none relative flex items-center justify-center">
            <span>{currentVariety.emoji}</span>
            {/* Shimmer Sparkles on Growth or Misting */}
            {(sparkleActive || isLush) && (
              <span className="absolute -top-1 -right-1 text-amber-300 text-xs animate-spin">
                ✨
              </span>
            )}
            {/* Dewdrop Clinging to Leaf */}
            {moisture >= 50 && (
              <span className="absolute top-1 left-0 text-sky-300 text-[10px] animate-pulse">
                💧
              </span>
            )}
          </div>
        </div>

        {/* Sculpted Terracotta Planter Pot */}
        <div className="relative flex flex-col items-center mt-0.5">
          {/* Rolled Clay Rim Lip */}
          <div
            className={`w-16 h-2.5 ${currentVariety.potRim} rounded-t-md border-2 ${currentVariety.potBorder} shadow-sm z-10`}
          />

          {/* Planter Pot Body */}
          <div
            className={`w-14 h-10 ${currentVariety.potStyle} border-2 ${currentVariety.potBorder} border-t-0 rounded-b-2xl shadow-xl flex flex-col items-center justify-between p-1 relative overflow-hidden`}
            style={{
              boxShadow: '0 8px 20px -2px rgba(0, 0, 0, 0.45)',
            }}
          >
            {/* Dark Moist Soil Layer */}
            <div
              className={`absolute top-0 inset-x-0 h-2 ${currentVariety.soilStyle} border-b border-black/20 flex items-center justify-around px-1`}
            >
              <span className="w-1 h-0.5 bg-black/40 rounded-full" />
              <span className="w-1 h-0.5 bg-stone-500/30 rounded-full" />
              <span className="w-1 h-0.5 bg-black/40 rounded-full" />
            </div>

            {/* Specular Pot Glaze Reflection */}
            <div className="absolute top-2 left-1.5 w-1 h-6 bg-white/15 rounded-full pointer-events-none" />

            {/* Level & Growth Badge */}
            <div className="mt-2.5 flex items-center gap-1 z-10">
              <span className="text-[8.5px] font-mono text-amber-100/90 font-bold tracking-wider">
                Lv.{stage + 1}
              </span>
            </div>

            {/* Micro Growth Progress Bar */}
            <div className="w-10 bg-black/50 h-1 rounded-full overflow-hidden p-0.2 border border-white/10 z-10 mb-0.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${growthPoints}%` }}
              />
            </div>
          </div>

          {/* Drainage Coaster Saucer */}
          <div className="w-16 h-1.5 bg-gradient-to-b from-amber-900 to-amber-950 rounded-full -mt-0.5 shadow-md border border-amber-950/80 z-0" />
        </div>
      </div>

      {/* Hydration & Variety Status Pill */}
      <div className="mt-2 bg-slate-950/95 px-2.5 py-1 rounded-full border border-slate-700/80 shadow-lg flex items-center gap-1.5 text-[9.5px] font-mono">
        <Droplet
          className={`w-2.5 h-2.5 ${
            isThirsty ? 'text-amber-400 fill-amber-400/50 animate-bounce' : 'text-sky-400 fill-current'
          }`}
        />
        <span
          className={`font-bold ${
            isThirsty ? 'text-amber-300' : 'text-emerald-300'
          }`}
        >
          {moisture}% Hydrated
        </span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-300 truncate max-w-[85px]">{currentVariety.name}</span>
        {isLush && <Sparkles className="w-2.5 h-2.5 text-amber-300" />}
      </div>
    </div>
  );
};
