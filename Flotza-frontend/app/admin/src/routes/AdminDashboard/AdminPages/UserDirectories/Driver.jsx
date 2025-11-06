import React, { useState, useEffect, useRef } from "react";

// Centralized validation functions (can be reused if needed elsewhere)
function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function validatePAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase());
}

function validateAadhaar(aadhaar) {
  return /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const date = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date >= today;
}

// --- API INTEGRATION FUNCTIONS ---
// IMPORTANT: Replace these placeholder URLs with your actual backend API endpoints.
// These functions now use 'fetch' API to simulate real backend calls.

// Minimal mockHubsData for Assign Hub dropdown (remove when using real API)
const mockHubsData = [
  { name: "Mumbai Central Hub" },
  { name: "Delhi North Hub" },
  { name: "Bangalore South Hub" }
];

// Use the same API logic as your driver dashboard profile
const fetchDriversApi = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/api/auth/driver/?limit=100`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch drivers');
    return Array.isArray(data.data?.data)
      ? data.data.data.map(d => ({
        id: d.id || "",
        driver_id: d.driver_id || "",
        app_role: d.app_role || "",
        first_name: d.first_name || "",
        last_name: d.last_name || "",
        email: d.email || "",
        mobile: d.mobile || d.mobile_number || "",
        alternate_number: d.alternate_number || "",
        address_line1: d.address_line1 || d.address_line_1 || "",
        address_line2: d.address_line2 || d.address_line_2 || "",
        state: d.state || "",
        city: d.city || "",
        pincode: d.pincode || d.pin_code || "",
        current_address: d.current_address || "",
        assign_hub: d.assign_hub || "",
        vendor_code: d.vendor_code || "",
        vendor_name: d.vendor_name || "",
        pan_no: d.pan_no || d.pan_card_no || "",
        pan_photo: d.pan_photo || d.pan_card_photo || "",
        aadhaar_no: d.aadhaar_no || d.aadhar_no || "",
        aadhaar_front: d.aadhaar_front || d.aadhar_front_photo || "",
        aadhaar_back: d.aadhaar_back || d.aadhar_back_photo || "",
        lic_no: d.lic_no || d.driving_licence_no || "",
        lic_exp: d.lic_exp || "",
        lic_type: d.lic_type || "",
        lic_photo: d.lic_photo || d.driving_licence_photo || "",
        profile: d.profile || d.profile_picture || "",
        cod_holding: d.cod_holding || d.cod_holdings || "₹ 0",
        chalaan_holding: d.chalaan_holding || d.chalan_holdings || "₹ 0",
        total_deliveries: d.total_deliveries || 0,
        customer_ratings: d.customer_ratings || 0,
        referral_code: d.referral_code || "",
        reference_code: d.reference_code || "",
        status: d.status || "",
        status_remark: d.status_remark || "",
        last_device_used: d.last_device_used || "",
        current_device_using: d.current_device_using || "",
        created_date: d.created_date || d.created_at?.slice(0, 10) || "",
        updated_at: d.updated_at?.slice(0, 10) || "",
      }))
      : [];
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
};

const ADMIN_EDITABLE_FIELDS = [
  "app_role", "first_name", "last_name", "email", "mobile", "alternate_number",
  "address_line1", "address_line2", "state", "city", "pincode", "current_address_proof",
  "current_address", "pan_no", "pan_photo", "aadhaar_no", "aadhaar_front",
  "aadhaar_back", "lic_no", "lic_photo", "profile", "status", "status_remark"
];

const FIELD_NAME_MAP = {
  mobile: "mobile_number",
  pan_no: "pan_card_no",
  pan_photo: "pan_card_photo",
  aadhaar_no: "aadhar_no",
  aadhaar_front: "aadhar_front_photo",
  aadhaar_back: "aadhar_back_photo",
  lic_no: "driving_licence_no",
  lic_photo: "driving_licence_photo",
  profile: "profile_picture",
  pincode: "pin_code",
  address_line1: "address_line_1",
  address_line2: "address_line_2",
  // Add more if needed
};

// Replace the mock saveDriverApi with a real API call
const saveDriverApi = async (driver) => {
  try {
    const token = localStorage.getItem('token');
    const isNew = !driver.id; // New if no UUID

    const url = isNew
      ? `${import.meta.env.VITE_BASE_URL}/api/auth/driver/register`
      : `${import.meta.env.VITE_BASE_URL}/api/auth/driver/${driver.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const formData = new FormData();

    // List of fields that match exactly with your backend Joi schema
    const fields = [
      "first_name", "last_name", "email", "mobile_number", "alternate_number",
      "address_line_1", "address_line_2", "state", "city", "pin_code", "current_address",
      "vendor_code", "vendor_name", "pan_card_no", "aadhar_no", "driving_licence_no",
      "status", "status_remark", "reference_code"
    ];

    // Add all text fields
    fields.forEach((field) => {
      if (driver[field] !== undefined && driver[field] !== null && driver[field] !== '') {
        formData.append(field, driver[field]);
      }
    });

    // Add file fields only if available
    const fileFields = [
      "current_address_proof",
      "pan_card_photo",
      "aadhar_front_photo",
      "aadhar_back_photo",
      "driving_licence_photo",
      "profile_picture"
    ];

    fileFields.forEach((fileKey) => {
      const file = driver[fileKey];
      if (file instanceof File) {
        formData.append(fileKey, file);
      }
    });

    // Ensure at least one key present
    if ([...formData.entries()].length === 0) {
      throw new Error("No data to submit. Please provide at least one field.");
    }

    // API call
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // Handle errors
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignore if not JSON
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // alert(result.message || (isNew ? "Driver registered!" : "Driver updated!"));
    return result.data;

  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
};


function Driver() {
  const [drivers, setDrivers] = useState([]); // Initialize as empty array
  const [filter, setFilter] = useState({ search: "", status: "" });
  const [modalDriver, setModalDriver] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showStatsDriver, setShowStatsDriver] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const [apiError, setApiError] = useState(null); // New API error state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [popup, setPopup] = useState({ open: false, action: '', users: [], step: 1 });
  const [toast, setToast] = useState({ open: false, message: '' });
  const [loadingAction, setLoadingAction] = useState(false);
  const [SuccessMessage, setSuccessMessage] = useState(false);




  const driverModalRef = useRef();
  const statsModalRef = useRef();

  // Effect to fetch drivers on component mount
  useEffect(() => {
    const getDrivers = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const data = await fetchDriversApi(); // Calls the integrated API function
        setDrivers(data);
      } catch (err) {
        setApiError("Failed to fetch drivers. Please try again.");
        console.error("Fetch drivers error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    getDrivers();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to handle Escape key press and outside clicks for all modals
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
        closeStats();
      }
    };

    const handleClickOutside = (event) => {
      if (modalDriver && driverModalRef.current && !driverModalRef.current.contains(event.target)) {
        closeModal();
      }
      if (showStatsDriver && statsModalRef.current && !statsModalRef.current.contains(event.target)) {
        closeStats();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalDriver, showStatsDriver]);

  const filteredDrivers = drivers.filter((d) => {
    const fullName = `${d.first_name || ""} ${d.last_name || ""}`.trim();
    const matchSearch =
      fullName.toLowerCase().includes(filter.search.toLowerCase()) ||
      d.mobile.includes(filter.search);
    const matchStatus = filter.status === "" || d.status === filter.status;
    return matchSearch && matchStatus;
  });

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredDrivers.map(d => d.driver_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const deleteSelectedDrivers = async () => {
    try {
      const token = localStorage.getItem('token');

      if (selectedUsers.length === 0) {
        alert('Please select at least one driver to delete.');
        return;
      }

      // Get UUIDs (driver.id) from selected driver_id list
      const driversToDelete = drivers.filter(driver => selectedUsers.includes(driver.driver_id));
      const driverUuids = driversToDelete.map(driver => driver.id); // <- UUIDs

      if (driverUuids.length === 0) {
        throw new Error('No valid drivers found for deletion');
      }

      let response;
      if (driverUuids.length > 1) {
        response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/driver/multiple`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ driverIds: driverUuids }),
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/driver/${driverUuids[0]}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setDrivers(prevDrivers =>
          prevDrivers.filter(driver => !selectedUsers.includes(driver.driver_id))
        );

        const message = selectedUsers.length > 1
          ? `${selectedUsers.length} drivers deleted successfully!`
          : 'Driver deleted successfully!';

        alert(message);
        setSelectedUsers([]);
      } else {
        throw new Error(result.message || 'Deletion failed for unknown reasons');
      }

    } catch (error) {
      console.error("Error deleting drivers:", error);
      alert(`Deletion failed: ${error.message}`);
    }
  };


  // Handle action button click
  const handleActionClick = (action) => {
    if (selectedUsers.length === 0) {
      setToast({ open: true, message: 'Please select at least one user.' });
      setTimeout(closeToast, 2000);
      return;
    }

    if (action === 'Delete') {
      const confirmDelete = setPopup({ open: true, action: 'Delete', users: selectedUsers, step: 1 });
      if (confirmDelete) {
        deleteSelectedDrivers();
      }
    } else {
      setPopup({ open: true, action, users: selectedUsers, step: 1 });
    }
  };


  const closePopup = () => setPopup({ open: false, action: '', users: [], step: 1 });
  const closeToast = () => setToast({ open: false, message: '' });

  const handleConfirmAction = async () => {
    setLoadingAction(true);
    try {
      if (popup.action === 'Delete') {
        const remarks = prompt('Enter a remark for deletion:');
        if (!remarks) {
          setToast({ open: true, message: 'Deletion cancelled. Remark is required.' });
          setTimeout(closeToast, 3000);
          setLoadingAction(false);
          return;
        }
        for (const driverId of popup.users) {
          const driver = drivers.find(d => d.driver_id === driverId);
          if (driver) {
            try {
              await saveDriverApi({ ...driver, status_remark: remarks });
            } catch (e) { /* ignore error, still try to delete */ }
          }
        }
        await deleteSelectedDrivers();
        setToast({ open: true, message: 'Drivers deleted successfully.' });
        setTimeout(closeToast, 3000);
        setSelectedUsers([]);
        setPopup({ open: false, action: '', users: [], step: 1 });
      } else {
        setToast({ open: true, message: 'Updating status, please wait...' });
        const token = localStorage.getItem('token');
        const updatedStatus = popup.action;
        const remarks = prompt(`Enter a remark for status: ${updatedStatus}`);
        if (!remarks) {
          setToast({ open: true, message: 'Status update cancelled. Remark is required.' });
          setTimeout(closeToast, 3000);
          setLoadingAction(false);
          return;
        }
        const updates = drivers.map(driver => {
          if (popup.users.includes(driver.driver_id)) {
            return {
              ...driver,
              status: updatedStatus,
              status_remark: remarks,
            };
          }
          return driver;
        });
        for (const updatedDriver of updates) {
          await saveDriverApi(updatedDriver, drivers.find(d => d.driver_id === updatedDriver.driver_id));
        }
        const refreshedDrivers = await fetchDriversApi();
        setDrivers(refreshedDrivers);
        setToast({ open: true, message: `Status updated to '${updatedStatus}' for selected drivers.` });
        setTimeout(closeToast, 3000);
        setSelectedUsers([]);
        setPopup({ open: false, action: '', users: [], step: 1 });
      }
    } catch (error) {
      setToast({ open: true, message: 'Failed to update driver status.' });
      setTimeout(closeToast, 3000);
    } finally {
      setLoadingAction(false);
    }
  };



  const openModal = (driver = null, editMode = false) => {
    if (driver) {
      setModalDriver({ ...driver });
    } else {
      setModalDriver({
        id: `KBD${(drivers.length + 1).toString().padStart(3, "0")}`, // Temp ID for new entry before actual save
        first_name: "",
        last_name: "",
        app_role: "",
        email: "",
        mobile: "",
        alternate_number: "",
        address_line1: "",
        address_line2: "",
        state: "",
        city: "",
        pincode: "",
        current_address_proof: "",
        current_address: "",
        assign_hub: "",
        vendor_code: "",
        vendor_name: "",
        pan_no: "",
        pan_photo: "",
        aadhaar_no: "",
        aadhaar_front: "",
        aadhaar_back: "",
        lic_no: "",
        lic_exp: "",
        lic_type: "",
        lic_photo: "",
        profile: "",
        cod_holding: "₹ 0",
        chalaan_holding: "₹ 0",
        total_deliveries: 0,
        customer_ratings: 0,
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        reference_code: "",
        status: "New registration",
        status_remark: "",
        last_device_used: "",
        current_device_using: "",
        created_date: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString().slice(0, 10),
      });
    }
    setErrors({});
    setIsEditMode(editMode);
    setApiError(null); // Clear any previous API errors
  };

  const closeModal = () => {
    setModalDriver(null);
    setIsEditMode(false);
    setErrors({});
    setApiError(null);
  };

  const handleInputChange = (key, value) => {
    setModalDriver((prev) => {
      const updatedDriver = { ...prev, [key]: value };
      if (key === 'first_name' || key === 'last_name') {
        updatedDriver.name = `${updatedDriver.first_name || ''} ${updatedDriver.last_name || ''}`.trim();
      }
      return updatedDriver;
    });
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setModalDriver((prev) => ({ ...prev, [key]: file }));
    }
  };

  const validateAll = (driver) => {
    const errs = {};
    // Only validate format, not required
    if (driver.mobile && !validateMobile(driver.mobile))
      errs.mobile = "Mobile must be 10 digits and start with 6-9.";
    if (driver.email && !/\S+@\S+\.\S+/.test(driver.email))
      errs.email = "Invalid email address.";
    if (driver.pan_no && !validatePAN(driver.pan_no)) {
      errs.pan_no = "Invalid PAN format.";
    }
    if (driver.aadhaar_no && !validateAadhaar(driver.aadhaar_no)) {
      errs.aadhaar_no = "Aadhaar must be 12 digits.";
    }
    return errs;
  };

  const saveDriver = async (updatedDriver, originalDriver = null) => {
    const validationErrors = validateAll(updatedDriver);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation failed:", validationErrors);
      return;
    }

    setIsLoading(true);
    setApiError(null);
    try {
      await saveDriverApi(updatedDriver, originalDriver);
      const updatedDrivers = await fetchDriversApi();
      setDrivers(updatedDrivers);
      setSuccessMessage("Driver updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      closeModal();
    } catch (err) {
      setApiError("Failed to save driver. Please try again.");
      console.error("Save driver error:", err);
    } finally {
      setIsLoading(false);
    }

  };

  const openStats = (driver) => {
    setShowStatsDriver(driver);
  };

  const closeStats = () => {
    setShowStatsDriver(null);
  };

  // Define the form fields for the modal
  const driverFormFields = [
    { label: "Driver ID", key: "driver_id", type: "text", disabled: true },
    { label: "App Role", key: "app_role", type: "text" },
    { label: "First Name", key: "first_name", type: "text" },
    { label: "Last Name", key: "last_name", type: "text" },
    { label: "Email ID", key: "email", type: "email" },
    { label: "Mobile No.", key: "mobile", type: "tel" },
    { label: "Alternate Number", key: "alternate_number", type: "tel" },
    { label: "Address Line 1", key: "address_line1", type: "text" },
    { label: "Address Line 2", key: "address_line2", type: "text" },
    { label: "State", key: "state", type: "text" },
    { label: "City", key: "city", type: "text" },
    { label: "Pincode", key: "pincode", type: "text" },
    { label: "Current Address", key: "current_address", type: "textarea" },
    {
      label: "Assign Hub",
      key: "assign_hub",
      type: "select",
      options: ["", ...mockHubsData.map(hub => hub.name)], // Uses mockHubsData for options
    },
    { label: "Vendor Code", key: "vendor_code", type: "text" },
    { label: "Vendor Name", key: "vendor_name", type: "text" },
    { label: "PAN Card Number", key: "pan_no", type: "text" },
    { label: "Driving License No", key: "lic_no", type: "text" },
    { label: "Licence Expiry", key: "lic_exp", type: "date" },
    { label: "Licence Type", key: "lic_type", type: "text" },
    { label: "Aadhaar Number", key: "aadhaar_no", type: "text" },
    { label: "COD Holding", key: "cod_holding", type: "text", disabled: true },
    { label: "Chalaan Holding", key: "chalaan_holding", type: "text", disabled: true },
    { label: "Total Deliveries", key: "total_deliveries", type: "number", disabled: true },
    { label: "Customer Ratings", key: "customer_ratings", type: "number", disabled: true },
    { label: "Referral Code", key: "referral_code", type: "text", disabled: true },
    { label: "Reference Code", key: "reference_code", type: "text", disabled: true },
    {
      label: "Status",
      key: "status",
      type: "select",
      options: ["New registration", "Active", "Suspended", "Terminated"],
      dynamic_disabled: (driver, isEditMode) => {
        return !isEditMode || (driver && driver.first_name === "");
      }
    },
    { label: "Status Remark", key: "status_remark", type: "text" },
    { label: "Last Device Used", key: "last_device_used", type: "text", disabled: true },
    { label: "Current Device Using", key: "current_device_using", type: "text", disabled: true },
    { label: "Created Date", key: "created_date", type: "date", disabled: true },
    { label: "Updated At", key: "updated_at", type: "date", disabled: true },
  ];

  const photoFormFields = [
    { label: "Upload Current Address Proof", key: "current_address_proof" },
    { label: "PAN Card Photo", key: "pan_photo" },
    { label: "Aadhaar Front Photo", key: "aadhaar_front" },
    { label: "Aadhaar Back Photo", "key": "aadhaar_back" },
    { label: "Driving License Photo", key: "lic_photo" },
    { label: "Profile Picture", key: "profile" },
  ];

  const handleCheckboxChange = (driver_id) => {
    setSelectedUsers(prev =>
      prev.includes(driver_id)
        ? prev.filter(id => id !== driver_id)
        : [...prev, driver_id]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-7xl mx-auto font-inter">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .font-inter {
            font-family: 'Inter', sans-serif;
        }
        `}
      </style>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-800">
        Driver List
      </h2>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {apiError}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or mobile"
          className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <select
          className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="New registration">New registration</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Terminated">Terminated</option>
        </select>
        <button
          onClick={() => openModal(null, true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-200"
        >
          Add New Driver
        </button>

        <div className="flex flex-wrap gap-2 mt-2">
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm border border-green-700"
            onClick={() => handleActionClick('Approved')}
          >
            Approve
          </button>
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-colors duration-200 shadow-sm border border-yellow-700"
            onClick={() => handleActionClick('Hold')}
          >
            Hold
          </button>
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors duration-200 shadow-sm border border-orange-600"
            onClick={() => handleActionClick('Suspended')}
          >
            Suspend
          </button>
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-colors duration-200 shadow-sm border border-gray-900"
            onClick={() => handleActionClick('Blacklisted')}
          >
            Blacklist
          </button>
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200 shadow-sm border border-red-700"
            onClick={() => handleActionClick('Delete')}
          >
            Delete
          </button>
        </div>

      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 inline-block"></div>
          <p className="text-gray-700 mt-2">Loading drivers...</p>
        </div>
      )}

      {/* Driver Table */}
      {!isLoading && (
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg bg-white">
          <table className="min-w-full text-sm table-auto border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-3 border border-gray-300 text-center font-semibold">
                  <input
                    type="checkbox"
                    checked={
                      filteredDrivers.length > 0 &&
                      selectedUsers.length === filteredDrivers.length
                    }
                    onChange={handleSelectAll}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate =
                          selectedUsers.length > 0 &&
                          selectedUsers.length < filteredDrivers.length;
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                {[
                  "Driver ID",
                  "Name",
                  "Mobile",
                  "Email",
                  "City",
                  "Status",
                  "Assigned Hub",
                  "Actions",
                ].map((header, idx) => (
                  <th key={idx} className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500 border border-gray-300">
                    No drivers found.
                  </td>
                </tr>
              )}
              {filteredDrivers.map((d, index) => (
                <tr
                  key={d.driver_id}
                  className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="p-3 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(d.driver_id)}
                      onChange={() => handleCheckboxChange(d.driver_id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{d.driver_id}</td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{`${d.first_name || ""} ${d.last_name || ""}`}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{d.mobile}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{d.email}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{d.city}</td>
                  <td className="p-3 border border-gray-300">
                    <span
                      className={`text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm ${d.status === "Active"
                        ? "bg-green-500"
                        : d.status === "Suspended"
                          ? "bg-red-500"
                          : d.status === "New registration"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300 text-gray-700">{d.assign_hub || "N/A"}</td>
                  <td className="p-3 border border-gray-300">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(d, false)}
                        className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {popup.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div className="rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] text-center bg-white border border-gray-200">
            <h3 className="mb-2 text-lg font-semibold">Confirm {popup.action}</h3>
            <p className="mb-4">
              Are you sure you want to <span className="font-bold">{popup.action}</span> {popup.users.length} driver(s)?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                onClick={handleConfirmAction}
              >
                Yes
              </button>
              <button
                className="px-4 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={closePopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Driver Details/Edit Modal Overlay */}
      {modalDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
          <div ref={driverModalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-3xl font-bold p-1 rounded-full hover:bg-gray-100"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {isEditMode && modalDriver.first_name === ""
                ? "Add New Driver"
                : isEditMode
                  ? "Edit Driver Details"
                  : "Driver Details"}
            </h3>

            {/* API Error Message within modal */}
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {apiError}</span>
              </div>
            )}

            {/* General Information Section */}
            <h4 className="font-semibold text-lg mb-3 mt-4 text-gray-700">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driverFormFields
                .filter(
                  (field) =>
                    ![
                      "current_address_proof",
                      "pan_photo",
                      "aadhaar_front",
                      "aadhaar_back",
                      "lic_photo",
                      "profile",
                    ].includes(field.key)
                )
                .map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {errors[field.key] && (
                        <span className="text-red-600 ml-2 text-xs">
                          {errors[field.key]}
                        </span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={modalDriver[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={!isEditMode || field.disabled || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode || field.disabled || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors[field.key]
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}
                        rows="3"
                      ></textarea>
                    ) : field.type === "select" ? (
                      <select
                        value={modalDriver[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={!isEditMode || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))
                          ? "bg-gray-100 cursor-not-allowed"
                          : "border-gray-300"
                          }`}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={modalDriver[field.key] || (field.type === "number" ? 0 : "")}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={!isEditMode || field.disabled || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))}
                        className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode || field.disabled || (field.dynamic_disabled && field.dynamic_disabled(modalDriver, isEditMode))
                          ? "bg-gray-100 cursor-not-allowed"
                          : errors[field.key]
                            ? "border-red-500"
                            : "border-gray-300"
                          }`}
                      />
                    )}
                  </div>
                ))}
            </div>

            {/* Documents and Photos Section */}
            <h4 className="font-semibold text-lg mb-3 mt-6 text-gray-700">Documents and Photos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photoFormFields.map((field) => (
                <div key={field.key} className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {isEditMode ? (
                    <>
                      <label
                        htmlFor={`file-upload-${field.key}`}
                        className="cursor-pointer block h-32 w-full border border-dashed border-gray-400 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-200"
                      >
                        {modalDriver[field.key] ? (
                          <img
                            src={
                              modalDriver[field.key].startsWith('http')
                                ? modalDriver[field.key]
                                : `${BACKEND_URL}/uploads/${modalDriver[field.key]}`
                            }
                            alt={field.label}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/150x150?text=No+Image";
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 text-center text-sm p-2">Click to Upload</span>
                        )}
                      </label>
                      <input
                        id={`file-upload-${field.key}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, field.key)}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <img
                      src={
                        modalDriver[field.key]
                          ? (modalDriver[field.key].startsWith('http')
                            ? modalDriver[field.key]
                            : `${BACKEND_URL}/uploads/${modalDriver[field.key]}`)
                          : "https://placehold.co/150x150?text=No+Image"
                      }
                      alt={field.label}
                      className="h-32 w-full object-cover border border-gray-300 rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/150x150?text=No+Image";
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end items-center gap-3 border-t pt-4">
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition duration-200"
                >
                  Edit
                </button>
              )}
              {isEditMode && (
                <button
                  onClick={() => saveDriver(modalDriver)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              )}
              {isEditMode && (
                <button
                  onClick={() => setIsEditMode(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Driver Stats Modal (This modal will no longer be opened directly but is kept if you have other plans for it) */}
      {showStatsDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div ref={statsModalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeStats}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-3xl font-bold p-1 rounded-full hover:bg-gray-100"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Driver Stats - {showStatsDriver.first_name} {showStatsDriver.last_name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <p><strong>COD Holding:</strong> {showStatsDriver.cod_holding}</p>
              <p><strong>Chalaan Holding:</strong> {showStatsDriver.chalaan_holding}</p>
              <p><strong>Total Deliveries:</strong> {showStatsDriver.total_deliveries}</p>
              <p><strong>Customer Ratings:</strong> {showStatsDriver.customer_ratings}</p>
              <p><strong>Referral Code:</strong> {showStatsDriver.referral_code}</p>
              <p><strong>Reference Code:</strong> {showStatsDriver.reference_code}</p>
              <p><strong>Last Device Used:</strong> {showStatsDriver.last_device_used}</p>
              <p><strong>Current Device Using:</strong> {showStatsDriver.current_device_using}</p>
              <p><strong>Created Date:</strong> {showStatsDriver.created_date}</p>
              <p><strong>Updated At:</strong> {showStatsDriver.updated_at}</p>
            </div>
            <div className="mt-6 flex justify-end border-t pt-4">
              <button onClick={closeStats} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200 shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.open && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-900 text-white rounded shadow-lg animate-fade-in">
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default Driver;
