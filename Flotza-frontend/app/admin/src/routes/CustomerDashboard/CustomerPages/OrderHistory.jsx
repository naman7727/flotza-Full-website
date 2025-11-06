import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { useGetMeQuery, useGetOrdersByCustomerIdQuery } from '../../../lib/api/apiSlice' 

const OrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const { data: profile, isLoading: isLoadingProfile } = useGetMeQuery();
  const customerId = profile?.customer_id;
  console.log('Customer ID:', customerId)
  

  // Fetch orders for the logged-in customer
  const {
    data: ordersData = [],
    isLoading: isLoadingOrders,
    isError,
    error,
  } = useGetOrdersByCustomerIdQuery(customerId, {
    skip: !customerId, // Skip fetching if customerId is not available yet
  })

  const handleSearch = () => {
    setSearchTerm(inputValue)
  }

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00'
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600'
      case 'in transit':
      case 'pending':
      case 'processing':
        return 'text-orange-500'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Filter orders based on the search term
  const filteredOrders = ordersData.filter((order) => {
    const search = searchTerm.toLowerCase()
    return (
      order.order_id.toLowerCase().includes(search) ||
      (order.pickup_snapshot?.contact_person || '').toLowerCase().includes(search) ||
      (order.drop_snapshot?.contact_person || '').toLowerCase().includes(search) ||
      (order.commodity?.join(', ') || '').toLowerCase().includes(search)
    )
  })

  const isLoading = isLoadingProfile || isLoadingOrders;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Order History</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by Order ID, Shipper, Consignee..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600"
          >
            <FaSearch size={18} />
          </button>
        </div>
        <select className="w-full md:w-60 p-2 border border-gray-300 rounded-lg shadow-sm">
          <option>Sort by Date: Newest First</option>
          <option>Sort by Date: Oldest First</option>
        </select>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full table-auto bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-blue-600 text-white text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Shipper</th>
              <th className="px-4 py-3 text-left">Consignee</th>
              <th className="px-4 py-3 text-left">Commodity</th>
              <th className="px-4 py-3 text-left">Total Paid</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500 text-sm">
                  Loading your orders...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-red-500 text-sm">
                  Error fetching orders: {error?.data?.message || 'Please try again later.'}
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{order.order_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(order.order_creation_date)}</td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap text-sm ${getStatusColor(order.order_status)}`}>
                    {order.order_status?.toUpperCase() || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{order.pickup_snapshot?.contact_person || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{order.drop_snapshot?.contact_person || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">{order.commodity?.join(', ') || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{formatCurrency(order.final_payable)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded">
                      View More
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-gray-500 text-sm">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderHistory
