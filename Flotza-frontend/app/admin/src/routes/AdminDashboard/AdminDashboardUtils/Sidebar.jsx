import React, { useState } from "react";
import AdminDashboardNavigation from "./AdminDashboardNavigation";

const Sidebar = (props) => {
  // States for submenu management
  const [subManageRentals, setSubManageRentals] = useState(false);
  const [subPriceManagement, setSubPriceManagement] = useState(false);
  const [subPromotionalManagement, setSubPromotionalManagement] = useState(false);
  const [subFinance, setSubFinance] = useState(false);
  const [subSetting, setSubSetting] = useState(false);
  const [subAdvanceTools, setSubAdvanceTools] = useState(false);

  return (
    <div
      className={`bg-white z-40 fixed top-0 pt-16 h-screen shadow-md ${
        props.sidebarOpen ? "w-60" : "w-20"
      } transition-all duration-300`}
    >
      <div className="h-full overflow-y-auto">
        <AdminDashboardNavigation 
          setRenderPage={props.setRenderPage}
          setSubManageRentals={setSubManageRentals}
          subManageRentals={subManageRentals}
          setSubPriceManagement={setSubPriceManagement}
          subPriceManagement={subPriceManagement}
          setSubPromotionalManagement={setSubPromotionalManagement}
          subPromotionalManagement={subPromotionalManagement}
          setSubFinance={setSubFinance}
          subFinance={subFinance}
          setSubSetting={setSubSetting}
          subSetting={subSetting}
          setSubAdvanceTools={setSubAdvanceTools}
          subAdvanceTools={subAdvanceTools}
          sidebarOpen={props.sidebarOpen}
        />
      </div>

      {/* Toggle button */}
      <button
        onClick={() => props.setSidebarOpen(!props.sidebarOpen)}
        className="absolute -right-3 top-20 bg-white border border-gray-300 rounded-full p-1 shadow-md"
      >
        {props.sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Sidebar;
