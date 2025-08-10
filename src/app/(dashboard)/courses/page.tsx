// "use client";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { getCourses, Course } from "@/utils/courses/getCourses";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { hasRole } from "@/utils/auth/rbac";
// import VisibilityCheck from "@/components/VisibilityCheck";
// import { useUser } from "@/context/userContext";
// import { SearchIcon, ArrowRight } from "lucide-react";
// import CreateCourseModal from "@/components/courses/CourseCreation/CreateCourseModal";
// import { useCreateRazorpayOrder, useVerifyRazorpaySignature } from "@/hooks/payments/useRazorpay";
// import Script from "next/script";
// import { useUserEnrollments, useUserEnrolledCourses, useLastOpenedCourse, useUpdateLastOpenedCourse } from "@/hooks/courses/useCourseEnrollments";
// import { mapEnrolledCourseToCourse } from "@/utils/courses/courseEnrollments";
// import { useCourseProgressSummary } from "@/hooks/courses/useCourseContentProgress";


// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

// export default function CoursesPage() {
//     const { user, loading } = useUser();
//     const router = useRouter();
//     const [courses, setCourses] = useState<Course[]>([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");

//     const createOrderMutation = useCreateRazorpayOrder();
//     const verifySignatureMutation = useVerifyRazorpaySignature();
//     const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
//     const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
//     const { data: enrolledCoursesFull } = useUserEnrolledCourses(user?.id || "", !!user?.id);
//     const { data: enrollments } = useUserEnrollments(user?.id || "", !!user?.id);
//     const { data: lastOpenedCourse } = useLastOpenedCourse(user?.id || "", !!user?.id);
//     const updateLastOpenedMutation = useUpdateLastOpenedCourse();
//     const lastOpenedCourseId = lastOpenedCourse?.id;  // safe check
//     const { data: progressSummary } = useCourseProgressSummary(lastOpenedCourseId || "");
//     const completion = progressSummary?.percentage ?? 0;


//     const handleCourseOpen = (courseId: string) => {
//         if (user?.id && enrollments) {
//             const enrollment = enrollments.find((e) => e.courseId === courseId);
//             if (enrollment) {
//                 updateLastOpenedMutation.mutate({
//                     userId: user.id,
//                     enrollmentId: enrollment.id,
//                 });
//             }
//         }
//         // router.push(`/courses/course-overview/${courseId}`);
//         // router.push(`/courses/${courseId}`);
//         const isEnrolled = enrolledCourses.includes(courseId);
//         router.push(`/courses/${courseId}?enrolled=${isEnrolled}`);
//     };

//     useEffect(() => {
//         if (enrollments) {
//             setEnrolledCourses(enrollments.map((e) => e.courseId));
//         }
//     }, [enrollments]);


//     useEffect(() => {
//         async function fetchData() {
//             try {
//                 const courses = await getCourses();
//                 setCourses(courses);
//             } catch (error) {
//                 console.error("Error fetching courses:", error);
//                 toast.error("Failed to load courses");
//             }
//         }
//         fetchData();
//     }, []);

//     if (loading) return <p>Loading...</p>;

//     const formatDateToDDMMYY = (dateStr: string): string => {
//         if (!dateStr) return "";
//         const date = new Date(dateStr);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = String(date.getFullYear()).slice(-2);
//         return `${day}-${month}-${year}`;
//     };

//     const handleSearch = (value: string) => {
//         setSearchTerm(value.toLowerCase());
//     };

//     const getCoursePrice = (course: Course) => {
//         if (!course.pricingOptions || course.pricingOptions.length === 0) return null;
//         const plan = course.pricingOptions.find((p) => p.promoted) || course.pricingOptions[0];
//         return {
//             price: plan.price,
//             discount: plan.discount,
//             effectivePrice: plan.effectivePrice ?? plan.price - (plan.discount || 0),
//             pricingOptionId: plan.id,
//         };
//     };

//     const getExpiryInfo = (course: Course) => {
//         const pricing = course.pricingOptions?.[0];

//         if (course.accessType === "SINGLE" && pricing?.durationInDays) {
//             const years = (pricing.durationInDays / 365).toFixed(1).replace(/\.0$/, "");
//             return `${years} year${Number(years) > 1 ? "s" : ""}`;
//         }
//         if (course.accessType === "MULTIPLE") {
//             const months = pricing?.durationInDays
//                 ? Math.round(pricing.durationInDays / 30)
//                 : null;
//             return months ? `${months} month${months > 1 ? "s" : ""}` : "Multiple validity options";
//         }
//         if (course.accessType === "EXPIRY_DATE" && pricing?.expiryDate)
//             return `${formatDateToDDMMYY(pricing.expiryDate)}`;
//         if (course.accessType === "LIFETIME") return "Unlimited";

//         return "";
//     };

//     const handleBuyNow = async (
//         e: React.MouseEvent<HTMLButtonElement>,
//         courseId: string,
//         pricingOptionId: string
//     ) => {
//         e.stopPropagation();
//         try {

//             if (!user?.id) {
//                 toast.error("Please login to continue");
//                 return;
//             }
//             if (!pricingOptionId) {
//                 toast.error("Pricing option not available");
//                 return;
//             }

//             const { order } = await createOrderMutation.mutateAsync({
//                 userId: user.id,
//                 courseId,
//                 pricingOptionId,
//             });

//             if (!order) {
//                 toast.error("Unable to create payment order");
//                 return;
//             }

//             // 2. Open Razorpay Checkout
//             const options = {
//                 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//                 amount: order.amount,
//                 currency: order.currency,
//                 name: "ExamOtt",
//                 description: "Course Purchase",
//                 order_id: order.id,
//                 handler: async function (response: any) {
//                     try {
//                         await verifySignatureMutation.mutateAsync({
//                             razorpay_order_id: response.razorpay_order_id,
//                             razorpay_payment_id: response.razorpay_payment_id,
//                             razorpay_signature: response.razorpay_signature,
//                         });
//                         toast.success("Payment successful, course enrolled!");
//                         router.push(`/courses/course-overview/${courseId}`);
//                     } catch (err) {
//                         toast.error("Payment verification failed");
//                     }
//                 },
//                 prefill: {
//                     name: user?.name,
//                     email: user?.email,
//                 },
//                 theme: { color: "#7C3AED" },
//             };

//             const rzp = new window.Razorpay(options);
//             rzp.open();
//         } catch (err) {
//             toast.error("Failed to initiate payment");
//         }
//     };

//     return (
//         <>
//             {/* Razorpay script */}
//             <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

//             <div className="mx-auto lg:p-2">
//                 {/* Header Section */}
//                 <div className="flex justify-between items-center mb-3 gap-1 lg:px-3">
//                     <div className="flex items-center bg-white w-full pl-4 sm:py-1 border border-gray-300 rounded-4 focus:outline-none focus:ring-2 focus:ring-violet-500">
//                         <span><SearchIcon color="gray" size={20} /></span>
//                         <div className="w-px h-6 bg-gray-300 mx-3" />
//                         <input
//                             type="text"
//                             placeholder="Search courses..."
//                             onChange={(e) => handleSearch(e.target.value)}
//                             className="bg-transparent border-none w-full focus:outline-none focus:ring-0 focus:shadow-none appearance-none"
//                         />
//                         <VisibilityCheck user={user} check="student" checkType="role">
//                             <Button
//                                 className="flex items-center gap-3 px-3 h-6 bg-white text-gray-600 border-l border-gray-300 rounded-0 font-semibold hover:scale-105 transition-all duration-200"
//                                 onClick={() => setShowEnrolledOnly((prev) => !prev)}
//                             >
//                                 <p>{showEnrolledOnly ? "Show All" : "Enrollments"}</p>
//                                 <ArrowRight size={24} />
//                             </Button>

//                         </VisibilityCheck>
//                         <VisibilityCheck user={user} check="course.create" checkType="permission">
//                             <Button
//                                 className="flex items-center gap-3 h-6 bg-white text-gray-600 border-l border-gray-200 rounded-0 font-semibold hover:scale-105 transition-all duration-200"
//                                 onClick={() => setIsModalOpen(true)}
//                             >
//                                 <p>Create Course</p>
//                                 <ArrowRight size={24} />
//                             </Button>
//                         </VisibilityCheck>
//                     </div>
//                 </div>

//                 <CreateCourseModal
//                     isOpen={isModalOpen}
//                     onClose={() => setIsModalOpen(false)}
//                     onSuccess={(newCourse) => setCourses((prev) => [...prev, newCourse])}
//                 />

//                 {/* Courses Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-3 overflow-y-auto max-h-[80vh] lg:p-4 pb-24">
//                     <VisibilityCheck user={user} check="student" checkType="role">
//                         {lastOpenedCourse && (() => {
//                             const isEnrolled = enrolledCourses.includes(lastOpenedCourse.id);

//                             return (
//                                 <div
//                                     className="col-span-full relative flex flex-row items-center gap-3 sm:gap-5  bg-white border rounded-2xl p-3 cursor-pointer mb-2 hover:shadow-2xl transition-all duration-300 group"
//                                     onClick={() => router.push(`/courses/${lastOpenedCourse.id}?enrolled=${isEnrolled}`)}

//                                 >
//                                     <img
//                                         src={lastOpenedCourse.thumbnail || "/placeholder.jpg"}
//                                         alt={lastOpenedCourse.name}
//                                         className="w-40 h-24 sm:w-60 sm:h-32 object-cover rounded-xl border border-gray-300 shadow-md group-hover:scale-105 transition-transform"
//                                     />

//                                     <div className="flex-1 w-full flex flex-col gap-2">
//                                         <h2 className="text-xs sm:text-lg text-start font-semibold text-gray-900 sm:my-2 line-clamp-2">
//                                             {lastOpenedCourse.name}
//                                         </h2>

//                                         {/* Dynamic Progress Bar */}
//                                         <div className="relative w-full h-1 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
//                                             <div
//                                                 className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-500 rounded-full transition-all duration-700 ease-out"
//                                                 style={{ width: `${completion}%` }}
//                                             />
//                                         </div>
//                                         <span className="text-xs font-semibold text-gray-600 mt-1">
//                                             {completion}%
//                                         </span>

//                                         <div className="flex items-center sm:justify-end gap-2 mt-2">
//                                             <p className="text-xs sm:text-sm text-gray-500">Resume learning</p>
//                                             <span className="flex items-center justify-center rounded-full hover:scale-110 transition">
//                                                 <ArrowRight size={18} />
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })()}
//                     </VisibilityCheck>


//                     {
//                         (showEnrolledOnly
//                             ? (enrolledCoursesFull || []).map((e) => mapEnrolledCourseToCourse(e.course))
//                             : courses
//                         )
//                             .filter((course) => course.name.toLowerCase().includes(searchTerm))
//                             .map((course) => {
//                                 const pricing = getCoursePrice(course);
//                                 return (
//                                     <div
//                                         key={course.id}
//                                         className="flex flex-row justify-between sm:block bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden group border border-gray-100 p-3 mb-2 cursor-pointer"
//                                         onClick={() => handleCourseOpen(course.id)}

//                                     >
//                                         <div className="relative w-40 h-24 flex items-center justify-center sm:w-full sm:pt-[56%] bg-gray-200 overflow-hidden rounded-2xl">
//                                             <img
//                                                 src={course.thumbnail || "/placeholder.jpg"}
//                                                 alt={course.name}
//                                                 className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-300 rounded-2xl"
//                                             />
//                                         </div>

//                                         <div className="w-2/4 sm:w-full pt-2 flex flex-col items-center">
//                                             <div className="relative group w-full">
//                                                 <h2 className="w-full text-xs sm:text-sm text-start font-semibold text-gray-900 sm:my-2 line-clamp-2 sm:line-clamp-1">
//                                                     {course.name}
//                                                 </h2>
//                                                 <div className="absolute w-full right-0 bottom-100 mb-1 hidden group-hover:block bg-gray-100 text-black text-center text-sm rounded px-2 py-2 overflow-wrap z-10">
//                                                     {course.name}
//                                                 </div>
//                                             </div>

//                                             <div className="flex flex-row justify-around w-full items-center gap-2">
//                                                 <p className="text-gray-700 flex items-center">
//                                                     {pricing ? (
//                                                         <>
//                                                             <span className=" text-xs font-medium sm:text-sm sm:font-bold text-green-600 mx-2">
//                                                                 ₹{pricing.effectivePrice}
//                                                             </span>
//                                                             {pricing.discount > 0 && (
//                                                                 <span className="line-through text-xs text-gray-500">
//                                                                     ₹{pricing.price}
//                                                                 </span>
//                                                             )}
//                                                         </>
//                                                     ) : (
//                                                         <span className="text-gray-500">No Pricing</span>
//                                                     )}
//                                                 </p>
//                                                 <p className="text-xs sm:text-sm font-medium text-gray-900 py-1 px-2 rounded-2">
//                                                     {getExpiryInfo(course)}
//                                                 </p>
//                                             </div>

//                                             <div className="w-full mt-1 sm:mt-3 flex flex-row gap-2">
//                                                 {hasRole(user, "student") ? (
//                                                     enrolledCourses.includes(course.id) ? (
//                                                         <span className="flex-1 text-center text-green-500 font-medium bg-green-50 rounded-lg border-1 border-green-500 lg:py-2">
//                                                             Purchased
//                                                         </span>
//                                                     ) : (
//                                                         // <button
//                                                         //     onClick={(e) => handleBuyNow(e, course.id, pricing?.pricingOptionId || "")}
//                                                         //     className="flex-1 text-center text-violet-500 font-medium bg-violet-50 rounded-lg border-1 border-violet-500 shadow-md px-3 lg:py-2 hover:bg-violet-300 transition-all duration-200"
//                                                         // >
//                                                         //     Buy Now
//                                                         // </button>

//                                                         <button
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 toast.info("Redirecting to Instamojo. Please take screenshot after payment.");

//                                                                 setTimeout(() => {
//                                                                     window.open("https://www.instamojo.com/@CivicCentre", "_blank");
//                                                                     router.push(`/courses/payment-confirmation?courseId=${course.id}`);
//                                                                 }, 1500); // 1.5 sec delay so user sees message
//                                                             }}
//                                                             className="flex-1 text-center text-violet-500 font-medium bg-violet-50 rounded-lg border-1 border-violet-500 shadow-md px-3 lg:py-2 hover:bg-violet-300 transition-all duration-200"
//                                                         >
//                                                             Buy Now
//                                                         </button>

//                                                     )
//                                                 ) : (
//                                                     <span className="w-full flex justify-between items-center">
//                                                         <div
//                                                             className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${course.status === "UNPUBLISHED" || course.status === "EXPIRED"
//                                                                 ? "bg-gray-50 text-gray-700 border border-gray-300"
//                                                                 : "bg-green-50 text-black border-1 border-green-300"
//                                                                 }`}
//                                                         >
//                                                             {course.status === "UNPUBLISHED"
//                                                                 ? "Unpublished"
//                                                                 : course.status === "EXPIRED"
//                                                                     ? "Expired"
//                                                                     : "Published"}
//                                                         </div>
//                                                         <div className="px-3 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-300">
//                                                             <p>{course.goal}</p>
//                                                         </div>
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                 </div>
//             </div>
//         </>
//     );
// }

import CoursePage from "@/components/courses/CoursePage";

export default function Page() {
  return <CoursePage />;
}
