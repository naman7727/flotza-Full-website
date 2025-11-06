const express = require('express');
const router = express.Router();
const WalletManagerController = require('../controllers/WalletManagerController');
const WalletBankingDetailsController = require('../controllers/WalletBankingDetailsController');
const WalletManualRechargeController = require('../controllers/WalletManualRechargeController');
const { authMiddleware } = require('../../../utils/authMiddleware');
const upload = require('../../../utils/fileUpload');


/* ===========================
   Wallet Banking Details Routes
=========================== */
// Admin APIs
router.post(
    '/banking-details',
    authMiddleware(['admin']),
    upload.single('qr_code_image'),
    WalletBankingDetailsController.createBankingDetails
);
router.put(
    '/banking-details/:bankId',
    authMiddleware(['admin']),
    upload.single('qr_code_image'),
    WalletBankingDetailsController.updateBankingDetails
);
router.delete(
    '/banking-details/:bankId',
    authMiddleware(['admin']),
    WalletBankingDetailsController.deleteBankingDetails
);

// Admin & Customer
router.get(
    '/banking-details',
    authMiddleware(['admin', 'customer']),
    WalletBankingDetailsController.getBankingDetails
);

/* ===========================
   Wallet Manual Recharge Routes
=========================== */
// Customer
router.post(
    '/recharge-request',
    authMiddleware(['customer']),
    upload.single('screenshot'),
    WalletManualRechargeController.createRechargeRequest
);
router.get(
    '/recharge-requests-customer/:customerId',
    authMiddleware(['admin', 'customer']),
    WalletManualRechargeController.getCustomerRechargeRequests
);

// Admin
router.get(
    '/recharge-requests',
    authMiddleware(['admin']),
    WalletManualRechargeController.getAllRechargeRequests
);
router.get(
    '/recharge-requests/:requestId',
    authMiddleware(['admin']),
    WalletManualRechargeController.getRechargeRequestById
);
router.post(
    '/recharge-requests/:requestId',
    authMiddleware(['admin']),
    upload.none(),
    WalletManualRechargeController.handleRechargeRequest
);
router.get(
    '/pending-recharge-count',
    authMiddleware(['admin']),
    WalletManualRechargeController.getPendingRechargeCount
);

/* ===========================
   Wallet Manager Routes
=========================== */
// ✅ Admin APIs
router.post('/register', authMiddleware(['admin']), WalletManagerController.createTransaction);
router.get('/all', authMiddleware(['admin']), WalletManagerController.getAll);

// ✅ Customer API
router.get(
    '/manual-recharge-request-history',
    authMiddleware(['customer']),
    WalletManualRechargeController.getManualRechargeRequestHistory
);
router.get('/:customerId', authMiddleware(['customer', 'admin']), WalletManagerController.getCustomerHistory);
// ✅ Add in your wallet routes file



module.exports = router;
