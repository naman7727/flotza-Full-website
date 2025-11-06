const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class VendorRegister {
  static async register(vendorData) {
    const {
      first_name, last_name, email, business_name, business_address,
      gst_number, mobile_number, alternate_no, password, pan_card_no,
      adhar_no, gst_upload, pan_card_photo_upload, aadhar_front_photo_upload,
      aadhar_back_photo_upload, profile_photo, app_role = 'vendor'
    } = vendorData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const maxIdQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(vendor_id, 4) AS INTEGER)), 0) as max_id FROM vendors WHERE vendor_id ~ '^KBV[0-9]+$'`;
      const maxIdResult = await pool.query(maxIdQuery);
      const maxId = maxIdResult.rows[0].max_id || 0;
      const vendor_id = `KBV${maxId + 1}`;

      const query = `
        INSERT INTO vendors (
          vendor_id, app_role, first_name, last_name, email, mobile_number,
          alternate_no, password, business_name, business_address, gst_number,
          gst_upload, pan_card_no, pan_card_photo_upload, aadhar_front_photo_upload,
          aadhar_back_photo_upload, adhar_no, profile_photo
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING vendor_id, email, mobile_number, full_name, app_role
      `;

      const values = [
        vendor_id, app_role, first_name, last_name, email, mobile_number,
        alternate_no, hashedPassword, business_name, business_address, gst_number || null,
        gst_upload, pan_card_no, pan_card_photo_upload, aadhar_front_photo_upload,
        aadhar_back_photo_upload, adhar_no, profile_photo
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorRegister;