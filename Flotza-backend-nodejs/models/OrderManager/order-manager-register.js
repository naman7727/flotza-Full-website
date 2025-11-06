const pool = require('../../config/db');

class OrderManagerRegister {
  // Generate next formatted order_id like KB1, KB2, KB3
  static async generateOrderId(client) {
    const result = await client.query(
      `SELECT order_id 
       FROM orders 
       WHERE order_id ~ '^KB[0-9]+$'
       ORDER BY CAST(SUBSTRING(order_id FROM 3) AS INTEGER) DESC 
       LIMIT 1`
    );

    if (result.rows.length === 0) return 'KB1';

    const lastId = result.rows[0].order_id;
    const numPart = parseInt(lastId.replace('KB', ''), 10);
    return `KB${numPart + 1}`;
  }

  static async createOrder(orderData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const finalPayable = Math.round(Number(orderData.final_payable));

      // 🔹 Check customer balance + OD limit
      const customerRes = await client.query(
        `SELECT c.wallet_balance, 
                COALESCE(o.od_limit, 0) AS od_limit
         FROM customers c
         LEFT JOIN od_limit_manager o ON c.customer_id = o.customer_id
         WHERE c.customer_id = $1`,
        [orderData.customer_id]
      );

      if (customerRes.rows.length === 0) {
        throw new Error('Customer not found');
      }

      let walletBalance = parseFloat(customerRes.rows[0].wallet_balance) || 0;
      const odLimit = parseFloat(customerRes.rows[0].od_limit) || 0;

      // Balance check
      if (walletBalance + odLimit < finalPayable) {
        throw new Error(
          `Insufficient wallet balance. Available: ₹${walletBalance}, OD Limit: ₹${odLimit}`
        );
      }

      //  Deduct (can go negative)
      walletBalance -= finalPayable;

      await client.query(
        `UPDATE customers 
         SET wallet_balance = $1 
         WHERE customer_id = $2`,
        [walletBalance, orderData.customer_id]
      );

      // 🔹 Generate transaction_id
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
        `SELECT COALESCE(MAX(serial_number), 0) + 1 AS next FROM wallet_manager`
      );
      const serial_number = serialRes.rows[0].next;
      const transaction_id = `dr${datePart}${timePart}${String(serial_number).padStart(2, '0')}`;

      // 🔹 Insert into wallet_manager
      await client.query(
        `INSERT INTO wallet_manager (
          serial_number, transaction_date, transaction_time, transaction_id,
          credit_debit, transaction_type, amount, payment_method,
          customer_id, user_wallet_balance, remarks, central_balance,
          created_at, updated_at
        ) VALUES (
          $1, CURRENT_DATE, CURRENT_TIME, $2,
          'debit', 'Order Charge', $3, 'Wallet',
          $4,
          (SELECT wallet_balance FROM customers WHERE customer_id = $4),
          'Order placed',
          (SELECT COALESCE(SUM(CASE WHEN credit_debit='credit' THEN amount ELSE -amount END), 0) FROM wallet_manager),
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )`,
        [serial_number, transaction_id, finalPayable, orderData.customer_id]
      );

      // 🔹 Generate new order_id
      const order_id = await this.generateOrderId(client);

      // 🔹 Insert into orders
      const query = `
        INSERT INTO orders (
          order_id, 
          customer_id, 
          pickup_place_id, 
          drop_place_id, 
          schedule_date,
          preferred_pickup_time,
          consignee_closing_time,
          pickup_note,
          drop_note,
          commodity,
          price_module_type,
          express_delivery,
          express_charges,
          challan_return,
          challan_pic,
          challan_return_status,
          challan_charges,
          cod_collection,
          cod_amount,
          cod_status,
          cod_charges,
          dimensions,
          total_units,
          total_gross_weight,
          total_vol_weight,
          total_volume,
          chargeable_weight,
          transportation_charges,
          applied_coupon,
          coupon_discount,
          pre_tax_amount,
          gst_percentage,
          gst_amount,
          final_payable
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25,
          $26, $27, $28, $29, $30,
          $31, $32, $33, $34
        )
        RETURNING *;
      `;

      const values = [
        order_id,                          // $1
        orderData.customer_id,             // $2
        orderData.pickup_place_id,         // $3
        orderData.drop_place_id,           // $4
        orderData.schedule_date,           // $5
        orderData.preferred_pickup_time,   // $6
        orderData.consignee_closing_time,  // $7
        orderData.pickup_note,             // $8
        orderData.drop_note,               // $9
        JSON.stringify(orderData.commodity), // $10
        orderData.price_module_type,       // $11
        orderData.express_delivery,        // $12
        orderData.express_charges,         // $13
        orderData.challan_return,          // $14
        orderData.challan_pic,             // $15
        orderData.challan_return_status,   // $16
        orderData.challan_charges,         // $17
        orderData.cod_collection,          // $18
        orderData.cod_amount,              // $19
        orderData.cod_status,              // $20
        orderData.cod_charges,             // $21
        JSON.stringify(orderData.dimensions), // $22
        orderData.total_units,             // $23
        orderData.total_gross_weight,      // $24
        orderData.total_vol_weight,        // $25
        orderData.total_volume,            // $26
        orderData.chargeable_weight,       // $27
        orderData.transportation_charges,  // $28
        orderData.applied_coupon,          // $29
        orderData.coupon_discount,         // $30
        orderData.pre_tax_amount,          // $31
        orderData.gst_percentage,          // $32
        orderData.gst_amount,              // $33
        finalPayable,                      // $34
      ];

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = OrderManagerRegister;
