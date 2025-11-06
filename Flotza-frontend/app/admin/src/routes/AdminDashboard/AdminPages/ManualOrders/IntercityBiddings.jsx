import React from 'react';

const IntercityBiddings = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Manual Orders - Intercity Biddings</h2>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600 mb-4">
          Manually create and manage Intercity Bidding orders here.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Section Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Page ID: manual-orders-intercity-biddings</li>
            <li>Section: Manual Orders</li>
            <li>Category: Intercity Biddings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntercityBiddings;
