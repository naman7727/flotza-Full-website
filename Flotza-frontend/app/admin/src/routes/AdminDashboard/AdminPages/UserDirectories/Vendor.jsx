import React, { useState, useEffect } from 'react';

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingVendor, setEditingVendor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [popup, setPopup] = useState({ open: false, action: '', remarks: '' });
  const [toast, setToast] = useState({ open: false, message: '' });
  const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);
  const closeToast = () => setToast({ open: false, message: '' });

  const handleStatusSubmit = async () => {
    setLoadingStatusUpdate(true);
    const token = localStorage.getItem('token');
    
    console.log('Starting status update for vendors:', selectedUsers);
    console.log('Action:', popup.action, 'Remarks:', popup.remarks);
    
    for (const vendorId of selectedUsers) {
      try {
        console.log(`Updating vendor with vendor_id: ${vendorId}`);
        
        const updateData = { 
          status: popup.action, 
          status_remarks: popup.remarks 
        };
        
        console.log('Update data:', updateData);
        
        const res = await fetch(`${API_BASE_URL}/${vendorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        
        const data = await res.json();
        console.log('API response:', data);
        
        if (!res.ok || !data.success) throw new Error(data.message || 'Update failed');
      } catch (err) {
        console.error(`Update failed for vendor ${vendorId}`, err);
      }
    }
    const refreshed = await fetchVendorsApi();
    setVendors(refreshed);
    setSelectedUsers([]);
    setPopup({ open: false, action: '', remarks: '' });
    setLoadingStatusUpdate(false);
    setToast({ open: true, message: `${popup.action} applied successfully.` });
    setTimeout(closeToast, 2000);
  };


  const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/auth/vendor`;

  const fetchVendorsApi = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch vendors');

      return Array.isArray(data.data?.data)
        ? data.data.data.map(v => ({
          id: v.id || "",
          vendor_id: v.vendor_id || "",
          full_name: v.full_name || "",
          email: v.email || "",
          mobile: v.mobile || v.mobile_number || "",
          alternate_number: v.alternate_number || "",
          address_line1: v.address_line1 || v.address_line_1 || "",
          address_line2: v.address_line2 || v.address_line_2 || "",
          city: v.city || "",
          state: v.state || "",
          pincode: v.pincode || v.pin_code || "",
          current_address: v.current_address || "",
          assign_hub: v.assign_hub || "",
          pan_no: v.pan_no || v.pan_card_no || "",
          pan_photo: v.pan_photo || v.pan_card_photo || "",
          aadhaar_no: v.aadhaar_no || v.aadhar_no || "",
          aadhaar_front: v.aadhaar_front || v.aadhar_front_photo || "",
          aadhaar_back: v.aadhaar_back || v.aadhar_back_photo || "",
          gst_no: v.gst_no || "",
          gst_photo: v.gst_photo || "",
          bank_name: v.bank_name || "",
          account_number: v.account_number || "",
          ifsc_code: v.ifsc_code || "",
          profile: v.profile || v.profile_picture || "",
          cod_holding: v.cod_holding || v.cod_holdings || "₹ 0",
          chalaan_holding: v.chalaan_holding || v.chalan_holdings || "₹ 0",
          total_orders: v.total_orders || 0,
          vendor_rating: v.vendor_rating || 0,
          referral_code: v.referral_code || "",
          reference_code: v.reference_code || "",
          status: v.status || "",
          status_remark: v.status_remark || "",
          last_device_used: v.last_device_used || "",
          current_device_using: v.current_device_using || "",
          created_date: v.created_date || v.created_at?.slice(0, 10) || "",
          updated_at: v.updated_at?.slice(0, 10) || "",
        }))
        : [];
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchVendorsApi();
      setVendors(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(vendors.map(v => v.vendor_id));
    } else {
      setSelectedUsers([]);
    }
  };

  const deleteSelectedVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      let message = '';

      // Case 1: No selections
      if (selectedUsers.length === 0) {
        alert('Please select at least one vendor to delete.');
        return;

        // Case 2: Delete MULTIPLE (2+ selections)
      } else if (selectedUsers.length > 1) {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedUsers.length} vendors?`);
        if (!confirmDelete) return;

        const res = await fetch(`${API_BASE_URL}/multiple`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ vendorIds: selectedUsers }), // Send selected vendor IDs
        });

        if (!res.ok) throw new Error("Failed to delete vendors");
        setVendors(prev => prev.filter(v => !selectedUsers.includes(v.vendor_id)));
        message = `${selectedUsers.length} vendors deleted!`;

        // Case 3: Delete SINGLE (1 selection)
      } else {
        const confirmDelete = window.confirm(`Are you sure you want to delete vendor ID: ${selectedUsers[0]}?`);
        if (!confirmDelete) return;

        const res = await fetch(`${API_BASE_URL}/${selectedUsers[0]}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to delete vendor");
        setVendors(prev => prev.filter(v => v.vendor_id !== selectedUsers[0]));
        message = 'Vendor deleted successfully!';
      }

      // Show success message
      alert(message);
      setSelectedUsers([]); // Clear selections

    } catch (error) {
      console.error("Deletion error:", error);
      alert('Failed to delete vendor(s). Please try again.');
    }
  };

  const handleActionClick = (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one vendor.');
      return;
    }

    if (action === 'Delete') {
      deleteSelectedVendors(); // The delete function
    } else {
      setPopup({ open: true, action, users: selectedUsers, step: 1 });
    }
  };

  const handleView = (vendor) => {
    setEditingVendor({ ...vendor });
    setIsEditMode(false);
    setShowEditModal(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor({ ...vendor });
    setShowEditModal(true);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingVendor) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/${editingVendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: editingVendor.full_name,
          mobile: editingVendor.mobile,
          email: editingVendor.email
        })
      });
      if (!res.ok) throw new Error("Failed to update");
      setVendors(prev =>
        prev.map(v => (v.id === editingVendor.id ? editingVendor : v))
      );
      setShowEditModal(false);
      setEditingVendor(null);
      alert("Vendor updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update vendor");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    setIsEditMode(false);
    setShowEditModal(false);
  };



  const handleCheckboxChange = (vendors) => {
    setSelectedUsers(prev =>
      prev.includes(vendors)
        ? prev.filter(id => id !== vendors)
        : [...prev, vendors]
    );
  };

  if (loading) return <div className="text-center mt-10 text-indigo-600 text-xl">Loading vendor data...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-7xl mx-auto font-inter">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Vendor Management</h2>
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
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg bg-white">
        <table className="min-w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 border border-gray-300 text-center font-semibold">
                <input
                  type="checkbox"
                  checked={vendors.length > 0 && selectedUsers.length === vendors.length}
                  onChange={handleSelectAll}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedUsers.length > 0 && selectedUsers.length < vendors.length;
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </th>
              <th className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">Vendor ID</th>
              <th className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">Full Name</th>
              <th className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">Mobile</th>
              <th className="p-3 border border-gray-300 font-semibold text-left whitespace-nowrap bg-gray-50">Email</th>
              <th className="p-3 border border-gray-300 font-semibold text-center whitespace-nowrap bg-gray-50">City</th>
              <th className="p-3 border border-gray-300 font-semibold text-center whitespace-nowrap bg-gray-50">Status</th>
              <th className="p-3 border border-gray-300 font-semibold text-center whitespace-nowrap bg-gray-50">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {vendors.length > 0 ? (
              vendors.map((v, i) => (
                <tr
                  key={v.id}
                  className={`hover:bg-blue-50 transition-colors duration-150 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="p-3 border border-gray-300 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(v.vendor_id)}
                      onChange={() => handleCheckboxChange(v.vendor_id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{v.vendor_id}</td>
                  <td className="p-3 border border-gray-300 font-medium text-gray-900">{v.full_name}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{v.mobile}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{v.email}</td>
                  <td className="p-3 border border-gray-300 text-gray-700">{v.city || "N/A"}</td>
                  <td className="p-3 border border-gray-300">
                    <span
                      className={`text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm ${v.status === "Active"
                        ? "bg-green-500"
                        : v.status === "Suspended"
                          ? "bg-red-500"
                          : v.status === "New registration"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                    >
                      {v.status || "N/A"}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => handleView(v)}
                      className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500 border border-gray-300">
                  No vendors available
                </td>
              </tr>
            )}
          </tbody>
        </table>



      </div>

      {/* Vendor Details/Edit Modal */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCancelEdit}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-3xl font-bold p-1 rounded-full hover:bg-gray-100"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {isEditMode ? "Edit Vendor Details" : "Vendor Details"}
            </h3>

            {/* General Information Section */}
            <h4 className="font-semibold text-lg mb-3 mt-4 text-gray-700">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
                <input
                  type="text"
                  name="vendor_id"
                  value={editingVendor.vendor_id}
                  disabled={true}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={editingVendor.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={editingVendor.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingVendor.email}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Number</label>
                <input
                  type="text"
                  name="alternate_number"
                  value={editingVendor.alternate_number}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={editingVendor.city}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={editingVendor.state}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={editingVendor.pincode}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>
            </div>

            {/* Business Information Section */}
            <h4 className="font-semibold text-lg mb-3 mt-6 text-gray-700">Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  name="pan_no"
                  value={editingVendor.pan_no}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gst_no"
                  value={editingVendor.gst_no}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={editingVendor.bank_name}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={editingVendor.account_number}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={editingVendor.ifsc_code}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                  className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!isEditMode ? "bg-gray-100 cursor-not-allowed border-gray-300" : "border-gray-300"
                    }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Orders</label>
                <input
                  type="number"
                  name="total_orders"
                  value={editingVendor.total_orders}
                  disabled={true}
                  className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-6 space-x-3 pt-4 border-t">
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                {isEditMode ? "Cancel" : "Close"}
              </button>

              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Edit Details
                </button>
              )}

              {isEditMode && (
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Status Update Modal */}
      {popup.open && (
        <div className="fixed inset-0 z-51 flex items-center justify-center">
          <div
            className="rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] text-center bg-white border border-gray-200"
            style={{ boxShadow: '0 4px 32px 0 rgba(31, 38, 135, 0.15)' }}
          >
            <h3 className="mb-2 text-lg font-semibold">Confirm {popup.action}</h3>
            <p className="mb-2">
              Are you sure you want to <span className="font-bold">{popup.action}</span> {selectedUsers.length} vendor(s)?
            </p>
            <textarea
              rows={3}
              placeholder="Enter remarks..."
              value={popup.remarks}
              onChange={(e) => setPopup(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-2 border rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                onClick={handleStatusSubmit}
                disabled={loadingStatusUpdate}
              >
                {loadingStatusUpdate ? 'Updating...' : 'Yes'}
              </button>
              <button
                className="px-4 py-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                onClick={() => setPopup({ open: false, action: '', remarks: '' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Inline Toast */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50">
          {toast.message}
        </div>
      )}

    </div>
  );
};

export default Vendor;
