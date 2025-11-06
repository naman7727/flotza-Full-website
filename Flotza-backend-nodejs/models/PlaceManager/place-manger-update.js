// Update logic for PlaceManager table
// Ensures 'place_id' and 'place_type' cannot be updated

const pool = require('../../config/db');

class PlaceManagerUpdate {
  static async updatePlaceById(place_id, updateData) {
    const fields = [];
    const values = [];
    let index = 1;

    // ❌ Remove restricted fields
    delete updateData.place_id;
    delete updateData.place_type;

    // Build field placeholders and values array
    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    // search_identifier logic
    if (updateData.company_name || updateData.contact_person_name || updateData.contact_person_mobile) {
      const companyName = updateData.company_name || '';
      const contactPersonName = updateData.contact_person_name || '';
      const contactPersonMobile = updateData.contact_person_mobile || '';

      const search_identifier = `${place_id}-${companyName}-${contactPersonName}-${contactPersonMobile}`;
      fields.push(`search_identifier = $${index}`);
      values.push(search_identifier);
      index++;
    }

    if (fields.length === 0) throw new Error('No fields provided for update.');

    const query = `
      UPDATE place_manager
      SET ${fields.join(', ')}
      WHERE place_id = $${index}
      RETURNING *;
    `;
    values.push(place_id); // Place ID as WHERE clause

    try {
      const client = await pool.connect();
      const result = await client.query(query, values);
      client.release();

      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PlaceManagerUpdate;
