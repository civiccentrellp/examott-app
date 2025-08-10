import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type StudentAnswerStatus =
  | 'NOT_VISITED'
  | 'UNANSWERED'
  | 'ANSWERED'
  | 'MARKED_FOR_REVIEW'
  | 'ANSWERED_AND_MARKED_FOR_REVIEW';

export type StartTestResponse = {
  attemptId: string;
};

export type SaveAnswerPayload = {
  attemptId: string;
  questionId: string;
  sectionId: string;
  selectedAnswer: any;
  markedForReview?: boolean;
  timeTakenSeconds?: number;
};

// 🔐 Get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export async function startTestAttempt(testId: string): Promise<StartTestResponse> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/test/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ testId }),
    });

    if (!res.ok) throw new Error('❌ Failed to start test attempt');

    return await res.json();
  } catch (err) {
    console.error('❌ Error starting test attempt:', err);
    throw err;
  }
}

export async function saveStudentAnswer(data: SaveAnswerPayload): Promise<{ success: boolean }> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/test/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('❌ Failed to save answer');

    return await res.json();
  } catch (err) {
    console.error('❌ Error saving student answer:', err);
    throw err;
  }
}

export async function submitTestAttempt(attemptId: string): Promise<{
  success: boolean;
  attempt: {
    id: string;
    totalMarks: number;
    finalScore: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    totalTimeTaken: number;
    // Add other fields if needed
  };
}> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/test/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attemptId }),
    });

    if (!res.ok) throw new Error('❌ Failed to submit test');

    return await res.json();
  } catch (err) {
    console.error('❌ Error submitting test:', err);
    throw err;
  }
}

export async function getTestResultByAttemptId(attemptId: string): Promise<any> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/test/${attemptId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error('❌ Failed to apiFetch test result');

    return await res.json();
  } catch (err) {
    console.error('❌ Error apiFetching test result:', err);
    throw err;
  }
}
