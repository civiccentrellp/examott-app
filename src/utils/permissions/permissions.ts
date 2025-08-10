import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type Permission = {
  id: string;
  name: string;
  label: string;
  createdAt: string;
};

export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/permissions`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to apiFetch permissions");
    return await res.json();
  } catch (err) {
    console.error("Error apiFetching permissions:", err);
    return [];
  }
}

export async function createPermission(data: { name: string; label: string }): Promise<Permission> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create permission");
    return await res.json();
  } catch (err) {
    console.error("Error creating permission:", err);
    throw err;
  }
}

export async function updatePermission(id: string, data: { name: string; label: string }): Promise<Permission> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/permissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update permission");
    return await res.json();
  } catch (err) {
    console.error("Error updating permission:", err);
    throw err;
  }
}

export async function deletePermission(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/permissions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete permission");
  return await res.json();
}
