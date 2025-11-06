const pool = require('../../config/db');

class OdLimitUpdateModel {
  static async updateODLimit(customer_id, od_limit) {
    try {
      const client = await pool.connect();

      // Fetch current access_given_time and od_limit
      const existing = await client.query(
        `SELECT od_limit, access_given_time FROM od_limit_manager WHERE customer_id = $1`,
        [customer_id]
      );

      if (existing.rows.length === 0) {
        client.release();
        return { notFound: true };
      }

      const prevLimit = existing.rows[0].od_limit;
      let accessTime = existing.rows[0].access_given_time;

      if (!accessTime && od_limit > 0) {
        accessTime = new Date();
      }

      const update = await client.query(
        `
        UPDATE od_limit_manager
        SET od_limit = $1, access_given_time = $2, updated_at = NOW()
        WHERE customer_id = $3
        RETURNING *;
        `,
        [od_limit, accessTime, customer_id]
      );

      client.release();
      return update.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OdLimitUpdateModel;
