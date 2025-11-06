import React from 'react';

const StatusCard = ({ driverData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
            Welcome, {driverData?.username || "Driver"}!
          </h2>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Current Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                driverData?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium text-sm sm:text-base ${
                driverData?.status === 'Active' ? 'text-green-700' : 'text-red-700'
              }`}>
                {driverData?.status === 'Active' ? 'Approved' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-left sm:text-right">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {driverData?.status === 'Active' 
                ? 'Available for trips' 
                : 'Not available for trips'
              }
            </p>
            <div className="flex items-center justify-start sm:justify-end">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                driverData?.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-gray-600">
                {driverData?.status === 'Active' 
                  ? 'Looking for trips...' 
                  : 'No trips available - Driver is inactive'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
