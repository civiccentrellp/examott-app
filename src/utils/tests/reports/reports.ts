import { apiFetch } from "../../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

export type ReportQuestionPayload = {
  attemptId: string;
  questionId: string;
  sectionId: string;
  reason: string;
};

export type Report = {
  id: string;
  status: ReportStatus;
  resolutionRemarks?: string | null;
  attempt?: {
    test?: {
      id: string;
      name: string;
    };
  };
  [key: string]: any;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export async function reportQuestion(data: ReportQuestionPayload) {
  const res = await apiFetch(`${apiBaseUrl}/api/reports`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("❌ Failed to report question");
  return res.json();
}

export async function getAllReportedQuestions() {
  const res = await apiFetch(`${apiBaseUrl}/api/reports`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("❌ Failed to fetch reported questions");
  return res.json();
}

export async function resolveReportedQuestion(reportId: string, resolutionRemarks: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/reports/${reportId}/resolve`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ resolutionRemarks }),
  });
  if (!res.ok) throw new Error("❌ Failed to resolve reported question");
  return res.json();
}

export async function dismissReportedQuestion(reportId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/reports/${reportId}/dismiss`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("❌ Failed to dismiss report");
  return res.json();
}

export async function getAllResolvedReports() {
  const res = await apiFetch(`${apiBaseUrl}/api/reports/resolved`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("❌ Failed to fetch resolved reports");
  return res.json();
}

export async function getReportsByUser() {
  const res = await apiFetch(`${apiBaseUrl}/api/reports/user`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("❌ Failed to fetch user reports");
  return res.json();
}

export async function getResolvedReportsByUser() {
  const res = await apiFetch(`${apiBaseUrl}/api/reports/user/resolved`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("❌ Failed to fetch resolved user reports");
  return res.json();
}
