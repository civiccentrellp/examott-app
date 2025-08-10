"use client";

import { hasRole } from "@/utils/auth/rbac";
import { getCourseById } from "@/utils/courses/getCourses";
import AdminCoursePage from "@/components/courses/admin/AdminCoursePage";
import StudentCoursePage from "@/components/courses/student/StudentCoursePage";
import { useUser } from "@/context/userContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CoursePage() {
  const { user, loading } = useUser();
  const params = useParams();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  console.log(courseId)

  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      const res = await getCourseById(courseId);
      setCourse(res);
    })();
  }, [courseId]);

  if (loading || !course) return <p>Loading...</p>;

  return hasRole(user, "student") ? (
    <StudentCoursePage course ={course} />
  ) : (
    <AdminCoursePage courseId ={courseId} />
  );
}
