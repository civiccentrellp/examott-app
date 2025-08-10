// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { getCourseById } from "@/utils/courses/getCourses";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// interface Installment {
//     id: string;
//     label: string;
//     amount: number;
//     dueDate: string;
//     isPaid: boolean;
// }

// export default function PaymentPage() {
//     const router = useRouter();
//     const params = useSearchParams();
//     const courseId = params.get("courseId");
//     const [course, setCourse] = useState<any>(null);
//     const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
//     const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!courseId) return;
//         getCourseById(courseId).then((data) => {
//             setCourse(data);

//             if (data?.accessType === "MULTIPLE") {
//                 const promoted =
//                     data?.pricingOptions && data.pricingOptions.length > 0
//                         ? data.pricingOptions.find((p: any) => p.promoted) || data.pricingOptions[0]
//                         : null;
//                 if (promoted) setSelectedPlan(promoted.id);
//             }

//             setLoading(false);
//         });
//     }, [courseId]);



//     const handleProceed = () => {
//         const plan =
//             course?.accessType === "MULTIPLE"
//                 ? course?.pricingOptions.find((p: any) => p.id === selectedPlan)
//                 : course?.pricingOptions[0];

//         if (course?.accessType === "MULTIPLE" && !selectedPlan) {
//             toast.error("Please select a plan");
//             return;
//         }
//         if (plan?.installments?.length > 0 && !selectedInstallment) {
//             toast.error("Please select an installment");
//             return;
//         }

//         toast.info("Redirecting for payment...");
//         setTimeout(() => {
//             window.open("https://www.instamojo.com/@CivicCentre", "_blank");
//             router.push(`/payment-confirmation?courseId=${course?.id}`);
//         }, 1500);
//     };

//     if (loading) return <p className="p-6">Loading...</p>;
//     if (!course) return <p className="p-6">Course not found</p>;

//     const formatValidity = (days: number) => {
//         if (days < 30) return `${days} Days`;
//         if (days < 365) return `${Math.floor(days / 30)} Month${days >= 60 ? "s" : ""}`;
//         return `${(days / 365).toFixed(1).replace(/\.0$/, "")} Year${days >= 730 ? "s" : ""}`;
//     };

//     const getValidityText = (plan: any) => {
//         switch (course?.accessType) {
//             case "SINGLE":
//             case "MULTIPLE":
//                 return formatValidity(plan.durationInDays || 0);
//             case "EXPIRY_DATE":
//                 return `Valid until ${new Date(plan.expiryDate).toLocaleDateString()}`;
//             case "LIFETIME":
//                 return "Lifetime Access";
//             default:
//                 return "Custom Validity";
//         }
//     };

//     const selectedPlanData =
//         course?.accessType === "MULTIPLE"
//             ? course?.pricingOptions.find((p: any) => p.id === selectedPlan)
//             : course?.pricingOptions[0];

//     return (
//         <div className="w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
//             {/* LEFT COLUMN */}
//             <div className="space-y-8">
//                 {/* <div className="flex gap-5 items-center">
//                     <img
//                         src={course?.thumbnail || "/placeholder.jpg"}
//                         alt={course?.name}
//                         className="w-28 h-28 object-cover rounded-lg border"
//                     />
//                     <div>
//                         <h1 className="text-2xl font-bold">{course?.name}</h1>
//                         <p className="text-gray-600 text-sm mt-1">
//                             {course?.accessType === "LIFETIME"
//                                 ? "Lifetime Access"
//                                 : course?.accessType === "EXPIRY_DATE"
//                                     ? `Valid until ${new Date(
//                                         course?.pricingOptions[0]?.expiryDate
//                                     ).toLocaleDateString()}`
//                                     : formatValidity(course?.pricingOptions[0]?.durationInDays || 0)}
//                         </p>
//                         <p className="text-lg font-semibold mt-2">
//                             ₹{course?.pricingOptions[0]?.effectivePrice || 0}
//                         </p>
//                     </div>
//                 </div> */}

//                 <div
//                     key={course.id}
//                     className="flex flex-row justify-between sm:block overflow-hidden group  p-3 mb-2 cursor-pointer"

//                 >
//                     <div className="relative w-40 h-24 flex items-center justify-center sm:w-full sm:pt-[56%] bg-gray-200 overflow-hidden rounded-2xl">
//                         <img
//                             src={course.thumbnail || "/placeholder.jpg"}
//                             alt={course.name}
//                             className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-300 rounded-2xl"
//                         />
//                     </div>

//                     <div className="w-2/4 sm:w-full pt-2 flex flex-col items-center">
//                              <h1 className="text-lg text-center font-semibold">{course?.name}</h1>

//  <p className="text-gray-600 text-sm mt-1">
//                             {course?.accessType === "LIFETIME"
//                                 ? "Lifetime Access"
//                                 : course?.accessType === "EXPIRY_DATE"
//                                     ? `Valid until ${new Date(
//                                         course?.pricingOptions[0]?.expiryDate
//                                     ).toLocaleDateString()}`
//                                     : formatValidity(course?.pricingOptions[0]?.durationInDays || 0)}
//                         </p>
//                         <p className="text-lg font-semibold mt-2">
//                             ₹{course?.pricingOptions[0]?.effectivePrice || 0}
//                         </p>


//                     </div>
//                 </div>

//                 {course?.accessType === "MULTIPLE" && (
//                     <>
//                         <h2 className="text-lg font-semibold">Select Plan</h2>
//                         <div className="space-y-3">
//                             {course?.pricingOptions.map((plan: any) => (
//                                 <div
//                                     key={plan.id}
//                                     onClick={() => {
//                                         setSelectedPlan(plan.id);
//                                         setSelectedInstallment(null);
//                                     }}
//                                     className={`p-4 rounded-md border cursor-pointer hover:shadow-sm transition ${selectedPlan === plan.id
//                                         ? "border-violet-500 bg-violet-50"
//                                         : "border-gray-300"
//                                         }`}
//                                 >
//                                     <div className="flex justify-between items-center">
//                                         <span className="font-semibold text-gray-800">
//                                             ₹{plan.effectivePrice}
//                                         </span>
//                                         {plan.discount > 0 && (
//                                             <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
//                                                 Save ₹{plan.discount}
//                                             </span>
//                                         )}
//                                     </div>
//                                     <p className="text-sm text-gray-600 mt-1">{getValidityText(plan)}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}

//                 {selectedPlanData?.installments?.length > 0 && (
//                     <div>
//                         <h2 className="text-lg font-semibold mb-3">Select Installment</h2>
//                         <div className="space-y-3">
//                             {selectedPlanData.installments.map((inst: Installment) => (
//                                 <div
//                                     key={inst.id}
//                                     onClick={() => setSelectedInstallment(inst.id)}
//                                     className={`p-4 rounded-md border cursor-pointer hover:shadow-sm transition ${selectedInstallment === inst.id
//                                         ? "border-violet-500 bg-violet-50"
//                                         : "border-gray-300"
//                                         }`}
//                                 >
//                                     <div className="flex justify-between items-center">
//                                         <span className="font-semibold">{inst.label}</span>
//                                         <span className="font-medium">₹{inst.amount}</span>
//                                     </div>
//                                     <p className="text-xs text-gray-600">
//                                         Due Date: {new Date(inst.dueDate).toLocaleDateString()}
//                                     </p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* RIGHT COLUMN - Order Summary */}
//             <div className="bg-white rounded-xl border p-6 h-fit shadow-sm">
//                 <h2 className="text-md mb-6">Order Summary</h2>
//                 <div className="flex items-center gap-4 mb-6">
//                     <img
//                         src={course?.thumbnail || "/placeholder.jpg"}
//                         alt={course?.name}
//                         className="w-40 h-24 sm:w-40 sm:h-22 object-cover rounded-xl border border-gray-300 shadow-md group-hover:scale-105 transition-transform"
//                     />
//                     <div>
//                         <h6 className="">{course?.name}</h6>

//                     </div>
//                 </div>

//                 <div className="border-t pt-4 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                         <span>Item Total</span>
//                         <span>
//                             ₹
//                             {selectedPlanData?.effectivePrice ||
//                                 course?.pricingOptions[0]?.effectivePrice ||
//                                 0}
//                         </span>
//                     </div>
//                     <div className="flex justify-between font-semibold pt-2">
//                         <span>Total</span>
//                         <span>
//                             ₹
//                             {selectedPlanData?.effectivePrice ||
//                                 course?.pricingOptions[0]?.effectivePrice ||
//                                 0}
//                         </span>
//                     </div>
//                 </div>

//                 <Button className="w-full mt-8 py-3 text-lg" onClick={handleProceed}>
//                     Pay Securely
//                 </Button>
//                 <p className="mt-4 text-xs text-gray-400 text-center">Secured Connection</p>
//             </div>
//         </div>
//     );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCourseById } from "@/utils/courses/getCourses";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Course, CoursePricingOption } from "@/utils/courses/getCourses";

export default function PaymentPage() {
    const router = useRouter();
    const params = useSearchParams();
    const courseId = params.get("courseId");
    const [course, setCourse] = useState<Course | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);

    // ---------- utils ----------
    const formatCurrency = (n: number) =>
        `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    const formatValidity = (days: number) => {
        if (!days || days <= 0) return "Custom Validity";
        if (days < 30) return `${days} Days`;
        if (days < 365) return `${Math.floor(days / 30)} Month${days >= 60 ? "s" : ""}`;
        return `${(days / 365).toFixed(1).replace(/\.0$/, "")} Year${days >= 730 ? "s" : ""}`;
    };

    const getValidityText = (plan: CoursePricingOption) => {
        switch (course?.accessType) {
            case "SINGLE":
            case "MULTIPLE":
                return formatValidity(plan.durationInDays || 0);
            case "EXPIRY_DATE":
                return `Valid until ${plan.expiryDate ? new Date(plan.expiryDate).toLocaleDateString() : "-"}`;
            case "LIFETIME":
                return "Lifetime Access";
            default:
                return "Custom Validity";
        }
    };

    const selectedPlanData: CoursePricingOption | undefined = useMemo(() => {
        if (!course) return undefined;
        if (course.accessType === "MULTIPLE") {
            return course.pricingOptions?.find((p) => p.id === selectedPlan);
        }
        return course.pricingOptions?.[0];
    }, [course, selectedPlan]);


    // ---------- effects ----------
    useEffect(() => {
        if (!courseId) return;
        (async () => {
            try {
                const data = await getCourseById(courseId);
                setCourse(data);

                // preselect promoted plan on multi-plan courses
                if (data?.accessType === "MULTIPLE") {
                    const promoted =
                        data?.pricingOptions?.find((p: CoursePricingOption) => p.promoted) || data?.pricingOptions?.[0];
                    if (promoted) setSelectedPlan(promoted.id);
                }
            } catch (e) {
                toast.error("Failed to load course.");
            } finally {
                setLoading(false);
            }
        })();
    }, [courseId]);

    // reset installment when plan changes
    useEffect(() => {
        setSelectedInstallment(null);
    }, [selectedPlan]);


    // ---------- derived amounts ----------
    const itemTotal = useMemo(() => {
        // if plan is selected, use that price
        if (selectedPlanData?.effectivePrice != null) {
            return selectedPlanData.effectivePrice;
        }
        // fallback to first option price
        return course?.pricingOptions?.[0]?.effectivePrice ?? 0;
    }, [selectedPlanData, course]);

    const payable = useMemo(() => {
        return Math.max(itemTotal - couponDiscount, 0);
    }, [itemTotal, couponDiscount]);

    const handleProceed = () => {
        const plan =
            course?.accessType === "MULTIPLE"
                ? course?.pricingOptions?.find((p) => p.id === selectedPlan)
                : course?.pricingOptions?.[0];

        if (course?.accessType === "MULTIPLE" && !selectedPlan) {
            toast.error("Please select a plan");
            return;
        }
        if (plan?.installments?.length && !selectedInstallment) {
            toast.error("Please select an installment");
            return;
        }

        toast.info("Redirecting to secure payment…");

        // NOTE: if you switch payment gateways later, construct the URL here.
        const instamojoUrl = "https://www.instamojo.com/@CivicCentre";

        // Open payment in a new tab, then move user to confirmation
        const tab = window.open(instamojoUrl, "_blank", "noopener,noreferrer");
        if (!tab) toast.warning("Please allow pop-ups to continue.");

        // Push confirmation with context (include installment for reconciliation)
        const query = new URLSearchParams({
            courseId: course?.id ?? "",
            planId: plan?.id ?? "",
            installmentId: selectedInstallment ?? "",
            amount: String(payable),
        }).toString();

        setTimeout(() => {
            router.push(`/payments/PaymentConfirmation?${query}`);

        }, 900);
    };

    // ---------- UI ----------
    if (loading) {
        return (
            <div className="min-h-[70vh] px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" />
                    <div className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
                    <div className="h-24 w-full rounded-xl bg-slate-100 animate-pulse" />
                </div>
                <div className="h-[420px] rounded-2xl bg-slate-100 animate-pulse" />
            </div>
        );
    }

    if (!course) return <p className="p-6">Course not found</p>;

    return (
        <div className="relative">
            {/* Futuristic gradient aura */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_40%_at_70%_10%,rgba(124,58,237,.15),transparent_60%),radial-gradient(50%_35%_at_20%_30%,rgba(59,130,246,.12),transparent_60%)]"
            />

            <div className="w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                {/* LEFT: Course + Plans */}
                <div className="space-y-8">
                    {/* Course header card (glass) */}
                    <div className="rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl  p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <div className="relative w-full sm:pt-[56%] rounded-2xl overflow-hidden bg-gray-200">
                                <img
                                    src={course.thumbnail || "/placeholder.jpg"}
                                    alt={course.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-col items-start justify-between gap-4">
                                <h1 className="text-xl font-semibold">{course.name}</h1>
                                <div className="text-xs text-slate-600 mt-1">
                                    {course.accessType === "LIFETIME"
                                        ? "Lifetime Access"
                                        : course.accessType === "EXPIRY_DATE"
                                            ? `${course?.pricingOptions?.[0]?.expiryDate
                                                ? new Date(course.pricingOptions[0].expiryDate!).toLocaleDateString()
                                                : "-"
                                            }`
                                            : formatValidity(course?.pricingOptions?.[0]?.durationInDays || 0)}
                                </div>

                                <div className="text-lg font-semibold">
                                    {formatCurrency(course?.pricingOptions?.[0]?.effectivePrice || 0)}
                                </div>

                            </div>
                        </div>
                    </div>


                    {/* Multi-plan selector */}
                    {course.accessType === "MULTIPLE" && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-medium tracking-wide text-slate-700">Choose Your Plan</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {course.pricingOptions?.map((plan) => {
                                    const active = selectedPlan === plan.id;
                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={[
                                                "text-left rounded-xl border transition-all p-4 group",
                                                "bg-white/70 backdrop-blur-xl hover:shadow-lg",
                                                active
                                                    ? "border-violet-500 ring-2 ring-violet-400/40"
                                                    : "border-slate-200 hover:border-slate-300",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-base font-semibold">{formatCurrency(plan.effectivePrice)}</div>
                                                    <div className="text-xs text-slate-600">{getValidityText(plan)}</div>
                                                </div>
                                                {plan.discount && plan.discount > 0 && (
                                                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                                                        Save {formatCurrency(plan.discount)}
                                                    </span>
                                                )}
                                            </div>
                                            {plan.promoted && (
                                                <div className="mt-2 text-[10px] text-violet-700 bg-violet-100 inline-block px-2 py-0.5 rounded">
                                                    Recommended
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Order Summary (sticky) */}
                <div className="lg:sticky lg:top-8">
                    <div className="rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_8px_30px_rgba(31,38,135,0.15)] p-6">
                        <h3 className="text-sm font-medium tracking-wide text-slate-700 mb-4">Order Summary</h3>

                        <div className="flex items-center gap-4 mb-5">
                            <img
                                src={course?.thumbnail || "/placeholder.jpg"}
                                alt={course?.name}
                                className="w-40 h-24 object-cover rounded-xl border border-white/30 shadow-sm"
                            />
                            <div className="min-w-0">
                                <div className="font-semibold line-clamp-2">{course?.name}</div>
                                <div className="text-xs text-slate-600 mt-1">
                                    {selectedPlanData ? getValidityText(selectedPlanData) : "-"}
                                </div>
                            </div>
                        </div>

                        {/* price rows */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Item Total</span>
                                <span>{formatCurrency(itemTotal)}</span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-700">
                                    <span>Coupon</span>
                                    <span>-{formatCurrency(couponDiscount)}</span>
                                </div>
                            )}

                            <div className="border-t pt-3 flex justify-between font-semibold">
                                <span>Payable Now</span>
                                <span>{formatCurrency(payable)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 py-3 text-base"
                            onClick={handleProceed}
                            disabled={
                                !course ||
                                (course.accessType === "MULTIPLE" && !selectedPlan) ||
                                (!!selectedPlanData?.installments?.length && !selectedInstallment)
                            }
                        >
                            {payable > 0 ? `Pay ${formatCurrency(payable)} Securely` : "Pay Securely"}
                        </Button>

                        <div className="mt-3 text-[10px] text-center text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70">
                                    <path
                                        fill="currentColor"
                                        d="M12 1a5 5 0 0 1 5 5v2h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V6a5 5 0 0 1 5-5Zm3 7V6a3 3 0 1 0-6 0v2h6Z"
                                    />
                                </svg>
                                End-to-end encrypted checkout
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
