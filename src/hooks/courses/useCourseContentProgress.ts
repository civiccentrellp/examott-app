import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  saveCourseContentProgress, 
  getCourseContentProgress, 
  getCourseProgressSummary,
  saveLastOpenedContent,
  getLastOpenedContent
} from "@/utils/courses/courseContentProgress";
import { toast } from "sonner";

// Save progress (mark video/document as completed)
export const useSaveCourseContentProgress = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { contentId: string; isCompleted?: boolean }) =>
      saveCourseContentProgress(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseProgress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courseProgressSummary", courseId] });
    },
    onError: () => toast.error("Failed to save progress."),
  });
};

// Get progress for all contents
export const useCourseContentProgress = (courseId: string) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: () => getCourseContentProgress(courseId),
  });
};

// Get summary (completion %)
export const useCourseProgressSummary = (courseId: string) => {
  return useQuery({
    queryKey: ["courseProgressSummary", courseId],
    queryFn: () => getCourseProgressSummary(courseId),
  });
};

// Save last opened content
export const useSaveLastOpenedContent = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { contentId: string; folderId?: string }) =>
      saveLastOpenedContent(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lastOpenedContent", courseId] });
    },
    onError: () => toast.error("Failed to save last opened content."),
  });
};

// Get last opened content
export const useLastOpenedContent = (courseId: string) => {
  return useQuery({
    queryKey: ["lastOpenedContent", courseId],
    queryFn: () => getLastOpenedContent(courseId),
  });
};
