const pool = require('../../config/db');

class blockedKeyword{
    //Arrange in CRUD order
    static async postBlocked(data){
        const query = `INSERT INTO blocked_keyword (added_date , keyword) VALUES (CURRENT_DATE , '${data}');`;
        try {
            const result = await pool.query(query);
            return result;

        } catch (error){
            console.error('Error in Posting Blocked Keyword', error);
            throw error;
        }
    }
    static async multiPostBlocked(values){
        const arr = [];
        for (let i =1; i <= values.length; i++){
            arr[i-1] = "(CURRENT_DATE , $"+(parseInt(i))+")";
        }
        const str = arr.toString();
        const query = `INSERT INTO blocked_keyword (added_date , keyword) VALUES ${str};`;
        try {
            const result = await pool.query(query, values);
            return result;

        } catch (error){
            console.error('Error in Multi Posting Blocked Keywords', error);
            throw error;
        }
    }

    static async getAllBlockedKeyword(){
        const query = `SELECT keyword from blocked_keyword`;
        try {
            const result = await pool.query(query);
            return result.rows.map(row => ({
                //added_date: row.added_date,
                keyword: row.keyword
            }));

        } catch (error){
            console.error('Error in getAllBlockedKeyword', error);
            throw error;
        }
    }

    static async getPrefixBlockedKeyword(prefix){
        const query_logic = prefix;
        const query = `SELECT keyword FROM blocked_keyword WHERE keyword LIKE '${query_logic}%'`;
        
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
        
    static async removeSingleBlocked(values){       
                
        const query = `DELETE FROM blocked_keyword
                        WHERE keyword IN ('${values}');`;
        try {
            const result = await pool.query(query);
            return result;

        } catch (error){
            console.error('Error to Remove Single Blocked', error);
            throw error;
        }
    }
    static async removeMultiBlocked(values){
        const arr = [];
        for (let i =1; i <= values.length; i++){
            arr[i-1] = "$"+(parseInt(i));
        }
        const str = arr.toString();
                     
        const query = `DELETE FROM blocked_keyword
                        WHERE keyword IN (${str}) RETURNING *;`;
        //console.log(query);
        try {
            const result = await pool.query(query, values);
            return result;

        } catch (error){
            console.error('Error to Remove Multi Blocked Keywords', error);
            throw error;
        }
    }
}

module.exports = blockedKeyword;