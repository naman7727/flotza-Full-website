const pool = require('../../config/db');

// Function to generate the next message_id with "KBLQ" prefix
async function generateMessageIdWithPrefix(client) {
  const prefix = 'KBLQ';

  const query = `
    SELECT message_id
    FROM first_contact
    WHERE message_id LIKE $1
    ORDER BY CAST(SUBSTRING(message_id FROM LENGTH($2) + 1) AS INTEGER) DESC
    LIMIT 1
  `;

  
  try {
    const result = await client.query(query, [`${prefix}%`, prefix]);

    if (result.rows.length === 0) {
      // No existing IDs found, start with KBLQ1
      return `${prefix}1`;
    }

    const lastId = result.rows[0].message_id;
    const numberPart = parseInt(lastId.replace(prefix, ''), 10);

    if (isNaN(numberPart)) {
      // In case somehow the ID has bad data
      throw new Error(`Invalid message_id format in database: ${lastId}`);
    }

    const newNumber = numberPart + 1;
    return `${prefix}${newNumber}`;
  } catch (error) {
    console.error('Error generating message ID:', error);
    throw error; // Re-throw so caller knows it failed
  }
}


class Contact {
  static async create(contactData) {
    const client = await pool.connect();    
    try {
       // Start a transaction
      await client.query('BEGIN');
      // Generate the custom message_id
      const messageId = await generateMessageIdWithPrefix(client);
      const { full_name, email, phone_number, message } = contactData;
      const query = `
        INSERT INTO first_contact (message_id,full_name, email, phone_number, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING message_id, full_name, email, phone_number, message, status, created_at, updated_at
      `;
      const values = [messageId,full_name, email, phone_number, message];
      const result = await client.query(query, values);
      // Commit the transaction
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
       // Roll back in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getById(messageId) {
    try {
      const query = `
        SELECT message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
        FROM first_contact
        WHERE message_id = $1
      `;
      const result = await pool.query(query, [messageId]);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAll({ status, full_name, email, phone_number, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      let conditions = [];
      let values = [];
      let valueIndex = 1;

      // Build search conditions
      // if (status) {
      //   conditions.push(`status = $${valueIndex++}`);
      //   values.push(status);
      // }
      // if (full_name) {
      //   conditions.push(`LOWER(full_name) LIKE LOWER($${valueIndex++})`);
      //   values.push(`%${full_name}%`);
      // }
      // if (email) {
      //   conditions.push(`LOWER(email) LIKE LOWER($${valueIndex++})`);
      //   values.push(`%${email}%`);
      // }
      // if (phone_number) {
      //   conditions.push(`phone_number = $${valueIndex++}`);
      //   values.push(phone_number);
      // }

      // Count total records for pagination metadata
      let countQuery = 'SELECT COUNT(*) FROM first_contact';
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countResult = await pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count, 10);

      // Fetch paginated data
      let dataQuery = `
        SELECT message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
        FROM first_contact
      `;

      console.log("SQL Query:", dataQuery);
      console.log("Query Values:", values);
      if (conditions.length > 0) {
        dataQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      dataQuery += ` ORDER BY created_at DESC LIMIT $${valueIndex++} OFFSET $${valueIndex}`;
      values.push(limit, offset);

      const result = await pool.query(dataQuery, values);

      return {
        data: result.rows,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(messageId, updateData) {
    const { assigned_to, status, outcome } = updateData;
    try {
      const query = `
        UPDATE first_contact
        SET 
          assigned_to = COALESCE($1, assigned_to),
          status = COALESCE($2, status),
          outcome = COALESCE($3, outcome),
          updated_at = CURRENT_TIMESTAMP
        WHERE message_id = $4
        RETURNING message_id, full_name, email, phone_number, message, assigned_to, status, outcome, created_at, updated_at
      `;
      const values = [assigned_to, status, outcome, messageId];
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(messageId) {
    try {
      const query = 'DELETE FROM first_contact WHERE message_id = $1 RETURNING message_id';
      const result = await pool.query(query, [messageId]);
      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Contact;
