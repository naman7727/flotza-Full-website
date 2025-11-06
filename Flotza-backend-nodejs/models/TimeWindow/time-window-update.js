const pool = require('../../config/db');

class TimeWindowUpdateModel {
    static async update(id, max_order_time) {
        if (!id) {
            throw new Error('Missing time window ID.');
        }
        
        const query = `
            UPDATE time_windows
            SET max_order_time = $1, updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
            WHERE id = $2
            RETURNING *;
        `;

        const client = await pool.connect();
        try {
            const result = await client.query(query, [max_order_time, id]);
            if (result.rows.length === 0) {
                throw new Error('Time window not found.');
            }
            return result.rows[0];
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = TimeWindowUpdateModel;
