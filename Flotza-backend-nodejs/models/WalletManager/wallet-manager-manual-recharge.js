/**
 * Model for manual_recharge_requests table.
 * Handles creating, updating, and retrieving manual recharge data.
 */
const pool = require('../../config/db');


class WalletManagerManualRechargeModel {
    static async createRechargeRequest(data, customerId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // ✅ Get last request_id number
            const reqRes = await client.query(`
            SELECT MAX(CAST(SUBSTRING(request_id, 5) AS INTEGER)) AS max
            FROM manual_recharge_requests
        `);
            const lastReqNum = reqRes.rows[0].max || 0;
            const request_id = `KBMR${lastReqNum + 1}`;

            // ✅ Insert into manual_recharge_requests
            const insertQuery = `
            INSERT INTO manual_recharge_requests (
                request_id, customer_id, amount, screenshot,
                selected_bank_id, status, status_remark
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
            const values = [
                request_id,
                customerId,
                data.amount,
                data.screenshot,
                data.selected_bank_id || null,
                'Pending',
                data.status_remark || 'Pending request'
            ];

            const result = await client.query(insertQuery, values);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    static async getAllRechargeRequests() {
        const result = await pool.query(`
      SELECT mrr.*, c.first_name, c.last_name, c.full_name
      FROM manual_recharge_requests mrr
      JOIN customers c ON mrr.customer_id = c.customer_id
      ORDER BY mrr.created_at DESC
    `);
        return result.rows;
    }

    static async getRechargeRequestById(requestId) {
        const result = await pool.query(`
      SELECT mrr.*, c.first_name, c.last_name, c.full_name
      FROM manual_recharge_requests mrr
      JOIN customers c ON mrr.customer_id = c.customer_id
      WHERE mrr.request_id = $1
    `, [requestId]);
        return result.rows[0];
    }

    static async handleRechargeRequest(requestId, action, bankTransactionId, statusRemark) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Fetch the recharge request
            const requestResult = await client.query(
                `SELECT * FROM manual_recharge_requests WHERE request_id = $1`,
                [requestId]
            );
            if (requestResult.rows.length === 0) {
                throw new Error('Request not found');
            }
            const reqData = requestResult.rows[0];

            if (reqData.status === 'Approved') {
                throw new Error('This request has already been approved.');
            }
            if (reqData.status === 'Rejected' && action === 'approve') {
                const hoursSinceReject = (new Date() - new Date(reqData.updated_at)) / (1000 * 60 * 60);
                if (hoursSinceReject > 48) {
                    throw new Error('Cannot approve a request that was rejected more than 48 hours ago.');
                }
            }

            if (action === 'approve' && (!bankTransactionId || String(bankTransactionId).trim() === '')) {
                throw new Error('Bank Transaction ID is required to approve a request.');
            }

            // Prepare the UPDATE query for manual_recharge_requests
            const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
            const values = [newStatus];
            let query = `UPDATE manual_recharge_requests SET status = $1`;

            if (action === 'approve') {
                values.push(bankTransactionId);
                query += `, bank_transaction_id = $${values.length}`;
            }

            if (statusRemark && statusRemark.trim() !== '') {
                values.push(statusRemark);
                query += `, status_remark = $${values.length}`;
            }

            query += `, updated_at = CURRENT_TIMESTAMP WHERE request_id = $${values.length + 1} RETURNING *`;
            values.push(requestId);

            if (action === 'approve') {
                // Update customer wallet balance
                await client.query(
                    `UPDATE customers SET wallet_balance = wallet_balance + $1 WHERE customer_id = $2`,
                    [reqData.amount, reqData.customer_id]
                );

                // Generate internal transaction_id
                const now = new Date();
                const dd = String(now.getDate()).padStart(2, '0');
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const yy = String(now.getFullYear()).toString().slice(-2);
                const HH = String(now.getHours()).padStart(2, '0');
                const MM = String(now.getMinutes()).padStart(2, '0');
                const SS = String(now.getSeconds()).padStart(2, '0');

                const datePart = `${dd}${mm}${yy}`;
                const timePart = `${HH}${MM}${SS}`;
                const serialRes = await client.query(`SELECT COALESCE(MAX(serial_number), 0) + 1 AS next FROM wallet_manager`);
                const serial_number = serialRes.rows[0].next;
                const transaction_id = `cr${datePart}${timePart}${String(serial_number).padStart(2, '0')}`;

                // Direct insert into wallet_manager
                await client.query(
                    `INSERT INTO wallet_manager (
                     serial_number, transaction_date, transaction_time, transaction_id,
                     credit_debit, transaction_type, amount, payment_method,
                     customer_id, user_wallet_balance, remarks, central_balance,
                     created_at, updated_at
                     ) VALUES (
                     $1, CURRENT_DATE, CURRENT_TIME, $2,
                     'credit', 'Admin Allocated Balance', $3, 'Manual Recharge',
                     $4,
                     (SELECT wallet_balance FROM customers WHERE customer_id = $4),
                     'Recharge approved',
                     (SELECT COALESCE(SUM(amount), 0) FROM wallet_manager),
                     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                     )`,
                    [serial_number, transaction_id, reqData.amount, reqData.customer_id]
                );
            }

            const result = await client.query(query, values);
            await client.query('COMMIT');
            console.log("[handleRechargeRequest] Completed successfully");
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("[handleRechargeRequest] ERROR:", error);
            throw error;
        } finally {
            client.release();
        }
    }



    static async getCustomerRechargeRequests(customerId) {
        const result = await pool.query(`
      SELECT * FROM manual_recharge_requests WHERE customer_id = $1 ORDER BY created_at DESC
    `, [customerId]);
        return result.rows;
    }

    static async getPendingRechargeCount() {
        const result = await pool.query(`
      SELECT COUNT(*) AS pending_count FROM manual_recharge_requests WHERE status = 'Pending'
    `);
        return result.rows[0].pending_count;
    }
    // models/WalletManager/wallet-manager-manual-recharge.js

    static async getCustomerRechargeRequests(customerId) {
        const result = await pool.query(`
        SELECT 
            mrr.*, 
            c.first_name, 
            c.last_name, 
            c.full_name
        FROM manual_recharge_requests mrr
        JOIN customers c 
            ON mrr.customer_id = c.customer_id
        WHERE mrr.customer_id = $1
        ORDER BY mrr.created_at DESC
    `, [customerId]);
        return result.rows;
    }

}

module.exports = WalletManagerManualRechargeModel;
