import { useState } from "react";

const TripDetailsModal = ({
  trip,
  tripDetailsData,
  setTripDetailsData,
  onAction,
  onClose,
  setRenderPage, // Add setRenderPage prop for in-app navigation
}) => {
  const [editPickUpSequence, setEditPickUpSequence] = useState(false);
  const [editDeliverySequence, setEditDeliverySequence] = useState(false);

  const toggleColumnEdit = (column) => {
    const values = new Set();
    let isValid = true;

    if (column === "pickUpSequence") {
      if (editPickUpSequence) {
        tripDetailsData.forEach((row) => {
          const value = row.pickUpSequence.toString().trim();
          if (values.has(value) || isNaN(value) || value === "") {
            isValid = false;
            alert(
              "Invalid or duplicate sequence numbers detected. Please ensure unique numerical values."
            );
          }
          values.add(value);
        });
        if (isValid) {
          setEditPickUpSequence(false);
          setTripDetailsData([...tripDetailsData]);
        }
      } else {
        setEditPickUpSequence(true);
      }
    } else {
      if (editDeliverySequence) {
        tripDetailsData.forEach((row) => {
          const value = row.deliverySequence.toString().trim();
          if (values.has(value) || isNaN(value) || value === "") {
            isValid = false;
            alert(
              "Invalid or duplicate sequence numbers detected. Please ensure unique numerical values."
            );
          }
          values.add(value);
        });
        if (isValid) {
          setEditDeliverySequence(false);
          setTripDetailsData([...tripDetailsData]);
        }
      } else {
        setEditDeliverySequence(true);
 Володин
      }
    }
  };

  const sortTable = (columnIndex) => {
    const sortedData = [...tripDetailsData].sort((a, b) => {
      const keys = [
        "srNo",
        "orderId",
        "pickUpSequence",
        "pickUpAddress",
        "pickUpContact",
        "pop",
        "deliverySequence",
        "deliveryAddress",
        "deliveryContact",
        "pod",
      ];
      const key = keys[columnIndex];
      return a[key].toString().localeCompare(b[key].toString());
    });
    setTripDetailsData(sortedData.map((row, i) => ({ ...row, srNo: i + 1 })));
  };

  const handleSequenceChange = (index, field, value) => {
    const updatedData = [...tripDetailsData];
    updatedData[index][field] = value;
    setTripDetailsData(updatedData);
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-8xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Trip Details (ID: {trip.id})</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Select Map View</label>
            <select className="w-full p-2 border rounded mt-1 sm:w-64">
              <option value="pickup">Pickup Spots</option>
              <option value="drop">Drop Spots</option>
            </select>
          </div>
          <div className="w-full h-48 border mb-4">
            <p className="text-center pt-20">Map Placeholder (API Key Required)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(0)}>
                    Sr. No <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(1)}>
                    Order ID <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2">
                    Pick-up Sequence{" "}
                    <button
                      onClick={() => toggleColumnEdit("pickUpSequence")}
                      className={`px-2 py-1 rounded ${
                        editPickUpSequence ? "bg-green-500" : "bg-blue-500"
                      } text-white text-xs`}
                    >
                      {editPickUpSequence ? "Confirm" : "Edit"}
                    </button>
                    <button
                      onClick={() => sortTable(2)}
                      className="px-2 py-1 bg-blue-500 text-white rounded ml-1 text-xs"
                    >
                      Sort
                    </button>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(3)}>
                    Pick-up Address <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(4)}>
                    Contact Number <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(5)}>
                    POP <span className="ml-1">⇅</span>
                  </th>
                  <th className="border pとは
                    p-2">
                    Delivery Sequence{" "}
                    <button
                      onClick={() => toggleColumnEdit("deliverySequence")}
                      className={`px-2 py-1 rounded ${
                        editDeliverySequence ? "bg-green-500" : "bg-blue-500"
                      } text-white text-xs`}
                    >
                      {editDeliverySequence ? "Confirm" : "Edit"}
                    </button>
                    <button
                      onClick={() => sortTable(6)}
                      className="px-2 py-1 bg-blue-500 text-white rounded ml-1 text-xs"
                    >
                      Sort
                    </button>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(7)}>
                    Delivery Address <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(8)}>
                    Contact Number <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2 cursor-pointer" onClick={() => sortTable(9)}>
                    POD <span className="ml-1">⇅</span>
                  </th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {tripDetailsData.map((row, index) => (
                  <tr key={index}>
                    <td className="border p-2">{row.srNo}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => setRenderPage("OMS")}
                        className="text-blue-500 hover:underline"
                      >
                        {row.orderId}
                      </button>
                    </td>
                    <td
                      className={`border p-2 ${editPickUpSequence ? "bg-gray-100" : ""}`}
                      contentEditable={editPickUpSequence}
                      onBlur={(e) =>
                        handleSequenceChange(index, "pickUpSequence", e.target.textContent)
                      }
                    >
                      {row.pickUpSequence}
                    </td>
                    <td className="border p-2">{row.pickUpAddress}</td>
                    <td className="border p-2">{row.pickUpContact}</td>
                    <td className="border p-2">{row.pop}</td>
                    <td
                      className={`border p-2 ${editDeliverySequence ? "bg-gray-100" : ""}`}
                      contentEditable={editDeliverySequence}
                      onBlur={(e) =>
                        handleSequenceChange(index, "deliverySequence", e.target.textContent)
                      }
                    >
                      {row.deliverySequence}
                    </td>
                    <td className="border p-2">{row.deliveryAddress}</td>
                    <td className="border p-2">{row.deliveryContact}</td>
                    <td className="border p-2">{row.pod}</td>
                    <td className="border p-2">
                      <select
                        onChange={(e) => onAction(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option disabled selected>
                          Select Action
                        </option>
                        <option>Change hub</option>
                        <option>Move to trip</option>
                        <option>Mark cancelled</option>
                        <option>Retrieve</option>
                        <option>Reschedule</option>
                        <option>Mark delivered</option>
                        <option>Reject</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;