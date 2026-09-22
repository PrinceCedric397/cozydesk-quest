import React, { useState } from 'react';
import { Heart, Utensils, Sparkles, Smile } from 'lucide-react';
import { playMechanicalClick, play8BitChirp, playWinFanfare } from '../../utils/audio';

interface PixelPetWidgetProps {
  onPetQuest: () => void;
}

const PET_CHARACTERS = [
  { sprite: '👾', name: 'BitBot', voice: '"BEEP!"' },
  { sprite: '🐱', name: 'Neko', voice: '"PURR~"' },
  { sprite: '🐣', name: 'Pip', voice: '"CHIRP!"' },
  { sprite: '🐶', name: 'Mochi', voice: '"WOOF!"' },
];

export const PixelPetWidget: React.FC<PixelPetWidgetProps> = ({ onPetQuest }) => {
  const [charIndex, setCharIndex] = useState(0);
  const [hunger, setHunger] = useState(80);
  const [happiness, setHappiness] = useState(90);
  const [dialogue, setDialogue] = useState('Happy 😊');
  const [isBouncing, setIsBouncing] = useState(false);

  const currentPet = PET_CHARACTERS[charIndex];

  const handleFeed = () => {
    playMechanicalClick('key', 0.08);
    play8BitChirp('eat');

    setHunger((h) => Math.min(100, h + 20));
    setDialogue('Yummy! 🍖');
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    onPetQuest();
  };

  const handlePet = () => {
    playMechanicalClick('subtle', 0.07);
    play8BitChirp('pet');
    setHappiness((hap) => Math.min(100, hap + 15));
    setDialogue(currentPet.voice);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 500);

    onPetQuest();
  };

  const handleCyclePet = () => {
    playMechanicalClick('switch', 0.08);
    play8BitChirp('chirp');
    setCharIndex((prev) => (prev + 1) % PET_CHARACTERS.length);
    setDialogue('Hello! 👋');
  };

  return (
    <div className="w-44 bg-pink-950/90 border-2 border-pink-400 rounded-3xl p-3 shadow-2xl flex flex-col items-center backdrop-blur-md select-none">
      {/* Console Header */}
      <div className="w-full flex justify-between items-center text-[9px] font-pixel text-pink-300 pb-1 border-b border-pink-900">
        <button
          onClick={handleCyclePet}
          className="hover:underline cursor-pointer flex items-center gap-1 text-pink-300 font-bold"
          title="Change Virtual Pet"
        >
          <Smile className="w-2.5 h-2.5" />
          <span>{currentPet.name}</span>
        </button>
        <span className="flex items-center gap-1 text-pink-200">
          <Heart className="w-2.5 h-2.5 text-pink-400 fill-current" />
          <span>{happiness}%</span>
        </span>
      </div>

      {/* LCD Screen */}
      <div
        data-no-drag
        onClick={handlePet}
        className="w-full h-20 bg-[#9ead86] rounded-xl border-2 border-pink-800/80 flex flex-col items-center justify-center shadow-inner relative overflow-hidden my-2 cursor-pointer active:scale-98 transition-transform"
        title="Tap screen to pet & cuddle"
      >
        <div
          className={`text-3xl filter grayscale contrast-200 select-none transition-transform duration-200 ${
            isBouncing ? 'scale-125 -translate-y-1' : 'bobbing'
          }`}
        >
          {currentPet.sprite}
        </div>
        <span className="text-[9px] font-pixel text-stone-900 absolute bottom-0.5 font-bold tracking-wider">
          {dialogue}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 w-full">
        <button
          onClick={handleFeed}
          className="flex-1 py-1 bg-pink-500 hover:bg-pink-400 text-white rounded-lg text-[10px] font-mono font-bold shadow-md active:scale-90 transition flex items-center justify-center gap-1"
          title="Feed food"
        >
          <Utensils className="w-2.5 h-2.5" />
          <span>Feed</span>
        </button>

        <button
          onClick={handlePet}
          className="flex-1 py-1 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-[10px] font-mono font-bold shadow-md active:scale-90 transition flex items-center justify-center gap-1"
          title="Pet & cuddle"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>Cuddle</span>
        </button>
      </div>

      {/* Hunger Mini Gauge */}
      <div className="w-full flex items-center justify-between text-[8px] font-mono text-pink-300/80 pt-1">
        <span>Food level:</span>
        <div className="w-16 bg-pink-900/60 h-1 rounded-full overflow-hidden">
          <div
            className="bg-pink-300 h-full transition-all"
            style={{ width: `${hunger}%` }}
          />
        </div>
      </div>
    </div>
  );
};
