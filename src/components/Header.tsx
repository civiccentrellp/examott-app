"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/utils/auth";
import { toast } from "sonner";
import { ArrowRightSquareFill, X, XSquare, XSquareFill } from "react-bootstrap-icons";
import { User } from "@/utils/users/users";
import { ShieldCheckIcon, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Icon } from '@iconify/react';
import { useUser } from "@/context/userContext";
import { hasRole } from "@/utils/auth/rbac";


export const Header = () => {
  const { user } = useUser();
  const [selectedGoal, setSelectedGoal] = useState("Goal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);


  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const pageTitles: { [key: string]: string } = {
    "/": "Dashboard",
    "/courses": "Courses",
    "/courses/overview": "Course Overview",
    "/profile": "Profile",
    "/settings": "Account Settings",
  };

  const contentName = pageTitles[pathname] || "Dashboard";

  const goals = [
    { name: "UPSC", image: "/assets/Artboard 2.svg" },
    { name: "TGPSC", image: "/assets/TGPSC V2.svg" },
    { name: "APPSC", image: "/assets/APPSC svg.svg" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const handleSignOut = () => {
    toast.success("Successfully signed out!", {
      position: "top-right",
      duration: 3000,
    });
    logout();
    router.push("/");
  };

  const profileMenuItems = [
    // { label: "View Profile", href: "/profile" },
    // { label: "Account Settings", href: "/settings" },
    { label: "Coupons", href: "/coupons", restricted: true },
    { label: "DBMS", href: "/dbms", restricted: true },
    { label: "Users", href: "/users", restricted: true },
    { label: "Flags", href: "/reports" },
    { label: "Review Questions", href: "/review-questions", restricted: true },
  ];

  const visibleMenuItems = profileMenuItems.filter(
    (item) => !(hasRole(user, "student") && item.restricted)
  );

  return (
    <>
      <header className="w-full h-20  bg-white border-b border-gray-200 flex items-center justify-between">
        {/* <div className="flex items-center gap-4 mx-4">
          <div className="text-2xl sm:text-3xl font-bold text-violet-900 ">ExamOtt</div>
        </div> */}

        <div className="flex items-center gap-4 h-20 mx-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 760 180"
            role="img"
            aria-label="ExamOTT wordmark"
            className="h-16 w-auto"
            preserveAspectRatio="xMinYMid meet"
          >
            <defs>
              <linearGradient id="vio" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5f24c4ff" />
                <stop offset="50%" stopColor="#7d4af4ff" />
                <stop offset="100%" stopColor="#5422ecff" />
              </linearGradient>
            </defs>

            {/* Wordmark (no spaces) */}
            <text
              x="80"
              y="100"
              fontSize="100"
              fill="url(#vio)"
              fontFamily="Poppins, Inter, Segoe UI, system-ui, sans-serif"
              fontWeight={900}
              letterSpacing=".04em"
              dominantBaseline="middle"
            >
              ExamOTT
            </text>
          </svg>

        </div>




        <div className="sm:hidden relative group inline-block rounded-2 overflow-hidden">
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-2 
               text-white transition-all duration-300 ease-in-out 
               bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
               bg-[length:200%_200%] group-hover:bg-right"
          >
            <span>{selectedGoal}</span>
            <Icon icon="octicon:goal-24" width={20} height={20} color="white" />
          </button>

          {/* White overlay on top (initially visible), fades on hover */}
          <div className="absolute inset-0 bg-white z-0 transition-opacity duration-300 group-hover:opacity-0"></div>
        </div>
        <div className="flex items-center gap-2 ">
          <div className="hidden sm:block relative group inline-block rounded-2 overflow-hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative z-10 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-2 
               text-white transition-all duration-300 ease-in-out 
               bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
               bg-[length:200%_200%] group-hover:bg-right"
            >
              <span>{selectedGoal}</span>
              {/* <ArrowRightSquareFill className="transition-transform duration-300 group-hover:translate-x-1 text-base" /> */}
              <Icon icon="octicon:goal-24" width={20} height={20} color="white" />
            </button>

            {/* White overlay on top (initially visible), fades on hover */}
            <div className="absolute inset-0 bg-white z-0 transition-opacity duration-300 group-hover:opacity-0"></div>
          </div>
          <div ref={profileRef} className="relative bg-violet-300 p-2 rounded-2 mx-4">
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="focus:outline-none">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white text-violet-900 rounded-full text-xl font-bold">
                  {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </button>

            {isProfileDropdownOpen && user && (
              <>
                {/* Desktop dropdown */}
                <div className="hidden sm:block absolute right-0 mt-3 w-auto min-w-[400px] rounded-2xl bg-white border border-gray-300/60 shadow-2xl z-50 ring-1 ring-indigo-200/50">
                  <div className="flex items-center gap-4 p-6">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover shadow-lg ring-2 ring-indigo-300"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-white-800 to-gray-900 text-black rounded-full text-2xl font-bold shadow-inner ring-2 ring-violet-300">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-semibold text-gray-900 flex gap-4">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-500 flex gap-2">
                        {user.email}
                        <span className="inline-flex items-center gap-1 px-2 text-xs text-black bg-indigo-100 border border-indigo-300 rounded whitespace-nowrap">
                          <ShieldCheckIcon className="w-3 h-3 text-indigo-600" />
                          {user.role?.label || "User"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm italic text-gray-700 bg-indigo-50 px-4 py-2 rounded-md mx-4 shadow-sm">
                    <span className="inline-block mr-2">🌱</span>
                    “Knowledge grows when you share it.”
                  </div>

                  <hr className="border-t border-gray-300 mt-4" />

                  <div className="flex flex-col divide-y divide-gray-200 text-sm text-gray-800">
                    {/* <Link href="/profile" className="w-full px-4 py-3 hover:bg-violet-50 hover:font-bold hover:text-violet-600 transition">
                      View Profile
                    </Link>
                    <Link href="/settings" className="w-full px-4 py-3 hover:bg-violet-50 hover:font-bold hover:text-violet-600 transition">
                      Account Settings
                    </Link> */}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 hover:font-bold hover:text-red-600 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Mobile full-screen modal */}
                <div className="sm:hidden fixed inset-0 bg-white z-50 flex flex-col">
                  <button
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="absolute right-2  p-2 rounded-2 hover:bg-gray-300"
                  >
                    <X size={32} />
                  </button>

                  <div className="flex items-center gap-4 mt-4 p-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover shadow-lg ring-2 ring-indigo-300"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-white-800 to-gray-900 text-black rounded-full text-2xl font-bold shadow-inner ring-2 ring-violet-300">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <span className="text-lg font-semibold text-gray-900 flex gap-4">
                        {user.name}
                      </span>
                      <span className="text-sm text-gray-500 flex gap-2">
                        {user.email}
                        <span className="inline-flex items-center gap-1 px-2 text-xs text-black bg-indigo-100 border border-indigo-300 rounded whitespace-nowrap">
                          <ShieldCheckIcon className="w-3 h-3 text-indigo-600" />
                          {user.role?.label || "User"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm italic text-gray-700 bg-indigo-50 px-4 py-2 rounded-md mx-4 shadow-sm">
                    <span className="inline-block mr-2">🌱</span>
                    “Knowledge grows when you share it.”
                  </div>

                  <hr className="border-t border-gray-300 mt-4" />

                  <div className="flex flex-col divide-y divide-gray-200 text-sm text-gray-800 ">
                    {visibleMenuItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="px-4 py-3 text-violet-800 font-medium hover:bg-violet-50 hover:font-bold hover:text-violet-600"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="px-4 py-3 text-left text-red-600 font-bold hover:bg-red-50 hover:font-bold hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                  <hr className="border-t border-gray-400" />
                </div>
              </>
            )}


          </div>
        </div>

      </header>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50" onClick={() => setIsModalOpen(false)}>
          <div className=" backdrop-blur p-6 rounded-lg shadow-2xl border border-gray-300 w-[500px] h-[250px] flex flex-col items-center justify-around">
            <div className="w-full flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white text-center">What's your Goal ?</h2>
            </div>
            <ul className="flex w-full justify-between items-center py-2">
              {goals.map((goal) => (
                <li
                  key={goal.name}
                  className="p-2 text-gray-200 cursor-pointer rounded flex flex-col items-center"
                  onClick={() => {
                    setSelectedGoal(goal.name);
                    setIsModalOpen(false);
                  }}
                >
                  <img src={goal.image} alt={goal.name} className="w-20 h-20 mb-2" />
                  <span>{goal.name}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </>
  );
};
