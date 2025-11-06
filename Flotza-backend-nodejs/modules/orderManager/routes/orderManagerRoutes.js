const express = require('express');
const router = express.Router();
const OrderManagerController = require('../controllers/OrderManagerController');
const { authMiddleware } = require('../../../utils/authMiddleware');

// Create Order
router.post('/', authMiddleware(['customer', 'admin']), OrderManagerController.create);

// Get All Orders
router.get('/', authMiddleware(['customer', 'admin']), OrderManagerController.getAll);

// Get Order by ID
router.get('/:order_id', authMiddleware(['customer', 'admin']), OrderManagerController.getById);

// Get Orders by Customer ID
router.get('/customer/:customer_id', authMiddleware(['customer', 'admin']), OrderManagerController.getByCustomerId);

// Delete Order
router.delete('/:order_id', authMiddleware(['admin']), OrderManagerController.delete);

module.exports = router;
