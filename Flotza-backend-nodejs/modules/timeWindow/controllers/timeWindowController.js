const TimeWindowRegisterModel = require('../../../models/TimeWindow/time-window-register');
const TimeWindowGetAllModel = require('../../../models/TimeWindow/time-window-all-source');
const TimeWindowUpdateModel = require('../../../models/TimeWindow/time-window-update');
const TimeWindowDeleteModel = require('../../../models/TimeWindow/time-window-delete');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateTimeWindowCreate, validateTimeWindowUpdate } = require('../../../utils/validation');

class TimeWindowController {
    static async create(req, res) {
        try {
            const { error } = validateTimeWindowCreate(req.body);
            if (error) {
                return res.status(400).json(errorResponse(error.details[0].message));
            }
            const newWindow = await TimeWindowRegisterModel.registerTimeWindow(req.body);
            return res.status(201).json(successResponse(newWindow, 'Time window registered successfully'));
        } catch (err) {
            console.error('Create Time Window Error:', err);
            return res.status(400).json(errorResponse(err.message));
        }
    }

    static async getAll(req, res) {
        try {
            const timeWindows = await TimeWindowGetAllModel.getAll();
            return res.status(200).json(successResponse(timeWindows, 'Time windows fetched successfully'));
        } catch (err) {
            console.error('Get All Time Windows Error:', err);
            return res.status(500).json(errorResponse(err.message));
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { max_order_time } = req.body; 

            const { error } = validateTimeWindowUpdate({ max_order_time });
            if (error) {
                return res.status(400).json(errorResponse(error.details[0].message));
            }

            const updatedWindow = await TimeWindowUpdateModel.update(id, max_order_time); 
            return res.status(200).json(successResponse(updatedWindow, 'Time window updated successfully'));
        } catch (err) {
            console.error('Update Time Window Error:', err);
            return res.status(404).json(errorResponse(err.message));
        }
    }


    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedWindow = await TimeWindowDeleteModel.delete(id);

            if (!deletedWindow) {
                return res.status(404).json(errorResponse('Time window not found'));
            }

            return res.status(200).json(successResponse(deletedWindow, 'Time window deleted successfully'));
        } catch (err) {
            console.error('Delete Time Window Error:', err);
            return res.status(500).json(errorResponse(err.message));
        }
    }
}

module.exports = TimeWindowController;
