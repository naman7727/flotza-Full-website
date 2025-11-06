/* eslint-disable no-unused-vars */
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./AdminDashboardUtils/Sidebar";
import Header from "./AdminDashboardUtils/Header";
import { CiChat1 } from "react-icons/ci";
import Dashboard from "./AdminPages/Dashboard";
import DCManager from "./AdminPages/DCManager";
import BlankPage from "./AdminPages/BlankPage";
import ManualBlanceRequest from "./AdminPages/Finance/ManualBlanceRequest";

// Order Directory Pages
import IntracityPartloadSDD from "./AdminPages/OrderDirectory/IntracityPartloadSDD";
import IntracityPartloadNDD from "./AdminPages/OrderDirectory/IntracityPartloadNDD";
import IntracityFullload from "./AdminPages/OrderDirectory/IntracityFullload";
import IntracityRental from "./AdminPages/OrderDirectory/IntracityRental";
import IntercityPartload from "./AdminPages/OrderDirectory/IntercityPartload";
import IntercityFullload from "./AdminPages/OrderDirectory/IntercityFullload";
import IntercityBiddings from "./AdminPages/OrderDirectory/IntercityBiddings";

// Order Manager Pages
import OMIntracityPartloadSDD from "./AdminPages/OrderManager/IntracityPartloadSDD";
import OMIntracityPartloadNDD from "./AdminPages/OrderManager/IntracityPartloadNDD";
import OMIntracityFullload from "./AdminPages/OrderManager/IntracityFullload";
import OMIntracityRental from "./AdminPages/OrderManager/IntracityRental";
import OMIntercityPartload from "./AdminPages/OrderManager/IntercityPartload";
import OMIntercityFullload from "./AdminPages/OrderManager/IntercityFullload";
import OMIntercityBiddings from "./AdminPages/OrderManager/IntercityBiddings";

// Trip Manager Pages
import TMIntracityPartloadSDD from "./AdminPages/TripManager/IntracityPartloadSDD";
import TMIntracityPartloadNDD from "./AdminPages/TripManager/IntracityPartloadNDD";
import TMIntracityFullload from "./AdminPages/TripManager/IntracityFullload";
import TMIntracityRental from "./AdminPages/TripManager/IntracityRental";
import TMIntercityPartload from "./AdminPages/TripManager/IntercityPartload";
import TMIntercityFullload from "./AdminPages/TripManager/IntercityFullload";
import TMIntercityBiddings from "./AdminPages/TripManager/IntercityBiddings";

// Order Setting Pages
import PMIntracityPartloadSDD from "./AdminPages/OrderSetting/IntracityPartloadSDD";
import PMIntracityPartloadNDD from "./AdminPages/OrderSetting/IntracityPartloadNDD";
import PMIntracityFullload from "./AdminPages/OrderSetting/IntracityFullload";
import PMIntracityRental from "./AdminPages/OrderSetting/IntracityRental";
import PMIntercityPartload from "./AdminPages/OrderSetting/IntercityPartload";
import PMIntercityFullload from "./AdminPages/OrderSetting/IntercityFullload";
import PMIntercityBiddings from "./AdminPages/OrderSetting/IntercityBiddings";

// OMS Pages
import OMSIntracityPartloadSDD from "./AdminPages/OMS/IntracityPartloadSDD";

// User Directories Pages
import RetailCustomer from "./AdminPages/UserDirectories/RetailCustomer";
import Driver from "./AdminPages/UserDirectories/Driver";
import Vendor from "./AdminPages/UserDirectories/Vendor";
import Staff from "./AdminPages/UserDirectories/Staff";
import Careersource from "./AdminPages/UserDirectories/Careersource";

// HR Portal Pages
import StaffManagement from "./AdminPages/HRPortal/StaffManagement";
import AccessManager from "./AdminPages/HRPortal/AccessManager";
import ActivityTracking from "./AdminPages/HRPortal/ActivityTracking";
import TimeManagement from "./AdminPages/HRPortal/TimeManagement";
import AttendanceManagement from "./AdminPages/HRPortal/AttendanceManagement";
import LeaveManagement from "./AdminPages/HRPortal/LeaveManagement";
import RecruitmentsOnboarding from "./AdminPages/HRPortal/RecruitmentsOnboarding";
import PerformanceManagement from "./AdminPages/HRPortal/PerformanceManagement";
import Policies from "./AdminPages/HRPortal/Policies";
import Announcements from "./AdminPages/HRPortal/Announcements";
import Grievance from "./AdminPages/HRPortal/Grievance";
import HRAnalytics from "./AdminPages/HRPortal/Analytics";
import ChatManager from "./AdminPages/HRPortal/ChatManager";

// Finance Pages
import TaxCompliances from "./AdminPages/Finance/TaxCompliances";
import InvoiceBilling from "./AdminPages/Finance/InvoiceBilling";
import PaymentReceipts from "./AdminPages/Finance/PaymentReceipts";
import Ledgers from "./AdminPages/Finance/Ledgers";
import ProfitLoss from "./AdminPages/Finance/ProfitLoss";
import FinanceAnalytics from "./AdminPages/Finance/Analytics";
import SalaryPayroll from "./AdminPages/Finance/SalaryPayroll";
import ExpenseManager from "./AdminPages/Finance/ExpenseManager";
import CouponManagement from "./AdminPages/Finance/CouponManagement";
import WalletManagement from "./AdminPages/Finance/WalletManagement";
import SetODLimit from "./AdminPages/Finance/SetODLimit";
import ManualBalanceRequest from "./AdminPages/Finance/ManualBlanceRequest";

// Sales Pages
import LeadManagement from "./AdminPages/Sales/LeadManagement";
import CRM from "./AdminPages/Sales/CRM";
import QuotationManagement from "./AdminPages/Sales/QuotationManagement";
import TargetsPerformance from "./AdminPages/Sales/TargetsPerformance";
import CustomerOnboarding from "./AdminPages/Sales/CustomerOnboarding";
import SalesAnalytics from "./AdminPages/Sales/Analytics";

// CSD Pages
import TicketManagement from "./AdminPages/CSD/TicketManagement";
import FirstContact from "./AdminPages/CSD/FirstContact";
import EscalationManagement from "./AdminPages/CSD/EscalationManagement";
import ChatWithStaff from "./AdminPages/CSD/ChatWithStaff";
import IncompleteOrder from "./AdminPages/CSD/IncompleteOrder";
import ManageAddress from "./AdminPages/CSD/ManageAddress";
// Marketing Pages
import CampaignManager from "./AdminPages/Marketing/CampaignManager";
import ContentManagement from "./AdminPages/Marketing/ContentManagement";
import SocialMediaManager from "./AdminPages/Marketing/SocialMediaManager";
import EmailMarketing from "./AdminPages/Marketing/EmailMarketing";
import SEO from "./AdminPages/Marketing/SEO";
import MarketingAnalytics from "./AdminPages/Marketing/Analytics";
import PromotionsOffers from "./AdminPages/Marketing/PromotionsOffers";
import ReferralProgram from "./AdminPages/Marketing/ReferralProgram";
import LoyaltyReward from "./AdminPages/Marketing/LoyaltyReward";
import CustomerSegmentation from "./AdminPages/Marketing/CustomerSegmentation";
import LeadGeneration from "./AdminPages/Marketing/LeadGeneration";
import SurveysFeedback from "./AdminPages/Marketing/SurveysFeedback";
import LandingPageManager from "./AdminPages/Marketing/LandingPageManager";

// Manual Orders Pages
import MOIntracityPartloadSDD from "./AdminPages/ManualOrders/IntracityPartloadSDD";
import MOIntracityPartloadNDD from "./AdminPages/ManualOrders/IntracityPartloadNDD";
import MOIntracityFullload from "./AdminPages/ManualOrders/IntracityFullload";
import MOIntracityRental from "./AdminPages/ManualOrders/IntracityRental";
import MOIntercityPartload from "./AdminPages/ManualOrders/IntercityPartload";
import MOIntercityFullload from "./AdminPages/ManualOrders/IntercityFullload";
import MOIntercityBiddings from "./AdminPages/ManualOrders/IntercityBiddings";

// Zone Manager Pages
import PartloadHubZones from "./AdminPages/ZoneManager/PartloadHubZones";
import PartloadGroundZones from "./AdminPages/ZoneManager/PartloadGroundZones";
import TicketHandler from "./AdminPages/CSD/TicketHandler";
import CreateNewStaff from "./AdminPages/HRPortal/StaffManagementComponent/CreateNewStaff";
import EditStaff from "./AdminPages/HRPortal/StaffManagementComponent/EditStaffPage";
import ViewStaff from "./AdminPages/HRPortal/StaffManagementComponent/ViewStaff";

// Order Setting Page
import OSIntracityPartloadNDD from "./AdminPages/OrderSetting/IntracityPartloadNDD";
import OSIntracityPartloadSDD from "./AdminPages/OrderSetting/IntracityPartloadSDD";

const AdminDashboard = () => {
  // Sidebar state retained if needed for UI
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="relative">
      <Header />
      <div className="flex min-h-screen">
        <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        <div className={`flex-1 p-5 text-black mt-17 ${sidebarOpen ? "ms-60" : "ms-20"}`}>
          <Routes>
            {/* Dashboard */}
            <Route path="" element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dc-manager" element={<DCManager />} />

            {/* Order Directory */}
            <Route path="order-directory/intracity-partload-sdd" element={<IntracityPartloadSDD />} />
            <Route path="order-directory/intracity-partload-ndd" element={<IntracityPartloadNDD />} />
            <Route path="order-directory/intracity-fullload" element={<IntracityFullload />} />
            <Route path="order-directory/intracity-rental" element={<IntracityRental />} />
            <Route path="order-directory/intercity-partload" element={<IntercityPartload />} />
            <Route path="order-directory/intercity-fullload" element={<IntercityFullload />} />
            <Route path="order-directory/intercity-biddings" element={<IntercityBiddings />} />

            {/* Order Setting */}
            <Route path="order-setting/intracity-partload-sdd" element={<OSIntracityPartloadSDD />} />
            <Route path="order-setting/intracity-partload-ndd" element={<OSIntracityPartloadNDD />} />

            {/* Order Manager */}
            <Route path="order-manager/intracity-partload-sdd" element={<OMIntracityPartloadSDD />} />
            <Route path="order-manager/intracity-partload-ndd" element={<OMIntracityPartloadNDD />} />
            <Route path="order-manager/intracity-fullload" element={<OMIntracityFullload />} />
            <Route path="order-manager/intracity-rental" element={<OMIntracityRental />} />
            <Route path="order-manager/intercity-partload" element={<OMIntercityPartload />} />
            <Route path="order-manager/intercity-fullload" element={<OMIntercityFullload />} />
            <Route path="order-manager/intercity-biddings" element={<OMIntercityBiddings />} />

            {/* OMS */}
            <Route path="oms/intracity-partload-sdd" element={<OMSIntracityPartloadSDD />} />

            {/* Trip Manager */}
            <Route path="trip-manager/intracity-partload-sdd" element={<TMIntracityPartloadSDD />} />
            <Route path="trip-manager/intracity-partload-ndd" element={<TMIntracityPartloadNDD />} />
            <Route path="trip-manager/intracity-fullload" element={<TMIntracityFullload />} />
            <Route path="trip-manager/intracity-rental" element={<TMIntracityRental />} />
            <Route path="trip-manager/intercity-partload" element={<TMIntercityPartload />} />
            <Route path="trip-manager/intercity-fullload" element={<TMIntercityFullload />} />
            <Route path="trip-manager/intercity-biddings" element={<TMIntercityBiddings />} />

            {/* Price Manager */}
            <Route path="price-manager/intracity-partload-sdd" element={<PMIntracityPartloadSDD />} />
            <Route path="price-manager/intracity-partload-ndd" element={<PMIntracityPartloadNDD />} />
            <Route path="price-manager/intracity-fullload" element={<PMIntracityFullload />} />
            <Route path="price-manager/intracity-rental" element={<PMIntracityRental />} />
            <Route path="price-manager/intercity-partload" element={<PMIntercityPartload />} />
            <Route path="price-manager/intercity-fullload" element={<PMIntercityFullload />} />
            <Route path="price-manager/intercity-biddings" element={<PMIntercityBiddings />} />

            {/* User Directories */}
            <Route path="user-directories/retail-customer" element={<RetailCustomer />} />
            <Route path="user-directories/retail-customer/:userId" element={<RetailCustomer />} />
            <Route path="user-directories/driver" element={<Driver />} />
            <Route path="user-directories/vendor" element={<Vendor />} />
            <Route path="user-directories/staff" element={<Staff />} />
            <Route path="user-directories/careersource" element={<Careersource />} />

            {/* HR Portal */}
            <Route path="hr-portal/staff-management" element={<StaffManagement />} />
            <Route path="hr-portal/staff-management/create-new-staff" element={<CreateNewStaff />} />
            <Route path="hr-portal/staff-management/view-staff/:id" element={<ViewStaff />} />
            <Route path="hr-portal/staff-management/edit-staff/:id" element={<EditStaff />} />
            <Route path="hr-portal/access-manager" element={<AccessManager />} />
            <Route path="hr-portal/activity-tracking" element={<ActivityTracking />} />
            <Route path="hr-portal/time-Management" element={<TimeManagement />} />
            <Route path="hr-portal/attendance-management" element={<AttendanceManagement />} />
            <Route path="hr-portal/leave-management" element={<LeaveManagement />} />
            <Route path="hr-portal/recruitments-onboarding" element={<RecruitmentsOnboarding />} />
            <Route path="hr-portal/performance-management" element={<PerformanceManagement />} />
            <Route path="hr-portal/policies" element={<Policies />} />
            <Route path="hr-portal/announcements" element={<Announcements />} />
            <Route path="hr-portal/grievance" element={<Grievance />} />
            <Route path="hr-portal/analytics" element={<HRAnalytics />} />
            <Route path="hr-portal/chat-manager" element={<ChatManager />} />

            {/* Finance */}
            <Route path="finance/tax-compliances" element={<TaxCompliances />} />
            <Route path="finance/invoice-billing" element={<InvoiceBilling />} />
            <Route path="finance/payment-receipts" element={<PaymentReceipts />} />
            <Route path="finance/ledgers" element={<Ledgers />} />
            <Route path="finance/profit-loss" element={<ProfitLoss />} />
            <Route path="finance/analytics" element={<FinanceAnalytics />} />
            <Route path="finance/salary-payroll" element={<SalaryPayroll />} />
            <Route path="finance/expense-manager" element={<ExpenseManager />} />
            <Route path="finance/coupon-management" element={<CouponManagement />} />
            <Route path="finance/wallet-management" element={<WalletManagement />} />
            <Route path="finance/set-od-limit" element={<SetODLimit />} />
            <Route path="finance/manual-balance-request" element={<ManualBalanceRequest />} />

            {/* Sales */}
            <Route path="sales/lead-management" element={<LeadManagement />} />
            <Route path="sales/crm" element={<CRM />} />
            <Route path="sales/quotation-management" element={<QuotationManagement />} />
            <Route path="sales/targets-performance" element={<TargetsPerformance />} />
            <Route path="sales/customer-onboarding" element={<CustomerOnboarding />} />
            <Route path="sales/analytics" element={<SalesAnalytics />} />

            {/* CSD */}
            <Route path="csd/ticket-management" element={<TicketManagement />} />
            <Route path="csd/first-contact" element={<FirstContact />} />
            <Route path="csd/escalation-management" element={<EscalationManagement />} />
            <Route path="csd/chat-with-staff" element={<ChatWithStaff />} />
            <Route path="csd/incomplete-order" element={<IncompleteOrder />} />
            <Route path="csd/manage-address" element={<ManageAddress />} />
            <Route path="csd/ticket-handler" element={<TicketHandler />} />

            {/* Marketing */}
            <Route path="marketing/campaign-manager" element={<CampaignManager />} />
            <Route path="marketing/content-management" element={<ContentManagement />} />
            <Route path="marketing/social-media" element={<SocialMediaManager />} />
            <Route path="marketing/email-marketing" element={<EmailMarketing />} />
            <Route path="marketing/seo" element={<SEO />} />
            <Route path="marketing/analytics" element={<MarketingAnalytics />} />
            <Route path="marketing/promotions-offers" element={<PromotionsOffers />} />
            <Route path="marketing/referral-program" element={<ReferralProgram />} />
            <Route path="marketing/loyalty-reward" element={<LoyaltyReward />} />
            <Route path="marketing/customer-segmentation" element={<CustomerSegmentation />} />
            <Route path="marketing/lead-generation" element={<LeadGeneration />} />
            <Route path="marketing/surveys-feedback" element={<SurveysFeedback />} />
            <Route path="marketing/landing-page" element={<LandingPageManager />} />

            {/* Manual Orders */}
            <Route path="manual-orders/intracity-partload-sdd" element={<MOIntracityPartloadSDD />} />
            <Route path="manual-orders/intracity-partload-ndd" element={<MOIntracityPartloadNDD />} />
            <Route path="manual-orders/intracity-fullload" element={<MOIntracityFullload />} />
            <Route path="manual-orders/intracity-rental" element={<MOIntracityRental />} />
            <Route path="manual-orders/intercity-partload" element={<MOIntercityPartload />} />
            <Route path="manual-orders/intercity-fullload" element={<MOIntercityFullload />} />
            <Route path="manual-orders/intercity-biddings" element={<MOIntercityBiddings />} />

            {/* Zone Manager */}
            <Route path="zone-manager/partload-hub-zones" element={<PartloadHubZones />} />
            <Route path="zone-manager/partload-ground-zones" element={<PartloadGroundZones />} />

            {/* Fallback: show blank page for unknown paths */}
            <Route path="*" element={<BlankPage pageId={window.location.pathname.replace(/^\//, '')} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;