"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CourseContents from "@/components/courses/Tabs/CourseContentsTab";
import CourseFaqsTab from "@/components/courses/Tabs/CourseFaqsTab";
import CourseOverviewTab from "@/components/courses/Tabs/CourseOverviewTab";
import { getCourseById } from "@/utils/courses/getCourses";

const AdminCoursePage = ({ courseId }: { courseId: string }) => {
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "contents" | "faq">("overview");
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
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

    if (loading)
        return <p className="text-center py-10 text-violet-600 text-lg">Loading course details...</p>;
    if (!course)
        return <p className="text-center py-10 text-gray-500">Course not found.</p>;

    return (
        <div className="w-full h-full flex flex-col gap-2">
            {/* Breadcrumb */}
            <div className="w-full flex items-center gap-12 px-2 py-2">
                <button
                    onClick={() => router.push("/courses")}
                    className="inline-flex items-center text-sm sm:text-base text-violet-700 hover:underline"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button
                        onClick={() => router.push("/courses")}
                        className="hover:text-purple-600 transition"
                    >
                        Courses
                    </button>
                    <span>/</span>
                    <span className="text-gray-900 font-semibold">{course.name}</span>
                    <span>/</span>
                    <span className="text-gray-700 truncate">{activeTab}</span>
                </div>
            </div>

            {/* Tabs + Content (student style) */}
            <div className="bg-violet-50 rounded-t-lg flex flex-col flex-1 overflow-hidden px-2">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                    {[
                        { key: "overview", label: "Overview" },
                        { key: "contents", label: "Contents" },
                         { key: "faq", label: "FAQ" },
                    ].map((tab) => (
                        <li
                            key={tab.key}
                            className={`me-2 rounded-t-2xl transition-colors duration-200 ${activeTab === tab.key
                                ? "bg-white"
                                : "bg-violet-50 rounded-b-[1rem]"
                                }`}
                        >
                            <button
                                onClick={() =>
                                    setActiveTab(tab.key as "overview" | "contents" | "faq" )
                                }
                                className={`inline-block px-4 py-2 rounded-xl m-2 transition-colors duration-200 
                  ${activeTab === tab.key
                                        ? "text-dark bg-violet-300 dark:bg-gray-800 dark:text-blue-500"
                                        : "hover:text-gray-900 hover:bg-white"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-b-lg">
                    {activeTab === "overview" && <CourseOverviewTab />}
                    {activeTab === "contents" && <CourseContents courseId={course.id} openVideoInModal={true} />}
                    {activeTab === "faq" && <CourseFaqsTab courseId={course.id} />}
                </div>
            </div>
        </div>
    );
};

export default AdminCoursePage;
