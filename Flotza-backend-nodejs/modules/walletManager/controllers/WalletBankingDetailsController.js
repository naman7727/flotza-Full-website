const BankingDetailsModel = require('../../../models/WalletManager/wallet-manager-banking-details');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateBankingDetails } = require('../../../utils/validation');

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
function formatBankingDetails(details, req) {
  if (!details) return details;
  return { ...details, qr_code_image: toPublicUrl(details.qr_code_image, req) };
}

class WalletBankingDetailsController {
  /** Create new banking details entry (Admin only) */
  static async createBankingDetails(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(errorResponse('QR code image is required'));
      }

      // Normalize inputs (multipart/form-data sends strings)
      const normalizeBoolean = (v) => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return ['true', '1', 'yes', 'on'].includes(v.toLowerCase());
        return false;
      };
      const body = {
        ...req.body,
        qr_code_image: req.file.path,
        primary_status: normalizeBoolean(req.body.primary_status),
        addition_date: new Date().toISOString(),
      };

      const { error } = validateBankingDetails(body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const bankingDetails = await BankingDetailsModel.createBankingDetails(body);
      return res.status(201).json(successResponse(formatBankingDetails(bankingDetails, req), 'Banking details created successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Fetch all banking details (Admin & Customer) */
  static async getBankingDetails(req, res) {
    try {
      let data = await BankingDetailsModel.getBankingDetails();
      data = data.map(d => formatBankingDetails(d, req));
      return res.status(200).json(successResponse(data, 'Banking details fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Update an existing banking details record (Admin only) */
  static async updateBankingDetails(req, res) {
    try {
      // Normalize inputs (multipart/form-data sends strings)
      const normalizeBoolean = (v) => {
        if (v === undefined) return undefined;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return ['true', '1', 'yes', 'on'].includes(v.toLowerCase());
        return Boolean(v);
      };
      const body = { ...req.body };
      if (req.file) {
        body.qr_code_image = req.file.path;
      }
      if (body.primary_status !== undefined) {
        body.primary_status = normalizeBoolean(body.primary_status);
      }
      const { error } = validateBankingDetails(body, true);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const bankingDetails = await BankingDetailsModel.updateBankingDetails(req.params.bankId, body);
      return res.status(200).json(successResponse(formatBankingDetails(bankingDetails, req), 'Banking details updated successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /** Delete a banking details record (Admin only) */
  static async deleteBankingDetails(req, res) {
    try {
      const bankingDetails = await BankingDetailsModel.deleteBankingDetails(req.params.bankId);
      return res.status(200).json(successResponse(formatBankingDetails(bankingDetails, req), 'Banking details deleted successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

module.exports = WalletBankingDetailsController;
