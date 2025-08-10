'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Pencil, Trash, Upload, Download, MoreHorizontal, FolderIcon } from 'lucide-react';
import ContentCard from './ContentCard';
import { FreeMaterialContent, getPreviewUrl } from '@/utils/freeMaterial/freeMaterial';
import ImportContentModal from './modals/ImportContentModal';
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip';
import VisibilityCheck from '../VisibilityCheck';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/userContext";


interface FolderCardProps {
    folder: {
        id: string;
        name: string;
        contents: FreeMaterialContent[];
    };
    onEditFolder?: (folderId: string, folderName: string) => void;
    onDeleteFolder?: (folderId: string) => void;
    onUploadContent?: (folderId: string) => void;
    onImportContent?: (folderId: string) => void;
    onEditContent?: (content: FreeMaterialContent) => void;
    onDeleteContent?: (contentId: string) => void;

}

const FolderCard: React.FC<FolderCardProps> = ({
    folder,
    onEditFolder,
    onDeleteFolder,
    onUploadContent,
    onImportContent,
    onEditContent,        
    onDeleteContent
}) => {
    const { user } = useUser();
    const [expanded, setExpanded] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);


    return (
        <div className="border rounded-lg shadow-sm bg-white">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b" >
                <div className=" w-full flex items-center gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)} >
                    <span className="flex items-center gap-4 font-semibold text-sm"><FolderIcon/>{folder.name}</span>
                </div>

                <div className="flex items-center gap-2">
                    <VisibilityCheck user={user} check={['content.create', 'content.update', 'content.delete']} checkType="any-permission">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-40 px-3 py-2 ml-6 bg-white border border-gray-200 shadow-lg rounded-md">
                                <VisibilityCheck user={user} check="content.create" checkType="permission">
                                    {onUploadContent && (
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                onUploadContent(folder.id);
                                            }}
                                        >
                                            Upload Content
                                        </DropdownMenuItem>
                                    )}
                                    {onImportContent && (
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setShowImportModal(true);
                                            }}
                                        >
                                            Import Content
                                        </DropdownMenuItem>
                                    )}

                                </VisibilityCheck>
                                <VisibilityCheck user={user} check="content.update" checkType="permission">
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            onEditFolder?.(folder.id, folder.name);
                                        }}
                                    >
                                        Edit Folder
                                    </DropdownMenuItem>
                                </VisibilityCheck>
                                <VisibilityCheck user={user} check="content.delete" checkType="permission">
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            onDeleteFolder?.(folder.id);
                                        }}
                                    >
                                        Delete Folder
                                    </DropdownMenuItem>
                                </VisibilityCheck>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </VisibilityCheck>

                </div>

            </div>

            {/* Contents */}
            {expanded && folder.contents?.length > 0 && (
                <div className="">
                    {folder.contents.map((item) => (
                        <ContentCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            type={item.type}
                            url={getPreviewUrl(item)}
                            testId={item.testId}
                            onEdit={() => onEditContent?.(item)}
                            onDelete={() => onDeleteContent?.(item.id)}

                        />
                    ))}
                </div>
            )}

            {expanded && folder.contents?.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No contents in this folder.</div>
            )}

            <ImportContentModal
                open={showImportModal}
                folderId={folder.id}
                onClose={() => setShowImportModal(false)}
            />
        </div>
    );
};

export default FolderCard;
