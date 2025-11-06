const express = require('express');
const { CustomerController } = require('../controllers');
const upload = require('../../../utils/fileUpload');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'adhar_front_photo', maxCount: 1 },
  { name: 'adhar_back_photo', maxCount: 1 },
  { name: 'pan_card_photo', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
]), CustomerController.register);
router.post('/login', CustomerController.login);
router.get('/me', authMiddleware(['customer']), CustomerController.getProfile);


router.get('/', authMiddleware(['admin']), CustomerController.getAll);
router.put('/:customerId', authMiddleware(['customer','admin']), upload.fields([
  { name: 'adhar_front_photo', maxCount: 1 },
  { name: 'adhar_back_photo', maxCount: 1 },
  { name: 'pan_card_photo', maxCount: 1 },
  { name: 'profile_picture', maxCount: 1 },
]), CustomerController.update);
router.delete('/:customerId', authMiddleware(['admin']), CustomerController.delete);
router.post('/multiple', authMiddleware(['admin']), CustomerController.deleteMultiple); 
router.post('/all', authMiddleware(['admin']), CustomerController.deleteAll); 
router.get('/:customerId', authMiddleware(['admin']), CustomerController.getById);



module.exports = router;