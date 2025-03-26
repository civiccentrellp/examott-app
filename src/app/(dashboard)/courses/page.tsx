"use client";

import { Plus } from "react-bootstrap-icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCourses, Course } from "@/lib/getCourses";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        }
        fetchData();
    }, []);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
        <div className="bg-white p-6 rounded-lg w-full max-w-[90%] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[900px] overflow-auto max-h-[90vh]">
            <h1 className="text-xl text-center font-bold mb-2">Create Course</h1>
            <form>
                <label className="block mb-2 text-sm text-gray-600 font-bold">Course Name:</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none text-gray-700"
                    required
                />

                <label className="block mb-2 text-sm text-gray-600 font-bold">Description:</label>
                <textarea
                    className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                    required
                ></textarea>

                {/* Responsive grid layout for small screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm text-gray-600 font-bold">Goal:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-gray-600 font-bold">Video URL:</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm text-gray-600 font-bold">Price:</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm text-gray-600 font-bold">Original Price:</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm text-gray-600 font-bold">Upload Course Image: </label>
                        <input
                            type="file"
                            id="courseImage"
                            className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-sm text-gray-600 font-bold">Start Date:</label>
                            <input type="date" id="courseStartDate" className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none" required />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-gray-600 font-bold">End Date:</label>
                            <input type="date" id="courseEndDate" className="w-full p-2 border border-gray-400 rounded-lg mb-4 outline-none" required />
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
                        <img
                            src={course.thumbnail || "/placeholder.jpg"}
                            alt={course.name}
                            className="w-full object-cover"
                        />

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
                                    Expires on: {course.expiryDate}
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
