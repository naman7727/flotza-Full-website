import { useState } from "react";
import Sidebar from "./SalesDashboardUtils/Sidebar";
import Header from "./SalesDashboardUtils/Header";
import Attendance from "./SalesPages/Attendance";
import MyDatabase from "./SalesPages/MyDatabase";
import DailyVisits from "./SalesPages/DailyVisits";
import MyLeads from "./SalesPages/MyLeads";
import MyCustomers from "./SalesPages/MyCustomers";
import SalesReport from "./SalesPages/SalesReport";
import PerformanceTargets from "./SalesPages/PerformanceTargets";
import CompanyProfile from "./SalesPages/CompanyProfile";
import PromotionalMaterials from "./SalesPages/PromotionalMaterials";
import Admin from "./SalesPages/Admin";

const SalesDashboard = () => {
  const [renderPage, setRenderPage] = useState("dashboard");

  const renderContent = () => {
    switch (renderPage) {
      case "attendance":
        return <Attendance />;
      case "database":
        return <MyDatabase />;
      case "visits":
        return <DailyVisits />;
      case "leads":
        return <MyLeads />;
      case "customers":
        return <MyCustomers />;
      case "report":
        return <SalesReport />;
      case "performance":
        return <PerformanceTargets />;
      case "profile":
        return <CompanyProfile />;
      case "materials":
        return <PromotionalMaterials />;
      case "admin":
        return <Admin />;
      default:
        return <div className="text-2xl text-center py-10">Welcome to the Sales Dashboard</div>;
    }
  };

  return (
   <div className="flex min-h-screen">
      <Sidebar setRenderPage={setRenderPage} /> 
        <div className="flex-1 flex flex-col">
          <Header setRenderPage={setRenderPage} />
            <main className="flex-1 p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
              {renderContent()}
            </main>
        </div>
  </div>
  );
};

export default SalesDashboard;