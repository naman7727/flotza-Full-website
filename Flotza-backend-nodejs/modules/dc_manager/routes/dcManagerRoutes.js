// ✅ Import Express framework
const express = require('express');

// ✅ Import DC Manager Controller (contains logic for handling requests)
const { DcManagerController } = require('../controllers');

// ✅ Import authentication middleware
// This middleware ensures that only users with the 'admin' role can access these routes
const { authMiddleware } = require('../../../utils/authMiddleware');

// ✅ Create a new Express Router instance
const router = express.Router();

/**
 * ✅ Route: POST /dc-manager
 * - Purpose: Create a new DC Manager record
 * - Access: Admin only
 * - Controller: DcManagerController.create
 */
router.post('/', authMiddleware(['admin']), DcManagerController.create);

/**
 * ✅ Route: GET /dc-manager
 * - Purpose: Fetch all DC Manager records
 * - Access: Admin only
 * - Controller: DcManagerController.getAll
 */
router.get('/', authMiddleware(['admin', 'customer']), DcManagerController.getAll);

/**
 * POST /dc-manager/find-nearest-dc
 * - Purpose: Assign nearest DC branch based on lat/lng
 * - Access: Admin & Customer
 */
router.post('/find-nearest-dc', authMiddleware(['admin', 'customer']), DcManagerController.findNearestDC);

/**
 * GET /dc-manager/:branchId
 * - Fetches one DC Manager record by branch_id
 * - Access: Admin only
 */
router.get('/:branchId', authMiddleware(['admin']), DcManagerController.getSingle);

/**
 * ✅ Route: PUT /dc-manager/:branchId
 * - Purpose: Update an existing DC Manager by branchId
 * - Access: Admin only
 * - Controller: DcManagerController.update
 */
router.put('/:branchId', authMiddleware(['admin']), DcManagerController.update);

/**
 * ✅ Route: DELETE /dc-manager/:branchId
 * - Purpose: Delete a DC Manager by branchId
 * - Access: Admin only
 * - Controller: DcManagerController.delete
 */
router.delete('/:branchId', authMiddleware(['admin']), DcManagerController.delete);

/**
 * GET /dc-manager/closing-time/:shipperId
 * - Purpose: Get the closing time for a specific shipper
 * - Access: Admin & Customer
 */
router.get('/closing-time/:shipperId', authMiddleware(['admin', 'customer']), DcManagerController.getClosingTimeByShipper);


// router.get('/:branchId', authMiddleware(['admin']), DcManagerController.getById);
// router.put('/:branchId', authMiddleware(['admin']), DcManagerController.update);
// router.delete('/:branchId', authMiddleware(['admin']), DcManagerController.delete);

// // New range management endpoints
// router.post('/:branchId/ranges/pickup', authMiddleware(['admin']), DcManagerController.addPickupRange);
// router.post('/:branchId/ranges/drop', authMiddleware(['admin']), DcManagerController.addDropRange);
// router.delete('/:branchId/ranges/pickup/:rangeId', authMiddleware(['admin']), DcManagerController.deletePickupRange);
// router.delete('/:branchId/ranges/drop/:rangeId', authMiddleware(['admin']), DcManagerController.deleteDropRange);

module.exports = router;