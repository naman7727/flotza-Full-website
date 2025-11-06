const express = require('express');
const router = express.Router();
const PlaceManagerController = require('../controllers/placeManagerController');
const { authMiddleware } = require('../../../utils/authMiddleware');

// Create (Register) new Place Manager
router.post('/register', authMiddleware(['customer', 'admin']), PlaceManagerController.create);

// ✅ Get Place by Source API
router.get('/singleSource/:place_source', authMiddleware(['customer', 'admin']), PlaceManagerController.getBySource);

// ✅ Get All Places API
router.get('/allSource', authMiddleware(['customer', 'admin']), PlaceManagerController.getAll);

router.delete('/place/:place_id',authMiddleware(['customer', 'admin']), PlaceManagerController.deletePlaceById);

// ✅ Route to update place manager by place_id
router.put('/place/:place_id', authMiddleware(['admin', 'customer']), PlaceManagerController.updatePlaceById);

router.get('/search', authMiddleware(['customer', 'admin']), PlaceManagerController.searchPlaces);

module.exports = router;