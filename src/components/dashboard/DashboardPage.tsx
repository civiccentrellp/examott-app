"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Clock, BookOpen, Search, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getCourses, Course } from "@/utils/courses/getCourses";
import { hasRole } from "@/utils/auth/rbac";
import VisibilityCheck from "@/components/VisibilityCheck";
import CreateCourseModal from "@/components/courses/CourseCreation/CreateCourseModal";
import { mapEnrolledCourseToCourse } from "@/utils/courses/courseEnrollments";
import { useUserEnrollments, useUserEnrolledCourses, useLastOpenedCourse, useUpdateLastOpenedCourse } from "@/hooks/courses/useCourseEnrollments";
import { useCourseProgressSummary } from "@/hooks/courses/useCourseContentProgress";
import { useFreeMaterials } from "@/hooks/freeMaterial/useFreeMaterial";
import { useUser } from "@/context/userContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  // Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const { data: enrollments } = useUserEnrollments(user?.id || "", !!user?.id);
  const { data: lastOpenedCourse } = useLastOpenedCourse(user?.id || "", !!user?.id);
  const updateLastOpenedMutation = useUpdateLastOpenedCourse();
  const lastOpenedCourseId = lastOpenedCourse?.id;
  const { data: progressSummary } = useCourseProgressSummary(lastOpenedCourseId || "");
  const completion = progressSummary?.percentage ?? 0;

  // derive enrolled course ids
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  useEffect(() => {
    if (enrollments) {
      setEnrolledCourseIds(enrollments.map((e) => e.courseId));
    }
  }, [enrollments]);

  // fetch courses
  useEffect(() => {
    (async () => {
      try {
        const list = await getCourses();
        setCourses(list);
      } catch (err) {
        console.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
      }
    })();
  }, []);

  // helpers
  const handleSearch = (v: string) => setSearchTerm(v.toLowerCase());

  const formatDateToDDMMYY = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const getCoursePrice = (course: Course) => {
    if (!course.pricingOptions || course.pricingOptions.length === 0) return null;
    const plan = course.pricingOptions.find((p) => p.promoted) || course.pricingOptions[0];
    return {
      price: plan.price,
      discount: plan.discount,
      effectivePrice: plan.effectivePrice ?? plan.price - (plan.discount || 0),
      pricingOptionId: plan.id,
    };
  };

  const getExpiryInfo = (course: Course) => {
    const pricing = course.pricingOptions?.[0];
    if (course.accessType === "SINGLE" && pricing?.durationInDays) {
      const years = (pricing.durationInDays / 365).toFixed(1).replace(/\.0$/, "");
      return `${years} year${Number(years) > 1 ? "s" : ""}`;
    }
    if (course.accessType === "MULTIPLE") {
      const months = pricing?.durationInDays ? Math.round(pricing.durationInDays / 30) : null;
      return months ? `${months} month${months > 1 ? "s" : ""}` : "Multiple validity options";
    }
    if (course.accessType === "EXPIRY_DATE" && pricing?.expiryDate) return `${formatDateToDDMMYY(pricing.expiryDate)}`;
    if (course.accessType === "LIFETIME") return "Unlimited";
    return "";
  };

  const week = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - day);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        key: d.toISOString().slice(0, 10),
        date: d.getDate(),
        label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()],
        isToday: d.toDateString() === new Date().toDateString(),
      };
    });
  }, []);

  // derived UI list
  const filteredCourses = courses
    .filter((c) => (showEnrolledOnly ? enrolledCourseIds.includes(c.id) : true))
    .filter((c) => (searchTerm ? c.name.toLowerCase().includes(searchTerm) : true));

  return (
    <div className="h-[90vh]  md:px-6 lg:px-10  overflow-y-auto pb-24">
      {/* Futuristic top strip */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-3xl pointer-events-none bg-[radial-gradient(closest-side,_rgba(124,58,237,0.15),_transparent_70%)]" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4  p-4 md:p-6 ">
          <div>
            <h1 className="text-2xl md:text-3xl text-violet-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">
              Your learning cockpit. Resume where you left off or explore fresh tracks.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/courses">
              <Button className="h-9 rounded-xl border-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]">
                Browse Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/freematerials">
              <Button variant="outline" className="h-9 rounded-xl border-violet-300 text-violet-800 hover:bg-violet-50">
                Take a Test
              </Button>
            </Link>

          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search + filters */}
        <section className="lg:col-span-2 relative rounded-2xl border border-violet-200/60 bg-white/70 backdrop-blur-xl p-4 md:p-6 shadow-[0_8px_30px_rgba(99,102,241,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search courses…"
                className="w-full rounded-xl border border-violet-200 bg-white/60 px-10 py-2.5 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500" />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
              />
              Show enrolled only
            </label>
          </div>

          {/* Stat pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/70 px-3 py-1 text-xs text-violet-800">
              <Layers className="h-3.5 w-3.5" />
              Total courses: {courses.length}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/70 px-3 py-1 text-xs text-violet-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Enrolled: {enrolledCourseIds.length}
            </span>
          </div>
        </section>

        {/* Calendar card */}
        <section className="rounded-2xl border border-violet-200/60 bg-white/70 backdrop-blur-xl p-4 md:p-6 shadow-[0_8px_30px_rgba(99,102,241,0.06)] relative overflow-hidden">
          <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-violet-200/30 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-200/30 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-violet-700" />
              <h2 className="text-lg font-semibold text-violet-900">This week</h2>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {week.map((d) => (
                <div
                  key={d.key}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all ${d.isToday
                    ? "bg-gradient-to-b from-violet-600 to-indigo-600 text-white border-transparent shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
                    : "bg-white/80 text-gray-700 border-violet-200"
                    }`}
                >
                  <span className={`text-[10px] ${d.isToday ? "opacity-90" : "text-gray-500"}`}>{d.label}</span>
                  <span className="text-lg font-semibold leading-none">{d.date}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-violet-200/70 bg-violet-50/70 p-3 text-sm text-violet-900">
              Tip: Block your mock tests here so future-you says thanks.
            </div>
          </div>
        </section>
      </div>

      <VisibilityCheck user={user} check="student" checkType="role">
        {lastOpenedCourse && (() => {
          const isEnrolled = enrolledCourseIds.includes(lastOpenedCourse.id);

          return (
            <div
              className="mt-6 col-span-full relative flex flex-row items-center gap-3 sm:gap-5  bg-white border rounded-2xl p-3 cursor-pointer mb-2 hover:shadow-2xl transition-all duration-300 group"
              onClick={() => router.push(`/courses/${lastOpenedCourse.id}?enrolled=${isEnrolled}`)}

            >
              <img
                src={lastOpenedCourse.thumbnail || "/placeholder.jpg"}
                alt={lastOpenedCourse.name}
                className="w-40 h-24 sm:w-60 sm:h-32 object-cover rounded-xl border border-gray-300 shadow-md group-hover:scale-105 transition-transform"
              />

              <div className="flex-1 w-full flex flex-col gap-2">
                <h2 className="text-xs sm:text-lg text-start font-semibold text-gray-900 sm:my-2 line-clamp-2">
                  {lastOpenedCourse.name}
                </h2>

                <div className="relative w-full h-1 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 mt-1">
                  {completion}%
                </span>

                <div className="flex items-center sm:justify-end gap-2 mt-2">
                  <p className="text-xs sm:text-sm text-gray-500">Resume learning</p>
                  <span className="flex items-center justify-center rounded-full hover:scale-110 transition">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </VisibilityCheck>


      {/* Course gallery */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base md:text-lg font-semibold text-violet-900">Explore</h3>
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-1 text-violet-600 text-xs hover:text-violet-800 transition"
          >
            View All →
          </button>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-violet-200/70 bg-white/70 backdrop-blur-xl p-8 text-center text-gray-600">
            No courses match your search.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {filteredCourses.slice(0, 3).map((course) => {
              const price = getCoursePrice(course);
              const enrolled = enrolledCourseIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group border border-gray-100 p-3 cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}?enrolled=${enrolled}`)}
                >
                  <div className="relative w-full pt-[56%] bg-gray-200 overflow-hidden rounded-2xl">
                    <img
                      src={course.thumbnail || "/placeholder.jpg"}
                      alt={course.name}
                      className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
                    />
                  </div>

                  <div className="pt-2">
                    <h2 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {course.name}
                    </h2>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-700">
                        {price ? (
                          <>
                            <span className="text-sm font-bold text-green-600">
                              ₹{price.effectivePrice}
                            </span>
                            {price.discount > 0 && (
                              <span className="line-through text-xs text-gray-500 ml-1">
                                ₹{price.price}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">No Pricing</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-900">{getExpiryInfo(course)}</p>
                    </div>

                    <div className="mt-2">
                      {hasRole(user, "student") ? (
                        enrolled ? (
                          <span className="block text-center text-green-500 font-medium bg-green-50 rounded-lg border border-green-500 py-1">
                            Purchased
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user?.id) {
                                toast.error("Please login to continue");
                                return;
                              }
                              router.push(`/payments?courseId=${course.id}`);
                            }}
                            className="block w-full text-center text-violet-500 font-medium bg-violet-50 rounded-lg border border-violet-500 py-1 hover:bg-violet-300 transition-all duration-200"
                          >
                            Buy Now
                          </button>
                        )
                      ) : (
                        <span className="w-full flex justify-between items-center">
                          <div
                            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${course.status === "UNPUBLISHED" || course.status === "EXPIRED"
                              ? "bg-gray-50 text-gray-700 border border-gray-300"
                              : "bg-green-50 text-black border-1 border-green-300"
                              }`}
                          >
                            {course.status === "UNPUBLISHED"
                              ? "Unpublished"
                              : course.status === "EXPIRED"
                                ? "Expired"
                                : "Published"}
                          </div>
                          <div className="px-3 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-300">
                            <p>{course.goal}</p>
                          </div>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
