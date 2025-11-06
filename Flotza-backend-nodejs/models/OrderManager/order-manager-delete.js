const pool = require('../../config/db');

class OrderManagerDelete {
  // Delete an order by ID and refund wallet
  static async deleteOrder(orderId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch the order
      const orderRes = await client.query(
        `SELECT customer_id, final_payable 
         FROM orders 
         WHERE order_id = $1`,
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        throw new Error('Order not found');
      }

      let { customer_id, final_payable } = orderRes.rows[0];

      final_payable = Math.round(Number(final_payable));

      // 2. Refund to wallet (update balance)
      await client.query(
        `UPDATE customers 
         SET wallet_balance = wallet_balance + $1 
         WHERE customer_id = $2`,
        [final_payable, customer_id]
      );

      // 3. Generate transaction_id
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).toString().slice(-2);
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const SS = String(now.getSeconds()).padStart(2, '0');

      const datePart = `${dd}${mm}${yy}`;
      const timePart = `${HH}${MM}${SS}`;
      const serialRes = await client.query(
        `SELECT COALESCE(MAX(serial_number), 0) + 1 AS next 
         FROM wallet_manager`
      );
      const serial_number = serialRes.rows[0].next;
      const transaction_id = `cr${datePart}${timePart}${String(serial_number).padStart(2, '0')}`;

      // 4. Insert refund transaction in wallet_manager
      await client.query(
        `INSERT INTO wallet_manager (
          serial_number, transaction_date, transaction_time, transaction_id,
          credit_debit, transaction_type, amount, payment_method,
          customer_id, user_wallet_balance, remarks, central_balance,
          created_at, updated_at
        ) VALUES (
          $1, CURRENT_DATE, CURRENT_TIME, $2,
          'credit', 'Order Refund', $3, 'Wallet',
          $4,
          (SELECT wallet_balance FROM customers WHERE customer_id = $4),
          'Order deleted & refunded',
          (SELECT COALESCE(SUM(CASE WHEN credit_debit='credit' THEN amount ELSE -amount END), 0) FROM wallet_manager),
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
        [serial_number, transaction_id, final_payable, customer_id]
      );

      // 5. Delete the order
      const deleteRes = await client.query(
        `DELETE FROM orders WHERE order_id = $1 RETURNING *`,
        [orderId]
      );

      await client.query('COMMIT');
      return deleteRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = OrderManagerDelete;
