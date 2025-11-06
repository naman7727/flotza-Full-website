import { useState } from 'react';
import {
  FaUsers,
  FaPlus,
  FaSearch,
  FaEye,
  FaPen,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaThList,
  FaTable
} from 'react-icons/fa';

const MyLeads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table or cards
  const [showAddModal, setShowAddModal] = useState(false);

  // Sample leads data - replace with actual data from your API
  const leadsData = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234 567 8900',
      company: 'Tech Solutions Inc',
      position: 'CEO',
      status: 'hot',
      priority: 'high',
      value: 15000,
      source: 'Website',
      location: 'New York, NY',
      lastContact: '2024-06-04',
      nextFollowUp: '2024-06-06',
      notes: 'Interested in premium package',
      rating: 5
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      phone: '+1 234 567 8901',
      company: 'Marketing Pro',
      position: 'Marketing Director',
      status: 'warm',
      priority: 'medium',
      value: 8500,
      source: 'Referral',
      location: 'Los Angeles, CA',
      lastContact: '2024-06-03',
      nextFollowUp: '2024-06-07',
      notes: 'Needs more information about pricing',
      rating: 4
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@startup.io',
      phone: '+1 234 567 8902',
      company: 'Startup Innovations',
      position: 'Founder',
      status: 'cold',
      priority: 'low',
      value: 5000,
      source: 'Social Media',
      location: 'Austin, TX',
      lastContact: '2024-06-01',
      nextFollowUp: '2024-06-08',
      notes: 'Initial contact made',
      rating: 3
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@enterprise.com',
      phone: '+1 234 567 8903',
      company: 'Enterprise Solutions',
      position: 'VP Sales',
      status: 'qualified',
      priority: 'high',
      value: 25000,
      source: 'Trade Show',
      location: 'Chicago, IL',
      lastContact: '2024-06-04',
      nextFollowUp: '2024-06-05',
      notes: 'Ready to move forward with proposal',
      rating: 5
    }
  ];

  const leadStats = {
    totalLeads: leadsData.length,
    hotLeads: leadsData.filter(lead => lead.status === 'hot').length,
    warmLeads: leadsData.filter(lead => lead.status === 'warm').length,
    qualifiedLeads: leadsData.filter(lead => lead.status === 'qualified').length,
    totalValue: leadsData.reduce((sum, lead) => sum + lead.value, 0),
    avgValue: Math.round(leadsData.reduce((sum, lead) => sum + lead.value, 0) / leadsData.length),
    conversionRate: 23.5,
    monthlyGrowth: 12.3
  };

  const getStatusColor = (status) => {
    const colors = {
      hot: 'bg-red-100 text-red-800 border-red-200',
      warm: 'bg-orange-100 text-orange-800 border-orange-200',
      cold: 'bg-blue-100 text-blue-800 border-blue-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.cold;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-orange-600',
      low: 'text-green-600'
    };
    return colors[priority] || colors.low;
  };

  const filteredLeads = leadsData.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'purple', trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <FaArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <FaArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-r ${
          color === 'purple' ? 'from-purple-500 to-purple-600' :
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          'from-orange-500 to-orange-600'
        }`}>
          {Icon && <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
        </div>
      </div>
    </div>
  );

  const LeadCard = ({ lead }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {lead.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.position}</p>
            <p className="text-sm text-gray-500">{lead.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`h-4 w-4 ${i < lead.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaEnvelope className="h-4 w-4 mr-2" />
          {lead.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="h-4 w-4 mr-2" />
          {lead.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="h-4 w-4 mr-2" />
          {lead.location}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
        </span>
        <span className={`text-sm font-medium ${getPriorityColor(lead.priority)}`}>
          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Value: <span className="font-semibold text-gray-900">${lead.value.toLocaleString()}</span></span>
        <span>Source: <span className="font-medium">{lead.source}</span></span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Last: {new Date(lead.lastContact).toLocaleDateString()}</span>
        <span>Next: {new Date(lead.nextFollowUp).toLocaleDateString()}</span>
      </div>

      <div className="flex space-x-2">
        <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          Contact
        </button>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FaEye className="h-4 w-4 text-gray-600" />
        </button>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FaPen className="h-4 w-4 text-gray-600" />
        </button>
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
              <FaUsers className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3" />
              My Leads
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and track your sales leads</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white rounded-lg px-3 sm:px-4 py-2 text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center sm:justify-start"
            >
              <FaPlus className="h-4 w-4 mr-2" />
              Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Leads"
          value={leadStats.totalLeads}
          subtitle={`${leadStats.hotLeads} hot, ${leadStats.warmLeads} warm`}
          icon={FaUsers}
          color="purple"
          trend={leadStats.monthlyGrowth}
        />
        <StatCard
          title="Total Value"
          value={`$${leadStats.totalValue.toLocaleString()}`}
          subtitle={`Avg: $${leadStats.avgValue.toLocaleString()}`}
          icon={FaChartBar}
          color="blue"
          trend={8.5}
        />
        <StatCard
          title="Qualified Leads"
          value={leadStats.qualifiedLeads}
          subtitle="Ready to convert"
          icon={FaCheckCircle}
          color="green"
          trend={15.2}
        />
        <StatCard
          title="Conversion Rate"
          value={`${leadStats.conversionRate}%`}
          subtitle="This month"
          icon={FaArrowUp}
          color="orange"
          trend={2.1}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:items-center">
            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-7 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
                <option value="qualified">Qualified</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-lg px-7 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FaTable className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <FaThList className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredLeads.length} of {leadStats.totalLeads} leads
        </div>
      </div>

      {/* Leads Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Follow-up
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${lead.value.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.nextFollowUp).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaPen className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first lead'
            }
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Add Your First Lead
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLeads;