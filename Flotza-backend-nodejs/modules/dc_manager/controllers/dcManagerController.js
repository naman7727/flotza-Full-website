// Import model classes that handle database operations
const DcManagerRegister = require('../../../models/DcManager/dc-manager-register');
const DcManagerGetAll = require('../../../models/DcManager/dc-manager-get-all');
const DcManagerGetSingle = require('../../../models/DcManager/dc-manager-get-single');
const DcManagerUpdate = require('../../../models/DcManager/dc-manager-update');
const DcManagerDelete = require('../../../models/DcManager/dc-manager-delete');
const DcManagerNearest = require('../../../models/DcManager/dc-manager-nearest');
const DcManagerGetClosingTime = require('../../../models/DcManager/dc-manager-get-closing-time');
// Import validation functions for request body and params
const {
  validateDcManagerRegister,
  validateDcManagerGetSingle,
  validateDcManagerUpdate,
  validateDcManagerDelete,
} = require('../../../utils/validation');

// Import standardized success and error response formatters
const { successResponse, errorResponse } = require("../../../utils/response");

// Define the DC Manager Controller class
class DcManagerController {

  /**
 * POST /dc-manager/register
 * - Validates request body
 * - Calls model to insert a new DC Manager
 */
  static async create(req, res) {
    try {
      // ✅ Validate request body using Joi
      const { error } = validateDcManagerRegister(req.body);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      // ✅ Extract data from body
      const dcData = req.body;

      // ✅ Call model to insert into database
      const dcManager = await DcManagerRegister.createDc(dcData);

      return res.status(201).json(successResponse(dcManager, 'DC Manager created successfully'));
    } catch (error) {
      console.error('Error creating DC Manager:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }


  static async getAll(req, res) {
    try {
      // ✅ Call the model to fetch all DC manager branches
      const dcManagers = await DcManagerGetAll.getAllDC();

      // ✅ Return 200 with success response and DC list
      return res.status(200).json(successResponse(dcManagers, 'DC Managers retrieved successfully'));
    } catch (error) {
      console.error('Error fetching DC Managers:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }



  /**
   * ✅ GET /dc-manager/:branchId
   * - Fetch a single DC Manager record by branchId
   * - Validates the route parameter
   * - Returns the matching DC Manager record
   */
  static async getSingle(req, res) {
    try {
      // ✅ Extract route params
      const { branchId } = req.params;

      // ✅ Validate branchId using Joi
      const { error } = validateDcManagerGetSingle({ branchId });
      if (error) {
        // ❌ If validation fails, return 400 Bad Request with error message
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      // ✅ Call the model to fetch the record by branchId
      const dcManager = await DcManagerGetSingle.getByBranchId(branchId);

      // ✅ If record not found, return 404
      if (!dcManager) {
        return res.status(404).json(errorResponse('DC Manager not found for the given Branch ID'));
      }

      // ✅ Success: Return the single DC Manager record
      return res.status(200).json(successResponse(dcManager, 'DC Manager retrieved successfully'));
    } catch (error) {
      // ❌ If an unexpected error occurs, return 500 Internal Server Error
      console.error('Error fetching single DC Manager:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }


  /**
   * Update an existing DC Manager branch by branchId
   * @route PUT /dc-manager/:branchId
   * @access Admin only
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async update(req, res) {
    try {
      // ✅ Validate the request body against the update schema
      const { error } = validateDcManagerUpdate(req.body);
      if (error) {
        // ❌ Return 400 error if validation fails
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const branchId = req.params.branchId;

      // ✅ Call the model to update the DC manager details
      const updated = await DcManagerUpdate.updateDc(branchId, req.body);

      // ✅ Return 200 with success response and updated DC details
      return res.status(200).json(successResponse(updated, 'DC Manager updated successfully'));
    } catch (error) {
      console.error('Error updating DC Manager:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Delete a DC Manager branch by branchId
   * @route DELETE /dc-manager/:branchId
   * @access Admin only
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async delete(req, res) {
    try {
      // ✅ Validate the request params against the delete schema
      const { error } = validateDcManagerDelete(req.params);
      if (error) {
        // ❌ Return 400 error if validation fails
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const branchId = req.params.branchId;

      // ✅ Call the model to delete the DC manager
      const deleted = await DcManagerDelete.deleteDc(branchId);

      // ✅ Return 200 with success response and deleted DC details
      return res.status(200).json(successResponse(deleted, 'DC Manager deleted successfully'));
    } catch (error) {
      console.error('Error deleting DC Manager:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async findNearestDC(req, res) {
    try {
      const { lat, lng, rangeType } = req.body;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json(errorResponse("Latitude and longitude must be numbers"));
      }

      const type = rangeType || 'pick_up_range';

      const nearest = await DcManagerNearest.findNearestDC(lat, lng, type);

      if (!nearest) {
        return res.status(404).json(errorResponse("Sorry, we do not provide service at this location."));
      }

      return res.status(200).json(successResponse(nearest, "Nearest DC found"));
    } catch (err) {
      console.error('Error in findNearestDC:', err);
      return res.status(500).json(errorResponse("Server error while finding nearest DC"));
    }
  }

  /**
   * GET /dc-manager/closing-time/:shipperId
   * Fetch the max_order_time for the DC linked to this shipper
   */
  static async getClosingTimeByShipper(req, res) {
    try {
      const { shipperId } = req.params;

      if (!shipperId) {
        return res.status(400).json({
          success: false,
          message: 'Shipper ID is required'
        });
      }

      const closingTimeData = await DcManagerGetClosingTime.getClosingTime(shipperId);

      if (!closingTimeData) {
        return res.status(404).json({
          success: false,
          message: 'Closing time not found for this shipper'
        });
      }

      return res.status(200).json({
        success: true,
        data: closingTimeData,
        message: 'Closing time retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getClosingTimeByShipper:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while fetching closing time'
      });
    }
  }

}

module.exports = DcManagerController;
