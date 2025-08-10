"use client";
import {
  BarChart,
  Gift,
  Shop,
  Collection,
  Person,
  FileBarGraph,
  People,
  Layers,
  Journals,
  Bookmarks,
  ChevronDoubleRight,
  ChevronDoubleLeft,
  Unlock,
  UnlockFill,
  ColumnsGap,
  Headphones,

} from "react-bootstrap-icons";
import { Headset, LockOpen, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAllReportedQuestions, useResolvedReportsByUser } from "@/hooks/tests/reports/useReports";
import type { Report } from "@/utils/tests/reports/reports";
import { getReportsLastVisit } from "@/utils/lastVisit";
import { useAllPaymentRequests } from "@/hooks/courses/useCourseAccess";
import { useUser } from "@/context/userContext";
import { hasRole } from "@/utils/auth/rbac";


const menuItems = [
  {
    title: "Menu",
    items: [
      {
        icon: <ColumnsGap size={18} />,
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        icon: <Journals size={18} />,
        label: "Courses",
        href: "/courses",
      },
      // {
      //   icon: <Gift size={18} />,
      //   label: "Coupons",
      //   href: "/coupons",
      //   roleRestricted: true
      // },
      // {
      //   icon: <Shop size={18} />,
      //   label: "Store",
      //   href: "/store",
      // },
      {
        icon: <LockOpen size={18} />,
        label: "Free Materials",
        href: "/freematerials",
      },
      {
        icon: <Collection size={18} />,
        label: "DBMS",
        href: "/dbms",
        roleRestricted: true
      },
      {
        icon: <Person size={18} />,
        label: "Users",
        href: "/users",
        roleRestricted: true
      },
      {
        icon: <Flag size={18} />,
        label: "Flags",
        href: "/reports",
      },
      // {
      //   icon: <Bookmarks size={18} />,
      //   label: "Review Questions",
      //   href: "/review-questions",
      //   roleRestricted: true
      // },
    ],
  },
];

export const AsideNavigation = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: reports } = useAllReportedQuestions();
  const reportCount = reports?.length || 0;

  const { user } = useUser();
  const { data: resolvedReports } = useResolvedReportsByUser();

  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Badge count logic
  const lastVisit = getReportsLastVisit();
  let badgeCount = 0;
  if (hasRole(user, "student")) {
    badgeCount = (resolvedReports || []).filter((r: Report) =>
      lastVisit ? new Date(r.resolvedAt) > lastVisit : true
    ).length;
  } else {
    badgeCount = reports?.length || 0;
  }

  // Payments
  const { data: allPayments } = useAllPaymentRequests();
  const pendingPaymentsCount = (allPayments || []).filter(
    (p: any) => p.status === "PENDING"
  ).length;

  // Handle screen resize efficiently
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);  // Auto-collapse on small screens
      } else {
        setCollapsed(false); // Expand on large screens
      }
    };

    // Run once on mount
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <aside
        className={`hidden md:flex flex-col bg-white text-white top-0 left-0 transition-all duration-300 ${collapsed ? "w-20 p-2" : "w-60 p-4"
          }`}
      >
        <div className="w-full flex flex-col justify-between h-full text-sm">
          {/* Scrollable menu items */}
          <div className="flex flex-col gap-12 mt-4 overflow-auto pr-1">
            {menuItems.map((section) => (
              <div className="flex flex-col gap-3" key={section.title}>
                {section.items
                  .filter(item => !(hasRole(user, "student") && item.roleRestricted))
                  .map((item) => {
                    const isActive = pathname.startsWith(item.href);

                    const itemClasses = `
    flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-4 p-3 rounded transition-all duration-200
    ${isActive ? "bg-violet-50 text-violet-900 font-bold" : "text-gray-500 hover:text-violet-900 hover:bg-violet-50 hover:font-bold"}
  `;

                    return (
                      <Link href={item.href} key={item.label} className={itemClasses}>
                        <span className="relative">
                          {item.label === "Flags" && badgeCount > 0 && (
                            <span className="absolute -top-3 -right-4 bg-red-700 text-white text-[10px] px-2  rounded-full">
                              {badgeCount}
                            </span>
                          )}

                          {/* Pending payments badge */}
                          {item.label === "Users" && pendingPaymentsCount > 0 && (
                            <span className="absolute -top-3 -right-4 bg-amber-600 text-white text-[10px] px-2 rounded-full">
                              {pendingPaymentsCount}
                            </span>
                          )}

                          {item.icon}
                        </span>
                        {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                      </Link>
                    );
                  })}

              </div>
            ))}
          </div>

          {/* Fixed bottom Help & Support */}
          <div className="">
            <button
              onClick={() => setIsSupportOpen(true)}
              className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 p-3 rounded transition-all duration-200 bg-violet-900 text-white`}
            >
              <span className="text-lg">
                <Headphones size={20} />
              </span>
              {!collapsed && <span className="whitespace-nowrap">Help & Support</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white text-white h-16 p-1 flex overflow-x-auto border-y rounded-2xl z-50">
        {[
          { icon: <ColumnsGap />, label: "Home", href: "/dashboard" },
          { icon: <Journals />, label: "Courses", href: "/courses" },
          // { icon: <Shop />, label: "Store", href: "/store" },
          { icon: <LockOpen size={20} />, label: "Free Materials", href: "/freematerials" },
          { icon: <Flag size={18} />, label: "Flags", href: "/reports" },

        ].map((item) => {
          // const isActive = pathname === item.href;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col flex-1 min-w-[60px] items-center justify-center transition-all duration-300 rounded-2xl ${isActive
                ? "text-violet-900 font-bold bg-violet-100 "
                : "text-violet-800 hover:text-white hover:bg-violet-800 "
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] leading-tight mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {isSupportOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Contact Support</h2>

            <p className="mb-2">
              Email:{" "}
              <a
                href="mailto:civiccentre.in@gmail.com"
                className="text-blue-500 underline"
              >
                civiccentre.in@gmail.com
              </a>
            </p>

            <p className="mb-4">
              Mobile:{" "}
              <a
                href="tel:+917013495019"
                className="text-blue-500 underline"
              >
                +91 70134 95019
              </a>
            </p>

            <button
              onClick={() => setIsSupportOpen(false)}
              className="px-4 py-2 bg-violet-900 text-white rounded hover:bg-violet-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}


    </>
  );
};


// "use client";
// import {
//   BarChart,
//   Gift,
//   Shop,
//   Collection,
//   Person,
//   FileBarGraph,
//   People,
//   Layers,
//   Journals,
//   Bookmarks,
//   ChevronDoubleRight,
//   ChevronDoubleLeft,
//   Unlock,
//   UnlockFill,
//   ColumnsGap,
//   Headphones,
// } from "react-bootstrap-icons";
// import { Headset, LockOpen, Flag } from "lucide-react";
// import { useEffect, useState, } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useAllReportedQuestions, useResolvedReportsByUser } from "@/hooks/tests/reports/useReports";
// import type { Report } from "@/utils/tests/reports/reports";
// import { getReportsLastVisit } from "@/utils/lastVisit";
// import { useUser } from "@/context/userContext";
// import { hasRole } from "@/utils/auth/rbac";

// const menuItems = [
//   {
//     title: "Menu",
//     items: [
//       { icon: <ColumnsGap size={18} />, label: "Dashboard", href: "/dashboard" },
//       { icon: <Journals size={18} />, label: "Courses", href: "/courses" },
//       { icon: <Gift size={18} />, label: "Coupons", href: "/coupons", roleRestricted: true },
//       // { icon: <Shop size={18} />, label: "Store", href: "/store" },
//       { icon: <LockOpen size={18} />, label: "Free Materials", href: "/freematerials" },
//       { icon: <Collection size={18} />, label: "DBMS", href: "/dbms", roleRestricted: true },
//       { icon: <Person size={18} />, label: "Users", href: "/users"},
//       { icon: <Flag size={18} />, label: "Flags", href: "/reports" },
//       { icon: <Bookmarks size={18} />, label: "Review Questions", href: "/review-questions", roleRestricted: true },
//     ],
//   },
// ];

// export const AsideNavigation = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const pathname = usePathname();
//   const { data: reports } = useAllReportedQuestions();
//   const reportCount = reports?.length || 0;

//   const { user } = useUser();
//   const { data: resolvedReports } = useResolvedReportsByUser();
//   const [isSupportOpen, setIsSupportOpen] = useState(false);


//   // Badge count logic
//   const lastVisit = getReportsLastVisit();
//   let badgeCount = 0;
//   if (hasRole(user, "student")) {
//     badgeCount = (resolvedReports || []).filter((r: Report) =>
//       lastVisit ? new Date(r.resolvedAt) > lastVisit : true
//     ).length;
//   } else {
//     badgeCount = reports?.length || 0;
//   }

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 768) setCollapsed(true);
//       else setCollapsed(false);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <>
//       <aside
//         className={`hidden md:flex flex-col bg-white text-white top-0 left-0 transition-all duration-300 ${collapsed ? "w-20 p-2" : "w-60 p-4"
//           }`}
//       >
//         <div className="w-full flex flex-col justify-between h-full text-sm">
//           <div className="flex flex-col gap-12 mt-4 overflow-auto pr-1">
//             {menuItems.map((section) => (
//               <div className="flex flex-col gap-3" key={section.title}>
//                 {section.items
//                   .filter(item => !(hasRole(user, "student") && item.roleRestricted))
//                   .map((item) => {
//                     const isActive = pathname.startsWith(item.href);
//                     const itemClasses = `
//                       flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-4 p-3 rounded transition-all duration-200
//                       ${isActive ? "bg-violet-50 text-violet-900 font-bold" : "text-gray-500 hover:text-violet-900 hover:bg-violet-50 hover:font-bold"}
//                     `;

//                     return (
//                       <Link href={item.href} key={item.label} className={itemClasses}>
//                         <span className="relative">
//                           {item.label === "Flags" && badgeCount > 0 && (
//                             <span className="absolute -top-3 -right-4 bg-red-700 text-white text-[10px] px-2 rounded-full">
//                               {badgeCount}
//                             </span>
//                           )}
//                           {item.icon}
//                         </span>
//                         {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
//                       </Link>
//                     );
//                   })}
//               </div>
//             ))}
//           </div>

//           {/* Help & Support */}
//           {/* <div>
//             <Link
//               href="/support"
//               className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 p-3 rounded transition-all duration-200 bg-violet-900 text-white`}
//             >
//               <span className="text-lg">
//                 <Headphones size={20} />
//               </span>
//               {!collapsed && <span className="whitespace-nowrap">Help & Support</span>}
//             </Link>
//           </div> */}
//           <div>
//             <button
//               onClick={() => setIsSupportOpen(true)}
//               className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 p-3 rounded transition-all duration-200 bg-violet-900 text-white`}
//             >
//               <span className="text-lg">
//                 <Headphones size={20} />
//               </span>
//               {!collapsed && <span className="whitespace-nowrap">Help & Support</span>}
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Mobile bottom menu */}
//       <div className="md:hidden fixed bottom-0 left-0 w-full bg-white text-white h-16 p-1 flex overflow-x-auto border-y rounded-2xl z-50">
//         {[
//           { icon: <ColumnsGap />, label: "Home", href: "/dashboard" },
//           { icon: <Journals />, label: "Courses", href: "/courses" },
//           { icon: <Shop />, label: "Store", href: "/store" },
//           { icon: <LockOpen size={20} />, label: "Free Materials", href: "/freematerials" },
//         ].map((item) => {
//           const isActive = pathname.startsWith(item.href);
//           return (
//             <Link
//               key={item.label}
//               href={item.href}
//               className={`flex flex-col flex-1 min-w-[60px] items-center justify-center transition-all duration-300 rounded-2xl ${isActive
//                 ? "text-violet-900 font-bold bg-violet-100"
//                 : "text-violet-800 hover:text-white hover:bg-violet-800"
//                 }`}
//             >
//               <span className="text-xl">{item.icon}</span>
//               <span className="text-[10px] leading-tight mt-1">{item.label}</span>
//             </Link>
//           );
//         })}
//       </div>
//       {isSupportOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full">
//             <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
//             <p className="mb-2">
//               Email: <a href="mailto:support@example.com" className="text-blue-500 underline">support@example.com</a>
//             </p>
//             <p className="mb-4">
//               Mobile: <a href="tel:+911234567890" className="text-blue-500 underline">+91 12345 67890</a>
//             </p>
//             <button
//               onClick={() => setIsSupportOpen(false)}
//               className="px-4 py-2 bg-violet-900 text-white rounded hover:bg-violet-700 transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };
