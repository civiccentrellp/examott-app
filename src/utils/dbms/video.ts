import { apiFetch } from "../fetchApi";

export type Video = {
    id: string;
    title: string;
    url: string;
    folderId: string
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getVideosByFolder(folderId: string): Promise<Video[]> {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/videos/folder/${folderId}`, {
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to apiFetch videos");

        const result = await res.json();
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Error in getVideosByFolder:", error);
        return [];
    }
}

export async function getVideos(subjectId: string): Promise<Video[]> {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/videos`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to apiFetch videos");

        const result = await res.json();
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Error in getVideos:", error);
        return [];
    }
}

export async function addVideo(data: { title: string; url: string; folderId: string }) {
    try {
      const res = await apiFetch(`${apiBaseUrl}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (!res.ok) throw new Error("Failed to add video");
      return await res.json();
    } catch (error) {
      console.error("Error adding video:", error);
      throw error;
    }
  }

  export async function updateVideo(id: string, updates: Partial<Video>) {
    const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));

    const res = await apiFetch(`${apiBaseUrl}/api/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
    });

    if (!res.ok) throw new Error("Failed to update video");

    return await res.json();
}

export async function deleteVideo(id: string) {
    try {
        const res = await apiFetch(`${apiBaseUrl}/api/videos/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete video");

        return await res.json();
    } catch (error) {
        console.error("Error deleting video:", error);
        throw error;
    }
}

