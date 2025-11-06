const CustomerLogin = require('../../../models/Auth/customer/customer-login');
const CustomerRegister = require('../../../models/Auth/customer/customer-register');
const CustomerProfile = require('../../../models/Auth/customer/customer-profile');
const { generateToken } = require('../../../utils/jwt');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateCustomerRegister, validateLogin, validateCustomerUpdate, validateCustomerQuery } = require('../../../utils/validation');

class CustomerController {
  static async register(req, res) {
    try {
      const { error } = validateCustomerRegister(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const customerData = {
        ...req.body,
        adhar_front_photo: req.files && req.files['adhar_front_photo'] ? req.files['adhar_front_photo'][0].path : null,
        adhar_back_photo: req.files && req.files['adhar_back_photo'] ? req.files['adhar_back_photo'][0].path : null,
        pan_card_photo: req.files && req.files['pan_card_photo'] ? req.files['pan_card_photo'][0].path : null,
        profile_picture: req.files && req.files['profile_picture'] ? req.files['profile_picture'][0].path : null,
      };

      const customer = await CustomerRegister.register(customerData);

      if (!customer) {
        return res.status(500).json(errorResponse('Failed to register customer'));
      }

      const token = generateToken({ id: customer.customer_id, role: customer.app_role });

      return res.status(201).json(successResponse({ customer, token }, 'Customer registered successfully'));
    } catch (error) {
      console.error('Customer registration error:', error);
      if (error.message.includes('unique constraint')) {
        return res.status(400).json(errorResponse('Email, mobile number, alternate number, GST number, Aadhar number, or PAN card number already exists'));
      }
      return res.status(500).json(errorResponse('An error occurred during registration. Please try again.'));
    }
  }

  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { email, mobile_number, password } = req.body;
      let customer;

      if (email) {
        customer = await CustomerLogin.loginWithEmail({ email, password });
      } else if (mobile_number) {
        customer = await CustomerLogin.loginWithPhone({ mobile_number, password });
      } else {
        return res.status(400).json(errorResponse('Email or Mobile number is required'));
      }

      const token = generateToken({ id: customer.id, role: customer.app_role });
      return res.status(200).json(successResponse({ customer, token }, 'Login successful'));
    } catch (error) {
      return res.status(401).json(errorResponse(error.message));
    }
  }

  static async getProfile(req, res) {
    try {
      const customerId = req.user.id;
      const customer = await CustomerProfile.getProfile(customerId);
      return res.status(200).json(successResponse(customer, 'Profile retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { status, full_name, email, mobile_number, page, limit } = req.query;
      const { error } = validateCustomerQuery({ status, full_name, email, mobile_number, page, limit });
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await CustomerProfile.getAll({ status, full_name, email, mobile_number, page, limit });
      return res.status(200).json(successResponse(result, 'Customers retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
    try {
      const { error } = validateCustomerUpdate(req.body);
      console.log(req.body);

      if (error) return res.status(400).json(errorResponse(error.details[0].message));
      const { customerId } = req.params;
      const updateData = {
        ...req.body,
        adhar_front_photo: req.files?.['adhar_front_photo'] ? req.files['adhar_front_photo'][0].path : null,
        adhar_back_photo: req.files?.['adhar_back_photo'] ? req.files['adhar_back_photo'][0].path : null,
        pan_card_photo: req.files?.['pan_card_photo'] ? req.files['pan_card_photo'][0].path : null,
        profile_picture: req.files?.['profile_picture'] ? req.files['profile_picture'][0].path : null,
      };

      const customer = await CustomerProfile.update(customerId, updateData);
      return res.status(200).json(successResponse(customer, 'Customer updated successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }



  static async delete(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await CustomerProfile.delete(customerId);
      return res.status(200).json(successResponse(customer, 'Customer deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }


  // Delete multiple customers
  static async deleteMultiple(req, res) {
    console.log("DELETE MULTIPLE HIT", req.body);
    try {
      const { customerIds } = req.body;
      const results = await CustomerProfile.deleteMultiple(customerIds);
      return res.status(200).json(successResponse(results, 'Selected customers deleted successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }


  static async deleteAll(req, res) {
    try {
      await CustomerProfile.deleteAll(); // Implement this in your model
      return res.status(200).json(successResponse(null, 'All customers deleted successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async getById(req, res) {
    try {
      const { customerId } = req.params;
      const customer = await CustomerProfile.getProfile(customerId);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      console.error('Get Customer by ID failed:', error.message);
      res.status(404).json({ success: false, message: error.message || 'Customer not found' });
    }
  }
}

module.exports = CustomerController;