const pool = require('../../../config/db');

class DriverProfile {
  static async getProfile(driverId) {
    try {
      const query = `
        SELECT id, driver_id, app_role, first_name, last_name, full_name, email,
               mobile_number, alternate_number, address_line_1, address_line_2,
               state, city, pin_code, full_address, current_address_proof,
               current_address, vendor_code, vendor_name, pan_card_no, pan_card_photo,
               aadhar_no, aadhar_front_photo, aadhar_back_photo, driving_licence_no,
               driving_licence_photo, profile_picture, cod_holdings, chalan_holdings,
               total_deliveries, customer_ratings, referral_code, reference_code,
               status, status_remark, last_device_used, current_device_using,
               created_at, updated_at
        FROM drivers
        WHERE id = $1
      `;
      const result = await pool.query(query, [driverId]);

      if (result.rows.length === 0) {
        throw new Error('Driver not found');
      }

      const driver = result.rows[0];
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      return {
        ...driver,
        current_address_proof: driver.current_address_proof ? `${baseUrl}/${driver.current_address_proof}` : null,
        pan_card_photo: driver.pan_card_photo ? `${baseUrl}/${driver.pan_card_photo}` : null,
        aadhar_front_photo: driver.aadhar_front_photo ? `${baseUrl}/${driver.aadhar_front_photo}` : null,
        aadhar_back_photo: driver.aadhar_back_photo ? `${baseUrl}/${driver.aadhar_back_photo}` : null,
        driving_licence_photo: driver.driving_licence_photo ? `${baseUrl}/${driver.driving_licence_photo}` : null,
        profile_picture: driver.profile_picture ? `${baseUrl}/${driver.profile_picture}` : null,
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

      let countQuery = 'SELECT COUNT(*) FROM drivers';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      let dataQuery = `
        SELECT id, driver_id, app_role, first_name, last_name, full_name, email,
               mobile_number, alternate_number, address_line_1, address_line_2,
               state, city, pin_code, full_address, current_address_proof,
               current_address, vendor_code, vendor_name, pan_card_no, pan_card_photo,
               aadhar_no, aadhar_front_photo, aadhar_back_photo, driving_licence_no,
               driving_licence_photo, profile_picture, cod_holdings, chalan_holdings,
               total_deliveries, customer_ratings, referral_code, reference_code,
               status, status_remark, last_device_used, current_device_using,
               created_at, updated_at
        FROM drivers
      `;
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);
      const drivers = result.rows.map(driver => ({
        ...driver,
        current_address_proof: driver.current_address_proof ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.current_address_proof}` : null,
        pan_card_photo: driver.pan_card_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.pan_card_photo}` : null,
        aadhar_front_photo: driver.aadhar_front_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.aadhar_front_photo}` : null,
        aadhar_back_photo: driver.aadhar_back_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.aadhar_back_photo}` : null,
        driving_licence_photo: driver.driving_licence_photo ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.driving_licence_photo}` : null,
        profile_picture: driver.profile_picture ? `${process.env.BASE_URL || 'http://localhost:3000'}/${driver.profile_picture}` : null,
      }));

      return {
        data: drivers,
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

  static async update(driverId, updateData) {
    const {
      first_name, last_name, email, mobile_number, alternate_number, address_line_1,
      address_line_2, state, city, pin_code, current_address_proof, current_address,
      vendor_code, vendor_name, pan_card_no, pan_card_photo, aadhar_no,
      aadhar_front_photo, aadhar_back_photo, driving_licence_no, driving_licence_photo,
      profile_picture, status, status_remark, reference_code
    } = updateData;

    try {
      const query = `
        UPDATE drivers
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          mobile_number = COALESCE($4, mobile_number),
          alternate_number = COALESCE($5, alternate_number),
          address_line_1 = COALESCE($6, address_line_1),
          address_line_2 = COALESCE($7, address_line_2),
          state = COALESCE($8, state),
          city = COALESCE($9, city),
          pin_code = COALESCE($10, pin_code),
          current_address_proof = COALESCE($11, current_address_proof),
          current_address = COALESCE($12, current_address),
          vendor_code = COALESCE($13, vendor_code),
          vendor_name = COALESCE($14, vendor_name),
          pan_card_no = COALESCE($15, pan_card_no),
          pan_card_photo = COALESCE($16, pan_card_photo),
          aadhar_no = COALESCE($17, aadhar_no),
          aadhar_front_photo = COALESCE($18, aadhar_front_photo),
          aadhar_back_photo = COALESCE($19, aadhar_back_photo),
          driving_licence_no = COALESCE($20, driving_licence_no),
          driving_licence_photo = COALESCE($21, driving_licence_photo),
          profile_picture = COALESCE($22, profile_picture),
          status = COALESCE($23, status),
          status_remark = COALESCE($24, status_remark),
          reference_code = COALESCE($25, reference_code),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $26
        RETURNING id, driver_id, app_role, first_name, last_name, full_name, email,
                  mobile_number, alternate_number, address_line_1, address_line_2,
                  state, city, pin_code, full_address, current_address_proof,
                  current_address, vendor_code, vendor_name, pan_card_no, pan_card_photo,
                  aadhar_no, aadhar_front_photo, aadhar_back_photo, driving_licence_no,
                  driving_licence_photo, profile_picture, cod_holdings, chalan_holdings,
                  total_deliveries, customer_ratings, referral_code, reference_code,
                  status, status_remark, last_device_used, current_device_using,
                  created_at, updated_at
      `;
      const values = [
        first_name, last_name, email, mobile_number, alternate_number || null,
        address_line_1, address_line_2 || null, state, city, pin_code,
        current_address_proof || null, current_address, vendor_code, vendor_name,
        pan_card_no, pan_card_photo || null, aadhar_no, aadhar_front_photo || null,
        aadhar_back_photo || null, driving_licence_no, driving_licence_photo || null,
        profile_picture || null, status, status_remark || null, reference_code || null,
        driverId
      ];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Driver not found');
      }

      const driver = result.rows[0];
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      return {
        ...driver,
        current_address_proof: driver.current_address_proof ? `${baseUrl}/${driver.current_address_proof}` : null,
        pan_card_photo: driver.pan_card_photo ? `${baseUrl}/${driver.pan_card_photo}` : null,
        aadhar_front_photo: driver.aadhar_front_photo ? `${baseUrl}/${driver.aadhar_front_photo}` : null,
        aadhar_back_photo: driver.aadhar_back_photo ? `${baseUrl}/${driver.aadhar_back_photo}` : null,
        driving_licence_photo: driver.driving_licence_photo ? `${baseUrl}/${driver.driving_licence_photo}` : null,
        profile_picture: driver.profile_picture ? `${baseUrl}/${driver.profile_picture}` : null,
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(driverId) {
    try {
      const query = 'DELETE FROM drivers WHERE id = $1 RETURNING id, driver_id';
      const result = await pool.query(query, [driverId]);
      if (result.rows.length === 0) {
        throw new Error('Driver not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  

   static async deleteMultiple(driverIds) {
    try {
      if (!Array.isArray(driverIds) || driverIds.length === 0) {
        throw new Error('No driver IDs provided for deletion');
      }

      const query = `
        DELETE FROM drivers
        WHERE id = ANY($1::uuid[])
        RETURNING id, driver_id
      `;
      const result = await pool.query(query, [driverIds]);
      if (result.rowCount === 0) {
        throw new Error('No drivers found for the provided IDs');
      }

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = DriverProfile;