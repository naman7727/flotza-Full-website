// AssignTripModal Component
import { useState } from "react";

const AssignTripModal = ({ tripId, onSave, onClose }) => {
  const [driver, setDriver] = useState('');

  const handleSubmit = () => {
    onSave(driver);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Assign Trip</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium">Trip ID</label>
        <input
          type="text"
          value={tripId}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium">Driver</label>
        <select
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Driver</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          <option value="Robert Brown">Robert Brown</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Assign
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AssignTripModal;