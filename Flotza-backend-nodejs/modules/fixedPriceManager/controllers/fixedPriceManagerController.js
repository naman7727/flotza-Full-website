const pool = require('../../../config/db');
const PriceManagerModel = require('../../../models/FixedPriceManager/fixed-price-manager-register');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validatePriceManagerRegister, validatePriceManagerUpdate, validatePriceManagerStatusUpdate } = require('../../../utils/validation');
const PriceManagergetmodel = require('../../../models/FixedPriceManager/fixed-price-manager-all-source');
const PriceManagerUpdateModel = require('../../../models/FixedPriceManager/fixed-price-manager-update');
const PriceManagerDeleteModel = require('../../../models/FixedPriceManager/fixed-price-manger-delete');

class PriceManagerController {
  /**
   * POST /price-manager
   * - Validates the incoming request body
   * - Inserts new price manager entry into DB
   */
  static async register(req, res) {
    try {
      const { error } = validatePriceManagerRegister(req.body);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const priceData = req.body;
      const createdPrice = await PriceManagerModel.register(priceData);

      return res.status(201).json(successResponse(createdPrice, 'Price Manager created successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.register:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }

  /**
   * GET /price-manager
   * - Fetches all Price Manager entries from DB
   */
  static async getAll(req, res) {
    try {
      const allRecords = await PriceManagergetmodel.getAll();
      return res.status(200).json(successResponse(allRecords, 'Fetched all Price Manager records successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.getAll:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }

  /**
   * GET /price-manager/:dimension_id
   * - Fetch a single record by dimension_id
   */
  static async getById(req, res) {
    try {
      const { dimension_id } = req.params;

      const record = await PriceManagergetmodel.getById(dimension_id);

      if (!record) {
        return res.status(404).json(errorResponse(`No record found with dimension_id: ${dimension_id}`));
      }

      return res.status(200).json(successResponse(record, 'Fetched Price Manager record successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.getById:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }

  /**
   * GET /price-manager/customer/:customer_id
   * - Fetches all Price Manager entries by customer_id
   */
  static async getByCustomer(req, res) {
    try {
      const { customer_id } = req.params;
      const records = await PriceManagergetmodel.getByCustomer(customer_id);

      if (!records || records.length === 0) {
        return res.status(404).json(errorResponse('No active dimensions found for this customer'));
      }

      return res.status(200).json(successResponse(records, 'Fetched dimensions for customer'));
    } catch (err) {
      console.error('Error in PriceManagerController.getByCustomer:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }


  /**
   * PUT /price-manager/:dimension_id
   * - Validates the incoming request body for updates
   * - Updates the Price Manager record in DB
   */
  static async update(req, res) {
    try {
      const { error } = validatePriceManagerUpdate(req.body);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const { dimension_id } = req.params;

      const {
        dimension_name,
        length,
        breadth,
        height,
        weight,
        dimension_charge,
      } = req.body;

      const updatedRecord = await PriceManagerUpdateModel.update(
        dimension_id,
        dimension_name,
        Number(length),
        Number(breadth),
        Number(height),
        Number(weight),
        Number(dimension_charge)
      );

      return res
        .status(200)
        .json(successResponse(updatedRecord, 'Price Manager record updated successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.update:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }

  /**
   * PUT /price-manager/status/:id
   * - Updates the status of a Price Manager record
   */
  static async updateStatus(req, res) {
    try {
      const { dimension_id } = req.params;
      const { status, status_remarks } = req.body;

      const { error } = validatePriceManagerStatusUpdate({ status, status_remarks });
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const result = await pool.query(
        `
      UPDATE sdd_fixed_pricing 
      SET status = $1, status_remarks = $2, updated_date_time = CURRENT_TIMESTAMP
      WHERE dimension_id = $3
      RETURNING *
    `,
        [status, status_remarks, dimension_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json(errorResponse('No record found to update status'));
      }

      return res
        .status(200)
        .json(successResponse(result.rows[0], 'Status updated successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.updateStatus:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }


  /**
   * DELETE /price-manager/:id
   * - Deletes a Price Manager record from DB
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedRecord = await PriceManagerDeleteModel.delete(id);

      if (!deletedRecord) {
        return res.status(404).json(errorResponse(`No record found with id: ${id}`));
      }

      return res.status(200).json(successResponse(deletedRecord, 'Price Manager record deleted successfully'));
    } catch (err) {
      console.error('Error in PriceManagerController.delete:', err);
      return res.status(500).json(errorResponse('Internal Server Error'));
    }
  }
}

module.exports = PriceManagerController;
