const ManualRechargeModel = require('../../../models/WalletManager/wallet-manager-manual-recharge');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateRechargeRequest } = require('../../../utils/validation');

// Helpers
function toPublicUrl(filePath, req) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  let relativePath = normalized;
  if (!normalized.startsWith('/uploads/')) {
    const idx = normalized.indexOf('uploads/');
    relativePath = idx !== -1 ? '/' + normalized.slice(idx) : '/' + normalized;
  }
  return req.protocol + '://' + req.get('host') + relativePath;
}
function formatRechargeRequest(request, req) {
  if (!request) return request;
  return { ...request, screenshot: toPublicUrl(request.screenshot, req) };
}

class WalletManualRechargeController {
  /** Create a manual recharge request (Customer only) */
  static async createRechargeRequest(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('Screenshot is required'));
      }
      if (!req.user || !req.user.customer_id) {
        return res.status(401).json(errorResponse('Customer ID is missing from authentication'));
      }

      const body = {
        amount: req.body.amount,
        screenshot: req.file.path,
        selected_bank_id: req.body.selected_bank_id || null,
        status_remark: req.body.status_remark || 'Pending request'
      };

      const { error } = validateRechargeRequest(body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const request = await ManualRechargeModel.createRechargeRequest(body, req.user.customer_id);
      return res.status(201).json(successResponse(formatRechargeRequest(request, req), 'Recharge request submitted'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Fetch all recharge requests (Admin only) */
  static async getAllRechargeRequests(req, res) {
    try {
      let data = await ManualRechargeModel.getAllRechargeRequests();
      data = data.map(d => formatRechargeRequest(d, req));
      return res.status(200).json(successResponse(data, 'All recharge requests fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Fetch recharge request by ID (Admin only) */
  static async getRechargeRequestById(req, res) {
    try {
      const { requestId } = req.params;
      let data = await ManualRechargeModel.getRechargeRequestById(requestId);
      if (!data) throw new Error('Request not found');
      return res.status(200).json(successResponse(formatRechargeRequest(data, req), 'Recharge request fetched'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /** Approve or reject a recharge request (Admin only) */
  static async handleRechargeRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { action, transactionId: bankTransactionId, status_remark } = req.body;

      let request = await ManualRechargeModel.handleRechargeRequest(
        requestId,
        action,
        bankTransactionId,
        status_remark
      );

      return res.status(200).json(successResponse(
        formatRechargeRequest(request, req),
        `${action} request processed`
      ));
    } catch (error) {
      console.error("RechargeRequest Error:", error);  
      return res.status(400).json(errorResponse(error.message));
    }
  }


  /** Fetch all recharge requests for a specific customer */
  static async getCustomerRechargeRequests(req, res) {
    try {
      const { customerId } = req.params;
      let data = await ManualRechargeModel.getCustomerRechargeRequests(customerId);
      data = data.map(d => formatRechargeRequest(d, req));
      return res.status(200).json(successResponse(data, 'Customer recharge requests fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Get count of pending recharge requests (Admin only) */
  static async getPendingRechargeCount(req, res) {
    try {
      const count = await ManualRechargeModel.getPendingRechargeCount();
      return res.status(200).json(successResponse({ count }, 'Pending recharge count fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
  // In WalletManualRechargeController.js
  static async getManualRechargeRequestHistory(req, res) {
    try {
      // ✅ Make sure customer_id exists in the token
      if (!req.user || !req.user.customer_id) {
        return res.status(401).json(errorResponse('Customer ID is missing from authentication'));
      }
      console.log(req); // to see what customer_id is actually set

      const customerId = req.user.customer_id;

      // Fetch that customer's recharge requests
      let data = await ManualRechargeModel.getCustomerRechargeRequests(customerId);

      // Convert screenshot paths to public URLs
      data = data.map(d => formatRechargeRequest(d, req));

      return res.status(200).json(
        successResponse(data, 'Manual recharge request history fetched successfully')
      );
    } catch (error) {
      console.error('Error fetching manual recharge request history:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }


}

module.exports = WalletManualRechargeController;
