const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class CustomerRegister {
  static async register(customerData) {
    const {
      first_name, last_name, mobile_number, alternate_number, email, company_name,
      first_line_address, second_line_address, state, city, pin_code, gst_no,
      adhar_no, adhar_front_photo, adhar_back_photo, pan_card_no, pan_card_photo,
      profile_picture, password, reference_code, status_remarks, app_role = 'customer'
    } = customerData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const maxIdQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_id, 4) AS INTEGER)), 0) as max_id 
                          FROM customers WHERE customer_id ~ '^KBU[0-9]+$'`;
      const maxIdResult = await pool.query(maxIdQuery);
      const maxId = maxIdResult.rows[0].max_id || 0;
      const customer_id = `KBU${maxId + 1}`;

      const query = `
        INSERT INTO customers (
          customer_id, app_role, first_name, last_name, mobile_number, alternate_number,
          email, company_name, first_line_address, second_line_address, state, city,
          pin_code, gst_no, adhar_no, adhar_front_photo, adhar_back_photo, pan_card_no,
          pan_card_photo, profile_picture, password, reference_code, status_remarks
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING customer_id, email, mobile_number, full_name, app_role
      `;

      const values = [
        customer_id, app_role, first_name, last_name, mobile_number, alternate_number,
        email, company_name, first_line_address, second_line_address, state, city,
        pin_code, gst_no || null, adhar_no || null, adhar_front_photo || null,
        adhar_back_photo || null, pan_card_no || null, pan_card_photo || null,
        profile_picture || null, hashedPassword, reference_code || null, status_remarks
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CustomerRegister;