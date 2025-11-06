const OdLimitAllModel = require('../../../models/OdLimitManager/od-limit-manager-all-source');
const OdLimitUpdateModel = require('../../../models/OdLimitManager/od-limit-manager-update');
const { validateODLimitUpdate } = require('../../../utils/validation');
const { successResponse, errorResponse } = require('../../../utils/response');

class OdLimitController {
  static async getAll(req, res) {
    try {
      const limits = await OdLimitAllModel.getAllLimits();
      return res.status(200).json(successResponse(limits, 'OD limits retrieved successfully'));
    } catch (error) {
      console.error('Error fetching OD limits:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async updateODLimit(req, res) {
    const { customer_id } = req.params;
    const { od_limit } = req.body;

    const { error } = validateODLimitUpdate({ od_limit });
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    try {
      const result = await OdLimitUpdateModel.updateODLimit(customer_id, od_limit);

      if (result?.notFound) {
        return res.status(404).json(errorResponse('Customer not found'));
      }

      return res.status(200).json(successResponse(result, 'OD limit updated successfully'));
    } catch (error) {
      console.error('Error updating OD limit:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

module.exports = OdLimitController;
