import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllTimeWindowsQuery,
  useGetAllDCsQuery,
} from "../../../../lib/api/apiSlice"; 

export default function TimeWindowView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [editIndex, setEditIndex] = useState(null);
  const [selectedDc, setSelectedDc] = useState(""); 
  const [cutoffTime, setCutoffTime] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 

  
  const {
    data: timeWindows = [],
    isLoading: isLoadingWindows,
    error: timeWindowError,
    refetch: refetchTimeWindows,
  } = useGetAllTimeWindowsQuery();

  const {
    data: allDCs = [],
    isLoading: isLoadingDCs,
    error: dcError,
  } = useGetAllDCsQuery();

  const token = localStorage.getItem("token");
  const apiBase = import.meta.env.VITE_BASE_URL || "https://api.kartbuddy.in";

  // ------------------------------
  // Modal Control
  // ------------------------------
  const handleOpenModal = () => {
    setEditIndex(null);
    setSelectedDc("");
    setCutoffTime("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  // ------------------------------
  // Save Handler
  // ------------------------------
  const handleSave = async () => {
    if (!selectedDc || !cutoffTime) {
      toast.error("Please fill all fields.");
      return;
    }

    const [branch_id, dc_name] = selectedDc.split("|");

    try {
      const payload = {
        branch_id,
        dc_name,
        max_order_time: cutoffTime,
      };

      let url = `${apiBase}/api/time-window`;
      let method = "post";

      if (editIndex !== null && timeWindows[editIndex]?.id) {
        url = `${apiBase}/api/time-window/${timeWindows[editIndex].id}`;
        method = "put";
      }

      await axios({
        url,
        method,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        editIndex !== null
          ? "Time window updated successfully"
          : "Time window created successfully"
      );

      handleCloseModal();
      refetchTimeWindows();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save time window"
      );
    }
  };

  // ------------------------------
  // Edit Handler
  // ------------------------------
  const handleEdit = (index) => {
    const windowToEdit = timeWindows[index];
    setEditIndex(index);
    setSelectedDc(`${windowToEdit.branch_id}|${windowToEdit.dc_name}`);
    setCutoffTime(windowToEdit.max_order_time || "");
    setIsModalOpen(true);
  };

  // ------------------------------
  // Delete Confirmation
  // ------------------------------
  const openDeleteConfirm = (index) => {
    setDeleteIndex(index);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteIndex(null);
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteIndex === null) return;
    const timeWindow = timeWindows[deleteIndex];
    if (!timeWindow?.id) return;

    try {
      await axios.delete(`${apiBase}/api/time-window/${timeWindow.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Time window deleted successfully");
      closeDeleteConfirm();
      refetchTimeWindows();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete time window"
      );
    }
  };

  // ------------------------------
  // Filter
  // ------------------------------
  const filteredWindows = timeWindows.filter(
    (w) =>
      w.dc_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.branch_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Delivery Center Time Windows
          </h2>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Set Time Window
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by DC Code or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DC branch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DC Center Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Time Window
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingWindows ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading time windows...
                  </td>
                </tr>
              ) : timeWindowError ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-red-500">
                    Failed to load time windows
                  </td>
                </tr>
              ) : filteredWindows.length > 0 ? (
                filteredWindows.map((window, index) => (
                  <tr key={window.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {window.branch_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {window.dc_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {window.max_order_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(window.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          disabled={isLoadingWindows}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(index)}
                          disabled={isLoadingWindows}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No time windows found. Click "Set Time Window" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blur bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {editIndex !== null ? "Edit Cut-off Time" : "Set Cut-off Time"}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select DC
                </label>
                <select
                  value={selectedDc}
                  onChange={(e) => setSelectedDc(e.target.value)}
                  disabled={editIndex !== null}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select DC
                  </option>
                  {allDCs
                    .filter(
                      (dc) =>
                        editIndex !== null ||
                        !timeWindows.find((w) => w.branch_id === dc.branch_id)
                    )
                    .map((dc) => (
                      <option
                        key={dc.branch_id}
                        value={`${dc.branch_id}|${dc.branch_name}`}
                      >
                        {dc.branch_id} - {dc.branch_name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cut-off Time for Current Date
                </label>
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                >
                  {editIndex !== null ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-blur bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this time window? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
