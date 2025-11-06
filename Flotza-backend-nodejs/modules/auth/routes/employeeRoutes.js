const express = require('express');
const { EmployeeController } = require('../controllers');
const { authMiddleware } = require('../../../utils/authMiddleware');

const router = express.Router();

router.post('/register', EmployeeController.register);
router.post('/register', authMiddleware(['admin']), EmployeeController.register);
router.post('/login', EmployeeController.login);
router.get('/:employeeId', authMiddleware(['admin','manager', 'executive']), EmployeeController.getOne);

router.get('/me', authMiddleware(['admin', 'manager', 'executive']), EmployeeController.getProfile);
router.get('/', authMiddleware(['admin']), EmployeeController.getAll);
router.put('/:employeeId', authMiddleware(['admin']), EmployeeController.update);
router.delete('/:employeeId', authMiddleware(['admin']), EmployeeController.delete);

module.exports = router;