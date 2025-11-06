const pool = require('../../config/db');

class WalletModel {
  static async createTransaction(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get next serial number
      const serialRes = await client.query(`SELECT MAX(serial_number) AS max FROM wallet_manager`);
      const lastSerial = serialRes.rows[0].max || 0;
      const serial_number = Number(lastSerial) + 1;

      // Generate transaction date/time
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yy = String(now.getFullYear()).toString().slice(-2);
      const HH = String(now.getHours()).padStart(2, '0');
      const MM = String(now.getMinutes()).padStart(2, '0');
      const SS = String(now.getSeconds()).padStart(2, '0');

      const transaction_date = `${now.getFullYear()}-${mm}-${dd}`;
      const transaction_time = `${HH}:${MM}:${SS}`;
      const datePart = `${dd}${mm}${yy}`;
      const timePart = `${HH}${MM}${SS}`;
      const prefix = data.credit_debit === 'credit' ? 'cr' : 'dr';
      const transaction_id = `${prefix}${datePart}${timePart}${String(serial_number).padStart(2, '0')}`;

      // Get previous user wallet balance
      const userRes = await client.query(
        `SELECT user_wallet_balance FROM wallet_manager WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [data.customer_id]
      );
      const prevUserBalance = Number(userRes.rows[0]?.user_wallet_balance || 0);
      const amount = Number(data.amount);

      const user_wallet_balance =
        data.credit_debit === 'credit' ? prevUserBalance + amount : prevUserBalance - amount;

      // Get OD limit for this customer
      const odRes = await client.query(
        `SELECT od_limit FROM od_limit_manager WHERE customer_id = $1`,
        [data.customer_id]
      );
      const odLimit = Number(odRes.rows[0]?.od_limit || 0);

      // Checks if the transaction will violate the OD limit
      if (data.credit_debit === 'debit' && user_wallet_balance < -odLimit) {
        throw new Error(`Transaction denied. This would exceed the overdraft limit of ${odLimit}.`);
      }

      // Get previous central balance
      const centralRes = await client.query(`SELECT central_balance FROM wallet_manager ORDER BY created_at DESC LIMIT 1`);
      const prevCentralBalance = Number(centralRes.rows[0]?.central_balance || 0);

      const central_balance =
        data.credit_debit === 'credit' ? prevCentralBalance + amount : prevCentralBalance - amount;

      // Insert query
      const insertQuery = `
        INSERT INTO wallet_manager (
          serial_number, transaction_date, transaction_time, transaction_id,
          portal_transaction_id, portal_transaction_remarks_1, portal_transaction_remarks_2,
          credit_debit, transaction_type, amount, payment_method, customer_id,
          user_wallet_balance, remarks, central_balance, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *;
      `;

      const values = [
        serial_number,
        transaction_date,
        transaction_time,
        transaction_id,
        data.portal_transaction_id || null,
        data.portal_transaction_remarks_1 || null,
        data.portal_transaction_remarks_2 || null,
        data.credit_debit,
        data.transaction_type,
        amount,
        data.payment_method || null,
        data.customer_id,
        user_wallet_balance,
        data.remarks || null,
        central_balance
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Wallet Transaction Error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllTransactions() {
    const result = await pool.query(`SELECT * FROM wallet_manager ORDER BY created_at DESC`);
    return result.rows;
  }

  static async getCustomerTransactions(customerId) {
    const result = await pool.query(`
      SELECT serial_number, transaction_date, transaction_time, transaction_id,
          portal_transaction_id, portal_transaction_remarks_1, portal_transaction_remarks_2,
          credit_debit, transaction_type, amount, payment_method, customer_id,
          user_wallet_balance, remarks, central_balance, created_at, updated_at
      FROM wallet_manager
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `, [customerId]);

    return result.rows;
  }
}

module.exports = WalletModel;
