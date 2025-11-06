const express = require('express');
const router = express.Router();
const DynamicPriceManagerController = require('../controllers/dynamicPriceManagerController');
const { authMiddleware } = require('../../../utils/authMiddleware');

router.post('/', authMiddleware(['admin']), DynamicPriceManagerController.create);
router.get('/all', authMiddleware(['admin']), DynamicPriceManagerController.getAll);
router.get('/active', authMiddleware(['customer']), DynamicPriceManagerController.getActive);
router.put('/:dynamic_price_id', authMiddleware(['admin']), DynamicPriceManagerController.update);
router.delete('/:dynamic_price_id', authMiddleware(['admin']), DynamicPriceManagerController.delete);

module.exports = router;
