"use client";
import { useRouter } from 'next/navigation';
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, CaretRightFill, CaretDownFill, Download, Trash, PencilSquare } from "react-bootstrap-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    CourseStatus, deleteCourse, updateCourse, Course, getCourseById, getCourses, fetchFolders,
    fetchContents,
    createFolder,
    createContent,
    deleteFolder,
    deleteContent,
} from "@/utils/courses/getCourses";
import { uploadCourseImage } from "@/utils/firebaseUpload";
import TiptapEditor from '@/components/ui/TiptapEditor';
import { extractTextFromTiptapJSON } from "@/utils/tiptapUtils";
import ReadOnlyTiptapRenderer from "@/components/ui/ReadOnlyTiptapRenderer";
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import CourseContents from '@/components/courses/Tabs/CourseContentsTab';
import { ContentItem, ContentType } from '@/utils/courses/getCourses';
import CourseFaqsTab from '@/components/courses/Tabs/CourseFaqsTab';
import CourseOverviewTab from '@/components/courses/Tabs/CourseOverviewTab';




interface Faq {
    id: number;
    question: string;
    answer: string;
    open: boolean;
}

const CourseOverview = () => {
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
    const [newThumbnailPreview, setNewThumbnailPreview] = useState<string | null>(null);
    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"Overview" | "Contents" | "FAQ's">("Overview");
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [folderOpenState, setFolderOpenState] = useState<Record<number, boolean>>({});
    const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
    const [activeFolder, setActiveFolder] = useState<number | null>(null);
    const [newContentName, setNewContentName] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);





    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                console.error("Course ID is missing");
                return;
            }

            try {
                setLoading(true);
                const courseData = await getCourseById(courseId);
                setCourse(courseData);
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        if (course) {
            setStartDate(course.startDate || "");
            setEndDate(course.endDate || "");
        }
    }, [course]);


    useEffect(() => {
        const loadContentTree = async () => {
            if (!courseId) return;

            try {
                const [folders, contents] = await Promise.all([
                    fetchFolders(courseId),
                    fetchContents(courseId),
                ]);

                // Convert backend folders and contents into the frontend ContentItem[] tree
                const folderMap: Record<string, ContentItem> = {};

                folders.forEach((folder: any) => {
                    folderMap[folder.id] = {
                        id: folder.id,
                        name: folder.name,
                        type: "Folder",
                        children: [],
                    };
                });

                contents.forEach((content: any) => {
                    const item: ContentItem = {
                        id: content.id, // ✅ Fix
                        name: content.name,
                        type: content.type,
                        children: [],
                        url: content.url,
                    };

                    if (folderMap[content.folderId]) {
                        folderMap[content.folderId].children.push(item);
                    }
                });


                const topLevelFolders = folders
                    .filter((folder: any) => !folder.parentId)
                    .map((folder: any) => folderMap[folder.id]);

                setContents(topLevelFolders);
            } catch (err) {
                console.error("Failed to load course contents:", err);
                toast.error("Failed to load contents");
            }
        };

        loadContentTree();
    }, [courseId]);


    const refreshCourses = async () => {
        try {
            const latestCourses = await getCourses();
            setCourses(latestCourses);
        } catch (error) {
            console.error("Failed to refresh courses", error);
        }
    };

    if (loading) return <p>Loading course details...</p>;
    if (!course) return <p>Course not found.</p>;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!course) return;

        const { name, value } = e.target;

        setCourse((prev) => ({
            ...prev!,
            [name]: name.includes("Price") ? Number(value) || 0 : value, // Convert price to number
        }));
    };

    const handleSave = async () => {
        if (!courseId) {
            console.error("Course ID is missing");
            return;
        }

        try {
            let finalThumbnail = course.thumbnail;
            if (newThumbnail) {
                finalThumbnail = await uploadCourseImage(newThumbnail);
            }

            const videoUrlToSave = newVideoUrl || course.videoUrl;
            const durationToSave = `${startDate} to ${endDate}`;

            const updatedData: Partial<Course> = {
                ...course,
                startDate,
                endDate,
                status: course.status as CourseStatus,
                thumbnail: finalThumbnail,
                videoUrl: videoUrlToSave,
                duration: durationToSave,
            };

            // Update the course
            await updateCourse(courseId, updatedData);

            // Re-fetch updated course from server to ensure all fields are synced
            const latestCourse = await getCourseById(courseId);
            setCourse(latestCourse);

            toast.success("Course updated successfully !!!", {
                position: "top-right",
                duration: 3000,
            });
            setEditMode(false);
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error("Failed to update course", {
                position: "top-right",
                duration: 3000,
            });
        }
    };
    const handleDeleteCourse = async (courseId: string, refreshCourses: () => void) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This course will be permanently deleted.",
            icon: "warning",
            input: "text",
            inputPlaceholder: "Type DELETE to confirm",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
            preConfirm: (inputValue) => {
                if (inputValue !== "DELETE") {
                    Swal.showValidationMessage("You must type DELETE to confirm.");
                }
            },
            allowOutsideClick: () => !Swal.isLoading(),
        });

        if (result.isConfirmed && result.value === "DELETE") {
            try {
                const response = await deleteCourse(courseId);
                Swal.fire("Deleted!", response.message || "The course has been deleted.", "success");
                refreshCourses(); // Refresh course list data
                router.push("/courses"); // Redirect to courses page
            } catch (error) {
                console.error("Failed to delete course:", error);
                Swal.fire("Error", "Failed to delete the course.", "error");
            }
        }
    };

    const getEmbeddedUrl = (url: string | undefined) => {
        if (!url) return ""; // Handle undefined URL safely

        const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^"&?\/\s]+)/;
        const match = url.match(regex);

        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    const toggleEditMode = () => {
        setEditMode((prev) => {
            const next = !prev;

            if (next && course) {
                // Just entered edit mode – refresh date inputs from latest course data
                setStartDate(course.startDate || "");
                setEndDate(course.endDate || "");
            }

            return next;
        });

        setShowDropdown(false);
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewThumbnail(file);
            setNewThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // const handleAddContent = (type: ContentType, parentFolder: number | null = null) => {
    //     if (type === "Test") {
    //         setIsTestModalOpen(true); // ✅ open modal
    //         return;
    //     }
    //     setSelectedContentType(type);
    //     setActiveFolder(parentFolder);
    //     setShowModal(true);
    // };

    // const handleSaveContent = () => {
    //     if (!newContentName) return;

    //     let fileUrl = "";
    //     if (selectedContentType !== "Folder" && fileInputRef.current?.files?.length) {
    //         fileUrl = URL.createObjectURL(fileInputRef.current.files[0]);
    //     }

    //     const newContent: ContentItem = {
    //         name: newContentName,
    //         type: selectedContentType!,
    //         children: [],
    //         url: fileUrl,
    //     };

    //     if (activeFolder !== null) {
    //         setContents((prev) =>
    //             prev.map((item, index) =>
    //                 index === activeFolder ? { ...item, children: [...item.children, newContent] } : item
    //             )
    //         );
    //     } else {
    //         setContents([...contents, newContent]);
    //     }

    //     setShowModal(false);
    //     setNewContentName("");
    // };

    const toggleFolder = (index: number) => {
        setFolderOpenState((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // const handleDeleteContent = (index: number, childIndex?: number) => {
    //     setContents((prev) => {
    //         if (childIndex !== undefined) {
    //             return prev.map((item, i) =>
    //                 i === index ? { ...item, children: item.children.filter((_, ci) => ci !== childIndex) } : item
    //             );
    //         }
    //         return prev.filter((_, i) => i !== index);
    //     });
    // };

    const handleAddContent = (type: ContentType, parentFolderId: string | null = null) => {
        if (type === "Test") {
            setIsTestModalOpen(true);
            return;
        }

        setSelectedContentType(type);
        setActiveFolderId(parentFolderId);
        setShowModal(true);
    };


    const handleSaveContent = async () => {
        if (!newContentName || !courseId || !selectedContentType) return;

        try {
            if (selectedContentType === "Folder") {
                await createFolder(courseId, newContentName, activeFolderId ?? undefined);
            } else {
                let url: string | undefined = undefined;

                if (
                    fileInputRef.current?.files?.length &&
                    (selectedContentType === "Document" ||
                        selectedContentType === "Image" ||
                        selectedContentType === "Import Content" ||
                        selectedContentType === "File")
                ) {
                    // Placeholder logic; you should replace this with Firebase upload
                    const file = fileInputRef.current.files[0];
                    const formData = new FormData();
                    formData.append("file", file);
                    url = URL.createObjectURL(file); // For local preview. Replace with actual upload URL.
                }

                await createContent(courseId, {
                    name: newContentName,
                    type: selectedContentType.toUpperCase(),
                    url,
                    folderId: activeFolderId ?? undefined,
                });

            }

            setShowModal(false);
            setNewContentName("");
            toast.success(`${selectedContentType} created`);
            window.location.reload(); // Simplest for now. Replace with state refresh if needed.
        } catch (err) {
            console.error("Failed to save content", err);
            toast.error("Error saving content");
        }
    };
    // NEW — takes the content’s id
    const handleDeleteContent = async (id: string) => {
        try {
            // find in your local `contents` tree whether this id is a folder or a file
            const isFolder = contents.some(folder => folder.id === id);
            if (isFolder) {
                await deleteFolder(id);
                toast.success("Folder deleted");
            } else {
                await deleteContent(id);
                toast.success("Content deleted");
            }
            // reload or filter out locally
            setContents(prev => prev
                .filter(f => f.id !== id)
                .map(f => ({
                    ...f,
                    children: f.children.filter(c => c.id !== id),
                }))
            );
        } catch (err) {
            console.error("Failed to delete content", err);
            toast.error("Failed to delete content");
        }
    };


    const handleToggle = (id: number) => {
        setFaqs(faqs.map(faq => faq.id === id ? { ...faq, open: !faq.open } : faq));
    };

    const handleAddFaq = () => {
        if (!newFaq.question || !newFaq.answer) return alert("Both fields are required");
        setFaqs([...faqs, { id: Date.now(), ...newFaq, open: false }]);
        setNewFaq({ question: "", answer: "" });
    };

    const handleEditFaq = (id: number, question: string, answer: string) => {
        setEditingId(id);
        setNewFaq({ question, answer });
        setShowModal(true);
    };


    const handleSaveEdit = () => {
        if (!newFaq.question || !newFaq.answer) return alert("Both fields are required");
        setFaqs(faqs.map(faq => (faq.id === editingId ? { ...faq, ...newFaq } : faq)));
        setEditingId(null);
        setNewFaq({ question: "", answer: "" });
    };

    const handleDeleteFaq = (id: number, event: React.MouseEvent) => {
        event.stopPropagation();
        if (confirm("Are you sure you want to delete this FAQ?")) {
            setFaqs((prevFaqs) => {
                const updatedFaqs = prevFaqs.filter(faq => faq.id !== id);
                console.log("Updated FAQs:", updatedFaqs); // Debugging: Check the updated state
                return updatedFaqs; // Ensure a new state is returned
            });

            // Reset modal and editing state if necessary
            if (editingId === id) {
                setEditingId(null);
                setNewFaq({ question: "", answer: "" });
                setShowModal(false);
            }
        }
    };

    return (
        <div className="sm:p-6 h-[100%]">
            {/* Breadcrumbs */}
            <nav className="text-sm text-gray-500">
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                    <Link href="/courses" className="text-gray-600 hover:underline">Courses</Link>
                    <span className="text-gray-400">/</span>

                    <span className="text-gray-700 truncate max-w-[150px] sm:max-w-none sm:truncate-none sm:whitespace-normal sm:overflow-visible">
                        {course.name}
                    </span>

                    <span className="text-gray-400">/</span>
                    <span className="text-gray-700 truncate">{activeTab}</span>
                </div>
            </nav>


            {/* Course Details Container with Tabs */}
            <div className="py-4 bg-white h-full overflow-y-auto">
                <Tabs
                    value={activeTab.toLowerCase()}
                    onValueChange={(val) => setActiveTab(val as "Overview" | "Contents" | "FAQ's")}
                    className="w-full"
                >
                    <TabsList className="flex p-3 gap-2 bg-slate-300 bg-opacity-50 mx-6">
                        <TabsTrigger value="overview" className="flex-1 text-center ">Overview</TabsTrigger>
                        <TabsTrigger value="contents" className="flex-1 text-center ">Contents</TabsTrigger>
                        <TabsTrigger value="faqs" className="flex-1 text-center">FAQs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        {/* <div className="border rounded-lg  p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[99%] overflow-y-auto">
                            <div className="py-2 flex flex-col gap-2 overflow-y-auto">
                                <p><p><span className="font-bold">Course Name:</span> {course.name}</p>
                                    {editMode ? <input type="text" name="name" value={course.name} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : course.name}</p>

                                <div className="description-container">
                                    <p><strong>Description:</strong></p>
                                    {editMode ? (
                                        <TiptapEditor
                                            content={course.description}
                                            onUpdate={(value) => setCourse({ ...course, description: value })}
                                        />


                                    ) : (
                                        <div className="rich-text-preview">
                                            <ReadOnlyTiptapRenderer jsonContent={course.description} />

                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-row justify-between pr-4 w-full gap-2">
                                    <div className="flex flex-col justify-between gap-2">
                                        <p><strong>Price:</strong>
                                            {editMode ?
                                                <input
                                                    type="number"
                                                    name="originalPrice"
                                                    value={course.originalPrice}
                                                    onChange={handleInputChange}
                                                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border p-1 w-full rounded-lg focus:outline-none focus:ring-0 focus:shadow-none" />
                                                : `₹${course.originalPrice}`}
                                        </p>
                                        {editMode ? (
                                            <div className="flex gap-2 items-end w-full">
                                                <div className="flex flex-col w-full">
                                                    <label className="block font-semibold mb-1">Start Date:</label>
                                                    <input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="border py-1 px-2 rounded-lg w-full focus:outline-none focus:ring-0 focus:shadow-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col w-full">
                                                    <label className="block font-semibold mb-1">End Date:</label>
                                                    <input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="border py-1 px-2 rounded-lg w-full focus:outline-none focus:ring-0 focus:shadow-none"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p><strong>Duration:</strong> {course.duration}</p>
                                        )}


                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <p className=""><strong>Discounted Price:</strong>
                                            {editMode ?
                                                <input
                                                    type="number"
                                                    name="discountedPrice"
                                                    value={course.discountedPrice}
                                                    onChange={handleInputChange}
                                                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border p-1 w-full rounded-lg focus:outline-none focus:ring-0 focus:shadow-none" />
                                                : `₹${course.discountedPrice}`}
                                        </p>
                                        {editMode ? (
                                            <div className="flex flex-col">
                                                <label className="block font-semibold mb-1">Status:</label>
                                                <select
                                                    name="status"
                                                    value={course.status}
                                                    onChange={handleInputChange}
                                                    className="border p-1 w-full rounded-lg focus:outline-none focus:ring-0 focus:shadow-none"
                                                >
                                                    <option value="UNPUBLISHED">Unpublished</option>
                                                    <option value="PUBLISH_PUBLIC">Published [Public]</option>
                                                    <option value="PUBLISH_PRIVATE">Published [Private]</option>
                                                    <option value="EXPIRED">Expired</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-center">
                                                <strong>Status:</strong>
                                                <span>
                                                    {{
                                                        UNPUBLISHED: "Unpublished",
                                                        PUBLISH_PUBLIC: "Published [Public]",
                                                        PUBLISH_PRIVATE: "Published [Private]",
                                                        EXPIRED: "Expired",
                                                    }[course.status]}
                                                </span>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p><strong>Course Thumbnail</strong></p>
                                    <div className="relative w-full pt-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={newThumbnailPreview || course.thumbnail}
                                            alt={course.name}
                                            className="absolute top-0 left-0 w-full h-full object-fit"
                                        />
                                    </div>
                                    {editMode && <input type="file" onChange={handleThumbnailChange} className="mt-2" />}

                                    <p><strong>Course Video</strong></p>
                                    <div className="relative w-full pt-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={getEmbeddedUrl(newVideoUrl || course.videoUrl)}
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    {editMode && (
                                        <input
                                            type="text"
                                            value={newVideoUrl}
                                            onChange={(e) => setNewVideoUrl(e.target.value)}
                                            className="border p-1 w-full mt-2 rounded-lg"
                                            placeholder="New Video URL"
                                        />
                                    )}

                                </div>

                                <div className="relative flex justify-end items-start">
                                    {editMode ? (
                                        <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-500">
                                            Save
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowDropdown(!showDropdown)}
                                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-600"
                                            >
                                                Actions
                                            </button>
                                            {showDropdown && (
                                                <div className="absolute top-10 right-0 mt-2 bg-white shadow-lg rounded-lg w-32">
                                                    <button onClick={toggleEditMode} className="block px-4 py-2 w-full text-left hover:bg-gray-200">
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                                                        onClick={() => handleDeleteCourse(courseId, refreshCourses)} // Pass the course ID to delete
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>


                        </div> */}
                        <CourseOverviewTab />
                    </TabsContent>

                    <TabsContent value="contents">
                        <CourseContents courseId={courseId} />
                    </TabsContent>

                    <TabsContent value="faqs">
                        <CourseFaqsTab courseId={course.id} />
                    </TabsContent>
                </Tabs>


            </div>
        </div >
    );
};

export default CourseOverview;
