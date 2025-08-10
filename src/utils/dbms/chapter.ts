import { apiFetch } from "../fetchApi";
export type Chapter = {
    id: string;
    name: string;
    subjectId: string;
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getChapters(subjectId: string): Promise<Chapter[]> {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/chapters?subjectId=${subjectId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to apiFetch chapters");

        const result = await res.json();
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Error in getChapters:", error);
        return [];
    }
}

export async function addChapter(data: { name: string; subjectId: string }) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/chapters`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to add chapter");

        return await res.json();
    } catch (error) {
        console.error("Error adding chapter:", error);
        throw error;
    }
}

export async function updateChapter(id: string, updates: Partial<Chapter>) {
    const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));

    const res = await apiFetch(`${apiBaseUrl}/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
    });

    if (!res.ok) throw new Error("Failed to update chapter");

    return await res.json();
}

export async function deleteChapter(id: string) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/chapters/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete chapter");

        return await res.json();
    } catch (error) {
        console.error("Error deleting chapter:", error);
        throw error;
    }
}
