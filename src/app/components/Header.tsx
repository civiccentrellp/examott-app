"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { 
  ArrowRightSquareFill ,
  XSquareFill
 } from "react-bootstrap-icons";

const Header = ({ contentName = "Dashboard" }: { contentName?: string }) => {
  const [selectedGoal, setSelectedGoal] = useState<string>("Select a Goal");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  // Reference for profile dropdown
  const profileRef = useRef<HTMLDivElement>(null);

  // Hardcoded user data (Replace with real data later)
  const user = {
    name: "John Doe",
    profilePic: "",
  };

  const goals = ["UPSC", "TGPSC", "APPSC"];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Sign Out
  const handleSignOut = () => {
    console.log("Signing out...");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center bg-white shadow p-4 w-full">
        <div className="flex items-center gap-8 mx-4 ">
          <h1 className="text-xl font-bold">{contentName}</h1>

          {/* Goal Selection Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 "
          >
            {selectedGoal}
            <ArrowRightSquareFill />
          </button>

        </div>
        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="focus:outline-none">
            {user.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full text-lg font-bold">
                {user.name.charAt(0)}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
              <ul className="flex flex-col">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link href="/profile">Profile</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <Link href="/profile">Account</Link>
                </li>
                <li className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer" onClick={handleSignOut}>Sign Out</li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Goal Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg">
          <div className="bg-white p-6 rounded-lg shadow-2xl border border-gray-300 w-[400px] h-[250px] flex flex-col items-center">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 p-2 rounded hover:bg-gray-400 flex self-end"
            >
              <XSquareFill/>
            </button>
            <h2 className="text-lg font-bold m-4 text-center">Select a Goal</h2>

            {/* Goal Options */}
            <ul className="flex w-full justify-between items-center my-4 py-4">
              {goals.map((goal) => (
                <li key={goal} className="p-2 bg-gray-900 text-gray-200 cursor-pointer rounded"
                  onClick={() => {
                    setSelectedGoal(goal);
                    setIsModalOpen(false);
                  }}>
                  {goal}
                </li>
              ))}
            </ul>

            
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

