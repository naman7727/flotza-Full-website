import { useState } from "react";

const ModifyTripModal = ({ trip, onSave, onClose }) => {
  const [tripName, setTripName] = useState(trip.name);
  const [driver, setDriver] = useState(trip.driver === '—' ? '' : trip.driver);
  const [isTripNameEditable, setIsTripNameEditable] = useState(false);
  const [isDriverEditable, setIsDriverEditable] = useState(false);

  const handleSubmit = () => {
    onSave(tripName, driver);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Modify Trip</h3>
      <div className="mb-4">
        <input
          type="text"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          readOnly={!isTripNameEditable}
          className={`w-full p-2 border rounded ${
            isTripNameEditable ? '' : 'bg-gray-100'
          }`}
        />
        <button
          onClick={() => setIsTripNameEditable(true)}
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-2"
        >
          Edit
        </button>
      </div>
      <div className="mb-4">
        <select
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
          disabled={!isDriverEditable}
          className={`w-full p-2 border rounded ${
            isDriverEditable ? '' : 'bg-gray-100'
          }`}
        >
          <option value="">No driver yet</option>
          <option value="John Doe">John Doe</option>
          <option value="Jane Smith">Jane Smith</option>
          <option value="Robert Johnson">Robert Johnson</option>
          <option value="Emily Davis">Emily Davis</option>
        </select>
        <button
          onClick={() => setIsDriverEditable(true)}
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-2"
        >
          Change Driver
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save
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


export default ModifyTripModal;