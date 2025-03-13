type Course = {
    id: number;
    name: string;
    duration: string;
};

async function getCourses(): Promise<Course[]> {
    const res = await fetch("http://localhost:3000/api/courses", { cache: "no-store" });
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
