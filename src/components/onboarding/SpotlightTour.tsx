import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Check, Compass } from 'lucide-react';
import { playMechanicalClick, playChime, playWinFanfare } from '../../utils/audio';

export interface TourStepConfig {
  id: string;
  title: string;
  targetId: string;
  targetSelector?: string[];
  content: string;
  preferredPlacement?: 'top' | 'bottom' | 'center';
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'step-nav',
    title: 'Top Navigation & Status Bar',
    targetId: 'tour-top-bar',
    content: 'Dito mo makikita ang iyong Level at Daily Quests. Bawat galaw at laro mo ay may XP!',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-gadgets',
    title: 'Draggable Desk Gadgets',
    targetId: 'tour-gadgets-cluster',
    targetSelector: ['widget-coffee', 'widget-pet', 'widget-lamp', 'widget-plant'],
    content: 'Draggable lahat! Pwede mong i-reposition ang mga gamit sa desk, sumimsim ng kape, mag-alaga ng pixel pet, o i-toggle ang ilaw.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-audio-focus',
    title: 'Lo-Fi Synth & Focus Tools',
    targetId: 'tour-lofi-pomo',
    targetSelector: ['widget-boombox', 'widget-pomodoro'],
    content: 'Magpatugtog ng ambient Lo-Fi beats habang nag-aaral gamit ang built-in Pomodoro focus timer.',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-games',
    title: 'Mini-Games (Tic-Tac-Toe)',
    targetId: 'widget-tictactoe',
    content: 'Kailangan ng quick break? Hamunin ang Retro AI sa Tic-Tac-Toe para sa bonus XP!',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-corkboard',
    title: 'Expanded Corkboard Studio',
    targetId: 'tour-expanded-board-btn',
    content: 'Gusto mo bang magbasa o mag-iwan ng mensahe? Buksan ang Expanded Corkboard para sa infinite pannable bulletin board kung saan pwede kang mag-pin ng sarili mong notes kasama ang ibang bisita!',
    preferredPlacement: 'bottom',
  },
  {
    id: 'step-footer',
    title: 'Bottom Dock & Reset Tools',
    targetId: 'tour-bottom-dock',
    content: "Kung nagulo ang desk, i-click lang ang 'Reset Pos' para bumalik sa ayos ang lahat.",
    preferredPlacement: 'top',
  },
];

export interface SpotlightTourProps {
  isActive?: boolean;
  isOpen?: boolean;
  onComplete?: () => void;
  onClose?: () => void;
  onSkip?: () => void;
  onOpenExpandedStudio?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({
  isActive,
  isOpen,
  onComplete,
  onClose,
  onSkip,
  onOpenExpandedStudio,
}) => {
  const active = isOpen ?? isActive ?? false;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  const handleFinish = useCallback(() => {
    if (onComplete) onComplete();
    if (onClose) onClose();
  }, [onComplete, onClose]);

  const handleCancel = useCallback(() => {
    if (onSkip) onSkip();
    if (onClose) onClose();
  }, [onSkip, onClose]);

  // Calculate target bounding box
  const updateTargetRect = useCallback(() => {
    if (!active || !step) return;

    let elements: HTMLElement[] = [];

    // Check targetSelector array first
    if (step.targetSelector && step.targetSelector.length > 0) {
      elements = step.targetSelector
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
    }

    // Fallback to targetId
    if (elements.length === 0) {
      const el = document.getElementById(step.targetId);
      if (el) elements = [el];
    }

    if (elements.length === 0) {
      // Fallback center box if elements not yet attached
      setTargetRect({
        top: window.innerHeight * 0.35,
        left: window.innerWidth * 0.2,
        width: window.innerWidth * 0.6,
        height: 200,
      });
      return;
    }

    // Calculate union bounding box of all target elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      const r = el.getBoundingClientRect();
      minX = Math.min(minX, r.left);
      minY = Math.min(minY, r.top);
      maxX = Math.max(maxX, r.right);
      maxY = Math.max(maxY, r.bottom);
    });

    // Guard against crazy coordinates
    if (minX === Infinity) {
      minX = 20;
      maxX = window.innerWidth - 20;
      minY = 60;
      maxY = 260;
    }

    setTargetRect({
      left: Math.max(4, minX),
      top: Math.max(4, minY),
      width: Math.min(window.innerWidth - 8, Math.max(60, maxX - minX)),
      height: Math.min(window.innerHeight - 8, Math.max(40, maxY - minY)),
    });
  }, [isActive, step]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    updateTargetRect();
    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const timer = setTimeout(updateTargetRect, 60);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timer);
    };
  }, [active, currentStepIndex, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playMechanicalClick('toggle', 0.08);
        handleCancel();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      playMechanicalClick('key', 0.08);
      playChime(480 + currentStepIndex * 40, 'triangle', 0.12, 0.07);
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      playWinFanfare();
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      playMechanicalClick('subtle', 0.06);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!active || !step) return null;

  // Compute Tooltip Coordinates clamped within screen
  const padding = 10;
  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const tooltipHeight = 210;

  let tooltipTop = 100;
  let tooltipLeft = window.innerWidth / 2 - tooltipWidth / 2;

  if (targetRect) {
    tooltipLeft = Math.max(
      16,
      Math.min(
        window.innerWidth - tooltipWidth - 16,
        targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      )
    );

    const spaceAbove = targetRect.top;
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);

    if (step.preferredPlacement === 'top') {
      if (spaceAbove >= tooltipHeight + 20) {
        tooltipTop = targetRect.top - tooltipHeight - 16;
      } else {
        tooltipTop = targetRect.top + targetRect.height + 16;
      }
    } else {
      // Preferred placement bottom or default
      if (spaceBelow >= tooltipHeight + 20) {
        tooltipTop = targetRect.top + targetRect.height + 16;
      } else if (spaceAbove >= tooltipHeight + 20) {
        tooltipTop = targetRect.top - tooltipHeight - 16;
      } else {
        // Center clamped
        tooltipTop = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, targetRect.top + 20));
      }
    }

    // Hard boundary clamping
    tooltipTop = Math.max(12, Math.min(window.innerHeight - tooltipHeight - 12, tooltipTop));
  }

  return (
    <div
      id="cozydesk-spotlight-tour"
      className="fixed inset-0 z-[65] pointer-events-auto select-none"
    >
      {/* Target Spotlight Glow & Cutout with Box Shadow */}
      {targetRect && (
        <div
          style={{
            top: `${Math.max(0, targetRect.top - padding)}px`,
            left: `${Math.max(0, targetRect.left - padding)}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
            boxShadow: '0 0 0 9999px rgba(8, 10, 18, 0.78), 0 0 32px rgba(251, 191, 36, 0.65)',
          }}
          className="fixed rounded-2xl border-2 border-amber-400/90 pointer-events-none transition-all duration-300 ease-out z-[66] animate-pulse"
        />
      )}

      {/* Floating Tooltip Card */}
      <div
        style={{
          top: `${tooltipTop}px`,
          left: `${tooltipLeft}px`,
          width: `${tooltipWidth}px`,
        }}
        className="fixed z-[67] bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col gap-3 transition-all duration-300 ease-out text-slate-100"
      >
        {/* Header with Step Indicator and Close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-pixel text-[10px] font-bold text-amber-300 tracking-wider uppercase bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/40">
              Hakbang {currentStepIndex + 1} ng {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              handleCancel();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Skip Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide">
            {step.title}
          </h3>
        </div>

        {/* Content */}
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          {step.content}
        </p>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => {
                  playMechanicalClick('key', 0.05);
                  setCurrentStepIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentStepIndex
                    ? 'w-6 bg-amber-400'
                    : i < currentStepIndex
                    ? 'w-2 bg-emerald-400/70'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            [Arrow keys • Esc]
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => {
              playMechanicalClick('toggle', 0.08);
              handleCancel();
            }}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1 cursor-pointer border border-amber-200"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Tapusin Tour' : 'Next'}</span>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
