import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdDirections, 
  MdAssignmentReturned, 
  MdOutlineAltRoute,
  MdAttachMoney,
  MdPeople,
  MdAccountCircle,
  MdAccountBalance,
  MdBusinessCenter,
  MdAddTask,
  MdSupportAgent,
  MdCampaign,
  MdLocationOn,
  MdHomeRepairService,
  MdSettings,
  MdLogout,
  MdShoppingBag,
  MdShoppingCart
} from 'react-icons/md';

const menuData = {
  // ... Your existing menuData ...
  orderDir: {
    "Intracity": {
      "Part Load": {
        "SDD": "order-directory-intracity-partload-sdd",
        "NDD": "order-directory-intracity-partload-ndd",
      },
      "Full load": "order-directory-intracity-fullload",
      "Rental": "order-directory-intracity-rental"
    },
    "Intercity": {
      "Part Load": "order-directory-intercity-partload",
      "Full Load": "order-directory-intercity-fullload",
      "Biddings": "order-directory-intercity-biddings"
    }
  },
  ordrmng: {
    "Intracity": {
      "Part Load": {
        "SDD": "order-manager-intracity-partload-sdd",
        "NDD": "order-manager-intracity-partload-ndd",
      },
      "Full load": "order-manager-intracity-fullload",
      "Rental": "order-manager-intracity-rental"
    },
    "Intercity": {
      "Part Load": "order-manager-intercity-partload",
      "Full Load": "order-manager-intercity-fullload",
      "Biddings": "order-manager-intercity-biddings"
    }
  },
  oms: {
    "Intracity": {
      "Part Load": {
        "SDD": "oms-intracity-partload-sdd",
        "NDD": "oms-intracity-partload-ndd",
      },
      "Full load": "oms-intracity-fullload",
      "Rental": "oms-intracity-rental"
    },
    "Intercity": {
      "Part Load": "oms-intercity-partload",
      "Full Load": "oms-intercity-fullload",
      "Biddings": "oms-intercity-biddings"
    }
  },
  trpmng: {
    "Intracity": {
      "Part Load": {
        "SDD": "trip-manager-intracity-partload-sdd",
        "NDD": "trip-manager-intracity-partload-ndd",
      },
      "Full load": "trip-manager-intracity-fullload",
      "Rental": "trip-manager-intracity-rental"
    },
    "Intercity": {
      "Part Load": "trip-manager-intercity-partload",
      "Full Load": "trip-manager-intercity-fullload",
      "Biddings": "trip-manager-intercity-biddings"
    }
  },
  prcmng: {
    "Intracity": {
      "Part Load": {
        "SDD": "order-setting-intracity-partload-sdd",
        "NDD": "order-setting-intracity-partload-ndd",
      },
      "Full load": "order-setting-intracity-fullload",
      "Rental": "order-setting-intracity-rental"
    },
    "Intercity": {
      "Part Load": "order-setting-intercity-partload",
      "Full Load": "order-setting-intercity-fullload",
      "Biddings": "order-setting-intercity-biddings"
    }
  },
  usrdir: {
    "Retail Customer": "user-directories-retail-customer",
    "Driver": "user-directories-driver",
    "Vendor": "user-directories-vendor",
    "Staff": "user-directories-staff",
    "Careersource": "user-directories-careersource"
  },
  stfmng: {
    "Staff Management": "hr-portal-staff-management",
    "Access Manager": "hr-portal-access-manager",
    "Activity Tracking": "hr-portal-activity-tracking",
    "Time Management": "hr-portal-time-management",
    "Attendance Management": "hr-portal-attendance-management",
    "Leave Management": "hr-portal-leave-management",
    "Recruitments & Onboarding": "hr-portal-recruitments-onboarding",
    "Performance Management": "hr-portal-performance-management",
    "HR Policies": "hr-portal-policies",
    "HR Announcements": "hr-portal-announcements",
    "HR Grievance": "hr-portal-grievance",
    "Chat Manager": "hr-portal-chat-manager",
    "Analytics & Report": "hr-portal-analytics"
  },
  acc: {
    "Tax and Compliances": "finance-tax-compliances",
    "Invoice and Billing": "finance-invoice-billing",
    "Wallet Management": "finance-wallet-management",
    "Payment & Receipts": "finance-payment-receipts",
    "Ledgers": "finance-ledgers",
    "Profit and Loss Statement": "finance-profit-loss",
    "Analytics and Reports": "finance-analytics",
    "Salary & Payroll Management": "finance-salary-payroll",
    "Expense Manager": "finance-expense-manager",
    "Coupon Management": "finance-coupon-management"
  },
  sale: {
    "Lead Management": "sales-lead-management",
    "CRM": "sales-crm",
    "Quotation Management": "sales-quotation-management",
    "Targets & Performance": "sales-targets-performance",
    "Customer Onboarding": "sales-customer-onboarding",
    "Analytics & Report": "sales-analytics"
  },
  csd1: {
    "Ticket Management": "csd-ticket-management",
    "Ticket Handler": "csd-ticket-handler",
    "First Contact": "csd-first-contact",
    "Escalation Management": "csd-escalation-management",
    "Chat With Staff": "csd-chat-with-staff",
    "Manage Address":"csd-manage-address",
    "Incomplete Order": "csd-incomplete-order"
  },
  actlg: {
    "Campaign Manager": "marketing-campaign-manager",
    "Promotions & Offers": "marketing-promotions-offers",
    "Referral Program": "marketing-referral-program",
    "Loyalty & Reward System": "marketing-loyalty-reward",
    "Customer Segmentation": "marketing-customer-segmentation",
    "Lead generation": "marketing-lead-generation",
    "Surveys and Feedback": "marketing-surveys-feedback",
    "Landing Page Manager": "marketing-landing-page",
    "Social Media Handles": "marketing-social-media",
    "Analytics and Reports": "marketing-analytics"
  },
  manord: {
    "Intracity": {
      "Part Load": {
        "SDD": "manual-orders-intracity-partload-sdd",
        "NDD": "manual-orders-intracity-partload-ndd"
      },
      "Full Load": "manual-orders-intracity-fullload",
      "Rental": "manual-orders-intracity-rental"
    },
    "Intercity": {
      "Part Load": "manual-orders-intercity-partload",
      "Full Load": "manual-orders-intercity-fullload"
    }
  },
  zonmgr: {
    "Part Load": {
      "Manage Hub Zones": "zone-manager-partload-hub-zones",
      "Ground Reporting Zones": "zone-manager-partload-ground-zones"
    }
  }
};

const AdminDashboardNavigation = (props) => {
  const { sidebarOpen } = props;
  const [activeFlyout, setActiveFlyout] = useState(null);
  const menuRefs = useRef({});
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const navigate = useNavigate();
  
  const logoutHandle = () => {
    alert("Logout Successfully");
    navigate("/login");
  };
  
  const openFlyout = (id) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveFlyout(id);
  };
  
  const scheduleCloseFlyout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current?.matches(':hover')) {
        setActiveFlyout(null);
      }
      timeoutRef.current = null;
    }, 50);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Helper to convert pageId to correct route path
const pageIdToRoute = (pageId) => {
  // Known patterns for each section
  if (pageId.startsWith('order-directory-')) {
    return '/order-directory/' + pageId.replace('order-directory-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('order-manager-')) {
    return '/order-manager/' + pageId.replace('order-manager-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('oms-')) {
    return '/oms/' + pageId.replace('oms-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('trip-manager-')) {
    return '/trip-manager/' + pageId.replace('trip-manager-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('order-setting-')) {
    return '/order-setting/' + pageId.replace('order-setting-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('user-directories-')) {
    return '/user-directories/' + pageId.replace('user-directories-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('hr-portal-')) {
    return '/hr-portal/' + pageId.replace('hr-portal-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('finance-')) {
    return '/finance/' + pageId.replace('finance-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('sales-')) {
    return '/sales/' + pageId.replace('sales-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('marketing-')) {
    return '/marketing/' + pageId.replace('marketing-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('manual-orders-')) {
    return '/manual-orders/' + pageId.replace('manual-orders-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('csd-')) {
    return '/csd/' + pageId.replace('csd-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId.startsWith('zone-manager-')) {
    return '/zone-manager/' + pageId.replace('zone-manager-', '').replace(/_/g, '-').toLowerCase();
  }
  if (pageId === 'DC_Manager') {
    return '/dc-manager';
  }
  if (pageId === 'Settings') {
    return '/settings';
  }
  if (pageId === '' || pageId === 'dashboard' || pageId === 'dshbrd') {
    return '/dashboard';
  }
  // fallback
  return '/'+pageId.replace(/_/g, '-').toLowerCase();
};

const handleFlyoutItemClick = (pageId) => {
  navigate(`/admin-dashboard${pageIdToRoute(pageId).startsWith('/') ? '' : '/'}${pageIdToRoute(pageId)}`);
  setActiveFlyout(null);
  console.log(`Navigating to page: ${pageId}`);
};
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeFlyout && !event.target.closest('.flyout-menu')) {
        let shouldClose = true;
        Object.keys(menuRefs.current).forEach(key => {
          if (menuRefs.current[key] && menuRefs.current[key].contains(event.target)) {
            shouldClose = false;
          }
        });
        if (shouldClose) {
          setActiveFlyout(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFlyout]);
  
  const FlyoutMenu = ({ items }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    
    return (
      <ul className="list-none p-0 m-0 ms-[-18px] bg-white">
        {Object.entries(items).map(([key, value], index) => (
          <li 
            key={index} 
            className="relative hover:bg-gray-500 rounded px-2 py-2 whitespace-nowrap"
            onMouseEnter={() => setHoveredItem(key)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {typeof value === 'object' ? (
              <>
                <div className="flex justify-between items-center cursor-pointer">
                  <span>{key}</span>
                  <span className="ml-4">▶</span>
                </div>
                {hoveredItem === key && (
                  <div className="absolute left-full top-0 ml-0 bg-white border border-gray-200 shadow-lg rounded p-2 min-w-[200px] z-[1001]">
                    <FlyoutMenu items={value} />
                  </div>
                )}
              </>
            ) : (
              <div 
                className="cursor-pointer"
                onClick={() => handleFlyoutItemClick(value)}
              >
                {key}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };
  
  const menuItems = [
    { id: 'dshbrd', label: 'Dashboard', page: '', icon: <MdDashboard className="text-xl" /> },
    { id: 'orderDir', label: 'Order Directory', hasSubmenu: true, icon: <MdDirections className="text-xl" /> },
    { id: 'ordrmng', label: 'Order Manager', hasSubmenu: true, icon: <MdAssignmentReturned className="text-xl" /> },
    { id: 'oms', label:'O.M.S',hasSubmenu: true,icon:<MdShoppingCart className="text-xl" /> },
    { id: 'trpmng', label: 'Trip Manager', hasSubmenu: true, icon: <MdOutlineAltRoute className="text-xl" /> },
    { id: 'prcmng', label: 'Order Setting', hasSubmenu: true, icon: <MdAttachMoney className="text-xl" /> },
    { id: 'stfmng', label: 'HR Portal', hasSubmenu: true, icon: <MdPeople className="text-xl" /> },
    { id: 'usrdir', label: 'User Directories', hasSubmenu: true, icon: <MdAccountCircle className="text-xl" /> },
    { id: 'acc', label: 'Finance', hasSubmenu: true, icon: <MdAccountBalance className="text-xl" /> },
    { id: 'sale', label: 'Sales', hasSubmenu: true, icon: <MdBusinessCenter className="text-xl" /> },
    { id: 'manord', label: 'Manual Orders', hasSubmenu: true, icon: <MdAddTask className="text-xl" /> },
    { id: 'actlg', label: 'Marketing', hasSubmenu: true, icon: <MdCampaign className="text-xl" /> },
    { id: 'csd1', label: 'CSD', hasSubmenu: true, icon: <MdSupportAgent className="text-xl" />  },
    { id: 'zonmgr', label: 'Zone Manager', hasSubmenu: true, icon: <MdLocationOn className="text-xl" /> },
    { id: 'dcmgr', label: 'DC Manager', page: 'DC_Manager', icon: <MdHomeRepairService className="text-xl" /> },
    { id: 'seting', label: 'Settings', page: 'Settings', icon: <MdSettings className="text-xl" /> },
    { id: 'lgot', label: 'Logout', action: logoutHandle, icon: <MdLogout className="text-xl" /> },
  ];
 const menuKeys = Object.keys(menuData);
  const activeIndex = menuKeys.indexOf(activeFlyout);

const isLastFive = activeIndex >= menuKeys.length-6;
let stylePosition = {};
  if (activeFlyout && menuRefs.current[activeFlyout]) {
    const rect = menuRefs.current[activeFlyout].getBoundingClientRect();
    if (isLastFive) {
      stylePosition = {
        position: 'fixed',
        bottom: (window.innerHeight - rect.top + (sidebarOpen ? 2 : 5)-60) + 'px',//-60 would be add by me
        left: rect.right + 'px',
        minWidth: '200px',
      };
    } 
    else if(activeIndex==5){
      stylePosition={position:'fixed',
        top:rect.top-100+'px',
        left: (rect.right + (sidebarOpen ? 2 : 15)) + 'px',
        minWidth: '200px',
      }

    }
    else {//code for remaining elements
      stylePosition = {
        position: 'fixed',
        top: rect.top + 'px',
        left: (rect.right + (sidebarOpen ? 2 : 15)) + 'px',
        minWidth: '200px',
      };
    
    }
  }
  return (
    <div className="px-2 ms-2 flex flex-col gap-1">
      {menuItems.map((item) => (
        <div
          key={item.id}
          ref={(el) => menuRefs.current[item.id] = el}
          className={`fw-bold p-2 ${sidebarOpen ? 'ps-3' : 'px-1 justify-center'} 
          ${item.hasSubmenu && activeFlyout === item.id ? 'bg-gray-500' : 'hover:bg-gray-500'} 
          rounded cursor-pointer relative flex items-center ${sidebarOpen ? '' : 'flex-col'} group`}
          onClick={() => {
            if (item.action) {
              item.action();
            } else if (item.page !== undefined) {
              navigate(`/admin-dashboard${pageIdToRoute(item.page).startsWith('/') ? '' : '/'}${pageIdToRoute(item.page)}`);
            } else if (!item.hasSubmenu) {
              navigate(`/admin-dashboard${pageIdToRoute(item.id).startsWith('/') ? '' : '/'}${pageIdToRoute(item.id)}`);
            }
          }}
          onMouseEnter={() => {
            if (item.hasSubmenu) {
              openFlyout(item.id);
            }
          }}
          onMouseLeave={() => {
            if (item.hasSubmenu) {
              scheduleCloseFlyout();
            }
          }}
        >
          {/* Icon */}
          <div className={`${sidebarOpen ? 'mr-3' : 'mb-1'} text-gray-700`}>
            {item.icon}
          </div>
          
          {/* Label - only shown when sidebar is expanded */}
          {sidebarOpen && (
            <div className="flex justify-between w-full">
                <span>{item.label}</span>
                {item.hasSubmenu && <span>▶</span>}
            </div>
          )}
          
          {/* For collapsed view, show tooltip on hover */}
          {!sidebarOpen && (
            <div className="absolute left-full bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden group-hover:block z-50">
              {item.label}
            </div>
          )}
        </div>
      ))}
      
      {/* Container for both main menu items and their flyouts */}
      <div ref={containerRef} className="relative">
      {activeFlyout && menuData[activeFlyout] && (
        <div
          className="flyout-menu absolute bg-white border border-gray-200 shadow-lg rounded p-0 ml-4 z-[1000]"
          style={stylePosition}
        >
          <FlyoutMenu items={menuData[activeFlyout]} />
        </div>
      )}
    </div>
      {/* Legacy submenus for compatibility */}
      {props.subPriceManagement && (
        <div className="ms-4 border rounded">
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deploy_Vehicle")}
          >
            Rental Price Setting
          </div>
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deployment_List")}
          >
            PartLoad Price Setting
          </div>
        </div>
      )}

      {props.subSetting && (
        <div className="ms-4 border rounded">
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deploy_Vehicle")}
          >
            Roles & Permissions
          </div>
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deployment_List")}
          >
            Service Area Manager
          </div>
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deployment_List")}
          >
            Notification Center
          </div>
          <div
            className="fw-bold p-2 ps-3 rounded hover:bg-gray-500 shadow cursor-pointer"
            onClick={() => props.setRenderPage("Deployment_List")}
          >
            Document Verification
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardNavigation;