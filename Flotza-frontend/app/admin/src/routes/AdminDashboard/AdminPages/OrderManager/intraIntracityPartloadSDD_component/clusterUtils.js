// kartbuddy-frontend-v3/app/admin/src/routes/AdminDashboard/AdminPages/OrderManager/intraIntracityPartloadSDD_component/clusterUtils.js

export function clusterOrdersByProximity(orders = [], driverCount = 1) {
  if (!orders.length) return [];

  const clusters = [];
  const perCluster = Math.ceil(orders.length / driverCount);

  // Sort orders by a simple proximity heuristic (lat + lng)
  const sortedOrders = [...orders].sort((a, b) => {
    const aCoord = a.consigneeLatitude + a.consigneeLongitude;
    const bCoord = b.consigneeLatitude + b.consigneeLongitude;
    return aCoord - bCoord;
  });

  for (let i = 0; i < driverCount; i++) {
    const start = i * perCluster;
    const end = start + perCluster;
    const cluster = sortedOrders.slice(start, end);

    // Generate a route path (array of lat/lng objects)
    const route = cluster.map((order) => ({
      lat: order.consigneeLatitude,
      lng: order.consigneeLongitude,
    }));

    if (route.length > 0) {
      clusters.push({
        tripId: `Trip-${i + 1}`,
        orders: cluster,
        route,
      });
    }
  }

  return clusters;
}
