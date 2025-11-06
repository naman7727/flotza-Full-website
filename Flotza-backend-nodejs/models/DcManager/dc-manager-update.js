const pool = require('../../config/db');
const crypto = require('crypto');

class DcManagerUpdate {
  /**
   * Update specified fields of a DC Manager (excluding branch_id and created_at).
   * Automatically merges existing and incoming range arrays.
   * @param {string} branch_id - Identifier of DC to update.
   * @param {Object} dcData - Fields to update.
   * @returns {Promise<Object>} Updated DC Manager record.
   */
  static async updateDc(branch_id, dcData) {
    const restricted = ['branch_id', 'id', 'created_at'];

    const client = await pool.connect();
    try {
      // ✅ Step 1: Fetch existing DC Manager
      const existingResult = await client.query('SELECT * FROM dc_manager WHERE branch_id = $1', [branch_id]);
      if (!existingResult.rows.length) {
        throw new Error(`DC Manager '${branch_id}' not found`);
      }
      const existing = existingResult.rows[0];

      // ✅ Step 2: Merge range arrays
      const mergeArrayField = (existing, incoming) => {
        const existingArray = Array.isArray(existing) ? existing : [];
        const incomingArray = Array.isArray(incoming) ? incoming : [];

        const byId = Object.fromEntries(existingArray.map(item => [item.id, item]));

        incomingArray.forEach(item => {
          const id = item.id || crypto.randomUUID();
          byId[id] = { ...byId[id], ...item, id };
        });

        return Object.values(byId);
      };


      ['pick_up_range', 'consignee_up_range', 'staff_login_range', 'driver_login_range'].forEach(field => {
        if (field in dcData) {
          dcData[field] = mergeArrayField(existing[field], dcData[field]);
        }
      });

      // Manually stringify any JSON fields to avoid pg insert error
      ['pick_up_range', 'consignee_up_range', 'staff_login_range', 'driver_login_range'].forEach(field => {
        if (field in dcData && typeof dcData[field] !== 'string') {
          dcData[field] = JSON.stringify(dcData[field]);
        }
      });


      // ✅ Step 3: Filter valid fields to update
      const fields = Object.keys(dcData).filter(k => !restricted.includes(k));
      if (!fields.length) throw new Error('No valid fields provided.');

      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
      const query = `
        UPDATE dc_manager
        SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE branch_id = $${fields.length + 1}
        RETURNING *
      `;
      const values = [...fields.map(f => dcData[f]), branch_id];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateDc:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DcManagerUpdate;
