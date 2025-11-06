const pool = require('../../config/db');

class DcManagerDelete {
  /**
   * Delete a DC Manager by branch_id.
   * @param {string} branch_id - Identifier of DC to delete.
   * @returns {Promise<Object>} Deleted DC Manager record.
   */
  static async deleteDc(branch_id) {
    const query = `
      DELETE FROM dc_manager
      WHERE branch_id = $1
      RETURNING *
    `;
    try {
      const result = await pool.query(query, [branch_id]);
      if (!result.rows.length) throw new Error(`DC Manager '${branch_id}' not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error in deleteDc:', error);
      throw error;
    }
  }
}

module.exports = DcManagerDelete;
