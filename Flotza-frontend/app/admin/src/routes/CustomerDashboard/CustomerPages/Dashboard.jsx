import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery, useGetOrdersByCustomerIdQuery } from '../../../lib/api/apiSlice';

const Dashboard = ({ setRenderPage }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading: isLoadingProfile } = useGetMeQuery();
  const customerId = profile?.customer_id;

  // Fetch orders for this customer
  const { data: orders = [], isLoading: isLoadingOrders } = useGetOrdersByCustomerIdQuery(customerId, {
    skip: !customerId,
  });

  const walletBalance = profile?.wallet_balance
    ? `₹${parseFloat(profile.wallet_balance).toFixed(2)}`
    : '₹0.00';

  // Show only last 3 orders in dashboard
  const recentOrders = [...orders].slice(0, 3);

  const isLoading = isLoadingProfile || isLoadingOrders;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Welcome to Your Customer Dashboard!</h1>
      <p className="text-gray-600 mb-8">Manage your orders, wallet, and account with ease.</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="text-lg font-semibold text-gray-700 mb-2">Wallet Balance</div>
          <div className="text-2xl font-bold text-green-600">{walletBalance}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="text-lg font-semibold text-gray-700 mb-2">Total Orders</div>
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
          <div className="text-lg font-semibold text-gray-700 mb-2">Support Tickets</div>
          <div className="text-2xl font-bold text-yellow-600">0</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <button
          onClick={() => setRenderPage("place_order")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow p-6 flex flex-col items-center transition-colors"
        >
          <span className="text-3xl mb-2">➕</span>
          <span className="font-semibold">Place Order</span>
        </button>
        <button
          onClick={() => setRenderPage("order_history")}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow p-6 flex flex-col items-center transition-colors"
        >
          <span className="text-3xl mb-2">📦</span>
          <span className="font-semibold">Order History</span>
        </button>
        <button
          onClick={() => setRenderPage("tracking_status")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow p-6 flex flex-col items-center transition-colors"
        >
          <span className="text-3xl mb-2">📍</span>
          <span className="font-semibold">Track Order</span>
        </button>
        <button
          onClick={() => setRenderPage("support")}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl shadow p-6 flex flex-col items-center transition-colors"
        >
          <span className="text-3xl mb-2">💬</span>
          <span className="font-semibold">Support</span>
        </button>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-blue-700 mb-4">Recent Orders</h2>

        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-gray-500 text-sm">No recent orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700">Order ID</th>
                  <th className="px-4 py-2 text-left text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-b-0 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => navigate(`/customer-dashboard/order/${order.order_id}`)}
                  >
                    <td className="px-4 py-2">{order.order_id}</td>
                    <td className="px-4 py-2">{order.order_status}</td>
                    <td className="px-4 py-2">
                      {new Date(order.order_creation_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-2">₹{parseFloat(order.final_payable || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;