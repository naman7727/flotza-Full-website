
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const [staff, setStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchStaff();
    fetchAllStaff();
  }, [id]);
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/auth/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data.data);
    } catch {
      toast.error('Failed to fetch staff');
    }
  };

  const fetchAllStaff = async () => {
    try {
      const res = await fetch(`${baseURL}/api/auth/employee`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setStaffList(data.data.data);

    } catch (err) {
      console.error(err);
    }
  };




  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!staff.first_name) newErrors.first_name = 'First name is required';
    if (!staff.last_name) newErrors.last_name = 'Last name is required';
    if (!staff.email) newErrors.email = 'Email is required';
    if (!/^\d{10}$/.test(staff.mobile_number)) newErrors.mobile_number = 'Enter valid 10-digit mobile number';
    return newErrors;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
   
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
     const cleanedStaff = { ...staff };
delete cleanedStaff.id;
delete cleanedStaff.employee_id;
delete cleanedStaff.full_name;
delete cleanedStaff.created_at;
delete cleanedStaff.updated_at;
delete cleanedStaff.remark;




    const res = await fetch(`${baseURL}/api/auth/employee/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedStaff),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Unknown error');
    }

    const result = await res.json();
    toast.success(result.message || 'Staff updated successfully');
    navigate('/admin-dashboard/hr-portal/staff-management');
  } catch (error) {
    console.error(error);
    toast.error(`Failed to update staff: ${error.message}`);
  }
};

  if (!staff) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Edit Staff</h2>
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <InputField label="First Name *" name="first_name" value={staff.first_name} error={errors.first_name} onChange={handleChange} />
          <InputField label="Last Name *" name="last_name" value={staff.last_name} error={errors.last_name} onChange={handleChange} />
          <InputField label="Email *" name="email" value={staff.email} error={errors.email} onChange={handleChange} />
          <InputField label="Mobile *" name="mobile_number" value={staff.mobile_number} error={errors.mobile_number} onChange={handleChange} />

          {/* Designation Dropdown */}
          <DropdownField
            label="Designation"
            name="designation"
            value={staff.designation}
            options={['Sub Super Admin', 'Dep. Head', 'Manager', 'Executive']}
            onChange={handleChange}
          />

          {/* Department Dropdown */}
          <DropdownField
            label="Department"
            name="department"
            value={staff.department}
            options={['HR', 'Accounts', 'Operation', 'Sales & Marketing', 'CSD', 'IT.Tech']}
            onChange={handleChange}
          />

          {/* Status Dropdown */}
          <DropdownField
            label="Status"
            name="status"
            value={staff.status}
            options={['Suspended', 'Active', 'Terminated']}
            onChange={handleChange}
          />

          {/* Reporting Manager Dropdown */}
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 font-semibold">Reporting Manager</label>
            <select
              name="reporting_manager"
              value={staff.reporting_manager || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Reporting Manager</option>
              {Array.isArray(staffList) && staffList
                .filter((emp) => emp.id !== staff.id)
                .map((emp) => (
                  <option key={emp.id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
            </select>
          </div>

          {/* App Role Dropdown */}
          <DropdownField
            label="Role"
            name="app_roles"
            value={staff.app_roles}
            options={['staff', 'manager', 'admin']}
            onChange={handleChange}
          />

          {/* Remark */}
          <div className="col-span-2">
            <label className="block mb-1 font-semibold">Remark</label>
            <textarea
              name="status_remarks"
              value={staff.status_remarks}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Update Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Field
const InputField = ({ label, name, value, onChange, error }) => (
  <div className="col-span-2 md:col-span-1">
    <label className="block mb-1 font-semibold">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border rounded px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Reusable Dropdown Field
const DropdownField = ({ label, name, value, onChange, options }) => (
  <div className="col-span-2 md:col-span-1">
    <label className="block mb-1 font-semibold">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
    >
      <option value="">Select {label}</option>
      {options.map((opt, index) => (
        <option key={index} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default EditStaff;
