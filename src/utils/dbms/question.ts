import { JSONContent } from "@tiptap/react";
import { apiFetch } from "../fetchApi";

export type Question = {
  id: string;
  subTopicId?: string;
  type: "OBJECTIVE" | "DESCRIPTIVE" | "COMPREHENSIVE";
  correctType: "SINGLE" | "MULTIPLE";
  question: JSONContent;
  explanation?: JSONContent;
  tags?: { id?: string; name: string }[];
  attachments?: { id: string; type: string; url: string }[];
  options?: { value: string; correct: boolean }[];
  parentId?: string;
  paragraph?: JSONContent;
  children?: Question[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getQuestions(
  subTopicIds: string | string[],
  type?: "OBJECTIVE" | "DESCRIPTIVE" | "COMPREHENSIVE"
): Promise<Question[]> {
  try {
    const queryParam = `subTopicIds=${Array.isArray(subTopicIds) ? subTopicIds.join(",") : subTopicIds}` +
      (type ? `&type=${type}` : "");

    const res = await apiFetch(`${apiBaseUrl}/api/questions?${queryParam}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to apiFetch questions");
    const result = await res.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error in getQuestions:", error);
    return [];
  }
}

export async function addQuestion(data: Omit<Question, "id">) {
  try {
    const token = localStorage.getItem("token");

    const res = await apiFetch(`${apiBaseUrl}/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to add question");
    return await res.json();
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
}

export async function updateQuestion(id: string, updates: Partial<Question>) {
  const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));
  const token = localStorage.getItem("token");

  const res = await apiFetch(`${apiBaseUrl}/api/questions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(cleaned),
  });

  if (!res.ok) throw new Error("Failed to update question");

  return await res.json();
}

export async function deleteQuestion(id: string) {
  try {
    const token = localStorage.getItem("token"); // ✅ Add token

    const res = await apiFetch(`${apiBaseUrl}/api/questions/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error("Failed to delete question");

    return await res.json();
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}


export async function getQuestionById(id: string): Promise<Question> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/questions/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch question');

    return await res.json();
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    throw error;
  }
}

