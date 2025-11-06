// kartbuddy-frontend-v3/app/admin/src/routes/AdminDashboard/AdminPages/OrderManager/intraIntracityPartloadSDD_component/tripGenerator.js

export const clusterTrips = (orders = [], driverCount = 1, hubCoordinates = {}) => {
  if (orders.length === 0) return [];

  const drivers = Math.max(driverCount, 1);
  const ordersWithDistance = orders.map(order => {
    const hub = order.sourceHub;
    const hubCoord = hubCoordinates[hub];

    if (!hubCoord) return { ...order, distanceFromHub: Infinity };

    const dx = hubCoord.lat - order.consigneeLatitude;
    const dy = hubCoord.lng - order.consigneeLongitude;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return { ...order, distanceFromHub: distance };
  });

  ordersWithDistance.sort((a, b) => a.distanceFromHub - b.distanceFromHub);

  const trips = Array.from({ length: drivers }, () => []);
  ordersWithDistance.forEach((order, i) => {
    trips[i % drivers].push(order);
  });

  return trips;
};
