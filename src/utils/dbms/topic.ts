import { apiFetch } from "../fetchApi";

export type Topic = {
    id: string;
    name: string;
    chapterId: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";


export async function getTopics(chapterId: string): Promise<Topic[]> {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/topics?chapterId=${chapterId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch topics");
        const result = await res.json();
        // Handle raw array response directly
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error in getTopics:", error);
        return [];
    }
}

export async function addTopic(data: { name: string; chapterId: string }) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/topics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to add topic");

        return await res.json();
    } catch (error) {
        console.error("Error adding topic:", error);
        throw error;
    }
}

export async function updateTopic(id: string, updates: Partial<Topic>) {
    const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));

    const res = await apiFetch(`${apiBaseUrl}/api/topic/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
    });

    if (!res.ok) throw new Error("Failed to update topic");

    return await res.json();
}

export async function deleteTopic(id: string) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/topic/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete topic");

        return await res.json();
    } catch (error) {
        console.error("Error deleting topic:", error);
        throw error;
    }
}
