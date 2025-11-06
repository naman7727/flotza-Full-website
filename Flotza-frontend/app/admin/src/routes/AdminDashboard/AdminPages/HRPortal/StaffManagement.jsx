import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaLongArrowAltDown, FaLongArrowAltUp } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const StaffManagement = () => {
  // State for staff data and UI
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_BASE_URL;

  // Other states
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    designation: '',
    department: '',
    status: '',
    search: '',
  });

 
  const [SortingByID, SetSortingByID] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState({
    id: null,
    employeeId: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    designation: '',
    department: '',
    status: 'Suspended',
    reporting_manager: '',
    password: '',
    remark: '',
    app_roles: ''
  });
  const [editAdminErrors, setEditAdminErrors] = useState({});
  const [showEditPassword, setShowEditPassword] = useState(false);

  

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const token = useSelector((state) => state.auth.token);
const navigate=useNavigate();
  // Configure axios defaults


  // Fetch staff data from backend
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/api/auth/employee`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setStaffList(data.data.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to load staff data');
      if (error.message.includes('401')) {
        // Handle unauthorized (token expired)
        localStorage.removeItem('token');

        alert('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);



  // Handle form input changes
 

  const handleEditAdminChange = (e) => {
    const { name, value } = e.target;
    setEditAdmin(prev => ({ ...prev, [name]: value }));
    setEditAdminErrors(prev => ({ ...prev, [name]: '' }));
  };

 
  // Update staff
  const handleSaveEdit = async () => {

    const errors = {};
    if (!editAdmin.first_name) errors.first_name = 'First name required';
    if (!editAdmin.last_name) errors.last_name = 'Last name required';
    if (!editAdmin.email) errors.email = 'Email required';
    if (!editAdmin.mobile_number) errors.mobile_number = 'Phone required';
    if (!editAdmin.designation) errors.designation = 'Designation required';
    if (!editAdmin.department) errors.department = 'Department required';

    if (Object.keys(errors).length > 0) {
      setEditAdminErrors(errors);
      return;
    }

    try {


      const res = await fetch(`${baseURL}/api/auth/employee/${editAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: editAdmin?.first_name,
          last_name: editAdmin?.last_name,
          email: editAdmin?.email,
          mobile_number: editAdmin?.mobile_number,
          app_roles: editAdmin?.app_roles,
          designation: editAdmin?.designation,
          department: editAdmin?.department,
          reporting_manager: editAdmin?.reporting_manager,
          password: editAdmin?.password,
          status: editAdmin?.status,
          status_remarks: editAdmin?.remark
        }),
      });

      const data = await res.json(); // Try to parse the response

      if (!res.ok) {
        console.error("API Error:", data); // Log the error returned by backend
        alert(`Error: ${data.message || "Something went wrong"}`);
      }
      setShowEditModal(false);
      toast.success("Staff updated successfully");
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  // Delete staff
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Please select staff members to delete.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected staff members?`)) {

      try {
        await fetch(`${baseURL}/api/auth/employee/${selectedIds}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setStaffList(staffList.filter(staff => !selectedIds.includes(staff.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff members');
      }
    }
  };

  // Suspend staff
  const handleSuspendSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Please select staff members to suspend.');
      return;
    }

    if (window.confirm(`Are you sure you want to suspend ${selectedIds.length} selected staff members?`)) {
      try {
     
     
         const res = await fetch(`${baseURL}/api/auth/employee/${selectedIds}`, {
           method: 'PUT',
           headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             status: "Suspended",
           }),
         });
     
         if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.message || 'Unknown error');
         }
     
         const result = await res.json();
         toast.success(result.message || 'Staff Suspended successfully');
         navigate('/admin-dashboard/hr-portal/staff-management');
       } catch (error) {
         console.error(error);
         toast.error(`Failed to update staff: ${error.message}`);
       }
     
    }
  };
  const handleSortingByID = () => {
    const SortingById = staffList.sort((a, b) => {
      const idA = parseInt(a.employee_id.replace("KBS", ""));
      const idB = parseInt(b.employee_id.replace("KBS", ""));
      return idA - idB;
    });
    setStaffList([...SortingById]);
    SetSortingByID(true);
  }
  const handleSortingDescendingByID = () => {
    const SortingById = staffList.sort((a, b) => {
      const idA = parseInt(a.employee_id.replace("KBS", ""));
      const idB = parseInt(b.employee_id.replace("KBS", ""));
      return idB - idA;
    });
    setStaffList([...SortingById]);
    SetSortingByID(false);
  }

  // Reset password
  const handleResetPasswordSelected = async () => {
    if (selectedIds.length !== 1) {
      alert('Please select exactly one staff member to reset password.');
      return;
    }

    try {
      await axios.post('http://localhost:1337/api/auth/employee/reset-password', {
        id: selectedIds[0]
      });
      alert('Password reset email sent successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to send password reset email');
    }
  };

  // Manage permissions
  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setSelectedStaff(prev => {
      const newPermissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;

    try {
      await axios.put(
        `http://localhost:1337/api/auth/employee/permissions/${selectedStaff.id}`,
        { permissions: selectedStaff.permissions }
      );
      setStaffList(staffList.map(staff =>
        staff.id === selectedStaff.id ? selectedStaff : staff
      ));
      setShowAccessModal(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    }
  };

  

  // Edit selected staff
  

  // Checkbox handlers
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? filteredStaff.map(staff => staff.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter handlers
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id.replace('filter-', '')]: value }));
    setSelectedIds([]);
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setSelectedIds([]);
  };

  // Filtered staff list

  const filteredStaff = staffList?.filter(staff => {
    const { designation, department, status, search } = filters;
    const fullName = `${staff?.first_name} ${staff?.last_name}`.toLowerCase();
    return (
      (!designation || staff.designation === designation) &&
      (!department || staff.department === department) &&
      (!status || staff.status === status) &&
      (!search || fullName.includes(search.toLowerCase()))
    );
  })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const isSingleStaffSelected = selectedIds.length === 1;

  if (loading) {
    return <div className="p-4 text-center">Loading staff data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen text-gray-800">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-left text-blue-800 mb-6 sm:mb-8">
        Staff Management
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/admin-dashboard/hr-portal/staff-management/create-new-staff')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
        >
          Create New Staff
        </button>

        <button
          onClick={() => navigate(`/admin-dashboard/hr-portal/staff-management/edit-staff/${selectedIds}`)}
          disabled={!isSingleStaffSelected}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base disabled:opacity-50"
        >
          Edit Selected Staff
        </button>

        <button
          onClick={handleResetPasswordSelected}
          disabled={!isSingleStaffSelected}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base disabled:opacity-50"
        >
          Reset Password
        </button>

        <button
          onClick={() => {
            const staff = staffList.find(s => s.id === selectedIds[0]);
            if (staff) {
              setSelectedStaff(staff);
              setShowAccessModal(true);
            }
          }}
          disabled={!isSingleStaffSelected}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base disabled:opacity-50"
        >
          Manage Access
        </button>

        <button
          onClick={handleSuspendSelected}
          disabled={selectedIds.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base disabled:opacity-50"
        >
          Suspend Selected
        </button>

        <button
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base disabled:opacity-50"
        >
          Delete Selected
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative w-full">
          <select
            id="filter-designation"
            value={filters.designation}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 text-sm"
          >
            <option value="">Filter by Designation</option>

            <option value='Sub Super Admin'>Sub Super Admin</option>
            <option value='Dep. Head'>Departmental Head</option>
            <option value='Manager'>Managers</option>
            <option value='Executive'>Executives</option>
            <option>Admin</option>
            <option>HR</option>
            <option>Operations</option>
            <option>Sales</option>
            <option>Support</option>
          </select>
        </div>

        <div className="relative w-full">
          <select
            id="filter-department"
            value={filters.department}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 text-sm"
          >
            <option value="">Filter by Department</option>
            <option>Accounts</option>
            <option>HR</option>
            <option>Operations</option>
            <option>Sales</option>
            <option>CSD</option>
            <option>IT Tech</option>
          </select>
        </div>

        <div className="relative w-full">
          <select
            id="filter-status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 text-sm"
          >
            <option value="">Filter by Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Terminated</option>
          </select>
        </div>

        <input
          type="search"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 w-full text-sm"
        />
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left text-gray-700 text-sm sm:text-base">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={
                    filteredStaff.length > 0 &&
                    selectedIds.length === filteredStaff.length
                  }
                  onChange={handleSelectAll}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </th>
              <th className="p-3 whitespace-nowrap">Employee ID <button className='pt-2'>{SortingByID ? <FaLongArrowAltUp onClick={handleSortingDescendingByID} /> : <FaLongArrowAltDown onClick={handleSortingByID} />}</button></th>
              <th className="p-3 whitespace-nowrap">First Name</th>
              <th className="p-3 whitespace-nowrap">Last Name</th>
              <th className="p-3 whitespace-nowrap">Designation</th>
              <th className="p-3 whitespace-nowrap">Department</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap">Date of Creation</th>
              <th className="p-3 whitespace-nowrap">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No staff found. Please adjust filters or create a new staff member.
                </td>
              </tr>
            ) : (
              filteredStaff?.map(staff => (
                <tr key={staff?.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(staff?.id)}
                      onChange={() => handleSelectOne(staff?.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap">{staff?.employee_id}</td>
                  <td className="p-3 whitespace-nowrap">{staff?.first_name}</td>
                  <td className="p-3 whitespace-nowrap">{staff?.last_name}</td>
                  <td className="p-3 whitespace-nowrap">{staff?.designation}</td>
                  <td className="p-3 whitespace-nowrap">{staff?.department}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${staff?.status === 'Active' ? 'bg-green-100 text-green-800' :
                      staff?.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {staff?.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {new Date(staff?.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() =>navigate(`/admin-dashboard/hr-portal/staff-management/view-staff/${staff?.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
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

      {/* Create Staff Modal */}
     
      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-800">
                Edit Staff - {editAdmin.first_name} {editAdmin.last_name}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">First Name *</label>
                  <input
                    name="first_name"
                    value={editAdmin.first_name}
                    onChange={handleEditAdminChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {editAdminErrors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{editAdminErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-semibold">Last Name *</label>
                  <input
                    name="last_name"
                    value={editAdmin.last_name}
                    onChange={handleEditAdminChange}
                    className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {editAdminErrors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{editAdminErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={editAdmin.email}
                  onChange={handleEditAdminChange}
                  className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {editAdminErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{editAdminErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">Phone *</label>
                <input
                  name="mobile_number"
                  value={editAdmin.mobile_number}
                  onChange={handleEditAdminChange}
                  className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.mobile_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {editAdminErrors.mobile_number && (
                  <p className="text-red-500 text-xs mt-1">{editAdminErrors.mobile_number}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showEditPassword ? "text" : "password"}
                    value={editAdmin.password}
                    onChange={handleEditAdminChange}
                    className={`w-full border rounded px-3 py-2 text-sm pr-10 ${editAdminErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showEditPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {editAdminErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{editAdminErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">Designation *</label>
                <select
                  name="designation"
                  value={editAdmin.designation}
                  onChange={handleEditAdminChange}
                  className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.designation ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Designation</option>
                  <option value='Sub Super Admin'>Sub Super Admin</option>
                  <option value='Dep. Head'>Departmental Head</option>
                  <option value='Manager'>Managers</option>
                  <option value='Executive'>Executives</option>
                </select>
                {editAdminErrors.designation && (
                  <p className="text-red-500 text-xs mt-1">{editAdminErrors.designation}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">Department *</label>
                <select
                  name="department"
                  value={editAdmin.department}
                  onChange={handleEditAdminChange}
                  className={`w-full border rounded px-3 py-2 text-sm ${editAdminErrors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Department</option>
                  <option>Accounts</option>
                  <option>HR</option>
                  <option>Operations</option>
                  <option>Sales</option>
                  <option>CSD</option>
                  <option>IT Tech</option>
                </select>
                {editAdminErrors.department && (
                  <p className="text-red-500 text-xs mt-1">{editAdminErrors.department}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 font-semibold">Reporting Manager</label>
                <select
                  name="reporting_manager"
                  value={editAdmin.reporting_manager}
                  onChange={handleEditAdminChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Reporting Manager</option>
                  {staffList
                    .filter(staff => staff.id !== editAdmin.id)
                    .map(staff => (
                      <option key={staff.id} value={`${staff?.employee_id}`}>
                        {staff.first_name} {staff.last_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Role</label>
                <select
                  name="app_roles"
                  value={editAdmin.app_roles}
                  onChange={handleEditAdminChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Remark</label>
                <textarea
                  name="remark"
                  value={editAdmin.remark}
                  onChange={handleEditAdminChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Status</label>
                <select
                  name="status"
                  value={editAdmin.status}
                  onChange={handleEditAdminChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option>Suspended</option>
                  <option>Active</option>
                  <option>Terminated</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
      {/* Access Management Modal */}
      {showAccessModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-600">
                Manage Access for {selectedStaff.first_name} {selectedStaff.last_name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1"
                onClick={() => setShowAccessModal(false)}
                aria-label="Close manage access modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">Permissions:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'View Orders',
                  'Modify Orders',
                  'Delete Orders',
                  'Manage Products',
                  'View Reports',
                  'Manage Staff',
                  'Access Admin Panel',
                  'Manage Inventory'
                ].map((permission) => (
                  <div key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`permission-${permission}`}
                      value={permission}
                      checked={selectedStaff.permissions?.includes(permission)}
                      onChange={handlePermissionChange}
                      className="mr-2 form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    />
                    <label htmlFor={`permission-${permission}`} className="text-sm cursor-pointer select-none">
                      {permission}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAccessModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;