'use client';

import React, { useState } from 'react';
import { useDeleteFreeMaterialContent, useDeleteFreeMaterialFolder, useFreeMaterialFolders } from '@/hooks/freeMaterial/useFreeMaterial';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import FolderCard from '../FolderCard';
import CreateFolderModal from '../modals/CreateFolderModal';
import UploadContentModal from '../modals/UploadContentModal';
import ImportContentModal from '../modals/ImportContentModal';
import { FreeMaterialContent, FreeMaterialFolder } from '@/utils/freeMaterial/freeMaterial';
import EditContentModal from '../modals/EditContentModal';
import EditFolderModal from '../modals/EditFolderModal';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';

const FreeVideosPanel = () => {
    const { user } = useUser();
    const { data: folders = [], isLoading } = useFreeMaterialFolders('VIDEO');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
    const [importFolderId, setImportFolderId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<FreeMaterialContent | null>(null);
    const [editFolder, setEditFolder] = useState<{ id: string; name: string } | null>(null);

    const { mutateAsync: deleteContent } = useDeleteFreeMaterialContent();
    const { mutateAsync: deleteFolder } = useDeleteFreeMaterialFolder();

    return (
        <div className="space-y-4 py-2">
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
                                contents: folder.contents ?? [],
                            }}
                            onUploadContent={(id) => setUploadFolderId(id)}
                            onImportContent={(id) => setImportFolderId(id)}
                            onEditContent={(content) => setEditContent(content)}
                            onDeleteContent={(id) => deleteContent(id)}
                            onEditFolder={(id, name) => setEditFolder({ id, name })}
                            onDeleteFolder={(id) => deleteFolder(id)}
                        />
                    ))}
                </div>
            )}

            <CreateFolderModal open={showCreateModal} type="VIDEO" onClose={() => setShowCreateModal(false)} />
            <UploadContentModal
                open={!!uploadFolderId}
                folderId={uploadFolderId!}
                onClose={() => setUploadFolderId(null)}
                contentType="VIDEO"
            />
            <ImportContentModal
                open={!!importFolderId}
                folderId={importFolderId!}
                onClose={() => setImportFolderId(null)}

            />
            {editContent && (
                <EditContentModal
                    open={!!editContent}
                    content={editContent}
                    onClose={() => setEditContent(null)}
                />
            )}

            {editFolder && (
                <EditFolderModal
                    open={!!editFolder}
                    folderId={editFolder.id}
                    initialName={editFolder.name}
                    folderType="VIDEO"
                    onClose={() => setEditFolder(null)}
                />
            )}
        </div>
    );
};

export default FreeVideosPanel;
