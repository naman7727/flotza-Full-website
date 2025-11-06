const OrderManagerRegister = require('../../../models/OrderManager/order-manager-register');
const OrderManagerModel = require('../../../models/OrderManager/order-manager-get-all');
const OrderManagerDelete = require('../../../models/OrderManager/order-manager-delete');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateCreateOrder, validateDeleteOrder } = require('../../../utils/validation');

class OrderManagerController {
  static async create(req, res) {
    try {
      const { error } = validateCreateOrder(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const orderData = req.body;
      const order = await OrderManagerRegister.createOrder(orderData);

      return res.status(201).json(successResponse(order, 'Order created successfully'));
    } catch (err) {
      console.error('Error creating order:', err);
      return res.status(500).json(errorResponse(err.message));
    }
  }

  static async getAll(req, res) {
    try {
      const orders = await OrderManagerModel.getAllOrders();
      return res.status(200).json(successResponse(orders, 'Orders fetched successfully'));
    } catch (err) {
      return res.status(500).json(errorResponse(err.message));
    }
  }

  static async getById(req, res) {
    try {
      const { order_id } = req.params;
      const order = await OrderManagerModel.getOrderById(order_id);
      if (!order) {
        return res.status(404).json(errorResponse('Order not found'));
      }
      return res.status(200).json(successResponse(order, 'Order fetched successfully'));
    } catch (err) {
      return res.status(500).json(errorResponse(err.message));
    }
  }

  static async getByCustomerId(req, res) {
    try {
      const { customer_id } = req.params;
      const orders = await OrderManagerModel.getOrdersByCustomerId(customer_id);
      return res.status(200).json(successResponse(orders, 'Orders fetched successfully'));
    } catch (err) {
      return res.status(500).json(errorResponse(err.message));
    }
  }

  static async delete(req, res) {
    try {
      const { error } = validateDeleteOrder(req.params);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const { order_id } = req.params;
      const deletedOrder = await OrderManagerDelete.deleteOrder(order_id);

      if (!deletedOrder) {
        return res.status(404).json(errorResponse('Order not found'));
      }

      return res
        .status(200)
        .json(successResponse(deletedOrder, 'Order deleted & refunded successfully'));
    } catch (err) {
      return res.status(500).json(errorResponse(err.message));
    }
  }

}

module.exports = OrderManagerController;
