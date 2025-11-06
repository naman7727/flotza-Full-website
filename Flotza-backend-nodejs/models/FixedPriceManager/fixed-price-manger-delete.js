const pool = require('../../config/db');

class FixedPriceManagerDeleteModel {
    static async delete(id) {
        const query = `
            DELETE FROM sdd_fixed_pricing 
            WHERE id = $1 
            RETURNING *
        `;

        try {
            const client = await pool.connect();
            const result = await client.query(query, [id]);
            client.release();
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FixedPriceManagerDeleteModel;