import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../lib/auth/authSlice";

// Import components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TripManagement from "./components/TripManagement";
import DeliveryHistory from "./components/DeliveryHistory";
import StatusCard from "./components/StatusCard";
import ServiceRenderer from "./components/ServiceRenderer";

// Import services


const DriverDashboard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State variables
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tripData, setTripData] = useState(null);
  const [showTrips, setShowTrips] = useState(false);
  const [pickedUpTrips, setPickedUpTrips] = useState([]);
  const [selectedService, setSelectedService] = useState('Intra SDD');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter and search state for history
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);

  const [completedDeliveries, setCompletedDeliveries] = useState([
    {
      id: "DEL-10234",
      tripId: "TRIP-5678",
      date: "2025-04-20",
      pickupAddress: "Andheri, Mumbai",
      dropAddress: "Bandra, Mumbai",
      totalOrders: 5,
      status: "Completed",
    },
    {
      id: "DEL-10235",
      tripId: "TRIP-5679",
      date: "2025-04-18",
      pickupAddress: "Powai, Mumbai",
      dropAddress: "Chembur, Mumbai",
      totalOrders: 3,
      status: "Completed",
    },
    {
      id: "DEL-10236",
      tripId: "TRIP-5680",
      date: "2025-04-15",
      pickupAddress: "Dadar, Mumbai",
      dropAddress: "Worli, Mumbai",
      totalOrders: 4,
      status: "Completed",
    },
    {
      id: "DEL-10237",
      tripId: "TRIP-5681",
      date: "2025-04-10",
      pickupAddress: "Goregaon, Mumbai",
      dropAddress: "Malad, Mumbai",
      totalOrders: 2,
      status: "Completed",
    },
  ]);
  const [activeDeliveryCount, setActiveDeliveryCount] = useState(0);

  // Handle search and filtering for delivery history
  useEffect(() => {
    let filtered = [...completedDeliveries];

    // Filter by date range
    if (fromDate) {
      filtered = filtered.filter((item) => item.date >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter((item) => item.date <= toDate);
    }

    // Filter by search term (trip ID, delivery ID, location, etc)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.id.toLowerCase().includes(term) ||
          item.tripId.toLowerCase().includes(term) ||
          item.pickupAddress.toLowerCase().includes(term) ||
          item.dropAddress.toLowerCase().includes(term)
      );
    }

    setFilteredHistory(filtered);
  }, [completedDeliveries, fromDate, toDate, searchTerm]);

  useEffect(() => {
    // Check if user is logged in
    const jwt = localStorage.getItem("token");
    const storedDriverData = localStorage.getItem("driverData");

    // Try to use stored driver data first (if it exists)
    if (storedDriverData) {
      try {
        const parsedData = JSON.parse(storedDriverData);
        setDriverData(parsedData);
        console.log("Using cached driver data:", parsedData);
      } catch (e) {
        console.error("Error parsing stored driver data:", e);
        localStorage.removeItem("driverData"); // Remove invalid data
      }
    }

    // Check for pickup success from navigation state
    if (location.state?.pickupSuccess) {
      const orderId = location.state.orderId;

      // Add to picked up trips
      setPickedUpTrips((prev) => [...prev, orderId]);
      setActiveDeliveryCount((prev) => prev + 1);

      // Show success message
      alert(
        location.state.message ||
          `Order ${orderId} has been marked as picked up`
      );

      // Clear navigation state
      window.history.replaceState({}, document.title);
    }

    // Fetch driver data from API using fetch (not RTK)
    const fetchData = async () => {
      if (!jwt) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/driver/me`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("driverData");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch driver profile");
        }
        const data = await res.json();
        const driverData = data.data || data;
        setDriverData(driverData);
        
        // Store driver data in localStorage for caching
        localStorage.setItem("driverData", JSON.stringify(driverData));
        console.log("Fetched and stored driver data:", driverData);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        // If API fails but we have stored data, use that
        if (storedDriverData) {
          try {
            const parsedData = JSON.parse(storedDriverData);
            setDriverData(parsedData);
            console.log("Using cached driver data after API failure:", parsedData);
          } catch (e) {
            console.error("Error parsing cached driver data:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, location.state]);

  // Handle logout
  const handleLogout = async () => {
    try {
      dispatch(logout());
      localStorage.removeItem("driverData");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = (updatedData) => {
    // Update the driver data state which will update the header
    setDriverData(updatedData);
    // Store updated data in localStorage
    localStorage.setItem("driverData", JSON.stringify(updatedData));
    console.log("Profile updated and stored:", updatedData);
  };

  // Handle status toggle
  const handleStatusToggle = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/driver/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("driverData");
          navigate("/login");
          return;
        }
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      if (data.success) {
        // Update local state
        const updatedDriverData = { ...driverData, status: newStatus };
        setDriverData(updatedDriverData);
        localStorage.setItem("driverData", JSON.stringify(updatedDriverData));
        
        // Update trip visibility based on status
        if (newStatus === 'Active') {
          setShowTrips(true);
          // Fetch available trips when going active
          fetchAvailableTrips();
        } else {
          setShowTrips(false);
          setTripData(null);
        }
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  // Fetch available trips for active drivers
  const fetchAvailableTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/trips/available`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTripData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching available trips:', error);
    }
  };

  // Monitor driver status and update trip visibility
  useEffect(() => {
    if (driverData) {
      if (driverData.status === 'Active') {
        setShowTrips(true);
        fetchAvailableTrips();
      } else {
        setShowTrips(false);
        setTripData(null);
      }
    }
  }, [driverData?.status]);

  // Check if current route is a nested route
  const isNestedRoute = location.pathname !== "/driver-dashboard";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        driverData={driverData}
        onStatusToggle={handleStatusToggle}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          driverData={driverData} 
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          {isNestedRoute ? (
            <Outlet context={{ driverData, onProfileUpdate: handleProfileUpdate }} />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <>
                  <StatusCard driverData={driverData} />

                  {showTrips && tripData && (
                    <TripManagement
                      tripData={tripData}
                      pickedUpTrips={pickedUpTrips}
                      setPickedUpTrips={setPickedUpTrips}
                      setActiveDeliveryCount={setActiveDeliveryCount}
                      setCompletedDeliveries={setCompletedDeliveries}
                    />
                  )}
                  
                  <ServiceRenderer 
                    selectedService={selectedService}
                  />
                </>
              )}
              {activeTab === "deliveryHistory" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Delivery History</h2>
                  <DeliveryHistory
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filteredHistory={filteredHistory}
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;