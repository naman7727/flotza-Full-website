import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SetODLimit = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [newODLimit, setNewODLimit] = useState('0');

  // ✅ Toast helper
  const showToast = (message, type = 'success') => {
    const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className = `${bg} text-white px-4 py-2 rounded fixed top-5 right-5 z-50 shadow-lg animate-bounce`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // ✅ Fetch OD Limit data
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/od-limit-manager/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const formatted = data.data.map((c) => ({
          id: c.customer_id || '',
          name: c.customer_name || '',
          odLimit: Number(c.od_limit || 0),
          wallet_balance: Number(c.user_wallet_balance || 0),
          accessTime: c.access_given_time
            ? new Date(c.access_given_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : '',
          lastUpdated: c.updated_at
            ? new Date(c.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            : '',
        }));

        setCustomers(formatted);
        setFilteredCustomers(formatted);
      } catch (error) {
        console.error('Failed to fetch OD limit:', error.message);
        setCustomers([]);
        setFilteredCustomers([]);
        showToast('Error fetching customer data', 'error');
      }
    })();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);
    if (value.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.id.toLowerCase().includes(value.toLowerCase()) ||
          customer.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleEditClick = (customerId, currentODLimit) => {
    setEditCustomerId(customerId);
    setNewODLimit(currentODLimit.toString());
  };

  const handleSaveODLimit = async (customerId) => {
    if (isNaN(newODLimit)) {
      alert('Please enter a valid OD limit');
      return;
    }

    const confirm = window.confirm('Are you sure you want to set the OD limit for this customer?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/od-limit-manager/${customerId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ od_limit: Number(newODLimit) }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const updatedCustomers = customers.map((customer) =>
        customer.id === customerId
          ? {
            ...customer,
            odLimit: Number(newODLimit),
            lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          }
          : customer
      );

      setCustomers(updatedCustomers);
      setFilteredCustomers(
        updatedCustomers.filter(
          (customer) =>
            customer.id.toLowerCase().includes(filterValue.toLowerCase()) ||
            customer.name.toLowerCase().includes(filterValue.toLowerCase())
        )
      );

      showToast('OD limit successfully updated!');
      setEditCustomerId(null);
      setNewODLimit('0');
    } catch (error) {
      console.error('Failed to update OD limit:', error.message);
      showToast('Failed to update OD limit.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditCustomerId(null);
    setNewODLimit('0');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <header className="bg-blue-600 text-white p-4 text-center text-xl sm:text-2xl font-semibold mb-6 rounded-md flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-red-600 text-white px-2 py-1 rounded-md font-semibold hover:bg-red-700 text-sm"
        >
          <span className="text-lg">&#8592;</span> Back
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold">Set OD Limit - KartBuddy</h2>
        </div>
      </header>
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Search Customers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={filterValue}
                onChange={handleFilterChange}
                placeholder="Enter Customer ID or Name"
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setFilterValue('')}
                className="bg-gray-400 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-500 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-max w-full border-collapse border border-gray-300 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Customer ID</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Customer Name</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">OD Limit</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Wallet Balance</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Action</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Access Given Time</th>
                <th className="border border-gray-300 p-2 sm:p-3 text-left">Last Updated Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 sm:p-3">{customer.id}</td>
                  <td className="border border-gray-300 p-2 sm:p-3">{customer.name}</td>
                  <td className="border border-gray-300 p-2 sm:p-3">
                    {editCustomerId === customer.id ? (
                      <input
                        type="number"
                        value={newODLimit}
                        onChange={(e) => setNewODLimit(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter OD Limit"
                      />
                    ) : (
                      customer.odLimit
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 sm:p-3">
                    {customer.wallet_balance?.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-2 sm:p-3">
                    {editCustomerId === customer.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveODLimit(customer.id)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 sm:px-3 rounded text-xs sm:text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 sm:px-3 rounded text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(customer.id, customer.odLimit)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 sm:px-3 rounded text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 sm:p-3">{customer.accessTime}</td>
                  <td className="border border-gray-300 p-2 sm:p-3">{customer.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SetODLimit;
