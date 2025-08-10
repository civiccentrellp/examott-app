import { apiFetch } from "../fetchApi";

export  type Faq = {
    id: string;
    courseId: string;
    question: string;
    answer: string;
    createdAt: string;
    updatedAt: string;
};

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export const getFaqs = async (courseId: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/faqs`);
  return res.json();
};

export const createFaq = async (faq: { courseId: string; question: string; answer: string }) => {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${faq.courseId}/faqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(faq),
  });
  return res.json();
};

export const updateFaq = async (id: string, question: string, answer: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/faqs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer }),
  });
  return res.json();
};

export const deleteFaq = async (id: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/faqs/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
