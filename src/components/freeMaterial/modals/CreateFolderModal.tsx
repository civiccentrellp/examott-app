'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateFreeMaterialFolder } from '@/hooks/freeMaterial/useFreeMaterial';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentId?: string; 
  type: 'VIDEO' | 'DOCUMENT' | 'TEST';
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ open, onClose, parentId, type }) => {
  const [name, setName] = useState('');
  const { mutateAsync, isPending } = useCreateFreeMaterialFolder();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await mutateAsync({ name, parentId, type });
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
