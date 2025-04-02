export type Course = {
    id: number;
    name: string;
    duration: string;
    thumbnail: string;
    originalPrice: number;
    discountedPrice: number;
    startDate: string;
    endDate: string;
};

export async function addCourse(courseData: any) {
    try {
        const sanitizedData = {
            name: courseData.name,
            description: courseData.description,
            thumbnail: courseData.thumbnail || "default-thumbnail.jpg",
            videoUrl: courseData.videoUrl || null,
            originalPrice: parseFloat(courseData.originalPrice) || 0,
            discountedPrice: parseFloat(courseData.discountedPrice) || 0,
            expiryDate: courseData.expiryDate || null,
            status: courseData.status || "active",
        };

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";
        const response = await fetch(`${apiBaseUrl}/api/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sanitizedData),
        });

        if (!response.ok) {
            throw new Error("Failed to add course");
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding course:", error);
        throw error;
    }
}

export async function getCourses(): Promise<Course[]> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    try {
        const res = await fetch(`${apiBaseUrl}/api/courses`, { cache: "no-store" });

        if (!res.ok) {
            console.error("API request failed:", res.status, res.statusText);
            throw new Error("Failed to fetch courses");
        }

        const result = await res.json();
        console.log("API Response:", result);

        // Ensure `result.data` is an array, otherwise return an empty array
        return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Error in getCourses:", error);
        return []; // Return an empty array to prevent crashes
    }
}




export async function updateCourse(courseId: number, courseData: Partial<Course>) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    const cleanedData = Object.fromEntries(
        Object.entries(courseData).map(([key, value]) => [key, value ?? null]) // Replace undefined with null
    );

    const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
    });

    if (!res.ok) {
        throw new Error("Failed to update course");
    }

    return res.json();
}


