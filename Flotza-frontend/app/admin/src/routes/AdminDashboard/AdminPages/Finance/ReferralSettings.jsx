import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiUsers, FiClock, FiCalendar, FiEdit2, FiEye, FiTrash2, FiFileText } from 'react-icons/fi';
import ReferralReport from './ReferralReport';

const ReferralSettings = () => {
  // State management
  const [activeTab, setActiveTab] = useState('customer');
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showReport, setShowReport] = useState(false);
  
  const [referralData, setReferralData] = useState({
    customer: [],
    driver: []
  });

  const [formData, setFormData] = useState({
    amount: '',
    startDate: '',
    endDate: ''
  });

  // Mock data initialization
  useEffect(() => {
    // Initialize with mock data
    setReferralData({
      customer: [
        {
          id: 1,
          profile: 'customer',
          amount: 100,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalBeneficiary: 45,
          totalDistribution: 4500,
          updateDateTime: '2024-01-15 14:30:22',
          isActive: true
        }
      ],
      driver: [
        {
          id: 2,
          profile: 'driver',
          amount: 200,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          totalBeneficiary: 32,
          totalDistribution: 6400,
          updateDateTime: '2024-01-10 11:15:45',
          isActive: true
        }
      ]
    });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenDialog = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    setFormData({
      amount: '',
      startDate: currentDate,
      endDate: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleShowReport = () => {
    setShowReport(true);
  };

  const handleCloseReport = () => {
    setShowReport(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount) {
      showNotification('Please enter a referral amount', 'error');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    // Add new record (not activated by default)
    const updatedData = { ...referralData };
    
    const newRecord = {
      id: Date.now(),
      profile: activeTab,
      amount: parseFloat(formData.amount),
      startDate: formData.startDate,
      endDate: 'new', // Set as 'new' until activated
      totalBeneficiary: 0,
      totalDistribution: 0,
      updateDateTime: `${dateStr} ${timeStr}`,
      isActive: false // Not activated by default
    };

    updatedData[activeTab] = [...updatedData[activeTab], newRecord];
    
    setReferralData(updatedData);
    setOpenDialog(false);
    showNotification(`${activeTab === 'customer' ? 'Customer' : 'Driver'} referral benefit updated successfully`);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleActivate = (itemId) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const updatedData = { ...referralData };
    
    // First, deactivate all other items in the same profile by setting end date
    updatedData[activeTab] = updatedData[activeTab].map(item => {
      if (item.id !== itemId && !item.endDate) {
        return {
          ...item,
          endDate: dateStr,
          isActive: false,
          updateDateTime: `${dateStr} ${timeStr}`
        };
      }
      return item;
    });

    // Then activate the selected item by removing end date
    updatedData[activeTab] = updatedData[activeTab].map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          endDate: formData.endDate || null, // Use the end date from form or null for ongoing
          isActive: true,
          updateDateTime: `${dateStr} ${timeStr}`
        };
      }
      return item;
    });

    setReferralData(updatedData);
    showNotification(`${activeTab === 'customer' ? 'Customer' : 'Driver'} referral benefit activated successfully`);
  };

  const handleDeactivate = (itemId) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const updatedData = { ...referralData };
    
    // Deactivate the selected item by setting end date
    updatedData[activeTab] = updatedData[activeTab].map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          endDate: dateStr,
          isActive: false,
          updateDateTime: `${dateStr} ${timeStr}`
        };
      }
      return item;
    });

    setReferralData(updatedData);
    showNotification(`${activeTab === 'customer' ? 'Customer' : 'Driver'} referral benefit deactivated successfully`);
  };

  const getStatusBadge = (endDate) => {
    if (endDate === 'new') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          New
        </span>
      );
    }
    if (!endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  // Show report view if active
  if (showReport) {
    return <ReferralReport onClose={handleCloseReport} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
          <button 
            onClick={() => setNotification({ show: false, message: '', type: 'success' })}
            className="text-white hover:text-gray-200 text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          🤝 Referral Settings
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button 
              onClick={() => handleTabChange('customer')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'customer' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customer
            </button>
            <button 
              onClick={() => handleTabChange('driver')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'driver' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Driver
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleOpenDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>+</span>
              Set {activeTab === 'customer' ? 'Customer' : 'Driver'} Benefit
            </button>
            <button 
              onClick={handleShowReport}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FiFileText className="h-5 w-5" />
              Review Report
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Profile Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Referral Amount (₹)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Beneficiaries</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Distribution (₹)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {referralData[activeTab].map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 capitalize">{item.profile}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">₹{item.amount}</td>
                  <td className="px-6 py-4 text-gray-900">{item.startDate}</td>
                  <td className="px-6 py-4 text-gray-900">{item.endDate || 'Ongoing'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.totalBeneficiary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-900">₹{item.totalDistribution.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.endDate)}
                  </td>
                  <td className="px-6 py-4">
                    {!item.endDate ? (
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(item.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.updateDateTime}</td>
                </tr>
              ))}
              {referralData[activeTab].length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No referral data available. Click "Set {activeTab === 'customer' ? 'Customer' : 'Driver'} Benefit" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Benefit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Set {activeTab === 'customer' ? 'Customer' : 'Driver'} Benefit
              </h2>
              <button 
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Amount (₹)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="0.00"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSettings;
