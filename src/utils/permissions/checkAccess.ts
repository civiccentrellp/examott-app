export type PermissionCheckUser = {
  id: string;
  permissions?: { name: string }[];
  role?: {
    id: string;
    name: string;
    permissions?: { name: string }[];
  };
};

type PermissionCheckType = string | string[];

type PermissionMode = "AND" | "OR";

export function hasPermission(
  user: PermissionCheckUser | null | undefined,
  required: PermissionCheckType,
  mode: PermissionMode = "OR"
): boolean {
  if (!user) return false;

  const userPermissions = user.permissions?.map(p => p.name) || [];
  const rolePermissions = user.role?.permissions?.map(p => p.name) || [];
  const combinedPermissions = new Set([...userPermissions, ...rolePermissions]);

  const requiredPermissions = Array.isArray(required) ? required : [required];

  if (mode === "AND") {
    return requiredPermissions.every(perm => combinedPermissions.has(perm));
  } else {
    return requiredPermissions.some(perm => combinedPermissions.has(perm));
  }
}
