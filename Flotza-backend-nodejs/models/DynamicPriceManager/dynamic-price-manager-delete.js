const pool = require('../../config/db');

class DynamicPriceManagerDeleteModel {
  static async delete(dynamic_price_id) {
    const query = `
      DELETE FROM sdd_dynamic_pricing 
      WHERE dynamic_price_id = $1 
      RETURNING *
    `;

    try {
      const client = await pool.connect();
      const result = await client.query(query, [dynamic_price_id]);
      client.release();
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DynamicPriceManagerDeleteModel;