import { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import DeliveryCenterOffSettings from './DeliveryCenterOffSettings';

// Simple Modal for displaying remarks
const RemarkModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white/95 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-fadeIn border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Yes', cancelText = 'No' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white/95 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-fadeIn border border-gray-200">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const MAPS_API_KEY = "AIzaSyCDhyFI5zyW3KR-ESWfvUS__44LMUPU25c";
const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777 };
const API_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


const getDCCenters = async () => {
  const token = localStorage.getItem('token');
  // console.log("Token before API call:", token); 
  try {
    const response = await api.get('/api/dc-manager', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });


    console.log("Fetched DC Centers Data:", response.data);

    // Map the response data to the expected format
    return response.data.data.map(item => ({
      id: item.id,
      branch_id: item.branch_id,
      branch_name: item.branch_name,
      full_address: item.full_address,
      mobile_number: item.mobile_number,
      state: item.state,
      city: item.city,
      pin_code: item.pin_code,
      latitude: item.latitude,
      longitude: item.longitude,
      status: item.status,
      remark: item.remark
    }));
  } catch (error) {
    console.error('Error fetching DC centers:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch DC centers. Please try again later.');
  }
};

const createDCCenter = async (dcData) => {
  try {
    const response = await api.post('/api/dc-manager', {
      branch_name: dcData.branch_name,
      full_address: dcData.full_address,
      mobile_number: dcData.mobile_number,
      nearest_station: dcData.nearest_station,
      nearest_bus_stop: dcData.nearest_bus_stop,
      state: dcData.state,
      city: dcData.city,
      pin_code: dcData.pin_code,
      latitude: dcData.latitude,
      longitude: dcData.longitude,
      status: dcData.status || 'Active',
      remark: dcData.remark || ''
    });

    return response.data.data;
  } catch (error) {
    console.error('Error creating DC center:', error.response?.data || error.message);
    throw error;
  }
};


const updateDCCenter = async (branch_id, dcData) => {
  try {
    const response = await api.put(`/api/dc-manager/${branch_id}`, {
      branch_name: dcData.branch_name,
      full_address: dcData.full_address,
      nearest_station: dcData.nearest_station,
      nearest_bus_stop: dcData.nearest_bus_stop,
      state: dcData.state,
      city: dcData.city,
      pin_code: dcData.pin_code,
      latitude: dcData.latitude,
      longitude: dcData.longitude,
      status: dcData.status,
      remark: dcData.remark,
      mobile_number: dcData.mobile_number
    });

    return response.data.data;
  } catch (error) {
    console.error('Error updating DC center:', error.response?.data || error.message);
    throw error;
  }
};



const deleteDCCenter = async (branch_id) => {
  try {
    await api.delete(`/api/dc-manager/${branch_id}`);
  } catch (error) {
    console.error('Error deleting DC center:', error.response?.data || error.message);
    throw error;
  }
};

// const getDCRanges = async (branchId) => {
//   try {
//     const response = await api.get(`/api/dc-manager/${branchId}`);
//     const data = response.data.data;

//     return {
//       pickup: Array.isArray(data.pick_up_range) ? data.pick_up_range : [],
//       drop: Array.isArray(data.consignee_up_range) ? data.consignee_up_range : [],
//       staff: Array.isArray(data.staff_login_range) ? data.staff_login_range : [],
//       driver: Array.isArray(data.driver_login_range) ? data.driver_login_range : [],
//     };
//   } catch (error) {
//     console.error('Error fetching DC ranges:', error.response?.data || error.message);
//     throw error;
//   }
// };

const normalizeRange = (arr) => {
  return arr.map(({ lat, lng, radius_km, radiusKm, input, id }) => ({
    lat,
    lng,
    radius_km: radius_km ?? radiusKm ?? 1.0, // fallback to radiusKm or 1.0
    input,
    id
  }));
};

const updateDCRanges = async (branchId, allRanges) => {
  try {
    const payload = {
      pick_up_range: normalizeRange(allRanges.pickup),
      consignee_up_range: normalizeRange(allRanges.drop),
      staff_login_range: normalizeRange(allRanges.staff),
      driver_login_range: normalizeRange(allRanges.driver)
    };

    const response = await api.put(`/api/dc-manager/${branchId}`, payload);
    return response.data.data;
  } catch (error) {
    console.error('Error updating DC ranges:', error.response?.data || error.message);
    throw error;
  }
};

// GeoRangeSelector Component
// GeoRangeSelector Component - Fixed version
const GeoRangeSelector = ({ dcInfo, onClose }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [currentAreaType, setCurrentAreaType] = useState("pickup");
  const [manualMode, setManualMode] = useState(false);
  const [allRanges, setAllRanges] = useState({
    pickup: [],
    drop: [],
    staff: [],
    driver: []
  });
  const [manualRadius, setManualRadius] = useState(1);
  const [batchInput, setBatchInput] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableRanges, setEditableRanges] = useState({ ...allRanges });
  const [editableManualRadius, setEditableManualRadius] = useState(manualRadius);
  const [rangesLoaded, setRangesLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    const center = {
      lat: parseFloat(dcInfo.coordinates.split(',')[0].trim()),
      lng: parseFloat(dcInfo.coordinates.split(',')[1].trim())
    };

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeId: "roadmap"
    });

    // Add DC center marker
    new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      label: "D",
      title: "Delivery Center"
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `<strong>${dcInfo.dcName}</strong>`,
      position: center
    });
    infoWindow.open(mapInstance);

    setMap(mapInstance);
    setGeocoder(new window.google.maps.Geocoder());

    return () => {
      // Cleanup will be handled by individual range cleanup
    };
  }, [dcInfo]);

  useEffect(() => {
    const fetchExistingRanges = async () => {
      if (!dcInfo?.branch_id || rangesLoaded) return;

      try {
        const response = await api.get(`/api/dc-manager/${dcInfo.branch_id}`);
        const data = response.data.data;

        if (data && map) {
          const newRanges = {
            pickup: [],
            drop: [],
            staff: [],
            driver: []
          };

          // Helper to attach listeners
          const addListeners = (entry, circle) => {
            circle.addListener("radius_changed", () => {
              const newRadiusKm = circle.getRadius() / 1000;
              entry.radiusKm = newRadiusKm;
              entry.input = `${entry.lat.toFixed(4)}, ${entry.lng.toFixed(4)} + ${(newRadiusKm / 1.60934).toFixed(1)} mi`;
            });

            circle.addListener("center_changed", () => {
              const newCenter = circle.getCenter();
              entry.lat = newCenter.lat();
              entry.lng = newCenter.lng();
              entry.input = `${entry.lat.toFixed(4)}, ${entry.lng.toFixed(4)} + ${(entry.radiusKm / 1.60934).toFixed(1)} mi`;
            });
          };

          // Helper to process a range type
          const processRanges = (sourceArray, targetArray) => {
            sourceArray.forEach(range => {
              const circle = createCircleFromData(range, map);
              const entry = {
                id: range.id,
                input: range.input || `${range.lat}, ${range.lng} + ${(range.radius_km / 1.60934).toFixed(1)} mi`,
                lat: range.lat,
                lng: range.lng,
                radiusKm: range.radius_km,
                polygon: circle,
                marker: null
              };
              addListeners(entry, circle);
              targetArray.push(entry);
            });
          };

          if (data.pick_up_range) {
            processRanges(data.pick_up_range, newRanges.pickup);
          }

          if (data.consignee_up_range) {
            processRanges(data.consignee_up_range, newRanges.drop);
          }

          if (data.staff_login_range) {
            processRanges(data.staff_login_range, newRanges.staff);
          }

          if (data.driver_login_range) {
            processRanges(data.driver_login_range, newRanges.driver);
          }

          setAllRanges(newRanges);
          setEditableRanges(newRanges);
          setRangesLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching existing ranges:', error);
        setRangesLoaded(true); // Prevent infinite loop on failure
      }
    };


    fetchExistingRanges();
  }, [dcInfo?.branch_id, map]);

  // Helper function to create circle from data
  const createCircleFromData = (range, mapInstance) => {
    const radiusMeters = range.radius_km * 1000; // Convert km to meters
    return new window.google.maps.Circle({
      center: { lat: range.lat, lng: range.lng },
      radius: radiusMeters,
      strokeColor: "#00008B",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#00008B",
      fillOpacity: 0.25,
      map: null, // Initially hidden
      editable: true
    });
  };

  // Handle visibility when switching area types - FIXED
  useEffect(() => {
    if (!map || !rangesLoaded) return;

    // Hide all ranges first
    Object.keys(allRanges).forEach(type => {
      allRanges[type].forEach(entry => {
        if (entry.polygon) entry.polygon.setMap(null);
        if (entry.marker) entry.marker.setMap(null);
      });
    });

    // Show only current area type ranges
    allRanges[currentAreaType].forEach(entry => {
      if (entry.polygon) entry.polygon.setMap(map);
      if (entry.marker) entry.marker.setMap(map);
    });
  }, [currentAreaType, map, rangesLoaded]); // Removed allRanges dependency to prevent redrawing

  const drawCircle = useCallback((center, radiusMiles) => {
    const radiusMeters = radiusMiles * 1609.34;
    return new window.google.maps.Circle({
      center,
      radius: radiusMeters,
      strokeColor: "#00008B",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#00008B",
      fillOpacity: 0.25,
      map: map,
      editable: true
    });
  }, [map]);

  const handleAddRange = useCallback((type, entry) => {
    setAllRanges(prev => {
      const updatedRanges = {
        ...prev,
        [type]: [...prev[type], entry]
      };

      // Update editableRanges as well
      setEditableRanges(updatedRanges);

      // Show the new range only if it's the current area type
      if (type === currentAreaType) {
        if (entry.polygon) entry.polygon.setMap(map);
        if (entry.marker) entry.marker.setMap(map);
      }

      return updatedRanges;
    });
  }, [currentAreaType, map]);

  const handleDeleteRangeById = async (rangeType, rangeId) => {
    const confirm = window.confirm("Are you sure you want to delete this range?");
    if (!confirm) return;

    try {
      const response = await api.delete(`/api/dc-manager/${dcInfo.branch_id}/ranges/${rangeType}/${rangeId}`);
      const result = response.data;

      if (result.success) {
        alert("✅ Range deleted successfully!");

        // Remove the item from allRanges and editableRanges
        setAllRanges(prev => ({
          ...prev,
          [rangeType]: prev[rangeType].filter(r => {
            // Remove circle from map
            if (r.id === rangeId && r.polygon) r.polygon.setMap(null);
            return r.id !== rangeId;
          })
        }));
        setEditableRanges(prev => ({
          ...prev,
          [rangeType]: prev[rangeType].filter(r => r.id !== rangeId)
        }));
      } else {
        console.error('Delete failed on backend:', result.message || result.error);
        alert("❌ Failed to delete range on server.");
      }
    } catch (error) {
      console.error("Delete range failed:", error);
      alert("❌ Something went wrong while deleting range.");
    }
  };



  // 2. Clear all ranges (inline)
  const handleClearCurrentType = async () => {
    const confirm = window.confirm(`Clear all "${currentAreaType}" ranges?`);
    if (!confirm) return;

    try {
      const response = await api.delete(`/api/dc-manager/${dcInfo.branch_id}/ranges/${currentAreaType}`);
      const result = response.data;

      if (result.success) {
        alert("✅ All ranges cleared successfully!");

        // Remove all circles from map
        allRanges[currentAreaType].forEach(r => {
          if (r.polygon) r.polygon.setMap(null);
          if (r.marker) r.marker.setMap(null);
        });

        setAllRanges(prev => ({ ...prev, [currentAreaType]: [] }));
        setEditableRanges(prev => ({ ...prev, [currentAreaType]: [] }));
      } else {
        console.error("Failed to clear ranges:", result.message);
        alert("❌ Failed to clear ranges.");
      }
    } catch (err) {
      console.error("Error clearing ranges:", err);
      alert("❌ Something went wrong while clearing ranges.");
    }
  };



  const handleRemoveRange = async (type, index) => {
    const item = allRanges[type][index];
    if (item.polygon) item.polygon.setMap(null);
    if (item.marker) item.marker.setMap(null);

    setAllRanges(prev => {
      const updated = {
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      };
      setEditableRanges(updated);
      return updated;
    });

    if (item.id && dcInfo?.branch_id) {
      await handleDeleteRangeById(type, item.id);
    }
  };

  const handleMapClick = useCallback((e) => {
    if (!manualMode || !map) return;

    const center = e.latLng;
    const radiusMiles = manualRadius;
    const circle = drawCircle(center, radiusMiles);

    const marker = new window.google.maps.Marker({
      position: center,
      map: map,
      draggable: true
    });

    const entry = {
      input: `${center.lat().toFixed(4)}, ${center.lng().toFixed(4)} + ${radiusMiles.toFixed(1)} mi`,
      lat: center.lat(),
      lng: center.lng(),
      radiusKm: radiusMiles * 1.60934,
      polygon: circle,
      marker
    };

    handleAddRange(currentAreaType, entry);

    marker.addListener("dragend", (e) => {
      const newCenter = e.latLng;
      circle.setCenter(newCenter);
      entry.lat = newCenter.lat();
      entry.lng = newCenter.lng();
      entry.input = `${newCenter.lat().toFixed(4)}, ${newCenter.lng().toFixed(4)} + ${radiusMiles.toFixed(1)} mi`;
    });

    circle.addListener("click", () => {
      setManualRadius(circle.getRadius() / 1609.34);
    });

    circle.addListener("radius_changed", () => {
      const radiusMiles = circle.getRadius() / 1609.34;
      setManualRadius(radiusMiles);
      entry.radiusKm = radiusMiles * 1.60934;
      entry.input = `${center.lat().toFixed(4)}, ${center.lng().toFixed(4)} + ${radiusMiles.toFixed(1)} mi`;
    });

    setManualMode(false);
    map.setOptions({ draggableCursor: null });
  }, [manualMode, map, manualRadius, drawCircle, handleAddRange, currentAreaType]);

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("click", handleMapClick);
    return () => window.google.maps.event.removeListener(listener);
  }, [map, handleMapClick]);

  const handleBatchAddRanges = useCallback(() => {
    if (!batchInput.trim()) return;

    const rawLocations = batchInput.trim().split("\n");
    rawLocations.forEach(loc => {
      loc = loc.trim();
      if (!loc) return;

      if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(loc)) {
        const [lat, lng] = loc.split(",").map(Number);
        const center = { lat, lng };
        const radiusMiles = manualRadius;
        const circle = drawCircle(center, radiusMiles);

        const entry = {
          input: `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} + ${radiusMiles.toFixed(1)} mi`,
          lat: center.lat,
          lng: center.lng,
          radiusKm: radiusMiles * 1.60934,
          polygon: circle
        };

        handleAddRange(currentAreaType, entry);
      } else {
        if (!geocoder) return;

        geocoder.geocode({ address: loc }, (results, status) => {
          if (status === "OK" && results[0]) {
            const center = results[0].geometry.location;
            const marker = new window.google.maps.Marker({
              position: center,
              map: map
            });

            const entry = {
              input: `${loc} → (${center.lat().toFixed(4)}, ${center.lng().toFixed(4)})`,
              lat: center.lat(),
              lng: center.lng(),
              radiusKm: 0,
              polygon: null,
              marker
            };

            handleAddRange(currentAreaType, entry);
          }
        });
      }
    });

    setBatchInput("");
  }, [batchInput, manualRadius, drawCircle, handleAddRange, currentAreaType, geocoder, map]);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Cleanup all circles and markers when component unmounts
      Object.keys(allRanges).forEach(type => {
        allRanges[type].forEach(entry => {
          if (entry.polygon) entry.polygon.setMap(null);
          if (entry.marker) entry.marker.setMap(null);
        });
      });
    };
  }, []);

  return (

    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">


      <div className="absolute inset-0 bg-black/10" onClick={onClose}></div>
      <div className="relative bg-white/95 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Geo Range Selector - {dcInfo.dcName}</h3>
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleClearCurrentType}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  disabled={!isEditMode}
                >
                  Clear All {currentAreaType.charAt(0).toUpperCase() + currentAreaType.slice(1)} Ranges
                </button>


                <button
                  onClick={async () => {
                    try {
                      if (!dcInfo?.branch_id) {
                        alert('Branch ID missing. Cannot save ranges.');
                        return;
                      }
                      const result = await updateDCRanges(dcInfo.branch_id, editableRanges);
                      setAllRanges({ ...editableRanges });
                      setManualRadius(editableManualRadius);
                      setIsEditMode(false);
                      alert('✅ Ranges saved successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('❌ Failed to save ranges. Please try again.');
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditableRanges({ ...allRanges });
                    setEditableManualRadius(manualRadius);
                    setIsEditMode(false);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-gray-50 p-4 rounded-lg mr-4 overflow-y-auto">
            <h3 className="font-medium mb-4">Delivery Center Setup</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">DC Name:</label>
                <input
                  type="text"
                  value={dcInfo.dcName}
                  className={`w-full p-2 border ${isEditMode ? 'bg-white' : 'bg-gray-100'} border-gray-300 rounded`}
                  readOnly={!isEditMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude:</label>
                <input
                  type="text"
                  value={dcInfo.coordinates.split(',')[0].trim()}
                  className={`w-full p-2 border ${isEditMode ? 'bg-white' : 'bg-gray-100'} border-gray-300 rounded`}
                  readOnly={!isEditMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude:</label>
                <input
                  type="text"
                  value={dcInfo.coordinates.split(',')[1].trim()}
                  className={`w-full p-2 border ${isEditMode ? 'bg-white' : 'bg-gray-100'} border-gray-300 rounded`}
                  readOnly={!isEditMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Area Type:</label>
                <div className="flex gap-2 mt-1">
                  {["pickup", "drop", "staff", "driver"].map(type => (
                    <button
                      key={type}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium 
                        ${currentAreaType === type
                          ? 'bg-blue-800 text-white'
                          : 'bg-white text-blue-800 border border-blue-800'}`}
                      onClick={() => setCurrentAreaType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Enter Pincodes or Lat,Lng:</label>
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  rows={4}
                  placeholder="401208&#10;19.25,72.85&#10;401209"
                  className={`w-full p-2 border border-gray-300 rounded ${!isEditMode ? 'bg-gray-100' : ''}`}
                  readOnly={!isEditMode}
                />
                <button
                  onClick={handleBatchAddRanges}
                  className={`mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isEditMode}
                >
                  Set Range
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Manual Pin Radius (miles):</label>
                <input
                  type="number"
                  value={manualRadius}
                  onChange={(e) => setManualRadius(parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                  className={`w-full p-2 border border-gray-300 rounded ${!isEditMode ? 'bg-gray-100' : ''}`}
                  readOnly={!isEditMode}
                />
                <button
                  onClick={() => {
                    setManualMode(true);
                    map.setOptions({ draggableCursor: "crosshair" });
                  }}
                  className={`mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isEditMode}
                >
                  Enable Manual Drop Pin
                </button>
              </div>

              {["pickup", "drop", "staff", "driver"].map(type => (
                <div key={type}>
                  <h4 className="font-medium mt-4 mb-2">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Ranges ({allRanges[type].length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {allRanges[type].map((range, index) => (
                      <div
                        key={index}
                        className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        <span className="truncate max-w-[150px]" title={range.input}>
                          {range.input}
                        </span>
                        {isEditMode && (
                          <button
                            onClick={() => {
                              const item = allRanges[type][index];
                              if (item.id) {
                                handleDeleteRangeById(type, item.id);
                              } else {
                                handleRemoveRange(type, index); // local-only removal
                              }
                            }}
                            className="ml-2 text-gray-600 hover:text-red-600"
                            title="Delete range"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// DCTableRow Component
const DCTableRow = ({ dc, onDelete, onEdit, onCheckboxChange, isSelected, loading }) => {
  const [showGeoRange, setShowGeoRange] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onCheckboxChange(dc.branch_id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.branch_id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.state}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.city}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.branch_name}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.full_address}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.pin_code}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.mobile_number || 'N/A'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.latitude}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dc.longitude}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex items-center">
            {dc.status}
            {dc.remark && (
              <div className="ml-2">
                <InformationCircleIcon
                  className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRemarkModal(true);
                  }}
                />
              </div>
            )}
            <RemarkModal
              isOpen={showRemarkModal}
              onClose={() => setShowRemarkModal(false)}
              title="Remarks"
              message={dc.remark || 'No remarks available'}
            />
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowGeoRange(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-green-700 text-xs"
              disabled={loading}
            >
              Set Range
            </button>
            <button
              onClick={() => onEdit(dc)}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs"
              disabled={loading}
            >
              Edit
            </button>
          </div>
        </td>
      </tr>

      {showGeoRange && (
        <GeoRangeSelector
          dcInfo={{
            dcName: dc.branch_name,
            coordinates: `${dc.latitude}, ${dc.longitude}`,
            branch_id: dc.branch_id
          }}
          onClose={() => setShowGeoRange(false)}
        />
      )}

    </>
  );
};

// GoogleMapView Component
const GoogleMapView = ({
  coordinates,
  onMarkerDragEnd,
  draggable = false,
}) => {
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);

  const [lat, lng] = coordinates
    ? coordinates.split(",").map((coord) => parseFloat(coord.trim()))
    : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 12,
    });

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      draggable,
    });

    marker.addListener("dragend", (e) => {
      if (onMarkerDragEnd) {
        onMarkerDragEnd(e.latLng.lat(), e.latLng.lng());
      }
    });

    mapInstance.addListener('click', (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      marker.setPosition({ lat: newLat, lng: newLng });
      if (onMarkerDragEnd) {
        onMarkerDragEnd(newLat, newLng);
      }
    });

    markerRef.current = marker;
    setMap(mapInstance);

    return () => {
      marker.setMap(null);
    };
  }, [lat, lng, draggable, onMarkerDragEnd]);

  useEffect(() => {
    if (!window.google?.maps?.places || !searchInputRef.current || !map) return;

    const searchAutocomplete = new window.google.maps.places.SearchBox(
      searchInputRef.current
    );

    map.addListener("bounds_changed", () => {
      searchAutocomplete.setBounds(map.getBounds());
    });

    searchAutocomplete.addListener('places_changed', () => {
      const places = searchAutocomplete.getPlaces();
      if (places.length === 0) return;
      const place = places[0];
      if (!place.geometry) return;

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      if (markerRef.current) {
        markerRef.current.setPosition(location);
      }

      map.setCenter(location);
      map.setZoom(15);

      if (onMarkerDragEnd) {
        onMarkerDragEnd(location.lat, location.lng);
      }
    });

    return () => {
      if (searchAutocomplete) {
        window.google.maps.event.clearInstanceListeners(searchAutocomplete);
      }
    };
  }, [map, onMarkerDragEnd]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }
  }, [lat, lng]);

  return (
    <div className="w-full">
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search location"
        className="w-full p-2 border border-gray-300 rounded mb-2"
      />
      <div ref={mapRef} className="w-full h-64 border border-gray-300" />
    </div>
  );
};



const DCCenterForm = ({ onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    branch_name: '',
    full_address: '',
    nearest_station: '',
    nearest_bus_stop: '',
    state: '',
    city: '',
    pin_code: '',
    mobile_number: '',
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lng,
    status: 'Active',
    remark: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/10" onClick={onClose}></div>
      <div className="relative bg-white/95 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4 relative top-0 bg-white py-2 z-10">
          <h3 className="text-lg font-semibold">{initialData ? 'Edit DC' : 'Register New DC'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name*:</label>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                minLength="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State*:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                minLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City*:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                minLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address:</label>
              <input
                type="text"
                name="full_address"
                value={formData.full_address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                minLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number:</label>
              <input
                type="number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                minLength="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Station:</label>
              <input
                type="text"
                name="nearest_station"
                value={formData.nearest_station}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                minLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Bus Stop:</label>
              <input
                type="text"
                name="nearest_bus_stop"
                value={formData.nearest_bus_stop}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                minLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode:</label>
              <input
                type="number"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                min="100000"
                max="999999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remark:</label>
              <input
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mt-4">
            <GoogleMapView
              coordinates={`${formData.latitude}, ${formData.longitude}`}
              onMarkerDragEnd={handleLocationChange}
              draggable={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude*:</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded"
                required
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude*:</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded"
                required
                step="any"
              />
            </div>
          </div>

          <div className="relative bottom-0 bg-white py-4 border-t">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main DCCenterManagement Component
const DCCenterManagement = () => {
  const [showHolidaySettings, setShowHolidaySettings] = useState(false);
  const [dcCenters, setDcCenters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDC, setEditingDC] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // Now stores branch_id instead of index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [dcToDelete, setDcToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    const fetchDCCenters = async () => {
      try {
        setLoading(true);
        const data = await getDCCenters();
        setDcCenters(data);
        setError(null);
      } catch (err) {
        setError('Failed to load DC centers. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDCCenters();
  }, []);

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      return new Promise((resolve) => {
        if (window.google?.maps) {
          setMapsLoaded(true);
          return resolve();
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setMapsLoaded(true);
          resolve();
        };
        script.onerror = () => {
          setError('Failed to load Google Maps. Please check your connection.');
          resolve();
        };
        document.head.appendChild(script);
      });
    };

    loadGoogleMapsAPI();
  }, []);

  const handleAddDC = async (dcData) => {
    try {
      setLoading(true);
      if (editingDC) {
        // Update existing DC
        const updatedDC = await updateDCCenter(editingDC.branch_id, dcData);
        setDcCenters(prev =>
          prev.map(dc => dc.id === editingDC.id ? { ...updatedDC, id: editingDC.id } : dc)
        );
        setSuccessMessage('✅ DC Center updated successfully!');
        setEditingDC(null);
      } else {
        // Create new DC
        const newDC = await createDCCenter(dcData);
        setDcCenters(prev => [...prev, newDC]);
        setSuccessMessage('✅ DC Center registered successfully!');
      }
      setShowForm(false);
      setError(null);

      // Clear the message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(editingDC ? 'Failed to update DC center. Please try again.' : 'Failed to create DC center. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleEditDC = (dc) => {
    setEditingDC(dc);
    setShowForm(true);
  };

  const handleDeleteDC = async (index) => {
    const dc = dcCenters[index];
    if (!window.confirm(`Are you sure you want to delete ${dc.dcName}?`)) return;

    try {
      setLoading(true);
      await deleteDCCenter(dc.branch_id);
      setDcCenters(prev => prev.filter((_, i) => i !== index));
      setSelectedRows(prev => prev.filter(i => i !== index));
      setSuccessMessage('✅ DC Center deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setError(null);
    } catch (err) {
      setError('Failed to delete DC center. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (branchId) => {
    setSelectedRow(prevId => prevId === branchId ? null : branchId);
  };

  const handleBulkDelete = () => {
    if (selectedRow === null) {
      alert('Please select a DC center to delete.');
      return;
    }
    const dcToDeleteIndex = dcCenters.findIndex(dc => dc.branch_id === selectedRow);
    if (dcToDeleteIndex === -1) {
      setError('Selected DC center not found.');
      return;
    }
    setDcToDelete(dcToDeleteIndex);
    setConfirmationStep(1);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmationStep < 3) {
      setConfirmationStep(prev => prev + 1);
      return;
    }

    // All confirmations passed, proceed with deletion
    try {
      setShowConfirmation(false);
      setLoading(true);

      // Find the DC center by branch_id
      const dcToDeleteItem = dcCenters.find(dc => dc.branch_id === selectedRow);
      if (!dcToDeleteItem) {
        throw new Error('Selected DC center not found');
      }

      // Call delete API with the DC's ID
      await deleteDCCenter(dcToDeleteItem.branch_id);

      // Remove the deleted item from state using branch_id
      setDcCenters(prev => prev.filter(dc => dc.branch_id !== selectedRow));
      setSelectedRow(null);
      setSuccessMessage('✅ DC Center deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setError(null);
    } catch (err) {
      setError('Failed to delete the selected DC center. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
      setDcToDelete(null);
      setConfirmationStep(1);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setConfirmationStep(1);
    setDcToDelete(null);
  };

  const getConfirmationMessage = () => {
    switch (confirmationStep) {
      case 1:
        return {
          title: 'Warning: Critical Action',
          message: 'You are about to take a very crucial step, it might be fatal, are you sure to delete the selected Delivery Center?',
          confirmText: 'Yes, Continue'
        };
      case 2:
        return {
          title: 'Re-confirmation Required',
          message: 'Re Confirm: Are you really sure to delete the selected Delivery Center?',
          confirmText: 'Yes, I\'m sure'
        };
      case 3:
        return {
          title: 'Final Confirmation',
          message: 'Please confirm to delete the selected Delivery Center',
          confirmText: 'Confirm Delete',
          cancelText: 'Cancel'
        };
      default:
        return { title: '', message: '', confirmText: 'Confirm' };
    }
  };

  // Add this to your global styles or CSS file
  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `;
const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="container mx-auto p-4">
      <style>{styles}</style>
      <h2 className="text-2xl font-bold mb-6">DC Center Management</h2>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-800 rounded animate-fadeIn">
          {successMessage}
        </div>
      )}


      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        {...getConfirmationMessage()}
      />

      <div className="flex items-center gap-4 mb-6">
        
        
       <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
        >
          {showSettings ? "Back to DC Management" : "Set Holiday"}
        </button>
      </div>

      {showForm && (
        <DCCenterForm
          onClose={() => {
            setShowForm(false);
            setEditingDC(null);
          }}
          onSubmit={handleAddDC}
          loading={loading}
          initialData={editingDC}
        />
      )}

      {/* Header */}
      

      {/* Content Area */}
      {showSettings ? (
        <DeliveryCenterOffSettings />
      ) : (
      <div>
          {/* //add here set holiday button with that would be rendering in mainframe */}
<button
          onClick={() => {
            setEditingDC(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!mapsLoaded || loading}
        >
          {loading ? 'Loading...' : 'Create New DC'}
        </button>

        <button
          onClick={handleBulkDelete}
          className={`mx-4 py-2 px-4 rounded ${selectedRow !== null
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          disabled={selectedRow === null || loading}
        >
          Delete
        </button>


        <h3 className="text-xl font-semibold mb-4">Registered DC Centers</h3>

        {loading && dcCenters.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {/* <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedRow !== null}
                    onChange={() => setSelectedRow(null)}
                    disabled={loading}
                  /> */}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Branch ID</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">DC Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Full Address</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pincode</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dcCenters.map((dc) => (
                  <DCTableRow
                    key={dc.id || dc.branch_id}
                    dc={dc}
                    onDelete={handleDeleteDC}
                    onEdit={handleEditDC}
                    onCheckboxChange={handleCheckboxChange}
                    isSelected={selectedRow === dc.branch_id}
                    loading={loading}
                  />
                ))}
                {dcCenters.length === 0 && !loading && (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                      No DC centers registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>)}
    </div>
    
  );
};

export default DCCenterManagement;