import React, { useState } from "react";
import Wallethistory from "./Wallethistory";
import ManualRequestBalance from "./ManualRequestBalance";
import { FiArrowLeft } from "react-icons/fi";
import {
  useGetMeQuery,
  useGetWalletTransactionsByUserQuery,
} from "../../../lib/api/apiSlice";

const Wallet = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [showManualRecharge, setShowManualRecharge] = useState(false);
  const { data: profile, isLoading } = useGetMeQuery();
  const walletBalance = profile?.wallet_balance || 0;
  const userId = profile?.id || profile?.customer_id;
  const { data: transactions, isLoading: txLoading } =
    useGetWalletTransactionsByUserQuery(userId, { skip: !userId });
  const recentTx = transactions?.slice(0, 2) || [];
  const [showPopup, setShowPopup] = useState(false);
  const [code, setCode] = useState("");

  const handleSubmit = () => {
    alert(`Gift Code Submitted: ${code}`);
    setShowPopup(false);
    setCode("");
  };
  const resetToMainView = () => {
    setShowHistory(false);
    setShowManualRecharge(false);
  };

  return (
    <div className="p-6">
      {showHistory ? (
        <>
          <Wallethistory />
          <div className="absolute top-22 left-70">
            <button
              onClick={resetToMainView}
              className="flex bg-yellow-500 px-6 py-2 text-white rounded"
            >
              <FiArrowLeft className="mt-1 mr-1" />
              Back
            </button>
          </div>
        </>
      ) : showManualRecharge ? (
        <>
          <div className="absolute top-22 left-70">
            <button
              onClick={resetToMainView}
              className="flex bg-yellow-500 px-6 py-2 text-white rounded"
            >
              <FiArrowLeft className="mt-1 mr-1" />
              Back
            </button>
          </div>
          <ManualRequestBalance />
        </>
      ) : (
        <>
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl text-center font-semibold">Wallet</h1>
            <p className="mt-8 text-center text-lg">
              Manage your digital transactions for delivery orders with
              Flotza's Wallet.
              <br />
              Payments are automatically deducted from your balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 text-center gap-6">
            <div className="mt-16 mx-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
              <p className="text-2xl mb-5 text-green-500 font-semibold">
                Wallet Balance: ₹{isLoading ? "..." : walletBalance}
              </p>
              <input
                className="w-full mb-5 rounded px-4 py-2 border"
                type="number"
                placeholder="Enter Amount"
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  className="flex-1 bg-green-500 px-6 py-3 rounded text-white font-medium hover:bg-green-600 transition"
                  onClick={() => alert("Recharge button will be start soon!")}
                >
                  Recharge
                </button>
                <button
                  className="flex-1 bg-blue-500 px-6 py-3 rounded text-white font-medium hover:bg-blue-600 transition"
                  onClick={() => setShowManualRecharge(true)}
                >
                  Recharge Manually
                </button>
              </div>
            <div className="py-1">
      {/* Button */}
      <button
        onClick={() => setShowPopup(true)}
        className="text-orange-500 font-medium underline hover:text-orange-600 transition-colors"
      >
        Redeem Gift Code
      </button>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-90 z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6"
          >
            <div className="bg-white rounded-lg p-6">
              {/* Heading */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Redeem Gift Code
              </h2>``

              {/* Input */}
              <input
                type="text"
                placeholder="Enter gift code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
            </div>

            <div className="mt-16 mx-auto w-full max-w-md p-6 bg-white rounded-lg shadow-md">
              <p className="text-2xl mb-5 text-red-500 font-semibold">
                Recent Transactions
              </p>
              {txLoading ? (
                <p>Loading...</p>
              ) : recentTx.length > 0 ? (
                recentTx.map((tx, idx) => (
                  <p key={idx}>
                    {tx.credit_debit} - ₹{tx.amount}
                  </p>
                ))
              ) : (
                <p>No recent transactions</p>
              )}

              <button
                onClick={() => setShowHistory(true)}
                className="mt-5 w-full bg-sky-500 px-6 py-3 rounded text-white font-medium hover:bg-sky-600 transition"
              >
                Wallet History
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Wallet;
