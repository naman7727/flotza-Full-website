import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logout } from '../../../lib/auth/authSlice';
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";
import { MdOutlineAdd, MdOutlineHistory } from "react-icons/md";
import { GiWallet } from "react-icons/gi";
import { FaMapLocationDot } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { ImLocation2 } from "react-icons/im";
import { CgLogOut } from "react-icons/cg";
import { TbLayoutDashboardFilled } from "react-icons/tb";

const Sidebar = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    localStorage.removeItem('lastActiveCustomerPage');
    navigate('/login');
  };

  return (
    <aside
      className={` ${
        props.sidebarOpen ? "w-60" : "w-20"
      } bg-[#1f2937] text-white box-border fixed mt-17 h-screen z-50`}
    >
      <div className=" text-center mt-5">
        <button
          className={` ${
            props.sidebarOpen ? "px-23" : "px-5"
          } text-center py-3 cursor-pointer rounded bg-yellow-500 hover:bg-yellow-600  transition duration-500 hover:shadow-lg`}
          onClick={() => props.setSidebarOpen((state) => !state)}
        >
          {props.sidebarOpen ? 
          <IoChevronBackOutline />:<IoChevronForward />}
        </button>
      </div>

      {/* navigation */}
      <ul className="mt-6">
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard");
            if (props.setRenderPage) props.setRenderPage("");
          }}
        >
          <TbLayoutDashboardFilled className=" inline mb-1 me-1" />
          {props.sidebarOpen ? "Dashboard" : ""}
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer flex justify-between items-center"
          onClick={() => {
            navigate("/customer-dashboard/wallet");
            if (props.setRenderPage) props.setRenderPage("wallet");
          }}
        >
          <div>
            <GiWallet className=" inline mb-1 me-1" />
            {props.sidebarOpen ? "Wallet" : ""}
          </div>
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard/place_order");
            if (props.setRenderPage) props.setRenderPage("place_order");
          }}
        >
          <MdOutlineAdd className=" inline mb-1 me-1" />
          {props.sidebarOpen ? "Place Order" : ""}
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard/order_history");
            if (props.setRenderPage) props.setRenderPage("order_history");
          }}
        >
          <MdOutlineHistory className=" inline mb-1 me-1" />{" "}
          {props.sidebarOpen ? "Order History" : ""}
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard/tracking_status");
            if (props.setRenderPage) props.setRenderPage("tracking_status");
          }}
        >
          <ImLocation2 className=" inline mb-1 me-1" />
          {props.sidebarOpen ? "Track Order" : ""}
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard/place_manager");
            if (props.setRenderPage) props.setRenderPage("place_manager");
          }}
        >
          <FaMapLocationDot className=" inline mb-1 me-1" />
          {props.sidebarOpen ? "Place Manager" : ""}
        </li>
        <li
          className=" ps-5 my-2 hover:bg-yellow-600 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={() => {
            navigate("/customer-dashboard/support");
            if (props.setRenderPage) props.setRenderPage("support");
          }}
        >
          <BiSupport className=" inline mb-1 me-1" />
          {props.sidebarOpen ? "Support" : ""}
        </li>
        <li 
          className=" ps-5 my-2 hover:bg-red-400 mx-4 py-1.5 rounded hover:scale-105 transition duration-300 shadow-gray-600 cursor-pointer"
          onClick={handleLogout}
        >
          <CgLogOut className=" inline mb-1 me-1" />{" "}
          {props.sidebarOpen ? "Logout" : ""}
        </li>
      </ul>

      {props.sidebarOpen ? (
        <div className=" absolute bottom-20">
          <hr className=" w-50 ms-4 text-blue-800 shadow-blue-400 shadow-lg" />
          <div className=" ms-4  mt-3 text-[12px] text-blue-300">
            Flotza Pro v1.0
          </div>
          <div className=" ms-4 text-[12px] text-blue-300">
            &copy; 2025 All Right Reserved.
          </div>
        </div>
      ) : (
        ""
      )}
    </aside>
  );
};

export default Sidebar;