import React from 'react';

const PerformanceManagement = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">HR Portal - Performance Management</h2>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600 mb-4">
          Track employee performance, conduct reviews, and manage appraisal processes here.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Section Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Page ID: hr-portal-performance-management</li>
            <li>Section: HR Portal</li>
            <li>Category: Performance Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceManagement;
