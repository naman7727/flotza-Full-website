import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import BookPartLoad from "./BookPartLoad";
import RentCarrier from "./RentCarrier";
import walletIcon from '../../../assets/wallet-svgrepo-com.svg';
import { useGetMeQuery } from "../../../lib/api/apiSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, isLoading } = useGetMeQuery();
  const walletBalance = profile?.wallet_balance || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-6 flex items-start justify-center">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl p-8 relative">
        <div className="absolute top-9 right-6 flex items-center z-10">
          <img src={walletIcon} alt="Wallet" className="mr-2" width={22} height={22} />
          <span className="text-lg font-bold text-blue-700">₹{isLoading ? '...' : walletBalance}</span>
        </div>
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center justify-center">
            <span role="img" aria-label="package" className="mr-2">📦</span> Place Your Order
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              location.pathname.endsWith("/partload") ? "bg-blue-700" : "bg-blue-600"
            } hover:bg-blue-700`}
            onClick={() => navigate("partload")}
          >
            Book Partload
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white ${
              location.pathname.endsWith("/rent") ? "bg-blue-700" : "bg-blue-600"
            } hover:bg-blue-700`}
            onClick={() => navigate("rent")}
          >
            Rent a Carrier
          </button>
        </div>

        {/* Nested Routing */}
        <Routes>
          <Route path="partload" element={<BookPartLoad onBack={() => navigate("..")}/>} />
          <Route path="rent" element={<RentCarrier onBack={() => navigate("..")}/>} />
          {/* Optionally, add an index route or redirect */}
        </Routes>
      </div>
    </div>
  );
};

export default PlaceOrder;
