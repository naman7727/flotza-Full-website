/* eslint-disable no-unused-vars */
import React from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import InputSuggestion from './InputSuggestion';

const BookFixedPrice = ({ formState, setFormState }) => {

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [pickupDateMin, setPickupDateMin] = React.useState(todayStr);
  const [dcClosingTime, setDcClosingTime] = React.useState(null);
  const [shipperSearch, setShipperSearch] = React.useState('');
  const [showShipperOptions, setShowShipperOptions] = React.useState(false);
  // File upload state - NEW
  const [challanFiles, setChallanFiles] = React.useState([]);

  // Unified searchPlaces function for both shipper and consignee
  const setField = React.useCallback((field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, [setFormState]);

  // 🔍 Unified searchPlaces function
  const searchPlaces = async (term, type) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/place-manager/search?term=${term}&type=${type}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (type === "shipper") {
        setFormState((prev) => ({ ...prev, shipperResults: data.data }));
      } else if (type === "consignee") {
        setFormState((prev) => ({ ...prev, consigneeResults: data.data }));
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // ⏳ Auto-adjust if time passes while user is on page
  React.useEffect(() => {
    if (!dcClosingTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = dcClosingTime.split(":").map(Number);
      const closingTime = new Date();
      closingTime.setHours(hours, minutes, 0, 0);

      if (now >= closingTime && pickupDateMin === todayStr) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        setPickupDateMin(tomorrowStr);
        if (!formState.pickupDate || formState.pickupDate <= todayStr) {
          setField("pickupDate", tomorrowStr);
        }
        toast.warning(
          `Pickup for today is closed. Earliest available date is tomorrow. (Cutoff: ${dcClosingTime} hrs)`
        );
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [dcClosingTime, pickupDateMin, formState.pickupDate, setField, todayStr]);

  // 📌 Handle shipper search typing
  const handleShipperSearch = (e) => {
    const value = e.target.value;
    setShipperSearch(value);

    if (!value.trim()) {
      setPickupDateMin(todayStr);
      setDcClosingTime(null);
      setField("selectedShipper", null);
      return;
    }

    if (value.length >= 2) {
      searchPlaces(value, "shipper");
      setShowShipperOptions(true);
    } else {
      setFormState((prev) => ({ ...prev, shipperResults: [] }));
      setShowShipperOptions(false);
    }
  };

  // 📌 Handle shipper select
  const handleShipperSelect = async (shipper) => {
    setShipperSearch(shipper.company_name);
    setField("selectedShipper", shipper.place_id);
    setShowShipperOptions(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dc-manager/closing-time/${shipper.place_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.success && data.data.max_order_time) {
        setDcClosingTime(data.data.max_order_time);

        const now = new Date();
        const [hours, minutes] = data.data.max_order_time
          .split(":")
          .map(Number);
        const closingTime = new Date();
        closingTime.setHours(hours, minutes, 0, 0);

        if (now >= closingTime) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          setPickupDateMin(tomorrowStr);
          setField("pickupDate", tomorrowStr);
          toast.warning(
            `Pickup for today is closed. Earliest available date is tomorrow. (Cutoff: ${data.data.max_order_time} hrs)`
          );
        } else {
          setPickupDateMin(todayStr);
          if (!formState.pickupDate || formState.pickupDate < todayStr) {
            setField("pickupDate", todayStr);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching closing time:", err);
      toast.error("Failed to fetch closing time");
    }
  };

  // Consignee search logic
  const [consigneeSearch, setConsigneeSearch] = React.useState('');
  const [showConsigneeOptions, setShowConsigneeOptions] = React.useState(false);
  const handleConsigneeSearch = (e) => {
    const value = e.target.value;
    setConsigneeSearch(value);
    if (value.length >= 2) {
      searchPlaces(value, 'consignee');
      setShowConsigneeOptions(true);
    } else {
      setFormState(prev => ({ ...prev, consigneeResults: [] }));
      setShowConsigneeOptions(false);
    }
  };

  const validateCOD = () => {
    const codValue = parseFloat(formState.codValue);
    const codSlabs = formState.codSlabs;
    const toggles = formState.toggles; // if you need it here

    if (!toggles.collect_cod) return true; // COD not selected → no need to validate
    if (isNaN(codValue) || codValue <= 0) {
      toast.error("Please enter a valid COD amount");
      return false;
    }

    const maxAllowed = Math.max(...(codSlabs || []).map(s => s.max));
    if (codValue > maxAllowed) {
      toast.error(`COD amount exceeds maximum allowed value of ₹${maxAllowed}`);
      return false;
    }

    const slab = codSlabs.find(s => codValue >= s.min && codValue <= s.max);
    if (!slab) {
      toast.error("No COD charge slab found for entered amount");
      return false;
    }

    return true;
  };




  React.useEffect(() => {
    const fetchCustomerDimensions = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const customerId = decoded.customer_id || decoded.id;
        if (!customerId) return;

        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/price-manager/customer/${customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        if (res.ok && Array.isArray(json.data)) {
          const formatted = json.data.map(d => ({
            label: `${d.dimension_name}-${d.length}*${d.breadth}*${d.height}-${d.weight}kg-${d.dimension_charge}Rs`,
            dimension_id: d.dimension_id,
            length: Number(d.length),
            breadth: Number(d.breadth),
            height: Number(d.height),
            perUnitWeight: Number(d.weight),
            charges: Number(d.dimension_charge),
            volumetricFactor: Number(d.volumetric_factor),
            expressSurchargePercent: Number(d.express_delivery_percentage),
            gstRate: Number(d.gst_percentage) / 100,
            challan: d.chalaan_return_charges !== null ? Number(d.chalaan_return_charges) : null,
            codSlabs: [
              ...(d.cod_range_1 !== null ? [{ min: d.cod_range_1.min, max: d.cod_range_1.max, charge: Number(d.cod_charge_1) }] : []),
              ...(d.cod_range_2 !== null ? [{ min: d.cod_range_2.min, max: d.cod_range_2.max, charge: Number(d.cod_charge_2) }] : []),
              ...(d.cod_range_3 !== null ? [{ min: d.cod_range_3.min, max: d.cod_range_3.max, charge: Number(d.cod_charge_3) }] : []),
              ...(d.cod_range_4 !== null ? [{ min: d.cod_range_4.min, max: d.cod_range_4.max, charge: Number(d.cod_charge_4) }] : []),
              ...(d.cod_range_5 !== null ? [{ min: d.cod_range_5.min, max: d.cod_range_5.max, charge: Number(d.cod_charge_5) }] : []),
              ...(d.cod_range_6 !== null ? [{ min: d.cod_range_6.min, max: d.cod_range_6.max, charge: Number(d.cod_charge_6) }] : []),
            ]
          }));

          const first = formatted[0];

          // ✅ Auto-hide toggles if null
          const showChallanToggle = first?.challan !== null;
          const showCODToggle = first?.codSlabs?.length > 0;

          setFormState(prev => ({
            ...prev,
            availableDimensions: formatted,
            volumetricFactor: first?.volumetricFactor || 5000,
            gstRate: first?.gstRate || 0.18,
            expressSurchargePercent: first?.expressSurchargePercent || 0,
            challan: first?.challan,
            codSlabs: first?.codSlabs || [],
            toggles: {
              ...prev.toggles,
              challan_return: showChallanToggle ? prev.toggles.challan_return : false,
              collect_cod: showCODToggle ? prev.toggles.collect_cod : false
            },
            showToggles: {
              challan_return: showChallanToggle,
              collect_cod: showCODToggle
            }
          }));
        } else {
          setFormState(prev => ({ ...prev, availableDimensions: [] }));
          alert('No fixed price available for you');
        }
      } catch (err) {
        console.error('Error fetching fixed dimensions:', err);
      }
    };

    fetchCustomerDimensions();
  },);



  // Helper functions

  const updateDimension = (id, field, value) => {
    setFormState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(dim =>
        dim.id === id ? { ...dim, [field]: value } : dim
      ),
    }));
  };
  const setDimension = (id, selectedDim) => {
    setFormState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(dim =>
        dim.id === id ? { ...dim, ...selectedDim } : dim
      ),
    }));
  };
  const addDimension = () => {
    const usedLabels = formState.dimensions.map(d => d.label);
    const availableOptions = formState.availableDimensions.filter(d => !usedLabels.includes(d.label));

    if (availableOptions.length === 0) {
      alert("No more unique dimensions available.");
      return;
    }

    const newId = Math.max(...formState.dimensions.map(d => d.id)) + 1;
    setFormState(prev => ({
      ...prev,
      dimensions: [
        ...prev.dimensions,
        {
          id: newId,
          ...availableOptions[0],
          units: 1
        }
      ]
    }));
  };

  const removeDimension = id => {
    if (formState.dimensions.length > 1) {
      setFormState(prev => ({ ...prev, dimensions: prev.dimensions.filter(dim => dim.id !== id) }));
    }
  };

  // Handler for Challan file upload - UPDATED
  const handleChallanUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setChallanFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Handler for removing a single file - NEW
  const handleRemoveChallanFile = (indexToRemove) => {
    setChallanFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };


  // Calculations
  const totalUnits = formState.dimensions.reduce((sum, d) => sum + Number(d.units), 0);
  const grossWeight = formState.dimensions.reduce((sum, d) => sum + d.perUnitWeight * d.units, 0);
  const volumetricWeight = formState.dimensions.reduce((sum, d) => sum + ((d.length * d.breadth * d.height) / formState.volumetricFactor) * d.units, 0);
  const totalVolume = formState.dimensions.reduce((sum, d) => sum + d.length * d.breadth * d.height * d.units, 0);
  const chargeableWeight = Math.max(grossWeight, volumetricWeight);
  const transport_amount = formState.dimensions.reduce((sum, d) => sum + d.charges * d.units, 0);

  // Coupon code logic (dynamic price style)
  const [couponCode, setCouponCode] = React.useState('');
  const [showCouponField, setShowCouponField] = React.useState(false);
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [couponDiscount, setCouponDiscount] = React.useState(0);

  const handleApplyCoupon = () => {
    if (couponCode.trim() !== '') {
      setCouponApplied(true);
      setCouponDiscount(10); // Example: flat 10 Rs discount
    }
  };

  // Coupon remove handler
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Coupon logic: deduct from total pretax (not just transport charges)
  const transportCharges = formState.dimensions.reduce(
    (sum, d) => sum + d.charges * d.units,
    0
  );

  let preTaxAmount = transportCharges;

  // Add surcharges
  if (formState.toggles.express) {
    preTaxAmount += transportCharges * (formState.expressSurchargePercent / 100);
  }
  if (formState.toggles.challan_return) {
    preTaxAmount += formState.challan;
  }
  if (formState.toggles.collect_cod && formState.codValue) {
    const cod = parseFloat(formState.codValue);
    const codSlab = formState.codSlabs.find(
      slab => cod >= slab.min && cod <= slab.max
    );
    preTaxAmount += codSlab ? codSlab.charge : 0;
  }

  // Apply coupon AFTER all surcharges are added
  const couponDeduction = couponApplied ? Math.min(couponDiscount, preTaxAmount) : 0;
  preTaxAmount -= couponDeduction;

  // GST + Final payable
  const gstAmount = preTaxAmount * formState.gstRate;
  const finalPayable = Math.round(preTaxAmount + gstAmount); // round-off to integer


  // Handle form submission
  const handleSubmit = async () => {
    if (!formState.commodity || formState.commodity.length === 0) {
      toast.error('Please enter a commodity name');
      return;
    }
    if (!formState.selectedShipper) {
      toast.error('Please select a shipper');
      return;
    }
    if (!formState.selectedConsignee) {
      toast.error('Please select a consignee');
      return;
    }
    if (!validateCOD()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    const decodedToken = jwtDecode(token);
    const customerId = decodedToken.customer_id || decodedToken.id || decodedToken.user_id;

    if (!customerId) {
      toast.error("Customer ID not found in token");
      return;
    }

    // Utility to normalize time
    const normalizeTime = (timeStr) => {
      if (!timeStr) return null;
      if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
      return timeStr;
    };

    // Construct payload
    const payload = {
      customer_id: customerId,
      pickup_place_id: formState.selectedShipper,
      drop_place_id: formState.selectedConsignee,
      schedule_date: formState.pickupDate,
      preferred_pickup_time: formState.pickupTime,
      consignee_closing_time: normalizeTime(formState.deliveryTime),

      pickup_note: formState.pickupNote,
      drop_note: formState.dropNote,

      commodity: formState.commodity,
      price_module_type: "fixed",

      express_delivery: formState.toggles.express,
      express_charges: formState.toggles.express
        ? transportCharges * (formState.expressSurchargePercent / 100)
        : 0,

      challan_return: formState.toggles.challan_return,
      challan_charges: formState.toggles.challan_return ? formState.challan : 0,
      challan_pic: null,
      challan_return_status: formState.toggles.challan_return ? "pending" : null,

      cod_collection: formState.toggles.collect_cod,
      cod_amount: formState.toggles.collect_cod ? formState.codValue : 0,
      cod_status: formState.toggles.collect_cod ? "pending" : null,
      cod_charges: formState.toggles.collect_cod
        ? (() => {
          const cod = parseFloat(formState.codValue);
          const codSlab = formState.codSlabs.find(
            (slab) => cod >= slab.min && cod <= slab.max
          );
          return codSlab ? codSlab.charge : 0;
        })()
        : 0,

      dimensions: formState.dimensions.map((dim) => ({
        id: dim.id,
        length: dim.length,
        breadth: dim.breadth,
        height: dim.height,
        units: dim.units,
        perUnitWeight: dim.perUnitWeight,
        charges: dim.charges,
        totalVolume: dim.length * dim.breadth * dim.height * dim.units,
        totalWeight: parseFloat((dim.perUnitWeight * dim.units).toFixed(2)),
      })),

      // totals
      total_units: totalUnits,
      total_gross_weight: grossWeight,
      total_vol_weight: volumetricWeight,
      total_volume: totalVolume,
      chargeable_weight: chargeableWeight,

      // financials
      transportation_charges: transportCharges,
      applied_coupon: couponApplied ? couponCode : null,
      coupon_discount: couponApplied ? couponDiscount : 0,
      pre_tax_amount: preTaxAmount,
      gst_percentage: formState.gstRate * 100,
      gst_amount: gstAmount,
      final_payable: finalPayable,
    };

    console.log("Payload to submit:", payload);

    const isConfirmed = window.confirm(
      `Final payable amount is ₹${finalPayable.toFixed(2)}. Do you want to proceed?`
    );
    if (!isConfirmed) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/order-manager`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Order submitted successfully!");
      console.log("Order created:", response.data);
    } catch (error) {
      console.error("Error submitting order:", error);

      // ✅ Show proper backend error
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit order. Please try again.");
      }
    }
  };


  // Render
  return (
    <div className="w-full max-w-3xl bg-white p-1 rounded-lg relative">
      <h2 className="text-xl font-bold text-left mb-6">Logistics Order Form</h2>
      {/* Commodity */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Commodity</label>
        <InputSuggestion
          passOrderMode={'fixed-price'}
          value={formState.commodity}
          onChange={(newCommodity) => setField('commodity', newCommodity)}
        />
      </div>


      {/* Shipper Searchable Input */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-2">
          Select Pre-Registered Shipper:
        </label>
        <input
          type="text"
          value={shipperSearch}
          onChange={handleShipperSearch}
          onFocus={() =>
            shipperSearch.length >= 2 && setShowShipperOptions(true)
          }
          onBlur={() => setTimeout(() => setShowShipperOptions(false), 150)}
          placeholder="Search Shipper"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="off"
        />
        {showShipperOptions && shipperSearch && (
          <div className="border border-gray-300 rounded bg-white shadow max-h-40 overflow-y-auto absolute z-10 w-full">
            {formState.shipperResults?.length === 0 ? (
              <div className="p-2 text-gray-500">No shippers found</div>
            ) : (
              formState.shipperResults?.map((s) => (
                <div
                  key={s.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => handleShipperSelect(s)}
                >
                  <div className="font-semibold">
                    {s.company_name}{" "}
                    <span className="text-xs text-gray-500">
                      ({s.place_id})
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {s.contact_person_name} | {s.contact_person_mobile}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Preferred Pickup Date */}
      <div className="mb-4">
        <label
          htmlFor="pickupDate"
          className="block text-sm font-medium mb-2"
        >
          Preferred Pickup Date
        </label>
        <input
          id="pickupDate"
          type="date"
          value={formState.pickupDate}
          onChange={(e) => setField("pickupDate", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          min={pickupDateMin}
        />
        {dcClosingTime && (
          <p className="text-xs text-gray-500 mt-1">
            DC closing time: {dcClosingTime} hrs
          </p>
        )}
      </div>


      {/* Preferred Pickup Time */}
      <div className="mb-4">
        <label htmlFor="pickupTime" className="block text-sm font-medium mb-2">Preferred Pickup Time</label>
        <select
          id="pickupTime"
          className="w-full p-2 border border-gray-300 rounded"
          value={formState.pickupTime}
          onChange={e => setField('pickupTime', e.target.value)}
        >
          <option value="">Choose a Time</option>
          <option value="08:00AM to 10:00 AM">08:00AM to 10:00 AM</option>
          <option value="09:00AM to 11:00 AM">09:00AM to 11:00 AM</option>
          <option value="10:00 AM to 12:00 PM">10:00 AM to 12:00 PM</option>
          <option value="11:00 AM to 01:00 PM">11:00 AM to 01:00 PM</option>
          <option value="12:00 PM to 02:00 PM">12:00 PM to 02:00 PM</option>
        </select>
      </div>
      {/* Pickup Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Pickup Note:</label>
        <textarea
          value={formState.pickupNote}
          onChange={e => setField('pickupNote', e.target.value)}
          placeholder="Enter any pickup instructions..."
          className="w-full p-2 border border-gray-300 rounded h-20"
        />
      </div>
      {/* Consignee Searchable Input */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-2">Select Pre-Registered Consignee:</label>
        <input
          type="text"
          value={consigneeSearch}
          onChange={handleConsigneeSearch}
          onFocus={() => consigneeSearch.length >= 2 && setShowConsigneeOptions(true)}
          onBlur={() => setTimeout(() => setShowConsigneeOptions(false), 150)}
          placeholder="Search Consignee"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="off"
        />
        {showConsigneeOptions && consigneeSearch && (
          <div className="border border-gray-300 rounded bg-white shadow max-h-40 overflow-y-auto absolute z-10 w-full">
            {formState.consigneeResults.length === 0 ? (
              <div className="p-2 text-gray-500">No consignees found</div>
            ) : (
              formState.consigneeResults.map(c => (
                <div
                  key={c.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => {
                    setConsigneeSearch(c.company_name); // Autofill input
                    setFormState(prev => ({ ...prev, selectedConsignee: c.place_id }));
                  }}
                >
                  <div className="font-semibold">{c.company_name} <span className="text-xs text-gray-500">({c.place_id})</span></div>
                  <div className="text-xs text-gray-600">{c.contact_person_name} | {c.contact_person_mobile}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* Consignee Closing Time */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Consignee Closing Time:</label>
        <input
          type="time"
          value={formState.deliveryTime}
          onChange={e => setField('deliveryTime', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      {/* Drop Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Drop Note:</label>
        <textarea
          value={formState.dropNote}
          onChange={e => setField('dropNote', e.target.value)}
          placeholder="Enter any delivery instructions..."
          className="w-full p-2 border border-gray-300 rounded h-20"
        />
      </div>
      {/* Toggles */}
      <div className="flex items-center gap-6 flex-wrap mt-9 mb-9 mx-2">
        {/* Toggle 1 - Express */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formState.toggles.express}
              onChange={() => setField('toggles', { ...formState.toggles, express: !formState.toggles.express })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
            <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
          <span className="text-gray-700 text-sm">Express Delivery</span>
        </div>
        {/* Challan Return Toggle */}
        {formState.showToggles?.challan_return && (
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.toggles.challan_return}
                onChange={() =>
                  setField('toggles', { ...formState.toggles, challan_return: !formState.toggles.challan_return })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </label>
            <span className="text-gray-700 text-sm">
              Challan Return {formState.challan === 0 && <span className="text-green-600">(Free)</span>}
            </span>
          </div>
        )}
        {/* File upload for Challan Return - UPDATED */}
        {formState.toggles.challan_return && (
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">Challan Documents (Images & PDFs)</label>
            <input
              type="file"
              accept="image/*, .pdf"
              multiple
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleChallanUpload}
            />
            {challanFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected files:
                <ul className="list-disc list-inside mt-1">
                  {challanFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between w-full">
                      <span className="text-blue-600">{file.name}</span>
                      <button
                        onClick={() => handleRemoveChallanFile(index)}
                        className="text-red-500 hover:text-red-700 text-lg font-bold"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {/* COD Toggle */}
        {formState.showToggles?.collect_cod && (
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formState.toggles.collect_cod}
                onChange={() =>
                  setField('toggles', { ...formState.toggles, collect_cod: !formState.toggles.collect_cod })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </label>
            <span className="text-gray-700 text-sm">
              Collect COD {formState.codSlabs.every(s => s.charge === 0) && <span className="text-green-600">(Free)</span>}
            </span>
          </div>
        )}

        {/* COD amount input and slab display */}
        {formState.toggles.collect_cod && (
          <div className="space-y-2">
            <input
              type="number"
              value={formState.codValue || ''}
              onChange={e => setField('codValue', e.target.value)}
              placeholder="Enter COD amount"
              className="w-50 px-3 py-1 my-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* COD Validation & Slab Info */}
            {(() => {
              const codValue = parseFloat(formState.codValue);
              const codSlabs = formState.codSlabs || [];
              const maxAllowed = Math.max(...codSlabs.map(s => s.max || 0));

              if (!formState.codValue) return null;

              if (isNaN(codValue) || codValue <= 0) {
                return <div className="text-sm text-red-600">Invalid COD amount</div>;
              }

              if (codValue > maxAllowed) {
                return (
                  <div className="text-sm text-red-600">
                    COD amount exceeds maximum allowed value (₹{maxAllowed})
                  </div>
                );
              }

              const slab = codSlabs.find(s => codValue >= s.min && codValue <= s.max);
              if (!slab) {
                return (
                  <div className="text-sm text-red-600">
                    No applicable COD charge slab found for entered amount
                  </div>
                );
              }

              return (
                <div className="text-sm text-blue-600">
                  COD Charge Slab: ₹{slab.min} - ₹{slab.max} → ₹{slab.charge}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Dimensions Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
        {formState.dimensions.map((dim, index) => (
          <div key={dim.id} className="border border-gray-300 rounded p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-blue-600">Dimension {index + 1}</h4>
              {formState.dimensions.length > 1 && (
                <button
                  onClick={() => removeDimension(dim.id)}
                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Select Dimension */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-blue-600 mb-1">Select Predefined Dimension</label>
              {formState.availableDimensions.length > 0 ? (
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  onChange={e => {
                    const selectedIndex = e.target.value;
                    if (selectedIndex === '') return;

                    const selected = formState.availableDimensions[selectedIndex];
                    setDimension(dim.id, selected);

                    // Also update global pricing fields for consistency
                    setFormState(prev => ({
                      ...prev,
                      volumetricFactor: selected.volumetricFactor,
                      gstRate: selected.gstRate,
                      expressSurchargePercent: selected.expressSurchargePercent,
                      challan: selected.challan,
                      codSlabs: selected.codSlabs
                    }));
                  }}
                  value={(() => {
                    const idx = formState.availableDimensions.findIndex(d =>
                      d.length === dim.length &&
                      d.breadth === dim.breadth &&
                      d.height === dim.height &&
                      d.perUnitWeight === d.perUnitWeight &&
                      d.charges === d.charges
                    );
                    return idx !== -1 ? idx.toString() : '';
                  })()}
                >
                  <option value="">-- Select Predefined Dimension --</option>
                  {formState.availableDimensions.map((d, idx) => {
                    // Check if this dimension is already selected in another row
                    const alreadySelected = formState.dimensions.some(
                      other =>
                        other.id !== dim.id &&
                        other.length === d.length &&
                        other.breadth === d.breadth &&
                        other.height === d.height &&
                        other.perUnitWeight === d.perUnitWeight &&
                        other.charges === d.charges
                    );
                    if (alreadySelected) return null;
                    return (
                      <option key={idx} value={idx}>
                        {d.label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="text-red-600 text-sm italic">No fixed price available for you</div>
              )}
            </div>


            {/* Dimension Details */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Length (cm)</label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">{dim.length}</div>
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">Breadth (cm)</label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">{dim.breadth}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Height (cm)</label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">{dim.height}</div>
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">No. of Units</label>
                <input
                  type="number"
                  value={dim.units || ''}
                  onChange={e => updateDimension(dim.id, 'units', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Per Unit Weight (kg)</label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">{dim.perUnitWeight}</div>
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">Charges (Rs)</label>
                <div className="w-full p-2 border border-gray-200 rounded bg-gray-50 text-gray-700">{dim.charges}</div>
              </div>
            </div>

            {/* Volumetric Weight Display */}
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Volumetric Weight:</span> {((dim.length * dim.breadth * dim.height) / formState.volumetricFactor).toFixed(2)} kg
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Total Volume:</span> {(dim.length * dim.breadth * dim.height * dim.units).toLocaleString()} cm³
              </div>
            </div>
          </div>
        ))}

        {formState.availableDimensions.length > 1 && (
          <button
            onClick={addDimension}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 font-medium"
          >
            Add More Dimensions
          </button>
        )}

      </div>


      {/* Weight & Price Summary */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-800">Weight & Price Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Units:</span>
            <span className="font-semibold">{formState.dimensions.reduce((sum, d) => sum + Number(d.units), 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Gross Weight:</span>
            <span className="font-semibold">{formState.dimensions.reduce((sum, d) => sum + d.perUnitWeight * d.units, 0)} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Volumetric Weight:</span>
            <span className="font-semibold">{formState.dimensions.reduce((sum, d) => sum + ((d.length * d.breadth * d.height) / formState.volumetricFactor) * d.units, 0)} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Volume:</span>
            <span className="font-semibold">{formState.dimensions.reduce((sum, d) => sum + d.length * d.breadth * d.height * d.units, 0)} cm³</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
            <h4>Chargeable Weight:</h4>
            <span className="font-semibold mb-3 text-green-800">{Math.max(
              formState.dimensions.reduce((sum, d) => sum + d.perUnitWeight * d.units, 0),
              formState.dimensions.reduce((sum, d) => sum + ((d.length * d.breadth * d.height) / formState.volumetricFactor) * d.units, 0)
            )} kg</span>
          </div>
        </div>
      </div>
      {/* Price Calculation */}
      <div className="mb-6 bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-green-800">Price Calculation</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Transport Charges:</span>
            <span className="font-semibold">₹{transportCharges}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between text-sm text-green-600 mt-1">
              <span>Coupon Applied:</span>
              <span>-₹{couponDeduction}</span>
            </div>
          )}
          {couponApplied && (
            <button
              onClick={handleRemoveCoupon}
              className="w-full mt-2 text-red-600 text-sm bg-red-50 hover:bg-red-100 py-1 px-3 rounded flex items-center justify-center"
              type="button"
            >
              Remove Coupon
            </button>
          )}
          {formState.toggles.express && (
            <div className="flex justify-between text-orange-600">
              <span>Express Surcharge ({formState.expressSurchargePercent}%):</span>
              <span className="font-semibold">
                ₹{(transportCharges * formState.expressSurchargePercent / 100).toFixed(2)}
              </span>
            </div>
          )}
          {formState.toggles.challan_return && (
            <div className="flex justify-between text-orange-600">
              <span>Challan Return:</span>
              <span className="font-semibold">₹{formState.challan.toFixed(2)}</span>
            </div>
          )}
          {formState.toggles.collect_cod && (
            <div className="flex justify-between text-orange-600">
              <span>Collect COD:</span>
              <span className="font-semibold">₹{(() => {
                const cod = parseFloat(formState.codValue);
                const codSlab = formState.codSlabs.find(slab => cod >= slab.min && cod <= slab.max);
                return codSlab ? codSlab.charge.toFixed(2) : '0.00';
              })()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Pre-tax Amount:</span>
            <span className="font-semibold">₹{preTaxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({(formState.gstRate * 100).toFixed(0)}%):</span>
            <span className="font-semibold">₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
            <span>Final Payable:</span>
            <span>₹{finalPayable.toFixed(2)}</span>
          </div>
          {/* Coupon code input */}
          <button
            type="button"
            onClick={() => setShowCouponField(!showCouponField)}
            className="w-full mt-3 text-blue-600 text-sm bg-blue-50 hover:bg-blue-100 py-1 px-3 rounded flex items-center justify-center"
          >
            {showCouponField ? 'Hide Coupon Field' : 'Have a Coupon Code?'}
          </button>
          {showCouponField && !couponApplied && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                type="button"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Submit and Reset buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Submit Order
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
          type="button"
        >
          Reset
        </button>
        <button
          onClick={() => alert('Bulk order feature coming soon!')}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
          type="button"
        >
          Bulk Order
        </button>
      </div>
    </div>
  );
};

export default BookFixedPrice;