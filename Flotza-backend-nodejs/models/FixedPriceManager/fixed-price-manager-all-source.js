const pool = require('../../config/db');

class PriceManagergetmodel {
  // ✅ Get all entries
  static async getAll() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM sdd_fixed_pricing');
      return result.rows;
    } finally {
      client.release();
    }
  }

  // ✅ Get single entry by dimension_id
  static async getById(dimension_id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM sdd_fixed_pricing WHERE dimension_id = $1',
        [dimension_id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
  
  static async getByCustomer(customer_id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM sdd_fixed_pricing WHERE customer_id = $1 AND status = $2',
        [customer_id, 'active']
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

}

module.exports = PriceManagergetmodel;
