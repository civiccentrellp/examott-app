'use client';
import React, { useState } from 'react';
import { useDeleteFreeMaterialContent, useDeleteFreeMaterialFolder, useFreeMaterialFolders } from '@/hooks/freeMaterial/useFreeMaterial';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import FolderCard from '../FolderCard';
import CreateFolderModal from '../modals/CreateFolderModal';
import UploadContentModal from '../modals/UploadContentModal';
import { FreeMaterialContent, FreeMaterialFolder } from '@/utils/freeMaterial/freeMaterial';
import EditFolderModal from '../modals/EditFolderModal';
import EditContentModal from '../modals/EditContentModal';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';

const FreeDocumentsPanel = () => {
  const { user } = useUser();
  const { data: folders = [], isLoading } = useFreeMaterialFolders('DOCUMENT');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null);
  const [editFolder, setEditFolder] = useState<{ id: string; name: string } | null>(null);
  const [editContent, setEditContent] = useState<FreeMaterialContent | null>(null);
  const { mutateAsync: deleteFolder } = useDeleteFreeMaterialFolder();
  const { mutateAsync: deleteContent } = useDeleteFreeMaterialContent();



  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <VisibilityCheck user={user} check="content.create" checkType="permission">

          <Button
            variant="outline"
            className="w-full lg:w-auto bg-violet-200 border-1 border-violet-500 rounded-xl shadow flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}>
            Create Folder
          </Button>
        </VisibilityCheck>
      </div>

      {isLoading ? (
        <p>Loading folders...</p>
      ) : folders?.length === 0 ? (
        <p className="text-muted-foreground">No folders found.</p>
      ) : (
        <div className="space-y-3">
          {folders.map((folder: FreeMaterialFolder) => (
            <FolderCard
              key={folder.id}
              folder={{
                id: folder.id,
                name: folder.name,
                contents: folder.contents ?? [], // 🔥 Fix: provide default empty array
              }}
              onUploadContent={(id) => setUploadTargetFolderId(id)}
              onEditFolder={(id, name) => setEditFolder({ id, name })}
              onDeleteFolder={(id) => deleteFolder(id)}
              onEditContent={(content) => setEditContent(content)}
              onDeleteContent={(id) => deleteContent(id)}
            />
          ))}

        </div>
      )}

      <CreateFolderModal open={showCreateModal} type="DOCUMENT" onClose={() => setShowCreateModal(false)} />
      <UploadContentModal
        open={!!uploadTargetFolderId}
        folderId={uploadTargetFolderId ?? ''}
        contentType="DOCUMENT"
        onClose={() => setUploadTargetFolderId(null)}
      />
      {editFolder && (
        <EditFolderModal
          open={!!editFolder}
          folderId={editFolder.id}
          initialName={editFolder.name}
          folderType="DOCUMENT"
          onClose={() => setEditFolder(null)}
        />

      )}

      {editContent && (
        <EditContentModal
          open={!!editContent}
          content={editContent}
          onClose={() => setEditContent(null)}
        />
      )}

    </div>
  );
};

export default FreeDocumentsPanel;
