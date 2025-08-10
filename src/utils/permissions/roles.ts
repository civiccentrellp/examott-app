import { apiFetch } from "../fetchApi";

export type Role = {
  id: string;
  name: string;
  label: string;
  createdAt: string;
  permissions: {
    id: string;
    name: string;
    label: string;
  }[];
};

export type RolePermission = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: {
    id: string;
    name: string;
    label: string;
  };
};
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function getAllRoles(): Promise<Role[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/roles`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to apiFetch roles");
    return await res.json();
  } catch (err) {
    console.error("Error apiFetching roles:", err);
    return [];
  }
}

export async function createRole(data: { name: string; label: string }): Promise<Role> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create role");
    return await res.json();
  } catch (err) {
    console.error("Error creating role:", err);
    throw err;
  }
}

export async function getRolePermissions(roleId: string): Promise<RolePermission[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/role-permissions/${roleId}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error("Failed to apiFetch role permissions");
    return await res.json();
  } catch (err) {
    console.error("Error getting role permissions:", err);
    return [];
  }
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/role-permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionId }),
    });

    if (!res.ok) throw new Error("Failed to assign permission to role");
    return await res.json();
  } catch (err) {
    console.error("Error assigning permission to role:", err);
    throw err;
  }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/role-permissions/${roleId}/${permissionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove permission from role");
    return await res.json();
  } catch (err) {
    console.error("Error removing permission from role:", err);
    throw err;
  }
}

export async function updateRole(id: string, data: { name: string; label: string }): Promise<Role> {
  const res = await apiFetch(`${apiBaseUrl}/api/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update role");
  return await res.json();
}

export async function deleteRole(id: string): Promise<void> {
  const res = await apiFetch(`${apiBaseUrl}/api/roles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete role");
}

