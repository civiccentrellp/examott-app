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
  ChevronDoubleLeft
} from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import Link from "next/link";

const menuItems = [
  {
    title: "Menu",
    items: [
      {
        icon: <BarChart />,
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        icon: <Journals />,
        label: "Courses",
        href: "/courses",
      },
      {
        icon: <Gift />,
        label: "Coupons",
        href: "/coupons",
      },
      {
        icon: <Shop />,
        label: "Store",
        href: "/store",
      },
      {
        icon: <Collection />,
        label: "DBMS",
        href: "/dbms",
      },
      {
        icon: <Person />,
        label: "Users",
        href: "/users",
      },
      {
        icon: <FileBarGraph />,
        label: "Reports",
        href: "/reports",
      },
      {
        icon: <People />,
        label: "Groups",
        href: "/groups",
      },
      {
        icon: <Layers />,
        label: "Batches",
        href: "/batches",
      },
      {
        icon: <Bookmarks />,
        label: "Review Questions",
        href: "/review-questions",
      },
    ],
  },
];

const AsideNavigation = () => {
  const [collapsed, setCollapsed] = useState(false);

  
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
    <aside
      className={`bg-gray-900 text-white h-screen p-4 top-0 left-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header with logo and collapse button */}
      <div className={`flex items-center ${collapsed ? "justify-center flex-col-reverse gap-2" : "justify-between"}`}>
        {/* {!collapsed && <h2 className="text-xl font-semibold">ExamOtt</h2>} */}
        <h2 className="text-xl font-semibold">{collapsed ? "EO" : "ExamOtt"}</h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-700 rounded"
        >
          {collapsed ? <ChevronDoubleRight size={20} /> : <ChevronDoubleLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="mt-4 text-sm">
        {menuItems.map((section) => (
          <div className="flex flex-col gap-2" key={section.title}>
            {!collapsed && (
              <span className="text-gray-400 font-light my-4">{section.title}</span>
            )}
            {section.items.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } gap-4 text-gray-400 p-2 rounded hover:bg-gray-700 transition-all`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AsideNavigation;

