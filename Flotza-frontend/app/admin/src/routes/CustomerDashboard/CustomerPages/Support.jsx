import React, { useState } from "react";
import Card from "../CustomerDashboardUtils/TicketDetailsCard"

function Support() {
    const [problemType, setProblemType] = useState("");
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <form className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Customer Support</h2>


                <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Related Order ID </label>
                    <input 
                        type="text" 
                        id="orderId" 
                        placeholder="e.g., KB123456" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="problemType" className="block text-sm font-medium text-gray-700">Problem Type</label>
                    <select 
                        id="problemType" 
                        value={problemType} 
                        onChange={(e) => setProblemType(e.target.value)}
                        required 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Please Select --</option>
                        <option>Delayed Delivery</option>
                        <option>Damaged Goods</option>
                        <option>Wrong Shipment</option>
                        <option>Payment Issue</option>
                        <option>Tracking Not Updating</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {problemType === "Other" && (
                    <div>
                        <label htmlFor="otherProblem" className="block text-sm font-medium text-gray-700">Please describe Category</label>
                        <input 
                            type="text" 
                            id="otherProblem" 
                            placeholder="Please describe Category" 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}



                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea 
                        id="message" 
                        placeholder="Describe your concern" 
                        required 
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                    Raise Ticket
                </button>
            </form>

            <div className="w-full bg-gray-100 flec items-center justify-center p-6 mt-6">

                <span><h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Ticket History</h2></span>
                <Card 
                // ticket_id,category ,description,status
                    ticket_id="TKT1021"
                    order_id="ORD0021"
                    category="Order Issue"
                    description="Pickup was delayed by 3 hours"
                    status="Open"
                />
                <Card 
                // ticket_id,category ,description,status
                    ticket_id="TKT10042"
                    order_id="ORD0042"
                    category="Payment dispute"
                    description="Rs 500 not credited to wallet"
                    status="In progress"
                />
                <Card 
                // ticket_id,category ,description,status
                    ticket_id="TKT1091"
                    order_id="ORD0091"
                    category="Vehicle Issue"
                    description="Goods arrive damaged"
                    status="Resolved"
                />

                
            </div>
            
            
        </div>

        
    );
}

export default Support;
