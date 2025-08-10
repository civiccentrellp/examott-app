'use client';

import React, { useState } from 'react';
import { useFreeMaterialFolders } from '@/hooks/freeMaterial/useFreeMaterial';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import FolderCard from '../FolderCard';
import CreateFolderModal from '../modals/CreateFolderModal';
import UploadContentModal from '../modals/UploadContentModal';
import ImportContentModal from '../modals/ImportContentModal';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';
import EditFolderModal from '../modals/EditFolderModal';

const FreeTestsPanel = () => {
    const { user } = useUser();
    const { data: folders = [], isLoading } = useFreeMaterialFolders('TEST');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | null>(null);
    const [importTargetFolderId, setImportTargetFolderId] = useState<string | null>(null);
    const [editFolder, setEditFolder] = useState<{ id: string; name: string } | null>(null);


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
            ) : folders.length === 0 ? (
                <p className="text-muted-foreground">No folders found.</p>
            ) : (
                <div className="space-y-3">
                    {folders.map((folder: any) => (
                        <FolderCard
                            key={folder.id}
                            folder={{
                                id: folder.id,
                                name: folder.name,
                                contents: folder.contents ?? [],
                            }}
                            // onUploadContent={(id) => setUploadTargetFolderId(id)}
                            onEditFolder={(id, name) => setEditFolder({ id, name })}
                            onImportContent={(id) => setImportTargetFolderId(id)}
                        />
                    ))}
                </div>
            )}

            <CreateFolderModal open={showCreateModal} type="TEST" onClose={() => setShowCreateModal(false)} />
            {editFolder && (
                <EditFolderModal
                    open={!!editFolder}
                    folderId={editFolder.id}
                    initialName={editFolder.name}
                    folderType="DOCUMENT"
                    onClose={() => setEditFolder(null)}
                />

            )}
            <ImportContentModal
                open={!!importTargetFolderId}
                folderId={importTargetFolderId ?? ''}
                onClose={() => setImportTargetFolderId(null)}
            />
        </div>
    );
};

export default FreeTestsPanel;
