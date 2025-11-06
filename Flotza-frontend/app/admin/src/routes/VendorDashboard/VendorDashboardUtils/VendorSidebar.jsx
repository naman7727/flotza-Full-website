import React from 'react';
import {
  FiHome,
  FiBox,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { HiMenu, HiX } from "react-icons/hi";

const VendorSidebar = ({
  activeTab,
  setActiveTab,
  handleLogout,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'drivers', label: 'My Drivers', icon: <FiBox /> },
    { id: 'vehicles', label: 'My Vehicles', icon: <FiDollarSign /> },
    { id: 'reports', label: 'Reports', icon: <FiBarChart2 /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <>
      {/* Hamburger Icon for mobile */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 bg-yellow-500 text-white p-2 rounded shadow-lg lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <HiMenu className="text-2xl" />
        </button>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#1f2937] text-white shadow-lg z-50
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64
          lg:translate-x-0 lg:static lg:w-64
        `}
      >
        <div className="p-4 mt-4 border-b border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-400">Vendor Portal</p>
          {/* Cross (X) icon for mobile close */}
          <button
            className="text-xl bg-yellow-500 hover:bg-yellow-600 rounded p-1 transition duration-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <HiX />
          </button>
        </div>

        <ul className="mt-6">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center ps-5 my-2 mx-4 py-2 rounded transition duration-300 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'hover:bg-yellow-600 hover:scale-105'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="text-lg me-3">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </li>
          ))}
        </ul>

        <div
          className="flex items-center ps-5 my-2 mx-4 py-2 rounded text-red-300 hover:bg-red-400 transition duration-300 cursor-pointer mt-auto"
          onClick={handleLogout}
        >
          <FiLogOut className="text-lg me-3" />
          <span className="text-sm font-medium">Logout</span>
        </div>
      </aside>
    </>
  );
};

export default VendorSidebar;
