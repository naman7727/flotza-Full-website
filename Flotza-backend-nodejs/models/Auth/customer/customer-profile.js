const pool = require('../../../config/db');

class CustomerProfile {
  static async getProfile(customerId) {
    try {
      const query = `
        SELECT customer_id, app_role, first_name, last_name, full_name, mobile_number,
               alternate_number, email, company_name, first_line_address, second_line_address,
               state, city, pin_code, full_address, gst_no, adhar_no, adhar_front_photo,
               adhar_back_photo, pan_card_no, pan_card_photo, profile_picture, wallet_balance,
               referral_code, reference_code, status, status_remarks, created_at, updated_at
        FROM customers
        WHERE customer_id = $1
      `;
      const result = await pool.query(query, [customerId]);

      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }

      const customer = result.rows[0];
      return {
        ...customer,
        adhar_front_photo: customer.adhar_front_photo ? `${customer.adhar_front_photo}` : null,
        adhar_back_photo: customer.adhar_back_photo ? `${customer.adhar_back_photo}` : null,
        pan_card_photo: customer.pan_card_photo ? `${customer.pan_card_photo}` : null,
        profile_picture: customer.profile_picture ? `${customer.profile_picture}` : null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAll({ status, full_name, email, mobile_number, page = 1, limit = 10 }) {
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

      let countQuery = 'SELECT COUNT(*) FROM customers';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      let dataQuery = `
        SELECT customer_id, app_role, first_name, last_name, full_name, mobile_number,
               alternate_number, email, company_name, first_line_address, second_line_address,
               state, city, pin_code, full_address, gst_no, adhar_no, adhar_front_photo,
               adhar_back_photo, pan_card_no, pan_card_photo, profile_picture, wallet_balance,
               referral_code, reference_code, status, status_remarks, created_at, updated_at
        FROM customers
      `;
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);
      const customers = result.rows.map(customer => ({
        ...customer,
        adhar_front_photo: customer.adhar_front_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${customer.adhar_front_photo}` : null,
        adhar_back_photo: customer.adhar_back_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${customer.adhar_back_photo}` : null,
        pan_card_photo: customer.pan_card_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${customer.pan_card_photo}` : null,
        profile_picture: customer.profile_picture ? `${process.env.BASE_URL || 'http://localhost:3000'}/${customer.profile_picture}` : null,
      }));

      return {
        data: customers,
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

  static async update(customerId, updateData) {
    const {
      first_name, last_name, mobile_number, alternate_number, email, company_name,
      first_line_address, second_line_address, state, city, pin_code, gst_no,
      adhar_no, adhar_front_photo, adhar_back_photo, pan_card_no, pan_card_photo,
      profile_picture, status, status_remarks, reference_code
    } = updateData;

    try {
      const query = `
        UPDATE customers
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          mobile_number = COALESCE($3, mobile_number),
          alternate_number = COALESCE($4, alternate_number),
          email = COALESCE($5, email),
          company_name = COALESCE($6, company_name),
          first_line_address = COALESCE($7, first_line_address),
          second_line_address = COALESCE($8, second_line_address),
          state = COALESCE($9, state),
          city = COALESCE($10, city),
          pin_code = COALESCE($11, pin_code),
          gst_no = COALESCE($12, gst_no),
          adhar_no = COALESCE($13, adhar_no),
          adhar_front_photo = COALESCE($14, adhar_front_photo),
          adhar_back_photo = COALESCE($15, adhar_back_photo),
          pan_card_no = COALESCE($16, pan_card_no),
          pan_card_photo = COALESCE($17, pan_card_photo),
          profile_picture = COALESCE($18, profile_picture),
          status = COALESCE($19, status),
          status_remarks = COALESCE($20, status_remarks),
          reference_code = COALESCE($21, reference_code),
          updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = $22
        RETURNING customer_id, app_role, first_name, last_name, full_name, mobile_number,
                  alternate_number, email, company_name, first_line_address, second_line_address,
                  state, city, pin_code, full_address, gst_no, adhar_no, adhar_front_photo,
                  adhar_back_photo, pan_card_no, pan_card_photo, profile_picture, wallet_balance,
                  referral_code, reference_code, status, status_remarks, created_at, updated_at
      `;
      const values = [
        first_name, last_name, mobile_number, alternate_number, email, company_name,
        first_line_address, second_line_address, state, city, pin_code, gst_no || null,
        adhar_no || null, adhar_front_photo || null, adhar_back_photo || null, pan_card_no || null,
        pan_card_photo || null, profile_picture || null, status, status_remarks, reference_code || null,
        customerId
      ];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }

      const customer = result.rows[0];
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      return {
        ...customer,
        adhar_front_photo: customer.adhar_front_photo ? `${customer.adhar_front_photo}` : null,
        adhar_back_photo: customer.adhar_back_photo ? `${customer.adhar_back_photo}` : null,
        pan_card_photo: customer.pan_card_photo ? `${customer.pan_card_photo}` : null,
        profile_picture: customer.profile_picture ? `${customer.profile_picture}` : null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(customerId) {
    try {
      const query = 'DELETE FROM customers WHERE customer_id = $1 RETURNING customer_id';
      const result = await pool.query(query, [customerId]);
      if (result.rows.length === 0) {
        throw new Error('Customer not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }


  static async deleteMultiple(customerIds) {
    try {
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        throw new Error('No customer IDs provided for deletion');
      }

      const query = `
        DELETE FROM customers
        WHERE customer_id = ANY($1::text[])
        RETURNING customer_id
      `;
      const result = await pool.query(query, [customerIds]);
      if (result.rowCount === 0) {
        throw new Error('No customers found for the provided IDs');
      }

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAll() {
    try {
      const query = 'DELETE FROM customers RETURNING customer_id';
      const result = await pool.query(query);
      return {
        deletedCount: result.rowCount
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CustomerProfile;