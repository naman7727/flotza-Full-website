import React, { useState } from "react";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import InputSuggestion from './InputSuggestion';

const RentCarrier = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [EndDate, setEndDate] = useState(dayjs());
  const [activeDate, setActiveDate] = useState(null); // "start" or "end"
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = React.useState(true);
  const [unloading, setUnloading] = React.useState(true);
  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  // const [roundTrip, setRoundTrip] = useState(false);

  const [startTime, setStartTime] = useState(dayjs().hour(9).minute(0));
  const [endTime, setEndTime] = useState(dayjs().hour(13).minute(0));
  const durationOptions = [4, 8, 12]; // just a constant list of options
  const [duration, setDuration] = useState(null);

  const [activeClock, setActiveClock] = useState(null); // "start" or "end"

  const [charges, setCharges] = useState({
    baseRatePerHour: 1000,
    loadingCharge: 500,
    unloadingCharge: 400,
    roundTripCharge: 800,
    gstPercentage: 18, // GST (will be hidden from view but added in total)
  });

  const loadingCharge = loading ? charges.loadingCharge : 0;
  const unloadingCharge = unloading ? charges.unloadingCharge : 0;
  const baseCharge = duration ? duration * charges.baseRatePerHour : 0;

  const subtotal = baseCharge + loadingCharge + unloadingCharge;
  const gstAmount = (subtotal * charges.gstPercentage) / 100;
  const totalCharges = subtotal + gstAmount;

  const handleClickOrder = () => {
    alert("Order submitted!");
  };
  
  // Function to reset all form data
  const resetForm = () => {
    setSelectedDate(dayjs());
    setEndDate(dayjs());
    setActiveDate(null);
    setShowCalendar(false);
    setLoading(true);
    setUnloading(true);
    setStartTime(dayjs().hour(9).minute(0));
    setEndTime(dayjs().hour(13).minute(0));
    setDuration(null);
    setActiveClock(null);
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setShowCouponField(false);
  };

  function handleClick() {
    setLoading(true);
  }
  function handleClickUnloading() {
    setUnloading(true);
  }
  const handleReset = () => {
    setSelectedDate(dayjs());
    setEndDate(dayjs());
    setStartTime(dayjs().hour(9).minute(0));
    setEndTime(dayjs().hour(13).minute(0));
    setDuration(null);
    setActiveClock(null);
    setActiveDate(null);
    setShowCalendar(null);
    setLoading(null);
    setUnloading(null);
  };

  const [commodities, setCommodities] = useState([]);

  return (
    <div className=" flex max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <form className="block z-20 p-2">
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Commodity</label>
          <InputSuggestion value={commodities} onChange={setCommodities} />
        </div>
        <label className="block mb-2 text-sm font-medium">
          Deployment Duration
        </label>
        <select
          className="w-[550px] border p-2 rounded mb-4"
          value={duration || ""}
          onChange={(e) => {
            const selectedDuration = parseInt(e.target.value);
            setDuration(selectedDuration);
            setEndTime(startTime.add(selectedDuration, "hour"));
          }}
        >
          <option hidden>Select Deployment Duration</option>
          {durationOptions.map((option) => (
            <option key={option} value={option}>
              {option} Hours
            </option>
          ))}
        </select>

        {/* Start Time */}

        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium">Start Time</label>
          <button
            type="button"
            onClick={() => {
              setActiveClock("start");
              setShowCalendar(false);
            }}
            className="w-[250px] px-4 py-2 bg-white text-black   border rounded hover:bg-blue-100"
          >
            {startTime.format("HH:mm")}
          </button>
        </div>

        {/* End Time */}
        <div className="relative  top-[-70px] left-[289px]">
          <label className="block mb-2 text-sm  font-medium">End Time </label>
          <button
            type="button"
            text="EndTime"
            onClick={() => {
              setActiveClock("end");
              setEndTime(false);
            }}
            className="w-[250px] px-4 py-2 bg-white text-black border rounded hover:bg-blue-100"
          >
            {endTime.format("HH:mm")}
          </button>
        </div>

        {/* ✅ Time Range Display */}

        {/* Clock Popup */}
        {activeClock && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
            <div className="w-80 h-[420px] p-6 bg-white rounded-xl shadow-xl border border-gray-300 flex flex-col items-center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimeClock
                  value={activeClock === "start" ? startTime : endTime}
                  onChange={(newValue) => {
                    if (activeClock === "start") {
                      setStartTime(newValue);
                      // If duration is selected, auto-calculate endTime
                      if (duration) {
                        const calculatedEnd = newValue.add(duration, "hour");
                        setEndTime(calculatedEnd);
                      }
                    } else {
                      // Only allow reducing endTime, not increasing it
                      if (
                        newValue.isBefore(startTime.add(duration || 0, "hour"))
                      ) {
                        setEndTime(newValue);
                      } else {
                        alert(
                          "End time cannot exceed selected deployment duration."
                        );
                      }
                    }
                  }}
                  ampm={false}
                />
              </LocalizationProvider>
              <div className="mt-6 w-full flex justify-between space-x-4">
                <button
                  onClick={() => setActiveClock(null)}
                  className="w-1/2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Set Time
                </button>
                <button
                  onClick={() => setActiveClock(null)}
                  className="w-1/2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/*  starting date */}
        <div className="relative  top-[-40px] left-[0px] ">
          <label className="block mb-2 text-sm font-medium">
            Select start Date
          </label>
          <button
            type="button"
            onClick={() => {
              setShowCalendar(true);
              setActiveDate("start");
              setActiveClock(null);
            }}
            className="w-[250px] px-4 py-2 bg-white text-black   border rounded hover:bg-blue-100"
          >
            {selectedDate.format("DD-MM-YYYY")}
          </button>
        </div>
        {/* ending date */}
        <div className="relative  top-[-110px] left-[289px]">
          <label className="block mb-2 text-sm font-medium">
            Select End Date
          </label>
          <button
            type="button"
            onClick={() => {
              setShowCalendar(true);
              setActiveDate("end");
              setActiveClock(null);
            }}
            className="w-[250px] px-4 py-2 bg-white text-black border rounded hover:bg-blue-100"
          >
            {EndDate.format("DD-MM-YYYY")}
          </button>
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <>
            <div
              className="fixed inset-0  bg-opacity-30 backdrop-blur-sm z-30"
              onClick={() => setShowCalendar(false)}
            />
            <div className="fixed top-1/2 left-1/2 z-40 w-80 p-6 bg-white rounded-xl shadow-xl border border-gray-300 transform -translate-x-1/2 -translate-y-1/2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={activeDate === "start" ? selectedDate : EndDate}
                  onChange={(newDate) => {
                    if (activeDate === "start") {
                      setSelectedDate(newDate);
                    } else if (activeDate === "end") {
                      setEndDate(newDate);
                    }
                    setShowCalendar(false); // Optional: closes calendar after selection
                  }}
                />
              </LocalizationProvider>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
        <div className="relative  top-[-70px] left-[0px]">
          <label className="block mb-2 text-sm font-medium">
            Select Use Type
          </label>
          <select className="w-full  border p-2 rounded">
            <option hidden>Use Type</option>
            <option value="4">Personal Use</option>
            <option value="8">Buisness Purpose</option>
          </select>
        </div>
        <div className="relative  top-[-50px] left-[0px]">
          <label className="block mb-2 text-sm font-medium">
            Select Vehicle
          </label>
          <select className="w-full border p-2 rounded">
            <option hidden>Select Vehicle</option>
            <option value="TATA ACE">TATA ACE</option>
            <option value="Pickup 9ft">Pickup 9ft</option>
            <option value="407-10feet">407-10feet</option>
            <option value="14 feet canter">14 feet canter</option>
            <option value="17-Feet canter">17-Feet canter</option>
            <option value="20-Feet canter">20-Feet canter</option>
            <option value="24-Feet canter">24-Feet canter</option>
          </select>
        </div>

        <div className="p-4">
          {/* Toggle Switch */}
          <FormControlLabel
            sx={{ display: "block" }}
            control={
              <Switch
                checked={loading}
                onChange={() => setLoading(!loading)}
                name="loading"
                color="primary"
              />
            }
            label="Include Loading Charges"
          />

          {/* Show message when switch is on */}
          {loading && (
            <p className="text-sm text-red-600 mb-4">
              *Charges will be applicable
            </p>
          )}

          <FormControlLabel
            sx={{ display: "block" }}
            control={
              <Switch
                checked={unloading}
                onChange={() => setUnloading(!unloading)}
                name="unloading"
                color="primary"
              />
            }
            label="Include UnLoading Charges"
          />

          {/* Show message when switch is on */}
          {unloading && (
            <p className="text-sm text-red-600 mb-4">
              *Charges will be applicable
            </p>
          )}

          {/* Buttons */}
        </div>
        {/* summary */}
        {
          <>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v12a2 2 0 01-2 2z" />
                </svg>
                Summary of Charges
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{duration} hrs</span>
                </div>

                <div className="flex justify-between">
                  <span>Base Charge:</span>
                  <span className="font-semibold">₹{baseCharge}</span>
                </div>

                {
                  <div className="flex justify-between">
                    <span>Loading Charges:</span>
                    <span className="font-semibold">₹{loadingCharge}</span>
                  </div>
                }

                {
                  <div className="flex justify-between">
                    <span>Unloading Charges:</span>
                    <span className="font-semibold">₹{unloadingCharge}</span>
                  </div>
                }
              </div>
            </div>

            {/* Price Calculation */}
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 text-green-800">
                Price Calculation
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>GST @ {charges.gstPercentage}%:</span>
                  <span className="font-semibold">₹{gstAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-green-300 text-green-800">
                  <span>Total Payable (incl. GST):</span>
                  <span>₹{(totalCharges - couponDiscount).toFixed(2)}</span>
                </div>
                
                {couponApplied && (
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>Coupon Applied:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                
                <button 
                  type="button"
                  onClick={() => setShowCouponField(!showCouponField)}
                  className="w-full mt-3 text-blue-600 text-sm bg-blue-50 hover:bg-blue-100 py-1 px-3 rounded flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  {showCouponField ? 'Hide Coupon Field' : 'Have a Coupon Code?'}
                </button>
                
                {/* Inline coupon input field */}
                {showCouponField && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => {
                        if (couponCode.trim() !== "") {
                          setCouponApplied(true);
                          setCouponDiscount(10);
                          setShowCouponField(false);
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      type="button"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        }

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleClickOrder}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            type="button"
          >
            Submit Order
          </button>
          <button
            onClick={resetForm}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
            type="button"
          >
            Reset
          </button>
        </div>
        
        {/* No coupon modal - using inline field instead */}
      </form>
    </div>
  );
};

export default RentCarrier;
