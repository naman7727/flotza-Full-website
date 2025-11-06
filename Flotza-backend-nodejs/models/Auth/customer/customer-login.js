const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class CustomerLogin {
  static async loginWithEmail({ email, password }) {
    try {
      const query = 'SELECT customer_id, email, password, full_name, app_role FROM customers WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }

      const customer = result.rows[0];
      const isMatch = await bcrypt.compare(password, customer.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: customer.customer_id,
        email: customer.email,
        full_name: customer.full_name,
        app_role: customer.app_role,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginWithPhone({ mobile_number, password }) {
    try {
      const query = 'SELECT customer_id, mobile_number, password, full_name, app_role FROM customers WHERE mobile_number = $1';
      const result = await pool.query(query, [mobile_number]);
      
      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }

      const customer = result.rows[0];
      const isMatch = await bcrypt.compare(password, customer.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: customer.customer_id,
        mobile_number: customer.mobile_number,
        full_name: customer.full_name,
        app_role: customer.app_role,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CustomerLogin;