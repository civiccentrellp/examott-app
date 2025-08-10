import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserEnrollments,
  getUserEnrolledCourses,
  addUserEnrollment,
  removeUserEnrollment,
  Enrollment,
  EnrolledCourse,
  getLastOpenedCourse,
  updateLastOpenedCourse
} from '../../utils/courses/courseEnrollments';
import { toast } from 'sonner';

// 📦 Minimal enrollments (IDs, start/end dates)
export const useUserEnrollments = (userId: string, enabled = true) => {
  return useQuery<Enrollment[]>({
    queryKey: ['enrollments', userId],
    queryFn: () => getUserEnrollments(userId),
    enabled: !!userId && enabled,
  });
};

// 📦 Full enrolled courses with course info
export const useUserEnrolledCourses = (userId: string, enabled = true) => {
  return useQuery<EnrolledCourse[]>({
    queryKey: ['enrolledCourses', userId],
    queryFn: () => getUserEnrolledCourses(userId),
    enabled: !!userId && enabled,
  });
};

// ➕ Add enrollment (Admin/Manual)
export const useAddEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; courseId: string; pricingOptionId?: string; accessType: string }) =>
      addUserEnrollment(data),
    onSuccess: () => {
      toast.success("Enrollment added");
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
    },
    onError: () => toast.error("Failed to add enrollment"),
  });
};

// 🗑 Remove enrollment
export const useRemoveEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeUserEnrollment(id),
    onSuccess: () => {
      toast.success("Enrollment removed");
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
    },
    onError: () => toast.error("Failed to remove enrollment"),
  });
};

// 🆕 Get last opened course
export const useLastOpenedCourse = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['lastOpenedCourse', userId],
    queryFn: () => getLastOpenedCourse(userId),
    enabled: !!userId && enabled,
  });
};
// 🆕 Update last opened course
export const useUpdateLastOpenedCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Accept enrollmentId instead of courseId
    mutationFn: ({ userId, enrollmentId }: { userId: string; enrollmentId: string }) =>
      updateLastOpenedCourse(userId, enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastOpenedCourse'] });
    },
    onError: () => toast.error("Failed to update last opened course"),
  });
};
