import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const ReferralReport = ({ onClose }) => {
  // Mock data for the report
  const [reportData] = useState({
    driverReferralDistributed: 10000,
    customerReferralDistributed: 7500,
    transactions: [
      {
        id: 1,
        type: 'Driver',
        hostReferenceCode: 'kuytfhvhbhyu',
        hostId: 'KBD1',
        hostName: 'Irfan Shaikh',
        benefitedUser: 'KBD15',
        benefitAmount: 300,
        dateTime: '06-05-2025 16:13'
      },
      {
        id: 2,
        type: 'Customer',
        hostReferenceCode: 'jhgvblhjjllio',
        hostId: 'KBU1',
        hostName: 'Pratik Fodkar',
        benefitedUser: 'KBD25',
        benefitAmount: 1000,
        dateTime: '05-05-2025 16:15'
      },
      // Add more mock data as needed
    ]
  });

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onClose}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FiArrowLeft className="mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Referral Distribution Report
        </h1>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-2 border-blue-500 rounded-lg shadow p-6 text-center">
          <h2 className="text-blue-600 text-lg font-medium mb-2">Driver Referral Distributed</h2>
          <p className="text-2xl font-bold">{formatCurrency(reportData.driverReferralDistributed)}</p>
        </div>
        <div className="bg-white border-2 border-blue-500 rounded-lg shadow p-6 text-center">
          <h2 className="text-blue-600 text-lg font-medium mb-2">Customer Referral Distributed</h2>
          <p className="text-2xl font-bold">{formatCurrency(reportData.customerReferralDistributed)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Host Reference Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Host ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Host Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Benefitted for User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Benefit Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date and Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'Driver' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.hostReferenceCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.hostId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.hostName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.benefitedUser}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{transaction.benefitAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Flotza Logistics - Referral Management Report
      </div>
    </div>
  );
};

export default ReferralReport;
