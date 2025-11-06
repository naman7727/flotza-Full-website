const pool = require('../../config/db');

class DcManagerGetAll {
  /**
   * Fetch all DC Manager records including JSON range fields.
   * @returns {Promise<Array>} List of DC Manager objects.
   */
  static async getAllDC() {
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
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        branch_id: row.branch_id,
        branch_name: row.branch_name,
        nearest_station: row.nearest_station,
        nearest_bus_stop: row.nearest_bus_stop,
        state: row.state,
        city: row.city,
        pin_code: row.pin_code,
        latitude: row.latitude,
        longitude: row.longitude,
        lat_long: row.lat_long,
        full_address: row.full_address,
        mobile_number: row.mobile_number,
        status: row.status,
        remark: row.remark,
        pick_up_range: row.pick_up_range,
        consignee_up_range: row.consignee_up_range,
        staff_login_range: row.staff_login_range,
        driver_login_range: row.driver_login_range,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Error in getAllDC:', error);
      throw error;
    }
  }

}

module.exports = DcManagerGetAll;
