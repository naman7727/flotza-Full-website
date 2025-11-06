import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UpdateBanking from "./UpdateBanking";

const ManualBlanceRequest = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showUpdateBanking, setShowUpdateBanking] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupAction, setPopupAction] = useState(null); // "approve" or "reject"
  const [popupIndex, setPopupIndex] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch all recharge requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet-manager/recharge-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setRequests(
          result.data.map((req) => ({
            requestId: req.request_id,
            id: req.customer_id,
            fullName: req.full_name,
            amount: req.amount,
            screenshot: req.screenshot,
            selectedBankId: req.selected_bank_id,
            transactionId: req.bank_transaction_id || "",
            status: req.status,
            remarks: req.status_remark || "",
            updatedAt: req.updated_at,
            createdAt: req.created_at,
            firstName: req.first_name,
            lastName: req.last_name,
          }))
        );
      } else {
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.message || "An error occurred while fetching requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (index) => {
    setPopupAction("approve");
    setPopupIndex(index);
    setTransactionId("");
    setStatusRemark("");
    setShowPopup(true);
  };

  const handleReject = (index) => {
    setPopupAction("reject");
    setPopupIndex(index);
    setTransactionId("");
    setStatusRemark("");
    setShowPopup(true);
  };

  const submitAction = async () => {
    const req = requests[popupIndex];
    if (popupAction === "approve" && !transactionId) {
      setError("Transaction ID is required to approve the request");
      return;
    }
    if (popupAction === "reject" && !statusRemark) {
      setError("Status remark is required to reject the request");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        action: popupAction,
        status_remark: statusRemark,
      };
      if (popupAction === "approve") {
        payload.transactionId = transactionId;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); 

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/recharge-requests/${req.requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchRequests(); // Refresh requests list
        setShowPopup(false);
      } else {
        throw new Error(result.message || `Failed to ${popupAction} request`);
      }
    } catch (error) {
      console.error(`Error ${popupAction}ing request:`, error);
      setError(`An error occurred while ${popupAction}ing the request`);
      setShowPopup(false);
    } finally {
      setIsLoading(false);
    }
  };


  const closePopup = () => {
    setShowPopup(false);
    setPopupAction(null);
    setPopupIndex(null);
    setTransactionId("");
    setStatusRemark("");
    setError(null);
  };

  const openImagePopup = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  const closeImagePopup = () => {
    setShowImagePopup(false);
    setSelectedImage("");
  };

  const canApproveAfterRejection = (updatedAt) => {
    if (!updatedAt) return false;
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const hoursDiff = (now - updatedDate) / (1000 * 60 * 60); // Convert to hours
    return hoursDiff <= 48;
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filter === "All" || req.status === filter;
    const trimmedSearch = search.trim().toLowerCase();
    if (!trimmedSearch) return matchesStatus;
    const matchesSearch =
      (req.requestId?.toLowerCase() || "").includes(trimmedSearch) ||
      (req.id?.toLowerCase() || "").includes(trimmedSearch) ||
      (req.fullName?.toLowerCase() || "").includes(trimmedSearch);
    return matchesStatus && matchesSearch;
  });

  if (showUpdateBanking) {
    return (
      <div className="min-h-screen p-4 bg-gray-100 sm:p-6 md:p-8">
        <header className="flex items-center justify-between p-4 mb-6 text-xl font-semibold text-white bg-blue-600 rounded-md sm:text-2xl">
          <button
            onClick={() => setShowUpdateBanking(false)}
            className="px-2 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            disabled={isLoading}
          >
            <span className="text-lg">&#8592;</span> Back
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">Update Banking</h2>
          </div>
          <div style={{ width: "80px" }}></div>
        </header>
        <UpdateBanking />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 sm:p-6 md:p-8">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="w-12 h-12 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}
      {error && (
        <div className="p-4 mx-auto mb-6 text-center text-red-700 bg-red-100 rounded-lg max-w-7xl">
          {error}
        </div>
      )}
      <header className="flex items-center justify-between p-4 mb-6 text-xl font-semibold text-center text-white bg-blue-600 rounded-md sm:text-2xl">
        <button
          onClick={() => navigate(-1)}
          className="px-2 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
          disabled={isLoading}
        >
          <span className="text-lg">&#8592;</span> Back
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold">Manual Balance Requests</h2>
        </div>
        <button
          onClick={() => setShowUpdateBanking(true)}
          className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-md"
          disabled={isLoading}
        >
          Update Banking
        </button>
      </header>

      <div className="p-4 mx-auto bg-white rounded-lg shadow-md max-w-7xl sm:p-6">
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Search / Filter Requests
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="text"
              placeholder="Search by Request ID, Customer ID, or Full Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 text-sm border border-gray-300 rounded-md sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 sm:w-auto"
              disabled={isLoading}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border border-collapse border-gray-300 min-w-max sm:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Request ID</th>
                <th className="p-2 border">Customer ID</th>
                <th className="p-2 border">Full Name</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Screenshot</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Bank Transaction ID</th>
                <th className="p-2 border">Remarks</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => {
                  const isRejected = req.status === "Rejected";
                  const isApproved = req.status === "Approved";
                  const canApprove = isRejected ? canApproveAfterRejection(req.updatedAt) : true;
                  return (
                    <tr key={req.requestId} className="hover:bg-gray-50">
                      <td className="p-2 border">{req.requestId}</td>
                      <td className="p-2 border">{req.id}</td>
                      <td className="p-2 border">{req.fullName}</td>
                      <td className="p-2 border">₹{req.amount}</td>
                      <td className="p-2 border">
                        <img
                          src={req.screenshot}
                          alt="Receipt"
                          className="w-12 h-12 mx-auto rounded cursor-pointer"
                          onClick={() => openImagePopup(req.screenshot)}
                        />
                      </td>
                      <td
                        className={`border p-2 font-semibold ${req.status === "Pending"
                            ? "text-orange-500"
                            : req.status === "Approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                      >
                        {req.status}
                      </td>
                      <td className="p-2 border">{req.transactionId || "-"}</td>
                      <td className="p-2 text-xs italic text-gray-600 border">
                        {req.remarks || "-"}
                        {req.status !== "Pending" && (
                          <div className="mt-1 text-xs">
                            ({req.status} on {formatDateTime(req.updatedAt)})
                          </div>
                        )}
                      </td>
                      <td className="p-2 border">{formatDateTime(req.createdAt)}</td>
                      <td className="p-2 border">
                        {(canApprove && !isApproved) && (
                          <button
                            onClick={() => handleApprove(index)}
                            className="px-2 py-1 mr-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                            disabled={isLoading}
                          >
                            Approve
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleReject(index)}
                            className={`px-2 py-1 rounded text-white text-xs font-medium ${isApproved
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                              }`}
                            disabled={isLoading || isApproved}
                          >
                            Reject
                          </button>
                        )}
                        {(!canApprove || isApproved) && isRejected && (
                          <span className="text-xs text-gray-400">No actions available</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-4 text-center text-gray-500">
                    No matching requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <>
          <div className="fixed inset-0 z-40 bg-white/70"></div>
          <div className="fixed z-50 w-full max-w-md p-6 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg top-1/2 left-1/2">
            <h3 className="mb-4 text-lg font-semibold text-green-700">
              {popupAction === "approve" ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to {popupAction} this request?
            </p>
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
            {popupAction === "approve" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  placeholder="e.g. TXN1234579"
                  disabled={isLoading}
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Status Remark {popupAction === "reject" && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
                placeholder={popupAction === "approve" ? "Optional remark" : "Enter reason for rejection"}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={submitAction}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                disabled={isLoading}
              >
                Confirm
              </button>
              <button
                onClick={closePopup}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {showImagePopup && (
        <>
          <div className="fixed inset-0 z-40 bg-white/70"></div>
          <div className="fixed z-50 w-full max-w-3xl p-6 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-lg shadow-lg top-1/2 left-1/2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700">Screenshot Preview</h3>
              <button
                onClick={closeImagePopup}
                className="px-4 py-2 text-sm font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500"
                disabled={isLoading}
              >
                Close
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Receipt Preview"
              className="w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ManualBlanceRequest;