// StatusBadge.jsx
import React from "react";

const statusStyles = {
  "New Order": "bg-blue-100 text-blue-800",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Completed": "bg-green-100 text-green-800",
  "Cancelled": "bg-red-100 text-red-800",
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
