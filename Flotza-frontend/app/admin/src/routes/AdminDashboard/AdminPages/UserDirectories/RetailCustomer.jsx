import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const RetailCustomer = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  // State for user data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for selected users
  const [selectedUsers, setSelectedUsers] = useState([]);
  // Add state for popup and toast
  const [popup, setPopup] = useState({ open: false, action: '', users: [], step: 1, remark: '' });
  const [toast, setToast] = useState({ open: false, message: '' });

  // New state for viewing/editing a single user
  const [viewingUser, setViewingUser] = useState(null);
  // State for editable user data within the view modal
  const [editableUser, setEditableUser] = useState(null);
  // State to control edit mode in the view modal
  const [isEditing, setIsEditing] = useState(false);

  // Open modal if userId param is present
  useEffect(() => {
    if (userId && users.length > 0) {
      const user = users.find(u => String(u.userId) === String(userId));
      if (user) {
        setViewingUser(user);
        setEditableUser({ ...user });
        setIsEditing(false);
      }
    } else {
      setViewingUser(null);
      setEditableUser(null);
      setIsEditing(false);
    }
  }, [userId, users]);


  // State for filters
  const [filters, setFilters] = useState({
    searchText: '',
    status: '',
    walletMin: -5000,
    walletMax: 50000,
    userType: '',
    city: '',
    pin: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchCustomersApi = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('Response:', res);
        if (res.status === 404) {
          console.error('API endpoint not found:', res);
          return [];
        }
        const data = await res.json();
        console.log('Data:', data.data);
        if (!data.success) throw new Error(data.message || 'Failed to fetch customers');
        return Array.isArray(data.data?.data)
          ? data.data.data.map(c => ({
            userId: c.customer_id || "",
            appRole: c.app_role || "",
            firstName: c.first_name || "",
            lastName: c.last_name || "",
            fullName: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            mobile: c.mobile || c.mobile_number || "",
            alternateNumber: c.alternate_number || "",
            email: c.email || "",
            companyName: c.company_name || "",
            firstLineAddress: c.first_line_address || "",
            secondLineAddress: c.second_line_address || "",
            state: c.state || "",
            city: c.city || "",
            pin: c.pincode || c.pin_code || "",
            fullAddress: `${c.first_line_address || ''} ${c.second_line_address || ''}, ${c.city || ''}, ${c.state || ''} - ${c.pincode || ''}`.trim().replace(/,\s*-/g, '-').replace(/^,\s*/, '').replace(/,\s*,/g, ','),
            gstNo: c.gst_no || "",
            adharNo: c.adhar_no || "",
            adharFrontPhoto: c.adhar_front_photo || "",
            adharBackPhoto: c.adhar_back_photo || "",
            panCardNo: c.pan_card_no || "",
            panCardPhoto: c.pan_card_photo || "",
            profilePicture: c.profile_picture || "",
            walletBalance: parseInt((c.wallet_balance || "0").toString().replace(/[^0-9\-]/g, '')) || 0,
            referralCode: c.referral_code || "",
            referenceCode: c.reference_code || "",
            registrationDateTime: c.registration_date_time || "",
            status: c.status || "",
            statusRemarks: c.status_remarks || "",
            createdAt: c.created_at || "",
            updatedAt: c.updated_at || "",
          }))
          : [];

      } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
      }
    };

    fetchCustomersApi().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);


  // Update filter state
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Update wallet range and ensure min <= max
  const handleWalletRangeChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;

    setFilters(prev => {
      if (name === 'walletMin' && newValue > prev.walletMax) {
        return { ...prev, walletMin: prev.walletMax };
      } else if (name === 'walletMax' && newValue < prev.walletMin) {
        return { ...prev, walletMax: prev.min };
      }
      return { ...prev, [name]: newValue };
    });
  };

  // Filter users based on state
  const filteredUsers = users.filter(user => {
    const rowText = Object.values(user).join(' ').toLowerCase();
    const dateMatch = (!filters.dateFrom || user.registrationDateTime?.slice(0, 10) >= filters.dateFrom) &&
      (!filters.dateTo || user.registrationDateTime?.slice(0, 10) <= filters.dateTo);
    return (
      (filters.status === '' || user.status.toLowerCase() === filters.status.toLowerCase()) &&
      (filters.userType === '' || user.appRole.toLowerCase() === filters.userType.toLowerCase()) &&
      (filters.city === '' || user.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (filters.pin === '' || user.pin.includes(filters.pin)) &&
      (user.walletBalance >= (parseInt(filters.walletMin) || -5000)) &&
      (user.walletBalance <= (parseInt(filters.walletMax) || 50000)) &&
      dateMatch &&
      rowText.includes(filters.searchText.toLowerCase())
    );
  });

  // Handle suspend/reactivate
  const updateCustomerStatuses = async (userIds, newStatus, remark) => {
    const token = localStorage.getItem('token');

    const requests = userIds.map(async (userId) => {
      const id = userId;

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/customer/${id}`,
        {
          status: newStatus,
          status_remarks: remark
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

    });

    await Promise.all(requests); // Wait for all requests to finish

    // Update local UI state
    setUsers(prev =>
      prev.map(user =>
        userIds.includes(user.userId)
          ? { ...user, status: newStatus }
          : user
      )
    );

    setToast({ open: true, message: `Customer(s) updated to "${newStatus}"` });
    setTimeout(closeToast, 2000);
  };


  // Download CSV
  const handleDownload = () => {
    const headers = ['User ID', 'Full Name', 'Mobile Number', 'Email ID', 'Company Name', 'Company Address', 'City', 'Pin Code', 'User Type', 'Registered Date', 'Wallet Balance', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredUsers.map(user =>
        [
          user.userId,
          user.fullName,
          user.mobile,
          user.email,
          user.companyName,
          user.fullAddress,
          user.city,
          user.pin,
          user.appRole,
          user.registrationDateTime,
          `₹${user.walletBalance.toLocaleString()}`,
          user.status
        ].join(',')
      )
    ];
    const csvContent = `data:text/csv;charset=utf-8,${csvRows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'User_Directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format wallet balance for display
  const formatWallet = (value) => {
    return value < 0 ? `-₹${Math.abs(value).toLocaleString()}` : `₹${value.toLocaleString()}`;
  };

  // Handle checkbox change for individual user
  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  // Toast close handler
  const closeToast = () => setToast({ open: false, message: '' });

  // Popup close handler
  const closePopup = () => setPopup({ open: false, action: '', users: [], step: 1 });

  // Handle action button click
  const handleActionClick = (action) => {
    if (selectedUsers.length === 0) {
      setToast({ open: true, message: 'Please select at least one user.' });
      setTimeout(closeToast, 2000);
      return;
    }
    setPopup({ open: true, action, users: selectedUsers, step: 1, remark: '' });
  };

  const deleteSelectedCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      let message = '';

      // Case 1: Delete ALL (no selections)
      if (selectedUsers.length === 0) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/all`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );


        setUsers([]); // Clear all users
        message = 'All customers deleted successfully!';

        // Case 2: Delete MULTIPLE (2+ selections)
      } else if (selectedUsers.length > 1) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/multiple`,
          { customerIds: selectedUsers }, // body
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUsers(prevUsers => prevUsers.filter(user => !selectedUsers.includes(user.userId)));
        message = `${selectedUsers.length} customers deleted!`;

        // Case 3: Delete SINGLE (1 selection)
      } else {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/auth/customer/${selectedUsers[0]}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(prevUsers => prevUsers.filter(user => user.userId !== selectedUsers[0]));
        message = 'Customer deleted successfully!';
      }

      // Show success toast
      setToast({ open: true, message });

      setTimeout(() => {
        setToast({ open: false, message: '' });
      }, 3000);

      setSelectedUsers([]); // Clear selections
      setPopup(false); // Close popup


    } catch (error) {
      setToast({ open: true, message: 'Deletion failed. Please try again.' });
    }
  };

  // Simulate confirm action
  const handleConfirmAction = async () => {
    try {
      if (popup.action !== 'Delete' && !popup.remark.trim()) {
        setToast({ open: true, message: 'Remark is required to perform this action.' });
        setTimeout(closeToast, 2000);
        return;
      }

      if (popup.action === 'Delete') {
        await deleteSelectedCustomers();
      } else {
        await updateCustomerStatuses(popup.users, popup.action, popup.remark.trim());
      }

      setPopup({ open: false, action: '', users: [], step: 1, remark: '' });
    } catch (error) {
      setToast({
        open: true,
        message: 'Failed to complete the action. Please try again.'
      });
      setTimeout(closeToast, 2000);
    }
  };


  // Handle View button click to open modal via URL
  const handleViewClick = (user) => {
    navigate(`/admin-dashboard/user-directories/retail-customer/${user.userId}`);
  };

  // Handle input changes in the user detail modal
  const handleUserDetailInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser(prev => {
      let updatedUser = { ...prev, [name]: value };

      // Update fullName if firstName or lastName changes
      if (name === 'firstName' || name === 'lastName') {
        updatedUser.fullName = `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim();
      }
      // Update fullAddress if any address component changes
      if (['firstLineAddress', 'secondLineAddress', 'city', 'state', 'pin'].includes(name)) {
        updatedUser.fullAddress = `${updatedUser.firstLineAddress || ''} ${updatedUser.secondLineAddress || ''}, ${updatedUser.city || ''}, ${updatedUser.state || ''} - ${updatedUser.pin || ''}`.trim().replace(/,\s*-/g, '-').replace(/^,\s*/, '').replace(/,\s*,/g, ',');
      }
      return updatedUser;
    });
  };

  // Function to handle file input change and convert to Base64
  const handlePhotoUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableUser(prev => ({
          ...prev,
          [fieldName]: reader.result // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving changes from the user detail modal
  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const id = editableUser.userId;

      // Prepare data to send to API
      const updatePayload = {
        // app_role: editableUser.appRole,
        first_name: editableUser.firstName,
        last_name: editableUser.lastName,
        mobile_number: editableUser.mobile,
        alternate_number: editableUser.alternateNumber,
        email: editableUser.email,
        company_name: editableUser.companyName,
        first_line_address: editableUser.firstLineAddress,
        second_line_address: editableUser.secondLineAddress,
        state: editableUser.state,
        city: editableUser.city,
        // pincode: editableUser.pin,
        gst_no: editableUser.gstNo,
        adhar_no: editableUser.adharNo,
        // adhar_front_photo: editableUser.adharFrontPhoto, // Base64 string will be here
        // adhar_back_photo: editableUser.adharBackPhoto,   // Base64 string will be here
        pan_card_no: editableUser.panCardNo,
        // pan_card_photo: editableUser.panCardPhoto,       // Base64 string will be here
        // profile_picture: editableUser.profilePicture,     // Base64 string will be here
        // referral_code: editableUser.referralCode,
        // reference_code: editableUser.referenceCode,
        status: editableUser.status,
        status_remarks: editableUser.statusRemarks,
        // password, wallet_balance, registration_date_time, created_at, updated_at are not editable
      };
      console.log("updatePayload:", updatePayload);
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/auth/customer/${id}`,
        updatePayload,
        {
          headers: {
            // 'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the main users list in state
      setUsers(prev =>
        prev.map(user =>
          user.userId === editableUser.userId
            ? editableUser
            : user
        )
      );

      setToast({ open: true, message: 'User details updated successfully!' });
      setTimeout(closeToast, 2000);
      setIsEditing(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Error saving user details:", error);
      // Log more details about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        setToast({ open: true, message: `Failed to save user details: ${error.response.data.message || 'Server error'}. Check console for details.` });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setToast({ open: true, message: 'Failed to save user details: No response from server. Check console for details.' });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setToast({ open: true, message: `Failed to save user details: ${error.message}. Check console for details.` });
      }
      setTimeout(closeToast, 4000); // Give more time for the error message
    }
  };

  // Handle closing the user detail modal and revert URL
  const handleCloseUserDetail = () => {
    navigate('/admin-dashboard/user-directories/retail-customer');
  };

  // Handle Delete popup step logic
  const handleDeleteNext = () => setPopup(prev => ({ ...prev, step: prev.step + 1 }));
  const handleDeleteBack = () => setPopup(prev => ({ ...prev, step: prev.step - 1 }));

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  const renderField = (label, value, name, type = "text", options = [], isAlwaysNonEditable = false) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
      {(isEditing && !isAlwaysNonEditable) && type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleUserDetailInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (isEditing && !isAlwaysNonEditable) && type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows="2"
          value={value}
          onChange={handleUserDetailInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
        ></textarea>
      ) : (isEditing && !isAlwaysNonEditable) ? (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleUserDetailInputChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
        />
      ) : (
        <p className="mt-1 p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
          {value || "Not provided"}
        </p>
      )}
    </div>
  );

  const renderPhotoField = (label, photoUrl, name) => (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>
      <img
        // Display the Base64 image if available, otherwise use the provided URL or placeholder
        src={photoUrl || "https://placehold.co/150x100/eeeeee/333333?text=No+Image"}
        alt={label}
        className="w-full h-32 object-contain border border-gray-300 rounded-md mb-2"
        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x100/eeeeee/333333?text=No+Image" }}
      />
      {isEditing && (
        <div className="relative w-full mt-2">
          <input
            type="file"
            id={name}
            name={name}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handlePhotoUpload(e, name)} // Call the new handler
            accept="image/*" // Restrict to image files
          />
          <button
            type="button"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              document.getElementById(name).click();
            }}
          >
            Choose File
          </button>
        </div>
      )}
    </div>
  );


  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-7xl mx-auto font-inter">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Customer Management</h2>

      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-6">
        <div>
          <label htmlFor="statusFilter" className="block text-sm">Status:</label>
          <select
            id="statusFilter"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div>
          <label htmlFor="walletMin" className="block text-sm">Wallet Min:</label>
          <input
            type="number"
            id="walletMin"
            name="walletMin"
            value={filters.walletMin}
            onChange={handleWalletRangeChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="walletMax" className="block text-sm">Wallet Max:</label>
          <input
            type="number"
            id="walletMax"
            name="walletMax"
            value={filters.walletMax}
            onChange={handleWalletRangeChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="userTypeFilter" className="block text-sm">User Type:</label>
          <select
            id="userTypeFilter"
            name="userType"
            value={filters.userType}
            onChange={handleFilterChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="Fixed">Fixed</option>
            <option value="Dynamic">Dynamic</option>
          </select>
        </div>
        <div>
          <label htmlFor="cityFilter" className="block text-sm">City:</label>
          <input
            type="text"
            id="cityFilter"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            placeholder="Enter City"
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="pinFilter" className="block text-sm">Pin Code:</label>
          <input
            type="text"
            id="pinFilter"
            name="pin"
            value={filters.pin}
            onChange={handleFilterChange}
            placeholder="Enter Pincode"
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Date and Search Section */}
      <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-3">
        <div>
          <label htmlFor="dateFrom" className="block text-sm">Registration Date From:</label>
          <input
            type="date"
            id="dateFrom"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-2 mb-6">
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
              onClick={() => handleActionClick('Black Listed')}
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
        <div>
          <label htmlFor="dateTo" className="block text-sm">Registration Date To:</label>
          <input
            type="date"
            id="dateTo"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="md:col-span-1">
          <label className="invisible block text-sm">Search</label>
          <input
            type="text"
            id="searchBar"
            name="searchText"
            value={filters.searchText}
            onChange={handleFilterChange}
            placeholder="Search users..."
            className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg bg-white">
        <table className="min-w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {/* Checkbox header */}
              <th className="p-3 border border-gray-300 text-center font-semibold">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onChange={handleSelectAll}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              {['User ID', 'Full Name', 'Mobile Number', 'Email ID', 'Company Name', 'Company Address', 'City', 'Pin Code', 'User Type', 'Registered Date', 'Wallet Balance', 'Status', 'Actions'].map(header => (
                <th key={header} className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="13" className="p-6 text-center text-gray-500 border border-gray-300">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.userId} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* Checkbox cell */}
                  <td className="p-3 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => handleCheckboxChange(user.userId)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{user.userId}</td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{user.fullName}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.mobile}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.email}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.companyName}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.fullAddress}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.city}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.pin}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.appRole}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{user.registrationDateTime?.slice(0, 10)}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{formatWallet(user.walletBalance)}</td>
                  <td className="p-3 border border-gray-300">
                    <span className={`text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm ${user.status === 'Active'
                      ? 'bg-green-500'
                      : user.status === 'Suspended'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => handleViewClick(user)} // Pass the entire user object
                      className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm border border-green-700"
        >
          Download CSV
        </button>
      </div>

      {/* Transparent Popup */}
      {popup.open && (
        <div className="fixed inset-0 z-51 flex items-center justify-center">
          <div className="rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] text-center bg-white border border-gray-200" style={{ boxShadow: '0 4px 32px 0 rgba(31, 38, 135, 0.15)' }}>
            {popup.action === 'Delete' ? (
              <>
                {popup.step === 1 && (
                  <>
                    <h3 className="mb-2 text-lg font-semibold text-red-600">Warning</h3>
                    <p className="mb-4">This is a very crucial step that you are about to take. Please think twice before deleting any client from the list.</p>
                    <button className="px-4 py-1 text-white bg-blue-600 rounded hover:bg-blue-700" onClick={handleDeleteNext}>OK</button>
                  </>
                )}
                {popup.step === 2 && (
                  <>
                    <h3 className="mb-2 text-lg font-semibold">Delete Confirmation</h3>
                    <p className="mb-4">Do you really want to delete the selected customer?</p>
                    <div className="flex justify-center gap-4">
                      <button className="px-4 py-1 text-white bg-red-600 rounded hover:bg-red-700" onClick={handleDeleteNext}>YES</button>
                      <button className="px-4 py-1 text-white bg-gray-500 rounded hover:bg-gray-600" onClick={closePopup}>NO</button>
                    </div>
                  </>
                )}
                {popup.step === 3 && (
                  <>
                    <h3 className="mb-2 text-lg font-semibold">Final Confirmation</h3>
                    <p className="mb-4">Are you sure to delete the selected customer?</p>
                    <div className="flex justify-center gap-4">
                      <button className="px-4 py-1 text-white bg-red-600 rounded hover:bg-red-700" onClick={handleConfirmAction}>YES</button>
                      <button
                        className="px-4 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                        onClick={closePopup}
                      >
                        NO
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h3 className="mb-2 text-lg font-semibold">Confirm {popup.action}</h3>
                <p className="mb-2">
                  Are you sure you want to <span className="font-bold">{popup.action}</span> {popup.users.length} user(s)?
                </p>
                <textarea
                  rows={3}
                  placeholder="Enter remark for this action..."
                  value={popup.remark}
                  onChange={(e) => setPopup(prev => ({ ...prev, remark: e.target.value }))}
                  className="w-full p-2 border rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
              </>
            )}
          </div>
        </div>
      )}

      {/* User Detail View Modal */}
      {viewingUser && editableUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl overflow-y-auto max-h-[95vh] transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">User Profile</h3>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Left Column: Profile Picture and Change Photo */}
              <div className="flex flex-col items-center md:w-1/4 p-4 bg-gray-50 rounded-lg shadow-inner">
                <img
                  src={editableUser.profilePicture || "https://placehold.co/150x150/aabbcc/ffffff?text=No+Photo"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md mb-4"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x150/aabbcc/ffffff?text=No+Photo" }}
                />
                {isEditing && (
                  <div className="relative w-full">
                    <input
                      type="file"
                      id="profilePictureInput"
                      name="profilePicture"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => handlePhotoUpload(e, 'profilePicture')}
                      accept="image/*"
                    />
                    <button
                      type="button"
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      onClick={() => { document.getElementById('profilePictureInput').click(); }}
                    >
                      Change Photo
                    </button>
                  </div>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Right Column: User Details and Action Buttons */}
              <div className="flex-1 md:w-3/4">
                <div className="flex justify-end gap-3 mb-6">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-6.707 6.707-1.414 1.414L10.586 18H18v-7.414l-7.414-7.414z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveUser}
                        className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md font-medium flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditableUser(viewingUser); // Discard changes
                        }}
                        className="px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-md font-medium flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 shadow-md font-medium flex items-center gap-2"
                    onClick={() => setToast({ open: true, message: 'Password change functionality is not yet available.' })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h2a2 2 0 012 2v5a2 2 0 01-2 2H3a2 2 0 01-2-2v-5a2 2 0 012-2h2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Change Password
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {renderField('User Name', editableUser.fullName, 'fullName', 'text', [], true)}
                  {renderField('Customer ID', editableUser.userId, 'userId', 'text', [], true)}
                  {renderField('First Name', editableUser.firstName, 'firstName')}
                  {renderField('Last Name', editableUser.lastName, 'lastName')}
                  {renderField('App Role', editableUser.appRole, 'appRole', 'select', [{ value: 'Fixed', label: 'Fixed' }, { value: 'Dynamic', label: 'Dynamic' }])}
                  {renderField('Mobile Number', editableUser.mobile, 'mobile')}
                  {renderField('Alternate Mobile Number', editableUser.alternateNumber, 'alternateNumber')}
                  {renderField('Email ID', editableUser.email, 'email', 'email')}
                  {renderField('Company Name', editableUser.companyName, 'companyName')}
                  {renderField('Address Line 1', editableUser.firstLineAddress, 'firstLineAddress')}
                  {renderField('Address Line 2', editableUser.secondLineAddress, 'secondLineAddress')}
                  {renderField('State', editableUser.state, 'state')}
                  {renderField('City', editableUser.city, 'city')}
                  {renderField('Pin Code', editableUser.pin, 'pin')}
                  {renderField('Full Address', editableUser.fullAddress, 'fullAddress', 'text', [], true)}
                  {renderField('GST No', editableUser.gstNo, 'gstNo')}
                  {renderField('Aadhar No', editableUser.adharNo, 'adharNo')}
                  {renderField('PAN Card No', editableUser.panCardNo, 'panCardNo')}
                  {renderField('Wallet Balance', formatWallet(editableUser.walletBalance), 'walletBalance', 'text', [], true)}
                  {renderField('Referral Code', editableUser.referralCode, 'referralCode')}
                  {renderField('Reference Code', editableUser.referenceCode, 'referenceCode')}
                  {renderField('Registration Date/Time', new Date(editableUser.registrationDateTime).toLocaleString(), 'registrationDateTime', 'text', [], true)}
                  {renderField('Status', editableUser.status, 'status', 'select', [{ value: 'Active', label: 'Active' }, { value: 'Suspended', label: 'Suspended' }, { value: 'Approved', label: 'Approved' }, { value: 'Hold', label: 'Hold' }, { value: 'Black Listed', label: 'Black Listed' }])}
                  {renderField('Status Remarks', editableUser.statusRemarks, 'statusRemarks', 'textarea')}
                  {renderField('Created At', new Date(editableUser.createdAt).toLocaleString(), 'createdAt', 'text', [], true)}
                  {renderField('Last Updated', new Date(editableUser.updatedAt).toLocaleString(), 'updatedAt', 'text', [], true)}
                </div>
              </div>
            </div>

            {/* Photo Section - All document and profile photos are now here */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Document and Profile Photos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPhotoField('Aadhar Front', editableUser.adharFrontPhoto, 'adharFrontPhoto')}
                {renderPhotoField('Aadhar Back', editableUser.adharBackPhoto, 'adharBackPhoto')}
                {renderPhotoField('PAN Card', editableUser.panCardPhoto, 'panCardPhoto')}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseUserDetail}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 shadow-md font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.open && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-gray-900 text-white rounded shadow-lg animate-fade-in">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default RetailCustomer;
