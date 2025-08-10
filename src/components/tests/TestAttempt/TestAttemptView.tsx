'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useImperativeHandle, forwardRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubmitTestAttempt } from '@/hooks/tests/useTestAttempt';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import StudentQuestionCard from './StudentQuestionCard';
import { useSaveStudentAnswer } from '@/hooks/tests/useTestAttempt';
import { useReportQuestion } from '@/hooks/tests/reports/useReports';
import { Check2Circle, ChevronDoubleLeft, ChevronDoubleRight, ChevronLeft, ChevronRight, Stopwatch } from 'react-bootstrap-icons';
import { Eye, EyeOff, Flag } from 'lucide-react';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import QuestionNavigator from './QuestionNavigator';

const TestAttemptView = forwardRef(({
  test,
  attemptId,
  showPanel,
  togglePanel,
  loading = false,
  onSubmit,
  onOpenSubmitDialog, // 👈 ADD THIS
}: {
  test: any;
  attemptId: string;
  showPanel: boolean;
  togglePanel: () => void;
  loading?: boolean;
  onSubmit?: () => void;
  onOpenSubmitDialog?: () => void;
}, ref) => {

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const courseId = searchParams.get('courseId');


  const { mutateAsync: saveAnswerToDb } = useSaveStudentAnswer();
  const { mutateAsync: reportQuestionMutate } = useReportQuestion();

  const [activeTab, setActiveTab] = useState(test.sections[0]?.id); // section ID
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, any>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});

  // Local state
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({});
  const [markReview, setMarkReview] = useState<Record<string, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuestionIdRef = useRef<string | null>(null);
  const lastStartTimeRef = useRef<number>(0);

  const tabListRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabListRef.current) {
      const container = tabListRef.current;
      const scrollAmount = 150;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const flattenSectionQuestions = (section: any) => {
    const flatQuestions: any[] = [];

    section.questions.forEach((q: any) => {
      const effectiveMarks = q.marks ?? section.marksPerQn;
      const effectiveNegative = q.negativeMarks ?? section.negativeMarks ?? 0;

      if (q.type === 'COMPREHENSIVE' && Array.isArray(q.children)) {
        q.children.forEach((child: any) => {
          flatQuestions.push({
            ...child,
            parentParagraph: q.paragraph,
            parentId: q.id,
            marks: effectiveMarks,
            negativeMarks: effectiveNegative,
          });
        });
      } else if (!q.parentId) {
        flatQuestions.push({
          ...q,
          marks: effectiveMarks,
          negativeMarks: effectiveNegative,
        });
      }
    });

    return flatQuestions;
  };

  const sectionIndex = test.sections.findIndex((s: any) => s.id === activeTab);
  const currentSection = test.sections[sectionIndex];
  const currentSectionId = currentSection?.id;

  const questions = flattenSectionQuestions(currentSection);
  const currentQuestion = questions[activeQuestionIndex];
  const currentQuestionId = currentQuestion?.id;



  useEffect(() => {
    if (currentQuestionId) {
      setVisitedQuestions((prev) => ({
        ...prev,
        [currentQuestionId]: true,
      }));
    }
  }, [currentQuestionId]);



  // Cleanup last question time
  const saveCurrentTimer = () => {
    const now = Date.now();
    if (lastQuestionIdRef.current && lastStartTimeRef.current) {
      const timeSpent = Math.floor((now - lastStartTimeRef.current) / 1000);
      setQuestionTimers((prev) => ({
        ...prev,
        [lastQuestionIdRef.current!]: (prev[lastQuestionIdRef.current!] || 0) + timeSpent,
      }));
    }
  };

  // Update timer on question switch
  useEffect(() => {
    saveCurrentTimer();

    lastStartTimeRef.current = Date.now();
    lastQuestionIdRef.current = currentQuestionId;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSpent = Math.floor((now - lastStartTimeRef.current) / 1000);

      setQuestionTimers((prev) => ({
        ...prev,
        [currentQuestionId]: (prev[currentQuestionId] || 0) + 1,
      }));
      lastStartTimeRef.current = now;
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      saveCurrentTimer();
    };
  }, [currentQuestionId]);

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (sectionIndex > 0) {
      const prevSection = test.sections[sectionIndex - 1];
      setActiveTab(prevSection.id);
      scrollTabIntoView(prevSection.id);
      setActiveQuestionIndex(flattenSectionQuestions(prevSection).length - 1);
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else if (sectionIndex < test.sections.length - 1) {
      const nextSection = test.sections[sectionIndex + 1];
      setActiveTab(nextSection.id);
      setActiveQuestionIndex(0);
      scrollTabIntoView(nextSection.id);
    }
  };

  const formatSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const sectionIdLookup = useMemo(() => {
    const map: Record<string, string> = {};

    test.sections.forEach((section: { id: string; questions: any[] }) => {
      section.questions.forEach((q: any) => {
        if (q.type === 'COMPREHENSIVE' && Array.isArray(q.children)) {
          q.children.forEach((child: { id: string }) => {
            map[child.id] = section.id;
          });
        } else {
          map[q.id] = section.id;
        }
      });
    });

    return map;
  }, [test.sections]);



  const toggleReview = async () => {
    if (!currentQuestionId || !attemptId || !currentSection?.id) {
      console.warn("Mark for Review - missing identifiers:", {
        currentQuestionId,
        attemptId: attemptId,
        sectionId: currentSection?.id,
      });
      return;
    }

    const isNowMarked = !markReview[currentQuestionId];

    console.log("Toggling review for:", currentQuestionId, "New status:", isNowMarked);

    setMarkReview((prev) => ({
      ...prev,
      [currentQuestionId]: isNowMarked,
    }));

    try {
      await saveAnswerToDb({
        attemptId,
        questionId: currentQuestionId,
        sectionId: currentSection.id,
        selectedAnswer: selectedAnswers[currentQuestionId] || null,
        markedForReview: isNowMarked,
      });
    } catch (err) {
      console.error('Failed to save review mark:', err);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.warning("Please enter a reason to report.");
      return;
    }

    try {
      await reportQuestionMutate({
        attemptId,
        questionId: currentQuestionId,
        sectionId: currentSectionId,
        reason: reportReason,
      });
      setReportModalOpen(false);
      setReportReason('');
    } catch (err) {
      console.error("Report failed", err);
    }
  };
  const scrollTabIntoView = (sectionId: string) => {
    const tabEl = document.querySelector(`[data-tab-id="${sectionId}"]`) as HTMLElement;
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest', });
    }
  };
  const handleSectionLeft = () => {
    const index = test.sections.findIndex((s: any) => s.id === activeTab);
    if (index > 0) {
      const prevSectionId = test.sections[index - 1].id;
      saveCurrentTimer();
      setActiveTab(prevSectionId);
      setActiveQuestionIndex(0);
      scrollTabIntoView(prevSectionId);
    }
  };

  const handleSectionRight = () => {
    const index = test.sections.findIndex((s: any) => s.id === activeTab);
    if (index < test.sections.length - 1) {
      const nextSectionId = test.sections[index + 1].id;
      saveCurrentTimer();
      setActiveTab(nextSectionId);
      setActiveQuestionIndex(0);
      scrollTabIntoView(nextSectionId);
    }
  };


  const { mutateAsync: submitTest } = useSubmitTestAttempt();

  const getSubmissionStats = () => {
    const allQuestions = test.sections.flatMap(flattenSectionQuestions);
    const total = allQuestions.length;

    let answered = 0;
    let marked = 0;
    let answeredAndMarked = 0;

    allQuestions.forEach((q: { id: string | number }) => {
      const answer = selectedAnswers[q.id];
      const isAnswered =
        Array.isArray(answer) ? answer.length > 0 : answer !== null && answer !== undefined && answer !== '';

      const isMarked = markReview[q.id] === true;

      if (isAnswered) {
        answered++;
        if (isMarked) {
          answeredAndMarked++;
        }
      } else if (isMarked) {
        marked++;
      }
    });

    const unanswered = total - answered;

    return { total, answered, unanswered, marked, answeredAndMarked };
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      for (const [questionId, selectedAnswer] of Object.entries(selectedAnswers)) {
        await saveAnswerToDb({
          attemptId,
          questionId,
          sectionId: sectionIdLookup[questionId],
          selectedAnswer,
          markedForReview: markReview[questionId] || false,
          timeTakenSeconds: questionTimers[questionId] || 0,
        });
      }

      const res = await submitTest(attemptId);
      toast.success('Test submitted successfully!');

      const queryParams = [];
      if (from) queryParams.push(`from=${from}`);
      if (courseId) queryParams.push(`courseId=${courseId}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      router.push(`/tests/result/${res.attempt.id}${queryString}`);


    } catch (err) {
      toast.error('Failed to submit test.');
    } finally {
      setSubmitLoading(false);
    }
  };
  useImperativeHandle(ref, () => ({
    submitTest: handleSubmit,
    getSubmissionStats,
  }));

  return (

    <div className="h-full w-full overflow-hidden">
      {/* Left Main Panel */}
      <div className="hidden sm:flex h-full">
        <div className={cn("flex-1 transition-all duration-300", showPanel ? "lg:w-[75%]" : "w-full")}>
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              saveCurrentTimer(); // save before switching
              setActiveTab(val);
              setActiveQuestionIndex(0); // Reset to first question in new section
            }}
            className="w-full bg-white h-screen px-4"
          >
            <div className="relative flex items-center w-full overflow-hidden">
              {/* Left Scroll Button */}
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white to-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Scrollable Tab List */}
              <TabsList
                ref={tabListRef}
                className="flex items-start overflow-x-auto scroll-smooth no-scrollbar w-full px-8 py-4 my-3 mx-6 bg-white gap-2 rounded-none"
              >
                {test.sections.map((section: any) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className={cn(
                      "flex items-center justify-center px-4 py-2 whitespace-nowrap transition-all duration-200 rounded-md",
                      "bg-violet-100 text-sm",
                      "data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md",
                      "min-w-[100px]",
                      activeTab === section.id ? "min-w-[200px]" : "flex-none"
                    )}
                  >
                    {section.name}
                  </TabsTrigger>

                ))}
              </TabsList>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 z-10 h-full bg-gradient-to-l from-white to-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Content */}
            {test.sections.map((section: any) => (
              <TabsContent
                key={section.id}
                value={section.id}
                className="flex flex-col justify-around pb-4 h-[80%] relative"
              >
                {activeTab === section.id && (
                  <>
                    <div className="flex flex-col gap-2 overflow-y-auto h-[90%]">
                      {currentQuestion && (
                        <>
                          {/* HEADER */}
                          <div className="flex flex-wrap justify-between items-center py-2 px-1">
                            <div className="font-semibold">
                              Question {activeQuestionIndex + 1} of {questions.length}
                            </div>
                            <div className="text-sm">
                              Marks:{' '}
                              <span className="text-green-600 font-semibold">
                                {currentQuestion?.marks}
                              </span>
                              {currentQuestion?.negativeMarks ? (
                                <span className="text-red-600 font-semibold ml-1">
                                  (-{currentQuestion.negativeMarks})
                                </span>
                              ) : null}
                            </div>
                            <div className="text-sm">
                              Time:{' '}
                              <span className="font-mono">
                                {formatSeconds(questionTimers[currentQuestionId] || 0)}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={toggleReview}
                                variant={markReview[currentQuestionId] ? 'review' : 'outline'}
                                className="flex items-center gap-1 py-3"
                              >
                                {markReview[currentQuestionId] ? (
                                  <>
                                    <EyeOff className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Unmark Review</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">Mark for Review</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setReportModalOpen(true)}
                                className="flex items-center gap-1 py-3"
                              >
                                <Flag className="w-6 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* QUESTION */}
                          <StudentQuestionCard
                            question={currentQuestion}
                            index={activeQuestionIndex}
                            selectedAnswer={
                              selectedAnswers[currentQuestionId] ||
                              (currentQuestion.correctType === 'MULTIPLE' ? [] : null) // ✅ Add default here
                            }
                            onSelectAnswer={(answer) => {
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [currentQuestionId]: answer,
                              }));
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        className="flex justify-center items-center gap-2 w-40"
                        onClick={handlePrev}
                      >
                        <ChevronLeft />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        className="flex justify-center items-center bg-violet-500 hover:bg-violet-700 text-white gap-2 w-40"
                        onClick={handleNext}
                      >
                        Next
                        <ChevronRight />
                      </Button>
                    </div>


                  </>
                )}
              </TabsContent>

            ))}

            {reportModalOpen && (
              <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-center justify-center z-50 w-full">
                <div className="bg-white rounded-xl p-6 w-50 ">
                  <h2 className="text-lg font-bold mb-4">Report Question</h2>
                  <textarea
                    rows={10}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Enter reason..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" onClick={() => setReportModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleReport}>
                      Submit Report
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </Tabs>

        </div>

        <div
          onClick={togglePanel}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-20 cursor-pointer transition lg:flex hidden",
            showPanel ? "right-[25%]" : "right-0"
          )}
        >
          <div className="text-dark w-6 h-10 flex items-center justify-center">
            {showPanel ? <ChevronDoubleRight size={18} /> : <ChevronDoubleLeft size={18} />}
          </div>
        </div>


        {showPanel && (
          <div className="hidden lg:block w-[25%] h-full border-l overflow-y-auto bg-white">
            <QuestionNavigator
              sections={test.sections}
              selectedAnswers={selectedAnswers}
              markReview={markReview}
              activeTab={activeTab}
              visitedQuestions={visitedQuestions}
              attemptId={attemptId}
              loading={loading}
              currentQuestionId={currentQuestion?.id}
              sectionIdLookup={sectionIdLookup}
              questionTimers={questionTimers}
              onSubmitClick={onOpenSubmitDialog}
              onNavigate={(sectionId, qIdx) => {
                setActiveTab(sectionId);
                setActiveQuestionIndex(qIdx);

              }}
            />
          </div>
        )}

      </div>

      <div className="sm:hidden h-full w-full">
        {showPanel ? (
          <QuestionNavigator
            sections={test.sections}
            selectedAnswers={selectedAnswers}
            markReview={markReview}
            activeTab={activeTab}
            visitedQuestions={visitedQuestions}
            attemptId={attemptId}
            loading={loading}
            currentQuestionId={currentQuestion?.id}
            sectionIdLookup={sectionIdLookup}
            questionTimers={questionTimers}
            onSubmitClick={onOpenSubmitDialog}
            onNavigate={(sectionId, qIdx) => {
              setActiveTab(sectionId);
              setActiveQuestionIndex(qIdx);
              togglePanel();
            }}
          />
        ) : (
          <div className="h-full w-full">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                saveCurrentTimer(); // save before switching 
                setActiveTab(val);
                setActiveQuestionIndex(0); // Reset to first question in new section
              }}
              className="w-full bg-white h-screen px-4"
            >
              <div className="flex items-center gap-2 w-full px-4 py-2 bg-white sm:justify-center">
                <button
                  onClick={handleSectionLeft}
                  className="absolute left-0 z-10 h-full px-2 bg-gradient-to-r from-white to-transparent"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <TabsList
                  ref={tabListRef}
                  className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar w-full px-8 py-4 mt-1 bg-white gap-2 rounded-none sm:overflow-visible"
                >
                  {test.sections.map((section: any) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      data-tab-id={section.id}
                      className={cn(
                        "flex items-center snap-start min-w-full h-full text-sm text-center font-medium px-4 py-4 rounded-md whitespace-nowrap",
                        "transition-all duration-200 bg-violet-100",
                        "data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                      )}
                    >
                      {section.name}
                    </TabsTrigger>

                  ))}
                </TabsList>

                {/* Right Scroll Button */}
                <button
                  onClick={handleSectionRight}
                  className="absolute right-0 z-10 h-full px-2 bg-gradient-to-l from-white to-transparent"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Content */}
              {test.sections.map((section: any) => (
                <TabsContent
                  key={section.id}
                  value={section.id}
                  className="flex flex-col h-[100vh] relative"
                >
                  {activeTab === section.id && (
                    <>
                      <div className="flex flex-col gap-2 overflow-y-auto h-[75vh]">
                        {currentQuestion && (
                          <>
                            {/* HEADER */}
                            <div className="flex flex-wrap justify-between items-center p-2">
                              <div className="font-semibold">
                                Q {activeQuestionIndex + 1} of {questions.length}
                              </div>
                              <div className="h-5 border-l border-gray-300" />
                              <div className="flex items-center gap-2 font-semibold">
                                {/* Positive Marks */}
                                <span className="flex items-center text-green-600">
                                  <Check2Circle className="mr-1" size={16} />
                                  {currentQuestion?.marks ?? 1}
                                </span>

                                {/* Negative Marks if present and > 0 */}
                                {typeof currentQuestion?.negativeMarks === 'number' &&
                                  currentQuestion.negativeMarks > 0 && (
                                    <>
                                      <span className="text-gray-400">:</span>
                                      <span className="text-red-600">{currentQuestion.negativeMarks}</span>
                                    </>
                                  )}
                              </div>

                              <div className="h-5 border-l border-gray-300" />
                              <div className="">

                                <span className="font-mono flex items-center gap-2 justify-between">
                                  <Stopwatch size={18} />
                                  {formatSeconds(questionTimers[currentQuestionId] || 0)}
                                </span>
                              </div>
                              <div className="h-5 border-l border-gray-300" />
                              <div className="flex gap-4">
                                <Button
                                  size="sm"
                                  onClick={toggleReview}
                                  variant={markReview[currentQuestionId] ? 'review' : 'outline'}
                                  className="flex items-center gap-1 py-3"
                                >
                                  {markReview[currentQuestionId] ? (
                                    <>
                                      <EyeOff className="w-4 h-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Unmark Review</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Mark for Review</span>
                                    </>
                                  )}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setReportModalOpen(true)}
                                  className="flex items-center gap-1 py-3"
                                >
                                  <Flag className="w-6 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* QUESTION */}
                            <StudentQuestionCard
                              question={currentQuestion}
                              index={activeQuestionIndex}
                              selectedAnswer={
                                selectedAnswers[currentQuestionId] ||
                                (currentQuestion.correctType === 'MULTIPLE' ? [] : null)
                              }
                              onSelectAnswer={(answer) => {
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [currentQuestionId]: answer,
                                }));
                              }}
                            />
                          </>
                        )}
                      </div>

                      {/* FOOTER BUTTONS */}
                      <div className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          className="flex justify-center items-center gap-2 w-40"
                          onClick={handlePrev}
                        >
                          <ChevronLeft />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          className="flex justify-center items-center bg-violet-500 hover:bg-violet-700 text-white gap-2 w-40"
                          onClick={handleNext}
                        >
                          Next
                          <ChevronRight />
                        </Button>
                      </div>


                    </>
                  )}
                </TabsContent>

              ))}

              {reportModalOpen && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex items-center justify-center z-50 w-full">
                  <div className="bg-white rounded-xl p-6 w-full ">
                    <h2 className="text-lg font-bold mb-4">Report Question</h2>
                    <textarea
                      rows={10}
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Enter reason..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <div className="flex justify-between mt-4 gap-2">
                      <Button variant="outline" onClick={() => setReportModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleReport}>
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </Tabs>

          </div>
        )}
      </div>
    </div>
  );

});

export default TestAttemptView;
