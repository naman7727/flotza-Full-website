const DriverLogin = require('../../../models/Auth/driver/driver-login');
const DriverRegister = require('../../../models/Auth/driver/driver-register');
const DriverProfile = require('../../../models/Auth/driver/driver-profile');
const { generateToken } = require('../../../utils/jwt');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateDriverRegister, validateLogin, validateDriverUpdate, validateDriverQuery } = require('../../../utils/validation');

class DriverController {
  static async register(req, res) {
    try {
      const { error } = validateDriverRegister(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const driverData = {
        ...req.body,
        current_address_proof: req.files['current_address_proof'] ? req.files['current_address_proof'][0].path : null,
        pan_card_photo: req.files['pan_card_photo'] ? req.files['pan_card_photo'][0].path : null,
        aadhar_front_photo: req.files['aadhar_front_photo'] ? req.files['aadhar_front_photo'][0].path : null,
        aadhar_back_photo: req.files['aadhar_back_photo'] ? req.files['aadhar_back_photo'][0].path : null,
        driving_licence_photo: req.files['driving_licence_photo'] ? req.files['driving_licence_photo'][0].path : null,
        profile_picture: req.files['profile_picture'] ? req.files['profile_picture'][0].path : null,
      };

      const driver = await DriverRegister.register(driverData);
      
      const token = generateToken({ id: driver.id, role: driver.app_role });

      return res.status(201).json(successResponse({ driver: formatDriverProfile(driver, req), token }, 'Driver registered successfully'));
    } catch (error) {
      if (error.message.includes('unique constraint')) {
        return res.status(400).json(errorResponse('Email, mobile number, alternate number, PAN card number, Aadhar number, or driving licence number already exists'));
      }
      if (error.message.includes('drivers_vendor_code_fkey')) {
        return res.status(400).json(errorResponse('Invalid vendor code'));
      }
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { email, mobile_number, password } = req.body;
      let driver;

      if (email) {
        driver = await DriverLogin.loginWithEmail({ email, password });
      } else if (mobile_number) {
        driver = await DriverLogin.loginWithPhone({ mobile_number, password });
      } else {
        return res.status(400).json(errorResponse('Email or mobile number is required'));
      }

      const token = generateToken({ id: driver.id, role: driver.app_role });
      return res.status(200).json(successResponse({ driver: formatDriverProfile(driver, req), token }, 'Login successful'));
    } catch (error) {
      return res.status(401).json(errorResponse(error.message));
    }
  }

  static async getProfile(req, res) {
    try {
      const driverId = req.user.id;
      let driver = await DriverProfile.getProfile(driverId);
      driver = formatDriverProfile(driver, req);
      return res.status(200).json(successResponse(driver, 'Profile retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { status, full_name, email, mobile_number, page, limit } = req.query;
      const { error } = validateDriverQuery({ status, full_name, email, mobile_number, page, limit });
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await DriverProfile.getAll({ status, full_name, email, mobile_number, page, limit });
      // Format each driver in the result
      result.data = result.data.map(driver => formatDriverProfile(driver, req));
      return res.status(200).json(successResponse(result, 'Drivers retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
    try {
      const { error } = validateDriverUpdate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { driverId } = req.params;
      console.log(req.params);
      
      const updateData = {
        ...req.body,
        current_address_proof: req.files['current_address_proof'] ? req.files['current_address_proof'][0].path : null,
        pan_card_photo: req.files['pan_card_photo'] ? req.files['pan_card_photo'][0].path : null,
        aadhar_front_photo: req.files['aadhar_front_photo'] ? req.files['aadhar_front_photo'][0].path : null,
        aadhar_back_photo: req.files['aadhar_back_photo'] ? req.files['aadhar_back_photo'][0].path : null,
        driving_licence_photo: req.files['driving_licence_photo'] ? req.files['driving_licence_photo'][0].path : null,
        profile_picture: req.files['profile_picture'] ? req.files['profile_picture'][0].path : null,
      };

      const driver = await DriverProfile.update(driverId, updateData);
      const formatted = formatDriverProfile(driver, req);
      return res.status(200).json(successResponse(formatted, 'Driver updated successfully'));
    } catch (error) {
      if (error.message.includes('drivers_vendor_code_fkey')) {
        return res.status(400).json(errorResponse('Invalid vendor code'));
      }
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async updateSelf(req, res) {
    try {
      const driverId = req.user.id;

      // List of fields allowed to update
      const allowedFields = [
        'first_name', 'last_name', 'alternate_number', 'address_line_1', 'address_line_2',
        'state', 'city', 'pin_code', 'pan_card_no', 'aadhar_no', 'driving_licence_no',
        'profile_picture', 
        // add more fields as needed
      ];

      // Only include fields present in the request body
      const filteredData = {};
      for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
          filteredData[key] = req.body[key];
        }
      }

      // Handle file uploads (if present)
      const fileFields = [
        'current_address_proof', 'pan_card_photo', 'aadhar_front_photo',
        'aadhar_back_photo', 'driving_licence_photo', 'profile_picture'
      ];
      for (const field of fileFields) {
        if (req.files && req.files[field] && req.files[field][0]) {
          filteredData[field] = req.files[field][0].path;
        }
      }

      // If profile_picture is present in req.body (base64), use it (overrides file upload)
      if (req.body.profile_picture && typeof req.body.profile_picture === 'string' && req.body.profile_picture.startsWith('data:image')) {
        filteredData.profile_picture = req.body.profile_picture;
      }

      const updated = await DriverProfile.update(driverId, filteredData);
      const formatted = formatDriverProfile(updated, req);
      return res.status(200).json(successResponse(formatted, 'Profile updated successfully'));
    } catch (err) {
      return res.status(400).json(errorResponse(err.message));
    }
  }

  static async delete(req, res) {
    try {
      const { driverId } = req.params;
      const driver = await DriverProfile.delete(driverId);
      return res.status(200).json(successResponse(driver, 'Driver deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

   static async deleteMultiple(req, res) {
    console.log("DELETE MULTIPLE HIT", req.body);
    try {
      const { driverIds } = req.body; 
      const results = await DriverProfile.deleteMultiple(driverIds);
      return res.status(200).json(successResponse(results, 'Selected customers deleted successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

// Helper to convert file system path or base64 to public URL or data URL
function toPublicUrl(filePath, req) {
  if (!filePath) return null;
  if (typeof filePath !== 'string') return null;

  // If already a data URL, return as is
  if (filePath.startsWith('data:image')) return filePath;

  // If already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;

  // Normalize for Windows and remove leading directories if needed
  const normalized = filePath.replace(/\\/g, '/');
  let relativePath = normalized;
  if (!normalized.startsWith('/uploads/')) {
    const idx = normalized.indexOf('uploads/');
    relativePath = idx !== -1 ? '/' + normalized.slice(idx) : '/' + normalized;
  }

  // Prepend server URL (from request)
  const baseUrl = req.protocol + '://' + req.get('host');
  return baseUrl + relativePath;
}

// Helper to format driver profile before sending to frontend
function formatDriverProfile(driver, req) {
  if (!driver) return driver;
  const imageFields = [
    'profile_picture',
    'current_address_proof',
    'pan_card_photo',
    'aadhar_front_photo',
    'aadhar_back_photo',
    'driving_licence_photo'
  ];
  for (const field of imageFields) {
    if (driver[field]) {
      driver[field] = toPublicUrl(driver[field], req);
    } else {
      driver[field] = null;
    }
  }
  return driver;
}

module.exports = DriverController;