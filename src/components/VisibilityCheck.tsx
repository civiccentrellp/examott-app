import React, { useEffect, useState } from "react";
import type { User } from "@/utils/users/users";
import { getUserPermissions } from "@/utils/permissions/userPermissions";
import { getRolePermissions } from "@/utils/permissions/roles";

type VisibilityCheckProps = {
  user: User | null;
  check: string | string[]; // role or permission(s)
  checkType: "role" | "permission" | "any-permission" | "all-permission";
  children: React.ReactNode;
  invert?: boolean;
};

type PermissionCheckUser = {
  id: string;
  permissions: string[];
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
};

const toPermissionCheckUser = (
  user: User | null,
  userPerms: { name: string }[],
  rolePerms: { name: string }[]
): PermissionCheckUser | null => {
  if (!user) return null;
  return {
    id: user.id,
    permissions: userPerms.map(p => p.name),
    role: user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          permissions: rolePerms.map(p => p.name),
        }
      : undefined,
  };
};

const hasRole = (user: PermissionCheckUser | null, roles: string | string[]) => {
  if (!user?.role?.name) return false;
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(user.role.name);
};

const hasPermission = (
  user: PermissionCheckUser | null,
  required: string[],
  mode: "any" | "all"
) => {
  if (!user) return false;
  const allPerms = new Set([...(user.permissions || []), ...(user.role?.permissions || [])]);
  return mode === "all"
    ? required.every(perm => allPerms.has(perm))
    : required.some(perm => allPerms.has(perm));
};

const VisibilityCheck: React.FC<VisibilityCheckProps> = ({
  user,
  check,
  checkType,
  invert = false,
  children,
}) => {
  const [permissionCheckUser, setPermissionCheckUser] = useState<PermissionCheckUser | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const [{ userPermissions }, rolePerms = []] = await Promise.all([
        getUserPermissions(user.id),
        user.role?.id ? getRolePermissions(user.role.id) : [],
      ]);

      const transformed = toPermissionCheckUser(user, userPermissions, rolePerms.map(r => r.permission));
      setPermissionCheckUser(transformed);
    };

    if (["permission", "any-permission", "all-permission"].includes(checkType)) {
      load();
    } else {
      setPermissionCheckUser(toPermissionCheckUser(user, [], [])); // role only
    }
  }, [user, checkType]);

  if (!permissionCheckUser) return null;

  const requiredList = Array.isArray(check) ? check : [check];
  let visible = false;

  if (checkType === "role") {
    visible = hasRole(permissionCheckUser, requiredList);
  } else if (checkType === "permission") {
    visible = hasPermission(permissionCheckUser, requiredList, "any");
  } else if (checkType === "any-permission") {
    visible = hasPermission(permissionCheckUser, requiredList, "any");
  } else if (checkType === "all-permission") {
    visible = hasPermission(permissionCheckUser, requiredList, "all");
  }

  if (invert ? visible : !visible) return null;
  return <>{children}</>;
};

export default VisibilityCheck;
