const pool = require('../../config/db');

class DynamicPriceManagerModel {
  static async getAll() {
    const query = `
      SELECT *
      FROM sdd_dynamic_pricing
      ORDER BY dynamic_price_id ASC
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

  static async getactive() {
    const query = `
      SELECT *
      FROM sdd_dynamic_pricing
      WHERE status = 'active'
      limit 1
      `;
      try {
        const client = await pool.connect();
        const result = await client.query(query);
        client.release(); 
        return result.rows [0] || null;
      } catch (error) {
        throw error;
      }
  }
}

module.exports = DynamicPriceManagerModel;