import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";
import { FaUserCircle, FaKey } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header = ({ driverData = {}, onLogout, sidebarOpen, setSidebarOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleProfileClick = () => {
    navigate("/driver-dashboard/profile");
    setShowDropdown(false);
  };

  const handleChangePassword = () => {
    navigate("/driver-dashboard/change-password");
    setShowDropdown(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center p-4 px-5 bg-[#1f2937] text-white w-full z-40 flex-shrink-0">
      <div className="flex items-center space-x-3">
        {/* Hamburger Icon for mobile */}
        {!sidebarOpen && (
          <button
            className="lg:hidden text-white hover:text-blue-300 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FiMenu className="text-2xl" />
          </button>
        )}
        <h1 className="text-xl font-semibold">Driver Dashboard</h1>
      </div>
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
          <span className="text-white cursor-pointer select-none">
            Hi, {driverData?.first_name || "Driver"}
          </span>
          {driverData?.profilePic ? (
            <img
              src={driverData.data.profilePic}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              alt="Driver Avatar"
              onClick={toggleDropdown}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40?text=D";
              }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white cursor-pointer"
              onClick={toggleDropdown}
            >
              {driverData?.data?.first_name
                ? driverData.data.first_name.charAt(0).toUpperCase()
                : "D"}
            </div>
          )}

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800"
              >
                <div
                  className="flex items-center px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={handleProfileClick}
                >
                  <FaUserCircle className="mr-2 text-blue-600" />
                  <span className="font-medium">Profile</span>
                </div>
                <div
                  className="flex items-center px-4 py-3 hover:bg-blue-100 cursor-pointer transition-colors"
                  onClick={handleChangePassword}
                >
                  <FaKey className="mr-2 text-blue-600" />
                  <span className="font-medium">Change Password</span>
                </div>
                <div className="border-t border-gray-100 my-1"></div>
                <div
                  className="flex items-center px-4 py-3 hover:bg-red-100 cursor-pointer transition-colors text-red-600"
                  onClick={handleLogout}
                >
                  <FiLogOut className="mr-2" />
                  <span className="font-medium">Logout</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Header;