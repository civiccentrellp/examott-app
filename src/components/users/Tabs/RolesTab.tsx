'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2 } from 'lucide-react';
import {
  Role,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
} from '@/utils/permissions/roles';
import {
  getAllPermissions,
  Permission,
} from '@/utils/permissions/permissions';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';

const RolesTab = () => {
  const { user } = useUser();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    permissionIds: [] as string[],
  });
  const [editMode, setEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    const data = await getAllRoles();
    setRoles(data);
    const map: Record<string, string[]> = {};
    for (const role of data) {
      const perms = await getRolePermissions(role.id);
      map[role.id] = perms.map((p) => p.permission.label);
    }
    setRolePermissionsMap(map);
  };

  const fetchPermissions = async () => {
    const perms = await getAllPermissions();
    setPermissions(perms);
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.label) return;
    if (editMode && editingRoleId) {
      await updateRole(editingRoleId, formData);
    } else {
      await createRole(formData);
    }
    setFormData({ name: '', label: '', permissionIds: [] });
    setEditMode(false);
    setEditingRoleId(null);
    setOpenModal(false);
    fetchRoles();
  };

  const handleEdit = async (role: Role) => {
    const rolePerms = await getRolePermissions(role.id);
    const permissionIds = rolePerms.map((rp) => rp.permission.id);
    setEditMode(true);
    setEditingRoleId(role.id);
    setFormData({ name: role.name, label: role.label, permissionIds });
    setOpenModal(true);
  };

  const handleDelete = async (roleId: string) => {
    const confirmed = confirm('Are you sure you want to delete this role?');
    if (!confirmed) return;
    await deleteRole(roleId);
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissionIds.includes(permId);
      const updated = exists
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId];
      return { ...prev, permissionIds: updated };
    });
  };

  return (
    <div className="space-y-4 mt-4 text-gray-800">
      <div className="flex justify-between items-center gap-4">
        <Input
          type="text"
          placeholder="Search by role name or label"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <VisibilityCheck user={user} check="role.create" checkType="permission">
          <Button
            variant="outline"
            className="bg-violet-400 text-white rounded-lg hover:bg-violet-500 border-1 border-violet-500 shadow"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: '', label: '', permissionIds: [] });
              setOpenModal(true);
            }}
          >
            Create Role
          </Button>
        </VisibilityCheck>
      </div>

      <div className="w-full h-full border bg-white rounded-lg shadow-sm relative overflow-x-auto ">
        <table className="w-full text-sm table-auto">
          <thead className="bg-violet-300 bg-opacity-50 text-gray-600">
            <tr>
              <th className="p-3 text-center whitespace-nowrap">Role Label</th>
              <th className="p-3 text-center whitespace-nowrap">Role Name</th>
              <th className="p-3 text-center whitespace-nowrap">Permissions</th>
              <th className="p-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRoles.map((role) => (
              <tr key={role.id}>
                <td className="p-2 text-center whitespace-nowrap">{role.label}</td>
                <td className="p-2 text-center whitespace-nowrap">{role.name}</td>
                <td className="p-2 text-center max-w-xs whitespace-nowrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate text-gray-700 text-sm font-medium max-w-[200px] mx-auto cursor-default">
                          {rolePermissionsMap[role.id]?.join(', ') || '—'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="z-50 bg-indigo-50/70 backdrop-blur-md border border-gray-300 shadow-2xl ring-1 ring-indigo-200 rounded px-3 py-2 ring-1 ring-indigo-200/50 w-56 h-auto overflow-y-auto text-start max-w-xs space-y-1">
                        {rolePermissionsMap[role.id]?.map((perm, idx) => (
                          <div key={idx} className="whitespace-normal text-dark text-xs">• {perm}</div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>

                <td className="p-2 text-center space-x-2 whitespace-nowrap">
                  <IconButtonWithTooltip
                    label="Edit"
                    icon={<Pencil size={18} />}
                    onClick={() => handleEdit(role)}
                    className="text-gray-700"
                  />
                  <IconButtonWithTooltip
                    label="Delete"
                    icon={<Trash2 size={18} color="red" />}
                    onClick={() => handleDelete(role.id)}
                    className="text-gray-700"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openModal && (
        <Dialog open onOpenChange={() => setOpenModal(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Role' : 'Create Role'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Role Name (e.g. admin)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Role Label (e.g. Admin)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />

              <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                <p className="font-semibold mb-2 text-gray-600">Assign Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm py-1">
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      <span>{perm.label} </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleCreateOrUpdate}>
                {editMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RolesTab;
