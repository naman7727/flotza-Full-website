const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class DriverLogin {
  static async loginWithEmail({ email, password }) {
    try {
      const query = 'SELECT id, driver_id, email, password, full_name, app_role FROM drivers WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Driver not found');
      }

      const driver = result.rows[0];
      const isMatch = await bcrypt.compare(password, driver.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: driver.id,
        driver_id: driver.driver_id,
        email: driver.email,
        full_name: driver.full_name,
        app_role: driver.app_role,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginWithPhone({ mobile_number, password }) {
    try {
      const query = 'SELECT id, driver_id, mobile_number, password, full_name, app_role FROM drivers WHERE mobile_number = $1';
      const result = await pool.query(query, [mobile_number]);
      
      if (result.rows.length === 0) {
        throw new Error('Driver not found');
      }

      const driver = result.rows[0];
      const isMatch = await bcrypt.compare(password, driver.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: driver.id,
        driver_id: driver.driver_id,
        mobile_number: driver.mobile_number,
        full_name: driver.full_name,
        app_role: driver.app_role,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DriverLogin;