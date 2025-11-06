import React from "react";
//kartbuddy-frontend-v3\app\admin\src\routes\AdminDashboard\AdminPages\OrderManager\intraIntracityPartloadSDD_component\DriverInputPanel.jsx
const DriverInputPanel = ({ driverCounts, setDriverCounts, selectedHub, onClose }) => {
  const hubsToShow = selectedHub ? [selectedHub] : Object.keys(driverCounts);

  const handleInputChange = (hub, value) => {
    const count = parseInt(value, 10);
    setDriverCounts((prev) => ({
      ...prev,
      [hub]: isNaN(count) ? 0 : count,
    }));
  };

  return (
    <div className="bg-white border p-4 rounded shadow mb-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Set Driver Numbers</h3>
        <button onClick={onClose} className="text-sm text-blue-600 hover:underline">
          Close
        </button>
      </div>

      {hubsToShow.map((hub) => (
        <div key={hub} className="flex items-center gap-3 mb-2">
          <label className="w-32 font-medium">{hub}</label>
          <input
            type="number"
            value={driverCounts[hub] || 0}
            onChange={(e) => handleInputChange(hub, e.target.value)}
            className="border px-2 py-1 rounded w-24"
          />
        </div>
      ))}
    </div>
  );
};

export default DriverInputPanel;
