import React, { useState, useEffect, useMemo } from "react";
import {
  FaTicketAlt,
  FaPlus,
  FaClipboardList,
  FaSearch,
  FaFileExport,
  FaEdit,
  FaEye,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaArrowLeft,
} from "react-icons/fa";
import ViewLog from "./CouponViewLog";
import { toast } from "react-toastify";

const DiscountCoupons = () => {
  // State management
  const [discountCoupons, setDiscountCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Form state for Discount Coupons
  const [discountFormData, setDiscountFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumAmount: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    perCustomerUseLimit: "",
    usableBy: "all", // 'all', 'new', 'old'
    isActive: true,
  });

  // Mock data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock Discount Coupons
      const mockDiscountCoupons = [
        {
          id: 1,
          type: "discount",
          code: "SUMMER20",
          description: "Summer Sale 20% off",
          discountType: "percentage",
          discountValue: 20,
          minimumAmount: 500,
          maximumDiscount: 200,
          startDate: "2024-06-01",
          endDate: "2024-08-31",
          usageLimit: 1000,
          usedCount: 245,
          isActive: true,
          status: "active",
          createdDate: "2024-05-15",
        },
        {
          id: 2,
          type: "discount",
          code: "WELCOME10",
          description: "Welcome bonus ₹50 off",
          discountType: "fixed",
          discountValue: 50,
          minimumAmount: 250,
          maximumDiscount: null,
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          usageLimit: null,
          usedCount: 1250,
          isActive: true,
          status: "active",
          createdDate: "2024-01-01",
        },
      ];

      setDiscountCoupons(mockDiscountCoupons);
    } catch (error) {
      toast.error(error.message);
      showNotification("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewDialog = (item) => {
    setViewingItem(item);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingItem(null);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setDiscountFormData({
        ...item,
        // Ensure usableBy has a default value if not present in item
        usableBy: item.usableBy || "all",
      });
    } else {
      setEditingItem(null);
      setDiscountFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minimumAmount: "",
        maximumDiscount: "",
        startDate: new Date().toISOString().split("T")[0], // Default to today
        endDate: "",
        usageLimit: "",
        perCustomerUseLimit: "",
        usableBy: "all",
        usedCount: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  // Generate a random coupon code in format COUPON-XXXX where X are alphanumeric characters
  const generateCouponCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
    let result = "COUPON-";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFormChange = (field, value) => {
    setDiscountFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing item
        setDiscountCoupons((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...discountFormData,
                  id: editingItem.id,
                  type: "discount",
                  status: discountFormData.isActive ? "active" : "inactive",
                }
              : item
          )
        );
        showNotification("Coupon updated successfully", "success");
      } else {
        // Create new item
        const newItem = {
          ...discountFormData,
          // Auto-generate code if not provided
          code: discountFormData.code.trim() || generateCouponCode(),
          id: Date.now(),
          type: "discount",
          createdDate: new Date().toISOString().split("T")[0],
          status: discountFormData.isActive ? "active" : "inactive",
        };

        setDiscountCoupons((prev) => [...prev, newItem]);
        showNotification("Coupon created successfully", "success");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message);
      showNotification("Error saving coupon", "error");
    }
  };

  const handleDelete = async (item) => {
    setItemToDelete(item);
    setDeleteConfirmText("");
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
    setDeleteConfirmText("");
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText === "DeLeTe" && itemToDelete) {
      try {
        setDiscountCoupons((prev) =>
          prev.filter((item) => item.id !== itemToDelete.id)
        );
        showNotification("Coupon deleted successfully", "success");
        handleCloseDeleteDialog();
      } catch (error) {
        toast.error(error.message);
        showNotification("Error deleting coupon", "error");
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return discountCoupons.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [discountCoupons, searchTerm, filterStatus]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFilterOptions = () => {
    return [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "expired", label: "Expired" },
    ];
  };

  // Conditional rendering for ViewLog
  if (showLogs) {
    return <ViewLog onBack={() => setShowLogs(false)} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
          <button
            onClick={() =>
              setNotification({ show: false, message: "", type: "success" })
            }
            className="text-white hover:text-gray-200 text-lg font-bold"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaTicketAlt className="text-blue-600" />
          Discount Coupons Management
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenDialog()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Create Coupon
          </button>
          <button
            onClick={() => setShowLogs(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaClipboardList />
            View Logs
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">
              <FaSearch />
            </span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-40"
          >
            {getFilterOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <FaFileExport />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Discount Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Discount Value
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Max Cap
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Min Order Value Bill
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Total Usage Limit
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Per Customer Use Limit
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-gray-900">
                      {item.code}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900 capitalize">
                    {item.discountType}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.discountType === "percentage"
                      ? `${item.discountValue}%`
                      : `₹${item.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.maximumDiscount ? `₹${item.maximumDiscount}` : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {new Date(item.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {item.endDate
                      ? new Date(item.endDate).toLocaleDateString()
                      : "∞"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.minimumAmount ? `₹${item.minimumAmount}` : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.usageLimit || "∞"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.perCustomerUseLimit || "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(
                        item.status
                      )}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenDialog(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenViewDialog(item)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem
                  ? "Edit Discount Coupon"
                  : "Create New Discount Coupon"}
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountFormData.code}
                        onChange={(e) =>
                          handleFormChange("code", e.target.value)
                        }
                        required
                        placeholder="Enter coupon code"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleFormChange("code", generateCouponCode())
                        }
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                        title="Generate random code"
                      >
                        Generate Code
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={discountFormData.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      required
                      placeholder="Enter description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={discountFormData.discountType}
                      onChange={(e) =>
                        handleFormChange("discountType", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {discountFormData.discountType === "percentage"
                        ? "Discount %"
                        : "Discount Amount (₹)"}{" "}
                      *
                    </label>
                    <div className="relative">
                      {discountFormData.discountType === "fixed" && (
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          ₹
                        </span>
                      )}
                      <input
                        type="number"
                        value={discountFormData.discountValue}
                        onChange={(e) =>
                          handleFormChange("discountValue", e.target.value)
                        }
                        required
                        min="0"
                        max={
                          discountFormData.discountType === "percentage"
                            ? "100"
                            : ""
                        }
                        className={`w-full ${
                          discountFormData.discountType === "fixed"
                            ? "pl-8"
                            : "pl-3"
                        } pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                      {discountFormData.discountType === "percentage" && (
                        <span className="absolute right-3 top-2.5 text-gray-500">
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Order Value Bill (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={discountFormData.minimumAmount}
                        onChange={(e) =>
                          handleFormChange("minimumAmount", e.target.value)
                        }
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {discountFormData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Cap (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={discountFormData.maximumDiscount}
                          onChange={(e) =>
                            handleFormChange("maximumDiscount", e.target.value)
                          }
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={discountFormData.startDate}
                      onChange={(e) =>
                        handleFormChange("startDate", e.target.value)
                      }
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={discountFormData.endDate}
                      onChange={(e) =>
                        handleFormChange("endDate", e.target.value)
                      }
                      min={
                        discountFormData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      value={discountFormData.usageLimit}
                      onChange={(e) =>
                        handleFormChange("usageLimit", e.target.value)
                      }
                      min="0"
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Customer Use Limit
                    </label>
                    <input
                      type="number"
                      value={discountFormData.perCustomerUseLimit}
                      onChange={(e) =>
                        handleFormChange("perCustomerUseLimit", e.target.value)
                      }
                      min="0"
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Row 5 - Usable By */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usable By
                    </label>
                    <select
                      value={discountFormData.usableBy}
                      onChange={(e) =>
                        handleFormChange("usableBy", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Customer</option>
                      <option value="new">New Customer</option>
                      <option value="old">Old Customer</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={discountFormData.isActive}
                      onChange={(e) =>
                        handleFormChange("isActive", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "Saving..."
                    : editingItem
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {openViewDialog && viewingItem && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Coupon Details
              </h2>
              <button
                onClick={handleCloseViewDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {viewingItem.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">{viewingItem.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <p className="text-gray-900 capitalize">
                    {viewingItem.discountType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <p className="text-gray-900">
                    {viewingItem.discountType === "percentage"
                      ? `${viewingItem.discountValue}%`
                      : `₹${viewingItem.discountValue}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Amount
                  </label>
                  <p className="text-gray-900">
                    ₹{viewingItem.minimumAmount || "No minimum"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Discount
                  </label>
                  <p className="text-gray-900">
                    ₹{viewingItem.maximumDiscount || "No limit"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Period
                  </label>
                  <p className="text-gray-900">
                    {viewingItem.startDate} to {viewingItem.endDate}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage
                  </label>
                  <p className="text-gray-900">
                    {viewingItem.usedCount}
                    {viewingItem.usageLimit && `/${viewingItem.usageLimit}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(
                      viewingItem.status
                    )}`}
                  >
                    {viewingItem.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && itemToDelete && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Discount Coupon
              </h3>

              <p className="text-gray-600 text-center mb-4">
                This action cannot be undone. This will permanently delete the
                coupon <strong>"{itemToDelete.code}"</strong>.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please type <strong className="text-red-600">DeLeTe</strong>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  placeholder="Type DeLeTe here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseDeleteDialog}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== "DeLeTe"}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    deleteConfirmText === "DeLeTe"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Delete Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCoupons;
