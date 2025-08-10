import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentRequest,
  getMyPaymentRequests,
  cancelPaymentRequest,
  getAllPaymentRequests,
  verifyPaymentAndEnroll,
  rejectPaymentRequest,
  getMyEnrollments,
  getAllEnrollments,
} from '@/utils/courses/courseAccess';
import { toast } from 'sonner';

// 🧾 Student: Submit Payment
export const useCreatePaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentRequest,
    onSuccess: () => {
      toast.success("Payment request submitted.");
      queryClient.invalidateQueries({ queryKey: ['myPaymentRequests'] });
    },
    onError: () => toast.error("Submission failed."),
  });
};

// 🔍 Student: Get Their Payment Requests
export const useMyPaymentRequests = () => {
  return useQuery({
    queryKey: ['myPaymentRequests'],
    queryFn: getMyPaymentRequests,
  });
};

// ❌ Cancel Request
export const useCancelPaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPaymentRequest,
    onSuccess: () => {
      toast.success("Request cancelled.");
      queryClient.invalidateQueries({ queryKey: ['myPaymentRequests'] });
    },
    onError: () => toast.error("Failed to cancel."),
  });
};

// 🎓 Student: Enrollments
export const useMyEnrollments = () => {
  return useQuery({
    queryKey: ['myEnrollments'],
    queryFn: getMyEnrollments,
  });
};

// 📊 Admin: All Requests
export const useAllPaymentRequests = () => {
  return useQuery({
    queryKey: ['allPaymentRequests'],
    queryFn: getAllPaymentRequests,
  });
};

// ✅ Admin: Verify & Enroll
export const useVerifyPaymentAndEnroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => verifyPaymentAndEnroll(id, payload),
    onSuccess: () => {
      toast.success("Enrollment verified.");
      queryClient.invalidateQueries({ queryKey: ['allPaymentRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allEnrollments'] });
    },
    onError: () => toast.error("Verification failed."),
  });
};

// ❌ Admin: Reject
export const useRejectPaymentRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => rejectPaymentRequest(id, payload),
    onSuccess: () => {
      toast.success("Request rejected.");
      queryClient.invalidateQueries({ queryKey: ['allPaymentRequests'] });
    },
    onError: () => toast.error("Rejection failed."),
  });
};

// 🧾 Admin: All Enrollments
export const useAllEnrollments = () => {
  return useQuery({
    queryKey: ['allEnrollments'],
    queryFn: getAllEnrollments,
  });
};
