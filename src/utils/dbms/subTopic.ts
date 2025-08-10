import { apiFetch } from "../fetchApi";

export type SubTopic = {
    id: string;
    name: string;
    topicId: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getSubTopics(topicId: string): Promise<SubTopic[]> {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/subTopics?topicId=${topicId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch subtopics");

        const result = await res.json();
        return Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Error in getSubTopics:", error);
        return [];
    }
}

export async function addSubTopic(data: { name: string; topicId: string }) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/subTopics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to add subtopic");

        return await res.json();
    } catch (error) {
        console.error("Error adding subtopic:", error);
        throw error;
    }
}

export async function updateSubTopic(id: string, updates: Partial<SubTopic>) {
    const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));

    const res = await apiFetch(`${apiBaseUrl}/api/subTopic/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
    });

    if (!res.ok) throw new Error("Failed to update subtopic");

    return await res.json();
}

export async function deleteSubTopic(id: string) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/subTopic/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete subtopic");

        return await res.json();
    } catch (error) {
        console.error("Error deleting subtopic:", error);
        throw error;
    }
}
