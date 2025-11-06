const PlaceManager = require('../../../models/PlaceManager/place-manager-register');
const PlaceManagerSingleSourceModel = require('../../../models/PlaceManager/place-manager-single-source');
const PlaceManagerAllSourceModel = require('../../../models/PlaceManager/place-manager-all-source');
const PlaceManagerDelete = require('../../../models/PlaceManager/place-manager-delete');
const PlaceManagerUpdate = require('../../../models/PlaceManager/place-manger-update');
const pool = require('../../../config/db');


const { successResponse, errorResponse } = require('../../../utils/response');
const { validatePlaceManagerCreate, validatePlaceSourceParam, validatePlaceDeleteParam, validatePlaceManagerUpdate } = require('../../../utils/validation');

class PlaceManagerController {
  static async create(req, res) {
    try {
      const { error } = validatePlaceManagerCreate(req.body);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const placeData = req.body;
      const place = await PlaceManager.createPlace(placeData);

      return res.status(201).json(successResponse(place, 'Place created successfully'));
    } catch (error) {
      console.error('Error creating place:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async getBySource(req, res) {
    try {
      const { error } = validatePlaceSourceParam(req.params);
      if (error) {
        return res.status(400).json(errorResponse(error.details[0].message));
      }

      const { place_source } = req.params;
      const places = await PlaceManagerSingleSourceModel.getPlacesBySource(place_source);

      return res.status(200).json(successResponse(places, 'Places retrieved successfully'));
    } catch (error) {
      console.error('Error fetching places by source:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async getAll(req, res) {
    try {
      const places = await PlaceManagerAllSourceModel.getAllPlaces();
      return res.status(200).json(successResponse(places, 'All places retrieved successfully'));
    } catch (error) {
      console.error('Error fetching all places:', error);
      return res.status(500).json(errorResponse(error.message));
    }
  }

  static async deletePlaceById(req, res) {
    const { error } = validatePlaceDeleteParam(req.params);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const { place_id } = req.params;
    try {
      const deleted = await PlaceManagerDelete.deletePlaceById(place_id);
      if (deleted.rowCount === 0) {
        return res.status(404).json(errorResponse('Place not found'));
      }
      return res.status(200).json(successResponse(deleted, 'Place deleted successfully'));
    } catch (err) {
      console.error(err);
      return res.status(500).json(errorResponse(err.message));
    }
  }

  /**
 * PUT /place/:place_id
 * - Validates request
 * - Prevents updating place_id and place_type
 * - Calls model to update
 */
  static async updatePlaceById(req, res) {
    const { place_id } = req.params;

    // ❌ Disallow updates to place_id or place_type
    if ('place_id' in req.body || 'place_type' in req.body) {
      return res.status(400).json(errorResponse('place_id and place_type cannot be updated.'));
    }

    // ✅ Validate input using Joi
    const { error } = validatePlaceManagerUpdate(req.body);
    if (error) return res.status(400).json(errorResponse(error.details[0].message));

    try {
      const updatedPlace = await PlaceManagerUpdate.updatePlaceById(place_id, req.body);
      if (!updatedPlace) return res.status(404).json(errorResponse('Place not found'));
      return res.status(200).json(successResponse(updatedPlace, 'Place updated successfully'));
    } catch (err) {
      return res.status(500).json(errorResponse(err.message));
    }
  }

  static async searchPlaces(req, res) {
    const { term, type } = req.query;
    const customerId = req.user?.id; // extracted from token by authMiddleware

    try {
      if (!term || term.length < 2) {
        return res.status(400).json(errorResponse('Search term must be at least 2 characters long.'));
      }

      const places = await PlaceManagerController.searchByIdentifier(term, type, customerId);
      return res.status(200).json(successResponse(places, 'Places retrieved successfully'));
    } catch (error) {
      console.error('Error searching places:', error);
      return res.status(500).json(errorResponse('An error occurred while searching for places. Please try again later.'));
    }
  }

  static async searchByIdentifier(term, type, customerId) {
    try {
      let query = `
          SELECT 
            id,
            place_id,
            company_name,
            contact_person_name,
            contact_person_mobile,
            place_type,
            place_source,
            status,
            CASE 
              WHEN place_type = 'Pickup Place' THEN 'shipper'
              WHEN place_type = 'Consignee Place' THEN 'consignee'
              ELSE 'unknown'
            END AS frontend_type,
            place_id || ' ' || company_name || ' ' || contact_person_name || ' ' || contact_person_mobile AS search_identifier
          FROM place_manager
          WHERE 
            (place_id ILIKE $1 OR company_name ILIKE $1 OR contact_person_name ILIKE $1 OR contact_person_mobile::text ILIKE $1)
            AND status = 'Approved'
            AND place_source = $2
        `;

      const values = [`%${term}%`, customerId];

      if (type === 'shipper') {
        query += ` AND place_type = 'Pickup Place'`;
      } else if (type === 'consignee') {
        query += ` AND place_type = 'Consignee Place'`;
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
}

module.exports = PlaceManagerController;
