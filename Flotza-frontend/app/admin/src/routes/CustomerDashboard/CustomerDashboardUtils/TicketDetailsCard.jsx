import React from 'react';

const Card = ({ ticket_id, order_id, category, description, status }) => {

    const getSatusClasses = (status) =>{
        switch (status) {
            case 'Open':
                return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
            case 'Resolved':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'In progress':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    }
    return (
        <div className="w-full mb-2 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition hover:shadow-xl">
            {/* Ticket and Order Info Row */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                    Ticket: {ticket_id}
                </h2>
                <span className="text-sm text-gray-500">Order ID: {order_id}</span>
            </div>

            {/* Category */}
            <div className="mb-2">
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Category:</span> {category}
                </p>
            </div>

            {/* Description */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Description:</span> {description}
                </p>
            </div>

            {/* Status Button aligned right */}
            <div className="flex justify-end">
                <button className={`px-4 py-1.5 text-sm font-semibold rounded-full transition ${getSatusClasses(status)}`}>
                    {status}
                </button>
            </div>
        </div>


    );

};

export default Card;