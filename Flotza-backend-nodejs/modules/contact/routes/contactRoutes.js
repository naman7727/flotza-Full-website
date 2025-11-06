const express = require('express');
const { ContactController } = require('../controllers');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/', ContactController.create);
router.get('/:messageId', authMiddleware(['admin','vendor']), ContactController.getById);
router.get('/', authMiddleware(['admin','vendor']), ContactController.getAll);
router.put('/:messageId', authMiddleware(['admin','vendor']), ContactController.update);
router.delete('/:messageId', authMiddleware(['admin','vendor']), ContactController.delete);

module.exports = router;