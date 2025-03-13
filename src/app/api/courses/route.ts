import { NextResponse } from "next/server";

export async function GET() {
    const courses = [
        { id: 1, name: "UPSC Course", duration: "6 months" },
        { id: 2, name: "TGPSC Course", duration: "4 months" },
        { id: 3, name: "APPSC Course", duration: "5 months" },
    ];
    return NextResponse.json(courses);
}
