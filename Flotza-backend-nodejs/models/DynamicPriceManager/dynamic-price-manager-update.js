const pool = require('../../config/db');

class DynamicPriceManagerUpdateModel {
  static async update(dynamic_price_id, status, status_remark) {
    const query = `
      UPDATE sdd_dynamic_pricing 
      SET status = $1, status_remark = $2, updated_date_time = CURRENT_TIMESTAMP
      WHERE dynamic_price_id = $3 
      RETURNING *
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [status, status_remark, dynamic_price_id]);
      if (result.rows.length === 0) {
        throw new Error(`No dynamic price found with ID ${dynamic_price_id}`);
      }
      return result.rows[0];
    } catch (error) {
      console.error('UpdateModel Error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DynamicPriceManagerUpdateModel;
