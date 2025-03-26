import { NextResponse } from "next/server";
import { courses } from "@/lib/courses"; // ✅ Import centralized data

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const course = courses.find(c => c.id.toString() === params.id);
    
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    return NextResponse.json(course);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const updatedData = await req.json();
        const courseIndex = courses.findIndex(c => c.id.toString() === params.id);

        if (courseIndex === -1) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Update the course
        courses[courseIndex] = { ...courses[courseIndex], ...updatedData };

        return NextResponse.json(courses[courseIndex]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
    }
}
