import React, { useState , useEffect} from "react";
const InputSuggestion = ({ value: selectedCommodities = [], onChange, passOrderMode }) => {
    const [commodities, setCommodities] = useState([]);
    const [blockedKeywords, setBlockedKeywords] = useState([]);
    const [loading, setLoading] = useState(false);

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


  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputValue(text);
    setActiveIndex(-1);

    if (text.trim() === "") {
      setSuggestions([]);
      return;
    }

    const combinedList = [...commodities, ...blockedKeywords];
    const filtered = combinedList.filter((item) =>
      item.toLowerCase().includes(text.toLowerCase()) && !selectedCommodities.includes(item)
    );
    setSuggestions(filtered);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prevIndex => (prevIndex + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        if (activeIndex > -1) {
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setActiveIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = (item) => {
    if (blockedKeywords.some((blocked) => blocked.toLowerCase() === item.toLowerCase())) {
      alert(`"${item}" is a blocked keyword!`);
      return;
    }

    if (!selectedCommodities.includes(item)) {
      onChange([...selectedCommodities, item]);
    }
    setInputValue("");
    setSuggestions([]);
  };

  const handleRemove = (itemToRemove) => {
    onChange(selectedCommodities.filter(item => item !== itemToRemove));
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCommodities.map((item, index) => (
          <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {item}
            <button 
              onClick={() => handleRemove(item)} 
              className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        placeholder={`Enter commodity name for ${passOrderMode === 'dynamic-price' ? 'dynamic' : 'fixed'} pricing`}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border border-gray-300 rounded"
      />
          {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "8px 0 0",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff"
          }}
        >
          {suggestions.map((item, index) => {
            const isBlocked = blockedKeywords.some(
              (blocked) => blocked.toLowerCase() === item.toLowerCase()
            );
            return (
              <li
                key={index}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom:
                    index !== suggestions.length - 1 ? "1px solid #eee" : "none",
                  color: isBlocked ? "red" : "black",
                  fontWeight: isBlocked ? "bold" : "normal",
                  backgroundColor: index === activeIndex ? "#f0f0f0" : "transparent"
                }}
                onClick={() => handleSelect(item)}
                onMouseOver={() => setActiveIndex(index)}
              >
                {item}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default InputSuggestion;
