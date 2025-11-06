const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class VendorLogin {
  static async loginWithEmail({ email, password }) {
    try {
      const query = 'SELECT vendor_id, email, password, full_name, app_role FROM vendors WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      const isMatch = await bcrypt.compare(password, vendor.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: vendor.vendor_id,
        email: vendor.email,
        full_name: vendor.full_name,
        app_role: vendor.app_role,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginWithPhone({ mobile_number, password }) {
    try {
      const query = 'SELECT vendor_id, mobile_number, password, full_name, app_role FROM vendors WHERE mobile_number = $1';
      const result = await pool.query(query, [mobile_number]);
      
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      const isMatch = await bcrypt.compare(password, vendor.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: vendor.vendor_id,
        mobile_number: vendor.mobile_number,
        full_name: vendor.full_name,
        app_role: vendor.app_role,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorLogin;