"use client";

import { Plus } from "react-bootstrap-icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCourses, Course, addCourse } from "@/lib/getCourses";

export default function CoursesPage() {
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseData, setCourseData] = useState<{
        name: string;
        description: string;
        goal: string;
        videoUrl: string;
        price: string;
        originalPrice: string;
        thumbnail: "";  // Allow File type as well
        startDate: string;
        endDate: string;
        duration: string;
    }>({
        name: "",
        description: "",
        goal: "",
        videoUrl: "",
        price: "",
        originalPrice: "",
        thumbnail: "",
        startDate: "",
        endDate: "",
        duration: ""
    });
    

    useEffect(() => {
        async function fetchData() {
            try {
                const courses = await getCourses();
                console.log("Fetched courses:", courses);
                setCourses(courses);  // No need to access result.data here
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        }
        fetchData();
    }, []);
    

    const calculateDuration = (start: string, end: string): string => {
        if (!start || !end) return "";
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        const diffInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        
        if (diffInMonths < 1) return "Less than a month";
        if (diffInMonths === 1) return "1 month";
        if (diffInMonths < 12) return `${diffInMonths} months`;
        
        const years = Math.floor(diffInMonths / 12);
        const remainingMonths = diffInMonths % 12;
        
        return remainingMonths === 0
            ? `${years} year${years > 1 ? "s" : ""}`
            : `${years} year${years > 1 ? "s" : ""} ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
    };
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourseData((prev) => {
            const updatedData = { ...prev, [name]: value };
            if (name === "startDate" || name === "endDate") {
                updatedData.duration = calculateDuration(updatedData.startDate, updatedData.endDate);
            }
            return updatedData;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const response = await fetch("https://your-upload-endpoint.com/upload", {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            console.log("Uploaded image URL:", data.url);
    
            setCourseData((prev) => ({
                ...prev,
                thumbnail: data.url, // ✅ Store URL instead of File object
            }));
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };
    
    
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const duration = calculateDuration(courseData.startDate, courseData.endDate);
        const sanitizedData = {
            ...courseData,
            originalPrice: parseFloat(courseData.originalPrice),
            discountedPrice: parseFloat(courseData.price), // Assuming price is discounted price
            expiryDate: courseData.endDate, // Matching backend field
        };
    
        try {
            const newCourse = await addCourse(sanitizedData);
            setCourses([...courses, newCourse]);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to add course:", error);
        }
    };
    
    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    

    return (
        <div className="container mx-auto p-6 overflow-y-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
                <button
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    onClick={handleOpenModal}
                >
                    <Plus size={24} />
                    <p>Create Course</p>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-[90%] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] overflow-auto max-h-[90vh]">
                        <h1 className="text-xl text-center font-bold mb-2">
                            Create Course
                        </h1>
                        <form onSubmit={handleSubmit} >
                            <label className="block mb-2 text-sm text-gray-600 font-bold">
                                Course Name:
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none text-gray-700"
                                onChange={handleInputChange} 
                                required
                            />

                            <label className="block mb-2 text-sm text-gray-600 font-bold">
                                Description:
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                name="description"
                                onChange={handleInputChange} 
                                required
                            ></textarea>

                            {/* Responsive grid layout for small screens */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm text-gray-600 font-bold">
                                        Goal:
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                        onChange={handleInputChange} 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm text-gray-600 font-bold">
                                        Video URL:
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                        onChange={handleInputChange} 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm text-gray-600 font-bold">
                                        Price:
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                        onChange={handleInputChange} 
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm text-gray-600 font-bold">
                                        Original Price:
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                        onChange={handleInputChange} 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm text-gray-600 font-bold">
                                        Upload Course Image:{" "}
                                    </label>
                                    <input
                                        type="file"
                                        id="courseImage"
                                        className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                        onChange={handleFileChange} 
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 font-bold">
                                            Start Date:
                                        </label>
                                        <input
                                            type="date"
                                            id="courseStartDate"
                                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                            onChange={handleInputChange} 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-sm text-gray-600 font-bold">
                                            End Date:
                                        </label>
                                        <input
                                            type="date"
                                            id="courseEndDate"
                                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                                            onChange={handleInputChange} 
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 my-4">
                                <button
                                    type="submit"
                                    className="w-full sm:w-1/2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="w-full sm:w-1/2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                {courses.map((course: Course) => (
                    <div
                        key={course.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                    >

                        {/* Course Thumbnail */}
                        <div className="relative w-full pt-[56.25%] bg-gray-200 overflow-hidden">
                            <img
                                src={course.thumbnail || "/placeholder.jpg"}
                                alt={course.name}
                                className="absolute top-0 left-0 w-full h-full object-fit"
                            />
                        </div>


                        {/* Course Details */}
                        <div className="p-4 flex flex-col items-center">
                            <h2 className="text-lg font-semibold text-gray-900 my-4">
                                {course.name}
                            </h2>

                            <div className="flex justify-between w-full">
                                {/* Price & Discount */}
                                <p className="text-gray-700">
                                    <span className="font-bold text-green-600">
                                        ${course.discountedPrice}
                                    </span>{" "}
                                    <span className="line-through text-gray-500">
                                        ${course.originalPrice}
                                    </span>
                                </p>

                                {/* Expiry Date */}
                                <p className="text-sm text-gray-500">
                                    Expires on: {course.endDate}
                                </p>
                            </div>

                            {/* Explore Button */}
                            <Link
                                className="w-full"
                                href={`/courses/course-overview/${course.id}`}
                            >
                                <button className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-600">
                                    Explore
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
