import React from 'react';

const Analytics = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Finance - Analytics and Reports</h2>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600 mb-4">
          Generate and analyze financial reports, trends, and key performance indicators here.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Section Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Page ID: finance-analytics</li>
            <li>Section: Finance</li>
            <li>Category: Analytics and Reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
