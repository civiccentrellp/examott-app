import { apiFetch } from "../fetchApi";

export type Option = {
    value: string;
    correct: boolean;
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

  
  export async function addOptions(questionId: string, options: Option[]) {
    try {
      const res = await fetch(`${apiBaseUrl}/api/question-options/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
  
      if (!res.ok) throw new Error("Failed to upload options");
  
      return await res.json();
    } catch (error) {
      console.error("Error uploading options:", error);
      throw error;
    }
  }
  