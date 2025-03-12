"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { FaTachometerAlt, FaVideo, FaList, FaUsers, FaSignOutAlt, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie"; 

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const isActive = (path) => (currentPath === path ? "bg-blue-700" : "hover:bg-blue-700");

  const handleLogout = () => {
    Cookies.remove("accessToken"); 
    router.push("/login"); 

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <>
      
        <div
          className={`fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white shadow-lg transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-64"} lg:translate-x-0 lg:relative z-50 overflow-y-auto`}
          style={{position: "fixed"}}
        >
          <div className="p-5 text-2xl font-bold border-b border-blue-700 flex justify-between items-center">
            Admin Panel
            {/* Close button for mobile */}
          <button className="lg:hidden text-white" onClick={toggleSidebar}>
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className={`flex items-center p-3 rounded-lg ${isActive("/dashboard")}`}>
                <FaTachometerAlt className="mr-3" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/videos" className={`flex items-center p-3 rounded-lg ${isActive("/videos")}`}>
                <FaVideo className="mr-3" /> Videos
              </Link>
            </li>
            <li>
              <Link href="/categories" className={`flex items-center p-3 rounded-lg ${isActive("/categories")}`}>
                <FaList className="mr-3" /> Categories
              </Link>
            </li>
            <li>
              <Link href="/users" className={`flex items-center p-3 rounded-lg ${isActive("/users")}`}>
                <FaUsers className="mr-3" /> Users
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center p-3 rounded-lg hover:bg-red-700"
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
