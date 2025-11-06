import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setVendorProfile, setVendorProfileLoading } from "../../lib/auth/authSlice";

import VendorSidebar from "./VendorDashboardUtils/VendorSidebar";
import VendorHeader from "./VendorDashboardUtils/VendorHeader";

import Dashboard from "./VendorDashboardPages/VendorDashboard";
import MyDrivers from "./VendorDashboardPages/MyDrivers";
import MyVehicles from "./VendorDashboardPages/MyVehicles";
import Reports from "./VendorDashboardPages/Reports";
import Settings from "./VendorDashboardPages/Settings";
import VendorProfile from "./VendorDashboardPages/VendorProfile";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redux state is now persisted!
  const token = useSelector((state) => state.auth.token);
  const vendor = useSelector((state) => state.auth.user);
  const vendorProfile = useSelector((state) => state.auth.vendorProfile);
  const vendorProfileLoading = useSelector((state) => state.auth.vendorProfileLoading);
  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:1337';

  // Track if this is the initial load
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!token || !vendor || vendor.approle !== "vendor") {
      navigate("/vendor-dashboard");
    }
  }, [token, vendor, navigate]);

  // Fetch vendor profile data when dashboard loads - always fetch fresh data
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!token || !vendor) {
        return;
      }
      
      try {
        // Set loading state
        dispatch(setVendorProfileLoading(true));
        
        const response = await fetch(`${baseURL}/api/auth/vendor/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch vendor profile. Status: ${response.status}`);
        }

        const data = await response.json();
        const profileData = data.data;
        
        // Store in Redux - this will trigger header update and clear loading
        dispatch(setVendorProfile(profileData));
        setInitialLoadComplete(true);
      } catch (error) {
        // Clear loading state even on error
        dispatch(setVendorProfileLoading(false));
        setInitialLoadComplete(true);
      }
    };

    // Always fetch on dashboard load to ensure fresh data
    fetchVendorProfile();
  }, [token, vendor, dispatch, baseURL]); // Removed vendorProfile dependency to always fetch

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");
  };

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "drivers":
        return <MyDrivers />;
      case "vehicles":
        return <MyVehicles />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      case "profile":
        return <VendorProfile />;
      default:
        return <Dashboard />;
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center p-8 rounded-lg ">
        <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="font-medium text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );

  // Show loading spinner only during initial load (not when navigating to profile)
  if (vendorProfileLoading && !initialLoadComplete && !vendorProfile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <VendorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 overflow-auto">
        <VendorHeader
          vendorData={vendor}
          handleLogout={handleLogout}
          setRenderPage={setActiveTab}
        />
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default VendorDashboard;
