import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { format } from "date-fns";

const RemarkModal = ({ isOpen, onClose, onSave, remark, setRemark, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Enter your remark here..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        ></textarea>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};

function DynamicPriceViewSavedEntries({ rows: initialRows, selectedIndex, setSelectedIndex, setShowDynamicPricingEntries }) {
  const [rows, setRows] = useState(initialRows);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const fetchDynamicPrices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found. Please log in again.");
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/all`);
        const data = response.data?.data || [];

        const formatted = data.map((item) => ({
          id: item.dynamic_price_id,
          baseFare: item.base_fare_per_kg,
          volFactor: item.volumetric_factor,
          challanCharge: item.chalaan_return_charges,
          expressSurcharge: item.express_delivery_surcharge_percentage,
          gst: item.gst_percentage,
          cod: Array.isArray(item.cod_ranges)
            ? item.cod_ranges.map((c) => ({
              range: `${c.range[0]} - ${c.range[1]}`,
              charge: c.charge
            }))
            : [],
          created: format(new Date(item.created_date_time), "dd/MM/yyyy HH:mm"),
          updated: format(new Date(item.updated_date_time), "dd/MM/yyyy HH:mm"),
          status: item.status === "active" ? "Active" : "Inactive",
          remark: item.status_remark || "",
        }));

        setRows(formatted);
      } catch (error) {
        toast.error("Failed to fetch dynamic prices");
        console.error("Fetch error:", error);
      }
    };

    fetchDynamicPrices();
  }, []);

  const handleStatusUpdateClick = (index) => {
    setSelectedRowIndex(index);
    setRemark("");
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (selectedRowIndex === null) return;
    if (!remark.trim()) {
      toast.error("Remark cannot be empty");
      return;
    }

    const selectedRow = rows[selectedRowIndex];
    const isActivating = selectedRow.status.toLowerCase() === "inactive";
    const newStatus = isActivating ? "active" : "inactive";

    try {
      if (isActivating) {
        // 1️⃣ Deactivate all other active rows first
        const otherActiveRows = rows.filter(
          (row, i) => i !== selectedRowIndex && row.status.toLowerCase() === "active"
        );

        await Promise.all(
          otherActiveRows.map(row =>
            axios.put(`${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/${row.id}`, {
              status: "inactive",
              status_remark: "Auto-deactivated due to new active record"
            })
          )
        );
      }

      // 2️⃣ Update the selected row
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/${selectedRow.id}`,
        {
          status: newStatus,
          status_remark: remark
        }
      );

      const updatedRow = response.data.data;

      toast.success("Status updated successfully");

      // 3️⃣ Update local state for all rows
      setRows(prevRows =>
        prevRows.map((row, i) => {
          if (i === selectedRowIndex) {
            return {
              ...row,
              status: updatedRow.status === "active" ? "Active" : "Inactive",
              remark: updatedRow.status_remark
            };
          }
          if (isActivating && row.status.toLowerCase() === "active") {
            return {
              ...row,
              status: "Inactive",
              remark: "Auto-deactivated due to new active record"
            };
          }
          return row;
        })
      );

      // 4️⃣ Reset modal
      setIsModalOpen(false);
      setSelectedRowIndex(null);
      setRemark("");
    } catch (error) {
      const message =
        error.response?.status === 409
          ? "Only one dynamic price can be active at a time."
          : "Failed to update status. Please try again.";
      toast.error(message);
      console.error("Status update error:", error);
    }
  };


  const handleDelete = async () => {
    const selectedRow = rows[selectedIndex];
    if (!selectedRow || !selectedRow.id) {
      toast.error("Selected row is invalid.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/${selectedRow.id}`);
      toast.success("Deleted successfully.");

      // Remove from local state
      setRows((prev) => prev.filter((_, i) => i !== selectedIndex));
      setSelectedRowIndex(null);
      setSelectedIndex(null);
    } catch (error) {
      toast.error("Failed to delete entry.");
      console.error("Delete error:", error);
    }
  };


  const modalTitle = selectedRowIndex !== null && rows[selectedRowIndex]?.status === "Active" ? "Deactivate Entry" : "Activate Entry";

  return (
    <div className="w-full font-inter">

      <div className="flex justify-end p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowDynamicPricingEntries(false)}
            className="px-4 py-2 mr-2 rounded text-white bg-gray-600 hover:bg-gray-700 transition flex items-center gap-2 shadow"
          >
            Back
          </button>
        </div>
        <button
          onClick={() => handleDelete()}
          disabled={selectedIndex === null}
          className="px-4 py-2 ml-2 rounded text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow"
       >
          Delete Selected
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full flex justify-center">
          <div className="min-w-[100%] overflow-auto rounded-lg border border-gray-200 flex shadow-sm w-[66rem]">
            <table className="divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Select</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Dynamic Price ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Base Fare/kg</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Volumetric Factor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Challan Return Charges</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Express Delivery %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">GST %</th>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">COD Range {i + 1}</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">COD Charge {i + 1}</th>
                    </React.Fragment>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase border-r border-blue-700">Remark</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {rows.map((row, i) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-r border-gray-200">
                      <input type="radio" name="rowSelector" checked={selectedIndex === i} onChange={() => setSelectedIndex(i)} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">{row.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">₹{row.baseFare}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.volFactor}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.challanCharge}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.expressSurcharge}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.gst}</td>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <React.Fragment key={j}>
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.cod[j]?.range || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.cod[j]?.charge || "₹0"}</td>
                      </React.Fragment>
                    ))}
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.created}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.updated}</td>
                    <td className="px-4 py-3 text-sm border-r border-gray-200">
                      <button className={`px-3 py-1 rounded text-white transition-colors ${row.status === "Active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`} onClick={() => handleStatusUpdateClick(i)}>
                        {row.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{row.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-end p-4"></div>
      <RemarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleStatusUpdate}
        remark={remark}
        setRemark={setRemark}
        title={modalTitle}
      />
    </div>
  );
}
export default DynamicPriceViewSavedEntries;


