'use client';

import React from 'react';
import { useUser } from '@/context/userContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface QuestionNavigatorProps {
  sections: any[];
  selectedAnswers: Record<string, any>;
  markReview: Record<string, boolean>;
  visitedQuestions: Record<string, boolean>;
  currentQuestionId: string | null;
  onNavigate: (sectionId: string, questionIndex: number) => void;
  activeTab: string;
  attemptId: string;
  loading: boolean;
  sectionIdLookup: Record<string, string>;
  questionTimers: Record<string, number>;
  onSubmitClick?: () => void; // ✅ NEW PROP
}

const QuestionNavigator = ({
  sections,
  selectedAnswers,
  markReview,
  visitedQuestions,
  currentQuestionId,
  onNavigate,
  activeTab,
  attemptId,
  loading,
  sectionIdLookup,
  questionTimers,
  onSubmitClick, // ✅ RECEIVED HERE
}: QuestionNavigatorProps) => {
  const { user } = useUser();

  const flattenSectionQuestions = (section: any) => {
    const flatQuestions: any[] = [];

    section.questions.forEach((q: any) => {
      if (q.type === 'COMPREHENSIVE' && Array.isArray(q.children)) {
        q.children.forEach((child: any) => {
          flatQuestions.push({
            ...child,
            parentId: q.id,
          });
        });
      } else if (!q.parentId) {
        flatQuestions.push(q);
      }
    });

    return flatQuestions;
  };

  return (
    <div className="flex flex-col justify-between h-full overflow-y-auto bg-white border-l">
      {/* Header */}
      <div>
        <div className="text-dark font-medium px-4 py-3 flex items-center bg-violet-50 justify-end sm:justify-center gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-2xl font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <span className="hidden sm:block text-slate-800 leading-none truncate text-xl">
            {user?.name || 'Student'}
          </span>
        </div>

        <div className="my-4 px-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded-full" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-full" /> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-full" /> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400 rounded-full" /> Not Visited</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-4 h-4 bg-green-600 rounded-full" />
                <div className="absolute -top-0 -right-0 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
              </div>
              Answered & Marked for review
            </div>
          </div>
        </div>

        {/* Question Bubbles */}
        <div className="space-y-4 flex items-center m-4">
          {sections
            .filter((section) => section.id === activeTab)
            .map((section) => {
              const flat = flattenSectionQuestions(section);
              return (
                <div key={section.id}>
                  <h5 className="my-2 text-xl">{section.name}</h5>
                  <div className="flex flex-wrap gap-2">
                    {flat.map((q: any, idx: number) => {
                      const isAnswered = selectedAnswers[q.id] != null && selectedAnswers[q.id] !== '';
                      const isMarked = markReview[q.id];
                      const isVisited = visitedQuestions[q.id];

                      let bubbleColor = 'bg-gray-400';
                      if (isAnswered && isMarked) bubbleColor = 'bg-green-600';
                      else if (isMarked) bubbleColor = 'bg-yellow-400';
                      else if (isAnswered) bubbleColor = 'bg-green-600';
                      else if (isVisited) bubbleColor = 'bg-red-600';

                      const showBadge = isAnswered && isMarked;

                      return (
                        <div className="relative" key={q.id}>
                          <button
                            onClick={() => onNavigate(section.id, idx)}
                            title={`Question ${idx + 1}`}
                            className={cn(
                              'w-10 h-10 rounded-full text-white font-semibold text-sm flex items-center justify-center',
                              'transition duration-200 hover:ring-2 hover:ring-violet-400 focus:outline-none',
                              bubbleColor,
                              q.id === currentQuestionId ? 'ring-2 ring-black' : ''
                            )}
                          >
                            {idx + 1}
                          </button>
                          {showBadge && (
                            <span className="absolute -top-0 -right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ✅ Submit Button */}
      <div className="fixed bottom-4 sm:bottom-4 px-3 flex items-center justify-center w-full sm:w-1/4">
        <Button
         variant="outline"
          onClick={onSubmitClick} // ✅ triggers modal via TestPage
          disabled={loading}
          className="w-full bg-red-600 text-white px-4 py-6 text-center text-lg font-light cursor-pointer hover:bg-red-700 hover:font-semibold"
        >
          Submit Test
        </Button>
      </div>
    </div>
  );
};

export default QuestionNavigator;
