const pool = require('../../../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generates the next employee_id with a custom "KBS" prefix.
 * 
 * ID Pattern Example: KBS1001, KBS1002, KBS1003, ..., KBS5000, etc.
 *
 * Logic:
 * - Starts from KBS1001 if no employees exist yet.
 * - Always increments from the latest numeric part found in existing employee_ids.
 * - Handles invalid existing data safely with error handling.
 *
 * @param {Object} client - The PostgreSQL client for database queries.
 * @returns {Promise<string>} The newly generated employee_id.
 */
async function generateemployeeIdIWithPrefix(client) {
  const prefix = 'KBS';
  const minNumber = 1001;  // Minimum starting employee number

  // SQL query to fetch the latest (highest) employee_id matching the prefix
  const query = `
    SELECT employee_id
    FROM employees
    WHERE employee_id LIKE $1
    ORDER BY CAST(SUBSTRING(employee_id FROM LENGTH($2) + 1) AS INTEGER) DESC
    LIMIT 1
  `;

  try {
    // Execute the query to find the latest existing employee_id starting with 'KBS'
    const result = await client.query(query, [`${prefix}%`, prefix]);

    // If no existing employee IDs, start with KBS1001
    if (result.rows.length === 0) {
      return `${prefix}${minNumber}`;
    }

    // Extract the numeric part from the latest employee_id
    const lastId = result.rows[0].employee_id;
    const numberPart = parseInt(lastId.replace(prefix, ''), 10);

    // Safety check: Ensure the numeric part is a valid number
    if (isNaN(numberPart)) {
      throw new Error(`Invalid employee_id format in database: ${lastId}`);
    }

    // Increment the numeric part by 1 to get the new employee_id
    const newNumber = numberPart + 1;

    return `${prefix}${newNumber}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    throw error;  // Rethrow the error to let the caller handle it
  }
}

class EmployeeRegister {
    
  static async register(employeeData) {
     const client = await pool.connect();
    const {
      first_name, last_name, full_name, email, mobile_number, app_roles,
      designation, department, reporting_manager, password, status_remarks
    } = employeeData;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const employee_id = await generateemployeeIdIWithPrefix(client)
      const query = `
        INSERT INTO employees (
            employee_id, first_name, last_name, full_name, email, mobile_number,
            app_roles, designation, department, reporting_manager, password,
            status_remarks, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, employee_id, email, mobile_number, full_name, app_roles 
      `;
      
       const values = [
        employee_id, first_name, last_name, full_name, email, mobile_number,
        app_roles, designation, department, reporting_manager || null, hashedPassword,
        status_remarks, employeeData.status
       ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeRegister;