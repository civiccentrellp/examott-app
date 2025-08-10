'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateFreeMaterialContent } from '@/hooks/freeMaterial/useFreeMaterial';
import { toast } from 'sonner';
import { getAllVideoFolders } from '@/utils/dbms/videoFolder';
import { getAllTests } from '@/utils/tests/test';
import { getVideosByFolder } from '@/utils/dbms/video';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  open: boolean;
  folderId: string;
  onClose: () => void;
}

const ImportContentModal: React.FC<Props> = ({ open, folderId, onClose }) => {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'VIDEO' | 'TEST'>('VIDEO');
  const [items, setItems] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { mutateAsync } = useCreateFreeMaterialContent();

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        if (type === 'VIDEO') {
          const folders = await getAllVideoFolders();
          const allVideos = await Promise.all(
            folders.map((f: any) => getVideosByFolder(f.id))
          );
          const flatVideos = allVideos.flat();
          setItems(flatVideos);
        } else if (type === 'TEST') {
          const tests = await getAllTests();
          setItems(tests);
        }
      } catch (err) {
        toast.error('Failed to fetch import items');
      }
      setIsLoading(false);
    };

    if (open) fetchItems();
  }, [type, open]);

  const handleImport = async () => {
    if (!selectedId) return toast.error('Select an item to import');

    const selected = items.find((item) => item.id === selectedId);
    if (!selected) return toast.error('Invalid selection');

    try {
      await mutateAsync({
        folderId,
        title: selected.title || selected.name,
        type,
        videoId: type === 'VIDEO' ? selected.url : undefined,
        testId: type === 'TEST' ? selected.id : undefined,
      });

      toast.success(`${type} imported!`);
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
      onClose();
    } catch (err) {
      toast.error('Import failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'VIDEO' | 'TEST')}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="TEST">Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select {type}</Label>
            <Select value={selectedId} onValueChange={(v) => setSelectedId(v)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${type.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title || item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isLoading || !selectedId}>
              Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContentModal;
