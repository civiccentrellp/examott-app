type Course = {
    id: number;
    name: string;
    duration: string;
};

async function getCourses(): Promise<Course[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const res = await fetch(`${apiBaseUrl}/api/courses`, { cache: "no-store" });

    if (!res.ok) {
        throw new Error("Failed to fetch courses");
    }

    return res.json();
}


export default async function CoursesPage() {
    const courses: Course[] = await getCourses();

    return (
        <div>
            <h1>Courses</h1>
            <ul>
                {courses.map((course: Course) => (
                    <li key={course.id}>{course.name} - {course.duration}</li>
                ))}
            </ul>
        </div>
    );
}
