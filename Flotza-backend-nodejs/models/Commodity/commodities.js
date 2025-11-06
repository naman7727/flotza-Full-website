const pool = require('../../config/db');

class Commodities{
    //Arrange in CRUD order
    static async postCommodities(data){
        const query = `INSERT INTO commodities (added_date , keyword) VALUES (CURRENT_DATE , '${data}');`;
        try {
            const result = await pool.query(query);
            return result;

        } catch (error){
            console.error('Error in Post Commodities', error);
            throw error;
        }
    }
    static async multiPostCommodities(values){
        const arr = [];
        for (let i =1; i <= values.length; i++){
            arr[i-1] = "(CURRENT_DATE , $"+(parseInt(i))+")";
        }
        const str = arr.toString();
        const query = `INSERT INTO commodities (added_date , keyword) VALUES ${str};`;
        try {
            const result = await pool.query(query, values);
            return result;

        } catch (error){
            console.error('Error in getAllCommodities', error);
            throw error;
        }
    }

    static async getAllCommodities(){
        const query = `SELECT keyword from commodities`;
        try {
            const result = await pool.query(query);
            return result.rows.map(row => ({
                //added_date: row.added_date,
                keyword: row.keyword
            }));

        } catch (error){
            console.error('Error in getAllCommodities', error);
            throw error;
        }
    }


    static async getPrefixCommodities(prefix){
        const query_logic = prefix;
        const query = `SELECT keyword FROM commodities WHERE keyword LIKE '${query_logic}%'`;
        
        try {
            const result = await pool.query(query);
            return result.rows.map(row => ({
                //added_date: row.added_date,
                keyword: row.keyword
            }));

        } catch (error){
            console.error('Error in  getPrefixCommodities', error);
            throw error;
        }
    }

    static async removeCommoditiesSingle(values){
        
                
        const query = `DELETE FROM commodities
                        WHERE keyword IN ('${values}');`;
        try {
            const result = await pool.query(query);
            return result;

        } catch (error){
            console.error('Error to Remove Commoditie', error);
            throw error;
        }
    }
    static async removeCommoditiesMulti(values){
        const arr = [];
        for (let i =1; i <= values.length; i++){
            arr[i-1] = "$"+(parseInt(i));
        }
        const str = arr.toString();
                     
        const query = `DELETE FROM commodities
                        WHERE keyword IN (${str}) RETURNING *;`;
        //console.log(query);
        try {
            const result = await pool.query(query, values);
            return result;

        } catch (error){
            console.error('Error to Remove Multi Commoditie', error);
            throw error;
        }
    }
       

}

module.exports = Commodities;