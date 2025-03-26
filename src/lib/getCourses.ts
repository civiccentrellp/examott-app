export type Course = {
    id: number;
    name: string;
    duration: string;
    thumbnail: string;
    originalPrice: number;
    discountedPrice: number;
    expiryDate: string;
};

export async function getCourses(): Promise<Course[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const res = await fetch(`${apiBaseUrl}/api/courses`, { cache: "no-store" });

    if (!res.ok) {
        throw new Error("Failed to fetch courses");
    }

    return res.json();
}
