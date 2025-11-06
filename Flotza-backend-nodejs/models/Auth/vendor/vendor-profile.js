const pool = require('../../../config/db');

class VendorProfile {
  static normalizePath(path) {
    return path ? path.replace(/\\/g, '/') : null;
  }

  static async getProfile(vendorId) {
    try {
      const query = `
        SELECT id, vendor_id, app_role, first_name, last_name, full_name, email,
               mobile_number, alternate_no, business_name, business_address,
               gst_number, gst_upload, pan_card_no, pan_card_photo_upload,
               aadhar_front_photo_upload, aadhar_back_photo_upload, adhar_no,
               profile_photo, no_of_drivers, no_of_vehicles, current_pay_outstandings,
               created_at, updated_at, status, status_remarks
        FROM vendors
        WHERE vendor_id = $1
      `;
      const result = await pool.query(query, [vendorId]);

      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      return {
        ...vendor,
        gst_upload: this.normalizePath(vendor.gst_upload),
        pan_card_photo_upload: this.normalizePath(vendor.pan_card_photo_upload),
        aadhar_front_photo_upload: this.normalizePath(vendor.aadhar_front_photo_upload),
        aadhar_back_photo_upload: this.normalizePath(vendor.aadhar_back_photo_upload),
        profile_photo: this.normalizePath(vendor.profile_photo),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAll({ full_name, email, mobile_number, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let conditions = [];
      let values = [];
      let valueIndex = 1;

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

      let countQuery = 'SELECT COUNT(*) FROM vendors';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      let dataQuery = `
        SELECT id, vendor_id, app_role, first_name, last_name, full_name, email,
               mobile_number, alternate_no, business_name, business_address,
               gst_number, gst_upload, pan_card_no, pan_card_photo_upload,
               aadhar_front_photo_upload, aadhar_back_photo_upload, adhar_no,
               profile_photo, no_of_drivers, no_of_vehicles, current_pay_outstandings,
               created_at, updated_at, status, status_remarks
        FROM vendors
      `;
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex++}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);
      const vendors = result.rows.map(vendor => ({
        ...vendor,
        gst_upload: this.normalizePath(vendor.gst_upload),
        pan_card_photo_upload: this.normalizePath(vendor.pan_card_photo_upload),
        aadhar_front_photo_upload: this.normalizePath(vendor.aadhar_front_photo_upload),
        aadhar_back_photo_upload: this.normalizePath(vendor.aadhar_back_photo_upload),
        profile_photo: this.normalizePath(vendor.profile_photo),
      }));

      return {
        data: vendors,
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

  static async update(vendorId, updateData) {
    const {
      first_name, last_name, email, mobile_number, alternate_no, business_name,
      business_address, gst_number, gst_upload, pan_card_no, pan_card_photo_upload,
      aadhar_front_photo_upload, aadhar_back_photo_upload, adhar_no, profile_photo,
      status, status_remarks
    } = updateData;

    try {
      const query = `
        UPDATE vendors
        SET 
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          mobile_number = COALESCE($4, mobile_number),
          alternate_no = COALESCE($5, alternate_no),
          business_name = COALESCE($6, business_name),
          business_address = COALESCE($7, business_address),
          gst_number = COALESCE($8, gst_number),
          gst_upload = COALESCE($9, gst_upload),
          pan_card_no = COALESCE($10, pan_card_no),
          pan_card_photo_upload = COALESCE($11, pan_card_photo_upload),
          aadhar_front_photo_upload = COALESCE($12, aadhar_front_photo_upload),
          aadhar_back_photo_upload = COALESCE($13, aadhar_back_photo_upload),
          adhar_no = COALESCE($14, adhar_no),
          profile_photo = COALESCE($15, profile_photo),
          status = COALESCE($16, status),
          status_remarks = COALESCE($17, status_remarks),
          updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = $18
        RETURNING id, vendor_id, app_role, first_name, last_name, full_name, email,
                  mobile_number, alternate_no, business_name, business_address,
                  gst_number, gst_upload, pan_card_no, pan_card_photo_upload,
                  aadhar_front_photo_upload, aadhar_back_photo_upload, adhar_no,
                  profile_photo, no_of_drivers, no_of_vehicles, current_pay_outstandings,
                  created_at, updated_at, status, status_remarks
      `;

      const values = [
        first_name, last_name, email, mobile_number, alternate_no || null,
        business_name, business_address, gst_number || null, gst_upload || null,
        pan_card_no || null, pan_card_photo_upload || null, aadhar_front_photo_upload || null,
        aadhar_back_photo_upload || null, adhar_no || null, profile_photo || null,
        status || null, status_remarks || null, vendorId
      ];

      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }

      const vendor = result.rows[0];
      return {
        ...vendor,
        gst_upload: this.normalizePath(vendor.gst_upload),
        pan_card_photo_upload: this.normalizePath(vendor.pan_card_photo_upload),
        aadhar_front_photo_upload: this.normalizePath(vendor.aadhar_front_photo_upload),
        aadhar_back_photo_upload: this.normalizePath(vendor.aadhar_back_photo_upload),
        profile_photo: this.normalizePath(vendor.profile_photo),
      };
    } catch (error) {
      throw error;
    }
  }

  static async delete(vendorId) {
    try {
      const query = 'DELETE FROM vendors WHERE vendor_id = $1 RETURNING vendor_id';
      const result = await pool.query(query, [vendorId]);
      if (result.rows.length === 0) {
        throw new Error('Vendor not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteMultiple(vendorIds) {
    try {
      if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
        throw new Error('No vendor IDs provided for deletion');
      }

      const query = `
        DELETE FROM vendors
        WHERE vendor_id = ANY($1::text[])
        RETURNING vendor_id
      `;
      const result = await pool.query(query, [vendorIds]);
      if (result.rowCount === 0) {
        throw new Error('No vendors found for the provided IDs');
      }

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VendorProfile;