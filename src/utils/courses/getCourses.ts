import moment from "moment";
import { apiFetch } from "../fetchApi";

export type Course = {
  id: string;
  name: string;
  description: any;
  goal?: "UPSC" | "APPSC" | "TGPSC";
  thumbnail: string;
  videoUrl: string;
  originalPrice: number;
  discountedPrice: number;
  startDate: string;
  endDate: string;
  duration: string;
  accessType: AccessType;
  pricingOptions?: CoursePricingOption[];
  status: "UNPUBLISHED" | "PUBLISH_PUBLIC" | "PUBLISH_PRIVATE" | "EXPIRED";
};

export type CourseStatus = "UNPUBLISHED" | "PUBLISH_PUBLIC" | "PUBLISH_PRIVATE" | "EXPIRED";

export type AccessType = "SINGLE" | "MULTIPLE" | "LIFETIME" | "EXPIRY_DATE";

export interface Installment {
  title: string;
  amount: number;
  dueDate: string;
}

export interface CoursePricingOption {
  id: string;
  title: string;
  price: number;
  discount: number;
  durationInDays?: number;
  expiryDate?: string;
  promoted?: boolean;
  effectivePrice: number;
  installments?: Installment[];
}

export type ContentType = "Folder" | "Video" | "Test" | "Document" | "Image" | "Import Content" | "File";

export interface ContentItem {
  id: string;
  name: string;
  type: ContentType;
  children: ContentItem[];
  url?: string;
  isDownloadable?: boolean;
}


export function formatDate(dateString: string, format = "YYYY-MM-DD"): string {
  return moment(dateString).isValid() ? moment(dateString).format(format) : "";
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export async function addCourse(courseData: Partial<Course>) {
  try {
    const sanitizedData = {
      name: courseData.name,
      description: courseData.description,
      thumbnail: courseData.thumbnail || "default-thumbnail.jpg",
      videoUrl: courseData.videoUrl || null,
      goal: courseData.goal || null,
      originalPrice: parseFloat(courseData.originalPrice as any) || 0,
      discountedPrice: parseFloat(courseData.discountedPrice as any) || 0,
      startDate: courseData.startDate || null,
      endDate: courseData.endDate || null,
      status: courseData.status || "UNPUBLISHED",
      accessType: courseData.accessType || "SINGLE",
      pricingOptions: courseData.pricingOptions?.map((option) => ({
        title: option.title,
        price: parseFloat(option.price as any),
        discount: parseFloat(option.discount as any),
        durationInDays: option.durationInDays || null,
        expiryDate: option.expiryDate ? new Date(option.expiryDate).toISOString() : null,
        promoted: option.promoted ?? false,
        installments: option.installments?.map(inst => ({
          title: inst.title,
          amount: parseFloat(inst.amount as any),
          dueDate: new Date(inst.dueDate).toISOString(),
        })) || []
      })),
    };

    const response = await apiFetch(`${apiBaseUrl}/api/courses`, {
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
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/courses`, { cache: "no-store" });

    if (!res.ok) {
      console.error("API request failed:", res.status, res.statusText);
      throw new Error("Failed to apiFetch courses");
    }

    const result = await res.json();
    if (!Array.isArray(result.data)) return [];

    return result.data.map((course: Course) => ({
      ...course,
      startDate: formatDate(course.startDate),
      endDate: formatDate(course.endDate),
    }));
  } catch (error) {
    console.error("Error in getCourses:", error);
    return [];
  }
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to apiFetch course with id ${courseId}`);
    }

    const result = await res.json();
    if (!result.data) return null;

    const course: Course = result.data;

    return {
      ...course,
      startDate: formatDate(course.startDate),
      endDate: formatDate(course.endDate),
    };
  } catch (error) {
    console.error("Error in getCourseById:", error);
    return null;
  }
}

export async function updateCourse(courseId: string, courseData: Partial<Course>) {
  const cleanedData = {
    ...courseData,
    // pricingOptions: courseData.pricingOptions?.map(option => ({
    //   title: option.title,
    //   price: parseFloat(option.price as any),
    //   discount: parseFloat(option.discount as any),
    //   durationInDays: option.durationInDays || null,
    //   expiryDate: option.expiryDate ? new Date(option.expiryDate).toISOString() : null,
    //   promoted: option.promoted ?? false,
    //   installments: option.installments?.map(inst => ({
    //     title: inst.title,
    //     amount: parseFloat(inst.amount as any),
    //     dueDate: new Date(inst.dueDate).toISOString(),
    //   })) || []
    // }))

    pricingOptions: courseData.pricingOptions?.map(option => ({
      title: option.title,
      price: parseFloat(option.price as any),
      discount: parseFloat(option.discount as any),
      durationInDays: option.durationInDays || null,
      expiryDate:
        option.expiryDate && !isNaN(Date.parse(option.expiryDate))
          ? new Date(option.expiryDate).toISOString()
          : null,
      promoted: option.promoted ?? false,
      installments: option.installments?.map(inst => ({
        title: inst.title,
        amount: parseFloat(inst.amount as any),
        dueDate:
          inst.dueDate && !isNaN(Date.parse(inst.dueDate))
            ? new Date(inst.dueDate).toISOString()
            : null,
      })) || [],
    }))

  };

  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}`, {
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

export async function deleteCourse(courseId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to delete course");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}


// ---------- COURSE CONTENT FOLDERS ----------
export async function fetchFolders(courseId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/folders`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createFolder(courseId: string, name: string, parentId?: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function updateFolder(folderId: string, name: string, parentId?: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/folders/${folderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId }),
  });
  return await res.json();
}

export async function deleteFolder(folderId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/folders/${folderId}`, {
    method: "DELETE",
  });
  return await res.json();
}

// ---------- COURSE CONTENT ITEMS ----------
export async function fetchContents(courseId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/contents`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createContent(courseId: string, data: any) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/${courseId}/contents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();

  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function updateContent(contentId: string, data: any) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/contents/${contentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteContent(contentId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/courses/contents/${contentId}`, {
    method: "DELETE",
  });
  return await res.json();
}

export function getProxiedPdfUrl(firebaseUrl: string): string {
  return `${apiBaseUrl}/api/courses/proxy-pdf?url=${encodeURIComponent(firebaseUrl)}`;
}


