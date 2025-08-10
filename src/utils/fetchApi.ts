"use client";
import { showGlobalLoader, hideGlobalLoader } from "@/context/LoaderContext";

export async function apiFetch(url: string, options: RequestInit = {}) {
  showGlobalLoader();

  try {
    const token = localStorage.getItem("token"); // or however you store it

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // ✅ Add token here
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ API Error:", response.status, text);
      throw new Error("API Error");
    }

    return response;
  } finally {
    hideGlobalLoader();
  }
}
