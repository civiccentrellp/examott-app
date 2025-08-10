
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";
import { apiFetch } from "../fetchApi";


import { Course, CoursePricingOption } from "./getCourses";

function mapGoal(goal: string): Course["goal"] {
  if (goal === "UPSC" || goal === "APPSC" || goal === "TGPSC") {
    return goal;
  }
  return undefined;
}

function mapPricingOptions(
  options: EnrolledCourse["course"]["pricingOptions"]
): CoursePricingOption[] {
  return options.map((o) => ({
    id: o.id,
    title: "", // fallback
    price: o.price,
    discount: o.discount,
    effectivePrice: o.effectivePrice,
    durationInDays: o.durationInDays,
    expiryDate: o.expiryDate,
    promoted: o.promoted,
  }));
}

export function mapEnrolledCourseToCourse(e: EnrolledCourse["course"]): Course {
  return {
    id: e.id,
    name: e.name,
    thumbnail: e.thumbnail ?? "",
    description: e.description ?? "",
    goal: mapGoal(e.goal),
    status: e.status as Course["status"],
    accessType: e.accessType as Course["accessType"],
    pricingOptions: mapPricingOptions(e.pricingOptions),
    videoUrl: "",          
    originalPrice: 0,      
    discountedPrice: 0,    
    startDate: "",        
    endDate: "",           
    duration: "",          
  };
}


export interface Enrollment {
  id: string;
  courseId: string;
  startDate: string;
  endDate: string;
  accessType: string;
  addedByAdmin: boolean;
}

export interface EnrolledCourse {
  id: string;
  startDate: string;
  endDate: string;
  accessType: string;
  addedByAdmin: boolean;
  course: {
    id: string;
    name: string;
    thumbnail?: string;
    description?: string;
    goal: string;
    status: string;
    accessType: string;
    pricingOptions: {
      id: string;
      price: number;
      discount: number;
      effectivePrice: number;
      durationInDays?: number;
      expiryDate?: string;
      promoted: boolean;
    }[];
  };
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments/${userId}`);
  if (!res.ok) throw new Error("❌ Failed to fetch user enrollments");
  return await res.json();
}

export async function getUserEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments/${userId}/courses`);
  if (!res.ok) throw new Error("❌ Failed to fetch user enrolled courses");
  return await res.json();
}

export async function addUserEnrollment(data: {
  userId: string;
  courseId: string;
  pricingOptionId?: string;
  accessType: string;
  startDate?: string;
  endDate?: string;
}): Promise<Enrollment> {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("❌ Failed to add enrollment");
  return await res.json();
}

export async function removeUserEnrollment(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("❌ Failed to delete enrollment");
  return await res.json();
}

export async function updateLastOpenedCourse(userId: string, enrollmentId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments/last-opened-course`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, enrollmentId }),
  });
  if (!res.ok) throw new Error("❌ Failed to update last opened course");
  return await res.json();
}

export async function getLastOpenedCourse(userId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/enrollments/last-opened-course/${userId}`);
  if (!res.ok) throw new Error("❌ Failed to fetch last opened course");
  return await res.json();
}