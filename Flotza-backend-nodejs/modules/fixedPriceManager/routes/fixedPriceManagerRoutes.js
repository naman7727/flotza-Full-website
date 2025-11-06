const express = require('express');
const router = express.Router();
const PriceManagerController = require('../controllers/fixedPriceManagerController');
const { authMiddleware } = require('../../../utils/authMiddleware');

// ✅ Register a new Price Manager
router.post('/register', authMiddleware(['admin']), PriceManagerController.register);

// ✅ Get all Price Manager records
router.get('/all', authMiddleware(['admin']), PriceManagerController.getAll);

// ✅ Get a specific Price Manager record by dimension_id
router.get('/:dimension_id', authMiddleware(['admin']), PriceManagerController.getById);

// ✅ Get all Price Manager records by customer_id
router.get('/customer/:customer_id', authMiddleware(['admin', 'customer']), PriceManagerController.getByCustomer);

// ✅ Update a Price Manager record by dimension_id
router.put('/:dimension_id', authMiddleware(['admin']), PriceManagerController.update);

// ✅ Update the status of a Price Manager record by dimension_id
router.put('/:dimension_id/status', authMiddleware(['admin']), PriceManagerController.updateStatus);

// ✅ Delete a Price Manager record by id
router.delete('/:id', authMiddleware(['admin']), PriceManagerController.delete);

module.exports = router;
