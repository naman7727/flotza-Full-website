const WalletModel = require('../../../models/WalletManager/wallet-manager-data');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateWalletTransaction } = require('../../../utils/validation');

class WalletManagerController {
  // ✅ Admin - Push/Deduct Transaction
  static async createTransaction(req, res) {
    try {
      const { error } = validateWalletTransaction(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const transaction = await WalletModel.createTransaction(req.body);
      return res.status(201).json(successResponse(transaction, 'Wallet transaction recorded successfully'));
    } catch (error) {
      console.error('Create Transaction Error:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  // ✅ Admin - Get all transactions
  static async getAll(req, res) {
    try {
      const data = await WalletModel.getAllTransactions();
      return res.status(200).json(successResponse(data, 'All transactions fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  // ✅ Customer - Get own wallet history
  static async getCustomerHistory(req, res) {
    try {
      const { customerId } = req.params;
      const data = await WalletModel.getCustomerTransactions(customerId);
      return res.status(200).json(successResponse(data, 'Customer wallet history fetched'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

module.exports = WalletManagerController;
