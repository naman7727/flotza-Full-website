const pool = require('../../config/db');

class OrderManagerModel {
    static async getAllOrders() {
        try {
            const query = 'SELECT * FROM orders';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    static async getOrderById(order_id) {
        try {
            const query = 'SELECT * FROM orders WHERE order_id = $1';
            const result = await pool.query(query, [order_id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            return null;
        }
    }

    static async getOrdersByCustomerId(customer_id) {
        try {
            const query = 'SELECT * FROM orders WHERE customer_id = $1';
            const result = await pool.query(query, [customer_id]);
            return result.rows;
        } catch (error) {
            console.error('Error fetching orders by customer ID:', error);
            return [];
        }
    }

} 

module.exports = OrderManagerModel;