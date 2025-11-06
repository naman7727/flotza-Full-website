import React, { useState, useEffect, useRef } from "react";
import { GrSettingsOption } from "react-icons/gr";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Header = ({ setRenderPage, updateUserSession, userSession }) => {
  const navigate = useNavigate();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return (
      userSession?.profileImage || "https://via.placeholder.com/40?text=User:1"
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update avatarUrl when userSession.profileImage changes
  useEffect(() => {
    if (userSession?.profileImage) {
      setAvatarUrl(userSession.profileImage);
    } else {
      setAvatarUrl("https://via.placeholder.com/40?text=User:1");
    }
  }, [userSession?.profileImage]);

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleUserProfileClick = () => {
    navigate("/customer-dashboard/user_profile");
    if (setRenderPage) setRenderPage("user_profile");
    setShowSettingsDropdown(false);
  };

  return (
    <div className="flex justify-between items-center p-2 px-8 bg-[#1f2937] text-white fixed top-0 w-screen h-17 z-40">
      <div className="flex items-center space-x-2">
        <img
          src={logo}
          className="border rounded-full shadow-lg w-13 h-13"
          alt="Logo"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = logo; // fallback to imported logo if error
          }}
        />
        <h1 className="text-2xl font-bold">Flotza</h1>
      </div>
      <div className="flex items-center space-x-5">
        <IoMdNotificationsOutline className="p-2 text-4xl rounded-full cursor-pointer hover:bg-blue-600" />
        <div className="flex items-center space-x-2 max-w-max">
          <div className="text-white cursor-pointer max-w-max">
            {userSession && (userSession.firstName || userSession.first_name || userSession.fullName)
              ? `Welcome, ${userSession.firstName || userSession.first_name || userSession.fullName.split(' ')[0] || 'User'}`
              : "Welcome, User"}
          </div>
          {avatarUrl && avatarUrl !== "https://via.placeholder.com/40?text=User:1" && avatarUrl !== "https://via.placeholder.com/40?text=User" ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="object-cover w-10 h-10 transition-opacity border border-gray-300 rounded-full cursor-pointer hover:opacity-80"
              onClick={toggleSettingsDropdown}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                setAvatarUrl("https://via.placeholder.com/40?text=User"); // Fallback avatar
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center w-10 h-10 text-xl font-semibold text-white transition-opacity rounded-full cursor-pointer bg-gradient-to-br from-blue-400 to-blue-600 hover:opacity-80"
              onClick={toggleSettingsDropdown}
            >
              {(userSession.firstName || userSession.first_name || userSession.fullName)
                ? (userSession.firstName || userSession.first_name || userSession.fullName).charAt(0).toUpperCase()
                : "U"}
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <AnimatePresence>
            {showSettingsDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white rounded-md shadow-lg"
              >
                <div
                  className="flex items-center px-4 py-3 text-gray-800 transition-colors cursor-pointer hover:bg-blue-100"
                  onClick={handleUserProfileClick}
                >
                  <FaUserCircle className="mr-2 text-blue-600" />
                  <span className="font-medium">User Profile</span>
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