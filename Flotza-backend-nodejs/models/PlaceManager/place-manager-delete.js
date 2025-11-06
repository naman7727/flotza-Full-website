const pool = require('../../config/db');

class PlaceManagerDelete {
  /**
   * Delete a place by place_id and return the deleted row.
   * @param {string} place_id - The ID of the place to delete.
   * @returns {object|null} - The deleted place data, or null if no matching record was found.
   */
  static async deletePlaceById(place_id) {
    const query = ` 
      DELETE FROM place_manager
      WHERE place_id = $1
      RETURNING *
    `;
    const values = [place_id];

    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();

      // If no rows were deleted, return null
      if (result.rows.length === 0) {
        return null;
      }
      // Return the deleted place data
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PlaceManagerDelete;
