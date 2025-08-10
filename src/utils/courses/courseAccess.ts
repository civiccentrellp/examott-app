const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";
import { apiFetch } from "../fetchApi";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// export async function createPaymentRequest(payload: {
//   courseId: string;
//   screenshotUrl: string;
//   amountPaid: number;
// }) {
//   const res = await apiFetch(`${apiBaseUrl}/api/m-payments/request`, {
//     method: 'POST',
//     headers: getAuthHeaders(),
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error('Failed to create payment request');
//   return await res.json();
// }

export async function createPaymentRequest(payload: {
  courseId: string;
  screenshotUrl: string;
  amountPaid: number;
  utrNumber: string;                 // NEW
  pricingOptionId?: string | null;   // optional
  installmentId?: string | null;     // optional
}) {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to create payment request');
  return await res.json();
}

export async function getMyPaymentRequests() {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/my`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch your payment requests');
  return await res.json();
}

export async function cancelPaymentRequest(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/request/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to cancel payment request');
  return true;
}

export async function getMyEnrollments() {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/enrollments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch your enrollments');
  return await res.json();
}

export async function getAllPaymentRequests() {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/requests`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch payment requests');
  return await res.json();
}

export async function verifyPaymentAndEnroll(id: string, payload: {
  courseId: string;
  userId: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  adminNote?: string;
}) {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/request/${id}/verify`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to verify and enroll');
  return await res.json();
}

export async function rejectPaymentRequest(id: string, payload: { adminNote?: string }) {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/request/${id}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to reject request');
  return await res.json();
}

export async function getAllEnrollments() {
  const res = await apiFetch(`${apiBaseUrl}/api/m-payments/enrollments/all`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch enrollments');
  return await res.json();
}
