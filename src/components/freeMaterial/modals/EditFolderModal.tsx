'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateFreeMaterialFolder } from '@/hooks/freeMaterial/useFreeMaterial';

interface Props {
    open: boolean;
    folderId: string;
    folderType: 'VIDEO' | 'DOCUMENT' | 'TEST';
    initialName: string;
    onClose: () => void;
}

const EditFolderModal: React.FC<Props> = ({ open, folderId, initialName, folderType, onClose }) => {
    const [name, setName] = useState(initialName);
    const { mutateAsync, isPending } = useUpdateFreeMaterialFolder();

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        await mutateAsync({ id: folderId, name, type: folderType });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Folder</DialogTitle>
                </DialogHeader>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
                <DialogFooter>
                    <Button variant="outline" className="flex items-center gap-2 w-50" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !name.trim()} variant="outline" className="bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50">
                        {isPending ? 'Saving...' : 'Update'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditFolderModal;
