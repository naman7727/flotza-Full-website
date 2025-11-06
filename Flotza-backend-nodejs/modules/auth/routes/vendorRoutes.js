const express = require('express');
const { VendorController } = require('../controllers');
const upload = require('../../../utils/fileUpload');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'gst_upload', maxCount: 1 },
  { name: 'pan_card_photo_upload', maxCount: 1 },
  { name: 'aadhar_front_photo_upload', maxCount: 1 },
  { name: 'aadhar_back_photo_upload', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
]), VendorController.register);

router.post('/login', VendorController.login);
router.get('/me', authMiddleware(['vendor']), VendorController.getProfile);
router.get('/', authMiddleware(['admin']), VendorController.getAll);
router.delete('/:vendorId', authMiddleware(['admin']), VendorController.delete);
router.post('/multiple', authMiddleware(['admin']), VendorController.deleteMultiple); 
router.put('/:vendorId', upload.fields([
  { name: 'gst_upload', maxCount: 1 },
  { name: 'pan_card_photo_upload', maxCount: 1 },
  { name: 'aadhar_front_photo_upload', maxCount: 1 },
  { name: 'aadhar_back_photo_upload', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
]), authMiddleware(['vendor','admin']), VendorController.update);

module.exports = router;
