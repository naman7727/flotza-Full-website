// useTripClustering.js
import { useMemo } from "react";
import { clusterOrdersByProximity } from "./clusterUtils";

/**
 * Clusters orders for each hub separately based on driver counts.
 * Always generates at least 1 trip per hub.
 *
 * @param {Array} orders - All orders (not filtered)
 * @param {Object} driverCounts - e.g., { Andheri: 2, Vashi: 1 }
 * @returns {Object} { hubName: [trip1, trip2, ...] }
 */
export default function useTripClustering(orders, driverCounts) {
  return useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return {};

    const clusteredTripsByHub = {};

    // Get unique hubs from order data
    const hubs = [...new Set(orders.map(order => order.hubName))];

    hubs.forEach(hub => {
      const ordersForHub = orders.filter(order => order.hubName === hub);
      const driverCount = driverCounts[hub] || 1;
      clusteredTripsByHub[hub] = clusterOrdersByProximity(ordersForHub, driverCount);
    });

    return clusteredTripsByHub;
  }, [orders, driverCounts]);
}
