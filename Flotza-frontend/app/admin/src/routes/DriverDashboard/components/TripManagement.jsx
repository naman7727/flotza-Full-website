import React from 'react';
import { FiPackage } from 'react-icons/fi';

const TripManagement = ({ tripData, pickedUpTrips, setPickedUpTrips, setActiveDeliveryCount, setCompletedDeliveries }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
        <div className="flex items-center">
          <FiPackage className="mr-2" />
          Driver Trip Management
        </div>
      </h3>

      <div className="mb-4">
        <span className="font-semibold">Trip ID:</span> {tripData.id}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pick-up Sequence</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pick-up Address</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pick-up Contact</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Sequence</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Address</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Drop Contact</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="py-2 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tripData.trips.map((trip, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-2 px-4 border-b border-gray-200">{trip.orderId}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.pickupSequence}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.pickupAddress}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.pickupContact}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.deliverySequence}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.deliveryAddress}</td>
                <td className="py-2 px-4 border-b border-gray-200">{trip.dropContact}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {trip.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
                      onClick={() => alert(`Viewing order details for ${trip.orderId}`)}
                    >
                      View Order
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
                      onClick={() => alert(`Opening map to pickup location: ${trip.pickupAddress}`)}
                    >
                      Locate Pickup
                    </button>
                    <button
                      className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded"
                      onClick={() => alert(`Opening map to drop location: ${trip.deliveryAddress}`)}
                    >
                      Locate Drop
                    </button>

                    {pickedUpTrips.includes(trip.orderId) ? (
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded"
                        onClick={() => {
                          if (confirm(`Confirm: Mark order ${trip.orderId} as delivered?`)) {
                            // In a real app, make API call to update delivery status
                            alert(`Order ${trip.orderId} marked as delivered successfully!`);

                            // Update state to move order to completed deliveries
                            setPickedUpTrips(prev => prev.filter(id => id !== trip.orderId));
                            setActiveDeliveryCount(prev => prev - 1);

                            // Add to completed deliveries
                            const newDelivery = {
                              id: trip.orderId,
                              date: new Date().toISOString().split('T')[0],
                              tripId: tripData.id,
                              pickupAddress: trip.pickupAddress,
                              dropAddress: trip.deliveryAddress,
                              totalOrders: 1,
                              status: "Completed"
                            };

                            setCompletedDeliveries(prev => [newDelivery, ...prev]);
                          }
                        }}
                      >
                        Mark Delivered
                      </button>
                    ) : (
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded"
                        onClick={() => {
                          if (confirm(`Confirm: Mark order ${trip.orderId} as picked up?`)) {
                            // In a real app, make API call to update pickup status
                            alert(`Order ${trip.orderId} marked as picked up successfully!`);
                            
                            // Add to picked up trips
                            setPickedUpTrips(prev => [...prev, trip.orderId]);
                            setActiveDeliveryCount(prev => prev + 1);
                          }
                        }}
                      >
                        Mark Picked Up
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripManagement;
