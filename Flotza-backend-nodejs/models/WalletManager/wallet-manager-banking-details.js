/**
 * Model for banking_details table.
 * Handles CRUD for bank accounts linked to wallet.
 */
const pool = require('../../config/db');

class WalletManagerBankingDetailsModel {
  static async createBankingDetails(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (data.primary_status === true) {
        await client.query(`UPDATE banking_details SET primary_status = FALSE WHERE primary_status = TRUE`);
      }

      const insertQuery = `
        INSERT INTO banking_details 
          (upi_id, qr_code_image, bank_name, account_name, account_number, ifsc_code, primary_status, status, status_remark)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const values = [
        data.upi_id,
        data.qr_code_image,
        data.bank_name,
        data.account_name,
        data.account_number,
        data.ifsc_code,
        data.primary_status || false,
        data.status || 'Active',
        data.status_remark || 'manual remark'
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getBankingDetails() {
    const result = await pool.query(`
      SELECT * FROM banking_details ORDER BY primary_status DESC, bank_id ASC
    `);
    return result.rows;
  }

  static async updateBankingDetails(bankId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (data.primary_status === true) {
        // Ensure only one primary; don't unset the same record if it already exists
        await client.query(
          `UPDATE banking_details SET primary_status = FALSE WHERE primary_status = TRUE AND bank_id <> $1`,
          [bankId]
        );
      }

      const setClause = [];
      const values = [];
      let index = 1;
      const fields = [
        'upi_id', 'qr_code_image', 'bank_name', 'account_name', 'account_number',
        'ifsc_code', 'primary_status', 'status', 'status_remark'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          setClause.push(`${field} = $${index++}`);
          values.push(data[field]);
        }
      });

      if (setClause.length === 0) throw new Error('No fields to update');

      const updateQuery = `
        UPDATE banking_details
        SET ${setClause.join(', ')}
        WHERE bank_id = $${index}
        RETURNING *;
      `;
      values.push(bankId);

      const result = await client.query(updateQuery, values);
      if (result.rows.length === 0) throw new Error('Banking details not found');

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteBankingDetails(bankId) {
    const result = await pool.query(
      `DELETE FROM banking_details WHERE bank_id = $1 RETURNING *`,
      [bankId]
    );
    if (result.rows.length === 0) throw new Error('Banking details not found');
    return result.rows[0];
  }
}

module.exports = WalletManagerBankingDetailsModel;
