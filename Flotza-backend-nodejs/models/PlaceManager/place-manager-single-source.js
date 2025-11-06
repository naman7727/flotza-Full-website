const pool = require('../../config/db');

class PlaceManagerSingleSourceModel {
  static async getPlacesBySource(place_source) {
    const query = `
      SELECT *
      FROM place_manager
      WHERE place_source = $1
      ORDER BY created_at DESC
    `;
    const values = [place_source];

    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PlaceManagerSingleSourceModel;
