import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export async function saveCourseContentProgress(courseId: string, payload: { contentId: string; isCompleted?: boolean }) {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to save progress");
    return json.data;
}

export async function getCourseContentProgress(courseId: string) {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/progress`, {
        headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch progress");
    return json.data;
}

export async function getCourseProgressSummary(courseId: string) {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/progress-summary`, {
        headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch progress summary");
    return json.data;
}

export async function saveLastOpenedContent(courseId: string, payload: { contentId: string; folderId?: string }) {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/last-opened`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to save last opened content");
    return json.data;
}

export async function getLastOpenedContent(courseId: string) {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/last-opened`, {
        headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch last opened content");
    return json.data;
}
