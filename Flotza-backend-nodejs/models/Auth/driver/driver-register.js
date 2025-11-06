const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class DriverRegister {
  static async register(driverData) {
    const {
      first_name, last_name, email, mobile_number, alternate_number, password,
      address_line_1, address_line_2, state, city, pin_code, current_address_proof,
      current_address, vendor_code, vendor_name, pan_card_no, pan_card_photo,
      aadhar_no, aadhar_front_photo, aadhar_back_photo, driving_licence_no,
      driving_licence_photo, profile_picture, reference_code, status_remark,
      app_role = 'sdddriver'
    } = driverData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const maxIdQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(driver_id, 4) AS INTEGER)), 0) as max_id FROM drivers WHERE driver_id ~ '^KBD[0-9]+$'`;
      const maxIdResult = await pool.query(maxIdQuery);
      const maxId = maxIdResult.rows[0].max_id || 0;
      const driver_id = `KBD${maxId + 1}`;

      const query = `
        INSERT INTO drivers (
          id, driver_id, app_role, first_name, last_name, email, mobile_number,
          alternate_number, password, address_line_1, address_line_2, state, city,
          pin_code, current_address_proof, current_address, vendor_code, vendor_name,
          pan_card_no, pan_card_photo, aadhar_no, aadhar_front_photo, aadhar_back_photo,
          driving_licence_no, driving_licence_photo, profile_picture, reference_code,
          status_remark
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING id, driver_id, email, mobile_number, full_name, app_role
      `;

      const id = crypto.randomUUID();
      const values = [
        id, driver_id, app_role, first_name, last_name, email, mobile_number,
        alternate_number || null, hashedPassword, address_line_1, address_line_2 || null,
        state, city, pin_code, current_address_proof, current_address, vendor_code,
        vendor_name, pan_card_no, pan_card_photo, aadhar_no, aadhar_front_photo,
        aadhar_back_photo, driving_licence_no, driving_licence_photo, profile_picture,
        reference_code || null, status_remark || null
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DriverRegister;