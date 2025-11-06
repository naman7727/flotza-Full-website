import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ViewStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useSelector((state) => state.auth.token);
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/auth/employee/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaff(response.data.data);
      } catch (err) {
        setError('Failed to fetch staff data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!staff) return <p className="text-center">No staff found.</p>;

  return (
  <div className="min-h-screen bg-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">Staff Details</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">Full Name</label>
          <input type="text" value={staff.full_name} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" value={staff.email} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Mobile Number</label>
          <input type="text" value={staff.mobile_number} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Employee ID</label>
          <input type="text" value={staff.employee_id} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Department</label>
          <input type="text" value={staff.department} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Designation</label>
          <input type="text" value={staff.designation} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">App Role</label>
          <input type="text" value={staff.app_roles} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <input type="text" value={staff.status} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>
        {staff.status_remarks && (
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Status Remarks</label>
            <textarea value={staff.status_remarks} disabled className="w-full border p-2 rounded bg-gray-100" rows={3} />
          </div>
        )}
      </form>

      <div className="flex justify-end gap-4 mt-8">
       

        <button
          onClick={() => navigate(`/admin-dashboard/hr-portal/staff-management/edit-staff/${id}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Edit
        </button>

         <button
          onClick={() => navigate('/admin-dashboard/hr-portal/staff-management')}
          className="bg-gray-400 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
      </div>
    </div>
  );
};

export default ViewStaff;
