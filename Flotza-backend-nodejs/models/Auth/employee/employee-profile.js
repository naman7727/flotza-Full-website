const pool = require('../../../config/db');

class EmployeeProfile {
  static async getProfile(employeeId) {
    try {
      const query = `
        SELECT id, employee_id, first_name, last_name, full_name, email, mobile_number,
               app_roles, designation, department, reporting_manager, status, status_remarks,
               created_at, updated_at
        FROM employees
        WHERE id = $1
      `;
      const result = await pool.query(query, [employeeId]);

      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAll({ status, full_name, email, mobile_number, department, designation, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let conditions = [];
      let values = [];
      let valueIndex = 1;

      if (status) {
        conditions.push(`status = $${valueIndex++}`);
        values.push(status);
      }
      if (full_name) {
        conditions.push(`LOWER(full_name) LIKE LOWER($${valueIndex++})`);
        values.push(`%${full_name}%`);
      }
      if (email) {
        conditions.push(`LOWER(email) LIKE LOWER($${valueIndex++})`);
        values.push(`%${email}%`);
      }
      if (mobile_number) {
        conditions.push(`mobile_number = $${valueIndex++}`);
        values.push(mobile_number);
      }
      if (department) {
        conditions.push(`department = $${valueIndex++}`);
        values.push(department);
      }
      if (designation) {
        conditions.push(`designation = $${valueIndex++}`);
        values.push(designation);
      }

      let countQuery = 'SELECT COUNT(*) FROM employees';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      let dataQuery = `
        SELECT id, employee_id, first_name, last_name, full_name, email, mobile_number,
               app_roles, designation, department, reporting_manager, status, status_remarks,
               created_at, updated_at
        FROM employees
      `;
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);
      return {
        data: result.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(employeeId, updateData) {
    const {
      first_name, last_name, full_name, email, mobile_number, app_roles,
      designation, department, reporting_manager, status, status_remarks
    } = updateData;

    try {
      const query = `
        UPDATE employees
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          full_name = COALESCE($3, full_name),
          email = COALESCE($4, email),
          mobile_number = COALESCE($5, mobile_number),
          app_roles = COALESCE($6, app_roles),
          designation = COALESCE($7, designation),
          department = COALESCE($8, department),
          reporting_manager = COALESCE($9, reporting_manager),
          status = COALESCE($10, status),
          status_remarks = COALESCE($11, status_remarks),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING id, employee_id, first_name, last_name, full_name, email, mobile_number,
                  app_roles, designation, department, reporting_manager, status, status_remarks,
                  created_at, updated_at
      `;
      const values = [
        first_name, last_name, full_name, email, mobile_number, app_roles,
        designation, department, reporting_manager || null, status, status_remarks,
        employeeId
      ];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(employeeId) {
    try {
      const query = 'DELETE FROM employees WHERE id = $1 RETURNING id, employee_id';
      const result = await pool.query(query, [employeeId]);
      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeProfile;