// hooks/useTestAttempt.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  startTestAttempt,
  saveStudentAnswer,
  submitTestAttempt,
  SaveAnswerPayload,
  StartTestResponse,
  getTestResultByAttemptId,
} from '../../utils/tests/testAttempt'
import { toast } from 'sonner';

// 🔁 Start Test Attempt
export const useStartTestAttempt = () => {
  return useMutation<StartTestResponse, Error, string>({
    mutationFn: (testId) => startTestAttempt(testId),
  });
};

// 💾 Save Student Answer
export const useSaveStudentAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveAnswerPayload) => saveStudentAnswer(data),
    // Optional: optimistically update or refetch
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentTestStatus'] });
    },
  });
};

export const useSubmitTestAttempt = () => {
  return useMutation<{
    success: boolean;
    attempt: {
      id: string;
      totalMarks: number;
      finalScore: number;
      correctCount: number;
      wrongCount: number;
      unansweredCount: number;
      totalTimeTaken: number;
    };
  }, Error, string>({
    mutationFn: (attemptId) => submitTestAttempt(attemptId),
  });
};

export const useTestResult = (attemptId: string, enabled = true) => {
  return useQuery({
    queryKey: ['testResult', attemptId],
    queryFn: () => getTestResultByAttemptId(attemptId),
    enabled: !!attemptId && enabled,
  });
};

