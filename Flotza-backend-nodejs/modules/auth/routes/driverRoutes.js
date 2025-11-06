const express = require('express');
const { DriverController } = require('../controllers');
const upload = require('../../../utils/fileUpload');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'current_address_proof', maxCount: 1 },
  { name: 'pan_card_photo', maxCount: 1 },
  { name: 'aadhar_front_photo', maxCount: 1 },
  { name: 'aadhar_back_photo', maxCount: 1 },
  { name: 'driving_licence_photo', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
]), DriverController.register);
router.post('/login', DriverController.login);
router.get('/me', authMiddleware(['sdddriver']), DriverController.getProfile);

router.get('/', authMiddleware(['admin']), DriverController.getAll);
router.put('/:driverId', authMiddleware(['sdddriver','admin']), upload.fields([
  { name: 'current_address_proof', maxCount: 1 },
  { name: 'pan_card_photo', maxCount: 1 },
  { name: 'aadhar_front_photo', maxCount: 1 },
  { name: 'aadhar_back_photo', maxCount: 1 },
  { name: 'driving_licence_photo', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
]), DriverController.update);
router.delete('/:driverId', authMiddleware(['admin']), DriverController.delete);
router.post('/multiple', authMiddleware(['admin']), DriverController.deleteMultiple); 
router.patch(
  '/me',
  authMiddleware(['sdddriver', 'driver']),
  upload.fields([
    { name: 'current_address_proof', maxCount: 1 },
    { name: 'pan_card_photo', maxCount: 1 },
    { name: 'aadhar_front_photo', maxCount: 1 },
    { name: 'aadhar_back_photo', maxCount: 1 },
    { name: 'driving_licence_photo', maxCount: 1 },
    { name: 'profile_picture', maxCount: 1 },
  ]),
  DriverController.updateSelf 
);

module.exports = router;