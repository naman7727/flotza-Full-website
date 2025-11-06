const pool = require('../../../config/db');
const DynamicPriceManagerRegister = require('../../../models/DynamicPriceManager/dynamic-price-manger-register');
const DynamicPriceManagerModel = require('../../../models/DynamicPriceManager/dynamic-price-manager-get-all');
const DynamicPriceManagerUpdateModel = require('../../../models/DynamicPriceManager/dynamic-price-manager-update');
const DynamicPriceManagerDeleteModel = require('../../../models/DynamicPriceManager/dynamic-price-manager-delete');
const { validateDynamicPriceCreate } = require('../../../utils/validation');
const { validateDynamicPriceUpdate } = require('../../../utils/validation');
const { successResponse, errorResponse } = require('../../../utils/response');

class DynamicPriceManagerController {
    static async create(req, res) {
        try {
            const { error } = validateDynamicPriceCreate(req.body);
            if (error) return res.status(400).json(errorResponse(error.details[0].message));

            const newDynamicPrice = await DynamicPriceManagerRegister.createDynamicPrice(req.body);
            return res.status(201).json(successResponse(newDynamicPrice, 'Dynamic Price created successfully'));
        } catch (err) {
            console.error('Create Dynamic Price Error:', err);
            return res.status(500).json(errorResponse(err.message));
        }
    }

    static async getAll(req, res) {
        try {
            const dynamicPrices = await DynamicPriceManagerModel.getAll();
            return res.status(200).json(successResponse(dynamicPrices, 'Dynamic Prices retrieved successfully'));
        } catch (err) {
            console.error('Get All Dynamic Prices Error:', err);
            return res.status(500).json(errorResponse(err.message));
        }
    }

    static async getActive(req, res) {
        try {
            const activeDynamicPrice = await DynamicPriceManagerModel.getactive();
            if (!activeDynamicPrice) {
                return res.status(404).json(errorResponse('No active dynamic price found.'));
            }
            return res.status(200).json(successResponse(activeDynamicPrice, 'Active Dynamic Price retrieved successfully'));
        } catch (err) {
            console.error('Failed to get Active Dynamic Price Error:', err);
            return res.status(500).json(errorResponse(err.message));
        }
    }

    static async update(req, res) {
        try {
            const { dynamic_price_id } = req.params;
            const { status, status_remark } = req.body;

            const { error } = validateDynamicPriceUpdate({ status, status_remark });
            if (error) return res.status(400).json(errorResponse(error.details[0].message));

            // If trying to activate, ensure no other active exists
            if (status === 'active') {
                const checkActive = await pool.query(
                    'SELECT dynamic_price_id FROM sdd_dynamic_pricing WHERE status = $1 AND dynamic_price_id != $2',
                    ['active', dynamic_price_id]
                );
                if (checkActive.rows.length > 0) {
                    return res.status(409).json(errorResponse('Only one dynamic price can be active at a time.'));
                }
            }

            // Use model to perform the update
            const updatedDynamicPrice = await DynamicPriceManagerUpdateModel.update(dynamic_price_id, status, status_remark);

            return res.status(200).json(successResponse(updatedDynamicPrice, 'Dynamic Price status updated successfully'));
        } catch (err) {
            console.error('Update Dynamic Price Status Error:', err);

            if (err.message.includes('No dynamic price found')) {
                return res.status(404).json(errorResponse(err.message));
            }

            return res.status(500).json(errorResponse('An unexpected error occurred while updating dynamic price.'));
        }
    }


    static async delete(req, res) {
        try {
            const { dynamic_price_id } = req.params;
            const deletedDynamicPrice = await DynamicPriceManagerDeleteModel.delete(dynamic_price_id);

            if (!deletedDynamicPrice) {
                return res.status(404).json(errorResponse('No dynamic price found with the given ID.'));
            }

            return res.status(200).json(successResponse(deletedDynamicPrice, 'Dynamic Price deleted successfully'));
        } catch (err) {
            console.error('Delete Dynamic Price Error:', err);
            return res.status(500).json(errorResponse('An unexpected error occurred while deleting dynamic price.'));
        }
    }

}

module.exports = DynamicPriceManagerController;