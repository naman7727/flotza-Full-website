import React from 'react';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const WorkModeSelection = ({ 
  workingMode, 
  setWorkingMode, 
  isActive, 
  setIsActive, 
  setShowTrips, 
  setTripData 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Select Working Mode</h3>
      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-md font-semibold mb-2">Working Mode</div>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md ${workingMode === 'fixed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setWorkingMode('fixed')}
              >
                Fixed
              </button>
              <button
                className={`px-4 py-2 rounded-md ${workingMode === 'rental' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setWorkingMode('rental')}
              >
                Rental
              </button>
            </div>
          </div>
        </div>

        {/* Active Status Toggle */}
        <div>
          <div className="text-md font-semibold mb-2">Status</div>
          <div className="flex items-center">
            <button
              className={`flex items-center px-5 py-2 rounded-md ${isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
              onClick={() => {
                const newStatus = !isActive;
                setIsActive(newStatus);
                if (newStatus) {
                  setShowTrips(true);
                  // Mock trip data - in a real app, this would come from an API call
                  setTripData({
                    id: 'KBT12345',
                    trips: [
                      {
                        orderId: 'KB25',
                        pickupSequence: 1,
                        pickupAddress: 'Sakinaka, Mumbai',
                        pickupContact: '9876543210',
                        deliverySequence: 1,
                        deliveryAddress: 'Borivali Railway Station',
                        dropContact: '9876543222',
                        status: 'Pending'
                      },
                      {
                        orderId: 'KB25',
                        pickupSequence: 1,
                        pickupAddress: 'Sakinaka, Mumbai',
                        pickupContact: '9876543210',
                        deliverySequence: 1,
                        deliveryAddress: 'Borivali Railway Station',
                        dropContact: '9876543222',
                        status: 'Pending'
                      }
                    ]
                  });
                } else {
                  setShowTrips(false);
                }
              }}
            >
              {isActive ?
                <>
                  <FiToggleRight className="mr-2 text-xl" />
                  Active
                </> :
                <>
                  <FiToggleLeft className="mr-2 text-xl" />
                  Inactive
                </>
              }
            </button>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Fixed Mode:</strong> Standard delivery assignments with fixed rates</p>
          <p><strong>Rental Mode:</strong> Hourly or daily assignments with rental rates</p>
        </div>
      </div>
    </div>
  );
};

export default WorkModeSelection;
