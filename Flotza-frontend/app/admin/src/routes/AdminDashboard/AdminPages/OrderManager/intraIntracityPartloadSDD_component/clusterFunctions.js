const clusterTrips = (orders, startPoint) => {
  const visited = [];
  let current = startPoint;
  let remaining = [...orders];

  while (remaining.length > 0) {
    let closestIdx = 0;
    let closestDist = Infinity;

    remaining.forEach((order, idx) => {
      const dist = Math.sqrt(
        Math.pow(current.lat - order.consigneeLatitude, 2) +
        Math.pow(current.lng - order.consigneeLongitude, 2)
      );
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    current = {
      lat: remaining[closestIdx].consigneeLatitude,
      lng: remaining[closestIdx].consigneeLongitude,
    };
    visited.push(remaining[closestIdx]);
    remaining.splice(closestIdx, 1);
  }

  return visited;
};
