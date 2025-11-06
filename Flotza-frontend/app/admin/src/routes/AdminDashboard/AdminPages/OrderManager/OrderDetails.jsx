import React, { useState } from 'react';

const OrderDetails = () => {
  const Detail = ({ label, value, bold }) => (
    <div className="flex justify-between border-b-1 py-1">
      <span className="font-semibold text-gray-500">{label}</span>
      <span className={bold ? "font-bold text-gray-500":"text-gray-800"}>{value}</span>
    </div>
  );
  const [orderId, setOrderId] = useState('');

  const handleSearch = () => {
    if (orderId.trim()) {
      alert(`Searching for Order ID: ${orderId}`);
    } else {
      alert('Please enter an Order ID.');
    }
  };

  const handleDownload = () => {
    alert('Downloading Invoice...');
  };

  const handlePush = () => {
    alert('Invoice pushed to accounting system!');
  };

  
  return (
    <div className="py-5 bg-gray-200">
      <h2 className="text-center mb-4 text-3xl font-semibold">Order Management System</h2>

      <div className="text-center mb-4">
        <input
          type="text"
          className="form-control d-inline-block w-170 border-1 rounded mb-3"
          placeholder="Enter Order ID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button className="bg-blue-600 py-2 px-2 text-white rounded ms-2" onClick={handleSearch}>
          Search Order
        </button>
      </div>

      <div className="mb-5  ms-60 ">
        <a href="admin_dashboard.html" className=" bg-blue-500 py-2 px-2 text-white rounded">Go to Dashboard</a>
        <a href="tms.html" className="ms-3 bg-blue-500 py-2 px-2 text-white rounded ">Go to TMS</a>
        <a href="order_manager.html" className="ms-3 bg-blue-500 py-2 px-2 text-white rounded">Order Manager</a>
        <a href="order_directory.html" className="ms-3 bg-blue-500 py-2 px-2 text-white rounded">Order Directory</a>
      </div>

      <div className="order-summary bg-white p-5  rounded-2xl  mx-auto" style={{ maxWidth: '800px' }}>
        <h4 className="bg-blue-500 text-lg text-white mb-5 text-center p-2 rounded">Order Details</h4>

        <Section title="Order Information" >
          <Detail label="Order ID:" value="KB1"/>
          <Detail label="User ID:" value="KBU1001" />
          <Detail label="Account User:" value="GM Fabrics" />
          <Detail label="Order Date:" value="2025-02-22" />
        </Section>

        <Section title="Shipper Details">
          <Detail label="Shipper Name:" value="Shipper1" />
          <Detail label="Shipper Address:" value="123, Business Street, Mumbai" />
          <Detail label="Shipper Contact:" value="9876543210" />
          <Detail label="Pick-up Time Range:" value="09:30 to 10:30" />
          <Detail label="Pick-up Note:" value="Ensure package is sealed properly" />
          <Detail label="Pick-up Status:" value={<strong>Completed</strong>} />
          <ProofImages images={['proof_pickup1.jpg', 'proof_pickup2.jpg', 'proof_pickup3.jpg']} />
        </Section>

        <Section title="Consignee Details">
          <Detail label="Consignee Name:" value="Consignee1" />
          <Detail label="Consignee Address:" value="456, Industrial Road, Delhi" />
          <Detail label="Consignee Contact:" value="7777777777" />
          <Detail label="Drop Time Range:" value="14:00 to 15:00" />
          <Detail label="Drop Note:" value="Verify receiver identity" />
          <Detail label="Delivery Type:" value="Express Delivery" />
          <Detail label="Delivery Status:" value={<strong>Delivered</strong>} />
          <ProofImages images={['proof_delivery1.jpg', 'proof_delivery2.jpg', 'proof_delivery3.jpg']} />
        </Section>

        <Section title="Shipment Summary">
          <Detail label="Commodity:" value="Machine Parts" />
          <Detail label="Total Units:" value="50" />
          <Detail label="Gross Weight:" value="25 kg" />
          <Detail label="Rate/KG:" value="$10" />
          <Detail label="Chargeable Weight:" value="30 kg" />
          <Detail label="Net Charges:" value="$300" />
          <Detail label="Express Surcharges (20%):" value="$60" />
          <Detail label="Pre-Tax Amount:" value="$360" />
          <Detail label="GST (18%):" value="$65" />
          <Detail label="Final Payable:" value="$425" />
        </Section>

        <Section title="Order History">
          <table className="w-full text-sm text-left text-gray-500 border border-gray-300 ">
            <thead className='bg-blue-100'>
              <tr>
                <th className='px-4 py-2 border'>Date</th>
                <th className='px-4 py-2 border'>Time</th>
                <th className='px-4 py-2 border'>Activity</th>
                <th className='px-4 py-2 border'>Activity By</th>
              </tr>
            </thead>
            <tbody>
              <tr className='hover:bg-gray-200'>
                <td className='px-4 py-2 border'>17-Feb-25</td>
                <td className='px-4 py-2 border'>18:46:35</td>
                <td className='px-4 py-2 border'>Order punched for 18-Feb-25</td>
                <td className='px-4 py-2 border'>Customer Name (KBU250)</td>
              </tr>
              <tr className='hover:bg-gray-200'>
                <td className='px-4 py-2 border'>18-Feb-25</td>
                <td className='px-4 py-2 border'>09:30:20</td>
                <td className='px-4 py-2 border'>Order moved to trip KBT345</td>
                <td className='px-4 py-2 border'>Admin Name (KBA003)</td>
              </tr>
              <tr className='hover:bg-gray-200'>
                <td className='px-4 py-2 border'>18-Feb-25</td>
                <td className='px-4 py-2 border'>11:40:54</td>
                <td className='px-4 py-2 border'>Order picked up marked</td>
                <td className='px-4 py-2 border'>Driver Name (KBD7)</td>
              </tr>
              <tr className='hover:bg-gray-200'>
                <td className='px-4 py-2 border'>18-Feb-25</td>
                <td className='px-4 py-2 border'>16:25:47</td>
                <td className='px-4 py-2 border'>Order delivered marked</td>
                <td className='px-4 py-2 border'>Driver Name (KBD7)</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <div className="text-center">
          <button className="bg-green-500 px-5 py-2 text-white rounded me-5" onClick={handleDownload}>Download Invoice</button>
          <button className="bg-yellow-500 px-5 py-2 text-black rounded" onClick={handlePush}>Push Invoice</button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-4">
    <div className="font-bold">{title}</div>
    {children}
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex">
    <span className="font-bold text-gray-600">{label}</span>
    <span>{value}</span>
  </div>
);

const ProofImages = ({ images }) => (
  <div className="flex">
    {images.map((img, idx) => (
      <img
        key={idx}
        src={img}
        alt={`Proof ${idx + 1}`}/>
    ))}
  </div>
);

export default OrderDetails;