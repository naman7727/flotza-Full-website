import React, { useState ,useEffect } from 'react';
const CommodityMaster = () => {
  const [commodities, setCommodities] = useState([]);
  const [blockedKeywords, setBlockedKeywords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);





  //Himanshu work below
  const allCommodityKeywords = async () => {    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseURL}/api/commodities-routes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json_response = await response.json();
      const obj = json_response.data;
      
      const arr = obj.map( (a) =>  {
        return Object.values(a);
      });
      
      const f_arr = arr.flat(Infinity);
      //console.log(f_arr);
      setCommodities([...f_arr]);
            
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    } 
    
  };

  const allBlockedKeywords = async () => {    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseURL}/api/commodities-routes/block`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json_response = await response.json();
      const obj = json_response.data;
      
      const arr = obj.map( (a) =>  {
        return Object.values(a);
      });
      
      const f_arr = arr.flat(Infinity);
      //console.log(f_arr);
      setBlockedKeywords([...f_arr]);
            
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    } 
    
  };


  useEffect(() => {
    allCommodityKeywords();
    allBlockedKeywords();
  }, []);



  

  const addCommodities = async () => {    
    try {
      const input = document.getElementById('commodityInput').value.trim();
      if (!input) return;

      const entries = input
        .split(/\n|,/)
        .map((c) => c.trim())
        .filter((c) => c !== '');

      const filtered = entries.filter((c) => {
        const isBlocked = blockedKeywords.some((kw) =>
          c.toLowerCase().includes(kw.toLowerCase())
        );
        const isDuplicate = commodities.some(
          (existing) => existing.toLowerCase() === c.toLowerCase()
        );
        return !isBlocked && !isDuplicate;
      });
      const apiPayload = {
        "data": [...filtered],
      };

      setLoading(true);
      const token = localStorage.getItem("token");
      const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseURL}/api/commodities-routes/multi-insert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json_response = await response.json();
                  
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }finally{  
    allCommodityKeywords();
    document.getElementById('commodityInput').value = '';
   }
    //console.log("Commodity is been clicked!!")
    
  };

  const deleteSelected = async() => {
    try {
      const checkboxes = document.querySelectorAll(
        '#commodityList input[type="checkbox"]:checked'
      );
      if (!checkboxes) return;  
      const indexesToRemove = Array.from(checkboxes).map((cb) => parseInt(cb.value));
      const ValuesToRemove = indexesToRemove.map((a) => {
        return commodities[a];
      });     
     
               
      const apiPayload = {
        "data": [...ValuesToRemove],
      };
        
        setLoading(true);
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseURL}/api/commodities-routes/multi-delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiPayload),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
                
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }finally{
      const checkboxes = document.querySelectorAll('#commodityList input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      })
      allCommodityKeywords(); 
      
    }
    
  };

  const addBlockedKeyword = async() => {
    try {
      const keyword = document.getElementById('newKeyword').value.trim();
      if (!keyword) return;    
      if (keyword && !blockedKeywords.includes(keyword.toLowerCase())) {      

        
        const apiPayload = {
          "data": `${keyword}`
        };
        
        setLoading(true);
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseURL}/api/commodities-routes/block`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiPayload),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }          
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }finally{  
    allBlockedKeywords();
    document.getElementById('newKeyword').value = '';
   }
  };

  const removeBlockedKeyword = async(index) => {
    try {
      if (!index || !blockedKeywords[index]) return;  
                    
      const apiPayload = {
        "data": blockedKeywords[index],
      };
        
        setLoading(true);
        const token = localStorage.getItem("token");
        const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseURL}/api/commodities-routes/block/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(apiPayload),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
                
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update status: ${error.message}`);
    }finally{
      
      allBlockedKeywords();
    }
  };

  const filteredCommodities = commodities.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <div className="bg-white p-6 rounded shadow">
      
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🛒 Add Commodity Name</h2>
        <textarea
          id="commodityInput"
          rows="4"
          placeholder="Paste from Excel or enter comma-separated (e.g., rice, wheat)"
          className="w-full p-3 border border-gray-300 rounded mb-2"
        />
        <button
          onClick={addCommodities}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Commodity
        </button>
      </div>

      <div className="flex flex-wrap gap-6">
        {/* Registered Commodities */}
        <div className="bg-white p-6 rounded shadow flex-1 min-w-[300px]">
          <h2 className="text-xl font-semibold mb-3">📋 Registered Commodities</h2>
          <input
            type="text"
            placeholder="Search commodity..."
            className="w-full p-2 border border-gray-300 rounded mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className="max-h-64 overflow-y-auto border p-3 rounded bg-gray-50"
            id="commodityList"
          >
            {filteredCommodities.map((name, index) => (
              <div key={index}>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" value={commodities.indexOf(name)} />
                  <span>{name}</span>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={deleteSelected}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Selected
          </button>
        </div>

        {/* Blocked Keywords */}
        <div className="bg-white p-6 rounded shadow flex-1 min-w-[300px]">
          <h2 className="text-xl font-semibold mb-3">🚫 Blocked Keywords</h2>
          <div className="flex space-x-2 mb-3">
            <input
              id="newKeyword"
              type="text"
              placeholder="Add keyword to block"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={addBlockedKeyword}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {blockedKeywords.map((word, index) => (
              <li
                key={index}
                className="bg-gray-200 p-2 rounded flex justify-between items-center"
              >
                {word}
                <button
                  onClick={() => removeBlockedKeyword(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommodityMaster;