'use client';
import { useEffect, useState } from 'react';
import { useTestResult } from '@/hooks/tests/useTestAttempt';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import AnimatedProgressProvider from '@/components/ui/AnimatedProgressProvider';
import { getTestsByTag, getTestsByTags, Test } from '@/utils/tests/test';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';


interface TestResultPageProps {
  attemptId: string;
}

const TestResultPage: React.FC<TestResultPageProps> = ({ attemptId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from'); // 'course', 'free-material', etc.


  const { data: result, isLoading } = useTestResult(attemptId);
  const [recommendedTests, setRecommendedTests] = useState<Test[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!result || !result.test?.tags?.length) return;

    const fetchRecommended = async () => {
      const tagNames = result.test.tags.map((tag: { name: string }) => tag.name);
      console.log('🧪 Sending tags to API:', tagNames); // ✅ Debug

      setLoadingRecommendations(true);

      try {
        const allMatches = await getTestsByTags(tagNames);

        const uniqueTests = Array.from(
          new Map(
            allMatches
              .filter((t) => t.id !== result.test.id)
              .map((t) => [t.id, t])
          ).values()
        );

        setRecommendedTests(uniqueTests);
      } catch (err) {
        console.error('❌ Failed to load recommended tests:', err);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommended();
  }, [result?.test?.tags]);


  if (isLoading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Fetching your result...
      </div>
    );
  }

  const stats = {
    totalQuestions: result.answeredCount + result.unansweredCount,
    correctAnswers: result.correctCount,
    incorrectAnswers: result.wrongCount,
    unattempted: result.unansweredCount,
    score: result.finalScore,
    timeTaken: formatTime(result.totalTimeTaken),
    testName: result.test?.name || 'Your Test',
    date: new Date(result.createdAt).toLocaleDateString(),
  };

  return (
    <div className="h-[98vh] sm:min-h-screen bg-white px-4 py-10 sm:py-14 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-5xl mb-6 -mt-4 px-2">
        <button
          onClick={() => {
            if (from === 'course') router.push('/courses');
            else if (from === 'free-material') router.push('/freematerials');
            else router.push('/dashboard');
          }}
          className="inline-flex items-center text-sm sm:text-base text-violet-700 hover:underline"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

      </div>

      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-10">
        {/* Header */}
        <div className="text-start sm:text-left space-y-4 max-w-2xl">
          <h1 className="text-2xl sm:text-5xl text-center font-bold text-gray-800">Successfully completed</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate w-full max-w-[400px] sm:max-w-full px-1">
            {stats.testName}
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 mt-2 py-1 text-xl sm:text-2xl text-gray-700">
            <span className="whitespace-nowrap">Time Taken:</span>
            <span className="font-semibold sm:font-bold text-2xl sm:text-3xl">{stats.timeTaken}</span>
          </div>
        </div>

        {/* Score Ring with Animation */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-36 sm:w-60 rounded-full">
            <AnimatedProgressProvider valueStart={0} valueEnd={stats.score}>
              {(value) => (
                <CircularProgressbar
                  value={value}
                  maxValue={result.maxPossibleMarks}
                  text={`${Math.round(value)}`}
                  strokeWidth={8}
                  styles={buildStyles({
                    pathColor: '#7008E7',
                    textColor: '#7008E7',
                    trailColor: '#E7E7E7',
                    textSize: '24px',
                    pathTransition: 'none',
                  })}
                />
              )}
            </AnimatedProgressProvider>
          </div>
          <p className="font-semibold text-2xl">Total Score</p>
        </div>
      </div>

      {/* Stats Circles */}
      <div className="mt-10 w-full max-w-3xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {/* Total Questions - Static */}
        <div className="flex flex-col items-center space-y-1">
          <div className="relative w-16 h-16 rounded-full border-4 border-orange-500">
            <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-orange-500">
              {stats.totalQuestions}
            </div>
          </div>
          <p className="text-center text-sm font-medium text-gray-700">Total Questions</p>
        </div>

        {/* Correct */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-16 h-16">
            <AnimatedProgressProvider
              valueStart={0}
              valueEnd={(stats.correctAnswers / stats.totalQuestions) * 100}
            >
              {(value) => (
                <CircularProgressbar
                  value={value}
                  text={`${stats.correctAnswers}`}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: '#22C55E',
                    textColor: '#22C55E',
                    trailColor: '#E5E7EB',
                    textSize: '26px',
                    pathTransition: 'none',
                  })}
                />
              )}
            </AnimatedProgressProvider>
          </div>
          <p className="text-center text-sm font-medium text-gray-700">Correct Answers</p>
        </div>

        {/* Incorrect */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-16 h-16">
            <AnimatedProgressProvider
              valueStart={0}
              valueEnd={(stats.incorrectAnswers / stats.totalQuestions) * 100}
            >
              {(value) => (
                <CircularProgressbar
                  value={value}
                  text={`${stats.incorrectAnswers}`}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: '#EF4444',
                    textColor: '#EF4444',
                    trailColor: '#E5E7EB',
                    textSize: '26px',
                    pathTransition: 'none',
                  })}
                />
              )}
            </AnimatedProgressProvider>
          </div>
          <p className="text-center text-sm font-medium text-gray-700">Incorrect Answers</p>
        </div>

        {/* Unattempted */}
        <div className="flex flex-col items-center space-y-1">
          <div className="w-16 h-16">
            <AnimatedProgressProvider
              valueStart={0}
              valueEnd={(stats.unattempted / stats.totalQuestions) * 100}
            >
              {(value) => (
                <CircularProgressbar
                  value={value}
                  text={`${stats.unattempted}`}
                  strokeWidth={10}
                  styles={buildStyles({
                    pathColor: '#6B7280',
                    textColor: '#6B7280',
                    trailColor: '#E5E7EB',
                    textSize: '26px',
                    pathTransition: 'none',
                  })}
                />
              )}
            </AnimatedProgressProvider>
          </div>
          <p className="text-center text-sm font-medium text-gray-700">Unattempt Questions</p>
        </div>
      </div>

      {/* Promotion Cards */}
      <div className="w-full max-w-4xl mt-14 px-2">
        <div className="bg-gray-100 rounded-xl p-5 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Boost your skills with flexible online test.
          </h3>
          {loadingRecommendations ? (
            <div className="text-sm text-gray-400">Loading recommendations...</div>
          ) : recommendedTests.length > 0 ? (
            <div className="flex sm:justify-center sm:flex-wrap gap-4 overflow-x-auto scrollbar-hide">
              {recommendedTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => router.push(`/tests/${test.id}?from=recommendation`)}
                  className="min-w-[160px] sm:w-[180px] bg-violet-200 hover:bg-violet-300 transition rounded-lg p-4 shadow text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {test.name}
                </div>
              ))}
            </div>
          ) : (

            <Button variant="outline" onClick={() => router.push(`/freematerials`)} className="shadow p-2 bg-violet-400 rounded-3xl text-sm text-gray-900 hover:bg-violet-500">View more Tests</Button>

          )}

          <div className="mt-3 flex justify-center gap-2">
            {recommendedTests.slice(0, 4).map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full ${i === 0 ? 'w-3 bg-violet-600' : 'w-2 bg-gray-300'}`}
              ></span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestResultPage;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h} : ${m} : ${s}`;
}
