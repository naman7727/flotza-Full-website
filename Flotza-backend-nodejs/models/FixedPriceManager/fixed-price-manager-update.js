const pool = require('../../config/db');

class FixedPriceManagerUpdateModel {
    
  static async update(dimension_id, dimension_name, length, breadth, height, weight, dimension_charge) {
    const query = `
      UPDATE sdd_fixed_pricing 
        SET dimension_name = $1, length = $2, breadth = $3, height = $4, weight = $5, dimension_charge = $6, updated_date_time = CURRENT_TIMESTAMP
        WHERE dimension_id = $7
        RETURNING *
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query, [dimension_name, length, breadth, height, weight, dimension_charge, dimension_id]);
      if (result.rows.length === 0) {
        throw new Error(`No dimension found with ID ${dimension_id}`);
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

module.exports = FixedPriceManagerUpdateModel;