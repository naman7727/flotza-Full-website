const pool = require('../../config/db');

class DcManagerGetClosingTime {
  /**
   * Get DC max_order_time for a given shipper place_id.
   * @param {string} placeId - place_id from place_manager (e.g., "KBW4")
   * @returns {Promise<object|null>}
   */
  static async getClosingTime(placeId) {
    const query = `
      SELECT tw.max_order_time
      FROM place_manager pm
      JOIN dc_manager dc 
        ON pm.connected_hub = dc.branch_name
      JOIN time_windows tw 
        ON dc.branch_id = tw.branch_id
      WHERE pm.place_id = $1
      LIMIT 1;
    `;

    try {
      const result = await pool.query(query, [placeId]);
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error('Error fetching closing time:', error);
      throw error;
    }
  }
}

module.exports = DcManagerGetClosingTime;
