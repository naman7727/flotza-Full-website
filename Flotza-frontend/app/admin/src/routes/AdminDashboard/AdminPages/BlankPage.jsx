import React from 'react';

const BlankPage = ({ pageId }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {pageId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h2>
      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-gray-600 mb-4">
          This is a blank page for {pageId}
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Page Information</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Page ID: {pageId}</li>
            <li>Path: {`/admin/${pageId}`}</li>
            <li>Created: {new Date().toLocaleDateString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlankPage;
