import { apiFetch } from "../fetchApi";

export type UserPermission = {
  id: string;
  userId: string;
  permissionId: string;
  permission: {
    id: string;
    name: string;
    label: string;
  };
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";


export async function getUserPermissions(userId: string): Promise<{
  userPermissions: { id: string; name: string; label: string }[];
}> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user-permissions/${userId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error("Failed to apiFetch user permissions");
    return await res.json();
  } catch (err) {
    console.error("Error apiFetching user permissions:", err);
    return { userPermissions: [] };
  }
}

export async function assignPermissionToUser(userId: string, permissionId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user-permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, permissionId }),
    });

    if (!res.ok) throw new Error("Failed to assign permission to user");
    return await res.json();
  } catch (err) {
    console.error("Error assigning permission to user:", err);
    throw err;
  }
}

export async function removePermissionFromUser(userId: string, permissionId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user-permissions/${userId}/${permissionId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to remove permission from user");
    return await res.json();
  } catch (err) {
    console.error("Error removing permission from user:", err);
    throw err;
  }
}
