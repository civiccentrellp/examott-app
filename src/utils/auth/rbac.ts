import type { User } from '@/utils/users/users';


export function hasRole(user: User | null, role: string): boolean {
  return user?.role?.name === role;
}

export function hasAnyRole(user: User | null, roles: string[]): boolean {
  return roles.includes(user?.role?.name || '');
}


// Check if user has a specific permission via role or user override
export function hasPermission(user: User | null, permission: string): boolean {
  const rolePermissions = user?.role?.permissions?.map(p => p.name) || [];
  const userPermissions = user?.userPermissions?.map(p => p.permission.name) || [];
  const allPermissions = new Set([...rolePermissions, ...userPermissions]);
  return allPermissions.has(permission);
}

// Check if user has any of the listed permissions
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

// Check if user has all listed permissions
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}