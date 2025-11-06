const pool = require('../../config/db');

// Haversine formula to calculate distance between 2 coordinates
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in KM

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

class DcManagerNearest {
  /**
   * Find nearest DC only if the coordinates fall within a valid range circle.
   * @param {number} lat - User's latitude
   * @param {number} lng - User's longitude
   * @param {string} rangeType - One of: 'pick_up_range', 'consignee_up_range', 'driver_login_range', 'staff_login_range'
   * @returns {object|null} Nearest valid DC or null if outside all ranges
   */
  static async findNearestDC(lat, lng, rangeType = 'pick_up_range') {
    const allowedTypes = [
      'pick_up_range',
      'consignee_up_range',
      'driver_login_range',
      'staff_login_range',
    ];

    if (!allowedTypes.includes(rangeType)) {
      throw new Error(`Invalid range type: ${rangeType}`);
    }

    const query = `
      SELECT id, branch_id, branch_name, ${rangeType}
      FROM dc_manager
      WHERE status = 'Active' AND ${rangeType} IS NOT NULL
    `;

    try {
      const result = await pool.query(query);
      const dcList = result.rows;

      for (const dc of dcList) {
        const ranges = Array.isArray(dc[rangeType]) ? dc[rangeType] : [];

        for (const range of ranges) {
          const { lat: rLat, lng: rLng, radius_km } = range;
          const dist = haversineDistance(lat, lng, rLat, rLng);

          if (dist <= radius_km) {
            return {
              dc_id: dc.branch_id,
              dc_name: dc.branch_name,
              distance_km: parseFloat(dist.toFixed(2)),
            };
          }
        }
      }

      // ❌ No DC found within range
      return null;
    } catch (error) {
      console.error('Error in findNearestDC:', error);
      throw error;
    }
  }
}

module.exports = DcManagerNearest;
