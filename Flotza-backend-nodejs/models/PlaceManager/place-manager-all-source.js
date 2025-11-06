const pool = require('../../config/db');

class PlaceManagerAllSourceModel {
  static async getAllPlaces() {
    const query = `
      SELECT *
      FROM place_manager
      ORDER BY created_at DESC
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

module.exports = PlaceManagerAllSourceModel;
