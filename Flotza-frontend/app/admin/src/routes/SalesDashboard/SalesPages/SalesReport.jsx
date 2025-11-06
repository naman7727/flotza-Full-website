import { useState } from 'react';
import { 
  FaChartBar, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaArrowUp, 
  FaArrowDown, 
  FaShoppingCart, 
  FaEye, 
  FaDownload, 
  FaFilter, 
  FaChartPie,   
  FaUserFriends,
  } from 'react-icons/fa';

const SalesReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewType, setViewType] = useState('overview');

  // Sample data - replace with actual data from your API
  const salesData = {
    totalRevenue: 125000,
    totalOrders: 342,
    avgOrderValue: 365,
    conversionRate: 3.2,
    newCustomers: 89,
    returningCustomers: 253,
    monthlyGrowth: 12.5,
    quarterlyGrowth: 28.3
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const isPositive = change > 0;
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <FaArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <FaArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
            {Icon && <Icon className="h-6 w-6 text-white" />}
          </div>
        </div>
      </div>
    );
  };

  const ChartPlaceholder = ({ title, type = 'bar' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaEye className="h-4 w-4 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaDownload className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="h-64 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          {type === 'bar' ? (
            <FaChartBar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          ) : (
            <FaChartPie className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-gray-600">Chart: {title}</p>
          <p className="text-sm text-gray-500 mt-1">Interactive chart will render here</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <FaChartBar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
              Sales Report
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Comprehensive sales analytics and performance metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button className="bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center sm:justify-start">
              <FaDownload className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button className="bg-purple-600 text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center sm:justify-start">
              <FaCalendarAlt className="h-4 w-4 mr-2" />
              Schedule Report
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <FaFilter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                <option value="plans">Subscription Plans</option>
                <option value="services">Services</option>
                <option value="products">Products</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setViewType('overview')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'overview' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${salesData.totalRevenue.toLocaleString()}`}
          change={salesData.monthlyGrowth}
          icon={FaDollarSign}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={salesData.totalOrders.toLocaleString()}
          change={8.2}
          icon={FaShoppingCart}
          color="green"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${salesData.avgOrderValue}`}
          change={5.1}
          icon={FaArrowUp}
          color="purple"
        />
        <StatCard
          title="Conversion Rate"
          value={`${salesData.conversionRate}%`}
          change={-1.2}
          icon={FaUserFriends}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ChartPlaceholder title="Revenue Trends" type="bar" />
        <ChartPlaceholder title="Sales by Category" type="pie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2">
          <ChartPlaceholder title="Monthly Performance" type="bar" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-semibold text-green-600">{salesData.newCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <span className="font-semibold text-blue-600">{salesData.returningCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Retention</span>
              <span className="font-semibold text-purple-600">74.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Lifetime Value</span>
              <span className="font-semibold text-orange-600">$1,240</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Quarterly Growth</p>
              <p className="text-2xl font-bold">+{salesData.quarterlyGrowth}%</p>
            </div>
            <FaArrowUp className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Goal Achievement</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
            <FaChartBar className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Market Share</p>
              <p className="text-2xl font-bold">12.4%</p>
            </div>
            <FaChartPie className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SalesReport;