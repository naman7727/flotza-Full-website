const pool = require('../../config/db');

class PlaceManager {
  // Function to generate place_id like KBC1, KBw1 etc based on place_type
  static async generatePlaceId(client, place_type) {
    const prefix = place_type === 'Consignee Place' ? 'KBC' : 'KBW';

    const query = `
      SELECT place_id
      FROM place_manager
      WHERE place_id LIKE $1
      ORDER BY CAST(SUBSTRING(place_id FROM LENGTH($2) + 1) AS INTEGER) DESC
      LIMIT 1
    `;

    const result = await client.query(query, [`${prefix}%`, prefix]);

    if (result.rows.length === 0) {
      return `${prefix}1`;
    }

    const lastId = result.rows[0].place_id;
    const numberPart = parseInt(lastId.replace(prefix, ''), 10);

    if (isNaN(numberPart)) {
      throw new Error(`Invalid place_id format found in database: ${lastId}`);
    }

    return `${prefix}${numberPart + 1}`;
  }

  static async createPlace(placeData) {
    const {
      company_name,
      place_type,
      address_line1,
      address_line2,
      nearest_railway_station,
      nearest_bus_stop,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      contact_person_name,
      contact_person_mobile,
      alternate_number,
      parking_place_availability,
      place_source,
      place_source_name,
      created_by,
      status,
      status_remarks,
      gst_no,
      connected_hub
    } = placeData;

    const client = await pool.connect();

    try {
      // Generate unique place_id
      const place_id = await this.generatePlaceId(client, place_type);

      // Create search_identifier
      const search_identifier = `${place_id}-${company_name}-${contact_person_name}-${contact_person_mobile}`;

      const query = `
      INSERT INTO place_manager (
        place_id,
        company_name,
        place_type,
        address_line1,
        address_line2,
        nearest_railway_station,
        nearest_bus_stop,
        landmark,
        city,
        state,
        pincode,
        latitude,
        longitude,
        contact_person_name,
        contact_person_mobile,
        alternate_number,
        parking_place_availability,
        place_source,
        place_source_name,
        created_by,
        status,
        status_remarks,
        gst_no,
        connected_hub,
        search_identifier
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
      ) RETURNING *;
    `;

      const values = [
        place_id,
        company_name,
        place_type,
        address_line1,
        address_line2,
        nearest_railway_station,
        nearest_bus_stop,
        landmark,
        city,
        state,
        pincode,
        latitude,
        longitude,
        contact_person_name,
        contact_person_mobile,
        alternate_number,
        parking_place_availability.replace(/\s+/g, ' ').trim(),
        place_source,
        place_source_name,
        created_by,
        status || 'New Registration',
        status_remarks,
        gst_no,
        connected_hub,
        search_identifier
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in createPlace:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async searchByIdentifier(term) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM place_manager
        WHERE search_identifier ILIKE $1
      `;
      const values = [`%${term}%`];
      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

}

module.exports = PlaceManager;
