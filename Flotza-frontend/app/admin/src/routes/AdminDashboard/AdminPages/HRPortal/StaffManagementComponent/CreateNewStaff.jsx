import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateNewStaff = () => {
  const token = useSelector((state) => state.auth.token);
  const baseURL = import.meta.env.VITE_BASE_URL;

  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();
  const [newAdminErrors, setNewAdminErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirmPassword: '',
    designation: '',
    department: '',
    status: 'Suspended',
    reporting_manager: '',
    remark: '',
    app_roles: 'staff',
    aadhar_number: '',
    aadhar_front: null,
    aadhar_back: null,
    pan_number: '',
    pan_front: null,

  });

  // Fetch staff list for Reporting Manager dropdown
  const fetchStaff = async () => {
    try {
      const response = await fetch(`${baseURL}/api/auth/employee`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStaffList(data.data.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff data');
    }
  };

  useEffect(() => {
    if (token) fetchStaff();
  }, [token]);

  const handleNewAdminChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'mobile_number') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setNewAdmin((prev) => ({ ...prev, [name]: digits }));
        setNewAdminErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else if (name === 'aadhar_front' || name === 'aadhar_back'||name === 'pan_front') {
      setNewAdmin((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewAdmin((prev) => ({ ...prev, [name]: value }));
      setNewAdminErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
  };

  
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!newAdmin.first_name) errors.first_name = 'First name required';
    if (!newAdmin.last_name) errors.last_name = 'Last name required';
    if (!newAdmin.email) errors.email = 'Email required';
    if (!newAdmin.mobile_number) {
      errors.mobile_number = 'Phone required';
    } else if (newAdmin.mobile_number.length !== 10) {
      errors.mobile_number = 'Phone must be 10 digits';
    }
    if (!newAdmin.designation) errors.designation = 'Designation required';
    if (!newAdmin.department) errors.department = 'Department required';
    if (!newAdmin.password) errors.password = 'Password required';
    if (newAdmin.password !== newAdmin.confirmPassword) {
      errors.confirmPassword = 'Passwords must match';
    }
  // Aadhar
  if (!newAdmin.aadhar_number) errors.aadhar_number = 'Aadhar number required';
  if (!newAdmin.aadhar_front) errors.aadhar_front = 'Upload Aadhar front image';
  if (!newAdmin.aadhar_back) errors.aadhar_back = 'Upload Aadhar back image';

  // PAN
  if (!newAdmin.pan_number) errors.pan_number = 'PAN number required';
  if (!newAdmin.pan_front) errors.pan_front = 'Upload PAN front image';
    if (Object.keys(errors).length > 0) {
      setNewAdminErrors(errors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('first_name', newAdmin.first_name);
      formData.append('last_name', newAdmin.last_name);
      formData.append('email', newAdmin.email);
      formData.append('mobile_number', newAdmin.mobile_number);
      formData.append('password', newAdmin.password);
      formData.append('designation', newAdmin.designation);
      formData.append('department', newAdmin.department);
      formData.append('status', newAdmin.status);
      formData.append('reporting_manager', newAdmin.reporting_manager);
      formData.append('status_remarks', newAdmin.remark);
      formData.append('app_roles', newAdmin.app_roles);
      formData.append('aadhar_number', newAdmin.aadhar_number);
      formData.append('pan_number', newAdmin.pan_number);
      if (newAdmin.pan_front) formData.append('pan_front', newAdmin.pan_front);

      if (newAdmin.aadhar_front) formData.append('aadhar_front', newAdmin.aadhar_front);
      if (newAdmin.aadhar_back) formData.append('aadhar_back', newAdmin.aadhar_back);

      const response = await fetch(`${baseURL}/api/auth/employee/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to create staff');

      toast.success('Staff created successfully');
      navigate('/admin-dashboard/hr-portal/staff-management');
    } catch (error) {
      console.error('Error creating staff:', error.message);
      if (error.message.includes('email')) {
        setNewAdminErrors({ email: 'Email already exists' });
      } else if (error.message.includes('mobile')) {
        setNewAdminErrors({ mobile_number: 'Mobile number already exists' });
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Staff</h2>
        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Info Fields */}
          {[
            { label: 'First Name', name: 'first_name', required: true },
            { label: 'Last Name', name: 'last_name', required: true },
            { label: 'Email', name: 'email', type: 'email', required: true },
            { label: 'Phone', name: 'mobile_number', required: true, maxLength: 10, placeholder: '10-digit number' },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="font-medium">{field.label} {field.required && '*'}</label>
              <input
                type={field.type || 'text'}
                name={field.name}
                value={newAdmin[field.name]}
                onChange={handleNewAdminChange}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                className={`w-full border px-3 py-2 rounded ${
                  newAdminErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {newAdminErrors[field.name] && (
                <p className="text-red-500 text-xs">{newAdminErrors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Password fields */}
          <div className="relative">
            <label className="font-medium">Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={newAdmin.password}
              onChange={handleNewAdminChange}
              className={`w-full border px-3 py-2 rounded ${
                newAdminErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {newAdminErrors.password && <p className="text-red-500 text-xs">{newAdminErrors.password}</p>}
          </div>

          <div className="relative">
            <label className="font-medium">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={newAdmin.confirmPassword}
              onChange={handleNewAdminChange}
              className={`w-full border px-3 py-2 rounded ${
                newAdminErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-8 text-xs text-blue-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {newAdminErrors.confirmPassword && (
              <p className="text-red-500 text-xs">{newAdminErrors.confirmPassword}</p>
            )}
          </div>

          {/* Dropdowns */}
          {[
            { label: 'Designation', name: 'designation', options: ['Manager', 'Executive', 'Driver', 'Dep. Head'] },
            { label: 'Department', name: 'department', options: ['HR', 'IT.Tech', 'Sales & Marketing', 'CSD', 'Accounts', 'Operation'] },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="font-medium">{field.label} *</label>
              <select
                name={field.name}
                value={newAdmin[field.name]}
                onChange={handleNewAdminChange}
                className={`w-full border px-3 py-2 rounded ${
                  newAdminErrors[field.name] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select {field.label}</option>
                {field.options.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              {newAdminErrors[field.name] && <p className="text-red-500 text-xs">{newAdminErrors[field.name]}</p>}
            </div>
          ))}

          {/* Reporting Manager */}
          <div>
            <label className="font-medium">Reporting Manager</label>
            <select
              name="reporting_manager"
              value={newAdmin.reporting_manager}
              onChange={handleNewAdminChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Reporting Manager</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.employee_id}>
                  {staff.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Role and Status */}
          <div>
            <label className="font-medium">Role</label>
            <select
              name="app_roles"
              value={newAdmin.app_roles}
              onChange={handleNewAdminChange}
              className="w-full border px-3 py-2 rounded"
            >
              {['staff', 'admin', 'manager', 'executive', 'driver', 'vendor', 'customer'].map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          
{/* Aadhar & PAN Info */}
{/* Aadhar Number */}
<div className="md:col-span-2 grid md:grid-cols-3 gap-4">
<div>
  <label className="font-medium">Aadhar Number *</label>
  <input
    name="aadhar_number"
    value={newAdmin.aadhar_number}
    onChange={handleNewAdminChange}
    className={`w-full border px-3 py-2 rounded ${
      newAdminErrors.aadhar_number ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter Aadhar Number"
  />
  {newAdminErrors.aadhar_number && (
    <p className="text-red-500 text-xs">{newAdminErrors.aadhar_number}</p>
  )}
</div>



{/* Aadhar Front Image */}
<div>
  <label className="font-medium">Aadhar Front Image *</label>
  <div className="relative">
    <input
      type="text"
      readOnly
      value={newAdmin.aadhar_front ? newAdmin.aadhar_front.name : ''}
      placeholder="No file chosen"
      className={`w-full border px-3 py-2 rounded pr-28 ${
        newAdminErrors.aadhar_front ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    <input
      type="file"
      id="aadhar_front"
      name="aadhar_front"
      accept="image/*"
      onChange={handleNewAdminChange}
      className="hidden"
    />
    <button
      type="button"
      onClick={() => document.getElementById('aadhar_front').click()}
      className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 rounded"
    >
      Upload
    </button>
  </div>
  {newAdminErrors.aadhar_front && (
    <p className="text-red-500 text-xs">{newAdminErrors.aadhar_front}</p>
  )}
</div>

{/* Aadhar Back Image */}
<div>
  <label className="font-medium">Aadhar Back Image *</label>
  <div className="relative">
    <input
      type="text"
      readOnly
      value={newAdmin.aadhar_back ? newAdmin.aadhar_back.name : ''}
      placeholder="No file chosen"
      className={`w-full border px-3 py-2 rounded pr-28 ${
        newAdminErrors.aadhar_back ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    <input
      type="file"
      id="aadhar_back"
      name="aadhar_back"
      accept="image/*"
      onChange={handleNewAdminChange}
      className="hidden"
    />
    <button
      type="button"
      onClick={() => document.getElementById('aadhar_back').click()}
      className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 rounded"
    >
      Upload
    </button>
  </div>
  {newAdminErrors.aadhar_back && (
    <p className="text-red-500 text-xs">{newAdminErrors.aadhar_back}</p>
  )}
</div>


{/* PAN Number */}
<div>
  <label className="font-medium">PAN Number *</label>
  <input
    name="pan_number"
    value={newAdmin.pan_number}
    onChange={handleNewAdminChange}
    className={`w-full border px-3 py-2 rounded ${
      newAdminErrors.pan_number ? 'border-red-500' : 'border-gray-300'
    }`}
    placeholder="Enter PAN Number"
  />
  {newAdminErrors.pan_number && (
    <p className="text-red-500 text-xs">{newAdminErrors.pan_number}</p>
  )}
</div>


{/* PAN Front Image */}
<div>
  <label className="font-medium">PAN Front Image *</label>
  <div className="relative">
    <input
      type="text"
      readOnly
      value={newAdmin.pan_front ? newAdmin.pan_front.name : ''}
      placeholder="No file chosen"
      className={`w-full border px-3 py-2 rounded pr-28 ${
        newAdminErrors.pan_front ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    <input
      type="file"
      id="pan_front"
      name="pan_front"
      accept="image/*"
      onChange={handleNewAdminChange}
      className="hidden"
    />
    <button
      type="button"
      onClick={() => document.getElementById('pan_front').click()}
      className="absolute right-1 top-1 bottom-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 rounded"
    >
      Upload
    </button>
  </div>
  {newAdminErrors.pan_front && (
    <p className="text-red-500 text-xs">{newAdminErrors.pan_front}</p>
  )}
</div>

</div>

          {/* Remark and Status */}
          <div className="md:col-span-2">
            <label className="font-medium">Remark</label>
            <textarea
              name="remark"
              value={newAdmin.remark}
              onChange={handleNewAdminChange}
              className="w-full border px-3 py-2 rounded"
              rows="3"
            />
          </div>

          <div>
            <label className="font-medium">Status</label>
            <select
              name="status"
              value={newAdmin.status}
              onChange={handleNewAdminChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option>Suspended</option>
              <option>Active</option>
              <option>Terminated</option>
            </select>
          </div>
        </form>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin-dashboard/hr-portal/staff-management')}
            className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-200"
          >
            Back
          </button>
          <button
            onClick={handleCreateAdmin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewStaff;
