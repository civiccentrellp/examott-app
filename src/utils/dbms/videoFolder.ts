// utils/dbms/videoFolder.ts
import { apiFetch } from "../fetchApi";

export type VideoFolder = {
    id: string;
    name: string;
    courseId: string;
    createdAt: string;
  };
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

  export async function getAllVideoFolders(): Promise<VideoFolder[]> {
    try {
      const res = await apiFetch(`${apiBaseUrl}/api/video-folders`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to apiFetch all video folders')
  
      const result = await res.json()
      return Array.isArray(result.data) ? result.data : []
    } catch (error) {
      console.error("Error in getAllVideoFolders:", error)
      return []
    }
  }
  
  export async function getVideoFolders(courseId: string): Promise<VideoFolder[]> {
    try {
      const res = await apiFetch(`${apiBaseUrl}/api/video-folders?courseId=${courseId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to apiFetch video folders');
  
      const result = await res.json();
      return Array.isArray(result.data) ? result.data : []; // ✅ consistent
    } catch (error) {
      console.error("Error in getVideoFolders:", error);
      return [];
    }
  }
  
  
  export async function addVideoFolder(data: {
    name: string
    courseId: string
    videoTitle: string
    videoUrl: string
    tags?: string[]
  }) {
    try {
      const res = await apiFetch(`${apiBaseUrl}/api/video-folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      if (!res.ok) throw new Error('Failed to create video folder');
  
      return await res.json();
    } catch (error) {
      console.error("Error creating video folder:", error);
      throw error;
    }
  }
  
  export async function updateVideoFolder(id: string, updates: Partial<VideoFolder>) {
    const cleaned = Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v ?? null]));
  
    const res = await apiFetch(`${apiBaseUrl}/api/video-folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned),
    });
  
    if (!res.ok) throw new Error('Failed to update video folder');
  
    return await res.json();
  }
  
  export async function deleteVideoFolder(id: string) {
    try {
      const res = await apiFetch(`${apiBaseUrl}/api/video-folders/${id}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) throw new Error('Failed to delete video folder');
  
      return await res.json();
    } catch (error) {
      console.error("Error deleting video folder:", error);
      throw error;
    }
  }