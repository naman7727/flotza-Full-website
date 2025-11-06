import React from 'react';

const IntercityFullload = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Trip Manager - Intercity Fullload</h2>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600 mb-4">
          Manage trips for Intercity Fullload services here.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Section Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Page ID: trip-manager-intercity-fullload</li>
            <li>Section: Trip Manager</li>
            <li>Category: Intercity - Fullload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntercityFullload;
