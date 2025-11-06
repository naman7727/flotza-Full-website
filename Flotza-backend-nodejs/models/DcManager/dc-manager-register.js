const pool = require('../../config/db');

class DcManagerRegister {
  // Function to generate a unique branch_id like KBDC1, KBDC2, etc.
  static async generateBranchId(client) {
    const prefix = 'KBDC';

    const query = `
      SELECT branch_id
      FROM dc_manager
      WHERE branch_id LIKE $1
      ORDER BY CAST(SUBSTRING(branch_id FROM LENGTH($2) + 1) AS INTEGER) DESC
      LIMIT 1
    `;

    const result = await client.query(query, [`${prefix}%`, prefix]);

    if (result.rows.length === 0) {
      return `${prefix}1`;
    }

    const lastId = result.rows[0].branch_id;
    const numberPart = parseInt(lastId.replace(prefix, ''), 10);

    if (isNaN(numberPart)) {
      throw new Error(`Invalid branch_id format found in database: ${lastId}`);
    }

    return `${prefix}${numberPart + 1}`;
  }

  // Function to create a new DC Manager entry
  static async createDc(dcData) {
    const {
      branch_name,
      nearest_station,
      nearest_bus_stop,
      state,
      city,
      pin_code,
      latitude,
      longitude,
      full_address,
      mobile_number,
      status = 'Active',  // Default if not provided
      remark
    } = dcData;

    const client = await pool.connect();

    try {
      // Generate a unique branch_id
      const branch_id = await this.generateBranchId(client);

      const query = `
        INSERT INTO dc_manager (
          branch_id,
          branch_name,
          nearest_station,
          nearest_bus_stop,
          state,
          city,
          pin_code,
          latitude,
          longitude,
          full_address,
          mobile_number,
          status,
          remark
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13
        ) RETURNING *;
      `;

      const values = [
        branch_id,
        branch_name,
        nearest_station,
        nearest_bus_stop,
        state,
        city,
        pin_code,
        latitude,
        longitude,
        full_address,
        mobile_number,
        status,
        remark
      ];

      const result = await client.query(query, values);
      return result.rows[0];

    } catch (error) {
      console.error('Error in createDcManager:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DcManagerRegister;
