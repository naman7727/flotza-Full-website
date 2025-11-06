import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiClock, FiDollarSign, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { HiMenu, HiX } from 'react-icons/hi';

const Sidebar = ({ driverData, onStatusToggle, selectedService, setSelectedService, sidebarOpen, setSidebarOpen }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const serviceOptions = [
    'Intra SDD',
    'Intra NDD',
    'Intra FTL',
    'Intra Rental',
    'Intra PTL',
    'Intra Bidding'
  ];

  const handleStatusToggle = async () => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = driverData?.status === 'Active' ? 'Inactive' : 'Active';
      await onStatusToggle(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isDashboard = location.pathname === '/driver-dashboard' || location.pathname === '/driver-dashboard/';
  const isDeliveryHistory = location.pathname.includes('/driver-dashboard/delivery-history');
  const isOutstanding = location.pathname.includes('/driver-dashboard/outstanding');

  const isActive = driverData?.status === 'Active';

  return (
    <>
      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-primary-color text-text-color shadow-lg z-50
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
          lg:translate-x-0 lg:static lg:w-64
        `}
      >
        <div className="p-2 border-b border-grey-900 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Flotza</h2>
            <p className="text-sm text-blue-200">Driver Portal</p>
          </div>
          {/* Cross (X) icon for mobile close */}
          <button
            className="text-xl bg-blue-600 hover:bg-blue-700 rounded p-1 transition duration-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <HiX />
          </button>
        </div>

        {/* Status Toggle Section */}
        <div className="p-4 border-b border-grey-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Service Type Dropdown */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Service Type
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              disabled={isActive}   // disable dropdown when we click active button
              className={`w-full px-3 py-2 border rounded-lg text-white text-sm focus:outline-none transition-colors
      ${isActive
                  ? "bg-gray-600 border-gray-500 cursor-not-allowed text-gray-400"
                  : "bg-gray-700 border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
            >
              {serviceOptions.map((service) => (
                <option key={service} value={service} className="bg-gray-700 text-white">
                  {service}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStatusToggle}
            disabled={isUpdatingStatus}
            className={`w-full flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${isActive
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
              } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdatingStatus ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                {isActive ? <FiToggleLeft className="mr-2" /> : <FiToggleRight className="mr-2" />}
                {isActive ? 'Go Inactive' : 'Go Active'}
              </>
            )}
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {isActive
              ? 'You are currently available for deliveries'
              : 'You are currently unavailable for deliveries'
            }
          </p>
        </div>

        <nav className="mt-4 flex flex-col h-[calc(100%-200px)]">
          <div
            className={`flex items-center px-4 py-3 cursor-pointer ${isDashboard ? 'bg-secondary-color' : 'hover:bg-secondary-hover-color'}`}
            onClick={() => {
              navigate('/driver-dashboard');
              setSidebarOpen(false);
            }}
          >
            <FiHome className="mr-3" />
            <span>Dashboard</span>
          </div>
          <div
            className={`flex items-center px-4 py-3 cursor-pointer ${isDeliveryHistory ? 'bg-secondary-color' : 'hover:bg-secondary-hover-color'}`}
            onClick={() => {
              navigate('/driver-dashboard/delivery-history');
              setSidebarOpen(false);
            }}
          >
            <FiClock className="mr-3" />
            <span>Delivery History</span>
          </div>
          <div
            className={`flex items-center px-4 py-3 cursor-pointer ${isOutstanding ? 'bg-secondary-color' : 'hover:bg-secondary-hover-color'} text-gray-300`}
            onClick={() => {
              navigate('/driver-dashboard/outstanding');
              setSidebarOpen(false);
            }}
          >
            <FiDollarSign className="mr-3" />
            <span>Outstandings</span>
          </div>
          <div className="flex-grow" />
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;