import React, { useState, useEffect, useMemo } from 'react';
import { FaGift, FaPlus, FaClipboardList, FaSearch, FaFileExport, FaEdit, FaEye, FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import GiftViewLog from './GiftViewLog';

const GiftCodes = () => {
  // State management
  const [giftCodes, setGiftCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Form state for Gift Codes
  const [giftFormData, setGiftFormData] = useState({
    code: '',
    description: '',
    giftValue: '',
    totalUseLimit: '',
    perCustomerLimit: '',
    usableBy: '',
    termsAndCondition: '',
    expirationDate: '',
    isRedeemed: false,
    redeemedDate: '',
    redeemedBy: '',
    isActive: true
  });

  // Mock data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock Gift Codes
      const mockGiftCodes = [
        {
          id: 3,
          type: 'gift',
          code: 'GIFT-ABC123',
          description: 'Birthday Gift Card',
          totalUseLimit: 100,
          perCustomerLimit: 1,
          usableBy: 'Registered Users',
          giftValue: 500,
          remainingBalance: 500,
          recipientEmail: 'john@example.com',
          senderName: 'Sarah Johnson',
          personalMessage: 'Happy Birthday! Hope you find something you love!',
          expirationDate: '2024-12-31',
          isRedeemed: false,
          redeemedDate: null,
          redeemedBy: '',
          isActive: true,
          status: 'active',
          createdDate: '2024-03-15'
        },
        {
          id: 4,
          type: 'gift',
          code: 'GIFT-XYZ789',
          description: 'Holiday Gift Card',
          totalUseLimit: null,
          perCustomerLimit: 2,
          usableBy: 'VIP Members',
          giftValue: 250,
          remainingBalance: 125,
          recipientEmail: 'jane@example.com',
          senderName: 'Mike Wilson',
          personalMessage: 'Merry Christmas! Enjoy your shopping!',
          expirationDate: '2024-12-25',
          isRedeemed: true,
          redeemedDate: '2024-01-15',
          redeemedBy: 'jane@example.com',
          isActive: true,
          status: 'active',
          createdDate: '2024-12-01'
        }
      ];

      setGiftCodes(mockGiftCodes);
    } catch (error) {
      showNotification('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewDialog = (item) => {
    setViewingItem(item);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingItem(null);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setGiftFormData({ ...item });
    } else {
      setEditingItem(null);
      setGiftFormData({
        code: '',
        description: '',
        giftValue: '',
        totalUseLimit: '',
        perCustomerLimit: '',
        usableBy: '',
        termsAndCondition: '',
        expirationDate: '',
        isRedeemed: false,
        redeemedDate: '',
        redeemedBy: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  // Generate a random gift code in format GIFT-XXXXXX where X are alphanumeric characters
  const generateGiftCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = 'GIFT-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleFormChange = (field, value) => {
    setGiftFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing item
        setGiftCodes(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...giftFormData, id: editingItem.id, type: 'gift', status: getGiftStatus(giftFormData) }
            : item
        ));
        showNotification('Gift code updated successfully', 'success');
      } else {
        // Create new item
        const newItem = {
          ...giftFormData,
          // Auto-generate code if not provided
          code: giftFormData.code.trim() || generateGiftCode(),
          id: Date.now(),
          type: 'gift',
          createdDate: new Date().toISOString().split('T')[0],
          status: getGiftStatus(giftFormData)
        };
        
        newItem.remainingBalance = newItem.giftValue;
        setGiftCodes(prev => [...prev, newItem]);
        showNotification('Gift code created successfully', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      showNotification('Error saving gift code', 'error');
    }
  };

  const getGiftStatus = (giftData) => {
    if (!giftData.isActive) return 'inactive';
    if (giftData.isRedeemed && giftData.remainingBalance <= 0) return 'fully_redeemed';
    if (giftData.remainingBalance < giftData.giftValue) return 'partially_used';
    return 'active';
  };

  const handleDelete = async (item) => {
    setItemToDelete(item);
    setDeleteConfirmText('');
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
    setDeleteConfirmText('');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText === 'DeLeTe' && itemToDelete) {
      try {
        setGiftCodes(prev => prev.filter(item => item.id !== itemToDelete.id));
        showNotification('Gift code deleted successfully', 'success');
        handleCloseDeleteDialog();
      } catch (error) {
        showNotification('Error deleting gift code', 'error');
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return giftCodes.filter(item => {
      const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [giftCodes, searchTerm, filterStatus]);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'fully_redeemed': return 'bg-blue-100 text-blue-800';
      case 'partially_used': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilterOptions = () => {
    return [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'partially_used', label: 'Partially Used' },
      { value: 'fully_redeemed', label: 'Fully Redeemed' }
    ];
  };

  // Conditional rendering for GiftViewLog
  if (showLogs) return <GiftViewLog onBack={() => setShowLogs(false)} />;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
          <button 
            onClick={() => setNotification({ show: false, message: '', type: 'success' })}
            className="text-white hover:text-gray-200 text-lg font-bold"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaGift className="text-purple-600" />
          Gift Codes Management
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={() => handleOpenDialog()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaPlus />
            Create Gift Code
          </button>
          <button 
            onClick={() => setShowLogs(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaClipboardList />
            View Logs
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search gift codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">
              <FaSearch />
            </span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-40"
          >
            {getFilterOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <FaFileExport />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Value</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Use Limit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Per Customer Limit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usable By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono font-semibold text-gray-900">{item.code}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.description}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">₹{item.giftValue}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{item.totalUseLimit || 'Unlimited'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.perCustomerLimit || 'No Limit'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.usableBy || 'Anyone'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.expirationDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleOpenDialog(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleOpenViewDialog(item)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Dialog */}
      {openViewDialog && viewingItem && (
        <div className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4" style={{zIndex: 99999}}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                View Gift Code
              </h2>
              <button 
                onClick={() => setOpenViewDialog(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gift Code
                  </label>
                  <div className="font-mono font-semibold text-gray-900">{viewingItem.code}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gift Value
                  </label>
                  <div className="font-medium text-gray-900">₹{viewingItem.giftValue}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="text-gray-900">{viewingItem.description}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Use Limit
                  </label>
                  <div className="text-gray-900">{viewingItem.totalUseLimit || 'Unlimited'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per Customer Limit
                  </label>
                  <div className="text-gray-900">{viewingItem.perCustomerLimit || 'No Limit'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usable By
                  </label>
                  <div className="text-gray-900">{viewingItem.usableBy || 'Anyone'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <div className="text-gray-900">{viewingItem.expirationDate}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Condition
                  </label>
                  <div className="text-gray-900">{viewingItem.termsAndCondition}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(viewingItem.status)}`}>
                    {viewingItem.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4" style={{zIndex: 99999}}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Gift Code' : 'Create New Gift Code'}
              </h2>
              <button 
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Code *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={giftFormData.code}
                        onChange={(e) => handleFormChange('code', e.target.value)}
                        required
                        placeholder="Enter gift code manually"
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleFormChange('code', generateGiftCode())}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                        title="Generate random code"
                      >
                        Generate Code
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gift Value *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={giftFormData.giftValue}
                        onChange={(e) => handleFormChange('giftValue', e.target.value)}
                        required
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={giftFormData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Use Limit
                    </label>
                    <input
                      type="number"
                      value={giftFormData.totalUseLimit}
                      onChange={(e) => handleFormChange('totalUseLimit', e.target.value)}
                      placeholder="Leave empty for unlimited"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum number of times this gift code can be used</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Per Customer Limit
                    </label>
                    <input
                      type="number"
                      value={giftFormData.perCustomerLimit}
                      onChange={(e) => handleFormChange('perCustomerLimit', e.target.value)}
                      placeholder="Leave empty for no limit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum uses per customer</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usable By
                    </label>
                    <select
                      value={giftFormData.usableBy}
                      onChange={(e) => handleFormChange('usableBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Customer</option>
                      <option value="New Customer">New Customer</option>
                      <option value="Old Customer">Old Customer</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Who can use this gift code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={giftFormData.expirationDate}
                      onChange={(e) => handleFormChange('expirationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms and Condition
                    </label>
                    <textarea
                      value={giftFormData.termsAndCondition}
                      onChange={(e) => handleFormChange('termsAndCondition', e.target.value)}
                      rows={3}
                      placeholder="Add terms and conditions for this gift code..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={giftFormData.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!giftFormData.code || !giftFormData.giftValue}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && itemToDelete && (
        <div className="fixed inset-0 bg-transparent bg-opacity-90 flex items-center justify-center z-[99999] p-4" style={{zIndex: 99999}}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Gift Code
              </h3>
              
              <p className="text-gray-600 text-center mb-4">
                This action cannot be undone. This will permanently delete the gift code <strong>"{itemToDelete.code}"</strong>.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please type <strong className="text-red-600">DeLeTe</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  placeholder="Type DeLeTe here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={handleCloseDeleteDialog}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmText !== 'DeLeTe'}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    deleteConfirmText === 'DeLeTe'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Delete Gift Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCodes;
