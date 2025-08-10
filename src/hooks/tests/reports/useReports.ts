import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dismissReportedQuestion,
  getAllReportedQuestions,
  getAllResolvedReports,
  getReportsByUser,
  getResolvedReportsByUser,
  reportQuestion,
  ReportQuestionPayload,
  resolveReportedQuestion,
} from "@/utils/tests/reports/reports";

// --- Report a question ---
export const useReportQuestion = () => {
  return useMutation({
    mutationFn: (data: ReportQuestionPayload) => reportQuestion(data),
    onSuccess: () => toast.success("Question reported successfully"),
    onError: () => toast.error("Failed to report question"),
  });
};

// --- All reported (Admin) ---
export const useAllReportedQuestions = () => {
  return useQuery({
    queryKey: ["reportedQuestions"],
    queryFn: getAllReportedQuestions,
  });
};

// --- Reports created by logged-in user ---
export const useReportsByUser = () => {
  return useQuery({
    queryKey: ["userReports"],
    queryFn: getReportsByUser,
  });
};

// --- Resolved reports (Admin) ---
export const useAllResolvedReports = () => {
  return useQuery({
    queryKey: ["resolvedReports"],
    queryFn: getAllResolvedReports,
  });
};

// --- Resolved reports created by logged-in user ---
export const useResolvedReportsByUser = () => {
  return useQuery({
    queryKey: ["userResolvedReports"],
    queryFn: getResolvedReportsByUser,
  });
};

// --- Resolve ---
export const useResolveReportedQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, resolutionRemarks }: { reportId: string; resolutionRemarks: string }) =>
      resolveReportedQuestion(reportId, resolutionRemarks),
    onSuccess: () => {
      toast.success("Report resolved successfully");
      queryClient.invalidateQueries({ queryKey: ["reportedQuestions"] });
    },
    onError: () => toast.error("Failed to resolve report"),
  });
};

// --- Dismiss ---
export const useDismissReportedQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => dismissReportedQuestion(reportId),
    onSuccess: () => {
      toast.success("Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["reportedQuestions"] });
    },
    onError: () => toast.error("Failed to dismiss report"),
  });
};
