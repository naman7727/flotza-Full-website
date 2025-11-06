import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ProtectedRoute from "../lib/utils/ProtectedRoute";
import CustomerDashboard from "./CustomerDashboard";
import Wallet from "./CustomerDashboard/CustomerPages/Wallet";
import WalletHistory from "./CustomerDashboard/CustomerPages/Wallethistory";
import AdminDashboard from "./AdminDashboard";
import DriverDashboard from "./DriverDashboard";
import VendorDashboard from "./VendorDashboard";
import WalletTransactionHistory from "./CustomerDashboard/CustomerPages/Wallethistory";
import BookPartload from "./CustomerDashboard/CustomerPages/BookPartLoad";
import RentCarrier from "./CustomerDashboard/CustomerPages/RentCarrier";
import SalesDashboard from "./SalesDashboard";
import ProfilePage from "./DriverDashboard/pages/ProfilePage";
import DeliveryHistory from "./DriverDashboard/components/DeliveryHistory";
import CustomerDashboardHome from "./CustomerDashboard/CustomerPages/Dashboard";
import DriverDashboardHome from "./DriverDashboard/components/Dashboard";
import Outstanding from "./DriverDashboard/components/Outstanding";
import ChangePassword from "./DriverDashboard/pages/ChangePassword";
import DeliveryHistoryRoute from "./DriverDashboard/components/DeliveryHistoryRoute";
import OrderDetails from "./AdminDashboard/AdminPages/OrderManager/OrderDetails";
import OrderHistory from "./CustomerDashboard/CustomerPages/OrderHistory";
import PlaceOrder from "./CustomerDashboard/CustomerPages/PlaceOrder";
import Support from "./CustomerDashboard/CustomerPages/Support";
import TrackingStatus from "./CustomerDashboard/CustomerPages/TrackingStatus";
import PlaceManagement from "./CustomerDashboard/CustomerPages/PlaceManagement";
import UserProfile from "./CustomerDashboard/CustomerPages/UserProfile";
import ResetPassword from "./AdminDashboard/AdminPages/HRPortal/reset-password";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/customer-dashboard/*"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboardHome />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="place-order" element={<PlaceOrder />} />
          <Route path="support" element={<Support />} />
          <Route path="tracking-status" element={<TrackingStatus />} />
          <Route path="place-manager" element={<PlaceManagement />} />
          <Route path="user-profile" element={<UserProfile isAdmin={true} />} />
        </Route>


        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route 
        path="/admin-dashboard/HRPortal/reset-password"
        element= {<ResetPassword/>} 
         />
        <Route path="/order-details/*" element={<OrderDetails />} />

        <Route
          path="/driver-dashboard/*"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }>

          <Route index element={<DriverDashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="delivery-history" element={<DeliveryHistoryRoute />} />
          <Route path="outstanding" element={<Outstanding />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          }/>

        <Route
          path="/wallet-history"
          element={
            <ProtectedRoute>
              <WalletTransactionHistory />
            </ProtectedRoute>
          }/>

        <Route
          path="/sales-dashboard"
          element={
            <ProtectedRoute>
              <SalesDashboard />
            </ProtectedRoute>
          }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;