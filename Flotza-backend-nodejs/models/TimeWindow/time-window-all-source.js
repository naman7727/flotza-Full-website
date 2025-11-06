const pool = require('../../config/db');

class TimeWindowGetAllModel {
    static async getAll() {
        const query = `SELECT * FROM time_windows ORDER BY created_at DESC`;

        const client = await pool.connect();
        try {
            const result = await client.query(query);
            return result.rows;
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = TimeWindowGetAllModel;
