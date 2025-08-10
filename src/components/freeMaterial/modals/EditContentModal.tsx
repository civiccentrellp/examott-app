'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FreeMaterialContent } from '@/utils/freeMaterial/freeMaterial';
import { useUpdateFreeMaterialContent } from '@/hooks/freeMaterial/useFreeMaterial';
import { uploadFileToFirebase } from '@/utils/firebaseUpload'; // <-- Your Firebase uploader
import PDFViewer from '@/components/ui/PDFViewer';

interface Props {
  open: boolean;
  content: FreeMaterialContent;
  onClose: () => void;
}

const EditContentModal: React.FC<Props> = ({ open, content, onClose }) => {
  const [title, setTitle] = useState(content.title);
  const [videoId, setVideoId] = useState(content.videoId || '');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(content.documentUrl || '');

  const { mutateAsync, isPending } = useUpdateFreeMaterialContent();


  useEffect(() => {
    setTitle(content.title);
    setVideoId(content.videoId || '');
    setFile(null);
  }, [content]);

  useEffect(() => {
    if (!open) setPreviewUrl('');
  }, [open]);


  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsUploading(true);

    let documentUrl = content.documentUrl;

    if (content.type === 'DOCUMENT' && file) {
      documentUrl = await uploadFileToFirebase(file, `free-materials/${file.name}`);
    }

    await mutateAsync({
      id: content.id,
      title,
      type: content.type,
      videoId: content.type === 'VIDEO' ? videoId : undefined,
      documentUrl: content.type === 'DOCUMENT' ? documentUrl : undefined,
    });

    setIsUploading(false);
    onClose();
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:\/|v=|be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
  };


  const isSubmitDisabled = isPending || isUploading || !title.trim() || (content.type === 'VIDEO' && !videoId.trim());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>EDIT CONTENT</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} />
        </div>

        {content.type === 'DOCUMENT' && (
          <div className="flex items-center justify-between gap-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg"
              onChange={(e) => {
                const newFile = e.target.files?.[0] || null;
                setFile(newFile);
                if (newFile) {
                  const url = URL.createObjectURL(newFile);
                  setPreviewUrl(url);
                }
              }}
              className="w-full text-sm  h-auto text-center text-gray-700 p-1.5  file:border-0 file:rounded file:px-3 file:py-1 file:bg-blue-50 file:text-blue-700 cursor-pointer focus:outline-none focus:ring-0 focus:shadow-none"
            />

            {previewUrl && file ? (
              file.type === 'application/pdf' ? (
                <div className="w-20 h-20 border rounded object-cover ">
                  <PDFViewer url={previewUrl} preview  />
                </div>
              ) : (
                <img src={previewUrl} alt="Image Preview" className="w-10 h-10 object-cover" />
              )
            ) : (
              content.documentUrl && (
                content.documentUrl.includes('.pdf') ? (
                  <div className="w-20 h-20 border rounded object-cover ">
                    <PDFViewer url={content.documentUrl} preview  />
                  </div>
                ) : (
                  <img src={content.documentUrl} alt="Image Preview" className="w-10 h-10 object-cover rounded" />
                )
              )
            )}


          </div>
        )}

        {content.type === 'VIDEO' && (
          <>
            <div className="flex items-center gap-2">
              <Input
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                className="bg-gray-100 border-none px-3 py-2"
              />
              {videoId && (
                <div className="w-20 h-10 border rounded overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(videoId)}/default.jpg`}
                    alt="Video Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

            </div>
          </>
        )}


        {content.type === 'TEST' && (
          <div className="text-sm text-gray-500 italic">
            Test content can only be changed from the DBMS or test manager.
          </div>
        )}

        <DialogFooter>
          <Button  variant="outline" className="flex items-center gap-2 w-50" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled} variant="outline" className="bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50">
            {isUploading ? 'Uploading...' : isPending ? 'Saving...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentModal;
