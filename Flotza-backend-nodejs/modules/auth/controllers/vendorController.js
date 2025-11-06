const VendorLogin = require('../../../models/Auth/vendor/vendor-login');
const VendorRegister = require('../../../models/Auth/vendor/vendor-register');
const VendorProfile = require('../../../models/Auth/vendor/vendor-profile');
const { generateToken } = require('../../../utils/jwt');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateVendorRegister, validateLogin, validateVendorQuery } = require('../../../utils/validation');

class VendorController {
  static async register(req, res) {
    try {
      const { error } = validateVendorRegister(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const vendorData = {
        ...req.body,
        gst_upload: req.files['gst_upload'] ? req.files['gst_upload'][0].path : null,
        pan_card_photo_upload: req.files['pan_card_photo_upload'] ? req.files['pan_card_photo_upload'][0].path : null,
        aadhar_front_photo_upload: req.files['aadhar_front_photo_upload'] ? req.files['aadhar_front_photo_upload'][0].path : null,
        aadhar_back_photo_upload: req.files['aadhar_back_photo_upload'] ? req.files['aadhar_back_photo_upload'][0].path : null,
        profile_photo: req.files['profile_photo'] ? req.files['profile_photo'][0].path : null,
      };

      const vendor = await VendorRegister.register(vendorData);
      const token = generateToken({ id: vendor.vendor_id, role: vendor.app_role });

      return res.status(201).json(successResponse({ vendor, token }, 'Vendor registered successfully'));
    } catch (error) {
      if (error.message.includes('unique constraint')) {
        return res.status(400).json(errorResponse('Email, mobile number, alternate number, GST number, PAN card number, or Aadhar number already exists'));
      }
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { email, mobile_number, password } = req.body;
      let vendor;

      if (email) {
        vendor = await VendorLogin.loginWithEmail({ email, password });
      } else if (mobile_number) {
        vendor = await VendorLogin.loginWithPhone({ mobile_number, password });
      } else {
        return res.status(400).json(errorResponse('Email or mobile number is required'));
      }

      const token = generateToken({ id: vendor.id, role: vendor.app_role });
      return res.status(200).json(successResponse({ vendor, token }, 'Login successful'));
    } catch (error) {
      return res.status(401).json(errorResponse(error.message));
    }
  }

  static async getProfile(req, res) {
    try {
      const vendorId = req.user.id;
      const vendor = await VendorProfile.getProfile(vendorId);
      return res.status(200).json(successResponse(vendor, 'Profile retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  // ✅ NEW: Get all vendors
  static async getAll(req, res) {
    try {
      const { status, full_name, email, mobile_number, page = 1, limit = 100 } = req.query;

      const { error } = validateVendorQuery({ status, full_name, email, mobile_number, page, limit });
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await VendorProfile.getAll({ status, full_name, email, mobile_number, page, limit });

      return res.status(200).json(successResponse(result, 'Vendors retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
  try {
    const vendorId = req.params.vendorId;
    const updateData = {
      ...req.body,
      // Only add file paths if files exist
      gst_upload: req.files && req.files['gst_upload'] ? req.files['gst_upload'][0].path : undefined,
      pan_card_photo_upload: req.files && req.files['pan_card_photo_upload'] ? req.files['pan_card_photo_upload'][0].path : undefined,
      aadhar_front_photo_upload: req.files && req.files['aadhar_front_photo_upload'] ? req.files['aadhar_front_photo_upload'][0].path : undefined,
      aadhar_back_photo_upload: req.files && req.files['aadhar_back_photo_upload'] ? req.files['aadhar_back_photo_upload'][0].path : undefined,
      profile_photo: req.files && req.files['profile_photo'] ? req.files['profile_photo'][0].path : undefined,
    };

    // Remove undefined values to avoid overwriting existing data with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const vendor = await VendorProfile.update(vendorId, updateData);
    return res.status(200).json(successResponse(vendor, 'Vendor updated successfully'));
  } catch (error) {
    return res.status(404).json(errorResponse(error.message));
  }
}

  // ✅ NEW: Delete vendor by ID
  static async delete(req, res) {
    try {
      const { vendorId } = req.params;
      const result = await VendorProfile.delete(vendorId);
      return res.status(200).json(successResponse(result, 'Vendor deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async deleteMultiple(req, res) {
    try {
      const { vendorIds } = req.body; // Expecting an array of vendor IDs
      const result = await VendorProfile.deleteMultiple(vendorIds);
      return res.status(200).json(successResponse(result, 'Vendors deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

module.exports = VendorController;
