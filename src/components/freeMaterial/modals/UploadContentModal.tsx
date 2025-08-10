'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCreateFreeMaterialContent } from '@/hooks/freeMaterial/useFreeMaterial';
import { FreeMaterialContentType } from '@/utils/freeMaterial/freeMaterial';
import { uploadFileToFirebase } from '@/utils/firebaseUpload';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  folderId: string;
  onClose: () => void;
  contentType?: FreeMaterialContentType;
};

const UploadContentModal: React.FC<Props> = ({ open, folderId, onClose, contentType }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<FreeMaterialContentType>('DOCUMENT');
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadable, setDownloadable] = useState(true);

  useEffect(() => {
    if (contentType) {
      setType(contentType);
    }
  }, [contentType]);

  const { mutateAsync, isPending } = useCreateFreeMaterialContent();

  const handleSubmit = async () => {
    try {
      let documentUrl: string | undefined;
      let videoId: string | undefined;

      if (type === 'DOCUMENT') {
        if (!file) return toast.error('Please select a file to upload.');
        const uploadResult = await uploadFileToFirebase(file, `free-material/documents`);
        console.log("🚀 Uploaded Firebase URL:", uploadResult);

        documentUrl = uploadResult; // ✅ if uploadResult is a string

        console.log("🚀 document Firebase URL:", documentUrl);
      }

      if (type === 'VIDEO') {
        if (!videoUrl) return toast.error('Please enter a video URL.');
        videoId = videoUrl; // treat as URL for now
      }

      await mutateAsync({
        folderId,
        title,
        type,
        documentUrl,
        videoId,
      });

      toast.success('Content uploaded!');
      onClose();
      setTitle('');
      setFile(null);
      setVideoUrl('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload content');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {!contentType && (
            <div>
              <Label>Content Type</Label>
              <select
                className="w-full border rounded px-2 py-1 mt-1"
                value={type}
                onChange={(e) => setType(e.target.value as FreeMaterialContentType)}
              >
                <option value="DOCUMENT">Document</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
          )}

          {type === 'DOCUMENT' && (
            <>
              <div>
                <Label>Select File</Label>
                <Input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

            </>
          )}

          {type === 'VIDEO' && (
            <div>
              <Label>Video URL (YouTube)</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadContentModal;
