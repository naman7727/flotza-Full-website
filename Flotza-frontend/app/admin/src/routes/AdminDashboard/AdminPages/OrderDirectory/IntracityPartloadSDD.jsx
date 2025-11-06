import React, { useState } from 'react';
import { useGetAllOrdersQuery } from '../../../../lib/api/apiSlice';

const IntracityPartloadSDD = () => {
  const [checkedOrders, setCheckedOrders] = useState([]);
  const [filters, setFilters] = useState({
    orderId: '',
    status: 'All Status',
    userId: '',
    startDate: '',
    endDate: ''
  });

  // Fetch orders using RTK Query
  const { data: ordersData = [], isLoading, error } = useGetAllOrdersQuery();

  const handleCheckboxChange = (orderId) => {
    setCheckedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const isChecked = (orderId) => checkedOrders.includes(orderId);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      orderId: '',
      status: 'All Status',
      userId: '',
      startDate: '',
      endDate: ''
    });
  };

  // Helper function to safely parse JSON data
  const parseJSON = (jsonString) => {
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (e) {
      return null;
    }
  };

  // Helper function to extract shipper info from customer_snapshot
  const getShipperInfo = (customerSnapshot) => {
    const snapshot = parseJSON(customerSnapshot);
    return {
      name: snapshot?.name || snapshot?.shipper_name || 'N/A',
      phone: snapshot?.phone || snapshot?.shipper_phone || 'N/A'
    };
  };

  // Helper function to extract consignee info from drop_snapshot
  const getConsigneeInfo = (dropSnapshot) => {
    const snapshot = parseJSON(dropSnapshot);
    return {
      name: snapshot?.consignee_name || snapshot?.name || 'N/A',
      phone: snapshot?.consignee_phone || snapshot?.phone || 'N/A'
    };
  };

  // Helper function to get commodity info
  const getCommodityInfo = (commodity) => {
    const commodityData = parseJSON(commodity);
    return commodityData?.commodity_type || commodityData?.name || 'N/A';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Filter orders based on current filters
  const filteredOrders = ordersData.filter(order => {
    const matchesOrderId = !filters.orderId || order.order_id?.toLowerCase().includes(filters.orderId.toLowerCase());
    const matchesStatus = filters.status === 'All Status' || order.order_status === filters.status;
    const matchesUserId = !filters.userId || order.customer_id?.toLowerCase().includes(filters.userId.toLowerCase());

    // Date filtering (basic implementation)
    let matchesDateRange = true;
    if (filters.startDate && order.order_creation_date) {
      const orderDate = new Date(order.order_creation_date);
      const startDate = new Date(filters.startDate);
      matchesDateRange = orderDate >= startDate;
    }
    if (filters.endDate && order.order_creation_date && matchesDateRange) {
      const orderDate = new Date(order.order_creation_date);
      const endDate = new Date(filters.endDate);
      matchesDateRange = orderDate <= endDate;
    }

    return matchesOrderId && matchesStatus && matchesUserId && matchesDateRange;
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error loading orders: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-h-screen flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Order Directory - Intracity Partload SDD</h2>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 flex-shrink-0">
        <input
          type="text"
          placeholder="Order ID"
          className="border rounded px-2 py-1 w-full md:w-auto"
          value={filters.orderId}
          onChange={(e) => handleFilterChange('orderId', e.target.value)}
        />
        <select
          className="border rounded px-2 py-1 w-full md:w-auto"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option>All Status</option>
          <option>pending</option>
          <option>confirmed</option>
          <option>picked</option>
          <option>in_transit</option>
          <option>delivered</option>
          <option>cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Customer ID"
          className="border rounded px-2 py-1 w-full md:w-auto"
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full md:w-auto"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1 w-full md:w-auto"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Apply Filter
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap mb-4 flex-shrink-0">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Download CSV</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Actions</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Change Hub</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Mark Cancelled</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Mark Delivered</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Mark Rescheduled</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Reject Order</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Retrieve Order</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Change Trip</button>
      </div>

      {/* Orders Count */}
      <div className="mb-4 text-sm text-gray-600 flex-shrink-0">
        Total Orders: {filteredOrders.length}
      </div>

      {/* Scrollable Table Container */}
      <div
        className="border rounded-lg overflow-auto flex-shrink-0"
        style={{
          maxHeight: `${Math.min(400, 60 + (filteredOrders.length * 40))}px`,
          minHeight: '200px'
        }}
      >
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-gray-800 text-white sticky top-0">
            <tr>
              {[
                "Select Order", "Order ID", "Order Mode", "Trip ID", "Customer ID", "User Account", "Shipper", "Shipper ID",
                "Consignee", "Consignee ID", "Commodity", "Total Units", "Gross Weight", "Chargeable Weight",
                "Total CBM", "Payable Amount", "Payment Status", "Order Status", "Current Hub", "Created Date",
                "Scheduled Date",
              ].map((heading, index) => (
                <th key={index} className="px-3 py-2 border-r border-gray-600 text-left whitespace-nowrap">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="21" className="text-center py-8 text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => {
                const shipperInfo = getShipperInfo(order.customer_snapshot);
                const consigneeInfo = getConsigneeInfo(order.drop_snapshot);
                const commodity = getCommodityInfo(order.commodity);

                return (
                  <tr key={order.id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked(order.order_id)}
                        onChange={() => handleCheckboxChange(order.order_id)}
                      />
                    </td>
                    <td className="border px-2 py-1 text-blue-600 underline whitespace-nowrap">
                      {order.order_id}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.price_module_type || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 text-blue-600 underline whitespace-nowrap">
                      {order.trip_id || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.customer_id || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.customer_snapshot?.full_name}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.pickup_snapshot?.contact_person || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.pickup_place_id}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.drop_snapshot?.contact_person || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.drop_place_id || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.commodity?.join(', ') || commodity}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {order.total_units || 0}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.total_gross_weight ? `${order.total_gross_weight} kg` : 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.chargeable_weight ? `${order.chargeable_weight} kg` : 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.total_volume ? `${order.total_volume} CBM` : 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.final_payable ? `₹${order.final_payable}` : 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${order.final_payable > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {order.final_payable > 0 ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.order_status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                              order.order_status === 'picked' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {order.order_status || 'pending'}
                      </span>
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.current_hub || order.hub || 'N/A'}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {formatDate(order.order_creation_date)}
                    </td>
                    <td className="border px-2 py-1 whitespace-nowrap">
                      {order.schedule_date ? new Date(order.schedule_date).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Orders Info */}
      {checkedOrders.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <span className="text-blue-800 font-medium">
            {checkedOrders.length} order(s) selected
          </span>
        </div>
      )}
    </div>
  );
};

export default IntracityPartloadSDD;