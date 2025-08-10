import { apiFetch } from "../fetchApi";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type Attachment = {
  type: 'IMAGE' | 'PDF' | 'VIDEO' | 'URL';
  url: string;
};

export async function addAttachments(questionId: string, attachments: Attachment[]) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/question-attachments/${questionId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attachments),
    });

    if (!res.ok) throw new Error("Failed to upload attachments");

    return await res.json();
  } catch (error) {
    console.error("Error uploading attachments:", error);
    throw error;
  }
}
