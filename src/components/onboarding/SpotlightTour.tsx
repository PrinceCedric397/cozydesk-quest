import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Rocket } from 'lucide-react';
import { playMechanicalClick, playChime, playWinFanfare } from '../../utils/audio';

export interface TourStepConfig {
  id: string;
  badge: string;
  title: string;
  description: string;
  target: string;
  fallbackSelectors?: string[];
  preferredPlacement?: 'top' | 'bottom' | 'center';
  targetId?: string;
  targetSelector?: string[];
  content?: string;
}

export const tourSteps: TourStepConfig[] = [
  {
    id: 'step-1-nav',
    badge: 'HAKBANG 1 NG 6',
    title: 'Top Navigation & Status Bar',
    description: 'Dito mo makikita ang iyong Level, XP progress bar, at Daily Quests. Bawat galaw at laro mo ay may XP!',
    target: '#top-nav',
    fallbackSelectors: ['#tour-top-bar', 'header'],
    preferredPlacement: 'bottom',
    targetId: 'top-nav',
    content: 'Dito mo makikita ang iyong Level, XP progress bar, at Daily Quests. Bawat galaw at laro mo ay may XP!',
  },
  {
    id: 'step-2-gadgets',
    badge: 'HAKBANG 2 NG 6',
    title: 'Draggable Desk Gadgets',
    description: 'Draggable lahat! Pwede mong i-reposition ang mga gamit sa desk, sumimsim ng kape, mag-alaga ng pixel pet, o i-toggle ang warm desk lamp.',
    target: '#desk-gadgets-area',
    fallbackSelectors: ['#widget-coffee', '#widget-lamp', '#widget-pet', '#widget-plant'],
    preferredPlacement: 'bottom',
    targetId: 'desk-gadgets-area',
    content: 'Draggable lahat! Pwede mong i-reposition ang mga gamit sa desk, sumimsim ng kape, mag-alaga ng pixel pet, o i-toggle ang warm desk lamp.',
  },
  {
    id: 'step-3-synth-clock',
    badge: 'HAKBANG 3 NG 6',
    title: 'Lo-Fi Synth & Focus Clock',
    description: 'Magpatugtog ng ambient procedural Lo-Fi tracks gamit ang Web Audio synth at mag-focus gamit ang Pomodoro timer.',
    target: '#lofi-synth-card',
    fallbackSelectors: ['#pomodoro-timer', '#widget-boombox', '#widget-pomodoro'],
    preferredPlacement: 'bottom',
    targetId: 'lofi-synth-card',
    content: 'Magpatugtog ng ambient procedural Lo-Fi tracks gamit ang Web Audio synth at mag-focus gamit ang Pomodoro timer.',
  },
  {
    id: 'step-4-tictactoe',
    badge: 'HAKBANG 4 NG 6',
    title: 'Retro Mini-Games (Tic-Tac-Toe)',
    description: 'Kailangan ng quick study break? Hamunin ang Retro AI sa Tic-Tac-Toe para makakuha ng bonus XP!',
    target: '#tictactoe-widget',
    fallbackSelectors: ['#widget-tictactoe'],
    preferredPlacement: 'bottom',
    targetId: 'tictactoe-widget',
    content: 'Kailangan ng quick study break? Hamunin ang Retro AI sa Tic-Tac-Toe para makakuha ng bonus XP!',
  },
  {
    id: 'step-5-corkboard',
    badge: 'HAKBANG 5 NG 6',
    title: 'Expanded Corkboard Studio',
    description: "I-click ang 'Expanded Board' para sa infinite pannable bulletin board kung saan pwede kang mag-pin ng sticky notes at magbasa ng mensahe ng iba.",
    target: '#btn-expanded-board',
    fallbackSelectors: ['#tour-expanded-board-btn'],
    preferredPlacement: 'bottom',
    targetId: 'btn-expanded-board',
    content: "I-click ang 'Expanded Board' para sa infinite pannable bulletin board kung saan pwede kang mag-pin ng sticky notes at magbasa ng mensahe ng iba.",
  },
  {
    id: 'step-6-footer',
    badge: 'HAKBANG 6 NG 6',
    title: 'Bottom Tools & Reset',
    description: "Kung sakaling magulo ang desk, i-click lang ang 'Reset Pos' sa bottom toolbar para maibalik ang ayos ng lahat. Enjoy your cozy session!",
    target: '#bottom-toolbar',
    fallbackSelectors: ['#tour-bottom-dock', 'footer'],
    preferredPlacement: 'top',
    targetId: 'bottom-toolbar',
    content: "Kung sakaling magulo ang desk, i-click lang ang 'Reset Pos' sa bottom toolbar para maibalik ang ayos ng lahat. Enjoy your cozy session!",
  },
];

export const TOUR_STEPS = tourSteps;

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
}) => {
  const active = isOpen ?? isActive ?? false;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const prevActiveRef = useRef(false);
  const step = tourSteps[currentStepIndex] || tourSteps[0];

  const finishTour = useCallback(() => {
    playWinFanfare();
    try {
      localStorage.setItem('cozydesk_tour_completed', 'true');
      localStorage.setItem('has_seen_cozydesk_tour', 'true');
    } catch (e) {
      console.warn('[SpotlightTour] Could not persist completion state:', e);
    }
    if (onComplete) onComplete();
    if (onClose) onClose();
  }, [onComplete, onClose]);

  const skipTour = useCallback(() => {
    playMechanicalClick('toggle', 0.08);
    try {
      localStorage.setItem('cozydesk_tour_completed', 'true');
      localStorage.setItem('has_seen_cozydesk_tour', 'true');
    } catch (e) {
      console.warn('[SpotlightTour] Could not persist completion state:', e);
    }
    if (onSkip) onSkip();
    if (onClose) onClose();
  }, [onSkip, onClose]);

  // Defensive check and dynamic bounding rect calculation
  const updateTargetRect = useCallback((indexToUse?: number) => {
    if (!active) return;
    const targetIndex = typeof indexToUse === 'number' ? indexToUse : currentStepIndex;
    const currentStep = tourSteps[targetIndex];
    if (!currentStep) return;

    let targetElement: HTMLElement | null = null;

    try {
      if (currentStep.target) {
        targetElement = document.querySelector(currentStep.target) as HTMLElement | null;
      }

      // Check fallback selectors if primary target was not found
      if (!targetElement && currentStep.fallbackSelectors) {
        for (const selector of currentStep.fallbackSelectors) {
          const el = document.querySelector(selector) as HTMLElement | null;
          if (el) {
            targetElement = el;
            break;
          }
        }
      }

      // Check legacy targetId
      if (!targetElement && currentStep.targetId) {
        const el = document.getElementById(currentStep.targetId);
        if (el) targetElement = el;
      }
    } catch (err) {
      console.warn(`[SpotlightTour] Selector lookup error for "${currentStep.target}":`, err);
    }

    if (!targetElement) {
      console.warn(
        `[SpotlightTour] Target DOM element for "${currentStep.target}" was not found. Gracefully centering modal.`
      );
      setTargetRect(null);
      return;
    }

    // Target exists: smooth scroll into view and update bounding box
    try {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.warn('[SpotlightTour] scrollIntoView failed:', err);
    }

    const rect = targetElement.getBoundingClientRect();

    setTargetRect({
      left: Math.max(4, rect.left),
      top: Math.max(4, rect.top),
      width: Math.min(window.innerWidth - 8, Math.max(40, rect.width)),
      height: Math.min(window.innerHeight - 8, Math.max(30, rect.height)),
    });
  }, [active, currentStepIndex]);

  // Method to render / align current step
  const renderCurrentStep = useCallback((stepIndex?: number) => {
    updateTargetRect(stepIndex);
  }, [updateTargetRect]);

  // Reset to Step 1 whenever opened (e.g. via '?' Help button in top bar)
  useEffect(() => {
    if (active && !prevActiveRef.current) {
      setCurrentStepIndex(0);
      updateTargetRect(0);
    }
    prevActiveRef.current = active;
  }, [active, updateTargetRect]);

  // Listen to step changes, window resize, and scroll to continuously sync highlight
  useEffect(() => {
    if (!active) {
      setTargetRect(null);
      return;
    }

    renderCurrentStep(currentStepIndex);

    const handleSync = () => renderCurrentStep(currentStepIndex);
    window.addEventListener('resize', handleSync);
    window.addEventListener('scroll', handleSync, true);

    // Track smooth scrolling animation updates
    const t1 = setTimeout(handleSync, 100);
    const t2 = setTimeout(handleSync, 300);
    const t3 = setTimeout(handleSync, 500);

    return () => {
      window.removeEventListener('resize', handleSync);
      window.removeEventListener('scroll', handleSync, true);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, currentStepIndex, renderCurrentStep]);

  // Step Navigation Handlers with Bounds Checking
  const handleNext = useCallback(() => {
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      playMechanicalClick('key', 0.08);
      playChime(480 + nextIndex * 40, 'triangle', 0.12, 0.07);
      setCurrentStepIndex(nextIndex);
      renderCurrentStep(nextIndex);
    } else {
      finishTour();
    }
  }, [currentStepIndex, finishTour, renderCurrentStep]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      playMechanicalClick('subtle', 0.06);
      setCurrentStepIndex(prevIndex);
      renderCurrentStep(prevIndex);
    }
  }, [currentStepIndex, renderCurrentStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < tourSteps.length) {
      playMechanicalClick('key', 0.06);
      playChime(460 + index * 35, 'triangle', 0.1, 0.06);
      setCurrentStepIndex(index);
      renderCurrentStep(index);
    }
  }, [renderCurrentStep]);

  // Keyboard navigation: ArrowRight / Enter for Next, ArrowLeft for Back, Escape for Skip/Close
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTour();
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
  }, [active, handleNext, handleBack, skipTour]);

  if (!active || !step) return null;

  // Compute Tooltip Coordinates clamped within screen
  const padding = 10;
  const tooltipWidth = Math.min(390, window.innerWidth - 32);
  const tooltipHeight = 220;

  let tooltipTop = Math.max(20, window.innerHeight / 2 - tooltipHeight / 2);
  let tooltipLeft = Math.max(16, window.innerWidth / 2 - tooltipWidth / 2);
  const isCentered = !targetRect;

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
      // Preferred placement 'bottom' or default
      if (spaceBelow >= tooltipHeight + 20) {
        tooltipTop = targetRect.top + targetRect.height + 16;
      } else if (spaceAbove >= tooltipHeight + 20) {
        tooltipTop = targetRect.top - tooltipHeight - 16;
      } else {
        tooltipTop = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, targetRect.top + 20));
      }
    }

    // Clamping within visible viewport
    tooltipTop = Math.max(12, Math.min(window.innerHeight - tooltipHeight - 12, tooltipTop));
  }

  const isFinalStep = currentStepIndex === tourSteps.length - 1;

  return (
    <div
      id="cozydesk-spotlight-tour"
      className="fixed inset-0 z-[65] pointer-events-auto select-none"
    >
      {/* Target Spotlight Glow & Cutout with Box Shadow */}
      {targetRect ? (
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
      ) : (
        /* Full Backdrop fallback if target element not found */
        <div className="fixed inset-0 bg-slate-950/78 backdrop-blur-[2px] pointer-events-none z-[66] transition-opacity duration-300" />
      )}

      {/* Floating Tour Tooltip Card */}
      <div
        style={{
          top: isCentered ? '50%' : `${tooltipTop}px`,
          left: isCentered ? '50%' : `${tooltipLeft}px`,
          transform: isCentered ? 'translate(-50%, -50%)' : undefined,
          width: `${tooltipWidth}px`,
        }}
        className="fixed z-[67] bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-[0_12px_44px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col gap-3 transition-all duration-300 ease-out text-slate-100"
      >
        {/* Header with Badge & Close (X) button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-pixel text-[11px] font-bold text-amber-300 tracking-wider uppercase bg-amber-400/20 px-2.5 py-0.5 rounded border border-amber-400/40">
              {step.badge || `HAKBANG ${currentStepIndex + 1} NG ${tourSteps.length}`}
            </span>
          </div>

          <button
            type="button"
            onClick={skipTour}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close / Skip Tour (Esc)"
            aria-label="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide">
            {step.title}
          </h3>
        </div>

        {/* Step Description */}
        <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          {step.description || step.content}
        </p>

        {/* Pagination Dots (Clickable to jump directly to any step) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour navigation dots">
            {tourSteps.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => goToStep(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentStepIndex
                    ? 'w-7 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : i < currentStepIndex
                    ? 'w-2.5 bg-emerald-400/80 hover:bg-emerald-300'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Pumunta sa Hakbang ${i + 1}: ${tourSteps[i].title}`}
                aria-label={`Hakbang ${i + 1}`}
              />
            ))}
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            [← Back • Next → • Esc]
          </span>
        </div>

        {/* Action Controls (Skip, Back, Next / Get Started) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={skipTour}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl border border-slate-700 transition flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5 cursor-pointer border border-amber-200"
            >
              <span>{isFinalStep ? 'Get Started! 🚀' : 'Next >'}</span>
              {!isFinalStep ? (
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Rocket className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
