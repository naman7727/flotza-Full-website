/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

const IntracityPartloadSDD = () => {
  const [walletBalance] = useState(2145);
  const [orderMode, setOrderMode] = useState('dynamic-price');
  const [selectedShipper, setSelectedShipper] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupNote, setPickupNote] = useState('');
  const [selectedConsignee, setSelectedConsignee] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('08:00'); // ✅ Default 8 AM
  const [dropNote, setDropNote] = useState('');
  const [dimensions, setDimensions] = useState([
    { id: 1, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0, charges: 0 }
  ]);
  const [dimensionSelections, setDimensionSelections] = useState(0);
  const [toggles, setToggles] = useState({
    express: false,
    challan_return: false,
    collect_cod: false,
  });
  const charges = {
    challan_return: 10,
    collect_cod: 10,
  };
  const [codValue, setCodValue] = useState("");
  const [challanImage, setChallanImage] = useState(null);


  //Dimension for fixed price
  const predefinedDimensions = [
    {
      label: "Small-30*20*15-2.5kg-100Rs",
      length: 30,
      breadth: 20,
      height: 15,
      units: 1,
      perUnitWeight: 2.5,
      charges: 100
    },
    {
      label: "Medium-50*40*30-4.2kg-200Rs",
      length: 50,
      breadth: 40,
      height: 30,
      units: 1,
      perUnitWeight: 4.2,
      charges: 200
    },
    {
      label: "Large-70*60*50-6.8kg-300Rs",
      length: 70,
      breadth: 60,
      height: 50,
      units: 1,
      perUnitWeight: 6.8,
      charges: 300
    }
  ];



  const [totalUnits, setTotalUnits] = useState(0);
  const [grossWeight, setGrossWeight] = useState(0);
  const [volumetricWeight, setVolumetricWeight] = useState(0);
  const [chargeableWeight, setChargeableWeight] = useState(0);
  const [ratePerKg] = useState(6);
  const [preTaxAmount, setPreTaxAmount] = useState(0);
  const [transport_amount, setTransportAmount] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [finalPayable, setFinalPayable] = useState(0);

  //timing 
  const timeStramp = [
    "08:00AM to 10:00 AM",
    "09:00AM to 11:00 AM",
    "10:00 AM to 12:00 PM",
    "11:00 AM to 01:00 PM",
    "12:00 PM to 02:00 PM",
  ]

  // Simulate fetching delivery time from backend
  useEffect(() => {
    const mockUser = {
      id: 1,
      name: "John Doe",
      hasFixedPrice: true,
    };

    if (mockUser.hasFixedPrice) {
      setOrderMode('fixed-price');
    }
    else {
      setOrderMode('dynamic-price');
    }

    const fetchDeliveryTimeFromBackend = async () => {
      // Simulated API response delay
      const response = await new Promise(resolve => {
        setTimeout(() => {
          resolve({ closingTime: "11:30" }); // Example backend value
        }, 1000);
      });

      if (response.closingTime) {
        setDeliveryTime(response.closingTime);
      }
    };

    fetchDeliveryTimeFromBackend();
  }, [selectedConsignee]); // Fetch when consignee changes


  const handleToggle = (type) => (event) => {
    const isChecked = event.target.checked;

    setToggles((prevToggles) => ({
      ...prevToggles,
      [type]: isChecked,
    }));


  };

  //function to store challan image
  const handleChallanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChallanImage(file);
      console.log("Challan Image:", file); // Optional: log or preview
    }
  };
  

  //calculat dynamic price
  const calculateDynamicPrice = () => {
    let totalUnitsCalc = 0;
    let totalVolumetricWeight = 0;
    let totalGrossWeight = 0;

    dimensions.forEach(dim => {
      totalUnitsCalc += dim.units;
      const volumetricWeightPerUnit = (dim.length * dim.breadth * dim.height) / 5000;
      totalVolumetricWeight += volumetricWeightPerUnit * dim.units;
      totalGrossWeight += dim.perUnitWeight * dim.units;
    });

    setTotalUnits(totalUnitsCalc);
    setVolumetricWeight(parseFloat(totalVolumetricWeight.toFixed(2)));
    setGrossWeight(parseFloat(totalGrossWeight.toFixed(2)));

    const chargeableWt = Math.max(totalGrossWeight, totalVolumetricWeight);
    setChargeableWeight(parseFloat(chargeableWt.toFixed(2)));

    let transport_amount = chargeableWt * ratePerKg;
    let preTaxAmount = transport_amount;
    preTaxAmount = toggles.express ? preTaxAmount * 1.25 : preTaxAmount;
    preTaxAmount = toggles.challan_return ? preTaxAmount + charges.challan_return : preTaxAmount;
    preTaxAmount = toggles.collect_cod ? preTaxAmount + charges.collect_cod : preTaxAmount;
    const gst = preTaxAmount * 0.18;
    const final = preTaxAmount + gst;

    setTransportAmount(parseFloat(transport_amount.toFixed(2)))
    setPreTaxAmount(parseFloat(preTaxAmount.toFixed(2)));
    setGstAmount(parseFloat(gst.toFixed(2)));
    setFinalPayable(parseFloat(final.toFixed(2)));
  };

  const calculateFixedPrice = () => {
    let totalUnitsCalc = 0;
    let totalVolumetricWeight = 0;
    let totalGrossWeight = 0;
    let transport_amount = 0;

    dimensions.forEach(dim => {
      totalUnitsCalc += dim.units;
      const volumetricWeightPerUnit = (dim.length * dim.breadth * dim.height) / 5000;
      totalVolumetricWeight += volumetricWeightPerUnit * dim.units;
      totalGrossWeight += dim.perUnitWeight * dim.units;
      transport_amount += dim.charges * dim.units;
    });

    setTotalUnits(totalUnitsCalc);
    setVolumetricWeight(parseFloat(totalVolumetricWeight.toFixed(2)));
    setGrossWeight(parseFloat(totalGrossWeight.toFixed(2)));

    const chargeableWt = Math.max(totalGrossWeight, totalVolumetricWeight);
    setChargeableWeight(parseFloat(chargeableWt.toFixed(2)));


    let preTaxAmount = transport_amount;
    preTaxAmount = toggles.express ? preTaxAmount * 1.25 : preTaxAmount;
    preTaxAmount = toggles.challan_return ? preTaxAmount + charges.challan_return : preTaxAmount;
    preTaxAmount = toggles.collect_cod ? preTaxAmount + charges.collect_cod : preTaxAmount;
    const gst = preTaxAmount * 0.18;
    const final = preTaxAmount + gst;

    setTransportAmount(parseFloat(transport_amount.toFixed(2)))
    setPreTaxAmount(parseFloat(preTaxAmount.toFixed(2)));
    setGstAmount(parseFloat(gst.toFixed(2)));
    setFinalPayable(parseFloat(final.toFixed(2)));
  }



  // ✅ Calculation
  useEffect(() => {

    //Based on the Ordermode calling the function to calculate the price
    if (orderMode == 'dynamic-price') {
      calculateDynamicPrice();
    }
    else {
      calculateFixedPrice();
    }

  }, [dimensions, ratePerKg, transport_amount, preTaxAmount, charges, toggles, orderMode, calculateDynamicPrice, calculateFixedPrice]);

  const addDimension = () => {
    const newId = Math.max(...dimensions.map(d => d.id)) + 1;
    setDimensions([...dimensions, { id: newId, length: 0, breadth: 0, height: 0, units: 1, perUnitWeight: 0 }]);
  };

  const updateDimension = (id, field, value) => {
    setDimensions(dimensions.map(dim =>
      dim.id === id ? { ...dim, [field]: parseFloat(value) || 0 } : dim
    ));
  };

  const removeDimension = (id) => {
    if (dimensions.length > 1) {
      setDimensions(dimensions.filter(dim => dim.id !== id));
    }
  };

  //Automatically set the value when any dimenstion is selected from fixed price list
  const setDimension = ({ id, length, breadth, height, units, perUnitWeight, charges }) => {
    setDimensions(prevDimensions =>
      prevDimensions.map(dim =>
        dim.id === id
          ? {
            ...dim,
            length: parseFloat(length) || 0,
            breadth: parseFloat(breadth) || 0,
            height: parseFloat(height) || 0,
            units: parseInt(units) || 0,
            perUnitWeight: parseFloat(perUnitWeight) || 0,
            charges: parseFloat(charges) || 0
          }
          : dim
      )
    );
  };


  const handleSubmit = () => {
    if (!selectedShipper || !selectedConsignee) {
      alert('Please select shipper and consignee');
      return;
    }

    const hasValidDimensions = dimensions.some(dim =>
      dim.length > 0 && dim.breadth > 0 && dim.height > 0
    );

    if (!hasValidDimensions) {
      alert('Please enter valid dimensions');
      return;
    }

    if (grossWeight <= 0) {
      alert('Please enter gross weight');
      return;
    }

    const orderData = {
      walletBalance,
      orderMode,
      selectedShipper,
      pickupTime,
      pickupNote,
      selectedConsignee,
      deliveryTime,
      dropNote,
      dimensions,
      totalUnits,
      grossWeight,
      chargeableWeight,
      ratePerKg,
      transport_amount,
      preTaxAmount,
      gstAmount,
      finalPayable
    };

    const isConfirmed = window.confirm(`Final payable amount is ₹${finalPayable}. Do you want to proceed?`);
    if (!isConfirmed) return;

    // Continue with order submission
    console.log('Order Data:', orderData);
    alert(`Thank you so much for the order!\n₹${finalPayable} has been deducted from your account.`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Logistics Order Form</h2>
        </div>

        <div className="mb-6">
          <div className="text-lg font-bold">
            Wallet Balance : ₹ {walletBalance}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Choose Order Mode:</label>
          <select
            value={orderMode}
            onChange={(e) => setOrderMode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="dynamic-price">Dynamic Price</option>
            <option value="fixed-price">Fixed Price</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Pre-Registered Shipper:</label>
          <select
            value={selectedShipper}
            onChange={(e) => setSelectedShipper(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Choose Shipper</option>
            <option value="shipper1">Shipper 1</option>
            <option value="shipper2">Shipper 2</option>
          </select>
        </div>

        <div className="mb-4">
          
          <label htmlFor="pickupTime" className="block text-sm font-medium mb-2  ">Preffered Pickup Time</label>
          <select id="pickupTime" className=" w-full p-2 border border-gray-300 rounded">
            <option hidden>Choose a Time</option>
            {timeStramp.map((time) => (
              <option value={time} key={time}>{time}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pickup Note:</label>
          <textarea
            value={pickupNote}
            onChange={(e) => setPickupNote(e.target.value)}
            placeholder="Enter any pickup instructions..."
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Pre-Registered Consignee:</label>
          <select
            value={selectedConsignee}
            onChange={(e) => setSelectedConsignee(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option hidden>Choose Consignee</option>
            <option value="consignee1">Consignee 1</option>
            <option value="consignee2">Consignee 2</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Consignee Closing Time:</label>
          <input
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Drop Note:</label>
          <textarea
            value={dropNote}
            onChange={(e) => setDropNote(e.target.value)}
            placeholder="Enter any delivery instructions..."
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>



        {/* button for express delivery ,callan return ,collect code */}

        <div className="flex items-center gap-6 flex-wrap mt-9 mb-9 mx-2">
          {/* Toggle 1 - Express */}
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={toggles.express}
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
                checked={toggles.challan_return}
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
                type="checkbox"
                checked={toggles.collect_cod}
                onChange={handleToggle("collect_cod")}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition duration-300"></div>
              <div className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5"></div>
            </label>
            <span className="text-gray-700 text-sm">Collect COD</span>
          </div>
        </div>

        {toggles.challan_return && (
          <input
            type="file"
            accept="image/*"
            className="block w-50 text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => handleChallanUpload(e)}
          />
        )}

        {toggles.collect_cod && (
          <input
            type="number"
            value={codValue}
            onChange={(e) => setCodValue(e.target.value)}
            placeholder="Enter COD amount"
            className="w-50 px-3 py-1 my-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}



        {/* Dimensions Section */}

        {/* Display when orderMode is dynamic-price */}
        {orderMode == 'dynamic-price' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Dimensions</h3>

            {dimensions.map((dim, index) => (
              <div key={dim.id} className="border border-gray-300 rounded p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-blue-600">Dimension {index + 1}</h4>
                  {dimensions.length > 1 && (
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
                    <span className="font-medium">Volumetric Weight:</span> {((dim.length * dim.breadth * dim.height) / 5000 * dim.units).toFixed(2)} kg
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
        )}

        {/* Display when orderMode is fixed-price */}
        {orderMode == 'fixed-price' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Dimensions</h3>

            <label className="block text-sm font-medium text-blue-600 mb-1">Select Dimension</label>
            <select
              className="w-full p-2 border border-gray-300 rounded my-4"
              onChange={(e) => {
                const selectedIndex = e.target.value;
                if (selectedIndex === '') return;

                const selectedDim = predefinedDimensions[selectedIndex];

                if (dimensionSelections === 0) {
                  // First time: Set first dimension
                  setDimension({
                    id: dimensions[0].id,
                    ...selectedDim
                  });
                } else {
                  // Add new and set values
                  const newId = Math.max(...dimensions.map(d => d.id)) + 1;
                  setDimensions(prev => [
                    ...prev,
                    {
                      id: newId,
                      ...selectedDim
                    }
                  ]);
                }

                setDimensionSelections(prev => prev + 1); // Increase selection count
                e.target.value = ''; // Reset dropdown after selection
              }}
              defaultValue=""
            >
              <option value="">-- Select Dimension --</option>
              {predefinedDimensions.map((d, idx) => (
                <option key={idx} value={idx}>
                  {d.label}
                </option>
              ))}
            </select>

            {dimensions.map((dim, index) => (
              <div key={dim.id} className="border border-gray-300 rounded p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-blue-600">Dimension {index + 1}</h4>
                  {dimensions.length > 1 && (
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
                      readOnly
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
                      readOnly
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
                      readOnly
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
                      readOnly
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
                    <span className="font-medium">Volumetric Weight:</span> {((dim.length * dim.breadth * dim.height) / 5000 * dim.units).toFixed(2)} kg
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
        )}

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


            {toggles.express && (
              <div className="flex justify-between text-orange-600">
                <span>Express Surcharge (25%):</span>
                <span className="font-semibold">₹{(transport_amount * 0.25).toFixed(2)}</span>
              </div>
            )}
            {toggles.challan_return && (
              <div className="flex justify-between text-orange-600">
                <span>Challan Return:</span>
                <span className="font-semibold">₹{(charges.challan_return).toFixed(2)}</span>
              </div>
            )}
            {toggles.collect_cod && (
              <div className="flex justify-between text-orange-600">
                <span>Collect COD:</span>
                <span className="font-semibold">₹{(charges.collect_cod).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Pre-tax Amount:</span>
              <span className="font-semibold">₹{preTaxAmount}</span>
            </div>

            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="font-semibold">₹{gstAmount}</span>
            </div>

            <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
              <span>Final Payable:</span>
              <span>₹{finalPayable}</span>
            </div>
          </div>
        </div>


        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};

export default IntracityPartloadSDD;

