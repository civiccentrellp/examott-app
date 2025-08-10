import { apiFetch } from "../fetchApi";

export type Subject = {
    id: string;
    name: string;
    courseId: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getSubjects(): Promise<Subject[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/subjects`, { cache: "no-store" });

    if (!res.ok) throw new Error("Failed to apiFetch subjects");

    const result = await res.json();

    // Check if the result has a 'data' property and return it if so
    if (result && result.data && Array.isArray(result.data)) {
      return result.data;  // Return the subjects array
    } else {
      return [];  // Return an empty array if 'data' is not found or is not an array
    }
  } catch (error) {
    console.error("Error in getSubjects:", error);
    return [];
  }
}

export async function addSubject(data: { name: string; courseId: string }) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create subject");

        return await res.json();
    } catch (error) {
        console.error("Error adding subject:", error);
        throw error;
    }
}

export async function updateSubject(id: string, updates: Partial<Subject>) {
    try {
        const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));

        const res = await apiFetch(`${apiBaseUrl}/api/subjects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleaned),
        });

        if (!res.ok) throw new Error("Failed to update subject");

        return await res.json();
    } catch (error) {
        console.error("Error updating subject:", error);
        throw error;
    }
}

export async function deleteSubject(id: string) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/subjects/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete subject");

        return await res.json();
    } catch (error) {
        console.error("Error deleting subject:", error);
        throw error;
    }
}
