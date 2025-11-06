import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./CustomerDashboardUtils/Sidebar";
import Header from "./CustomerDashboardUtils/Header";
import { CiChat1 } from "react-icons/ci";
import PlaceOrder from "./CustomerPages/PlaceOrder";
import OrderHistory from "./CustomerPages/OrderHistory";
import PlaceManagement from "./CustomerPages/PlaceManagement";
import Support from "./CustomerPages/Support";
import TrackingStatus from "./CustomerPages/TrackingStatus";
import Dashboard from "./CustomerPages/Dashboard";
import Wallet from "./CustomerPages/Wallet";
import UserProfile from "./CustomerPages/UserProfile";
import { CgLayoutGrid } from "react-icons/cg";

const CustomerDashboard = () => {
  const [renderPage, setRenderPage] = useState(() => {
    const savedPage = localStorage.getItem('lastActiveCustomerPage');
    return savedPage || "";
  });

  useEffect(() => {
    if (typeof renderPage === 'string') {
      localStorage.setItem('lastActiveCustomerPage', renderPage);
    }
  }, [renderPage]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reduxUser = useSelector(state => state.auth.user);
  const [userSession, setUserSession] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    userId: "",
    mobileNumber: "",
    emailId: "",
    companyName: "",
    gstNo: "",
    Pincode: "",
    Address: "",
    referralCode: "",
    userType: "",
    panNo: "",
    walletBalance: "",
    accountDate: "",
    lastDevice: "",
    ipAddress: "",
    lastLogin: "",
    profileImage: ""
  });
  const [isFetching, setIsFetching] = useState(false);

  // Check localStorage for saved user data
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('user');
      if (savedUserData && savedUserData !== 'undefined' && savedUserData !== 'null') {
        try {
          const parsedUserData = JSON.parse(savedUserData);
          if (parsedUserData && typeof parsedUserData === 'object') {
            setUserSession({
              fullName: parsedUserData.first_name || parsedUserData.username || "",
              firstName: parsedUserData.first_name || parsedUserData.username || "",
              lastName: parsedUserData.last_name || "",
              userId: parsedUserData.id || "",
              mobileNumber: parsedUserData.mobile_number || "",
              emailId: parsedUserData.email || "",
              companyName: parsedUserData.companyName || "",
              gstNo: parsedUserData.gstNo || "",
              Pincode: parsedUserData.Pincode || "",
              Address: parsedUserData.Address || "",
              referralCode: parsedUserData.Referral || "",
              userType: parsedUserData.role || parsedUserData.app_role || "Fixed",
              panNo: parsedUserData.panNo || "",
              walletBalance: parsedUserData.walletBalance || "0",
              accountDate: parsedUserData.createdAt || "",
              lastDevice: parsedUserData.lastDevice || "",
              ipAddress: parsedUserData.ipAddress || "",
              lastLogin: parsedUserData.lastLogin || "",
              profileImage: parsedUserData.profileImage || ""
            });
          } else {
            localStorage.removeItem('user');
          }
        } catch (parseError) {
          localStorage.removeItem('user');
        }
      } else if (savedUserData === 'undefined' || savedUserData === 'null') {
        localStorage.removeItem('user');
      }
    } catch (error) {
      localStorage.removeItem('user');
    }
  }, []);

  // Function to fetch and set user data
  const fetchAndSetUserData = async () => {
    if (isFetching) return;
    setIsFetching(true);

    const token = localStorage.getItem('token');
    const savedUserData = localStorage.getItem('user');
    let role = 'customer';
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        role = parsedUserData.role || parsedUserData.app_role || 'customer';
      } catch (error) {}
    }

    if (reduxUser && reduxUser.id && reduxUser.email) {
      setUserSession({
        fullName: reduxUser.first_name || reduxUser.full_name || "",
        firstName: reduxUser.first_name || reduxUser.full_name || "",
        lastName: reduxUser.last_name || "",
        userId: reduxUser.id || "",
        mobileNumber: reduxUser.mobile_number || "",
        emailId: reduxUser.email || "",
        companyName: reduxUser.companyName || "",
        gstNo: reduxUser.gstNo || "",
        Pincode: reduxUser.Pincode || "",
        Address: reduxUser.Address || "",
        referralCode: reduxUser.Referral || "",
        userType: reduxUser.approle || reduxUser.role || "Fixed",
        panNo: reduxUser.panNo || "",
        walletBalance: reduxUser.walletBalance || "0",
        accountDate: reduxUser.createdAt || "",
        lastDevice: reduxUser.lastDevice || "",
        ipAddress: reduxUser.ipAddress || "",
        lastLogin: reduxUser.lastLogin || "",
        profileImage: reduxUser.profileImage || ""
      });
      setIsFetching(false);
      return;
    }

    if (token) {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:1337';
        const endpoint = `${baseUrl}/api/auth/${role}/me`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });


        if (!response.ok) {
          if (reduxUser) {
            setUserSession({
              fullName: reduxUser.first_name || reduxUser.username || "",
              firstName: reduxUser.first_name || reduxUser.username || "",
              lastName: reduxUser.last_name || "",
              userId: reduxUser.id || "",
              mobileNumber: reduxUser.mobile_number || "",
              emailId: reduxUser.email || "",
              companyName: reduxUser.companyName || "",
              gstNo: reduxUser.gstNo || "",
              Pincode: reduxUser.Pincode || "",
              Address: reduxUser.Address || "",
              referralCode: reduxUser.Referral || "",
              userType: reduxUser.approle || reduxUser.role || "Fixed",
              panNo: reduxUser.panNo || "",
              walletBalance: reduxUser.walletBalance || "0",
              accountDate: reduxUser.createdAt || "",
              lastDevice: reduxUser.lastDevice || "",
              ipAddress: reduxUser.ipAddress || "",
              lastLogin: reduxUser.lastLogin || "",
              profileImage: reduxUser.profileImage || ""
            });
          }
          setIsFetching(false);
          return;
        }

        const apiData = await response.json();
        const fetchedUser = apiData.data?.[role] || apiData.data?.user || apiData.data || apiData || {};
        
        // Format profile image URL properly
        let profileImageUrl = "";
        if (fetchedUser.profile_picture) {
          if (fetchedUser.profile_picture.startsWith('http')) {
            profileImageUrl = fetchedUser.profile_picture;
          } else {
            // Use the same base URL as the API
            profileImageUrl = `${baseUrl}/${fetchedUser.profile_picture}`;
          }
        }

        setUserSession({
          firstName: fetchedUser.first_name || "",
          lastName: fetchedUser.last_name || "",
          fullName: `${fetchedUser.first_name || ""} ${fetchedUser.last_name || ""}`.trim(),
          userId: fetchedUser.customer_id || "",
          altMobileNumber: fetchedUser.alternate_number || "",
          mobileNumber: fetchedUser.mobile_number || "",
          emailId: fetchedUser.email || "",
          companyName: fetchedUser.company_name || "",
          gstNo: fetchedUser.gst_no || "",
          firstLineAddress: fetchedUser.first_line_address || "",
          secondLineAddress: fetchedUser.second_line_address || "",
          state: fetchedUser.state || "",
          city: fetchedUser.city || "",
          pinCode: fetchedUser.pin_code || "",
          referralCode: fetchedUser.referral_code || "",
          userType: fetchedUser.app_role || fetchedUser.role || role || "",
          panNo: fetchedUser.pan_card_no || "",
          walletBalance: fetchedUser.wallet_balance || "",
          accountDate: fetchedUser.created_at || "",
          adhaarNo: fetchedUser.adhar_no || "",
          referenceCode: fetchedUser.reference_code || "",
          lastUpdated: fetchedUser.updated_at || "",
          profileImage: profileImageUrl
        });

        

      } catch (error) {
        if (reduxUser) {
          setUserSession({
            fullName: reduxUser.first_name || reduxUser.username || "",
            firstName: reduxUser.first_name || reduxUser.username || "",
            lastName: reduxUser.last_name || "",
            userId: reduxUser.id || "",
            mobileNumber: reduxUser.mobile_number || "",
            emailId: reduxUser.email || "",
            companyName: reduxUser.companyName || "",
            gstNo: reduxUser.gstNo || "",
            Pincode: reduxUser.Pincode || "",
            Address: reduxUser.Address || "",
            referralCode: reduxUser.Referral || "",
            userType: reduxUser.approle || reduxUser.role || "Fixed",
            panNo: reduxUser.panNo || "",
            walletBalance: reduxUser.walletBalance || "0",
            accountDate: reduxUser.createdAt || "",
            lastDevice: reduxUser.lastDevice || "",
            ipAddress: reduxUser.ipAddress || "",
            lastLogin: reduxUser.lastLogin || "",
            profileImage: reduxUser.profileImage || ""
          });
        }
      }
    } else {
      if (reduxUser) {
        setUserSession({
          fullName: reduxUser.first_name || reduxUser.username || "",
          firstName: reduxUser.first_name || reduxUser.username || "",
          lastName: reduxUser.last_name || "",
          userId: reduxUser.id || "",
          mobileNumber: reduxUser.mobile_number || "",
          emailId: reduxUser.email || "",
          companyName: reduxUser.companyName || "",
          gstNo: reduxUser.gstNo || "",
          Pincode: reduxUser.Pincode || "",
          Address: reduxUser.Address || "",
          referralCode: reduxUser.Referral || "",
          userType: reduxUser.approle || reduxUser.role || "Fixed",
          panNo: reduxUser.panNo || "",
          walletBalance: reduxUser.walletBalance || "0",
          accountDate: reduxUser.createdAt || "",
          lastDevice: reduxUser.lastDevice || "",
          ipAddress: reduxUser.ipAddress || "",
          lastLogin: reduxUser.lastLogin || "",
          profileImage: reduxUser.profileImage || ""
        });
      }
    }
    setIsFetching(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchAndSetUserData();
    }
    return () => { isMounted = false; };
  }, [reduxUser]);

  const updateUserSession = (newData) => {
    setUserSession(prevData => {
      const updatedData = {
        ...prevData,
        ...newData
      };
      
      // Ensure firstName is set from either firstName or fullName
      if (newData.firstName && !updatedData.fullName) {
        updatedData.fullName = `${newData.firstName} ${newData.lastName || ''}`.trim();
      } else if (newData.fullName && !updatedData.firstName) {
        const nameParts = newData.fullName.split(' ');
        updatedData.firstName = nameParts[0] || '';
        updatedData.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      return updatedData;
    });
  };

  return (
    <div className="relative">
      <Header setRenderPage={setRenderPage} updateUserSession={updateUserSession} userSession={userSession} />
      <div className="flex min-h-screen">
        <Sidebar
          setRenderPage={setRenderPage}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />
        <div className={`flex-1 p-5 text-black mt-17 ${sidebarOpen ? "ms-60" : "ms-20"}`}>
          {renderPage === "place_order" ? (
            <PlaceOrder />
          ) : renderPage === "order_history" ? (
            <OrderHistory />
          ) : renderPage === "place_manager" ? (
            <PlaceManagement
              customerId={userSession.userId}
              customerFirstName={userSession.fullName || userSession.firstName || ""}
            />
          ) : renderPage === "support" ? (
            <Support />
          ) : renderPage === "tracking_status" ? (
            <TrackingStatus />
          ) : renderPage === "wallet" ? (
            <Wallet />
          ) : renderPage === "user_profile" ? (
            <UserProfile
              isAdmin={true}
              updateUserSession={updateUserSession}
              initialData={userSession}
              token={localStorage.getItem('token')}
            />
          ) : (
            <Dashboard setRenderPage={setRenderPage} />
          )}
        </div>
        <div className="fixed flex p-2 text-white bg-yellow-600 rounded-full cursor-pointer bottom-5 right-5 hover:scale-105">
          <CiChat1 className="text-3xl" /> Chat with US
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;