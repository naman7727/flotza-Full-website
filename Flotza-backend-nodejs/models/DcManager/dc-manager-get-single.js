const pool = require('../../config/db');

class DcManagerGetSingle {
  /**
   * Fetch a single DC Manager record by branch_id.
   * @param {string} branch_id - Unique DC Manager branch identifier
   * @returns {Promise<Object>} DC Manager object
   * @throws Will throw error if not found or query error
   */
  static async getByBranchId(branch_id) {
    const query = `
      SELECT
        id, branch_id, branch_name,
        nearest_station, nearest_bus_stop,
        state, city, pin_code,
        latitude, longitude, lat_long,
        full_address, mobile_number,
        status, remark,
        pick_up_range, consignee_up_range,
        staff_login_range, driver_login_range,
        created_at, updated_at
      FROM dc_manager
      WHERE branch_id = $1
    `;
    try {
      const { rows } = await pool.query(query, [branch_id]);
      if (!rows.length) {
        throw new Error(`DC Manager with branch_id '${branch_id}' not found`);
      }
      return rows[0];
    } catch (error) {
      console.error('Error in getByBranchId:', error);
      throw error;
    }
  }
}

module.exports = DcManagerGetSingle;
