const express = require('express');
const router = express.Router();
const OdLimitController = require('../controllers/odLimitController');
const { authMiddleware } = require('../../../utils/authMiddleware');


router.get('/all', authMiddleware(['admin']), OdLimitController.getAll);
router.put('/:customer_id', authMiddleware(['admin']), OdLimitController.updateODLimit);

module.exports = router;
