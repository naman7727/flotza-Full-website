const pool = require('../../config/db');

class TimeWindowDeleteModel {
    static async delete(id) {
        const query = `DELETE FROM time_windows WHERE id = $1 RETURNING *;`;

        const client = await pool.connect();
        try {
            const result = await client.query(query, [id]);
            return result.rows[0];
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = TimeWindowDeleteModel;
