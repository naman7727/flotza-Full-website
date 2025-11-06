import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const borderColor = type === "success" ? "border-green-400" : "border-red-400";
  const textColor = type === "success" ? "text-green-700" : "text-red-700";
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${bgColor} ${borderColor} ${textColor} px-4 py-3 rounded z-50 shadow-lg border max-w-sm`}
    >
      <div className="flex items-center">
        {type === "success" ? (
          <svg
            className={`h-5 w-5 ${iconColor} mr-2`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className={`h-5 w-5 ${iconColor} mr-2`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <strong className="mr-2">
          {type === "success" ? "Success!" : "Error!"}
        </strong>
      </div>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
};

const WalletManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [filterValue, setFilterValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const navigate = useNavigate();

  // Fetch users from backend
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.status === 404) {
          console.error("API endpoint not found:", res);
          setUsers([]);
          setFilteredUsers([]);
          return;
        }
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to fetch customers");

        const usersArray = Array.isArray(data.data?.data)
          ? data.data.data.map((c) => ({
              id: c.customer_id || "",
              _id: c.customer_id || "",
              name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
              mobile: c.mobile || c.mobile_number || "",
              email: c.email || "",
              companyName: c.company_name || "",
              city: c.city || "",
              pin: c.pincode || c.pin_code || "",
              userType: c.app_role || "",
              wallet_balance: c.wallet_balance || 0,
              status: c.status || "",
            }))
          : [];
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Failed to fetch customers", "error");
        setUsers([]);
        setFilteredUsers([]);
      }
    })();
  }, []);

  // Fetch pending recharge count
  useEffect(() => {
    const fetchPendingRechargeCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/pending-recharge-count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch pending recharge count");
        const data = await res.json();
        if (data.success) {
          setPendingRequestCount(parseInt(data.data.count, 10) || 0);
        } else {
          throw new Error(data.message || "Failed to fetch pending recharge count");
        }
      } catch (error) {
        console.error("Error fetching pending recharge count:", error);
        setPendingRequestCount(0);
        showToast("Failed to fetch pending recharge count", "error");
      }
    };

    fetchPendingRechargeCount();
  }, []);

  // Fetch all transactions on mount
  useEffect(() => {
    const fetchAllTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data.data || []);
      } catch (err) {
        setTransactions([]);
        setError("Failed to fetch transactions");
        showToast("Failed to fetch transactions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAllTransactions();
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredUsers(users);
      setShowSuggestions(false);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(value.toLowerCase()) ||
          user.mobile?.includes(value) ||
          user.id?.toLowerCase().includes(value.toLowerCase()) ||
          user._id?.toLowerCase().includes(value.toLowerCase()) ||
          user.email?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleFilterTransactions = async () => {
    const input = filterValue.trim().toLowerCase();
    if (!input) {
      showToast("Please enter a value", "error");
      return;
    }

    const matchedUser = users.find(
      (user) =>
        user.id?.toLowerCase() === input ||
        user.name?.toLowerCase() === input ||
        user.mobile?.includes(input) ||
        user.email?.toLowerCase() === input
    );

    if (!matchedUser) {
      showToast("No matching customer found", "error");
      return;
    }

    await handleFilterTransactionsWithId(matchedUser.id);
  };

  const handleFilterTransactionsWithId = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/${encodeURIComponent(customerId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
        showToast(`Found ${data.data?.length || 0} transactions`, "success");
      } else {
        setTransactions([]);
        showToast("No transactions found for this customer", "error");
      }
    } catch (error) {
      setTransactions([]);
      showToast("Failed to fetch transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = async () => {
    setFilterValue("");
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data.data || []);
    } catch (err) {
      setTransactions([]);
      setError("Failed to fetch transactions");
      showToast("Failed to fetch transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCustomers = (searchValue) => {
    if (!searchValue.trim()) return [];
    const value = searchValue.toLowerCase();
    return users
      .filter(
        (user) =>
          user.id?.toLowerCase().includes(value) ||
          user.name?.toLowerCase().includes(value) ||
          user.mobile?.includes(value) ||
          user.email?.toLowerCase().includes(value)
      )
      .slice(0, 5);
  };

  const [showPushModal, setShowPushModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(user.name || user.email || user.mobile || user.id || user._id);
    setFilteredUsers([user]);
    setShowSuggestions(false);
  };

  const getLatestTransactionsMap = (transactions) => {
    const latestMap = {};
    transactions.forEach((trx) => {
      const customerId = trx.customer_id || trx.customerId;
      const dateStr = trx.transaction_date || trx.date;
      const timeStr = trx.transaction_time || trx.time;
      const fullDate = new Date(`${dateStr} ${timeStr}`);
      if (!latestMap[customerId] || fullDate > latestMap[customerId].date) {
        latestMap[customerId] = {
          id: trx.id,
          trxNo: trx.transaction_id || trx.trxNo,
          date: fullDate,
        };
      }
    });
    return latestMap;
  };
  const latestTrxMap = getLatestTransactionsMap(transactions);

  const downloadTransactionsCSV = () => {
    if (transactions.length === 0) {
      showToast("No transactions to download", "error");
      return;
    }
    try {
      const headers = [
        "Date",
        "Time",
        "Transaction No",
        "Portal Trx No",
        "Portal Remark 1",
        "Portal Remark 2",
        "Credit/Debit",
        "Transaction Type",
        "Amount",
        "Payment Method",
        "Customer ID",
        "User Wallet Balance",
        "Remarks",
        "Central Balance",
      ];
      const csvContent = [
        headers.join(","),
        ...transactions.map((transaction) =>
          [
            `"${transaction.date || ""}"`,
            `"${transaction.time || ""}"`,
            `"${transaction.trxNo || ""}"`,
            `"${transaction.portalTrxNo || ""}"`,
            `"${transaction.portalRemark1 || ""}"`,
            `"${transaction.portalRemark2 || ""}"`,
            `"${transaction.credit_debit || ""}"`,
            `"${transaction.transactionType || ""}"`,
            `"${transaction.amount || ""}"`,
            `"${transaction.paymentMethod || ""}"`,
            `"${transaction.customerId || ""}"`,
            `"${transaction.userWalletBalance || ""}"`,
            `"${transaction.remarks || ""}"`,
            `"${transaction.central_balance || ""}"`,
          ].join(",")
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      const currentDate = new Date().toISOString().split("T")[0];
      const customerInfo =
        transactions.length > 0 ? `_${transactions[0].customerId}` : "_all";
      const filename = `wallet_transactions_${currentDate}${customerInfo}.csv`;
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(
        `Successfully downloaded ${transactions.length} transactions`,
        "success"
      );
    } catch (error) {
      showToast("Failed to download CSV file", "error");
    }
  };

  // Handle form submissions
  const handlePushBalance = async () => {
    const customerId = selectedUser?.id;
    const creditAmount = parseFloat(amount);

    if (!customerId || !creditAmount) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            credit_debit: "credit",
            transaction_type: "Admin Allocated Balance",
            amount: creditAmount,
            customer_id: customerId,
            remarks: remark || "",
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        showToast(`Successfully pushed ₹${creditAmount} to user ID: ${customerId}`, "success");
        setAmount("");
        setRemark("");
        setShowPushModal(false);
        setSearchTerm("");
        setSelectedUser(null);
        setFilteredUsers(users);
        handleFilterTransactionsWithId(customerId);
      } else {
        console.error("Push balance error:", responseData);
        showToast(responseData?.message || "Failed to push balance", "error");
      }
    } catch (error) {
      console.error("Push balance exception:", error);
      showToast("Failed to push balance. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeductBalance = async () => {
    const customerId = selectedUser?.id;
    const debitAmount = parseFloat(amount);

    if (!customerId || !debitAmount) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/wallet-manager/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            credit_debit: "debit",
            transaction_type: "Admin Deducted Balance",
            amount: debitAmount,
            customer_id: customerId,
            remarks: remark || "",
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        showToast(`Successfully deducted ₹${debitAmount} from user ID: ${customerId}`, "success");
        setAmount("");
        setRemark("");
        setShowDeductModal(false);
        setSearchTerm("");
        setSelectedUser(null);
        setFilteredUsers(users);
        handleFilterTransactionsWithId(customerId);
      } else {
        console.error("Deduct balance error:", responseData);
        showToast(responseData?.message || "Failed to deduct balance", "error");
      }
    } catch (error) {
      console.error("Deduct balance exception:", error);
      showToast("Failed to deduct balance. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains("modal")) {
        setShowPushModal(false);
        setShowDeductModal(false);
        setSearchTerm("");
        setSelectedUser(null);
        setFilteredUsers(users);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 mx-auto text-center text-red-500 max-w-7xl">
        <div className="p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />
      )}

      <header className="p-4 text-2xl font-semibold text-center text-white bg-blue-600">
        Admin Wallet Management - KartBuddy
      </header>

      <div className="p-8 mx-auto my-8 overflow-x-auto bg-white rounded-lg shadow-md max-w-7xl">
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setShowPushModal(true);
              }}
              className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Push Balance
            </button>
            <button
              onClick={() => {
                setShowDeductModal(true);
              }}
              className="px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Deduct Balance
            </button>
            <button
              onClick={() => navigate('/admin-dashboard/finance/set-od-limit')}
              className="px-6 py-3 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
            >
              Set OD Limit
            </button>
            <button
              onClick={() => navigate('/admin-dashboard/finance/manual-balance-request')}
              className="relative px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Manual Requests
              {pendingRequestCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={downloadTransactionsCSV}
            disabled={transactions.length === 0}
            className={`px-6 py-3 rounded-md font-semibold flex items-center gap-2 ${
              transactions.length === 0
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download CSV
          </button>
        </div>

        {/* Search/Filter Section */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Search Customer Transactions
          </h3>
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Enter customer name, email, or ID"
                className="w-full p-3 text-sm border border-gray-300 rounded-md"
              />
              {filterValue.trim() && showSuggestions && (
                <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
                  {getFilteredCustomers(filterValue).map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFilterValue(customer.id);
                        setShowSuggestions(false);
                        setTimeout(() => {
                          handleFilterTransactionsWithId(customer.id);
                        }, 0);
                      }}
                    >
                      <div className="font-medium text-gray-900">
                        {customer.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {customer.id || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.email || "N/A"} | {customer.mobile || "N/A"}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        Balance: {customer.wallet_balance || "N/A"}
                      </div>
                    </div>
                  ))}
                  {getFilteredCustomers(filterValue).length === 0 && (
                    <div className="p-3 text-center text-gray-500">
                      No customers found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFilterTransactions}
                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={clearFilter}
                className="px-4 py-2 font-semibold text-white bg-gray-400 rounded-md hover:bg-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-collapse border-gray-300 min-w-max whitespace-nowrap">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Date</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Time</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Trx. No</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Portal Trx No.</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Portal Remark 1</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Portal Remark 2</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Credit/Debit</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Transaction Type</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Amount</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Payment Method</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Customer ID</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">User Wallet Balance</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Remarks</th>
                <th className="px-4 py-2 bg-gray-100 border border-gray-300">Central Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-4 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, idx) => {
                  let formattedDate = "N/A";
                  if (transaction.transaction_date) {
                    const d = new Date(transaction.transaction_date);
                    if (!isNaN(d)) {
                      const day = String(d.getDate()).padStart(2, "0");
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      const year = d.getFullYear();
                      formattedDate = `${day}/${month}/${year}`;
                    } else {
                      formattedDate = transaction.transaction_date;
                    }
                  }
                  const formattedTime = transaction.transaction_time || "N/A";
                  const trxNo = transaction.transaction_id || transaction.trxNo || "N/A";
                  const portalTrxNo = transaction.portal_transaction_id || transaction.portalTrxNo || "N/A";
                  const portalRemark1 = transaction.portal_transaction_remarks_1 || transaction.portalRemark1 || "N/A";
                  const portalRemark2 = transaction.portal_transaction_remarks_2 || transaction.portalRemark2 || "N/A";
                  const creditDebit = transaction.credit_debit || transaction.creditDebit || "N/A";
                  const transactionType = transaction.transaction_type || transaction.transactionType || "N/A";
                  const amount = transaction.amount || "N/A";
                  const paymentMethod = transaction.payment_method || transaction.paymentMethod || "N/A";
                  const customerId = transaction.customer_id || transaction.customerId || "N/A";
                  const userWalletBalance = transaction.user_wallet_balance || transaction.userWalletBalance || "N/A";
                  const remarks = transaction.remarks || "N/A";
                  const centralBalance = transaction.central_balance || "N/A";
                  const isLatest = latestTrxMap[customerId]?.trxNo === trxNo;
                  return (
                    <tr key={transaction.id || idx} className={isLatest ? "bg-green-100" : ""}>
                      <td className="px-4 py-2 border border-gray-300">{formattedDate}</td>
                      <td className="px-4 py-2 border border-gray-300">{formattedTime}</td>
                      <td className="px-4 py-2 border border-gray-300">{trxNo}</td>
                      <td className="px-4 py-2 border border-gray-300">{portalTrxNo}</td>
                      <td className="px-4 py-2 border border-gray-300">{portalRemark1}</td>
                      <td className="px-4 py-2 border border-gray-300">{portalRemark2}</td>
                      <td
                        className={`border border-gray-300 px-4 py-2 ${
                          creditDebit && creditDebit.toLowerCase() === "credit"
                            ? "text-green-600 font-bold"
                            : creditDebit && creditDebit.toLowerCase() === "debit"
                            ? "text-red-600 font-bold"
                            : ""
                        }`}
                      >
                        {creditDebit}
                      </td>
                      <td className="px-4 py-2 border border-gray-300">{transactionType}</td>
                      <td className="px-4 py-2 border border-gray-300">{amount}</td>
                      <td className="px-4 py-2 border border-gray-300">{paymentMethod}</td>
                      <td className="px-4 py-2 border border-gray-300">{customerId}</td>
                      <td className="px-4 py-2 border border-gray-300">{userWalletBalance}</td>
                      <td className="px-4 py-2 border border-gray-300">{remarks}</td>
                      <td className="px-4 py-2 border border-gray-300">{centralBalance}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Push Modal */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal">
          <div className="relative w-full max-w-md p-6 mx-4 bg-white border border-gray-200 rounded-lg shadow-2xl modal-content">
            <span
              className="absolute text-2xl cursor-pointer top-4 right-6 hover:text-black"
              onClick={() => {
                setShowPushModal(false);
                setSearchTerm("");
                setSelectedUser(null);
                setFilteredUsers(users);
              }}
            >
              &times;
            </span>
            <h2 className="mb-4 text-xl font-semibold">Push Balance</h2>
            <div className="relative mb-4">
              <label htmlFor="pushCustomerSearch" className="block mb-2 font-medium">
                Search Customer
              </label>
              <input
                type="text"
                id="pushCustomerSearch"
                placeholder="Enter Customer ID, Name, Email, or Mobile"
                className="w-full p-3 border border-gray-300 rounded-md"
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                value={searchTerm}
              />
              {showSuggestions && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full overflow-y-auto bg-white border border-gray-300 rounded-md shadow max-h-60">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id || user._id}
                      className="p-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-medium">{user.name || "N/A"}</div>
                      <div className="text-sm text-gray-600">
                        ID: {user.id || user._id} | Mobile: {user.mobile || "N/A"} | Email: {user.email || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="pushAmount" className="block mb-2 font-medium">
                Amount
              </label>
              <input
                type="number"
                id="pushAmount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="pushRemarks" className="block mb-2 font-medium">
                Remarks
              </label>
              <textarea
                id="pushRemarks"
                name="remarks"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows="3"
                placeholder="Enter remarks (optional)"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handlePushBalance}
              className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Push Balance
            </button>
          </div>
        </div>
      )}

      {/* Deduct Modal */}
      {showDeductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal">
          <div className="relative w-full max-w-md p-6 mx-4 bg-white border border-gray-200 rounded-lg shadow-2xl modal-content">
            <span
              className="absolute text-2xl cursor-pointer top-4 right-6 hover:text-black"
              onClick={() => {
                setShowDeductModal(false);
                setSearchTerm("");
                setSelectedUser(null);
                setFilteredUsers(users);
              }}
            >
              &times;
            </span>
            <h2 className="mb-4 text-xl font-semibold">Deduct Balance</h2>
            <div className="relative mb-4">
              <label htmlFor="deductCustomerSearch" className="block mb-2 font-medium">
                Search Customer
              </label>
              <input
                type="text"
                id="deductCustomerSearch"
                placeholder="Enter Customer ID, Name, Email, or Mobile"
                className="w-full p-3 border border-gray-300 rounded-md"
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                value={searchTerm}
              />
              {showSuggestions && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full overflow-y-auto bg-white border border-gray-300 rounded-md shadow max-h-60">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id || user._id}
                      className="p-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-medium">{user.name || "N/A"}</div>
                      <div className="text-sm text-gray-600">
                        ID: {user.id || user._id} | Mobile: {user.mobile || "N/A"} | Email: {user.email || "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="deductAmount" className="block mb-2 font-medium">
                Amount
              </label>
              <input
                type="number"
                id="deductAmount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="deductRemarks" className="block mb-2 font-medium">
                Remarks
              </label>
              <textarea
                id="deductRemarks"
                name="remarks"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows="3"
                placeholder="Enter remarks (optional)"
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleDeductBalance}
              className="px-6 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Deduct Balance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;