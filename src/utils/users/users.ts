import { Permission } from "../permissions/permissions";
import { UserPermission } from "../permissions/userPermissions";
import type { Role } from "../permissions/roles";
import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string | null;
  createdAt?: string;
  isVerified?: boolean;
  lastLogin?: string;

  role: Role;

  permissions: Permission[];     
  allPermissions: Permission[]; 
  userPermissions?: UserPermission[];
};

// ✅ Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to apiFetch users');
    return await res.json();
  } catch (err) {
    console.error('Error apiFetching users:', err);
    return [];
  }
}

// ✅ Get single user
export async function getUserById(id: string): Promise<User> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user/${id}`);
    if (!res.ok) throw new Error('Failed to apiFetch user');
    return await res.json();
  } catch (err) {
    console.error('Error apiFetching user by ID:', err);
    throw err;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const user: User = await res.json();

    user.permissions = user.permissions ?? [];
    user.allPermissions = user.allPermissions ?? [];
    user.role = user.role ?? {
      id: "",
      name: "",
      label: "",
      createdAt: "",
      permissions: [],
    };
    user.role.permissions = user.role.permissions ?? [];

    return user;
  } catch (err) {
    console.error("Error apiFetching logged in user:", err);
    return null;
  }
}

// ✅ Create user from admin
export async function createUserFromAdmin(data: {
  name: string;
  email: string;
  password: string;
  mobile: string;
  roleId?: string | null;
}): Promise<User> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return await res.json();
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

// ✅ Update user
export async function updateUser(id: string, data: {
  name?: string;
  mobile?: string;
  profilePicture?: string;
  roleId?: string;
}): Promise<User> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

// ✅ Delete user
export async function deleteUser(id: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
}

// ✅ Assign role to user
export async function assignUserRole(id: string, roleId: string): Promise<User> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/user/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId }),
    });
    if (!res.ok) throw new Error('Failed to assign role');
    return await res.json();
  } catch (err) {
    console.error('Error assigning role:', err);
    throw err;
  }
}
