// components/OnboardingTour.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const TOUR_STORAGE_KEY = 'nyaySaarthi_onboardingTourCompleted';

interface TourStep {
  id: string; // Unique ID for the step
  targetId: string; // ID of the element to attach the tooltip to
  title: string;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

const tourSteps: TourStep[] = [
  {
    id: 'step1',
    targetId: 'tour-stats-total', // We'll add this ID to the first stat card
    title: 'आंकड़े देखें',
    content: 'यहां आप अपने दस्तावेज़ों का त्वरित अवलोकन देख सकते हैं - कुल कितने हैं, कितने विश्लेषित हैं, आदि।',
    side: 'bottom',
    align: 'start',
  },
  {
    id: 'step2',
    targetId: 'tour-upload-button', // We'll add this ID to the main upload button
    title: 'दस्तावेज़ अपलोड करें',
    content: 'नया दस्तावेज़ विश्लेषण के लिए यहाँ क्लिक करें या फ़ाइलें खींचें।',
    side: 'bottom',
    align: 'end',
  },
  {
    id: 'step3',
    targetId: 'tour-recent-docs', // We'll add this ID to the recent docs card
    title: 'हाल के दस्तावेज़',
    content: 'आपके हाल ही में अपलोड किए गए या एक्सेस किए गए दस्तावेज़ यहां सूचीबद्ध हैं। आप यहीं से चैट या सारांश देख सकते हैं।',
    side: 'top',
    align: 'start',
  },
  {
    id: 'step4',
    targetId: 'tour-quick-actions', // We'll add this ID to the quick actions card
    title: 'त्वरित कार्य',
    content: 'यहां से सीधे दस्तावेज़ अपलोड करें, AI से पूछें या परामर्श बुक करें।',
    side: 'top',
    align: 'end',
  },
];

export function OnboardingTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTourVisible, setIsTourVisible] = useState(false);

  useEffect(() => {
    // Check if the tour has been completed before
    try {
      const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!tourCompleted) {
        // Delay showing the tour slightly to allow the page to render
        const timer = setTimeout(() => setIsTourVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("LocalStorage not available for onboarding tour check.");
    }
  }, []);

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsTourVisible(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn("LocalStorage not available for setting tour completion.");
    }
  };

  if (!isTourVisible || currentStepIndex >= tourSteps.length) {
    return null; // Don't render anything if tour is hidden or finished
  }

  const currentStep = tourSteps[currentStepIndex];
  const targetElement = document.getElementById(currentStep.targetId);

  // If the target element isn't rendered yet, don't show the tooltip
  if (!targetElement) {
    console.warn(`Onboarding tour target element not found: ${currentStep.targetId}`);
    // Optionally skip this step or wait? For simplicity, we'll just not render.
    // Consider adding a small delay/retry or skipping if element consistently missing.
     // handleNext(); // Auto-skip if element not found? Risky.
    return null;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={true}> {/* Force tooltip open */}
        <TooltipTrigger asChild>
           {/*
             Create a dummy, invisible trigger positioned relative to the target.
             This is a workaround as TooltipTrigger ideally wraps the target directly,
             but we can't easily do that for arbitrary elements in the dashboard.
           */}
           <div
             style={{
               position: 'absolute',
               left: targetElement.offsetLeft, // Position based on target
               top: targetElement.offsetTop,   // Position based on target
               width: targetElement.offsetWidth, // Match target size (optional)
               height: targetElement.offsetHeight,// Match target size (optional)
               pointerEvents: 'none', // Make it non-interactive
             }}
           />
        </TooltipTrigger>
        <TooltipContent
          side={currentStep.side}
          align={currentStep.align}
          className="max-w-xs p-4 shadow-lg border border-primary/20 bg-white"
          // Prevent closing on pointer down outside, we control it with buttons
          onPointerDownOutside={(e) => e.preventDefault()}
          sideOffset={10} // Add some offset
        >
           <button
             onClick={handleSkip}
             className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
             aria-label="Skip tour"
           >
             <X size={16} />
           </button>
          <h4 className="font-semibold mb-2 text-primary">{currentStep.title}</h4>
          <p className="text-sm text-gray-600 mb-4">{currentStep.content}</p>
          <div className="flex justify-between items-center">
             <span className="text-xs text-gray-500">
               Step {currentStepIndex + 1} of {tourSteps.length}
             </span>
            <Button size="sm" onClick={handleNext}>
              {currentStepIndex < tourSteps.length - 1 ? 'अगला' : 'समाप्त'}
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}