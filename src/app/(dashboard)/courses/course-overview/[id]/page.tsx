"use client";
import "react-quill/dist/quill.snow.css";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import Link from "next/link";
import { Plus, CaretRightFill, CaretDownFill, Download, Trash, PencilSquare } from "react-bootstrap-icons";
import { updateCourse } from "@/utils/getCourses";
import { uploadCourseImage } from "@/utils/firebaseUpload";

interface Course {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    videoUrl: string;
    originalPrice: number;
    discountedPrice: number;
    expiryDate: string;
    status: string;
    duration: string;
}
type ContentType = "Folder" | "Video" | "Test" | "Document" | "Image" | "Import Content" | "File";

interface ContentItem {
    name: string;
    type: ContentType;
    children: ContentItem[];
    url?: string;
}
interface Faq {
    id: number;
    question: string;
    answer: string;
    open: boolean;
}

const CourseOverview = () => {
    const params = useParams();
    const courseId = params?.id;
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

    useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) {
                console.error("Course ID is missing");
                return;
            }

            try {
                setLoading(true);
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
                const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}`, { cache: "no-store" });

                if (!res.ok) {
                    const errorData = await res.text();
                    console.error("Failed to fetch course:", errorData);
                    throw new Error("Failed to fetch course");
                }

                const result = await res.json();
                setCourse(result.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);
    

    if (loading) return <p>Loading course details...</p>;
    if (!course) return <p>Course not found.</p>;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        console.log(course.description);
    
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    
            let finalThumbnail = course.thumbnail;
            if (newThumbnail) {
                finalThumbnail = await uploadCourseImage(newThumbnail); // Ensure thumbnail is uploaded
            }
    
            const videoUrlToSave = newVideoUrl || course.videoUrl;
            const durationToSave = `${startDate} to ${endDate}`;
    
            const updatedData: Partial<Course> = {
                ...course,
                thumbnail: finalThumbnail,
                videoUrl: videoUrlToSave,
                duration: durationToSave,
            };
    
            // Sending the updated data to the server
            const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
    
            if (!res.ok) throw new Error("Failed to update course");
    
            const updatedCourse: Course = await res.json();
    
            // Update the course state immediately after receiving the updated data
            setCourse(updatedCourse);
            alert("Course updated successfully!");
            setEditMode(false);
        } catch (error) {
            console.error(error);
            alert("Error updating course.");
        }
    };



    const getEmbeddedUrl = (url: string | undefined) => {
        if (!url) return ""; // Handle undefined URL safely

        const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^"&?\/\s]+)/;
        const match = url.match(regex);

        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };



    const toggleEditMode = () => {
        if (!editMode) {
            setEditMode(true);
            setShowDropdown(false);
        }
    };

    

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewThumbnail(file);
            setNewThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleAddContent = (type: ContentType, parentFolder: number | null = null) => {
        setSelectedContentType(type);
        setActiveFolder(parentFolder);
        setShowModal(true);
    };

    const handleSaveContent = () => {
        if (!newContentName) return;

        let fileUrl = "";
        if (selectedContentType !== "Folder" && fileInputRef.current?.files?.length) {
            fileUrl = URL.createObjectURL(fileInputRef.current.files[0]);
        }

        const newContent: ContentItem = {
            name: newContentName,
            type: selectedContentType!,
            children: [],
            url: fileUrl,
        };

        if (activeFolder !== null) {
            setContents((prev) =>
                prev.map((item, index) =>
                    index === activeFolder ? { ...item, children: [...item.children, newContent] } : item
                )
            );
        } else {
            setContents([...contents, newContent]);
        }

        setShowModal(false);
        setNewContentName("");
    };

    const toggleFolder = (index: number) => {
        setFolderOpenState((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleDeleteContent = (index: number, childIndex?: number) => {
        setContents((prev) => {
            if (childIndex !== undefined) {
                return prev.map((item, i) =>
                    i === index ? { ...item, children: item.children.filter((_, ci) => ci !== childIndex) } : item
                );
            }
            return prev.filter((_, i) => i !== index);
        });
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
        setShowModal(true); // Open modal directly
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
        <div className="p-6">
            {/* Breadcrumbs */}
            <nav className="text-gray-500 text-sm mb-4">
                <Link href="/courses" className="hover:underline">Courses</Link> {" > "}
                <span className="text-gray-700">{course.name}</span>{" > "}
                <span className="text-gray-700">{activeTab}</span>
            </nav>

            {/* Course Name & Actions Dropdown */}
            <div className="flex justify-between items-center mb-4">

                <h1 className="text-3xl font-bold">{course.name}</h1>

            </div>

            {/* Course Details Container with Tabs */}
            <div className="border rounded-lg p-4 bg-white">
                <div className="flex space-x-4 border-b pb-2">
                    {["Overview", "Contents", "FAQ's"].map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 ${activeTab === tab ? "border-b-2 border-gray-900 font-semibold" : "hover:border-b-2 hover:border-gray-300"}`}
                            onClick={() => setActiveTab(tab as "Overview" | "Contents" | "FAQ's")}
                        >
                            {tab}
                        </button>
                    ))}
                </div>


                {activeTab === "Overview" && (
                    < div className="p-4 grid grid-cols-2 gap-6">
                        <div className="py-2 flex flex-col gap-2">
                            <p><strong>Course Name:</strong> {editMode ? <input type="text" name="name" value={course.name} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : course.name}</p>

                            <div className="description-container">
                                <p><strong>Description:</strong></p>
                                {editMode ? (
                                    <ReactQuill
                                        value={course.description}
                                        onChange={(value) => setCourse({ ...course, description: value })}
                                        className=" p-2 w-full h-[auto] bg-white"
                                        modules={{
                                            toolbar: [
                                                [{ header: [1, 2, false] }],
                                                ["bold", "italic", "underline"],
                                                [{ list: "ordered" }, { list: "bullet" }],
                                                ["link", "image"],
                                                ["clean"]
                                            ]
                                        }}
                                        formats={[
                                            "header",
                                            "bold", "italic", "underline",
                                            "list", "bullet",
                                            "link", "image"
                                        ]}
                                    />

                                ) : (
                                    <div className="prose" dangerouslySetInnerHTML={{ __html: course.description }} />
                                )}
                            </div>

                            {/* Additional Course Details */}
                            <div className="mt-4 flex flex-row justify-between">
                                <div className="flex flex-col justify-between">
                                    <p><strong>Price:</strong> {editMode ? <input type="number" name="originalPrice" value={course.originalPrice} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : `₹${course.originalPrice}`}</p>
                                    <p><strong>Duration:</strong> {editMode ? <input type="text" name="duration" value={course.duration} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : course.duration}</p>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <p className=""><strong>Discounted Price:</strong> {editMode ? <input type="number" name="discountedPrice" value={course.discountedPrice} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : `₹${course.discountedPrice}`}</p>
                                    <p><strong>Status:</strong> {editMode ? <input type="text" name="status" value={course.status} onChange={handleInputChange} className="border p-1 w-full rounded-lg" /> : course.status}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                {/* Course Thumbnail */}
                                <p><strong>Course Thumbnail</strong></p>
                                <div className="relative w-full pt-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={newThumbnailPreview || course.thumbnail}
                                        alt={course.name}
                                        className="absolute top-0 left-0 w-full h-full object-fit"
                                    />
                                </div>
                                {editMode && <input type="file" onChange={handleThumbnailChange} className="mt-2" />}

                                {/* Course Video */}
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

                            {/* {editMode &&
                                <div className="flex justify-end items-center">
                                    <button onClick={handleSave} className=" bg-gray-900 px-4 py-2 text-white rounded-lg">Save</button>
                                </div>
                            } */}

                            <div className="relative flex justify-end items-start">
                                {editMode ? (
                                    // Show "Save" button when editMode is active
                                    <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-500">
                                        Save
                                    </button>
                                ) : (
                                    // Show "Actions" dropdown when not in edit mode
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
                                                <button className="block px-4 py-2 w-full text-left hover:bg-gray-200">
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                        </div>


                    </div>
                )}
                {activeTab === "Contents" && (
                    <div className="p-4 grid grid-cols-3 gap-4">
                        <div className="col-span-2 bg-white">
                            <ul className="mt-4 space-y-2">
                                {contents.length > 0 ? (
                                    contents.map((content, index) => (
                                        <li key={index} className="border p-2 rounded-lg bg-gray-100 relative ">
                                            {content.type === "Folder" ? (
                                                <div>
                                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFolder(index)}>
                                                        <span>{content.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Plus className="text-gray-900 text-2xl cursor-pointer" onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddContent("File", index);
                                                            }} />
                                                            {folderOpenState[index] ? <CaretDownFill /> : <CaretRightFill />}
                                                        </div>
                                                    </div>
                                                    {folderOpenState[index] && (
                                                        <ul className="ml-4 mt-2 border-l pl-2 space-y-1">
                                                            {content.children.map((child, childIndex) => (
                                                                <li key={childIndex} className="flex justify-between items-center text-gray-700 p-1">
                                                                    <span>{child.name}</span>
                                                                    <div className="flex items-center gap-4">
                                                                        <a href={child.url} download className="text-green-500 flex items-center mt-1">
                                                                            <Download className="mr-1" />
                                                                        </a>
                                                                        <Trash className="text-red-500 cursor-pointer" onClick={() => handleDeleteContent(index, childIndex)} />
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center">
                                                    <span>{content.name}</span>
                                                    <Trash className="text-red-500 cursor-pointer" onClick={() => handleDeleteContent(index)} />
                                                </div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No contents added yet.</p>
                                )}
                            </ul>
                        </div>
                        <div className="border rounded-lg p-4 bg-white">
                            <h2 className="text-xl font-bold mb-2">Add Content</h2>
                            <div className="space-y-2">
                                {["Folder", "Video", "Test", "Document", "Image", "Import Content"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleAddContent(type as ContentType)}
                                        className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            {showModal && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                                    <div className="bg-white p-6 rounded-lg w-1/3">
                                        <h3 className="text-lg font-bold mb-4">Add {selectedContentType}</h3>

                                        {/* Common Name Input */}
                                        <input
                                            type="text"
                                            placeholder="Enter Name"
                                            className="border p-2 w-full rounded-lg mb-2"
                                            value={newContentName}
                                            onChange={(e) => setNewContentName(e.target.value)}
                                        />

                                        {/* Dynamic Fields Based on Content Type */}
                                        {selectedContentType === "Video" && (
                                            <input
                                                type="text"
                                                placeholder="Enter Video URL"
                                                className="border p-2 w-full rounded-lg mb-2"
                                                value={newVideoUrl}
                                                onChange={(e) => setNewVideoUrl(e.target.value)}
                                            />
                                        )}

                                        {(selectedContentType === "Document" || selectedContentType === "Image" || selectedContentType === "Import Content" || selectedContentType === "File") && (
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="border p-2 w-full rounded-lg mb-2"
                                            />
                                        )}

                                        {selectedContentType === "Test" && (
                                            <textarea
                                                placeholder="Enter Test Instructions"
                                                className="border p-2 w-full rounded-lg mb-2"
                                                rows={3}
                                            ></textarea>
                                        )}

                                        {/* Save & Cancel Buttons */}
                                        <button
                                            onClick={handleSaveContent}
                                            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="w-full mt-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {activeTab === "FAQ's" && (
                    <div className="p-4 text-gray-600">
                        {/* Title with "Add FAQ" button */}
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold">FAQs</h4>
                            <button
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center"
                                onClick={() => setShowModal(true)}
                            >
                                <Plus className="mr-2 text-2xl" /> Add FAQ
                            </button>
                        </div>

                        {/* FAQ List */}
                        <div>
                            {faqs.length > 0 ? faqs.map(({ id, question, answer, open }) => (
                                <div key={id} className="border-b py-2">
                                    <div
                                        className="flex justify-between items-center cursor-pointer"
                                        onClick={() => handleToggle(id)}
                                    >
                                        <div className="flex items-center">
                                            <CaretRightFill className={`mr-2 transition-transform ${open ? "rotate-90" : ""}`} />
                                            <span>{question}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <PencilSquare className="cursor-pointer" onClick={() => handleEditFaq(id, question, answer)} />
                                            <Trash
                                                className="cursor-pointer text-red-500"
                                                onClick={(e) => handleDeleteFaq(id, e)}
                                            />

                                        </div>
                                    </div>
                                    {open && (
                                        <div className="mt-2">
                                            <p className="p-2 bg-gray-100 rounded">{answer}</p>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p>No FAQs available.</p>
                            )}
                        </div>

                        {/* FAQ Modal */}
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                    <h2 className="text-lg font-bold mb-4">{editingId ? "Edit FAQ" : "Add FAQ"}</h2>

                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded mb-2"
                                        placeholder="Enter FAQ question"
                                        value={newFaq.question}
                                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                    />

                                    <textarea
                                        className="w-full p-2 border rounded mb-2 bg-gray-100"
                                        placeholder="Enter FAQ answer"
                                        value={newFaq.answer}
                                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                    ></textarea>

                                    <div className="flex flex-col sm:flex-row gap-4 my-4">
                                        <button
                                            className="w-full sm:w-1/2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-600"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full sm:w-1/2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                            onClick={() => {
                                                editingId ? handleSaveEdit() : handleAddFaq();
                                                setShowModal(false);
                                            }}
                                        >
                                            {editingId ? "Save" : "Add"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div >
    );
};

export default CourseOverview;
