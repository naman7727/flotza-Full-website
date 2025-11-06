import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

const VendorHeader = ({ vendorData = {}, handleLogout, setRenderPage }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get vendor profile from Redux
  const { vendorProfile } = useSelector((state) => state.auth);
  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:1337';

  // Debug: Log when vendorProfile changes
  useEffect(() => {
  }, [vendorProfile]);

  // Use vendor profile from Redux if available, otherwise fallback to props
  const displayVendor = vendorProfile || vendorData;
  
  // Construct proper image URL
  let profileImageUrl = displayVendor?.profile_photo || "";
  if (profileImageUrl && !profileImageUrl.startsWith('http')) {
    profileImageUrl = `${baseURL}/${profileImageUrl}`;
  }

  // Get vendor name - only show first name
  const vendorName = displayVendor?.first_name || displayVendor?.name || "Vendor";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserProfileClick = () => {
    setRenderPage("profile");
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  return (
    <div className="flex justify-between items-center p-2 px-8 bg-[#1f2937] text-white sticky top-0 w-full h-17 z-40">
      <div className="flex items-center space-x-2">
        {/* <img
          src="src/assets/logo.png"
          className="border rounded-full shadow-lg w-13 h-13"
          alt="Logo"
        /> */}
        <h1 className="text-2xl font-bold">Flotza Vendor</h1>
      </div>

      <div className="flex items-center space-x-5">
        <IoMdNotificationsOutline className="p-2 text-4xl rounded-full cursor-pointer hover:bg-blue-600" />
        <div className="relative flex items-center space-x-2" ref={dropdownRef}>
          <span className="text-white cursor-pointer">
            Hi, {vendorName}
          </span>
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              className="object-cover w-10 h-10 border-2 border-blue-500 rounded-full cursor-pointer"
              alt="Vendor Avatar"
              onClick={toggleProfileDropdown}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/40?text=V";
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center w-10 h-10 font-semibold text-white bg-blue-600 border-2 border-blue-500 rounded-full cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              {vendorName?.charAt(0).toUpperCase() || 'V'}
            </div>
          )}

          {showProfileDropdown && (
            <div
              className="absolute right-0 z-50 w-48 py-1 mt-2 text-gray-800 bg-white rounded-md shadow-lg top-full"
            >
              <div
                className="flex items-center px-4 py-3 transition-colors cursor-pointer hover:bg-blue-100"
                onClick={handleUserProfileClick}
              >
                <FaUserCircle className="mr-2 text-blue-600" />
                <span className="font-medium">Profile</span>
              </div>
              <div
                className="flex items-center px-4 py-3 transition-colors cursor-pointer hover:bg-blue-100"
                onClick={handleLogout}
              >
                <span className="font-medium text-red-600">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorHeader;