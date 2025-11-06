const pool = require('../../config/db');

class TimeWindowRegisterModel {
    static async registerTimeWindow(data) {
        const { branch_id, dc_name, max_order_time } = data;

        const checkQuery = `SELECT * FROM time_windows WHERE branch_id = $1`;
        const insertQuery = `
            INSERT INTO time_windows (
                 branch_id, dc_name, max_order_time
            ) VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const client = await pool.connect();
        try {
            const check = await client.query(checkQuery, [branch_id]);
            if (check.rows.length > 0) {
                throw new Error('A time window already exists for this branch.');
            }

            const result = await client.query(insertQuery, [ branch_id, dc_name, max_order_time]);
            return result.rows[0];
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = TimeWindowRegisterModel;
