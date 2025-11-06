import { useState } from 'react';
import { FaBell, FaSearch, FaUserCircle, FaChevronDown, FaSun, FaMoon} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import logo from "../../../assets/logo.png";

const Header = ({ setRenderPage }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock notifications data
  const notifications = [
    { id: 1, message: "New lead assigned to you", time: "5 min ago", type: "info" },
    { id: 2, message: "Sales target achieved!", time: "1 hour ago", type: "success" },
    { id: 3, message: "Meeting scheduled for 3 PM", time: "2 hours ago", type: "warning" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Implement dark mode toggle logic
  };

  return (
    <header className="relative">
      {/* Main Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white shadow-lg">
        {/* Left Section - Logo/Title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 
            className="text-lg sm:text-xl lg:text-2xl font-bold cursor-pointer hover:text-purple-200 transition-colors duration-200 flex items-center"
            onClick={() => setRenderPage("dashboard")}
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="inline">Sales Dashboard</span>
          </h1>
        </div>

        {/* Center Section - Search (Desktop Only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative w-full">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Search customers, leads, reports..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-200 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <FaSun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <FaMoon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              title="Notifications"
            >
              <FaBell className="h-4 w-4 sm:h-5 sm:w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="Profile"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/30"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-purple-200">Sales Manager</p>
                </div>
              </div>
              <FaChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${
                isProfileDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform opacity-100 scale-100 transition-all duration-200">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Profile"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">john.doe@company.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setRenderPage("company-profile");
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                  >
                    <FaUserCircle className="h-4 w-4" />
                    <span>My Profile</span>
                  </button>
                  
                  <div className="border-t border-gray-200 my-2"></div>  
                  <button className="flex items-center space-x-2 sm:space-x-3 w-full px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150">
                    <FiLogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 text-sm"
          />
        </div>
      </div>

      {/* Click Outside Handler */}
      {(isProfileDropdownOpen || isNotificationOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;