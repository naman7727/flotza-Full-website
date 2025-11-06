// ✅ Import Express framework
const express = require('express');

// ✅ Import Commodities Controller (contains logic for handling requests)
const { commoditiesControllers ,  } = require('../controllers');

// ✅ Import authentication middleware
// This middleware ensures that only users with the 'admin' role can access these routes
const { authMiddleware } = require('../../../utils/authMiddleware');

// ✅ Create a new Express Router instance
const router = express.Router();
// All Routes of Commodities keywords
router.get('/', authMiddleware(['customer','admin']), commoditiesControllers.getAll);
router.get('/prefix', authMiddleware(['customer','admin']), commoditiesControllers.getPrefix);
router.post('/', authMiddleware(['admin']), commoditiesControllers.postCommodities);
router.post('/multi-insert', authMiddleware(['admin']), commoditiesControllers.multiPostCommodities);
router.post('/delete', authMiddleware(['admin']), commoditiesControllers.removeCommoditiesSingle);
router.post('/multi-delete', authMiddleware(['admin']), commoditiesControllers.removeCommoditiesMulti);



// All Routes of Commodities Blocked keywords
router.get('/block', authMiddleware(['customer','admin']), commoditiesControllers.getAllBlocked);
router.get('/block/prefix', authMiddleware(['customer','admin']), commoditiesControllers.getPrefixBlockedKeyword);
router.post('/block/', authMiddleware(['admin']), commoditiesControllers.postBlocked);
router.post('/block/multi-insert', authMiddleware(['admin']), commoditiesControllers.multiPostBlocked);
router.post('/block/delete', authMiddleware(['admin']), commoditiesControllers.removeSingleBlocked);
router.post('/block/multi-delete', authMiddleware(['admin']), commoditiesControllers.removeMultiBlocked);


module.exports = router;