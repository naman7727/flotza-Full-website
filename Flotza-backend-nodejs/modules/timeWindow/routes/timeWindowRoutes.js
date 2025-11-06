const express = require('express');
const router = express.Router();
const TimeWindowController = require('../controllers/timeWindowController');
const { authMiddleware } = require('../../../utils/authMiddleware');

router.post('/', authMiddleware(['admin']), TimeWindowController.create);
router.get('/all', authMiddleware(['admin']), TimeWindowController.getAll);
router.put('/:id', authMiddleware(['admin']), TimeWindowController.update);
router.delete('/:id', authMiddleware(['admin']), TimeWindowController.delete);

module.exports = router;
