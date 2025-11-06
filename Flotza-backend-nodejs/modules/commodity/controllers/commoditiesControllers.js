const Commodities = require('../../../models/Commodity/commodities');
const BlockedKeyword = require('../../../models/Commodity/blocked-keyword');
const { successResponse, errorResponse } = require('../../../utils/response');


class commoditiesControllers{
  //Arrange in CRUD order
    static async postCommodities(req, res) {
      const { data } = req.body;
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.postCommodities(data);

        //Return 200 with success response and Commodities
        return res.status(201).json(successResponse(commodities, 'Inserting Commodities in list successfully'));
      } catch (error) {
        console.error('Error in insertion of Commodities in list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }
    static async multiPostCommodities(req, res) {
      const { data } = req.body;
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.multiPostCommodities(data);

        //Return 200 with success response and Commodities
        return res.status(201).json(successResponse(commodities, 'Multi Inserting Commodities in list successfully'));
      } catch (error) {
        console.error('Error in multi insertion of Commodities in list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }

    static async getAll(req, res) {
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.getAllCommodities();
  
        //Return 200 with success response and Commodities
        return res.status(200).json(successResponse(commodities, 'Commodities list retrieved successfully'));
      } catch (error) {
        console.error('Error fetching Commodities list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }
    static async getPrefix(req, res) {
      const { prefix } = req.body;
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.getPrefixCommodities(prefix);
  
        //Return 200 with success response and Commodities
        return res.status(200).json(successResponse(commodities, 'Commodities prefix list retrieved successfully'));
      } catch (error) {
        console.error('Error fetching Commodities prefix list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }

    static async removeCommoditiesSingle(req, res) {
      const { data } = req.body;
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.removeCommoditiesSingle(data);

        //Return 200 with success response and Commodities
        return res.status(201).json(successResponse(commodities, 'Removal of Commodities in list successfully'));
      } catch (error) {
        console.error('Error in Removal of Commodities in list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }
    static async removeCommoditiesMulti(req, res) {
      const { data } = req.body;
      try {
        //Call the model to fetch all Commodities
        const commodities = await Commodities.removeCommoditiesMulti(data);

        //Return 200 with success response and Commodities
        return res.status(201).json(successResponse(commodities, 'Removal of Multi Commodities in list successfully'));
      } catch (error) {
        console.error('Error in Removal of Multi Commodities in list:', error);
        return res.status(500).json(errorResponse(error.message));
      }
    }
    






      static async postBlocked(req, res) {
        const { data } = req.body;
        try {
          //Call the model to fetch all Commodities
          const commodities = await BlockedKeyword.postBlocked(data);
  
          //Return 200 with success response and Commodities
          return res.status(201).json(successResponse(commodities, 'Inserting Blocked Keywords in list successfully'));
        } catch (error) {
          console.error('Error in insertion of Blocked Keywords in list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }
      static async multiPostBlocked(req, res) {
        const { data } = req.body;
        try {
          //Call the model to fetch all Commodities
          const commodities = await BlockedKeyword.multiPostBlocked(data);

          //Return 200 with success response and Commodities
          return res.status(201).json(successResponse(commodities, 'Multi Posting Blocked Keywords in list successfully'));
        } catch (error) {
          console.error('Error in Multi Posting Blocked Keywords of Commodities in list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }
      static async getAllBlocked(req, res) {
        try {
          //Call the model to fetch all Commodities
          const blockedKeyword = await BlockedKeyword.getAllBlockedKeyword();
    
          //Return 200 with success response and Commodities
          return res.status(200).json(successResponse(blockedKeyword, 'Blocked Keyword list retrieved successfully'));
        } catch (error) {
          console.error('Error fetching Blocked Keyword list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }
      static async getPrefixBlockedKeyword(req, res) {
        const { prefix } = req.body;
        try {
          //Call the model to fetch all Commodities
          const commodities = await BlockedKeyword.getPrefixBlockedKeyword(prefix);
    
          //Return 200 with success response and Commodities
          return res.status(200).json(successResponse(commodities, 'Prefix Blocked Keyword prefix list retrieved successfully'));
        } catch (error) {
          console.error('Error fetching Blocked Keyword prefix list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }
      static async removeSingleBlocked(req, res) {
        const { data } = req.body;
        try {
          //Call the model to fetch all Commodities
          const commodities = await BlockedKeyword.removeSingleBlocked(data);
  
          //Return 200 with success response and Commodities
          return res.status(201).json(successResponse(commodities, 'Removal of Blocked Keyword in list successfully'));
        } catch (error) {
          console.error('Error in Removal of Blocked Keyword in list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }
      static async removeMultiBlocked(req, res) {
        const { data } = req.body;
        try {
          //Call the model to fetch all Commodities
          const commodities = await BlockedKeyword.removeMultiBlocked(data);
  
          //Return 200 with success response and Commodities
          return res.status(201).json(successResponse(commodities, 'Removal of Multi Blocked Keywords in list successfully'));
        } catch (error) {
          console.error('Error in Removal of Multi Blocked Keywords in list:', error);
          return res.status(500).json(errorResponse(error.message));
        }
      }

}


//module.exports = blockedKeywordControllers;
module.exports = commoditiesControllers;