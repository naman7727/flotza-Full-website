import React, { useState, useEffect } from "react";
import OrderTable from "./intraIntracityPartloadSDD_component/OrderTable";
import OrderMap from "./intraIntracityPartloadSDD_component/OrderMap";
import { useGetAllOrdersQuery, useGetAllDCsQuery } from "../../../../lib/api/apiSlice";

const IntracityPartloadSDD = () => {
  const [selectedHub, setSelectedHub] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Fetch orders and DCs from API
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useGetAllOrdersQuery();
  
  const { 
    data: dcs = [], 
    isLoading: dcsLoading, 
    error: dcsError 
  } = useGetAllDCsQuery();

  // Transform DC data to hub coordinates format
  const hubCoordinates = dcs.reduce((acc, dc) => {
    acc[dc.branch_name] = {
      lat: parseFloat(dc.latitude),
      lng: parseFloat(dc.longitude),
      id: dc.id,
      branch_id: dc.branch_id,
      address: dc.full_address,
      mobile: dc.mobile_number,
      status: dc.status
    };
    return acc;
  }, {});

  // Transform orders data to match component expectations - DO THIS ONLY ONCE
  const transformedOrders = orders.map((order, index) => {
    // Handle nested object access safely
    const customerSnapshot = order.customer_snapshot || {};
    const pickupSnapshot = order.pickup_snapshot || {};
    const dropSnapshot = order.drop_snapshot || {};
    
    return {
      srNo: index + 1,
      orderId: order.order_id,
      tripId: order.trip_id || 'N/A',
      driver: order.driver_name || 'Unassigned',
      scheduledDate: order.schedule_date, // Keep as ISO string, will be formatted in OrderTable
      senderNameNo: `${pickupSnapshot.contact_person || customerSnapshot.full_name || 'N/A'} - ${pickupSnapshot.contact_mobile || customerSnapshot.mobile_number || 'N/A'}`,
      senderAddress: pickupSnapshot.address || 'N/A',
      receiverName: `${dropSnapshot.contact_person || 'N/A'} - ${dropSnapshot.contact_mobile || 'N/A'}`,
      receiverAddress: dropSnapshot.address || 'N/A',
      express: order.express_delivery ? 'Yes' : 'No',
      hub: order.hub,
      currentHub: order.current_hub,
      shipmentPosition: 'In Transit', // You may need to calculate this based on your business logic
      orderStatus: order.order_status,
      pickupLatlong: `${order.pickup_latitude || 0},${order.pickup_longitude || 0}`,
      dropLatlong: `${order.drop_latitude || 0},${order.drop_longitude || 0}`,
      // Additional fields for InfoWindow
      consigneeLatitude: parseFloat(order.drop_latitude || 0),
      consigneeLongitude: parseFloat(order.drop_longitude || 0),
      pickupLatitude: parseFloat(order.pickup_latitude || 0),
      pickupLongitude: parseFloat(order.pickup_longitude || 0),
      customerName: customerSnapshot.full_name,
      customerMobile: customerSnapshot.mobile_number,
      pickupTime: order.preferred_pickup_time,
      codAmount: order.cod_amount,
      totalAmount: order.final_payable,
      commodity: order.commodity?.join(', ') || 'N/A',
      isActive: true
    };
  });
  
  console.log('Transformed orders:', transformedOrders);

  // Handle hub and status selection changes
  const handleHubChange = (hub) => {
    setSelectedHub(hub);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // FIXED: Filter orders for map separately from table
  const filteredOrdersForMap = transformedOrders.filter(order => {
    const matchesHub = !selectedHub || order.currentHub === selectedHub;
    const matchesStatus = !selectedStatus || order.orderStatus?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesHub && matchesStatus;
  });

  // Create consignee points for backward compatibility (if still needed)
  const consigneePoints = filteredOrdersForMap
    .filter(order => order.consigneeLatitude && order.consigneeLongitude)
    .map((order) => ({
      lat: order.consigneeLatitude,
      lng: order.consigneeLongitude,
    }));

  console.log('Filtered orders for map:', filteredOrdersForMap);
  console.log('Filtered orders count for map:', filteredOrdersForMap.length);

  // Loading state
  if (ordersLoading || dcsLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading orders and delivery centers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (ordersError || dcsError) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Error Loading Data</h3>
          <p className="text-gray-600 text-center mb-4">
            {ordersError && `Orders: ${ordersError.message || 'Failed to load orders'}`}
            {ordersError && dcsError && <br />}
            {dcsError && `DCs: ${dcsError.message || 'Failed to load delivery centers'}`}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="mb-4">
        <OrderMap
          consigneePoints={consigneePoints}
          selectedHub={selectedHub}
          selectedStatus={selectedStatus}
          orders={filteredOrdersForMap} // FIXED: Pass already filtered orders to map
          hubCoordinates={hubCoordinates}
        />
      </div>

      <div>
        <OrderTable
          orders={transformedOrders} // Pass ALL transformed orders, let OrderTable do its own filtering
          isFullscreen={false}
          selectedHub={selectedHub}
          selectedStatus={selectedStatus}
          onHubChange={handleHubChange}
          onStatusChange={handleStatusChange}
          dcs={dcs} // Pass DCs for hub filter dropdown
        />
      </div>
    </div>
  );
};

export default IntracityPartloadSDD;