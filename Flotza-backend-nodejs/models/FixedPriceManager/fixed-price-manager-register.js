const pool = require('../../config/db');

class PriceManager {
  // Auto-generate dimension_id like KBDIM1, KBDIM2
  static async generateDimensionId(client) {
    const prefix = 'KBDIM';

    const query = `
      SELECT dimension_id
      FROM sdd_fixed_pricing
      WHERE dimension_id LIKE $1
      ORDER BY CAST(SUBSTRING(dimension_id FROM LENGTH($2) + 1) AS INTEGER) DESC
      LIMIT 1
    `;

    const result = await client.query(query, [`${prefix}%`, prefix]);

    if (result.rows.length === 0) {
      return `${prefix}1`;
    }

    const lastId = result.rows[0].dimension_id;
    const numberPart = parseInt(lastId.replace(prefix, ''), 10);

    if (isNaN(numberPart)) {
      throw new Error(`Invalid dimension_id format found in database: ${lastId}`);
    }

    return `${prefix}${numberPart + 1}`;
  }

  static async register(data) {
    const {
      customer_id,
      customer_name,
      dimension_name,
      length,
      breadth,
      height,
      weight,
      dimension_charge,
      volumetric_factor,
      chalaan_return_charges,
      express_delivery_percentage,
      gst_percentage,
      cod_range_1,
      cod_charge_1,
      cod_range_2,
      cod_charge_2,
      cod_range_3,
      cod_charge_3,
      cod_range_4,
      cod_charge_4,
      cod_range_5,
      cod_charge_5,
      cod_range_6,
      cod_charge_6,
      status = 'deactive',
      status_remarks
    } = data;

    // ✅ Utility to safely convert empty strings to null
    const sanitizeJSON = (val) => {
      if (val === "" || val === undefined) return null;
      if (typeof val === "string") {
        val = val.trim();
        if (val === "") return null;
        try {
          // Ensure valid JSON string
          JSON.parse(val);
          return val;
        } catch {
          return null;
        }
      }
      return val;
    };

    // ✅ Utility to safely handle charges
    const sanitizeNumber = (val) => {
      if (val === "" || val === undefined || val === null) return null;
      if (!isNaN(val)) return Number(val);
      return null;
    };


    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // ✅ Update common fields for all existing dimensions of the same customer
      await client.query(`
      UPDATE sdd_fixed_pricing
      SET
        volumetric_factor = $1,
        chalaan_return_charges = $2,
        express_delivery_percentage = $3,
        gst_percentage = $4,
        cod_range_1 = $5,
        cod_charge_1 = $6,
        cod_range_2 = $7,
        cod_charge_2 = $8,
        cod_range_3 = $9,
        cod_charge_3 = $10,
        cod_range_4 = $11,
        cod_charge_4 = $12,
        cod_range_5 = $13,
        cod_charge_5 = $14,
        cod_range_6 = $15,
        cod_charge_6 = $16,
        updated_date_time = CURRENT_TIMESTAMP
      WHERE customer_id = $17
    `, [
        volumetric_factor,
        sanitizeNumber(chalaan_return_charges),
        express_delivery_percentage,
        gst_percentage,
        sanitizeJSON(cod_range_1),
        sanitizeNumber(cod_charge_1),
        sanitizeJSON(cod_range_2),
        sanitizeNumber(cod_charge_2),
        sanitizeJSON(cod_range_3),
        sanitizeNumber(cod_charge_3),
        sanitizeJSON(cod_range_4),
        sanitizeNumber(cod_charge_4),
        sanitizeJSON(cod_range_5),
        sanitizeNumber(cod_charge_5),
        sanitizeJSON(cod_range_6),
        sanitizeNumber(cod_charge_6),
        customer_id
      ]);

      // ✅ Insert the new dimension
      const dimension_id = await this.generateDimensionId(client);

      const insertQuery = `
      INSERT INTO sdd_fixed_pricing (
        customer_id, customer_name, dimension_id, dimension_name,
        length, breadth, height, weight, dimension_charge, volumetric_factor,
        chalaan_return_charges, express_delivery_percentage, gst_percentage,
        cod_range_1, cod_charge_1,
        cod_range_2, cod_charge_2,
        cod_range_3, cod_charge_3,
        cod_range_4, cod_charge_4,
        cod_range_5, cod_charge_5,
        cod_range_6, cod_charge_6,
        status, status_remarks
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15,
        $16, $17,
        $18, $19,
        $20, $21,
        $22, $23,
        $24, $25,
        $26, $27
      )
      RETURNING *;
    `;

      const values = [
        customer_id,
        customer_name,
        dimension_id,
        dimension_name,
        length,
        breadth,
        height,
        weight,
        dimension_charge,
        volumetric_factor,
        sanitizeNumber(chalaan_return_charges),
        express_delivery_percentage,
        gst_percentage,
        sanitizeJSON(cod_range_1),
        sanitizeNumber(cod_charge_1),
        sanitizeJSON(cod_range_2),
        sanitizeNumber(cod_charge_2),
        sanitizeJSON(cod_range_3),
        sanitizeNumber(cod_charge_3),
        sanitizeJSON(cod_range_4),
        sanitizeNumber(cod_charge_4),
        sanitizeJSON(cod_range_5),
        sanitizeNumber(cod_charge_5),
        sanitizeJSON(cod_range_6),
        sanitizeNumber(cod_charge_6),
        status,
        status_remarks
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in PriceManager.register:', err);
      throw err;
    } finally {
      client.release();
    }
  }

}

module.exports = PriceManager;
