/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import BookFixedPrice from './BookFixedPrice';
import BookDynamicPrice from './BookDynamicPrice';
import { jwtDecode } from 'jwt-decode';

const BookPartLoad = () => {
  const [orderMode, setOrderMode] = useState('dynamic-price');
  const [hasFixedPriceAccess, setHasFixedPriceAccess] = useState(false);
  const [checkedAccess, setCheckedAccess] = useState(false);

  // Separate state objects for each mode
  const [dynamicPriceState, setDynamicPriceState] = useState({
    commodity: [],
    selectedShipper: '',
    shipperSearch: '',
    selectedConsignee: '',
    consigneeSearch: '',
    pickupDate: '',
    pickupTime: '',
    pickupNote: '',
    deliveryTime: '11:30',
    dropNote: '',
    dimensions: [
      { id: 1, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }
    ],
    toggles: {
      express: false,
      challan_return: false,
      collect_cod: false,
    },
    charges: {
      challan_return: 10,
      collect_cod: 0,
    },
    codValue: '',
    challanImage: null,
    totalUnits: 0,
    grossWeight: 0,
    volumetricWeight: 0,
    totalVolume: 0,
    chargeableWeight: 0,
    ratePerKg: 6,
    preTaxAmount: 0,
    transport_amount: 0,
    gstAmount: 0,
    finalPayable: 0,
    volumetricFactor: 5000,
    expressSurchargePercent: 25,
    challan: 10,
    gstRate: 0.18,
    codSlabs: [
      { min: 0, max: 1000, charge: 20 },
      { min: 1001, max: 5000, charge: 50 },
      { min: 5001, max: 10000, charge: 100 },
    ],
    showCouponField: false,
  });

  const [fixedPriceState, setFixedPriceState] = useState({
    commodity: [],
    selectedShipper: '',
    shipperSearch: '',
    selectedConsignee: '',
    consigneeSearch: '',
    pickupDate: '',
    pickupTime: '',
    pickupNote: '',
    deliveryTime: '11:30',
    dropNote: '',
    dimensions: [
      { id: 1, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }
    ],
    toggles: {
      express: false,
      challan_return: false,
      collect_cod: false,
    },
    charges: {
      challan_return: 10,
      collect_cod: 0,
    },
    codValue: '',
    challanImage: null,
    totalUnits: 0,
    grossWeight: 0,
    volumetricWeight: 0,
    totalVolume: 0,
    chargeableWeight: 0,
    ratePerKg: 6,
    preTaxAmount: 0,
    transport_amount: 0,
    gstAmount: 0,
    finalPayable: 0,
    volumetricFactor: 5000,
    expressSurchargePercent: 25,
    challan: 10,
    gstRate: 0.18,
    codSlabs: [
      { min: 0, max: 1000, charge: 20 },
      { min: 1001, max: 5000, charge: 50 },
      { min: 5001, max: 10000, charge: 100 },
    ],
    availableDimensions: [],
    shipperResults: [],
    consigneeResults: [],
    showToggles: {
      challan_return: true,
      collect_cod: true
    }
  });

  // Check for fixed price access
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const customerId = decoded.id;

      fetch(`${import.meta.env.VITE_BASE_URL}/api/price-manager/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const hasAccess = Array.isArray(data.data) && data.data.length > 0;
          setHasFixedPriceAccess(hasAccess);
          // Set default mode based on access
          if (hasAccess) setOrderMode('fixed-price');
        })
        .catch(err => console.error('Access check failed', err))
        .finally(() => setCheckedAccess(true));
    } catch (err) {
      console.error('JWT decode failed', err);
      setCheckedAccess(true);
    }
  }, []);

  // Function to reset all form data
  const resetForm = () => {
    // Reset to default mode based on access
    setOrderMode(hasFixedPriceAccess ? 'fixed-price' : 'dynamic-price');
    setDynamicPriceState({
      ...dynamicPriceState,
      commodity: [],
      selectedShipper: '',
      pickupTime: '',
      pickupNote: '',
      selectedConsignee: '',
      deliveryTime: '08:00',
      dropNote: '',
      dimensions: [
        { id: 1, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }
      ],
      toggles: {
        express: false,
        challan_return: false,
        collect_cod: false,
      },
      codValue: '',
      challanImage: null,
      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      showCouponField: false,
      pickupDate: '',
    });
    setFixedPriceState({
      ...fixedPriceState,
      commodity: [],
      selectedShipper: '',
      pickupTime: '',
      pickupNote: '',
      selectedConsignee: '',
      deliveryTime: '08:00',
      dropNote: '',
      dimensions: [
        { id: 1, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }
      ],
      toggles: {
        express: false,
        challan_return: false,
        collect_cod: false,
      },
      codValue: '',
      challanImage: null,
      couponCode: '',
      couponApplied: false,
      couponDiscount: 0,
      showCouponField: false,
      pickupDate: '',
    });
  };

  // Function to render buttons based on fixed price access
  const renderModeButtons = () => {
    if (hasFixedPriceAccess) {
      // Fixed price users: Fixed Price button on left, Dynamic Price on right
      return (
        <>
          <button
            type="button"
            className={`flex-1 py-2 rounded font-semibold border transition-colors duration-200 ${
              orderMode === 'fixed-price' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setOrderMode('fixed-price')}
          >
            Fixed Price
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded font-semibold border transition-colors duration-200 ${
              orderMode === 'dynamic-price' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setOrderMode('dynamic-price')}
          >
            Dynamic Price
          </button>
        </>
      );
    } else {
      // No fixed price access: Only Dynamic Price button
      return (
        <>
          <button
            type="button"
            className={`flex-1 py-2 rounded font-semibold border transition-colors duration-200 ${
              orderMode === 'dynamic-price' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setOrderMode('dynamic-price')}
          >
            Dynamic Price
          </button>
        </>
      );
    }
  };

  // Don't render until we've checked access
  if (!checkedAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2 sm:px-4">
      <div className="w-full max-w-3xl bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg border relative">
        {/* Mode Switching Buttons - Conditional based on access */}
        <div className="mb-4 flex gap-4">
          {renderModeButtons()}
        </div>

        {/* Render the appropriate component based on mode */}
        {orderMode === 'fixed-price' ? (
          <BookFixedPrice formState={fixedPriceState} setFormState={setFixedPriceState} />
        ) : (
          <BookDynamicPrice formState={dynamicPriceState} setFormState={setDynamicPriceState} />
        )}
      </div>
    </div>
  );
};

export default BookPartLoad;