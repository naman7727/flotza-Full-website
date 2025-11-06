const pool = require('../../config/db');

class OdLimitAllModel {
  static async getAllLimits() {
    const query = `
      SELECT *
      FROM od_limit_manager
      ORDER BY customer_id ASC
    `;

    try {
      const client = await pool.connect();
      const result = await client.query(query);
      client.release();
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OdLimitAllModel;
