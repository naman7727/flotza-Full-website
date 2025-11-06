/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { MdDelete } from "react-icons/md";
import CommodityMaster from "./Commodity";
import TimeWindowView from "./TimeWindow";
import DynamicPriceViewSavedEntries from "./DynamicPriceViewSavedEntries";

const dummyData = [
  {
    customerId: "CUST001",
    customerName: "ABC Logistics",
    dimensionId: "DIM001",
    dimensionName: "Small Box",
    length: 30,
    breadth: 20,
    height: 15,
    weight: 5,
    dimensionCharge: 350,
    volumetricFactor: 5000,
    challanCharges: 50,
    expressDelivery: 10,
    gst: 18,
    codRange1: "0-999",
    codCharge1: 50,
    codRange2: "1000-1999",
    codCharge2: 70,
    codRange3: "2000-2999",
    codCharge3: 90,
    codRange4: "3000-3999",
    codCharge4: 120,
    codRange5: "4000-4999",
    codCharge5: 150,
    codRange6: "5000+",
    codCharge6: 200,
  },
  {
    customerId: "CUST002",
    customerName: "XYZ Traders",
    dimensionId: "DIM002",
    dimensionName: "Medium Crate",
    length: 60,
    breadth: 40,
    height: 30,
    weight: 10,
    dimensionCharge: 700,
    volumetricFactor: 4500,
    challanCharges: 40,
    expressDelivery: 15,
    gst: 12,
    codRange1: "0-999",
    codCharge1: 60,
    codRange2: "1000-1999",
    codCharge2: 80,
    codRange3: "2000-2999",
    codCharge3: 100,
    codRange4: "3000-3999",
    codCharge4: 130,
    codRange5: "4000-4999",
    codCharge5: 160,
    codRange6: "5000+",
    codCharge6: 210,
  },
  {
    customerId: "CUST003",
    customerName: "MNO Retail",
    dimensionId: "DIM003",
    dimensionName: "Jumbo Pallet",
    length: 100,
    breadth: 80,
    height: 60,
    weight: 25,
    dimensionCharge: 1250,
    volumetricFactor: 4000,
    challanCharges: 70,
    expressDelivery: 20,
    gst: 18,
    codRange1: "0-999",
    codCharge1: 90,
    codRange2: "1000-1999",
    codCharge2: 110,
    codRange3: "2000-2999",
    codCharge3: 140,
    codRange4: "3000-3999",
    codCharge4: 170,
    codRange5: "4000-4999",
    codCharge5: 200,
    codRange6: "5000+",
    codCharge6: 250,
  },
];

const tableHeaders = [
  "Select",
  "Customer ID",
  "Customer Name",
  "Dimension ID",
  "Dimension Name",
  "Length",
  "Breadth",
  "Height",
  "Weight",
  "Dimension Charge",
  "Action",
  "Volumetric Factor",
  "Challan Charges",
  "Express Delivery",
  "GST %",
  "COD Range 1",
  "COD Charge 1",
  "COD Range 2",
  "COD Charge 2",
  "COD Range 3",
  "COD Charge 3",
  "COD Range 4",
  "COD Charge 4",
  "COD Range 5",
  "COD Charge 5",
  "COD Range 6",
  "COD Charge 6",
  "Status",
];

export default function PricingSettings() {
  // Dynamic pricing saved entries state (move from child to parent)
  const [dynamicRows, setDynamicRows] = useState([]);
  const [dynamicSelectedIndex, setDynamicSelectedIndex] = useState(null);

  // Handler for toggling status in dynamic pricing table
  const handleDynamicStatusToggle = (index) => {
    const now = dayjs().format("YYYY-MM-DD HH:mm");
    setDynamicRows((prevRows) =>
      prevRows.map((row, i) => {
        if (i === index) {
          return {
            ...row,
            status: row.status === "Active" ? "Inactive" : "Active",
            updated: now,
          };
        }
        if (row.status === "Active" && i !== index) {
          return {
            ...row,
            status: "Inactive",
            updated: now,
          };
        }
        return row;
      })
    );
  };


  const handleDeleteDynamic = async (row) => {
    console.log("Row passed to delete:", row);
    if (!row || !row.id) {
      toast.error("No row selected for deletion.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this dynamic price?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/${row.id}`);
      toast.success("Dynamic price deleted successfully");

      setDynamicRows((prev) => prev.filter((r) => r.id !== row.id));
      setDynamicSelectedIndex(null);
    } catch (error) {
      toast.error("Failed to delete dynamic price");
      console.error("Delete error:", error);
    }
  };




  const [editIndex, setEditIndex] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [activeTab, setActiveTab] = useState("fixed");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [dimensions, setDimensions] = useState([{}]);
  const [dynamicSettings, setDynamicSettings] = useState(null);
  const [codRanges, setCodRanges] = useState([
    { min: 1, max: 1000, charge: "" },
  ]);
  const [dummyDataState, setDummyDataState] = useState([]); // Initialize as empty array
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDynamicPricingModal, setShowDynamicPricingModal] = useState(false);
  // New state for in-canvas dynamic pricing entries view
  const [showDynamicPricingEntries, setShowDynamicPricingEntries] =
    useState(false);
  const [showPricingTable, setShowPricingTable] = useState(false);

  // View states
  const [currentView, setCurrentView] = useState("main"); // 'main' or 'timeWindow'

  // Fixed pricing popup states
  const [showPushPopup, setShowPushPopup] = useState(false);
  const [remark, setRemark] = useState("");
  const [pendingPricingData, setPendingPricingData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic pricing popup states
  const [showDynamicPushPopup, setShowDynamicPushPopup] = useState(false);
  const [dynamicRemark, setDynamicRemark] = useState("");
  const [pendingDynamicData, setPendingDynamicData] = useState(null);
  const [isDynamicSubmitting, setIsDynamicSubmitting] = useState(false);

  // State for storing fetched pricing data
  const [pricingData, setPricingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = (item) => {
    setEditIndex(item);
    setEditedItem(pricingData[item]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedItem((prev) => ({ ...prev, [name]: value }));
  };

  // Function to fetch pricing data from backend
  const fetchPricingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/price-manager/all`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} - ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Failed to parse error response:", errorText);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Fetched pricing data:", data);
      if (data.success && data.data) {
        // Transform the data to match the expected format for the table
        const formattedData = data.data.map((item) => {
          // Helper function to safely parse COD ranges
          const parseCodRange = (range) => {
            if (!range) return { min: 0, max: 0 };
            try {
              return typeof range === "string" ? JSON.parse(range) : range;
            } catch (e) {
              console.warn("Failed to parse COD range:", e);
              return { min: 0, max: 0 };
            }
          };

          return {
            customerId: item.customer_id || "",
            customerName: item.customer_name || "",
            dimensionId: item.dimension_id || "",
            dimensionName: item.dimension_name || "",
            length: item.length || 0,
            breadth: item.breadth || 0,
            height: item.height || 0,
            weight: item.weight || 0,
            dimensionCharge: item.dimension_charge || 0,
            volumetricFactor: item.volumetric_factor || 0,
            challanCharges: item.chalaan_return_charges || 0,
            expressDelivery: item.express_delivery_percentage || 0,
            gst: item.gst_percentage || 0,
            codRange1: parseCodRange(item.cod_range_1),
            codCharge1: item.cod_charge_1 || 0,
            codRange2: parseCodRange(item.cod_range_2),
            codCharge2: item.cod_charge_2 || 0,
            codRange3: parseCodRange(item.cod_range_3),
            codCharge3: item.cod_charge_3 || 0,
            codRange4: parseCodRange(item.cod_range_4),
            codCharge4: item.cod_charge_4 || 0,
            codRange5: parseCodRange(item.cod_range_5),
            codCharge5: item.cod_charge_5 || 0,
            codRange6: parseCodRange(item.cod_range_6),
            codCharge6: item.cod_charge_6 || 0,
            status: item.status || "active",
            _id: item.id || "",
          };
        });
        console.log("Transformed pricing data:", formattedData);
        setPricingData(formattedData);
      } else {
        setPricingData([]);
      }
    } catch (err) {
      console.error("Error fetching pricing data:", err);
      setError(err.message || "Failed to fetch pricing data");
      // Fallback to dummy data if API fails
      setPricingData(dummyData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const {
      dimensionId,
      dimensionName,
      length,
      breadth,
      height,
      weight,
      dimensionCharge,
    } = editedItem;

    const payload = {
      dimension_name: dimensionName,
      length: Number(length),
      breadth: Number(breadth),
      height: Number(height),
      weight: Number(weight),
      dimension_charge: Number(dimensionCharge),
    };
    console.log("Saving edited item:", payload);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/price-manager/${dimensionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update pricing: ${errorText}`);
      }

      const updatedItem = await res.json();
      console.log("Updated item:", updatedItem);

      const updatedData = [...pricingData];
      updatedData[editIndex] = {
        ...editedItem,
        ...updatedItem.data, // only if backend returns updated data
      };
      setPricingData(updatedData);
      setEditIndex(null);
      setEditedItem({});
      alert("Pricing entry updated successfully.");
    } catch (error) {
      console.error("Error saving edit:", error);
      alert("Failed to update pricing entry.");
    }
  };

  const handleStatusToggle = async (dimensionId, newStatus) => {
    const remarks = prompt("Enter status remarks:", "");

    if (remarks === null) return; // user cancelled

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL
        }/api/price-manager/${dimensionId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            status_remarks: remarks,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      if (data.success) {
        setPricingData((prevData) =>
          prevData.map((item) =>
            item.dimensionId === dimensionId
              ? { ...item, status: newStatus, status_remarks: remarks }
              : item
          )
        );
        alert(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  const handleSelectRow = (item) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(item)) {
      newSelectedRows.delete(item);
    } else {
      newSelectedRows.add(item);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleDeleteSelected = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please login again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete selected pricing entries?"
    );
    if (!confirmed) return;

    try {
      const toDelete = [...selectedRows];
      for (const index of toDelete) {
        const item = pricingData[index];
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/price-manager/${item._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error(`Failed to delete item with ID ${item._id}`);
        }
      }

      // Remove from local state after deletion
      const updatedData = pricingData.filter(
        (_, index) => !selectedRows.has(index)
      );
      setPricingData(updatedData);
      setSelectedRows(new Set());
      alert("Selected entries deleted successfully.");
    } catch (error) {
      console.error("Error deleting entries:", error);
      alert("Failed to delete one or more entries.");
    }
  };

  // Fetch users from backend (.env.local)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Response:", res);
        if (res.status === 404) {
          console.error("API endpoint not found:", res);
          return [];
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
            status: c.status || "",
          }))
          : [];

        setUsers(usersArray);
        setFilteredUsers(usersArray);
        // if (usersArray.length > 0) {
        //   setSelectedUser(usersArray[0].id || usersArray[0]._id);
        //   setSearchTerm(
        //     usersArray[0].name ||
        //       usersArray[0].mobile ||
        //       usersArray[0].id ||
        //       usersArray[0]._id
        //   );
        // }
      } catch (error) {
        console.error("Error fetching users:", error);
        // Fallback to mock data if API fails (for development)
        const mockUsers = [
          { id: "KB101", name: "Ravi Sharma", mobile: "9876543210" },
          { id: "KB102", name: "Aman Verma", mobile: "9876543211" },
          { id: "KB103", name: "Neha Gupta", mobile: "9876543212" },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        if (mockUsers.length > 0) {
          setSelectedUser(mockUsers[0].id);
          setSearchTerm(mockUsers[0].name);
        }
      }
    };

    const fetchDummyData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/auth/customer/?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.status === 404) {
          console.error("API endpoint not found:", res);
          return [];
        }
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to fetch customers");

        const dataArray = Array.isArray(data.data?.data)
          ? data.data.data.map((c) => ({
            customerId: c.customer_id || "",
            customerName: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
            dimensionId: `DIM-${c.customer_id || ""}`,
            dimensionName: c.company_name || "N/A",
            length: 40, // Default values since pricing data might not have these
            breadth: 30,
            height: 20,
            weight: 10,
            dimensionCharge: 120,
            volumetricFactor: 5000,
            challanCharges: 50,
            expressDelivery: 10,
            gst: 18,
            codRange1: "0-999",
            codCharge1: 50,
            codRange2: "1000-1999",
            codCharge2: 70,
            codRange3: "2000-2999",
            codCharge3: 90,
            codRange4: "3000-3999",
            codCharge4: 120,
            codRange5: "4000-4999",
            codCharge5: 150,
            codRange6: "5000+",
            codCharge6: 200,
            mobile: c.mobile || c.mobile_number || "",
            email: c.email || "",
            city: c.city || "",
          }))
          : [];

        setDummyDataState(dataArray);
      } catch (error) {
        console.error("Error fetching dummy data:", error);
        // Fallback to mock data if API fails (for development)
        const mockData = [
          {
            customerId: "KB101",
            customerName: "Ravi Sharma",
            dimensionId: "DIM-KB101",
            dimensionName: "Small Box",
            length: 40,
            breadth: 30,
            height: 20,
            weight: 10,
            dimensionCharge: 120,
            volumetricFactor: 5000,
            challanCharges: 50,
            expressDelivery: 10,
            gst: 18,
            codRange1: "0-999",
            codCharge1: 50,
            codRange2: "1000-1999",
            codCharge2: 70,
            codRange3: "2000-2999",
            codCharge3: 90,
            codRange4: "3000-3999",
            codCharge4: 120,
            codRange5: "4000-4999",
            codCharge5: 150,
            codRange6: "5000+",
            codCharge6: 200,
          },
          {
            customerId: "KB102",
            customerName: "Aman Verma",
            dimensionId: "DIM-KB102",
            dimensionName: "Big Carton",
            length: 60,
            breadth: 40,
            height: 30,
            weight: 20,
            dimensionCharge: 180,
            volumetricFactor: 4500,
            challanCharges: 60,
            expressDelivery: 15,
            gst: 18,
            codRange1: "0-999",
            codCharge1: 60,
            codRange2: "1000-1999",
            codCharge2: 80,
            codRange3: "2000-2999",
            codCharge3: 100,
            codRange4: "3000-3999",
            codCharge4: 130,
            codRange5: "4000-4999",
            codCharge5: 160,
            codRange6: "5000+",
            codCharge6: 210,
          },
        ];
        setDummyDataState(mockData);
      }
    };

    fetchUsers();
    fetchDummyData();
    fetchPricingData(); // Fetch pricing data when component mounts
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
          user.email?.toLowerCase().includes(value.toLowerCase()) //
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    }
  };

  const removeDimension = (index) => {
    setDimensions((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle user selection from suggestions
  const handleUserSelect = (user) => {
    // Store the full user object in selectedUser state
    setSelectedUser({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });
    setSearchTerm(
      user.name || user.email || user.mobile || user.id || user._id
    );
    setShowSuggestions(false);
  };

  const handleAddDimension = (data = {}) => {
    setDimensions((prev) => [...prev, data]);
  };

  const handleCodRangeChange = (index, field, value) => {
    const updated = [...codRanges];
    updated[index][field] = value;
    setCodRanges(updated);
  };

  const addCodRange = () => {
    setCodRanges([...codRanges, { min: "", max: "", charge: "" }]);
  };

  const removeCodRange = (index) => {
    const updated = codRanges.filter((_, idx) => idx !== index);
    setCodRanges(updated);
  };

  const handleDimensionChange = (index, field, value) => {
    const newDims = [...dimensions];
    newDims[index] = { ...newDims[index], [field]: value };
    setDimensions(newDims);
  };

  const handleFixedSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    // Check if a user is selected
    if (!selectedUser || !selectedUser.id) {
      alert("Please select a customer first.");
      return;
    }

    // Prepare the pricing data
    const pricingData = {
      selectedUser: {
        id: selectedUser.id,
        name: selectedUser.name,
      },
      dimensions: dimensions.map((dim) => ({
        name: dim.name,
        length: parseFloat(dim.length || 0),
        breadth: parseFloat(dim.breadth || 0),
        height: parseFloat(dim.height || 0),
        weight: parseFloat(dim.weight || 0),
        price: parseFloat(dim.price || 0),
      })),
      volumetricFactor: parseFloat(form.volumetricFactor.value || 0),
      chalaanCharges:
        form.chalaanCharges.value.trim() === ""
          ? null
          : parseFloat(form.chalaanCharges.value),
      expressSurcharge: parseFloat(form.expressSurcharge.value || 0),
      gstPercentage: parseFloat(form.gstPercentage.value || 0),
      codRanges: codRanges.map((range) => ({
        min: parseFloat(range.min || 0),
        max: parseFloat(range.max || 0),
        charge: parseFloat(range.charge || 0),
      })),
    };

    console.log("Submitting pricing data:", pricingData);

    // Store the data and show popup
    setPendingPricingData(pricingData);
    setShowPushPopup(true);
  };

  // Handle push to user submission
  const handlePushSubmit = async () => {
    if (!remark.trim()) {
      alert("Please enter a remark before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Build flat payload for backend

      const cod = pendingPricingData?.codRanges || [];

      // Get the selected user from pendingPricingData
      const selectedUser = pendingPricingData.selectedUser;

      if (!selectedUser || !selectedUser.id) {
        throw new Error(
          "No customer selected. Please select a customer and try again."
        );
      }

      // Debug log to check the selected user data
      console.log("Submitting pricing for user:", {
        selectedUser,
        pendingPricingData,
        dimensions: pendingPricingData.dimensions,
        codRanges: pendingPricingData.codRanges,
      });

      let res = null;

      for (let i in dimensions) {
        const dim = pendingPricingData?.dimensions?.[i] || {};

        const payload = {
          customer_id: selectedUser.id,
          customer_name: selectedUser.name || "Unknown Customer",
          dimension_name: dim.dimensionName || dim.name || "",
          length: dim.length,
          breadth: dim.breadth,
          height: dim.height,
          weight: dim.weight,
          dimension_charge: dim.price || dim.dimensionCharge,
          volumetric_factor: pendingPricingData.volumetricFactor,
          chalaan_return_charges:
            pendingPricingData.chalaanCharges === null ||
              pendingPricingData.chalaanCharges === undefined
              ? ""
              : pendingPricingData.chalaanCharges,
          express_delivery_percentage: pendingPricingData.expressSurcharge,
          gst_percentage: pendingPricingData.gstPercentage,
          cod_range_1: cod[0]
            ? JSON.stringify({ min: cod[0].min, max: cod[0].max })
            : "",
          cod_charge_1: cod[0]?.charge ?? "",
          cod_range_2: cod[1]
            ? JSON.stringify({ min: cod[1].min, max: cod[1].max })
            : "",
          cod_charge_2: cod[1]?.charge ?? "",
          cod_range_3: cod[2]
            ? JSON.stringify({ min: cod[2].min, max: cod[2].max })
            : "",
          cod_charge_3: cod[2]?.charge ?? "",
          cod_range_4: cod[3]
            ? JSON.stringify({ min: cod[3].min, max: cod[3].max })
            : "",
          cod_charge_4: cod[3]?.charge ?? "",
          cod_range_5: cod[4]
            ? JSON.stringify({ min: cod[4].min, max: cod[4].max })
            : "",
          cod_charge_5: cod[4]?.charge ?? "",
          cod_range_6: cod[5]
            ? JSON.stringify({ min: cod[5].min, max: cod[5].max })
            : "",
          cod_charge_6: cod[5]?.charge ?? "",
          status: "deactive",
          status_remarks: remark.trim(),
        };

        res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/price-manager/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
      }
      if (!res.ok) {
        // DEBUG: Log response if not ok
        const errorText = await res.text();
        console.error("Backend response (not ok):", errorText);
        throw new Error("Failed to push pricing data");
      }

      const data = await res.json();
      if (data.success) {
        alert("✅Pricing data saved successfully!");
        setShowPushPopup(false);
        setRemark("");
        setPendingPricingData(null);
        // Reset form
        setDimensions([{}]);
        setCodRanges([{ min: 1, max: 1000, charge: "" }]);
        // Refresh the pricing data
        await fetchPricingData();
      } else {
        throw new Error(data.message || "Failed to push pricing data");
      }
    } catch (error) {
      console.error("Error pushing pricing data:", error);
      alert("Failed to push pricing data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle push popup cancel
  const handlePushCancel = () => {
    setShowPushPopup(false);
    setRemark("");
    setPendingPricingData(null);
  };

  // Dynamic pricing form submission
   // Dynamic pricing form submission
  const handleDynamicSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    // Prepare the dynamic pricing data
    const dynamicData = {
      selectedUser,
      baseFare: parseFloat(form.basePrice.value),
      volumetricFactor: parseFloat(form.volumetricFactor.value),
      codCollection: {
        range: codRanges.map((range) => ({
          from: parseFloat(range.min),
          to: parseFloat(range.max),
          charge: parseFloat(range.charge),
        })),
      },
      chalaanReturnCharges: parseFloat(form.chalaanCharges.value || 0),
      gstPercentage: parseFloat(form.gstPercentage.value || 0),
      ExpressDeliverySurchargePercentage: parseFloat(
        form.expressSurcharge.value || 0
      ),
    };

    // Store the data and show popup
    setPendingDynamicData(dynamicData);
    setShowDynamicPushPopup(true);
  };

  // Handle dynamic push to user submission
  const handleDynamicPushSubmit = async () => {
    if (!dynamicRemark.trim()) {
      alert("Please enter a remark before submitting.");
      return;
    }

    setIsDynamicSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        base_fare_per_kg: pendingDynamicData.baseFare,
        volumetric_factor: pendingDynamicData.volumetricFactor,
        chalaan_return_charges: pendingDynamicData.chalaanReturnCharges,
        express_delivery_surcharge_percentage: pendingDynamicData.ExpressDeliverySurchargePercentage,
        gst_percentage: pendingDynamicData.gstPercentage,
        cod_ranges: (pendingDynamicData.codCollection.range || []).map(r => ({
          range: [r.from, r.to],
          charge: r.charge
        })),
        status: "inactive",
        status_remark: dynamicRemark.trim()
      };
      console.log("Submitting dynamic pricing data:", payload);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to push dynamic pricing data");

      const data = await res.json();
      console.log("Dynamic pricing push response:", data);
      if (data.success) {
        alert("Dynamic pricing data pushed to database successfully!");
        setShowDynamicPushPopup(false);
        setDynamicRemark("");
        setPendingDynamicData(null);
        setDynamicSettings(payload);
        // Reset form
        setCodRanges([{ min: 1, max: 1000, charge: "" }]);
      } else {
        throw new Error(data.message || "Failed to push dynamic pricing data");
      }
    } catch (error) {
      console.error("Error pushing dynamic pricing data:", error);
      alert("Failed to push dynamic pricing data. Please try again.");
    } finally {
      setIsDynamicSubmitting(false);
    }
  };


  // Handle dynamic push popup cancel
  const handleDynamicPushCancel = () => {
    setShowDynamicPushPopup(false);
    setDynamicRemark("");
    setPendingDynamicData(null);
  };

  const loadDummy = (item) => {
    // Set the form fields with the selected item's data
    setDimensions([
      {
        name: item.dimensionName,
        length: item.length,
        breadth: item.breadth,
        height: item.height,
        weight: item.weight,
        price: item.dimensionCharge,
        _id: item._id,
      },
    ]);

    // Set COD ranges if they exist
    if (item.codRange1 && item.codCharge1) {
      setCodRanges(
        [
          {
            min: item.codRange1.min,
            max: item.codRange1.max,
            charge: item.codCharge1,
          },
          item.codRange2 && item.codCharge2
            ? {
              min: item.codRange2.min,
              max: item.codRange2.max,
              charge: item.codCharge2,
            }
            : null,
          item.codRange3 && item.codCharge3
            ? {
              min: item.codRange3.min,
              max: item.codRange3.max,
              charge: item.codCharge3,
            }
            : null,
          item.codRange4 && item.codCharge4
            ? {
              min: item.codRange4.min,
              max: item.codRange4.max,
              charge: item.codCharge4,
            }
            : null,
          item.codRange5 && item.codCharge5
            ? {
              min: item.codRange5.min,
              max: item.codRange5.max,
              charge: item.codCharge5,
            }
            : null,
          item.codRange6 && item.codCharge6
            ? {
              min: item.codRange6.min,
              max: item.codRange6.max,
              charge: item.codCharge6,
            }
            : null,
        ].filter(Boolean)
      );
    }

    // Set the selected user
    setSelectedUser(item.customerId);
    setActiveTab("fixed");

    // Scroll to the form
    document
      .getElementById("pricing-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // const handleEdit = (item) => {
  //   // Handle editing logic here
  //   console.log("Edit item:", item);
  //   // You can add logic to populate the form with item data
  //   // For example, if you want to load the item data into the form:
  //   // setActiveTab("fixed");
  //   // setDimensions([item]); // or however you want to handle the data
  //   alert("Edit functionality - implement as needed");
  // };


  // Main header component
  const Header = ({ currentView, setCurrentView }) => (
    <header className="bg-blue-900 text-white p-4">
      <div className="flex justify-between items-center">
        {/* Left: Back button (only show if not on "main" view) */}
        <div className="flex items-center">
          {currentView !== "main" && (
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              onClick={() => setCurrentView("main")}
            >
              ← Back
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="text-lg font-bold">
          {currentView === "timeWindow"
            ? "Time Window Settings"
            : currentView === "commodity"
              ? "Commodity Master"
              : "KartBuddy Admin - Pricing Settings"}
        </div>

        {/* Right: View buttons */}
        <div>
          <button
            className="bg-blue-700 mx-4 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            onClick={() => setCurrentView("commodity")}
          >
            Commodity Master
          </button>
          {currentView === "main" && (
            <button
              onClick={() => setCurrentView("timeWindow")}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Time Window
            </button>
          )}
        </div>
      </div>
    </header>
  );


  return (
    <div className="bg-gray-100 min-h-screen">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      {currentView === "timeWindow" ? (
        <TimeWindowView />
      ) : currentView === "commodity" ? (
        <CommodityMaster />
      ) : (
        <div>
          <div className="flex justify-center bg-indigo-100">
            <button
              className={`tab-button p-4 font-bold ${activeTab === "fixed"
                ? "border-b-4 border-blue-900 text-blue-900 bg-white"
                : ""
                }`}
              onClick={() => setActiveTab("fixed")}
            >
              Fixed Price Settings
            </button>
            <button
              className={`tab-button p-4 font-bold ${activeTab === "dynamic"
                ? "border-b-4 border-blue-900 text-blue-900 bg-white"
                : ""
                }`}
              onClick={() => setActiveTab("dynamic")}
              gins
            >
              Dynamic Price Settings
            </button>
          </div>

          <main className="w-full px-4 md:px-8 py-2 bg-white rounded-none md:rounded-lg shadow-none md:shadow-md">
            {activeTab === "fixed" && (
              <section>
                {!showPricingTable ? (
                  <>
                    {/* Header and View Entries */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <h2 className="text-2xl font-semibold text-blue-800">
                        Set Fixed Pricing by Dimensions
                      </h2>
                      <button
                        onClick={() => setShowPricingTable(true)}
                        className=" bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Saved Entries
                      </button>
                    </div>

                    {/* User Search */}
                    <div className="flex gap-4 items-center mb-6 flex-wrap">
                      <strong className="w-full md:w-32">Select User</strong>
                      <div className="flex-1 relative w-full md:w-auto search-container">
                        <input
                          type="text"
                          className="border p-2 rounded w-full"
                          placeholder="Search by name, mobile, user ID, or email..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onFocus={() => setShowSuggestions(true)}
                        />

                        {showSuggestions && filteredUsers.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow max-h-60 overflow-y-auto">
                            {filteredUsers.map((user) => (
                              <div
                                key={user.id || user._id}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                                onClick={() => handleUserSelect(user)}
                              >
                                <div className="font-medium">
                                  {user.name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600">
                                  ID: {user.id || user._id} | Mobile:{" "}
                                  {user.mobile || "N/A"} | Email:{" "}
                                  {user.email || "N/A"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleFixedSubmit}>
                      {dimensions.map((dim, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-end gap-4 mb-4 border-b pb-3 relative"
                        >
                          <strong className="w-full md:w-32 text-blue-700">
                            Dimension {idx + 1}
                          </strong>
                          <input
                            className="p-2 border rounded w-28"
                            placeholder="Name"
                            value={dim.name || ""}
                            onChange={(e) =>
                              handleDimensionChange(idx, "name", e.target.value)
                            }
                            required
                          />
                          <input
                            className="p-2 border rounded w-24"
                            type="number"
                            placeholder="Length"
                            value={dim.length || ""}
                            onChange={(e) =>
                              handleDimensionChange(
                                idx,
                                "length",
                                e.target.value
                              )
                            }
                            required
                          />
                          <input
                            className="p-2 border rounded w-24"
                            type="number"
                            placeholder="Breadth"
                            value={dim.breadth || ""}
                            onChange={(e) =>
                              handleDimensionChange(
                                idx,
                                "breadth",
                                e.target.value
                              )
                            }
                            required
                          />
                          <input
                            className="p-2 border rounded w-24"
                            type="number"
                            placeholder="Height"
                            value={dim.height || ""}
                            onChange={(e) =>
                              handleDimensionChange(
                                idx,
                                "height",
                                e.target.value
                              )
                            }
                            required
                          />
                          <input
                            className="p-2 border rounded w-24"
                            type="number"
                            placeholder="Weight"
                            value={dim.weight || ""}
                            onChange={(e) =>
                              handleDimensionChange(
                                idx,
                                "weight",
                                e.target.value
                              )
                            }
                            required
                          />
                          <input
                            className="p-2 border rounded w-24"
                            type="number"
                            placeholder="Price"
                            value={dim.price || ""}
                            onChange={(e) =>
                              handleDimensionChange(
                                idx,
                                "price",
                                e.target.value
                              )
                            }
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeDimension(idx)}
                            className=" hover:text-red-800 ml-5 p-1.5"
                            title="Remove Dimension"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      ))}

                      {dimensions.length < 10 && (
                        <button
                          type="button"
                          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 mb-6"
                          onClick={() => handleAddDimension({})}
                        >
                          + Add Dimension
                        </button>
                      )}

                      {/* Charges */}
                      <div className="space-y-4 mb-6">
                        {[
                          {
                            label: "Volumetric Factor",
                            name: "volumetricFactor",
                            required: true,
                          },
                          {
                            label: "Chalaan Return Charges (₹)",
                            name: "chalaanCharges",
                          },
                          {
                            label: "Express Delivery Surcharge (%)",
                            name: "expressSurcharge",
                          },
                          {
                            label: "GST Percentage (%)",
                            name: "gstPercentage",
                          },
                        ].map((field, i) => (
                          <div
                            key={i}
                            className="flex flex-wrap items-center gap-4"
                          >
                            <strong className="w-full md:w-56">
                              {field.label}
                            </strong>
                            <input
                              className="p-2 border rounded flex-1"
                              type="number"
                              name={field.name}
                              step="0.01"
                              required={field.required}
                            />
                          </div>
                        ))}
                      </div>

                      {/* COD Charges */}
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-blue-700 mb-3">
                          COD Charges Based on Order Amount
                        </h3>
                        {codRanges.map((range, index) => (
                          <div
                            key={index}
                            className="flex flex-wrap items-center gap-4 mb-3"
                          >
                            <input
                              className="p-2 border rounded w-24"
                              type="number"
                              placeholder="From"
                              value={range.min}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "min",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <input
                              className="p-2 border rounded w-24"
                              type="number"
                              placeholder="To"
                              value={range.max}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "max",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <input
                              className="p-2 border rounded w-32"
                              type="number"
                              placeholder="COD Charge (₹)"
                              value={range.charge}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "charge",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeCodRange(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        ))}

                        {codRanges.length < 6 && (
                          <button
                            type="button"
                            onClick={addCodRange}
                            className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
                          >
                            + Add COD Range
                          </button>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="mt-6 text-right">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                          Push To Selected User
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    {/* Pricing Table View */}
                    {/* <div className="flex min-w-auto"> */}
                    <div className="">
                      <div className="flex flex-col md:flex-row justify-between items-start  mb-6 ">
                        <h2 className="text-2xl font-semibold text-blue-800">
                          Saved Pricing Entries
                        </h2>
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setShowPricingTable(false)}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 shadow transition duration-200"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleDeleteSelected}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow transition duration-200"
                            disabled={selectedRows.size === 0}
                          >
                            Delete Selected
                          </button>
                        </div>
                      </div>

                      {/* Table */}

                      <div className="overflow-x-auto  ">
                        <div className="min-w-full flex justify-center  ">
                          <div className="min-w-[100%] overflow-auto rounded-lg border border-gray-200 flex shadow-sm w-[66rem]">
                            <table className=" divide-y divide-gray-200">
                              <thead className="bg-blue-600 text-white">
                                <tr>
                                  {tableHeaders.map((header, index) => (
                                    <th
                                      key={index}
                                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-blue-700 last:border-r-0"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {Array.isArray(pricingData) &&
                                  pricingData.length > 0 ? (
                                  pricingData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-4 py-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedRows.has(idx)}
                                          onChange={() => handleSelectRow(idx)}
                                        />
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                                        {item.customerId}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.customerName}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.dimensionId}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="text"
                                            name="dimensionName"
                                            value={editedItem.dimensionName}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.dimensionName
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="number"
                                            name="length"
                                            value={editedItem.length}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.length
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="number"
                                            name="breadth"
                                            value={editedItem.breadth}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.breadth
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="number"
                                            name="height"
                                            value={editedItem.height}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.height
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="number"
                                            name="weight"
                                            value={editedItem.weight}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.weight
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <input
                                            type="number"
                                            name="dimensionCharge"
                                            value={editedItem.dimensionCharge}
                                            onChange={handleChange}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200"
                                          />
                                        ) : (
                                          item.dimensionCharge
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {editIndex === idx ? (
                                          <button
                                            onClick={handleSave}
                                            className="bg-green-500 text-white p-1 rounded"
                                          >
                                            Save
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => handleEdit(idx)}
                                            className="bg-yellow-500 text-white p-1 rounded"
                                          >
                                            Edit
                                          </button>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.volumetricFactor}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.challanCharges}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.expressDelivery}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {item.gst}%
                                      </td>

                                      {/* COD Range 1 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* Old COD Range 1 */}
                                        {/* {item.codRange1 ? `${item.codRange1.min} - ${item.codRange1.max}` : 'N/A'} */}
                                        {item.codRange1?.min != null &&
                                          item.codRange1?.max != null
                                          ? `${item.codRange1.min} - ${item.codRange1.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 1 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge1 || 'N/A'} */}
                                        {item.codCharge1 !== undefined &&
                                          item.codCharge1 !== null
                                          ? `₹${item.codCharge1}`
                                          : "N/A"}
                                      </td>

                                      {/* COD Range 2 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codRange2 ? `${item.codRange2.min} - ${item.codRange2.max}` : 'N/A'} */}
                                        {item.codRange2?.min != null &&
                                          item.codRange2?.max != null
                                          ? `${item.codRange2.min} - ${item.codRange2.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 2 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge2 || 'N/A'} */}
                                        {item.codCharge2 !== null
                                          ? `₹${item.codCharge2}`
                                          : "N/A"}
                                      </td>

                                      {/* COD Range 3 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codRange3 ? `${item.codRange3.min} - ${item.codRange3.max}` : 'N/A'} */}
                                        {item.codRange3?.min != null &&
                                          item.codRange3?.max != null
                                          ? `${item.codRange3.min} - ${item.codRange3.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 3 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge3 || 'N/A'} */}
                                        {item.codCharge3 !== undefined &&
                                          item.codCharge3 !== null
                                          ? `₹${item.codCharge3}`
                                          : "N/A"}
                                      </td>

                                      {/* COD Range 4 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codRange4 ? `${item.codRange4.min} - ${item.codRange4.max}` : 'N/A'} */}
                                        {item.codRange4?.min != null &&
                                          item.codRange4?.max != null
                                          ? `${item.codRange4.min} - ${item.codRange4.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 4 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge4 || 'N/A'} */}
                                        {item.codCharge4 !== undefined &&
                                          item.codCharge4 !== null
                                          ? `₹${item.codCharge4}`
                                          : "N/A"}
                                      </td>

                                      {/* COD Range 5 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codRange5 ? `${item.codRange5.min} - ${item.codRange5.max}` : 'N/A'} */}
                                        {item.codRange5?.min != null &&
                                          item.codRange5?.max != null
                                          ? `${item.codRange5.min} - ${item.codRange5.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 5 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge5 || 'N/A'} */}
                                        {item.codCharge5 !== undefined &&
                                          item.codCharge5 !== null
                                          ? `₹${item.codCharge5}`
                                          : "N/A"}
                                      </td>

                                      {/* COD Range 6 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codRange6 ? `${item.codRange6.min} - ${item.codRange6.max}` : 'N/A'} */}
                                        {item.codRange6?.min != null &&
                                          item.codRange6?.max != null
                                          ? `${item.codRange6.min} - ${item.codRange6.max}`
                                          : "N/A"}
                                      </td>
                                      {/* COD Charge 6 */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        {/* {item.codCharge6 || 'N/A'} */}
                                        {item.codCharge6 !== undefined &&
                                          item.codCharge6 !== null
                                          ? `₹${item.codCharge6}`
                                          : "N/A"}
                                      </td>

                                      {/* Status dropdown icon */}
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r border-gray-200">
                                        <button
                                          onClick={() =>
                                            handleStatusToggle(
                                              item.dimensionId,
                                              item.status === "active" ? "deactive" : "active"
                                            )
                                          }
                                          className={`px-3 py-1 rounded-md text-xs font-medium ${item.status === "active"
                                            ? "bg-amber-500 text-green-800 hover:bg-green-200"
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                            }`}
                                        >
                                          {item.status === "active"
                                            ? "Deactivate"
                                            : "Activate"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={tableHeaders.length}
                                      className="border border-gray-300 p-8 text-center text-gray-500"
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <svg
                                          className="w-12 h-12 text-gray-400"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        <p className="text-lg">
                                          No pricing entries available
                                        </p>
                                        <p className="text-sm">
                                          Add some pricing entries to see them
                                          here
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* </div> */}
                  </>
                )}
              </section>
            )}

            {activeTab === "dynamic" && (
              <section>
                {!showDynamicPricingEntries ? (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <h2 className="text-2xl font-semibold text-blue-800">
                        Set Dynamic Pricing Rules
                      </h2>
                      <button
                        onClick={() => setShowDynamicPricingEntries(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2 shadow"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Saved Entries
                      </button>
                    </div>

                    {/* Dynamic Pricing */}
                    <form onSubmit={handleDynamicSubmit} className="space-y-4">
                      {[
                        {
                          label: "Base Fare (₹/kg)",
                          name: "basePrice",
                          required: true,
                        },
                        {
                          label: "Volumetric Factor",
                          name: "volumetricFactor",
                          required: true,
                        },
                        {
                          label: "Chalaan Return Charges (₹)",
                          name: "chalaanCharges",
                        },
                        {
                          label: "Express Delivery Surcharge (%)",
                          name: "expressSurcharge",
                        },
                        { label: "GST Percentage (%)", name: "gstPercentage" },
                      ].map((field, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 items-center flex-wrap"
                        >
                          <strong className="w-full md:w-56">
                            {field.label}
                          </strong>
                          <input
                            className="p-2 border rounded flex-1"
                            type="number"
                            name={field.name}
                            step="0.01"
                            required={field.required}
                          />
                        </div>
                      ))}

                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-blue-700 mb-3">
                          COD Charges Based on Order Amount
                        </h3>
                        {codRanges.map((range, index) => (
                          <div
                            key={index}
                            className="flex flex-wrap items-center gap-4 mb-3"
                          >
                            <input
                              className="p-2 border rounded w-24"
                              type="number"
                              placeholder="From"
                              value={range.min}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "min",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <input
                              className="p-2 border rounded w-24"
                              type="number"
                              placeholder="To"
                              value={range.max}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "max",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <input
                              className="p-2 border rounded w-32"
                              type="number"
                              placeholder="COD Charge (₹)"
                              value={range.charge}
                              onChange={(e) =>
                                handleCodRangeChange(
                                  index,
                                  "charge",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeCodRange(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              title="Delete COD Range"
                            >
                              <MdDelete size={20} />
                            </button>
                          </div>
                        ))}

                        {codRanges.length < 6 && (
                          <button
                            type="button"
                            onClick={addCodRange}
                            className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
                          >
                            + Add COD Range
                          </button>
                        )}
                      </div>

                      <div className="text-right pt-4">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                          Push Dynamic Price
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <h2 className="text-2xl font-semibold text-blue-800">
                        Dynamic Pricing Entries
                      </h2>

                      {/* <div className="flex gap-2">
                        <button
                          onClick={() => setShowDynamicPricingEntries(false)}
                          className="px-4 py-2 rounded text-white bg-gray-600 hover:bg-gray-700 transition flex items-center gap-2 shadow"
                        >
                          Back
                        </button>
                      </div> */}

                      
                    </div>
                    <DynamicPriceViewSavedEntries
                      rows={dynamicRows}
                      selectedIndex={dynamicSelectedIndex}
                      setSelectedIndex={setDynamicSelectedIndex}
                      handleDeleteDynamic={handleDeleteDynamic}
                      handleStatusToggle={handleDynamicStatusToggle}
                      setShowDynamicPricingEntries={setShowDynamicPricingEntries}
                    />
                  </>
                )}
              </section>
            )}
          </main>
        </div>
      )}

      {/* Push to User Popup Modal for Fixed Pricing */}
      {showPushPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Push Pricing to User</h3>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  You are about to push pricing data to the selected user.
                </p>
                <p className="text-sm text-gray-600">
                  Selected User:{" "}
                  <span className="font-semibold">{searchTerm}</span>
                </p>
              </div>

              {/* Remark Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Enter a remark for this pricing update..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handlePushCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePushSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Push to User Popup Modal for Dynamic Pricing */}
      {showDynamicPushPopup && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-bold">
                Push Dynamic Pricing
              </h3>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  You are about to push dynamic pricing data.
                </p>
              </div>

              {/* Remark Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="Enter a remark for this dynamic pricing update..."
                  value={dynamicRemark}
                  onChange={(e) => setDynamicRemark(e.target.value)}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDynamicPushCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  disabled={isDynamicSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDynamicPushSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  disabled={isDynamicSubmitting}
                >
                  {isDynamicSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pricing Entries Modal */}
      {showDynamicPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Dynamic Pricing Settings</h3>
              <button
                onClick={() => setShowDynamicPricingModal(false)}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="mb-4">
                <p className="text-gray-600">
                  Current Dynamic Pricing Settings:
                </p>
              </div>

              {dynamicSettings ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Current Settings</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(dynamicSettings, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No dynamic pricing settings saved yet.</p>
                  <p className="text-sm mt-2">
                    Use the form to create dynamic pricing rules.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={() => setShowDynamicPricingModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
