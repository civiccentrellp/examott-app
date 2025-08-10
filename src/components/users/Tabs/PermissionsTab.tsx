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
import { Pencil, Trash2 } from 'lucide-react';
import {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from '@/utils/permissions/permissions';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';

type Permission = {
  id: string;
  name: string;
  label: string;
  createdAt?: string;
};

const PermissionsTab = () => {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', label: '' });
  const [editMode, setEditMode] = useState(false);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const data = await getAllPermissions();
    setPermissions(data);
  };

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name.toLowerCase().includes(search.toLowerCase()) ||
      perm.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.label) return;
    if (editMode && editingPermissionId) {
      const updated = await updatePermission(editingPermissionId, formData);
      setPermissions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const newPermission = await createPermission(formData);
      setPermissions((prev) => [newPermission, ...prev]);
    }
    setFormData({ name: '', label: '' });
    setEditMode(false);
    setEditingPermissionId(null);
    setOpenModal(false);
  };

  const handleEdit = (perm: Permission) => {
    setEditMode(true);
    setEditingPermissionId(perm.id);
    setFormData({ name: perm.name, label: perm.label });
    setOpenModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this permission?');
    if (!confirmed) return;
    await deletePermission(id);
    setPermissions((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4 h-full mt-4 text-gray-800 pb-24">
      <div className="flex justify-between items-center gap-4">
        <Input
          type="text"
          placeholder="Search by name or label"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <VisibilityCheck user={user} check="permission.create" checkType="permission">
          <Button
            variant="outline"
            className="bg-violet-400 text-white rounded-lg hover:bg-violet-500 border-1 border-violet-500 shadow"
            onClick={() => {
              setEditMode(false);
              setFormData({ name: '', label: '' });
              setOpenModal(true);
            }}
          >
            Create Permission
          </Button>
        </VisibilityCheck>
      </div>

      <div className="w-full h-99 border bg-white rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm table-auto overflow-x-auto">
          <thead className="bg-violet-300 bg-opacity-50 text-gray-600">
            <tr>
              <th className="p-3 text-center whitespace-nowrap">Permission Label</th>
              <th className="p-3 text-center whitespace-nowrap">Permission Name</th>
              <th className="p-3 text-center whitespace-nowrap">Access This Permission Gives</th>
              <th className="p-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 overflow-y-auto">
            {filteredPermissions.map((perm) => (
              <tr key={perm.id}>
                <td className="p-2 text-center whitespace-nowrap">{perm.label}</td>
                <td className="p-2 text-center whitespace-nowrap">{perm.name}</td>
                <td className="p-2 text-center italic text-gray-500 whitespace-nowrap">
                  {perm.name.includes('.') ? perm.name.split('.')[1].replace('_', ' ') : '—'}
                </td>
                <td className="p-2 text-center space-x-2 whitespace-nowrap">
                  <IconButtonWithTooltip
                    label="Edit"
                    icon={<Pencil size={18} />}
                    onClick={() => handleEdit(perm)}
                    className="text-gray-700"
                  />
                  <IconButtonWithTooltip
                    label="Delete"
                    icon={<Trash2 size={18} color="red" />}
                    onClick={() => handleDelete(perm.id)}
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
              <DialogTitle>{editMode ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Permission Name (e.g. course.create)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="Permission Label (e.g. Create Course)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
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

export default PermissionsTab;
