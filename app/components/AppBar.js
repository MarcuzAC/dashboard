"use client";
import { FaUserCircle, FaBars } from "react-icons/fa";

const AppBar = ({ toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white shadow-sm flex items-center px-4 lg:px-6 justify-between z-20">
      <div className="flex items-center">
        {/* Toggle button for mobile drawer */}
        <button className="text-gray-800 lg:hidden" onClick={toggleSidebar}>
          <FaBars className="w-6 h-6" />
        </button>
        <h1 className="ml-3 text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-3">
        <FaUserCircle className="text-2xl text-gray-700" />
        <span className="text-gray-800 font-medium">Admin</span>
      </div>
    </div>
  );
};

export default AppBar;
