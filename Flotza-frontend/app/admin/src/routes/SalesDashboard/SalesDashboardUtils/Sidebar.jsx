import { 
  FaUsers, 
  FaBriefcase, 
  FaBullseye, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaCog, 
  FaInfoCircle,
  FaChartLine,
  FaUserTie,
  FaClipboardList,
  FaDatabase,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const menuItems = [
  { 
    label: 'Attendance', 
    icon: FaCalendarAlt, 
    key: 'attendance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100',
    activeBg: 'bg-blue-100 border-blue-300'
  },
  { 
    label: 'My Database', 
    icon: FaDatabase, 
    key: 'database',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverBg: 'hover:bg-green-100',
    activeBg: 'bg-green-100 border-green-300'
  },
  { 
    label: 'Daily Visits', 
    icon: FaClipboardList, 
    key: 'visits',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-100',
    activeBg: 'bg-orange-100 border-orange-300'
  },
  { 
    label: 'My Leads', 
    icon: FaBriefcase, 
    key: 'leads',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBg: 'hover:bg-purple-100',
    activeBg: 'bg-purple-100 border-purple-300'
  },
  { 
    label: 'My Customers', 
    icon: FaUsers, 
    key: 'customers',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-100',
    activeBg: 'bg-indigo-100 border-indigo-300'
  },
  { 
    label: 'Sales Report', 
    icon: FaChartLine, 
    key: 'report',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverBg: 'hover:bg-red-100',
    activeBg: 'bg-red-100 border-red-300'
  },
  { 
    label: 'Performance & Targets', 
    icon: FaBullseye, 
    key: 'performance',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    hoverBg: 'hover:bg-yellow-100',
    activeBg: 'bg-yellow-100 border-yellow-300'
  },
  { 
    label: 'Company Profile', 
    icon: FaInfoCircle, 
    key: 'profile',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    hoverBg: 'hover:bg-teal-100',
    activeBg: 'bg-teal-100 border-teal-300'
  },
  { 
    label: 'Promotional Materials', 
    icon: FaFileAlt, 
    key: 'materials',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    hoverBg: 'hover:bg-pink-100',
    activeBg: 'bg-pink-100 border-pink-300'
  },
  { 
    label: 'Admin', 
    icon: FaCog, 
    key: 'admin',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-100',
    activeBg: 'bg-gray-100 border-gray-300'
  },
];

const Sidebar = ({ setRenderPage }) => {
  const [active, setActive] = useState(() => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('my-database')) return 'my-database';
  if (path.includes('daily-visits')) return 'daily-visits';
  if (path.includes('my-leads')) return 'my-leads';
  if (path.includes('reports')) return 'reports';
  if (path.includes('orders')) return 'orders';
  return '/'; 
});

  useEffect(() => {
    setRenderPage(active);
  }, [active, setRenderPage]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Always show full sidebar on mobile when open
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const handleSelect = (key) => {
    setActive(key);
    setRenderPage(key);
    if (isMobile) {
      setIsMobileOpen(false); // Close mobile menu after selection
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Mobile Overlay
  const MobileOverlay = () => (
    isMobile && isMobileOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={() => setIsMobileOpen(false)}
      />
    )
  );

  // Mobile Toggle Button
  const MobileToggleButton = () => (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-lg p-2 shadow-lg border border-gray-200"
    >
      {isMobileOpen ? <FaTimes className="text-gray-700" /> : <FaBars className="text-gray-700" />}
    </button>
  );

  return (
    <>
      <MobileToggleButton />
      <MobileOverlay />     
      <aside className={`
        ${isMobile 
          ? `fixed left-0 top-0 z-40 h-full transition-transform duration-300 ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        }
        ${isCollapsed && !isMobile ? 'w-20' : 'w-72'}
        h-full bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-lg
        transition-all duration-300 ease-in-out
      `}>
        
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 z-10"
          >
            {isCollapsed ? 
              <FaChevronRight className="text-gray-600 text-xs" /> : 
              <FaChevronLeft className="text-gray-600 text-xs" />
            }
          </button>
        )}

        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed && !isMobile ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaUserTie className="text-white text-lg" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-gray-900 text-lg whitespace-nowrap">Sales Hub</h2>
                <p className="text-sm text-gray-500 whitespace-nowrap">Management Center</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className={`p-4 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
          <div className="space-y-1">
            {menuItems.map(({ label, icon: Icon, key, color, hoverBg, activeBg }) => (
              <div key={key} className="relative group">
                <button
                  onClick={() => handleSelect(key)}
                  className={`
                    w-full flex items-center gap-4 rounded-xl
                    text-left font-medium transition-all duration-200
                    transform hover:scale-[1.02] hover:shadow-md
                    border border-transparent
                    ${isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
                    ${active === key 
                      ? `${activeBg} ${color} shadow-sm border-current font-semibold` 
                      : `text-gray-700 ${hoverBg} hover:text-gray-900`
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                    ${active === key ? 'bg-white/50' : 'bg-gray-100/50'}
                    transition-colors duration-200
                  `}>
                    {/* Render the icon */}
                    {Icon && <Icon 
                      size={18} 
                      className={active === key ? color : 'text-gray-600'} 
                    />}
                  </div>
                  
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span className="text-sm font-medium truncate">
                        {label}
                      </span>
                      
                      {/* Active Indicator */}
                      {active === key && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-current opacity-60"></div>
                      )}
                    </>
                  )}
                </button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {label}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;