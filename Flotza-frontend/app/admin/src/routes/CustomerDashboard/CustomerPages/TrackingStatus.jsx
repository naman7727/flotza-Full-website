import React from "react";

const steps = [
  { id: 1, name: "Order Generated", status: "complete" },
  { id: 2, name: "Order Accepted", status: "complete" },
  { id: 3, name: "Driver Assigned", status: "current" },
  { id: 4, name: "Out for Pickup", status: "upcoming" },
  { id: 5, name: "Order Picked", status: "upcoming" },
  { id: 6, name: "Out for Delivery", status: "upcoming" },
  { id: 7, name: "Delivered", status: "upcoming" },
];
// const steps = [

//   { id: 1, name: "Order Accepted", status: "complete" },
//   { id: 2, name: "Driver Assigned", status: "current" },
//   { id: 3, name: "Out for Pickup", status: "upcoming" },
//   { id: 4, name: "Order Picked", status: "upcoming" },
//   { id: 5, name: "Out for Delivery", status: "upcoming" },
//   { id: 6, name: "Delivered", status: "upcoming" },
// ];

const orderInfo = {
  orderId: "ORD123456789",
  status: "Shipped",
  deliveryTime: "2025-05-22 14:30",
  driverName: "John Doe",
  driverId: "DRV98765",
  vehicle: "Van - White Toyota Hiace",
};

export default function TrackingStatus() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Order Tracking</h2>

      {/* Order Info  */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm text-gray-700">
        <div>
          <strong>Order ID:</strong> {orderInfo.orderId}
        </div>
        <div>
          <strong>Status:</strong> {orderInfo.status}
        </div>
        <div>
          <strong>Delivery Time:</strong> {orderInfo.deliveryTime}
        </div>
        <div>
          <strong>Driver Name:</strong> {orderInfo.driverName}
        </div>
        <div>
          <strong>Driver ID:</strong> {orderInfo.driverId}
        </div>
        <div>
          <strong>Vehicle:</strong> {orderInfo.vehicle}
        </div>
      </div>

      {/* Progress Steps */}
      <ol className="flex items-center justify-between relative">
        {steps.map((step, idx) => (
          <li
            key={step.id}
            className="relative flex-1 flex flex-col items-center"
          >
            {/* Connecting Line - from center to the next step */}
            {idx !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-1 
            ${
              step.status === "complete" || step.status === "current"
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
                style={{
                  transform: "translateX(0%)",
                  zIndex: 0,
                  right: "-50%",
                }}
              />
            )}

            {/* Step Circle */}
            <div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center z-10
          ${
            step.status === "complete"
              ? "bg-green-500 text-white"
              : step.status === "current"
              ? "border-2 border-green-500 text-green-500 bg-white"
              : "border-2 border-gray-300 text-gray-400 bg-white"
          }`}
            >
              {step.id}
            </div>

            {/* Step Name BELOW the circle */}
            <span className="mt-2 text-sm font-medium text-center">
              {step.name}
            </span>
          </li>
        ))}
      </ol>

      {/* Live Location Map Placeholder */}
      <div className="border rounded-lg overflow-hidden h-64 mt-5">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15081.137089278081!2d72.85448134746875!3d19.095181063810642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c85099bd2947%3A0x1ecc1a60c474a8ae!2sChhatrapati%20Shivaji%20Maharaj%20International%20Airport%20Mumbai!5e0!3m2!1sen!2sin!4v1747741840593!5m2!1sen!2sin"
            width="100%"
            height="250"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
