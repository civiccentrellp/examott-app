'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTestById } from '@/utils/tests/test';
import { useStartTestAttempt } from '@/hooks/tests/useTestAttempt';
import { useCountdownTimer } from '@/utils/timer';
import { DurationDisplay } from '@/components/ui/DurationDisplay';
import InstructionsScreen from './InstructionsScreen';
import TestAttemptView from './TestAttemptView';
import { useUser } from '@/context/userContext';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubmitConfirmationDialog from '../SubmitConfirmationDialog';
import { useRouter } from 'next/navigation';

const MAX_FOCUS_WARNINGS = 3; // ⭐ NEW

const TestsPage = ({ testId }: { testId: string }) => {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<'INSTRUCTIONS' | 'TEST'>('INSTRUCTIONS');
  const [durationInSeconds, setDurationInSeconds] = useState<number>(0);
  const [startTimer, setStartTimer] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showSectionPanel, setShowSectionPanel] = useState<boolean>(false);

  const attemptRef = useRef<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionStats, setSubmissionStats] = useState<any>(null);

  // ⭐ NEW: anti-cheat states
  const [focusWarnings, setFocusWarnings] = useState(0);
  const [antiCheatOpen, setAntiCheatOpen] = useState(false);
  const lastViolationAt = useRef<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const togglePanel = () => setShowSectionPanel((prev) => !prev);

  const { data: test, isLoading } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => getTestById(testId),
  });

  const { mutateAsync: startAttempt, isPending: starting } = useStartTestAttempt();

  useEffect(() => {
    const isLargeScreen = window.innerWidth >= 640;
    setShowSectionPanel(isLargeScreen);
  }, []);

  const autoSubmitTest = () => {
    alert('⏰ Time is up! Auto-submitting the test...');
    handleFinalSubmit();
  };

  const { hours, minutes, seconds } = useCountdownTimer(durationInSeconds, startTimer, autoSubmitTest);

  const handleStart = async () => {
    try {
      const { attemptId } = await startAttempt(testId);
      setAttemptId(attemptId);
      setStartTimer(true);
      setStep('TEST');
      if (window.innerWidth < 640) setShowSectionPanel(false);
    } catch (error) {
      console.error('Failed to start test attempt:', error);
    }
  };

  useEffect(() => {
    if (test?.durationMin) {
      setDurationInSeconds(test.durationMin * 60);
    }
  }, [test]);

  const handleOpenSubmitDialog = () => {
    const stats = attemptRef.current?.getSubmissionStats?.();
    setSubmissionStats(stats);
    setSubmitDialogOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting || hasSubmitted) return;              // ⭐ NEW
    setIsSubmitting(true);                                 // ⭐ NEW
    try {
      await attemptRef.current?.submitTest?.();
      setHasSubmitted(true);                               // ⭐ NEW
    } finally {
      setIsSubmitting(false);                              // ⭐ NEW
      setSubmitDialogOpen(false);
      setAntiCheatOpen(false);                             // ⭐ NEW
    }
  };

  // ⭐ NEW: focus/visibility violation handler
  const triggerFocusViolation = () => {
    if (step !== 'TEST' || hasSubmitted) return;
    const now = Date.now();
    if (now - lastViolationAt.current < 750) return; // debounce multiple events
    lastViolationAt.current = now;

    setFocusWarnings((prev) => {
      const next = prev + 1;
      if (next >= MAX_FOCUS_WARNINGS) {
        // Auto-submit on 3rd violation
        setAntiCheatOpen(true);
        // Let the modal show for a moment; then submit
        setTimeout(() => handleFinalSubmit(), 250);
      } else {
        setAntiCheatOpen(true);
      }
      return next;
    });
  };

  // ⭐ NEW: detect tab switch / window blur
  useEffect(() => {
    if (step !== 'TEST' || hasSubmitted) return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') triggerFocusViolation();
    };
    const onBlur = () => {
      if (!document.hasFocus()) triggerFocusViolation();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [step, hasSubmitted]);

  if (isLoading || !test) return <div className="text-center mt-10">Loading test...</div>;

  const remaining = Math.max(0, MAX_FOCUS_WARNINGS - focusWarnings); // ⭐ NEW

  return (
    <div className="flex flex-col h-screen bg-gray-100 pb-2 pb-[env(safe-area-inset-bottom)] sm:pb-0">
      {/* Header */}
      <div className="w-full bg-white px-4 border-b sticky top-0 shadow-sm z-50">
        <div className="sm:hidden space-y-3">
          <div className="flex items-center gap-4 text-base font-semibold text-gray-800 text-left truncate">

            {test.name}
          </div>

          <div className="flex gap-3 justify-between items-center">
            <div className="text-xs sm:text-sm sm:font-semibold text-gray-600 text-right min-w-[100px]">
              <DurationDisplay
                hours={step === 'INSTRUCTIONS' ? Math.floor(test.durationMin / 60) : hours}
                minutes={step === 'INSTRUCTIONS' ? test.durationMin % 60 : minutes}
                seconds={step === 'INSTRUCTIONS' ? 0 : seconds}
                label=""
              />
            </div>
            {step === 'TEST' && (
              <Button
                variant="outline"
                onClick={handleOpenSubmitDialog}
                disabled={isSubmitting || hasSubmitted} // ⭐ NEW
                className="bg-red-600 text-white text-sm font-medium py-3 w-auto hover:bg-red-700 rounded"
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowSectionPanel((p) => !p)}
              className="bg-violet-600 text-white px-4 py-3 rounded shadow-sm flex items-center gap-2"
            >
              {showSectionPanel ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center p-3">
          <div className="flex items-center gap-4 text-lg font-medium text-gray-800 truncate" title={test.name}>
            {test.name}
          </div>
          <div className="text-lg font-medium text-gray-600 text-right">
            <DurationDisplay
              hours={step === 'INSTRUCTIONS' ? Math.floor(test.durationMin / 60) : hours}
              minutes={step === 'INSTRUCTIONS' ? test.durationMin % 60 : minutes}
              seconds={step === 'INSTRUCTIONS' ? 0 : seconds}
              label={step === 'INSTRUCTIONS' ? 'Duration:' : 'Time Left:'}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full h-full flex-1">
          {step === 'INSTRUCTIONS' ? (
            <InstructionsScreen
              testName={test.name}
              duration={test.durationMin}
              instructions={test.instructions}
              onStart={handleStart}
              loading={starting}
              showPanel={showSectionPanel}
              togglePanel={togglePanel}
              sections={test.sections}
            />
          ) : (
            <TestAttemptView
              ref={attemptRef}
              test={test}
              attemptId={attemptId!}
              showPanel={showSectionPanel}
              togglePanel={togglePanel}
              loading={starting}
              onSubmit={handleFinalSubmit}
              onOpenSubmitDialog={handleOpenSubmitDialog}
            />
          )}
        </div>
      </div>

      <SubmitConfirmationDialog
        open={submitDialogOpen}
        stats={submissionStats}
        onCancel={() => setSubmitDialogOpen(false)}
        onConfirm={handleFinalSubmit}
      />

      {/* ⭐ NEW: Anti-cheat modal */}
      {antiCheatOpen && !hasSubmitted && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-white w-[92%] max-w-md rounded-xl p-5 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Don’t leave the test</h3>
            <p className="text-sm text-gray-700">
              Switching tabs or windows during the test is not allowed.
              {focusWarnings < MAX_FOCUS_WARNINGS
                ? ` You have ${remaining} warning${remaining === 1 ? '' : 's'} left.`
                : ' Submitting test…'}
            </p>

            {focusWarnings < MAX_FOCUS_WARNINGS && (
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAntiCheatOpen(false)}>
                  Continue Test
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestsPage;
