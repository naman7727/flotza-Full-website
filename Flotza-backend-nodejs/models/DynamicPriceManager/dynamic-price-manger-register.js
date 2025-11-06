const pool = require('../../config/db');
const crypto = require('crypto');

class DynamicPriceManagerRegister {
    static async createDynamicPrice(data) {
        const {
            base_fare_per_kg,
            volumetric_factor,
            chalaan_return_charges,
            express_delivery_surcharge_percentage,
            gst_percentage,
            cod_ranges, // array of { range: [min, max], charge }
            status = 'inactive',
            status_remark
        } = data;

        const maxIdQuery = `
            SELECT COALESCE(MAX(CAST(SUBSTRING(dynamic_price_id, 6) AS INTEGER)), 0) AS max_id
            FROM sdd_dynamic_pricing
            WHERE dynamic_price_id ~ '^KBDYN[0-9]+$'
        `;

        const client = await pool.connect();

        try {
            const maxIdResult = await client.query(maxIdQuery);
            const maxId = maxIdResult.rows[0].max_id || 0;
            const dynamic_price_id = `KBDYN${maxId + 1}`;

            // Assign random UUIDs to each cod_range item
            const codRangesWithId = Array.isArray(cod_ranges)
                ? cod_ranges.map(range => ({
                    id: crypto.randomUUID(),
                    ...range,
                }))
                : [];

            const query = `
                INSERT INTO sdd_dynamic_pricing (
                  dynamic_price_id,
                  base_fare_per_kg,
                  volumetric_factor,
                  chalaan_return_charges,
                  express_delivery_surcharge_percentage,
                  gst_percentage,
                  cod_ranges,
                  status,
                  status_remark
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;
            `;

            const values = [
                dynamic_price_id,
                base_fare_per_kg,
                volumetric_factor,
                chalaan_return_charges,
                express_delivery_surcharge_percentage,
                gst_percentage,
                JSON.stringify(codRangesWithId),
                status,
                status_remark
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = DynamicPriceManagerRegister;
