'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';

import {
    fetchFolders,
    fetchContents,
    createFolder,
    createContent,
    deleteFolder,
    deleteContent,
    ContentItem,
    ContentType,
    updateFolder,
    updateContent,
    getCourses,
} from "@/utils/courses/getCourses";
import { toast } from "sonner";
import { uploadFileToFirebase } from "@/utils/firebaseUpload";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    FolderIcon,
    VideoIcon,
    FileTextIcon,
    MoreHorizontal,
    FileImage,
    FileText,
    FileVideo,
    Pencil,
    Trash,
    Video,
    Trash2,
    CloudDownload,
    ArrowDownCircleIcon,
    ImageIcon,
    FileSignature,
    Download,
    CheckCircle
} from "lucide-react";
import { CloudArrowDownFill, XSquareFill } from "react-bootstrap-icons";
import { FiletypePdf, Image, PencilSquare } from "react-bootstrap-icons";
import IconButtonWithTooltip from "@/components/ui/IconButtonWithTooltip";
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import { Switch } from "@/components/ui/switch";
import PDFViewer from "@/components/ui/PDFViewer";
import AddTestModal from "@/components/tests/AddTestModal";
import { getAllVideoFolders, getVideoFolders } from "@/utils/dbms/videoFolder";
import { getVideosByFolder } from "@/utils/dbms/video";
import { getAllTests } from "@/utils/tests/test";
import VisibilityCheck from "@/components/VisibilityCheck";
import { ALL_CONTENT_PERMISSIONS } from "@/utils/permissions/permissionsList";
import { useUser } from "@/context/userContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hasRole } from "@/utils/auth/rbac";


// interface CourseContentsProps {
//     courseId: string;
//     onContentSelect?: (content: { type: 'VIDEO' | 'DOCUMENT' | 'IMAGE'; url: string; title: string }) => void;
// }

interface CourseContentsProps {
    courseId: string;
    isEnrolled?: boolean;
    onContentSelect?: (content: {
        id: string;
        folderId: string;
        type: 'VIDEO' | 'DOCUMENT' | 'IMAGE';
        url: string;
        title: string;
    }) => void;
    activeContentId?: string;
    watchedContents?: string[];
    openVideoInModal?: boolean;
}


const ALL_TYPES: ContentType[] = [
    "Folder",
    "Video",
    "Document",
    "Image",
    "Test",
];

interface ContentCounts {
    Video: number;
    Document: number;
    Image: number;
    Test: number;
}

const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case "folder": return <FolderIcon size={24} />;
        case "video": return <VideoIcon size={18} />;
        case "document": return <FiletypePdf size={18} />;
        case "image": return <Image size={18} />;
        case "test": return <FileText size={18} />;
        default: return <Image size={24} />;
    }
};

// const CourseContents: React.FC<CourseContentsProps> = ({ courseId }) => {
const CourseContents: React.FC<CourseContentsProps> = ({ courseId, isEnrolled, onContentSelect, activeContentId, watchedContents, openVideoInModal }) => {

    const { user } = useUser();
    const [tree, setTree] = useState<ContentItem[]>([]);
    const [contentCounts, setContentCounts] = useState<ContentCounts>({
        Video: 0,
        Document: 0,
        Image: 0,
        Test: 0,
    });
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState<ContentType | null>(null);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [editingParentId, setEditingParentId] = useState<string | null>(null);
    const [parentMap, setParentMap] = useState<Record<string, string | null>>({});
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<ContentType | null>(null);
    const [isDownloadable, setIsDownloadable] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importType, setImportType] = useState<ContentType | null>(null);
    const [importItems, setImportItems] = useState<{ id: string; title: string; url: string }[]>([]);
    const [selectedImportItem, setSelectedImportItem] = useState<string | null>(null);
    const [importScope, setImportScope] = useState<"All" | "ByCourse">("All");
    const [availableCourses, setAvailableCourses] = useState<{ id: string; name: string }[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [videoFolders, setVideoFolders] = useState<{ id: string; name: string }[]>([]);
    const [selectedVideoFolderId, setSelectedVideoFolderId] = useState<string | null>(null);

    const contents = [
        { type: 'VIDEO', title: 'Intro Video', url: 'https://youtu.be/dQw4w9WgXcQ' },
        { type: 'DOCUMENT', title: 'Course PDF', url: '/sample.pdf' }
    ];

    const router = useRouter();



    const loadTree = async () => {
        try {
            const folders = await fetchFolders(courseId);
            const items = await fetchContents(courseId);


            const folderMap: Record<string, ContentItem> = {};
            const _parentMap: Record<string, string | null> = {};

            folders.forEach((f: any) => {
                folderMap[f.id] = {
                    id: f.id,
                    name: f.name,
                    type: "Folder",
                    children: [],
                    url: undefined,
                };
                _parentMap[f.id] = f.parentId || null;
            });

            folders.forEach((f: any) => {
                if (f.parentId && folderMap[f.parentId]) {
                    folderMap[f.parentId].children.push(folderMap[f.id]);
                }
            });

            const roots: ContentItem[] = folders
                .filter((f: any) => !f.parentId)
                .map((f: any) => folderMap[f.id]);


            // Counting content types: videos, documents, images, and tests
            const countMap: ContentCounts = {
                Video: 0,
                Document: 0,
                Image: 0,
                Test: 0,
            };

            items.forEach((c: any) => {
                const node: ContentItem = {
                    id: c.id,
                    name: c.name,
                    type: c.type as ContentType,
                    children: [],
                    url: c.url,
                    isDownloadable: c.isDownloadable,
                };
                const key = node.type.charAt(0).toUpperCase() + node.type.slice(1).toLowerCase();
                if (key in countMap) {
                    countMap[key as keyof ContentCounts]++;
                }

                if (c.folderId && folderMap[c.folderId]) {
                    folderMap[c.folderId].children.push(node);
                } else {
                    // ✅ Handle root-level content
                    roots.push(node);
                }
            });

            // Set content counts
            setContentCounts(countMap);
            setParentMap(_parentMap); // ✅ Save parent relationships
            setTree(roots);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load contents");
        }
    };

    useEffect(() => {
        if (courseId) loadTree();
    }, [courseId]);

    useEffect(() => {
        if (showModal && editingContentId) {
            const findContentById = (items: ContentItem[]): ContentItem | null => {
                for (const item of items) {
                    if (item.id === editingContentId) return item;
                    if (item.children.length) {
                        const found = findContentById(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const content = findContentById(tree);
            if (content) {
                setSelectedType(content.type);
                setNewName(content.name);
                setNewUrl(content.url || "");
                setIsDownloadable(content.isDownloadable ?? true);
            }
        }
    }, [showModal, editingContentId, tree]);

    const toggle = (id: string) => {
        setOpenMap((prev) => {
            const parentId = parentMap[id] || null;

            // Find siblings (all folder IDs with same parent)
            const siblings = Object.entries(parentMap)
                .filter(([folderId, pid]) => pid === parentId && folderId !== id)
                .map(([folderId]) => folderId);

            const newMap: Record<string, boolean> = { ...prev };

            // Close siblings
            siblings.forEach((siblingId) => {
                newMap[siblingId] = false;
            });

            // Toggle the current folder
            newMap[id] = !prev[id];

            return newMap;
        });
    };

    const mapToPrismaType = (uiType: ContentType): "FOLDER" | "VIDEO" | "TEST" | "DOCUMENT" | "IMAGE" => {
        switch (uiType) {
            case "Folder":
                return "FOLDER";
            case "Video":
                return "VIDEO";
            case "Test":
                return "TEST";
            case "Document":
                return "DOCUMENT";
            case "Image":
                return "IMAGE";
            default:
                throw new Error("Invalid content type selected");
        }
    };

    const handleOpenContent = (
        e: React.MouseEvent,
        id: string,
        folderId: string,
        url?: string,
        type?: string,
        title?: string
    ) => {
        e.stopPropagation();
        if (!url || !type) return toast.error("Invalid content");

        if (onContentSelect) {
            onContentSelect({
                id,
                folderId: folderId as string,
                type: type.toUpperCase() as 'VIDEO' | 'DOCUMENT' | 'IMAGE',
                url,
                title: title || 'Untitled'
            });
        }

        const lowerType = type.toLowerCase();

        if (lowerType === "video") {
            setActiveVideoUrl(url);
            setIsFullscreenMode(false);
            setPreviewUrl(null);
        }
        else if (lowerType === "image" || lowerType === "document") {
            setPreviewUrl(url);
            setPreviewType(type as ContentType);
            setActiveVideoUrl(null);
        }
        else if (lowerType === "test") {
            // Extract testId from URL
            const testIdMatch = url.match(/id=([^&]+)/);
            const testId = testIdMatch ? testIdMatch[1] : "";

            if (hasRole(user, "student")) {
                router.push(`/tests/${testId}?from=course&courseId=${courseId}`);
            }
            else {
                router.push(url);
            }
        }
        else {
            router.push(url);
        }
    };
    const handleSave = async () => {
        if (!newName.trim()) return;

        try {
            if (selectedType === "Folder") {
                if (editingFolderId) {
                    await updateFolder(editingFolderId, newName, editingParentId ?? undefined);
                    toast.success("Folder updated");
                } else {
                    await createFolder(courseId, newName, activeFolderId || undefined);
                    toast.success("Folder created");
                }
            } else if (selectedType) {
                let url = newUrl;

                if (
                    ["Document", "Image", "File", "Import Content"].includes(selectedType) &&
                    fileInput.current?.files?.length
                ) {
                    const file = fileInput.current.files[0];
                    url = await uploadFileToFirebase(file, `courses/${courseId}/${selectedType.toLowerCase()}`);
                }

                if (editingContentId) {
                    await updateContent(editingContentId, { name: newName, url, isDownloadable });
                    toast.success("Content updated");
                } else {
                    if (!activeFolderId) {
                        toast.error("No target folder selected");
                        return;
                    }
                    await createContent(courseId, {
                        name: newName,
                        type: mapToPrismaType(selectedType),
                        url,
                        folderId: activeFolderId,
                        isDownloadable,
                    });
                    toast.success(`${selectedType} added`);
                }
            }

            // Reset modal
            setShowModal(false);
            setSelectedType(null);
            setEditingParentId(null);
            setEditingFolderId(null);
            setEditingContentId(null);
            setNewName("");
            setNewUrl("");
            loadTree();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Save failed");
        }
    };

    const handleDelete = async (node: ContentItem) => {
        try {
            if (node.type === "Folder") {
                if (!confirm(`Delete folder "${node.name}" and all its contents?`)) return;
                await deleteFolder(node.id);
            } else {
                await deleteContent(node.id);
            }
            toast.success("Deleted");
            loadTree();
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    function extractYouTubeIdFromUrl(url: string): string {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;

            // Match normal YouTube video
            const vParam = parsedUrl.searchParams.get("v");
            if (vParam) return vParam;

            // Match youtu.be short links
            const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
            if (shortMatch?.[1]) return shortMatch[1];

            // Match embed URLs
            const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
            if (embedMatch?.[1]) return embedMatch[1];

            // ✅ Match YouTube live URLs
            const liveMatch = url.match(/youtube\.com\/live\/([\w-]+)/);
            if (liveMatch?.[1]) return liveMatch[1];

            return "";
        } catch {
            return "";
        }
    }
    const videoId = activeVideoUrl ? extractYouTubeIdFromUrl(activeVideoUrl) : "";


    const renderNodes = (nodes: ContentItem[], depth = 0): JSX.Element => (
        <div className="w-full flex flex-col">
            {/* {nodes.map((node) => ( */}
            {nodes.map(node => {
                const isActive = node.id === activeContentId;
                const isWatched = watchedContents?.includes(node.id);
                return (
                    <React.Fragment key={node.id}>
                        <div className={`w-full border rounded-lg shadow-sm bg-white ${depth === 0 ? "mt-3" : ""}`}>

                            <div
                                className={`flex justify-between items-center px-6 py-3 ${(isEnrolled === false && node.type === "Folder") ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}   ml-[${depth * 2.5}rem] ${node.type === "Folder"
                                    ? depth === 0
                                        ? "bg-violet-50" // Root folder
                                        : "border border-gray-200 bg-white"            // Child folder
                                    : depth === 0
                                        ? ""     // Content in root
                                        : "border border-slate-200 bg-sky-50 px-12"      // Content in child
                                    }`}
                                onClick={(e) => {
                                    if (isEnrolled === false && node.type === "Folder") return;
                                    node.type === "Folder"
                                        ? toggle(node.id)
                                        : handleOpenContent(e, node.id, parentMap[node.id] ?? "", node.url, node.type, node.name)
                                }}
                            >

                                <div className="flex items-center gap-3">
                                    {getTypeIcon(node.type)}
                                    <span className="flex items-center gap-4 font-semibold text-sm">{node.name}</span>
                                </div>

                                {node.type === "Folder" ? (
                                    <VisibilityCheck user={user} check={ALL_CONTENT_PERMISSIONS} checkType="any-permission">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-40 px-3 py-2 ml-6 bg-white border border-gray-200 shadow-lg rounded-md">
                                                <VisibilityCheck user={user} check="content.create" checkType="permission">
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            setSelectedType(null);
                                                            setNewName("");
                                                            setNewUrl("");
                                                            setActiveFolderId(node.id);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        Upload Content
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            setActiveFolderId(node.id);
                                                            setIsImportModalOpen(true);
                                                            setImportType(null);
                                                            setImportItems([]);
                                                            setSelectedImportItem(null);
                                                        }}
                                                    >
                                                        Import Content
                                                    </DropdownMenuItem>
                                                </VisibilityCheck>
                                                <VisibilityCheck user={user} check="content.update" checkType="permission">
                                                    <DropdownMenuItem
                                                        onSelect={() => {
                                                            setEditingFolderId(node.id);
                                                            setEditingParentId(null);
                                                            setSelectedType("Folder");
                                                            setNewName(node.name);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                </VisibilityCheck>
                                                <VisibilityCheck user={user} check="content.delete" checkType="permission">
                                                    <DropdownMenuItem onSelect={() => handleDelete(node)}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </VisibilityCheck>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </VisibilityCheck>
                                ) : (

                                    <div className="flex items-center gap-3">
                                        {node.isDownloadable && node.url && node.type?.toLowerCase() !== "video" && (
                                            <IconButtonWithTooltip
                                                label="Download"
                                                icon={<Download />}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    const filename = `${node.name?.trim().replace(/\s+/g, "_") || "file"}.pdf`;

                                                    const link = document.createElement("a");
                                                    link.href = node.url ?? "#";
                                                    link.setAttribute("download", filename);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);

                                                }}
                                            />
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewUrl(null);
                                                setActiveVideoUrl(null);
                                                setEditingFolderId(null);
                                                setSelectedType(node.type);
                                                setNewName(node.name);
                                                setNewUrl(node.url || "");
                                                setActiveFolderId(null);
                                                setShowModal(true);
                                            }}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(node)}
                                        >
                                            <Trash2 size={16} color="red" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {node.type === "Folder" && openMap[node.id] && (
                            <div className="w-full">
                                {node.children.length > 0 ? (
                                    node.children.map((child) => (
                                        <React.Fragment key={child.id}>
                                            <div
                                                className="w-full flex justify-between items-center px-10 py-3 border-l border-r border-b bg-white hover:bg-slate-50 cursor-pointer"
                                                onClick={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    if (target.closest("button")) return;
                                                    if (child.type === "Folder") {
                                                        toggle(child.id);
                                                    } else {
                                                        handleOpenContent(e, child.id, node.id ?? "", child.url, child.type, child.name);

                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* {getTypeIcon(child.type)} */}
                                                    {watchedContents?.includes(child.id) && child.id !== activeContentId ? (
                                                        <CheckCircle className="text-emerald-500" size={18} />
                                                    ) : (
                                                        getTypeIcon(child.type)
                                                    )}
                                                    <span
                                                        className="font-small text-sm"
                                                    >
                                                        {child.name}
                                                    </span>
                                                </div>
                                                {child.type === "Folder" ? (
                                                    <VisibilityCheck user={user} check={ALL_CONTENT_PERMISSIONS} checkType="any-permission">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <VisibilityCheck user={user} check="content.create" checkType="permission">
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setSelectedType(null);
                                                                            setNewName("");
                                                                            setNewUrl("");
                                                                            setActiveFolderId(child.id);
                                                                            setShowModal(true);
                                                                        }}
                                                                    >
                                                                        Upload Content
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setActiveFolderId(child.id);
                                                                            setSelectedType("Import Content");
                                                                            setShowModal(true);
                                                                        }}
                                                                    >
                                                                        Import Content
                                                                    </DropdownMenuItem>
                                                                </VisibilityCheck>
                                                                <VisibilityCheck user={user} check="content.update" checkType="permission">
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setPreviewUrl(null);
                                                                            setActiveVideoUrl(null);
                                                                            setEditingFolderId(child.id);
                                                                            setEditingParentId(node.id); // node is the parent
                                                                            setEditingContentId(null);
                                                                            setSelectedType("Folder");
                                                                            setNewName(child.name);
                                                                            setShowModal(true);
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </VisibilityCheck>
                                                                <VisibilityCheck user={user} check="content.delete" checkType="permission">
                                                                    <DropdownMenuItem onSelect={() => handleDelete(child)}>
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </VisibilityCheck>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </VisibilityCheck>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        {child.isDownloadable && child.url && child.type?.toLowerCase() !== "video" && (
                                                            <IconButtonWithTooltip
                                                                label="Download"
                                                                icon={<Download size={24} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();

                                                                    const link = document.createElement("a");
                                                                    link.href = child.url ?? "#";

                                                                    // Ensure .pdf or proper extension is added
                                                                    const filename = child.name?.trim().replace(/\s+/g, "_") || "download";
                                                                    const extension = child.url?.split('.').pop()?.split(/\#|\?/)[0] || "pdf";
                                                                    link.download = `${filename}.${extension}`;

                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                            />
                                                        )}
                                                        <VisibilityCheck user={user} check="content.update" checkType="permission">
                                                            <IconButtonWithTooltip
                                                                label="Edit"
                                                                icon={<Pencil size={20} />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewUrl(null);
                                                                    setActiveVideoUrl(null);
                                                                    setEditingFolderId(null);
                                                                    setEditingContentId(child.id);
                                                                    setSelectedType(child.type);
                                                                    setNewName(child.name);
                                                                    setIsDownloadable(node.isDownloadable ?? true);
                                                                    setNewUrl(child.url || "");
                                                                    setActiveFolderId(node.id);
                                                                    setShowModal(true);
                                                                }}
                                                            />
                                                        </VisibilityCheck>
                                                        {/* </Button> */}
                                                        <VisibilityCheck user={user} check="content.delete" checkType="permission">
                                                            <IconButtonWithTooltip
                                                                label="Delete"
                                                                icon={<Trash2 size={20} color="red" />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(child);
                                                                }}
                                                            />
                                                        </VisibilityCheck>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Recursive call to render children of child folders */}
                                            {child.type === "Folder" && openMap[child.id] && (
                                                <div className=" mx-2 ">{renderNodes(child.children, depth + 1)}</div>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <div className="px-4 py-1 text-sm text-center text-gray-500">
                                        No Content Available
                                    </div>
                                )}
                            </div>
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    );

    return (
        <div className="flex flex-col items-start justify-between gap-2 lg:p-4 p-0 ">

            <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-3 px-2 lg:px-4 mt-2">
                {/* Counts */}
                <div className="flex gap-2 text-sm items-center justify-center">
                    {/* Classes */}
                    <div className="flex items-center gap-1 bg-violet-50 text-violet-800 text-xs rounded-full px-2 py-1.5 shadow-sm 
                  hover:shadow-md hover:bg-violet-100 transition-all duration-300 ease-in-out">
                        <div className="bg-violet-200 p-1 rounded-full">
                            <VideoIcon className="w-4 h-4" />
                        </div>
                        <span className="flex flex-row">{contentCounts.Video} Classes</span>
                    </div>

                    {/* Attachments */}
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-800 text-xs rounded-full px-2 py-1.5 shadow-sm 
                  hover:shadow-md hover:bg-blue-100 transition-all duration-300 ease-in-out">
                        <div className="bg-blue-200 p-1 rounded-full">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                        <span>{contentCounts.Document + contentCounts.Image} Attachments</span>
                    </div>

                    {/* Tests */}
                    <div className="flex items-center gap-1 bg-green-50 text-green-800 text-xs rounded-full px-2 py-1.5 shadow-sm 
                  hover:shadow-md hover:bg-green-100 transition-all duration-300 ease-in-out">
                        <div className="bg-green-200 p-1 rounded-full">
                            <FileSignature className="w-4 h-4" />
                        </div>
                        <span>{contentCounts.Test} Tests</span>
                    </div>
                </div>


                {/* Create Folder Button */}
                <VisibilityCheck user={user} check="content.create" checkType="permission">
                    <Button
                        variant="outline"
                        className="w-full lg:w-auto bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2"
                        onClick={() => {
                            setSelectedType("Folder");
                            setNewName("");
                            setActiveFolderId(null);
                            setEditingFolderId(null);
                            setShowModal(true);
                        }}
                    >
                        Create Folder
                    </Button>
                </VisibilityCheck>
            </div>

            <div className="w-full h-[90%] mb-10">
                {renderNodes(tree)}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-5 animate-fade-in">
                            <h3 className="text-xl font-semibold text-gray-800 pb-2 text-center">
                                {editingFolderId ? "Edit Folder" :
                                    selectedType === "Folder" ? "Create Folder" :
                                        editingContentId ? "Edit Content" : "Add New Content"}
                            </h3>

                            {!editingFolderId && selectedType !== "Folder" && (
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 block mb-1 w-[40%]">
                                        Content Type
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-0 focus:shadow-none"
                                        onChange={(e) => {
                                            const value = e.target.value as ContentType;
                                            setSelectedType(value);
                                            if (!editingContentId) {
                                                setNewName("");
                                                setNewUrl("");
                                                if (fileInput.current) fileInput.current.value = "";
                                            }
                                            if (value === "Test") {
                                                setShowModal(false);
                                                setTimeout(() => setIsCreateModalOpen(true), 300);
                                            }
                                        }}
                                        value={selectedType || ""}
                                    >
                                        {selectedType && (
                                            <option value={selectedType} disabled hidden>
                                                {selectedType}
                                            </option>
                                        )}

                                        {!selectedType && (
                                            <option disabled value="">
                                                Select type
                                            </option>
                                        )}

                                        {ALL_TYPES.filter(t => t !== "Folder").map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            )}
                            {Boolean(selectedType) && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 block mb-1 w-[40%]">Title</label>
                                        <input
                                            type="text"
                                            placeholder="Enter title"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                                        />
                                    </div>

                                    {selectedType === "Video" && (
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-700 block mb-1 w-[40%]">Video URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://youtube.com/..."
                                                value={newUrl}
                                                onChange={(e) => setNewUrl(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                                            />
                                        </div>
                                    )}

                                    {["Document", "Image"].includes(selectedType || "") && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 block mb-1 w-[40%]">Upload File</label>
                                                <input
                                                    ref={fileInput}
                                                    type="file"
                                                    accept={selectedType === "Image" ? "image/*" : "application/pdf"}
                                                    className="w-full text-sm text-gray-700 file:border-0 file:rounded file:px-3 file:py-1 file:bg-blue-100 file:text-blue-700"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Allow Download
                                                </label>
                                                <Switch
                                                    checked={isDownloadable}
                                                    onCheckedChange={setIsDownloadable}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-4 pt-3">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 w-50"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedType(null);
                                        setNewName("");
                                        setNewUrl("");
                                        setEditingFolderId(null);
                                        setEditingContentId(null);
                                        setIsDownloadable(true);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50"
                                    onClick={handleSave}
                                    disabled={!newName.trim()}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {activeVideoUrl && videoId && (
                openVideoInModal ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div
                            className="relative rounded-xl overflow-hidden shadow-2xl bg-black"
                            style={{
                                width: isFullscreenMode ? '100vw' : '80vw',    // perfect modal width
                                height: isFullscreenMode ? '100vh' : '45vw',   // 16:9 ratio
                                maxWidth: isFullscreenMode ? '100%' : '960px', // desktop limit
                                maxHeight: isFullscreenMode ? '100%' : '540px' // desktop limit
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <YouTubePlayer
                                videoId={videoId}
                                onClose={() => setActiveVideoUrl(null)}
                                isFullscreen={isFullscreenMode}
                                setIsFullscreen={setIsFullscreenMode}
                            />
                        </div>

                    </div>
                ) : (
                    <div></div>
                )
            )}


            {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="relative bg-black/70 p-4 rounded shadow h-full w-full">
                        <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute top-2 right-2 text-white "
                        >
                            <XSquareFill size={35} />
                        </button>

                        {previewType?.toLowerCase() === "image" ? (
                            <div
                                onContextMenu={(e) => e.preventDefault()}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    onError={() => {
                                        toast.error("Failed to load image. It might be private or corrupted.");
                                        setPreviewUrl(null);
                                    }}
                                    className="max-w-full max-h-[80vh] rounded select-none"
                                    draggable={false}
                                />
                            </div>
                        ) : (

                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                                className="w-full h-full rounded"
                                frameBorder="0"
                                title="Document Preview"
                                sandbox="allow-same-origin allow-scripts"
                            />
                        )}
                    </div>
                </div>
            )}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center m-0">
                    <AddTestModal
                        onClose={() => setIsCreateModalOpen(false)}
                        onTestCreated={async (test) => {
                            setIsCreateModalOpen(false);
                            try {
                                await createContent(courseId, {
                                    name: test.name,
                                    type: "TEST",
                                    url: `/dbms/test-form?id=${test.id}&folderId=${activeFolderId}&courseId=${courseId}`,
                                    folderId: activeFolderId,
                                    isDownloadable: false,
                                });
                                toast.success("Test added to folder");
                                await loadTree();
                            } catch (error) {
                                toast.error("Failed to link test to folder");
                            }
                        }}
                        CourseId={courseId}
                    />
                </div>
            )}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl space-y-5">
                        <h3 className="text-xl font-semibold text-center">Import Content</h3>

                        {/* Select Type */}
                        <div>
                            <label className="block mb-1 text-sm font-medium">Content Type</label>
                            <select
                                className="w-full px-3 py-2 border rounded"
                                value={importType || ""}
                                onChange={async (e) => {
                                    const selected = e.target.value as ContentType;
                                    setImportType(selected);
                                    setSelectedImportItem(null);

                                    if (selected === "Video") {
                                        if (importScope === "All") {
                                            const res = await getAllVideoFolders();
                                            if (!res || res.length === 0) {
                                                const videos = await getVideosByFolder("");
                                                setImportItems(videos);
                                                setVideoFolders([]);
                                            } else {
                                                setVideoFolders(res);
                                            }
                                        } else if (selectedCourseId) {
                                            const res = await getVideoFolders(selectedCourseId);
                                            if (!res || res.length === 0) {
                                                const videos = await getVideosByFolder("");
                                                setImportItems(videos);
                                                setVideoFolders([]);
                                            } else {
                                                setVideoFolders(res);
                                            }
                                        }



                                    } else if (selected === "Test") {
                                        const tests = await getAllTests();
                                        setImportItems(tests.map(t => ({
                                            id: t.id,
                                            title: t.name,
                                            url: `/dbms/test-form?id=${t.id}&folderId=${activeFolderId}&courseId=${courseId}`,
                                        })));

                                    }
                                }}
                            >
                                <option value="" disabled>Select type</option>
                                <option value="Video">Video</option>
                                <option value="Test">Test</option>
                            </select>
                        </div>

                        {/* Scope Selection */}
                        {importType === "Video" && (
                            <>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Import From</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded"
                                        value={importScope}
                                        onChange={async (e) => {
                                            const value = e.target.value as "All" | "ByCourse";
                                            setImportScope(value);
                                            setSelectedCourseId(null);
                                            setSelectedVideoFolderId(null);
                                            setImportItems([]);

                                            if (value === "All") {
                                                const res = await getAllVideoFolders();
                                                setVideoFolders(res);
                                            } else {
                                                const courses = await getCourses();
                                                setAvailableCourses(courses);
                                            }
                                        }}
                                    >
                                        <option value="All">All</option>
                                        <option value="ByCourse">By Course</option>
                                    </select>
                                </div>

                                {importScope === "ByCourse" && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Select Course</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded"
                                            value={selectedCourseId || ""}
                                            onChange={async (e) => {
                                                const courseId = e.target.value;
                                                setSelectedCourseId(courseId);
                                                const res = await getVideoFolders(courseId);
                                                setVideoFolders(res);
                                                setSelectedVideoFolderId(null);
                                                setImportItems([]);
                                            }}
                                        >
                                            <option value="" disabled>Select course</option>
                                            {availableCourses.map(course => (
                                                <option key={course.id} value={course.id}>{course.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Select Video Folder */}
                                {videoFolders.length > 0 && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Select Folder</label>
                                        <select
                                            className="w-full px-3 py-2 border rounded"
                                            value={selectedVideoFolderId || ""}
                                            onChange={async (e) => {
                                                const folderId = e.target.value;
                                                setSelectedVideoFolderId(folderId);
                                                const videos = await getVideosByFolder(folderId);
                                                setImportItems(videos);
                                                setSelectedImportItem(null);
                                            }}
                                        >
                                            <option value="" disabled>Select folder</option>
                                            {videoFolders.map(folder => (
                                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                            </>
                        )}

                        {/* Final Video or Test Selection */}
                        {importItems.length > 0 && (
                            <div>
                                <label className="block mb-1 text-sm font-medium">Select {importType}</label>
                                <select
                                    className="w-full px-3 py-2 border rounded"
                                    value={selectedImportItem || ""}
                                    onChange={(e) => setSelectedImportItem(e.target.value)}
                                >
                                    <option value="" disabled>Select {importType}</option>
                                    {importItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
                            <Button
                                className="bg-gray-900 text-white"
                                disabled={!selectedImportItem}
                                onClick={async () => {
                                    try {
                                        const selected = importItems.find(i => i.id === selectedImportItem);
                                        if (!selected || !activeFolderId) return;

                                        await createContent(courseId, {
                                            name: selected.title,
                                            type: importType === "Test" ? "TEST" : "VIDEO",
                                            url: selected.url,
                                            folderId: activeFolderId,
                                            isDownloadable: importType === "Video",
                                        });

                                        toast.success(`${importType} imported`);
                                        await loadTree();
                                        setIsImportModalOpen(false);
                                    } catch (err) {
                                        toast.error("Failed to import content");
                                    }
                                }}
                            >
                                Import
                            </Button>
                        </div>
                    </div>
                </div>
            )}



        </div>

    );
};

export default CourseContents;
