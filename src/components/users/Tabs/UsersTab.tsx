'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2 } from 'lucide-react';
import {
    getAllUsers,
    createUserFromAdmin,
    updateUser,
    deleteUser,
    getUserById,
    User
} from '@/utils/users/users';
import type { Role } from '@/utils/permissions/roles';
import { getAllRoles, getRolePermissions } from '@/utils/permissions/roles';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';
import { assignPermissionToUser, getUserPermissions, removePermissionFromUser } from '@/utils/permissions/userPermissions';
import { getAllPermissions, Permission } from '@/utils/permissions/permissions';

const UsersTab = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [openModal, setOpenModal] = useState<'create' | 'update' | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userPermissionsMap, setUserPermissionsMap] = useState<Record<string, { id: string; name: string; label: string; }[]>>({});
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [userPermissionIds, setUserPermissionIds] = useState<string[]>([]);
    const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        roleId: ''
    });

    useEffect(() => {
        const loadData = async () => {
            const [users, roles, allPerms] = await Promise.all([
                getAllUsers(),
                getAllRoles(),
                getAllPermissions()
            ]);

            setUsers(users);
            setFilteredUsers(users);
            setRoles(roles);
            setAllPermissions(allPerms);

            const permissionsMap: Record<string, { id: string; name: string; label: string; }[]> = {};

            for (const user of users) {
                const [userPermsData, rolePerms] = await Promise.all([
                    getUserPermissions(user.id),
                    // user.roleId ? getRolePermissions(user.roleId) : Promise.resolve([])
                    user.role?.id ? getRolePermissions(user.role.id) : Promise.resolve([])
                ]);

                const combined = [
                    ...rolePerms.map(p => p.permission),
                    ...userPermsData.userPermissions
                ];

                // Remove duplicates by permission ID
                const uniqueMap = new Map();
                combined.forEach(p => uniqueMap.set(p.id, p));
                permissionsMap[user.id] = Array.from(uniqueMap.values());
            }

            setUserPermissionsMap(permissionsMap);
        };

        loadData();
    }, []);


    useEffect(() => {
        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.mobile?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [search, users]);

    const openCreateModal = () => {
        setFormData({ name: '', email: '', password: '', mobile: '', roleId: '' });
        setUserPermissionIds([]);
        setOpenModal('create');
    };

    const toggleUserPermission = (permId: string) => {
        setUserPermissionIds((prev) =>
            prev.includes(permId)
                ? prev.filter((id) => id !== permId)
                : [...prev, permId]
        );
    };

    // const openEditModal = async (user: User) => {
    //     const [userData, { userPermissions }] = await Promise.all([
    //         getUserById(user.id),
    //         getUserPermissions(user.id)
    //     ]);

    //     setUserPermissionIds(userPermissions.map((p: { id: string }) => p.id));
    //     setEditingUser(userData);
    //     setFormData({
    //         name: userData.name,
    //         email: userData.email,
    //         password: '',
    //         mobile: userData.mobile,
    //         roleId: userData.roleId || ''
    //     });
    //     setOpenModal('update');
    // };

    const openEditModal = async (user: User) => {
        const [userData, { userPermissions }, rolePermissions] = await Promise.all([
            getUserById(user.id),
            getUserPermissions(user.id),
            user.role?.id ? getRolePermissions(user.role.id) : Promise.resolve([])
        ]);

        setUserPermissionIds(userPermissions.map((p: { id: string }) => p.id));
        rolePermissions.map((p: any) => p.permission.id)

        // ✅ Declare and assign the variables properly
        const extractedUserPermIds = userPermissions.map((p: { id: string }) => p.id);
        const extractedRolePermIds = rolePermissions.map((p: any) => p.permission.id);

        // ✅ Set them in state
        setUserPermissionIds(extractedUserPermIds);
        setRolePermissionIds(extractedRolePermIds);

        setEditingUser(userData);
        setFormData({
            name: userData.name,
            email: userData.email,
            password: '',
            mobile: userData.mobile,
            // roleId: userData.roleId || ''
            roleId: userData.role?.id || ''
        });

        setOpenModal('update');
    };


    const handleSave = async () => {
        if (openModal === 'create') {
            const created = await createUserFromAdmin(formData);
            for (const pid of userPermissionIds) {
                await assignPermissionToUser(created.id, pid);
            }
        } else if (editingUser) {
            await updateUser(editingUser.id, {
                name: formData.name,
                mobile: formData.mobile,
                roleId: formData.roleId,
            });

            const currentPermissions = await getUserPermissions(editingUser.id);
            const currentIds = currentPermissions.userPermissions.map(p => p.id);

            const toAdd = userPermissionIds.filter(id => !currentIds.includes(id));
            const toRemove = currentIds.filter(id => !userPermissionIds.includes(id));

            await Promise.all([
                ...toAdd.map(pid => assignPermissionToUser(editingUser.id, pid)),
                ...toRemove.map(pid => removePermissionFromUser(editingUser.id, pid))
            ]);
        }

        const updated = await getAllUsers();
        setUsers(updated);
        setFilteredUsers(updated);
        setOpenModal(null);
        setEditingUser(null);
    };

    const handleDelete = async (user: User) => {
        await deleteUser(user.id);
        const updated = await getAllUsers();
        setUsers(updated);
        setFilteredUsers(updated);
    };

    return (
        <div className="space-y-4 mt-4 text-gray-800">
            <div className="flex justify-between items-center gap-4">
                <Input
                    type="text"
                    placeholder="Search by name, email or mobile"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                />
                <Button variant="outline" className="bg-violet-400 text-white rounded-lg hover:bg-violet-500 border-1 border-violet-500 shadow" onClick={openCreateModal}>
                    Create User
                </Button>
            </div>

            <div className=" w-full border bg-white rounded-lg shadow-sm relative overflow-x-auto">
                <table className="w-full text-sm table-auto">
                    <thead className="bg-violet-300 bg-opacity-50 text-gray-600">
                        <tr>
                            <th className="p-3 text-center whitespace-nowrap">Name</th>
                            <th className="p-3 text-center whitespace-nowrap">Mobile</th>
                            <th className="p-3 text-center whitespace-nowrap">Email</th>
                            <th className="p-3 text-center whitespace-nowrap">Role</th>
                            <th className="p-3 text-center whitespace-nowrap">Permissions</th>
                            <th className="p-3 text-center whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="">
                                <td className="p-1 text-center whitespace-nowrap">{user.name}</td>
                                <td className="p-1 text-center whitespace-nowrap">{user.mobile}</td>
                                <td className="p-1 text-center whitespace-nowrap">{user.email}</td>
                                <td className="p-1 text-center whitespace-nowrap">{user.role?.label || '—'}</td>
                                <td className="p-2 text-center max-w-xs whitespace-nowrap">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="truncate text-gray-700 text-sm font-medium max-w-[200px] mx-auto cursor-default">
                                                    {userPermissionsMap[user.id]?.map(p => p.label).join(', ') || '—'}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="z-50 bg-indigo-50/70 backdrop-blur-md border border-gray-300 shadow-2xl ring-1 ring-indigo-200 rounded px-3 py-2 ring-1 ring-indigo-200/50 w-56 h-auto overflow-y-auto text-start max-w-xs space-y-1">
                                                {userPermissionsMap[user.id]?.map((perm, idx) => (
                                                    <div key={idx} className="whitespace-normal text-dark text-xs">• {perm.label}</div>
                                                ))}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </td>
                                <td className="p-1 text-center space-x-4 whitespace-nowrap">
                                    <IconButtonWithTooltip
                                        label="Edit"
                                        icon={<Pencil size={20} />}
                                        onClick={() => openEditModal(user)}
                                        className='text-dark'
                                    />
                                    {/* <IconButtonWithTooltip
                                        label="Delete"
                                        icon={<Trash2 size={20} color='red' />}
                                        onClick={() => handleDelete(user)}
                                        className='text-dark'
                                    /> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {openModal && (
                <Dialog open onOpenChange={() => {
                    setOpenModal(null);
                    setEditingUser(null);
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{openModal === 'create' ? 'Create User' : 'Update User'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            {openModal === 'create' && (
                                <Input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            )}
                            <Input placeholder="Mobile" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.label}</option>
                                ))}
                            </select>
                            <div className="space-y-2">
                                <div className="font-medium text-sm">Permissions</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {allPermissions.map(p => (
                                        <label key={p.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={userPermissionIds.includes(p.id) || rolePermissionIds.includes(p.id)}
                                                disabled={rolePermissionIds.includes(p.id)}
                                                onChange={() => toggleUserPermission(p.id)}
                                            />

                                            <span className="text-sm">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleSave}>Save</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default UsersTab;
