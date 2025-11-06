const Contact = require('../../../models/Contact/contact');
const { successResponse, errorResponse } = require('../../../utils/response');
const { validateContactCreate, validateContactUpdate, validateContactQuery } = require('../../../utils/validation');

class ContactController {
  static async create(req, res) {
    try {
      const { error } = validateContactCreate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const contact = await Contact.create(req.body);
      return res.status(201).json(successResponse(contact, 'Message created successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async getById(req, res) {
    try {
      const { messageId } = req.params;
      const contact = await Contact.getById(messageId);
      return res.status(200).json(successResponse(contact, 'Message retrieved successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const { status, full_name, email, phone_number, page, limit } = req.query;
      const { error } = validateContactQuery({ status, full_name, email, phone_number, page, limit });
      // if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const result = await Contact.getAll({ status, full_name, email, phone_number, page, limit });
      return res.status(200).json(successResponse(result, 'Messages retrieved successfully'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async update(req, res) {
    try {
      const { error } = validateContactUpdate(req.body);
      if (error) return res.status(400).json(errorResponse(error.details[0].message));

      const { messageId } = req.params;
      const contact = await Contact.update(messageId, req.body);
      return res.status(200).json(successResponse(contact, 'Message updated successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  static async delete(req, res) {
    try {
      const { messageId } = req.params;
      const contact = await Contact.delete(messageId);
      return res.status(200).json(successResponse(contact, 'Message deleted successfully'));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

module.exports = ContactController;