/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import InputSuggestion from './InputSuggestion';

const BookDynamicPrice = ({ formState, setFormState }) => {
  // Local states for search functionality
  const [shipperSearch, setShipperSearch] = useState('');
  const [shipperResults, setShipperResults] = useState([]);
  const [showShipperOptions, setShowShipperOptions] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [pickupDateMin, setPickupDateMin] = useState(todayStr);
  const [dcClosingTime, setDcClosingTime] = useState(null);

  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [consigneeResults, setConsigneeResults] = useState([]);
  const [showConsigneeOptions, setShowConsigneeOptions] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // File upload state
  const [challanFiles, setChallanFiles] = useState([]);

  // Calculated values
  const [totalUnits, setTotalUnits] = useState(0);
  const [grossWeight, setGrossWeight] = useState(0);
  const [volumetricWeight, setVolumetricWeight] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [chargeableWeight, setChargeableWeight] = useState(0);
  const [preTaxAmount, setPreTaxAmount] = useState(0);
  const [transport_amount, setTransportAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [finalPayable, setFinalPayable] = useState(0);

  const timeStramp = [
    "08:00AM to 10:00 AM",
    "09:00AM to 11:00 AM",
    "10:00 AM to 12:00 PM",
    "11:00 AM to 01:00 PM",
    "12:00 PM to 02:00 PM",
  ];

  const toNumber = (val) => (val !== null && val !== undefined && !isNaN(val) ? Number(val) : 0);

  // Helper functions
  const setField = (field, value) => setFormState(prev => ({ ...prev, [field]: value }));

  const handleToggle = (type) => (event) => {
    const isChecked = event.target.checked;
    setFormState((prevState) => ({
      ...prevState,
      toggles: {
        ...prevState.toggles,
        [type]: isChecked,
      },
    }));
  };

  // Handler for Challan file upload
  const handleChallanUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setChallanFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Handler for removing a single file
  const handleRemoveChallanFile = (indexToRemove) => {
    setChallanFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };


  const validateCOD = () => {
    const codValue = parseFloat(formState.codValue);
    const codSlabs = formState.codSlabs;

    if (!formState.toggles.collect_cod) return true;
    if (isNaN(codValue) || codValue <= 0) {
      toast.error("Please enter a valid COD amount");
      return false;
    }

    const maxAllowed = Math.max(...codSlabs.map(s => s.max));
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

  const calculateDynamicPrice = () => {
    let totalUnitsCalc = 0;
    let totalVolumetricWeight = 0;
    let totalGrossWeight = 0;
    let totalVolumeCalc = 0;

    formState.dimensions.forEach(dim => {
      totalUnitsCalc += dim.units;
      const volumetricWeightPerUnit = (dim.length * dim.breadth * dim.height) / formState.volumetricFactor;
      totalVolumetricWeight += volumetricWeightPerUnit * dim.units;
      totalGrossWeight += dim.perUnitWeight * dim.units;
      totalVolumeCalc += dim.length * dim.breadth * dim.height * dim.units;
    });

    setTotalUnits(totalUnitsCalc);
    setVolumetricWeight(parseFloat(totalVolumetricWeight.toFixed(2)));
    setGrossWeight(parseFloat(totalGrossWeight.toFixed(2)));
    setTotalVolume(totalVolumeCalc);

    const chargeableWt = Math.max(totalGrossWeight, totalVolumetricWeight);
    setChargeableWeight(parseFloat(chargeableWt.toFixed(2)));

    let transport_amount = chargeableWt * formState.ratePerKg;
    let preTaxAmount = transport_amount;
    preTaxAmount = formState.toggles.express
      ? preTaxAmount + (preTaxAmount * formState.expressSurchargePercent / 100)
      : preTaxAmount;

    preTaxAmount = formState.toggles.challan_return ? preTaxAmount + formState.challan : preTaxAmount;

    if (formState.toggles.collect_cod && formState.codValue) {
      const cod = parseFloat(formState.codValue);
      const codSlab = formState.codSlabs.find(slab => cod >= slab.min && cod <= slab.max);
      const codCharge = codSlab ? codSlab.charge : 0;
      preTaxAmount += codCharge;

      setFormState((prevState) => ({
        ...prevState,
        charges: {
          ...prevState.charges,
          collect_cod: codCharge,
        },
      }));
    } else {
      setFormState((prevState) => ({
        ...prevState,
        charges: {
          ...prevState.charges,
          collect_cod: 0,
        },
      }));
    }

    const gst = preTaxAmount * (formState.gstRate / 100);
    const final = preTaxAmount + gst;

    setTransportAmount(parseFloat(transport_amount.toFixed(2)));
    setPreTaxAmount(parseFloat(preTaxAmount.toFixed(2)));
    setGstAmount(parseFloat(gst.toFixed(2)));
    setFinalPayable(parseFloat(final.toFixed(2)));
  };

  const addDimension = () => {
    if (formState.dimensions.length >= 10) {
      alert('You can add a maximum of 10 dimensions.');
      return;
    }
    const newId = Math.max(...formState.dimensions.map(d => d.id)) + 1;
    setFormState((prevState) => ({
      ...prevState,
      dimensions: [...prevState.dimensions, { id: newId, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }],
    }));
  };

  const updateDimension = (id, field, value) => {
    setFormState((prevState) => ({
      ...prevState,
      dimensions: prevState.dimensions.map(dim =>
        dim.id === id ? { ...dim, [field]: parseFloat(value) || 0 } : dim
      ),
    }));
  };

  const removeDimension = (id) => {
    if (formState.dimensions.length > 1) {
      setFormState((prevState) => ({
        ...prevState,
        dimensions: prevState.dimensions.filter(dim => dim.id !== id),
      }));
    }
  };

  const searchPlaces = async (term, type) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/place-manager/search?term=${term}&type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (type === 'shipper') {
        setShipperResults(data.data);
      } else {
        setConsigneeResults(data.data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleShipperSearch = (e) => {
    const value = e.target.value;
    setShipperSearch(value);
    if (value.length >= 2) {
      searchPlaces(value, 'shipper');
      setShowShipperOptions(true);
    } else {
      setShipperResults([]);
      setShowShipperOptions(false);
    }
  };

  const handleConsigneeSearch = (e) => {
    const value = e.target.value;
    setConsigneeSearch(value);
    if (value.length >= 2) {
      searchPlaces(value, 'consignee');
      setShowConsigneeOptions(true);
    } else {
      setConsigneeResults([]);
      setShowConsigneeOptions(false);
    }
  };

  useEffect(() => {
    if (!dcClosingTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = dcClosingTime.split(':').map(Number);
      const closingTime = new Date();
      closingTime.setHours(hours, minutes, 0, 0);

      if (now >= closingTime && pickupDateMin === todayStr) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setPickupDateMin(tomorrowStr);

        // force change pickup date if invalid
        if (!formState.pickupDate || formState.pickupDate <= todayStr) {
          setField('pickupDate', tomorrowStr);
        }

        toast.warning("Pickup for today is closed. Earliest available date is tomorrow.");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dcClosingTime, pickupDateMin, formState.pickupDate]);

  const handleShipperSearchInput = (e) => {
    const value = e.target.value;
    setShipperSearch(value);

    if (!value.trim()) {
      // Reset date restrictions if shipper is cleared
      setPickupDateMin(todayStr);
      setDcClosingTime(null);
      setField('selectedShipper', null);
      return;
    }

    if (value.length >= 2) {
      searchPlaces(value, 'shipper');
      setShowShipperOptions(true);
    } else {
      setShipperResults([]);
      setShowShipperOptions(false);
    }
  };


  const handleShipperSelect = async (shipper) => {
    setShipperSearch(shipper.company_name);
    setField('selectedShipper', shipper.place_id);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dc-manager/closing-time/${shipper.place_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (data.success && data.data.max_order_time) {
        setDcClosingTime(data.data.max_order_time);

        const now = new Date();
        const [hours, minutes] = data.data.max_order_time.split(':').map(Number);
        const closingTime = new Date();
        closingTime.setHours(hours, minutes, 0, 0);

        if (now >= closingTime) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          setPickupDateMin(tomorrowStr);
          setField('pickupDate', tomorrowStr); // force change date
          toast.warning(
            `Pickup for today is closed. Earliest available date is tomorrow. (Cutoff: ${data.data.max_order_time} hrs)`
          );
        } else {
          setPickupDateMin(todayStr);
          // Ensure date isn't before today
          if (!formState.pickupDate || formState.pickupDate < todayStr) {
            setField('pickupDate', todayStr);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching closing time:', err);
      toast.error("Failed to fetch closing time");
    }
  };

  // Utility to normalize time
  const normalizeTime = (timeStr) => {
    if (!timeStr) return null;
    // If "HH:mm", append :00
    if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
    // If already "HH:mm:ss", return as is
    return timeStr;
  };


  const handleSubmit = async () => {
    if (!validateCOD()) return;
    if (!formState.selectedShipper || !formState.selectedConsignee) {
      alert("Please select shipper and consignee");
      return;
    }

    const hasValidDimensions = formState.dimensions.some(
      (dim) => dim.length > 0 && dim.breadth > 0 && dim.height > 0
    );
    if (!hasValidDimensions) {
      alert("Please enter valid dimensions");
      return;
    }

    if (grossWeight <= 0) {
      alert("Please enter gross weight");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token not found");
      return;
    }

    const decodedToken = jwtDecode(token);

    const customerId =
      decodedToken.customer_id || decodedToken.id || decodedToken.user_id;

    if (!customerId) {
      alert("Customer ID not found in token");
      return;
    }

    // Construct payload
    const payload = {
      customer_id: customerId,
      pickup_place_id: formState.selectedShipper, // shipper = pickup
      drop_place_id: formState.selectedConsignee, // consignee = drop
      schedule_date: formState.pickupDate,
      preferred_pickup_time: formState.pickupTime,
      consignee_closing_time: normalizeTime(formState.deliveryTime),

      pickup_note: formState.pickupNote,
      drop_note: formState.dropNote,

      commodity: formState.commodity, // ✅ jsonb array
      price_module_type: "dynamic",

      express_delivery: formState.toggles.express,
      express_charges: formState.toggles.express
        ? transport_amount * (formState.expressSurchargePercent / 100)
        : 0,

      challan_return: formState.toggles.challan_return,
      challan_charges: formState.toggles.challan_return ? formState.challan : 0,
      challan_pic: null,
      challan_return_status: formState.toggles.challan_return ? "pending" : null,

      cod_collection: formState.toggles.collect_cod,
      cod_amount: formState.toggles.collect_cod ? formState.codValue : 0,
      cod_status: formState.toggles.collect_cod ? "pending" : null,
      cod_charges: formState.toggles.collect_cod
        ? formState.charges.collect_cod
        : 0,

      // ✅ dimensions with volumetric weight included
      dimensions: formState.dimensions.map((dim) => {
        const volumetricWeightPerUnit =
          (dim.length * dim.breadth * dim.height) / formState.volumetricFactor;
        return {
          id: dim.id,
          length: dim.length,
          breadth: dim.breadth,
          height: dim.height,
          units: dim.units,
          perUnitWeight: dim.perUnitWeight,
          volumetricWeightPerUnit: parseFloat(
            volumetricWeightPerUnit.toFixed(2)
          ),
          totalVolume: dim.length * dim.breadth * dim.height * dim.units,
          totalWeight: parseFloat((dim.perUnitWeight * dim.units).toFixed(2)),
        };
      }),

      // ✅ totals
      total_units: totalUnits,
      total_gross_weight: grossWeight,
      total_vol_weight: volumetricWeight,
      total_volume: totalVolume,
      chargeable_weight: chargeableWeight,

      // ✅ financials
      transportation_charges: transport_amount,
      applied_coupon: couponApplied ? couponCode : null,
      coupon_discount: couponApplied ? couponDiscount : 0,
      pre_tax_amount: preTaxAmount,
      gst_percentage: formState.gstRate,
      gst_amount: gstAmount,
      final_payable: finalPayable,
    };

    console.log("Payload to submit:", payload);

    const isConfirmed = window.confirm(
      `Final payable amount is ₹${finalPayable}. Do you want to proceed?`
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
      toast.error("Failed to submit order. Please try again.");
    }
  };



  // Coupon handlers
  const handleApplyCoupon = () => {
    if (couponApplied) return;
    if (couponCode.trim() !== '') {
      setCouponApplied(true);
      setCouponDiscount(10);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponDiscount(0);
  };

  // Fetch active dynamic price
  useEffect(() => {
    const fetchActiveDynamicPrice = async () => {
      try {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/dynamic-price-manager/active`);
        const data = res.data?.data;
        console.log('Active Dynamic Price Data:', data);
        if (!data) return;

        setFormState(prev => {
          const newState = {
            ...prev,
            ratePerKg: toNumber(data.base_fare_per_kg),
            volumetricFactor: toNumber(data.volumetric_factor),
            challan: toNumber(data.chalaan_return_charges),
            expressSurchargePercent: toNumber(data.express_delivery_surcharge_percentage),
            gstRate: toNumber(data.gst_percentage),
            codSlabs: Array.isArray(data.cod_ranges)
              ? data.cod_ranges.map(r => ({
                min: r.range?.[0] ?? 0,
                max: r.range?.[1] ?? 0,
                charge: toNumber(r.charge)
              }))
              : [],
          };
          return newState;
        });

      } catch (err) {
        console.error('Failed to fetch active dynamic price', err);
      }
    };

    fetchActiveDynamicPrice();
  }, []);

  // Fetch delivery time from backend when consignee changes
  useEffect(() => {
    const fetchDeliveryTimeFromBackend = async () => {
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({ closingTime: "11:30" });
        }, 1000);
      });

      if (response.closingTime) {
        setField('deliveryTime', response.closingTime);
      }
    };

    if (formState.selectedConsignee) {
      fetchDeliveryTimeFromBackend();
    }
  }, [formState.selectedConsignee]);

  // Calculate prices when relevant values change
  useEffect(() => {
    calculateDynamicPrice();
  }, [
    formState.dimensions,
    formState.ratePerKg,
    formState.toggles,
    formState.volumetricFactor,
    formState.codValue,
    formState.expressSurchargePercent,
    formState.challan,
    formState.gstRate,
    formState.codSlabs
  ]);

  // Calculate GST and final payable after coupon discount
  useEffect(() => {
    let preTax = transport_amount;

    if (formState.toggles.express) {
      preTax += transport_amount * (formState.expressSurchargePercent / 100);
    }
    if (formState.toggles.challan_return) {
      preTax += formState.challan;
    }
    if (formState.toggles.collect_cod) {
      preTax += formState.charges.collect_cod;
    }

    let couponDeduction = couponApplied ? Math.min(couponDiscount, preTax) : 0;
    let preTaxAfterCoupon = preTax - couponDeduction;

    const gst = preTaxAfterCoupon * (formState.gstRate / 100);

    setPreTaxAmount(parseFloat(preTaxAfterCoupon.toFixed(2)));
    setGstAmount(parseFloat(gst.toFixed(2)));
    setFinalPayable(parseFloat((preTaxAfterCoupon + gst).toFixed(2)));
  }, [
    transport_amount,
    formState.toggles,
    couponApplied,
    couponDiscount,
    formState.expressSurchargePercent,
    formState.challan,
    formState.charges.collect_cod,
    formState.gstRate
  ]);


  return (
    <div className="w-full max-w-3xl bg-white p-1 rounded-lg relative">
      <div className="text-center mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-left">Logistics Order Form</h2>
      </div>

      {/* Commodity Input */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Commodity</label>
        <InputSuggestion
          passOrderMode={'dynamic-price'}
          value={formState.commodity}
          onChange={(newCommodity) => setField('commodity', newCommodity)}
        />
      </div>
      {/* Shipper Searchable Input */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-2">Select Pre-Registered Shipper:</label>
        <input
          type="text"
          value={shipperSearch}
          onChange={handleShipperSearchInput}
          onFocus={() => shipperSearch.length >= 2 && setShowShipperOptions(true)}
          onBlur={() => setTimeout(() => setShowShipperOptions(false), 150)}
          placeholder="Search Shipper"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="off"
        />
        {showShipperOptions && shipperSearch && (
          <div className="border border-gray-300 rounded bg-white shadow max-h-40 overflow-y-auto absolute z-10 w-full">
            {shipperResults.length === 0 ? (
              <div className="p-2 text-gray-500">No shippers found</div>
            ) : (
              shipperResults.map(s => (
                <div
                  key={s.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => handleShipperSelect(s)}
                >
                  <div className="font-semibold">
                    {s.company_name} <span className="text-xs text-gray-500">({s.place_id})</span>
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
        <label htmlFor="pickupDate" className="block text-sm font-medium mb-2">Preferred Pickup Date</label>
        <input
          id="pickupDate"
          type="date"
          value={formState.pickupDate}
          onChange={e => setField('pickupDate', e.target.value)}
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
          {timeStramp.map((time) => (
            <option value={time} key={time}>{time}</option>
          ))}
        </select>
      </div>

      {/* Pickup Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Pickup Note:</label>
        <textarea
          value={formState.pickupNote}
          onChange={(e) => setField('pickupNote', e.target.value)}
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
            {consigneeResults.length === 0 ? (
              <div className="p-2 text-gray-500">No consignees found</div>
            ) : (
              consigneeResults.map(c => (
                <div
                  key={c.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => {
                    setConsigneeSearch(c.company_name);
                    setField('selectedConsignee', c.place_id);
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
          onChange={(e) => setField('deliveryTime', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Drop Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Drop Note:</label>
        <textarea
          value={formState.dropNote}
          onChange={(e) => setField('dropNote', e.target.value)}
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
              onChange={handleToggle("express")}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
            <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
          <span className="text-gray-700 text-sm">Express Delivery</span>
        </div>

        {/* Toggle 2 - Challan Return */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formState.toggles.challan_return}
              onChange={handleToggle("challan_return")}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
            <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
          <span className="text-gray-700 text-sm">Challan Return</span>
        </div>

        {/* Toggle 3 - Collect COD */}
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="collect_cod"
              type="checkbox"
              checked={formState.toggles.collect_cod}
              onChange={handleToggle("collect_cod")}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
            <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
          </label>
          <label htmlFor="collect_cod" className="text-gray-700 text-sm">Collect COD</label>
        </div>
      </div>

      {/* File upload for Challan Return */}
      {formState.toggles.challan_return && (
        <div className="mb-4">
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

      {formState.toggles.collect_cod && (
        <div className="space-y-2">
          <input
            type="number"
            value={formState.codValue}
            onChange={(e) => setField('codValue', e.target.value)}
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

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Length (cm)</label>
                <input
                  type="number"
                  value={dim.length || ''}
                  onChange={(e) => updateDimension(dim.id, 'length', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">Breadth (cm)</label>
                <input
                  type="number"
                  value={dim.breadth || ''}
                  onChange={(e) => updateDimension(dim.id, 'breadth', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={dim.height || ''}
                  onChange={(e) => updateDimension(dim.id, 'height', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">No. of Units</label>
                <input
                  type="number"
                  value={dim.units || ''}
                  onChange={(e) => updateDimension(dim.id, 'units', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm text-blue-600 mb-1">Per Unit Weight (kg)</label>
                <input
                  type="number"
                  value={dim.perUnitWeight || ''}
                  onChange={(e) => updateDimension(dim.id, 'perUnitWeight', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-sm text-blue-600 mb-1">Total Weight (kg)</label>
                <input
                  type="number"
                  value={(dim.perUnitWeight * dim.units).toFixed(2)}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                />
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
        <button
          onClick={addDimension}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 font-medium"
        >
          Add More Dimensions
        </button>
      </div>

      {/* Summary Section */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-gray-800">Weight & Price Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Units:</span>
            <span className="font-semibold">{totalUnits}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Gross Weight:</span>
            <span className="font-semibold">{grossWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Volumetric Weight:</span>
            <span className="font-semibold">{volumetricWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Volume:</span>
            <span className="font-semibold">{totalVolume} cm³</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
            <h4>Chargeable Weight:</h4>
            <span className="font-semibold mb-3 text-green-800">{chargeableWeight} kg</span>
          </div>
        </div>
      </div>

      {/* Price Calculation */}
      <div className="mb-6 bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-green-800">Price Calculation</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Transport Charges:</span>
            <span className="font-semibold">₹{transport_amount}</span>
          </div>

          {formState.toggles.express && (
            <div className="flex justify-between text-orange-600">
              <span>Express Surcharge ({formState.expressSurchargePercent}%):</span>
              <span className="font-semibold">
                ₹{(transport_amount * formState.expressSurchargePercent / 100).toFixed(2)}
              </span>
            </div>
          )}

          {formState.toggles.challan_return && (
            <div className="flex justify-between text-orange-600">
              <span>Challan Return:</span>
              <span className="font-semibold">₹{(formState.challan).toFixed(2)}</span>
            </div>
          )}

          {formState.toggles.collect_cod && (
            <div className="flex justify-between text-orange-600">
              <span>Collect COD:</span>
              <span className="font-semibold">₹{(formState.charges.collect_cod).toFixed(2)}</span>
            </div>
          )}

          {couponApplied && (
            <div className="flex justify-between text-sm text-green-600 mt-1">
              <span>Coupon Applied:</span>
              <span>-₹{Math.min(couponDiscount, preTaxAmount + couponDiscount)}</span>
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

          <div className="flex justify-between">
            <span>Pre-tax Amount:</span>
            <span className="font-semibold">₹{preTaxAmount}</span>
          </div>

          <div className="flex justify-between">
            <span>GST ({(formState.gstRate).toFixed(0)}%):</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(gstAmount)}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
            <span>Final Payable:</span>
            <span>₹{finalPayable}</span>
          </div>

          <button
            type="button"
            onClick={() => setField('showCouponField', !formState.showCouponField)}
            className="w-full mt-3 text-blue-600 text-sm bg-blue-50 hover:bg-blue-100 py-1 px-3 rounded flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              ></path>
            </svg>
            {formState.showCouponField ? 'Hide Coupon Field' : 'Have a Coupon Code?'}
          </button>

          {formState.showCouponField && !couponApplied && (
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

export default BookDynamicPrice;