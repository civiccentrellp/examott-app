import { NextResponse } from "next/server";
import { courses } from "@/lib/courses"; // ✅ Import centralized data

export async function GET() {
    return NextResponse.json(courses);
}
