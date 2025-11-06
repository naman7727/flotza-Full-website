import React from 'react';

const Dashboard = () => {
  return (
    <div className="flex-1 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back, Admin!</h1>
          <p className="text-gray-500 mt-1">
            Manage orders, track deliveries, and connect with drivers and customers.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input type="text" placeholder="Search..." className="p-2 border border-gray-300 rounded-xl" />
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          ["Total Orders", "1,245", "text-indigo-600"],
          ["Completed Deliveries", "1,098", "text-green-600"],
          ["Pending Payments", "23", "text-red-500"],
          ["Active Drivers", "12", "text-blue-500"],
        ].map(([label, value, color]) => (
          <div key={label} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-gray-600 mb-2">{label}</h3>
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      {/* Orders Table */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Customer", "Pickup", "Drop", "Driver", "Express", "Status", "Payment", "Track"].map((heading) => (
                  <th key={heading} className="px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium">#12345</td>
                <td className="px-4 py-3">John Doe</td>
                <td className="px-4 py-3">Delhi</td>
                <td className="px-4 py-3">Mumbai</td>
                <td className="px-4 py-3">Rajesh</td>
                <td className="px-4 py-3 text-yellow-500 font-semibold">Yes (20% Extra)</td>
                <td className="px-4 py-3 text-green-600 font-semibold">Completed</td>
                <td className="px-4 py-3 text-green-500 font-semibold">Done</td>
                <td className="px-4 py-3 text-indigo-600 font-semibold">
                  <a href="#">Track</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Driver Assignment */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Driver Assignment</h2>
        <div className="bg-white p-6 rounded-2xl shadow">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" placeholder="Order ID" className="p-3 border rounded-xl" />
            <select className="p-3 border rounded-xl">
              <option>Select Driver</option>
              <option>Rajesh</option>
              <option>Sunil</option>
              <option>Amit</option>
            </select>
            <select className="p-3 border rounded-xl">
              <option>Status</option>
              <option>Assigned</option>
              <option>In Transit</option>
              <option>Completed</option>
            </select>
            <select className="p-3 border rounded-xl">
              <option>Express Delivery</option>
              <option>Yes (20% Extra)</option>
              <option>No</option>
            </select>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">
              Update
            </button>
          </form>
        </div>
      </section>

      {/* Customer Requests */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Customer Requests</h2>
        <div className="bg-white p-6 rounded-2xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                {["Request ID", "Customer", "Message", "Date", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium">REQ001</td>
                <td className="px-4 py-3">Anita Sharma</td>
                <td className="px-4 py-3">Requesting early delivery slot tomorrow morning.</td>
                <td className="px-4 py-3">2025-05-15</td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">Pending</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">REQ002</td>
                <td className="px-4 py-3">Mohit Verma</td>
                <td className="px-4 py-3">Change delivery location to Noida sector 62.</td>
                <td className="px-4 py-3">2025-05-14</td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">Resolved</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;