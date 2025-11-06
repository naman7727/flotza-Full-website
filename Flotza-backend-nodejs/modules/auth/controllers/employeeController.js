const EmployeeLogin = require('../../../models/Auth/employee/employee-login');
const EmployeeRegister = require('../../../models/Auth/employee/employee-register');
const EmployeeProfile = require('../../../models/Auth/employee/employee-profile');
const { generateToken } = require('../../../utils/jwt');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateEmployeeRegister, validateLogin, validateEmployeeUpdate, validateEmployeeQuery } = require('../../../utils/validation');

class EmployeeController {
  
  static async getOne(req, res) {
  try {
    const { employeeId } = req.params;
    const employee = await EmployeeProfile.getProfile(employeeId);
    if (!employee) {
      return res.status(404).json(errorResponse("Employee not found"));
    }
    return res.status(200).json(successResponse(employee, "Employee fetched successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message));
  }
}

  static async register(req, res) {
    try {
      const { error } = validateEmployeeRegister(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const employeeData = {
        ...req.body,
        full_name: `${req.body.first_name} ${req.body.last_name}`
      };

      const employee = await EmployeeRegister.register(employeeData);
      const token = generateToken({ id: employee.id, role: employee.app_roles });

      return res.status(201).json(successResponse({ employee, token }, 'Employee registered successfully'));
    } catch (error) {
      if (error.message.includes('unique constraint')) {
        return res.status(400).json(errorResponse('Email or mobile number already exists'));
      }
      if (error.message.includes('employees_app_roles_fkey')) {
        return res.status(400).json(errorResponse('Invalid app role'));
      }
      if (error.message.includes('employees_reporting_manager_fkey')) {
        return res.status(400).json(errorResponse('Invalid reporting manager'));
      }
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async login(req, res) {
    try {
      const { error } = validateLogin(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { email, mobile_number, password } = req.body;
      let employee;

      if (email) {
        employee = await EmployeeLogin.loginWithEmail({ email, password });
      } else if (mobile_number) {
        employee = await EmployeeLogin.loginWithPhone({ mobile_number, password });
      } else {
        return res.status(400).json(errorResponse('Email or mobile number is required'));
      }

      const token = generateToken({ id: employee.id, role: employee.app_roles });
      return res.status(200).json(successResponse({ employee, token }, 'Login successful'));
    } catch (error) {
      return res.status(401).json(errorResponse(error.message));
    }
  }

  static async getProfile(req, res) {
    try {
      const employeeId = req.user.id;
      const employee = await EmployeeProfile.getProfile(employeeId);
      return res.status(200).json(successResponse(employee, 'Profile retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { status, full_name, email, mobile_number, department, designation, page, limit } = req.query;
      const { error } = validateEmployeeQuery({ status, full_name, email, mobile_number, department, designation, page, limit });
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await EmployeeProfile.getAll({ status, full_name, email, mobile_number, department, designation, page, limit });
      return res.status(200).json(successResponse(result, 'Employees retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
    try {
      const { error } = validateEmployeeUpdate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { employeeId } = req.params;
      const updateData = req.body;
      if (req.body.first_name || req.body.last_name) {
        updateData.full_name = `${req.body.first_name || ''} ${req.body.last_name || ''}`.trim();
      }

      const employee = await EmployeeProfile.update(employeeId, updateData);
      return res.status(200).json(successResponse(employee, 'Employee updated successfully'));
    } catch (error) {
      if (error.message.includes('employees_app_roles_fkey')) {
        return res.status(400).json(errorResponse('Invalid app role'));
      }
      if (error.message.includes('employees_reporting_manager_fkey')) {
        return res.status(400).json(errorResponse('Invalid reporting manager'));
      }
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async delete(req, res) {
    try {
      const { employeeId } = req.params;
      const employee = await EmployeeProfile.delete(employeeId);
      return res.status(200).json(successResponse(employee, 'Employee deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

module.exports = EmployeeController;