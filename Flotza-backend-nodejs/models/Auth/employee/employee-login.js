const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');

class EmployeeLogin {
  static async loginWithEmail({ email, password }) {
    try {
      const query = 'SELECT id, employee_id, email, password, full_name, app_roles FROM employees WHERE email = $1';
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      const employee = result.rows[0];
      const isMatch = await bcrypt.compare(password, employee.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: employee.id,
        employee_id: employee.employee_id,
        email: employee.email,
        full_name: employee.full_name,
        app_roles: employee.app_roles,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginWithPhone({ mobile_number, password }) {
    try {
      const query = 'SELECT id, employee_id, mobile_number, password, full_name, app_roles FROM employees WHERE mobile_number = $1';
      const result = await pool.query(query, [mobile_number]);
      
      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      const employee = result.rows[0];
      const isMatch = await bcrypt.compare(password, employee.password);
      
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        id: employee.id,
        employee_id: employee.employee_id,
        mobile_number: employee.mobile_number,
        full_name: employee.full_name,
        app_roles: employee.app_roles,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeLogin;