import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { connect, useSelector } from "react-redux";
import { useFindNearestDCMutation } from "../../../lib/api/apiSlice";
import {
  placeMangeRegister,
  placeMangerGetSingleSourceData,
  updatePlace,
} from "../../../utils/placeManager";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  searchAddresses,
  getAddressesByType,
} from "../../../utils/addressService";


// Helper to truncate text with tooltip
const TruncatedText = ({ text, maxLength = 15 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVerticalPosition, setTooltipVerticalPosition] = useState('top');
  const tooltipRef = useRef(null);
  const spanRef = useRef(null);

  if (!text) return <span>-</span>;

  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  const shouldTruncate = text.length > maxLength;

  const handleMouseEnter = () => {
    setShowTooltip(true);

    // Calculate tooltip position after it's rendered
    setTimeout(() => {
      if (spanRef.current) {
        const span = spanRef.current;
        const rect = span.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        // Calculate tooltip dimensions (approximate)
        const tooltipWidth = Math.min(300, text.length * 8); // Rough estimate
        const tooltipHeight = 40; // Approximate height

        // Calculate horizontal position
        let x = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (x < 10) x = 10; // Left margin
        if (x + tooltipWidth > windowWidth - 10) x = windowWidth - tooltipWidth - 10; // Right margin

        // Calculate vertical position
        let y = rect.top - tooltipHeight - 10; // Above by default
        let verticalPos = 'top';

        // If not enough space above, show below
        if (y < 10) {
          y = rect.bottom + 10;
          verticalPos = 'bottom';
        }

        setTooltipPosition({ x, y });
        setTooltipVerticalPosition(verticalPos);
      }
    }, 0);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipPosition({ x: 0, y: 0 });
    setTooltipVerticalPosition('top');
  };

  if (!shouldTruncate) {
    return <span>{text}</span>;
  };

  return (
    <div className="relative inline-block">
      <span
        ref={spanRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {truncatedText}
      </span>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] p-2 bg-gray-800 text-white text-sm rounded shadow-lg max-w-sm pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="whitespace-normal break-words">{text}</div>
          <div
            className={`absolute border-4 border-transparent ${tooltipVerticalPosition === 'top'
              ? 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800'
              : 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800'
              }`}
          />
        </div>
      )}
    </div>
  );
};

// Constants
const MAPS_API_KEY = "AIzaSyCDhyFI5zyW3KR-ESWfvUS__44LMUPU25c";
const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777 }; // Mumbai

/**
 * Loads Google Maps API asynchronously
 */
const loadGoogleMapsAPI = () => {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

/**
 * Google Maps Component to display and select location
 */
const GoogleMapView = ({
  coordinates,
  addressInfo,
  onMarkerDragEnd,
  draggable = false,
  onSearchLocation, // New prop to handle search location updates
}) => {
  const mapRef = React.useRef(null);
  const searchInputRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [mapType, setMapType] = useState('roadmap');

  // Parse coordinates or use default
  const [lat, lng] = coordinates
    ? coordinates.split(",").map((coord) => parseFloat(coord.trim()))
    : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];

  // Initialize map with marker and search box
  useEffect(() => {
    const initMap = async () => {
      try {
        // Load Google Maps API if not already loaded
        if (!window.google?.maps) {
          await loadGoogleMapsAPI();
          // Add a small delay to ensure the API is fully loaded
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!mapRef.current) return;

        // Ensure the map container has proper dimensions
        const container = mapRef.current;
        container.style.width = '100%';
        container.style.height = '100%';

        // Force a reflow to ensure dimensions are applied
        container.style.display = 'none';
        container.offsetHeight; // Trigger reflow
        container.style.display = 'block';

        // Create map instance
        const mapInstance = new window.google.maps.Map(container, {
          center: { lat, lng },
          zoom: 15,
          mapTypeId: mapType,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
          },
          scaleControl: true,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        // Initialize search box
        const initializeSearchBox = () => {
          const input = document.getElementById('search-input');
          if (!input || !window.google.maps.places) return;

          // Clear any existing listeners to prevent duplicates
          const oldInput = input.cloneNode(true);
          input.parentNode.replaceChild(oldInput, input);

          const searchBox = new window.google.maps.places.SearchBox(oldInput, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'in' },
            fields: ['formatted_address', 'geometry', 'name', 'place_id']
          });

          // Bias the SearchBox results towards current map's viewport
          mapInstance.addListener('bounds_changed', () => {
            searchBox.setBounds(mapInstance.getBounds());
          });

          // Handle place selection
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            if (!places || places.length === 0) {
              console.log('No places found');
              return;
            }

            // For each place, get the location and update the marker
            const bounds = new window.google.maps.LatLngBounds();

            places.forEach(place => {
              if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
              }

              const location = place.geometry.location;
              const lat = location.lat();
              const lng = location.lng();

              // Update the marker position
              if (markerRef.current) {
                markerRef.current.setPosition(location);
              } else {
                // Create a new marker if it doesn't exist
                markerRef.current = new window.google.maps.Marker({
                  position: location,
                  map: mapInstance,
                  draggable: draggable,
                  animation: window.google.maps.Animation.DROP
                });

                // Add dragend event listener if draggable
                if (draggable) {
                  markerRef.current.addListener('dragend', (e) => {
                    const newPos = e.latLng;
                    if (onMarkerDragEnd) {
                      onMarkerDragEnd(newPos.lat(), newPos.lng());
                    }
                  });
                }
              }

              // Call the onSearchLocation callback if provided
              if (onSearchLocation) {
                onSearchLocation(lat, lng);
              }

              // Call the onMarkerDragEnd to update coordinates in parent
              if (onMarkerDragEnd) {
                onMarkerDragEnd(lat, lng);
              }

              if (place.geometry.viewport) {
                // Only geocodes have viewport
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(location);
              }
            });

            mapInstance.fitBounds(bounds);
          });
        }

        // Set map instance and initialize search box
        setMap(mapInstance);
        setMapLoaded(true);

        // Initialize search box after map is loaded
        initializeSearchBox(mapInstance);

        // Clean up
        return () => {
          if (mapInstance) {
            window.google.maps.event.clearInstanceListeners(mapInstance);
          }
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, [draggable, lat, lng, mapType]);

  // Handle marker creation and updates
  useEffect(() => {
    if (!map) return;

    // Remove existing marker if any
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Only create marker if we have valid coordinates
    if (coordinates) {
      const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          draggable,
          animation: window.google.maps.Animation.DROP
        });

        // Add dragend event listener if draggable
        if (draggable) {
          marker.addListener('dragend', (e) => {
            const newPos = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            };
            if (onMarkerDragEnd) {
              onMarkerDragEnd(newPos.lat, newPos.lng);
            }

            // Reverse geocode to get address details
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: newPos }, (results, status) => {
              if (status === 'OK' && results[0]) {
                if (onSearchLocation) {
                  onSearchLocation(newPos.lat, newPos.lng, results[0].formatted_address);
                }
              }
            });
          });
        }

        markerRef.current = marker;

        // Center the map on the marker
        const center = { lat, lng };
        map.setCenter(center);
        map.setZoom(15); // Zoom in a bit more when marker is placed
      }
    }
  }, [map, coordinates, draggable, onMarkerDragEnd, onSearchLocation]);

  // Initialize search functionality
  const initializeSearchBox = (mapInstance) => {
    if (!window.google?.maps?.places) return;

    const input = document.getElementById('search-input');
    if (!input) return;

    // Clear any existing autocomplete instances
    if (searchBox) {
      window.google.maps.event.clearInstanceListeners(searchBox);
    }

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name', 'address_components'],
      types: ['geocode', 'establishment']
    });

    // Bias the search results towards the current map viewport
    mapInstance.addListener('bounds_changed', () => {
      autocomplete.setBounds(mapInstance.getBounds());
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        console.log('No details available for input: ' + place.name);
        return;
      }

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new draggable marker at searched location
      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('dragend', (e) => {
        const newPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        if (onMarkerDragEnd) {
          onMarkerDragEnd(newPos.lat, newPos.lng);
        }
      });

      markerRef.current = marker;

      // Update map view
      mapInstance.setCenter(location);
      mapInstance.setZoom(15);

      // Notify parent component about the change
      if (onMarkerDragEnd) {
        onMarkerDragEnd(location.lat, location.lng);
      }

      // If there's an onSearchLocation callback, call it with the place details
      if (onSearchLocation) {
        onSearchLocation(location.lat, location.lng, place.formatted_address);
      }
    });

    setSearchBox(autocomplete);
  };

  // Handle map click to add/update marker
  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new draggable marker at clicked position
      const marker = new window.google.maps.Marker({
        position: { lat: newLat, lng: newLng },
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('dragend', (e) => {
        const newPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        if (onMarkerDragEnd) {
          onMarkerDragEnd(newPos.lat, newPos.lng);
        }

        // Reverse geocode to get address details
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === 'OK' && results[0]) {
            if (onSearchLocation) {
              onSearchLocation(newPos.lat, newPos.lng, results[0].formatted_address);
            }
          }
        });
      });

      markerRef.current = marker;

      // Notify parent component about the change
      if (onMarkerDragEnd) {
        onMarkerDragEnd(newLat, newLng);
      }

      // Reverse geocode to get address details
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          if (onSearchLocation) {
            onSearchLocation(newLat, newLng, results[0].formatted_address);
          }
        }
      });
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [map, onMarkerDragEnd, onSearchLocation]);

  return (
    <div className="mt-6 mb-6 w-full">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-600 flex items-center">
          <LocationIcon className="w-5 h-5 mr-2" />
          Location Map
        </h4>
        <div className="flex items-center mb-2">
          <button
            type="button"
            className={`px-3 py-1 rounded-l border border-blue-500 ${mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setMapType('roadmap')}
          >
            Map
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-r border border-blue-500 ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            onClick={() => setMapType('satellite')}
          >
            Satellite
          </button>
        </div>
      </div>
      <div className="border-2 border-blue-100 rounded-xl w-full overflow-hidden relative shadow-md hover:shadow-lg transition-all duration-300" style={{ height: '500px' }}>
        {/* Search Box Container - Positioned absolutely within the map container */}
        <div
          className="pac-container"
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            zIndex: 10,
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
          }}
        >
          <input
            id="search-input"
            ref={searchInputRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            style={{ width: '100%' }}
            autoComplete="off"
            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        </div>
        {/* Map Container */}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>
    </div>
  );
};

// Helper Components
const LocationIcon = (props) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    ></path>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    ></path>
  </svg>
);

/**
 * Reusable Input Field Component
 */
const InputField = ({
  label,
  name,
  type = "text",
  required = false,
  validate,
  onValidationChange,
  error,
  value = "",
  onChange,
  ...props
}) => {
  const handleChange = (e) => {
    const { value } = e.target;

    // Call validation and change handlers if provided
    validate?.(value);
    onValidationChange?.(name, value);
    onChange?.(e);
  };

  // Dynamic input classes
  const inputClasses = `
    w-full px-4 py-2 border rounded-lg shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-blue-400 transition
    ${error ? "border-red-500" : "border-gray-300"}
  `;

  return (
    <div className="mb-4">
      <label
        className="block text-sm font-semibold text-gray-700 mb-1"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={label}
        onChange={handleChange}
        className={inputClasses}
        aria-label={label}
        maxLength={name.includes("pincode") ? 6 : undefined}
        value={value}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

/**
 * Address Section Component for both Pickup and Consignee addresses
 */
const AddressSection = ({ title, prefix, delay, onSubmit, customerId, userSession }) => {
  // Initial form state
  const initialFormData = {
    contact_person_name: "",
    company_name: "",
    gst_no: "",
    address_line1: "",
    address_line2: "",
    nearest_railway_station: "",
    nearest_bus_stop: "",
    landmark: "",
    latitude: "",
    longitude: "",
    city: "",
    state: "",
    pincode: "",
    parking_place_availability: "NO",
    contact_person_mobile: "",
    alternate_number: "",
    connected_hub: "",
  };

  // State management
  const [state, setState] = useState({
    formData: { ...initialFormData },
    pincodeError: "",
    isLoading: false,
    mapModalOpen: false,
    selectedCoordinates: "",
    selectedAddress: "",
    mapCenter: { ...DEFAULT_LOCATION },
    addressSuggestions: [],
    showSuggestions: false,
    searchQuery: "",
  });
  const [mapsApiLoaded, setMapsApiLoaded] = useState(false);

  const [sameAsContact, setSameAsContact] = useState(false);


  const [findNearestDC] = useFindNearestDCMutation();


  const [toast, setToast] = useState({ open: false, message: '' });

  const closeToast = () => {
    setToast({ open: false, message: '' });
  };


  // Destructure state for easier access
  const {
    formData,
    pincodeError,
    isLoading,
    mapModalOpen,
    selectedCoordinates,
    selectedAddress,
    mapCenter,
    addressSuggestions,
    showSuggestions,
    searchQuery,
  } = state;

  // Helper to get field value with fallback
  const getFieldValue = (fieldName) => {
    return formData[fieldName] || "";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Validate required fields
      if (!validateRequiredFields()) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Prepare the form data for submission
      const submissionData = {
        ...formData,
        place_type: prefix === 'pickup' ? 'Pickup Place' : 'Consignee Place',
        place_source: customerId,
        place_source_name: userSession?.firstName ?
          `${userSession.firstName} ${userSession.lastName || ''}`.trim() :
          'Customer',
        created_by: 'Customer',
        status: 'Under Review',
        address_line1: formData.address_line1,
        address_line2: formData.address_line2 || '',
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        nearest_railway_station: formData.nearest_railway_station,
        nearest_bus_stop: formData.nearest_bus_stop,
        landmark: formData.landmark,
        parking_place_availability: formData.parking_place_availability || 'NO',
        contact_person_name: formData.contact_person_name,
        contact_person_mobile: formData.contact_person_mobile,
        company_name: formData.company_name || '',
        gst_no: formData.gst_no || '',
        latitude: formData.latitude,
        longitude: formData.longitude,
        alternate_number: formData.alternate_number || '',
        connected_hub: formData.connected_hub || '',
      };

      console.log('Submitting address:', submissionData);

      // Call the parent's onSubmit handler
      if (onSubmit) {
        await onSubmit(submissionData);
      }

      // Reset form after successful submission
      setState(prev => ({
        ...prev,
        formData: { ...initialFormData },
        pincodeError: "",
        isLoading: false,
      }));

      // Show success message
      alert('Address saved successfully!');

    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to save address. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData(name, value);
  };

  /**
   * Validates pincode format (6 digits)
   */
  const validatePincode = (pincode) => {
    const isValid = /^\d{6}$/.test(pincode);
    setState((prev) => ({
      ...prev,
      pincodeError: isValid ? "" : "Please enter a valid 6-digit pincode",
    }));
    return isValid;
  };

  /**
   * Validates pincode when it changes
   */
  const handlePincodeChange = async (name, pincode) => {
    // Update form data
    updateFormData(name, pincode);

    // Validate pincode format
    if (pincode.length > 0 && !/^\d{0,6}$/.test(pincode)) {
      setState(prev => ({
        ...prev,
        pincodeError: "Pincode must contain only numbers"
      }));
      return;
    }

    // Clear error if pincode is valid or empty
    setState(prev => ({
      ...prev,
      pincodeError: pincode.length === 6 ? "" :
        (pincode.length > 0 ? "Pincode must be 6 digits" : "")
    }));
  };

  /**
   * Updates form data with the given field and value
   */
  const updateFormData = (field, value) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };
  const updateMapCenter = (address, callback) => {
    if (!window.google?.maps?.Geocoder) {
      if (callback) callback(null);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      {
        address: address,
        region: "in",
        componentRestrictions: { country: "IN" },
      },
      (results, status) => {
        if (status === "OK" && results[0]?.geometry?.location) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          setState((prev) => ({
            ...prev,
            mapCenter: { lat, lng },
          }));

          if (callback) callback({ lat, lng });
        } else if (callback) {
          callback(null);
        }
      }
    );
  };



  /**
   * Validate all required fields
   */
  const validateRequiredFields = () => {
    const requiredFields = [
      "contact_person_name",
      "contact_person_mobile",
      "company_name",
      "address_line1",
      "city",
      "state",
      "pincode",
      "nearest_railway_station",
      "nearest_bus_stop",
      "landmark",
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        // Show error message to user
        alert(
          `Please fill in the required field: ${field
            .replace(/_/g, " ")
            .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())}`
        );
        // Only clear the invalid field, not the whole form
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            [field]: ''
          }
        }));
        return false;
      }
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(formData.pincode)) {
      setState((prev) => ({
        ...prev,
        pincodeError: "Please enter a valid 6-digit pincode",
        formData: {
          ...prev.formData,
          pincode: ''
        }
      }));
      alert("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  /**
   * Prepare form data for submission
   */
  const prepareSubmissionData = () => {
    const {
      contact_person_name,
      company_name,
      gst_no,
      address_line1,
      address_line2,
      nearest_railway_station,
      nearest_bus_stop,
      landmark,
      latitude,
      longitude,
      city,
      state,
      pincode,
      parking_place_availability,
      contact_person_mobile,
      alternate_number,
    } = formData;

    return {
      contact_person_name,
      company_name,
      gst_no,
      address: [address_line1, address_line2].filter(Boolean).join(", "),
      nearest_railway_station,
      nearest_bus_stop,
      landmark,
      latitude,
      longitude,
      city,
      state,
      pincode,
      parking_place_availability: parking_place_availability || "NO",
      contact_person_mobile,
      alternate_number,
      // Add any additional fields needed by the API
      place_type: prefix === "pickup" ? "Pickup Place" : "Consignee Place",
      status: "Under Review",
    };
  };

  // Initialize Google Maps Places API
  useEffect(() => {
    const loadMapsAPI = async () => {
      try {
        await loadGoogleMapsAPI();
        setMapsApiLoaded(true);
        if (window.google?.maps?.places) {
          initAutocomplete();
        }
      } catch (error) {
        console.error("Failed to load Google Maps API:", error);
      }
    };

    loadMapsAPI();
  }, []);

  useEffect(() => {
    if (sameAsContact) {
      updateFormData("company_name", formData.contact_person_name);
    }
    // eslint-disable-next-line
  }, [formData.contact_person_name, sameAsContact]);



  /**
   * Initialize Google Places Autocomplete
   */
  const initAutocomplete = () => {
    const addressInput = document.getElementById(`${prefix}-address`);
    if (!addressInput) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInput,
        {
          componentRestrictions: { country: "in" },
          fields: ["address_components", "geometry"],
          types: ["address"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.log("No location found for the input");
          return;
        }

        // Extract address components
        const addressInfo = extractAddressComponents(place);

        // Update form data with address components
        Object.entries(addressInfo).forEach(([key, value]) => {
          if (value !== undefined) {
            updateFormData(key, value);
          }
        });

        // Update map center
        // updateMapCenter(place.formatted_address);

        // Find nearby places
        // findNearbyPlaces(place.geometry.location);
      });
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  };

  /**
   * Extract address components from Google Places result
   */
  const extractAddressComponents = (place) => {
    const components = {};
    const addressMap = {
      // street_number: "street_number",
      route: "route",
      locality: "city",
      administrative_area_level_1: "state",
      postal_code: "pincode",
      country: "country",
    };

    place.address_components?.forEach((component) => {
      const componentType = component.types[0];
      if (addressMap[componentType]) {
        components[addressMap[componentType]] = component.long_name;
      }
    });

    // Add formatted address and coordinates
    // components.address_line1 = place.formatted_address || "";
    components.latitude = place.geometry?.location.lat() || "";
    components.longitude = place.geometry?.location.lng() || "";

    return components;
  };

  /**
   * Find nearby places like bus stations and landmarks
   */
  // const findNearbyPlaces = (location) => {
  //   if (!window.google?.maps?.places) return;

  //   const placesService = new window.google.maps.places.PlacesService(
  //     document.createElement("div")
  //   );

  //   // Find nearest bus station
  //   findPlace(placesService, location, "bus_station", "nearest_bus_stop");

  //   // Find nearest landmark
  //   findPlace(placesService, location, "point_of_interest", "landmark");
  // };

  /**
   * Helper to find a specific type of place
   */
  const findPlace = (service, location, type, fieldName) => {
    service.nearbySearch(
      {
        location,
        radius: 500, // 500 meters
        type: [type],
      },
      (results, status) => {
        if (status === "OK" && results?.[0]?.name) {
          updateFormData(fieldName, results[0].name);
        }
      }
    );
  };

  // Handle form field changes for contact numbers
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and limit to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      updateFormData(name, value);
    }
  };

  // Handler for marker drag on map
  const handleMarkerDragEnd = (lat, lng) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        latitude: lat,
        longitude: lng,
      },
      mapCenter: { lat, lng },
    }));
  };

  // Handler for search location updates
  const handleSearchLocation = (lat, lng, formattedAddress = '') => {
    // Only update address_line1 if formattedAddress is provided (i.e., a search was performed)
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        latitude: lat,
        longitude: lng,
        ...(formattedAddress ? { address_line1: formattedAddress } : {})
      },
      mapCenter: { lat, lng }
    }));

    // If we have a formatted address, try to extract more details
    if (formattedAddress) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: formattedAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const addressComponents = results[0].address_components;
          const addressInfo = {};

          // Extract address components
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('locality')) {
              addressInfo.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              addressInfo.state = component.long_name;
            } else if (types.includes('postal_code')) {
              addressInfo.pincode = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              addressInfo.landmark = component.long_name;
            }
          });

          // Update form data with extracted address components
          if (Object.keys(addressInfo).length > 0) {
            setState(prev => ({
              ...prev,
              formData: {
                ...prev.formData,
                ...addressInfo
              }
            }));
          }
        }
      });
    }
  };

  useEffect(() => {
    const assignHub = async () => {
      const { latitude, longitude } = state.formData;
      if (!latitude || !longitude) return;

      try {
        const res = await findNearestDC({ lat: latitude, lng: longitude, rangeType: "pick_up_range" }).unwrap();
        if (res.success && res.data) {
          setState(prev => ({
            ...prev,
            formData: {
              ...prev.formData,
              connected_hub: res.data.dc_name,
            },
          }));
          setToast({ open: true, message: `Auto-assigned to ${res.data.dc_name}`, status: 'success' });
        } else {
          setState(prev => ({
            ...prev,
            formData: {
              ...prev.formData,
              connected_hub: "",
            },
          }));
          setToast({ open: true, message: "Location out of service range", status: 'error' });
        }
      } catch {
        setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            connected_hub: "",
          },
        }));
        setToast({ open: true, message: "Failed to auto-assign DC", status: 'error' });
      }
    };

    assignHub();
  }, [state.formData.latitude, state.formData.longitude]);



  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full"
    >
      {toast.open && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50
      ${toast.status === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
            }`}
        >
          <span>{toast.message}</span>
          <button
            className={`ml-4 text-sm underline ${toast.status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            onClick={closeToast}
          >
            Close
          </button>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-6 text-center border-b pb-2">
        {title}
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Contact  Person Name"
            name="contact_person_name"
            required
            value={getFieldValue("contact_person_name")}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
              <input
                type="checkbox"
                checked={sameAsContact}
                onChange={e => setSameAsContact(e.target.checked)}
                className="ml-2"
              />
              <span className="ml-1 text-xs text-gray-500">Same as Contact Person Name</span>
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={e => {
                if (!sameAsContact) handleChange(e);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={sameAsContact}
            />
          </div>
          <InputField
            label="Contact Person Mobile"
            name="contact_person_mobile"
            type="tel"
            value={getFieldValue("contact_person_mobile")}
            onChange={handleContactChange}
            placeholder="Enter 10-digit contact number"
            pattern="\d{10}|^$"
            required
          />
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Number
            </label>
            <input
              type="tel"
              name="alternate_number"
              value={getFieldValue("alternate_number")}
              onChange={handleContactChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Optional: 10-digit alternate number"
              pattern="\d{10}|^$"
              title="Please enter a valid 10-digit contact number or leave empty"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number (Optional)
            </label>
            {/* <p className="text-xs text-gray-500 mb-2">
              Format: 22AAAAA0000A1Z5 (2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter)
            </p> */}
            <input
              type="text"
              name="gst_no"
              value={getFieldValue("gst_no")}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 22AAAAA0000A1Z5"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking Place Availability
            </label>
            <select
              name="parking_place_availability"
              value={getFieldValue("parking_place_availability")}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>
          {/* <InputField
            label="DC Hub"
            name="dc_hub"
            value={getFieldValue("dc_hub")}
            disabled
            placeholder="Not available"
          /> */}
          <InputField
            label="Address Line 1"
            name="address_line1"
            required
            value={getFieldValue("address_line1")}
            onChange={handleChange}
          />
          <InputField
            label="Address Line 2"
            name="address_line2"
            value={getFieldValue("address_line2")}
            onChange={handleChange}
          />
          <InputField
            label="Nearest Railway Station"
            name="nearest_railway_station"
            required
            value={getFieldValue("nearest_railway_station")}
            onChange={handleChange}
          />
          <InputField
            label="Nearest Bus Stop"
            name="nearest_bus_stop"
            required
            value={getFieldValue("nearest_bus_stop")}
            onChange={handleChange}
          />
          <InputField
            label="Landmark"
            name="landmark"
            required
            value={getFieldValue("landmark")}
            onChange={handleChange}
          />
          <InputField
            label="Pincode"
            name="pincode"
            type="text"
            required
            validate={validatePincode}
            onValidationChange={handlePincodeChange}
            error={pincodeError}
            value={getFieldValue("pincode")}
            onChange={handleChange}
          />
          <InputField
            label="State"
            name="state"
            required
            value={getFieldValue("state")}
            onChange={handleChange}
          />

          <InputField
            label="City"
            name="city"
            required
            value={getFieldValue("city")}
            onChange={handleChange}
          />
          {/* <InputField
            label="State"
            name="state"
            required
            value={getFieldValue("state")}
            onChange={handleChange}
          /> */}
          <InputField
            label="Latitude"
            name="latitude"
            required
            value={getFieldValue("latitude")}
            onChange={handleChange}
            readOnly
          />
          <InputField
            label="Longitude"
            name="longitude"
            required
            value={getFieldValue("longitude")}
            onChange={handleChange}
            readOnly
          />
          <InputField
            label="DC Hub"
            name="dc_hub"
            value={formData.connected_hub || formData.dc_hub || ""}
            disabled
            placeholder="Not available"
          />
        </div>

        {/* Show live map below address fields */}
        <div className="mt-4">
          {mapsApiLoaded ? (
            <GoogleMapView
              coordinates={
                formData.latitude && formData.longitude
                  ? `${formData.latitude},${formData.longitude}`
                  : ""
              }
              addressInfo={{
                address: [
                  formData.address_line1,
                  formData.address_line2,
                  formData.landmark,
                ]
                  .filter(Boolean)
                  .join(", "),
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
              }}
              onMarkerDragEnd={handleMarkerDragEnd}
              onSearchLocation={handleSearchLocation}
              draggable={true}
            />
          ) : (
            <div className="text-center text-gray-500 py-10">
              Loading map...
            </div>
          )}
        </div>
        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Submit {title}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// Helper Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
      >
        Retry
      </button>
    )}
  </div>
);

const RefreshButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
  >
    {loading ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Refreshing...
      </>
    ) : (
      <>
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </>
    )}
  </button>
);

// Editable Map Component with Search and Draggable Marker (from ManageAddress.jsx)
const EditableMap = ({ coordinates, onCoordinatesChange, onAddressChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 19.076, lng: 72.8777 });
  const [address, setAddress] = useState("");
  const [parsedCoords, setParsedCoords] = useState({ lat: null, lng: null });
  const zoom = 14; // Default zoom level
  const [mapType, setMapType] = useState("roadmap");

  // Handle place selection from search
  const handlePlaceSelect = () => {
    if (!searchBoxRef.current) {
      console.error("Search box reference not available");
      return;
    }

    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) {
      console.log("No places found in search results");
      return;
    }

    const place = places[0];
    if (!place.geometry || !place.geometry.location) {
      console.error("No location data for the selected place");
      return;
    }

    try {
      // Get the new position
      const newPos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      console.log("Updating marker position to:", newPos);

      // Update map center and zoom
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(newPos);
        map.setZoom(17);
      }

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition(newPos);
      } else if (map) {
        markerRef.current = new window.google.maps.Marker({
          position: newPos,
          map: map,
          draggable: true,
          title: "Drag me!",
          animation: window.google.maps.Animation.DROP,
        });
      }

      // Update state and callbacks
      setCenter(newPos);
      setParsedCoords(newPos);
      const coordString = `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`;
      onCoordinatesChange(coordString);

      // Update address if place has formatted address
      if (place.formatted_address) {
        setAddress(place.formatted_address);
        if (onAddressChange) {
          onAddressChange(place.formatted_address);
        }
      } else {
        reverseGeocode(newPos);
      }
    } catch (error) {
      console.error("Error handling place selection:", error);
    }
  };

  // Use a ref to track if we've already initialized the map
  const mapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    let mapInstance = null;
    let searchBox = null;
    let markerInstance = null;
    let dragEndListener = null;
    let searchBoxListener = null;

    const initMap = async () => {
      try {
        console.log("Loading Google Maps API...");
        await loadGoogleMapsAPI();

        if (!window.google || !window.google.maps) {
          throw new Error("Google Maps API not loaded");
        }

        console.log("Google Maps API loaded, initializing map...");

        // Parse initial coordinates if provided
        let initialCenter = { ...center };
        if (coordinates) {
          const [lat, lng] = coordinates
            .split(",")
            .map((coord) => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            initialCenter = { lat, lng };
            setCenter(initialCenter);
            setParsedCoords(initialCenter);
          }
        }

        // Create map
        console.log("Creating map with center:", initialCenter);
        mapInstance = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: zoom,
          mapTypeId: mapType,
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP,
          },
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_CENTER,
            style: "DEFAULT",
          },
          scaleControl: true,
          styles: [
            {
              featureType: "all",
              elementType: "labels.icon",
              stylers: [{ visibility: "on" }],
            },
          ],
        });

        // Set map instance
        setMap(mapInstance);

        console.log("Map created, adding marker...");

        // Create a single marker instance
        markerInstance = new window.google.maps.Marker({
          position: initialCenter,
          map: mapInstance,
          draggable: true,
          title: "Drag me!",
          animation: window.google.maps.Animation.DROP,
        });

        console.log("Marker added");

        // Add dragend event to marker
        const onDragEnd = (e) => {
          console.log("Marker dragged to:", e.latLng.lat(), e.latLng.lng());
          const newPos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          setParsedCoords(newPos);
          onCoordinatesChange(
            `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`
          );
          reverseGeocode(newPos);
        };

        dragEndListener = markerInstance.addListener("dragend", onDragEnd);

        // Initialize search box
        if (window.google.maps.places && searchBoxRef.current) {
          console.log("Initializing search box...");
          const input = searchBoxRef.current;

          // Create search box
          searchBox = new window.google.maps.places.SearchBox(input, {
            types: ["geocode", "establishment"],
            componentRestrictions: { country: "in" }, // Restrict to India for better results
          });

          // Bias the search box to within the bounds of the current map
          const boundsListener = mapInstance.addListener(
            "bounds_changed",
            () => {
              searchBox.setBounds(mapInstance.getBounds());
            }
          );

          // Listen for the event fired when the user selects a prediction
          searchBoxListener = searchBox.addListener(
            "places_changed",
            () => {
              const places = searchBox.getPlaces();
              if (places.length === 0) {
                return;
              }

              const place = places[0];
              if (!place.geometry || !place.geometry.location) {
                console.error("No location data for the selected place");
                return;
              }

              // Get the new position
              const newPos = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              console.log("Search selected location:", newPos);

              // Update map view
              if (place.geometry.viewport) {
                mapInstance.fitBounds(place.geometry.viewport);
              } else {
                mapInstance.setCenter(newPos);
                mapInstance.setZoom(17);
              }

              // Create or update marker
              if (markerRef.current) {
                markerRef.current.setPosition(newPos);
              } else {
                markerRef.current = new window.google.maps.Marker({
                  position: newPos,
                  map: mapInstance,
                  draggable: true,
                  title: "Selected Location",
                  animation: window.google.maps.Animation.DROP,
                });
              }

              // Update state
              setCenter(newPos);
              setParsedCoords(newPos);
              const coordString = `${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`;
              onCoordinatesChange(coordString);

              // Update address if available
              if (place.formatted_address) {
                setAddress(place.formatted_address);
                if (onAddressChange) {
                  onAddressChange(place.formatted_address);
                }
              } else {
                reverseGeocode(newPos);
              }
            }
          );

          console.log("Search box initialized");
        } else {
          console.error(
            "Google Maps Places API not loaded or search box ref not available"
          );
        }

        // Set marker reference
        markerRef.current = markerInstance;
        console.log("Map and marker references set");
      } catch (error) {
        console.error("Error initializing map:", error);
        // Show error to user
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="h-full w-full flex flex-col items-center justify-center bg-red-50 p-4">
              <div class="text-red-600 font-medium mb-2">Error loading map</div>
              <div class="text-sm text-gray-600 text-center">${error.message || "Failed to load Google Maps"
            }</div>
              <button 
                onclick="window.location.reload()" 
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          `;
        }
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      loadGoogleMapsAPI().then(initMap);
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up map...");

      // Remove all markers from the map
      if (window.google && window.google.maps) {
        // This will remove all markers from the map
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }

        // Also clean up any potential marker instances
        if (markerInstance) {
          if (markerInstance.setMap) {
            markerInstance.setMap(null);
          }
          markerInstance = null;
        }
      }

      // Remove listeners
      if (dragEndListener && window.google && window.google.maps) {
        window.google.maps.event.removeListener(dragEndListener);
      }

      if (searchBoxListener && window.google && window.google.maps) {
        window.google.maps.event.removeListener(searchBoxListener);
      }

      // Clean up map instance
      if (mapInstance) {
        if (window.google && window.google.maps) {
          window.google.maps.event.clearInstanceListeners(mapInstance);
        }
        mapInstance = null;
      }

      // Clean up search box
      if (searchBox) {
        // Remove all listeners
        if (searchBox._listeners && window.google && window.google.maps) {
          try {
            window.google.maps.event.removeListener(
              searchBox._listeners.bounds
            );
            window.google.maps.event.removeListener(
              searchBox._listeners.places
            );
          } catch (e) {
            console.error("Error removing search box listeners:", e);
          }
        }
        // Remove search box from DOM
        if (searchBoxRef.current) {
          searchBoxRef.current.value = "";
        }
      }

      // Clear map reference
      setMap(null);
      console.log("Map cleanup complete");
    };
  }, [coordinates, zoom, mapType]); // Only run once on mount and when these dependencies change

  // Update marker position when coordinates change
  useEffect(() => {
    // Skip if map isn't initialized yet
    if (!mapInitialized.current) return;

    if (coordinates && map && markerRef.current) {
      try {
        console.log("Updating coordinates from props:", coordinates);
        const [lat, lng] = coordinates
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          const newPos = { lat, lng };
          console.log("Setting new position from props:", newPos);

          // Only update if the position has actually changed
          const currentPos = markerRef.current.getPosition();
          if (
            !currentPos ||
            currentPos.lat() !== lat ||
            currentPos.lng() !== lng
          ) {
            markerRef.current.setPosition(newPos);
            map.panTo(newPos);
            setParsedCoords(newPos);

            // Update the address via reverse geocoding
            if (window.google && window.google.maps) {
              reverseGeocode(newPos);
            }
          }
        }
      } catch (error) {
        console.error("Error updating coordinates:", error);
      }
    }
  }, [coordinates, map]);

  // Helper function to get address component from place
  const getAddressComponent = (place, type) => {
    const component = place.address_components?.find((comp) =>
      comp.types.includes(type)
    );
    return component ? component.long_name : "";
  };

  // Reverse geocode coordinates to get address (only updates the display, not the form fields)
  const reverseGeocode = ({ lat, lng }) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded for geocoding");
      return;
    }

    console.log("Reverse geocoding for display:", { lat, lng });
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      console.log("Geocoding results:", { status, results });
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        console.log("Displaying geocoded address:", address);
        setAddress(address);

        // We're not calling onAddressChange here to prevent updating form fields
        // Only the coordinates will be updated in the parent component
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        {/* Map Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setMapType("roadmap");
              if (map) {
                map.setMapTypeId("roadmap");
              }
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapType === "roadmap"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => {
              setMapType("satellite");
              if (map) {
                map.setMapTypeId("satellite");
              }
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapType === "satellite"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Satellite
          </button>
        </div>
        <div className="relative flex-1">
          <input
            ref={searchBoxRef}
            type="text"
            placeholder="Search for a location..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            onKeyPress={(e) => {
              // Prevent form submission on enter
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        <div
          ref={mapRef}
          className="h-full w-full"
          style={{ minHeight: "300px" }}
        >
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <div className="animate-pulse">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 0V12m0-8l-4.553 2.276A1 1 0 009 7.618V16"
                  />
                </svg>
              </div>
              <p>Loading map...</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">
                Latitude
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {parsedCoords.lat ? "Live" : "—"}
              </span>
            </div>
            <div className="font-mono text-lg font-semibold text-blue-900">
              {parsedCoords.lat ? parsedCoords.lat.toFixed(6) : "—"}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-purple-700">
                Longitude
              </span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                {parsedCoords.lng ? "Live" : "—"}
              </span>
            </div>
            <div className="font-mono text-lg font-semibold text-purple-900">
              {parsedCoords.lng ? parsedCoords.lng.toFixed(6) : "—"}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Drag the marker or search for a location to update coordinates
        </div>
      </div>

      {address && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          <div className="font-medium mb-1">Address:</div>
          <div className="truncate">{address}</div>
        </div>
      )}
    </div>
  );
};

// Google Maps Component (from ManageAddress.jsx)
const GoogleMapComponent = ({ coordinates, addressInfo }) => {
  // Parse coordinates, default to Mumbai if invalid or missing
  const [lat, lng] = coordinates
    ? coordinates.split(",").map((coord) => parseFloat(coord.trim()))
    : [19.076, 72.8777];
  const [zoom, setZoom] = useState(15);
  const zoomSliderRef = useRef(null); // Use useRef for the slider
  const [mapType, setMapType] = useState("roadmap");

  // Effect to handle zoom slider changes
  useEffect(() => {
    const zoomSlider = zoomSliderRef.current;
    const handleInput = (e) => {
      setZoom(parseInt(e.target.value, 10));
    };

    if (zoomSlider) {
      zoomSlider.addEventListener("input", handleInput);
    }
    return () => {
      if (zoomSlider) {
        zoomSlider.removeEventListener("input", handleInput);
      }
    };
  }, []);

  // Build a more detailed address string for the marker
  const addressLabel = addressInfo
    ? `${addressInfo.address || ""}, ${addressInfo.city || ""}, ${addressInfo.state || ""
    } ${addressInfo.pincode || ""}`
    : "Location";

  // Use encoded address label for the marker
  const encodedLabel = encodeURIComponent(addressLabel);

  // Component for displaying the map
  return (
    <div className="mt-6 mb-6 w-full">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-600 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
          Location Map
        </h4>
        {/* Map Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMapType("roadmap")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapType === "roadmap"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mapType === "satellite"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
              }`}
          >
            Satellite
          </button>
        </div>
      </div>
      <div className="border-2 border-blue-100 rounded-xl w-full overflow-hidden relative shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Map container with improved height */}
        <div className="h-64 w-full relative">
          <iframe
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&t=${mapType === "satellite" ? "k" : "m"
              }&markers=color:red|label:${encodedLabel}|${lat},${lng}`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen="" // Use HTML attribute directly
            aria-hidden="false"
            tabIndex="0"
            title="Google Map"
            loading="lazy"
          ></iframe>
          {/* Map loading overlay - appears during iframe load */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent opacity-5 pointer-events-none"></div>
        </div>

        {/* Slider with improved styling */}
        <div className="bg-white bg-opacity-90 p-3 border-t border-blue-100">
          <div className="flex items-center">
            <span className="text-sm mr-3 font-medium text-gray-600">
              Zoom:
            </span>
            <input
              type="range"
              min="10"
              max="20"
              value={zoom} // Controlled component
              onChange={(e) => setZoom(parseInt(e.target.value, 10))} // Directly update state
              className="flex-grow h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              ref={zoomSliderRef} // Assign ref
            />
          </div>
        </div>
      </div>
      <p className="text-sm mt-2 text-gray-600 italic">{addressLabel}</p>
    </div>
  );
};


// Main PlaceManagement
const PlaceManagement = ({ customerId }) => {
  // State for API data and UI
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [showSaveDetail, setShowSaveDetail] = useState(true);

  const token = useSelector((state) => state.auth.token);

  const [findNearestDC] = useFindNearestDCMutation();

  // User session from localStorage
  const [userSession, setUserSession] = useState(() => {
    try {
      const savedData = localStorage.getItem("user");
      if (savedData && typeof savedData === 'object') {
        return savedData;
      }
      if (typeof savedData === 'string') {
        return savedData ? JSON.parse(savedData) : {};
      }
      return {};
    } catch (e) {
      console.error("Error parsing user session:", e);
      return {};
    }
  });

  // Modal and editing states (matching admin component)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDetails, setModalDetails] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDetails, setEditingDetails] = useState({});

  // Function to download addresses as CSV (enhanced to match admin version)
  const handleDownloadData = () => {
    const headers = [
      "Place_Id",
      "Type",
      "Complete Address",
      "Coordinates",
      "Nearest Railway Station",
      "Nearest Bus Stop",
      "City",
      "State",
      "Pincode",
      "Contact Person Name",
      "Contact Person Mobile",
      "Company Name",
      "GST",
      "DC Hub",
      "Created At",
      "Updated At",
      "Created By",
    ];

    // Map data to match headers, ensuring all fields are present
    const csvData = filteredAddresses.map((addr) => ({
      Place_Id: addr.place_id,
      Type: addr.place_type,
      "Complete Address": addr.full_address || `${addr.address_line1 || ''}${addr.address_line2 ? ', ' + addr.address_line2 : ''}`,
      "Contact Person Name": addr.contact_person_name,
      Coordinates: addr.coordinates || (addr.latitude && addr.longitude ? `${addr.latitude},${addr.longitude}` : ''),
      "Nearest Railway Station": addr.nearest_railway_station,
      "Nearest Bus Stop": addr.nearest_bus_stop,
      City: addr.city,
      State: addr.state,
      Pincode: addr.pincode,
      "Contact Person Mobile": addr.contact_person_mobile,
      "Company Name": addr.company_name,
      GST: addr.gst_no,
      "DC Hub": addr.connected_hub,
      "Created At": formatDate(addr.created_at),
      "Updated At": formatDate(addr.updated_at),
      "Created By": addr.created_by,
    }));

    // Convert array of objects to CSV string
    const arrayToCsv = (data) => {
      const headerRow = Object.keys(data[0]).join(",");
      const bodyRows = data.map((row) =>
        Object.values(row)
          .map((value) => {
            // Escape values that contain commas or double quotes
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          })
          .join(",")
      );
      return [headerRow, ...bodyRows].join("\n");
    };

    const csvString = arrayToCsv(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "customer_addresses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch addresses from API (updated to include timestamp fields)
  const fetchUserAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await placeMangerGetSingleSourceData(customerId, token);
      console.log('API Response:', result);
      if (result?.success && result.data) {
        const addresses = Array.isArray(result.data) ? result.data : [result.data];
        console.log('Processed Addresses:', addresses);
        setSavedAddresses(addresses);
      } else {
        console.error('API Error:', result?.message || 'No data returned');
        throw new Error(result?.message || 'Failed to fetch addresses');
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load addresses when component mounts and when showSaveDetail changes
  useEffect(() => {
    if (showSaveDetail) {
      fetchUserAddresses();
    }
  }, [showSaveDetail, customerId, token]);

  // Load saved tab state from localStorage on component mount
  useEffect(() => {
    const savedTab = localStorage.getItem("placeManagementActiveTab");
    if (savedTab) {
      setShowPickupForm(savedTab === "pickup");
      setShowShippingForm(savedTab === "shipping");
      setShowSaveDetail(savedTab === "saved");
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  const setActiveTab = (tab) => {
    localStorage.setItem("placeManagementActiveTab", tab);
    setShowPickupForm(tab === "pickup");
    setShowShippingForm(tab === "shipping");
    setShowSaveDetail(tab === "saved");

    if (tab === 'saved') {
      fetchUserAddresses();
    }
  };

  // GST Number validation function
  const validateGSTNumber = (gstNo) => {
    if (!gstNo || gstNo.trim() === '') return { isValid: true, message: '' };

    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const isValid = gstPattern.test(gstNo.trim());

    return {
      isValid,
      message: isValid ? '' : 'GST number must be in format: 22AAAAA0000A1Z5 (2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter)'
    };
  };

  // Function to find nearest DC based on coordinates
  const findNearestDCHub = async (lat, lng) => {
    try {
      const res = await findNearestDC({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        rangeType: "pick_up_range"
      }).unwrap();

      if (res.success && res.data) {
        return res.data.dc_name;
      } else {
        console.warn("Could not find nearest DC");
        return "";
      }
    } catch (err) {
      console.error("❌ DC API call failed:", err);
      return "";
    }
  };

  const handleAddAddress = async (newAddress) => {
    try {
      // Validate GST number if provided
      if (newAddress.gst_no && newAddress.gst_no.trim() !== '') {
        const gstValidation = validateGSTNumber(newAddress.gst_no);
        if (!gstValidation.isValid) {
          alert(`GST Number Error: ${gstValidation.message}`);
          return;
        }
        newAddress.gst_no = newAddress.gst_no.trim().toUpperCase();
      }

      // Map the address type to the expected format for the backend
      const mapPlaceType = (type) => {
        if (type.includes("Pickup")) return "Pickup Place";
        if (type.includes("Consignee")) return "Consignee Place";
        return type;
      };

      const mappedPlaceType = mapPlaceType(newAddress.place_type);

      const { id, ...cleanAddress } = newAddress;

      const addressWithStatus = {
        ...cleanAddress,
        place_type: mappedPlaceType,
        created_by: "Customer",
        status: "Under Review",
        place_source: customerId,
        place_source_name: userSession.firstName
          ? `${userSession.firstName} ${userSession.lastName || ""}`.trim()
          : "Customer",
        address_line1: newAddress.address_line1 || "",
        address_line2: newAddress.address_line2 || "",
        city: newAddress.city || "",
        state: newAddress.state || "",
        pincode: newAddress.pincode, // Pincode should be number type for the API
        contact_person_name: newAddress.contact_person_name || "",
        contact_person_mobile: newAddress.contact_person_mobile || "",
        company_name: newAddress.company_name || "",
        gst_no: newAddress.gst_no || "",
        nearest_railway_station: newAddress.nearest_railway_station || "",
        nearest_bus_stop: newAddress.nearest_bus_stop || "",
        landmark: newAddress.landmark || "",
        parking_place_availability: newAddress.parking_place_availability || "NO",
        latitude: parseFloat(newAddress.latitude) || 0,
        longitude: parseFloat(newAddress.longitude) || 0,
        connected_hub: newAddress.connected_hub || "",
        alternate_number: newAddress.alternate_number || "",
      };

      // Remove gst_no if empty string or only whitespace
      if (!addressWithStatus.gst_no || addressWithStatus.gst_no.trim() === "") {
        delete addressWithStatus.gst_no;
      }

      // Save to local storage (optional, as API is primary)
      // addAddress(addressWithStatus);

      // Send to backend API
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:1337";
      const { coordinates, ...payloadWithoutCoordinates } = addressWithStatus;

      const apiPayload = {
        ...payloadWithoutCoordinates,
        place_source: addressWithStatus.place_source,
        place_source_name: addressWithStatus.place_source_name,
      };

      if (!apiPayload.gst_no) {
        delete apiPayload.gst_no;
      }

      if (addressWithStatus.dcHub && !apiPayload.connected_hub) {
        apiPayload.connected_hub = addressWithStatus.dcHub;
      }
      delete apiPayload.dcHub;

      const response = await fetch(`${baseURL}/api/place-manager/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to save address to server"
        );
      }

      const result = await response.json();
      console.log("Address saved to server:", result);

      alert(`${newAddress.place_type} added successfully!`);
      setShowPickupForm(false);
      setShowShippingForm(false);
      setShowSaveDetail(true);
      fetchUserAddresses(); // Re-fetch to update the list
    } catch (error) {
      console.error("Error adding address:", error);
      alert(
        `Failed to add address: ${error.message}. Please try again.`
      );
    }
  };

  const handlePickupSubmit = (formData) => {
    const addressData = {
      ...formData,
      place_type: "Pickup Place",
      status: "Under Review",
      place_source: customerId,
      place_source_name: userSession.firstName
        ? `${userSession.firstName} ${userSession.lastName || ""}`.trim()
        : "Customer",
      created_by: "Customer",
      nearest_railway_station: formData.nearest_railway_station,
      nearest_bus_stop: formData.nearest_bus_stop,
      landmark: formData.landmark,
      parking_place_availability: formData.parking_availability || "NO",
      contact_person_name: formData.contact_person_name,
      contact_person_mobile: formData.contact_person_mobile,
      company_name: formData.company_name,
      gst_no: formData.gst_no || "",
      city: formData.city,
      state: formData.state,
      pincode: parseInt(formData.pincode), // Ensure pincode is number
      latitude: parseFloat(formData.latitude), // Ensure latitude is number
      longitude: parseFloat(formData.longitude), // Ensure longitude is number
      connected_hub: formData.connected_hub,
    };
    delete addressData.type; // This 'type' field is not part of the backend schema
    handleAddAddress(addressData);
  };

  const handleShippingSubmit = (formData) => {
    const addressData = {
      ...formData,
      place_type: "Consignee Place",
      status: "Under Review",
      place_source: customerId,
      place_source_name: userSession.firstName
        ? `${userSession.firstName} ${userSession.lastName || ""}`.trim()
        : "Customer",
      created_by: "Customer",
      nearest_railway_station: formData.nearest_railway_station,
      nearest_bus_stop: formData.nearest_bus_stop,
      landmark: formData.landmark,
      parking_place_availability: formData.parking_availability || "NO",
      contact_person_name: formData.contact_person_name,
      contact_person_mobile: formData.contact_person_mobile,
      company_name: formData.company_name,
      gst_no: formData.gst_no || "",
      city: formData.city,
      state: formData.state,
      pincode: parseInt(formData.pincode), // Ensure pincode is number
      latitude: parseFloat(formData.latitude), // Ensure latitude is number
      longitude: parseFloat(formData.longitude), // Ensure longitude is number
      connected_hub: formData.connected_hub,
    };
    delete addressData.type; // This 'type' field is not part of the backend schema
    handleAddAddress(addressData);
  };

  const handleDeleteAddress = async (placeId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:1337";

        const response = await fetch(
          `${baseURL}/api/place-manager/place/${placeId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to delete address");
        }

        await fetchUserAddresses();
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error("Error deleting address:", error);
        alert(
          `Error deleting address: ${error.message || "Failed to delete address. Please try again."}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowDetails = (addr) => {
    if (addr) {
      setModalDetails(addr);
      setEditingDetails({
        ...addr,
        coordinates:
          addr.coordinates ||
          (addr.latitude && addr.longitude
            ? `${addr.latitude},${addr.longitude}`
            : ""),
        place_type: addr.place_type,
        contact_person_name: addr.contact_person_name,
        contact_person_mobile: addr.contact_person_mobile,
        company_name: addr.company_name,
        gst_no: addr.gst_no,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        nearest_railway_station: addr.nearest_railway_station,
        nearest_bus_stop: addr.nearest_bus_stop,
        landmark: addr.landmark,
        parking_place_availability: addr.parking_place_availability || "NO",
        alternate_number: addr.alternate_number,
        latitude: addr.latitude,
        longitude: addr.longitude,
        connected_hub: addr.connected_hub,
        created_at: addr.created_at, // Include created_at
        updated_at: addr.updated_at, // Include updated_at
        created_by: addr.created_by, // Include created_by
        place_source: addr.place_source, // Include place_source
        place_source_name: addr.place_source_name, // Include place_source_name
      });
      setModalVisible(true);
      setIsEditing(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleEditAddress = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Validate required fields
      const requiredFields = [
        "contact_person_name",
        "contact_person_mobile",
        "address_line1",
        "city",
        "state",
        "pincode",
        "nearest_railway_station",
        "nearest_bus_stop",
        "landmark",
      ];

      for (const field of requiredFields) {
        const value = editingDetails[field];
        if (!value || (typeof value === "string" && !value.trim())) {
          alert(
            `Please fill in the required field: ${field
              .replace(/_/g, " ")
              .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())}`
          );
          return;
        }
      }

      // Validate pincode format
      const pincode = String(editingDetails.pincode || "");
      if (!/^\d{6}$/.test(pincode)) {
        alert("Please enter a valid 6-digit pincode");
        return;
      }

      // Validate GST number if provided
      if (editingDetails.gst_no && editingDetails.gst_no.trim() !== "") {
        const gstPattern =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        const isValid = gstPattern.test(editingDetails.gst_no.trim());
        if (!isValid) {
          alert(
            "GST number must be in format: 22AAAAA0000A1Z5 (2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + Z + 1 digit/letter)"
          );
          return;
        }
        editingDetails.gst_no = editingDetails.gst_no.trim().toUpperCase();
      }

      // Find nearest DC hub based on current coordinates
      let assignedDC = "";
      const lat = parseFloat(editingDetails.latitude);
      const lng = parseFloat(editingDetails.longitude);

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        alert("Latitude and Longitude must be valid numbers.");
        return;
      }

      assignedDC = await findNearestDCHub(lat, lng);

      if (!assignedDC || assignedDC.trim() === "") {
        alert("We do not provide service at this location. Please choose a different address.");
        return;
      }

      setLoading(true);

      // Prepare the updated address data
      const updatedAddress = {
        // place_id is passed as first argument to updatePlace
        place_source: String(customerId || ""), // Use customerId here
        place_source_name: userSession?.firstName
          ? `${userSession.firstName} ${userSession.lastName || ""}`.trim()
          : "Customer",
        created_by: "Customer", // This should remain "Customer" for customer side
        status: "Under Review", // Customer can only set status to Under Review upon edit
        address_line1: String(editingDetails.address_line1 || ""),
        address_line2: String(editingDetails.address_line2 || ""),
        city: String(editingDetails.city || ""),
        state: String(editingDetails.state || ""),
        pincode: parseInt(editingDetails.pincode) || 0,
        nearest_railway_station: String(
          editingDetails.nearest_railway_station || ""
        ),
        nearest_bus_stop: String(editingDetails.nearest_bus_stop || ""),
        landmark: String(editingDetails.landmark || ""),
        parking_place_availability: String(
          editingDetails.parking_place_availability || "NO"
        ),
        contact_person_name: String(editingDetails.contact_person_name || ""),
        contact_person_mobile: String(
          editingDetails.contact_person_mobile || ""
        ),
        company_name: String(editingDetails.company_name || ""),
        gst_no: String(editingDetails.gst_no || ""),
        alternate_number: String(
          editingDetails.alternate_number || "0000000000"
        ),
        connected_hub: assignedDC,
        // created_at and updated_at are handled by backend, so don't send them in payload
      };

      // If coordinates are provided, split them into latitude and longitude
      if (editingDetails.coordinates) {
        const [latitude, longitude] = editingDetails.coordinates
          .split(",")
          .map((coord) => coord.trim());
        updatedAddress.latitude = parseFloat(latitude) || 0;
        updatedAddress.longitude = parseFloat(longitude) || 0;
      } else if (editingDetails.latitude && editingDetails.longitude) {
        updatedAddress.latitude = parseFloat(editingDetails.latitude) || 0;
        updatedAddress.longitude = parseFloat(editingDetails.longitude) || 0;
      }

      console.log("Sending update request with data:", updatedAddress);
      const responseData = await updatePlace(
        editingDetails.place_id,
        updatedAddress,
        token
      );

      await fetchUserAddresses(); // Re-fetch all addresses to get updated data

      setModalDetails({ ...modalDetails, ...updatedAddress, connected_hub: assignedDC });
      setIsEditing(false);

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error updating address:", error);
      alert(`Error updating address: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingDetails({
      ...modalDetails,
      coordinates:
        modalDetails.coordinates ||
        (modalDetails.latitude && modalDetails.longitude
          ? `${modalDetails.latitude},${modalDetails.longitude}`
          : ""),
      place_type: modalDetails.place_type,
      contact_person_name: modalDetails.contact_person_name,
      contact_person_mobile: modalDetails.contact_person_mobile,
      company_name: modalDetails.company_name,
      gst_no: modalDetails.gst_no,
      address_line1: modalDetails.address_line1,
      address_line2: modalDetails.address_line2,
      city: modalDetails.city,
      state: modalDetails.state,
      pincode: modalDetails.pincode,
      nearest_railway_station: modalDetails.nearest_railway_station,
      nearest_bus_stop: modalDetails.nearest_bus_stop,
      landmark: modalDetails.landmark,
      parking_place_availability:
        modalDetails.parking_place_availability || "NO",
      alternate_number: modalDetails.alternate_number,
      latitude: modalDetails.latitude,
      longitude: modalDetails.longitude,
      connected_hub: modalDetails.connected_hub,
      created_at: modalDetails.created_at,
      updated_at: modalDetails.updated_at,
      created_by: modalDetails.created_by,
      place_source: modalDetails.place_source,
      place_source_name: modalDetails.place_source_name,
    });
    setModalVisible(true);
    setIsEditing(false);
  };

  const handleFieldChange = async (field, value) => {
    setEditingDetails((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "latitude" && {
        coordinates:
          value && prev.longitude
            ? `${value},${prev.longitude}`
            : prev.coordinates,
      }),
      ...(field === "longitude" && {
        coordinates:
          prev.latitude && value
            ? `${prev.latitude},${value}`
            : prev.coordinates,
      }),
    }));

    // If latitude or longitude changed, recalculate connected_hub
    if (field === "latitude" || field === "longitude" || field === "coordinates") {
      let lat, lng;

      if (field === "coordinates") {
        [lat, lng] = value.split(",").map(coord => parseFloat(coord.trim()));
      } else {
        lat = field === "latitude" ? parseFloat(value) : parseFloat(editingDetails.latitude);
        lng = field === "longitude" ? parseFloat(value) : parseFloat(editingDetails.longitude);
      }

      if (!isNaN(lat) && !isNaN(lng)) {
        const nearestDC = await findNearestDCHub(lat, lng);
        setEditingDetails((prev) => ({
          ...prev,
          connected_hub: nearestDC,
        }));
      }
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  const filteredAddresses = savedAddresses
    .filter((addr) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          (addr.address_line1 && addr.address_line1.toLowerCase().includes(searchLower)) ||
          (addr.city && addr.city.toLowerCase().includes(searchLower)) ||
          (addr.contact_person_name && addr.contact_person_name.toLowerCase().includes(searchLower)) ||
          (addr.company_name && addr.company_name.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter((addr) => {
      if (filterType === "all") return true;
      const filterLower = filterType.toLowerCase();
      return (
        (addr.place_type &&
          addr.place_type.toLowerCase().includes(filterLower)) ||
        (filterLower === "pickup" && addr.place_type === "Pickup Place") ||
        (filterLower === "consignee" && addr.place_type === "Consignee Place")
      );
    })
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-2">
      {/* Header Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-blue-700 mb-6 text-center"
      >
        Flotza
      </motion.h1>

      {/* Button Container */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
        <button
          onClick={() => {
            setActiveTab("saved");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Registered Addresses
        </button>

        <button
          onClick={() => {
            setActiveTab("pickup");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Add Pickup Address
        </button>
        <button
          onClick={() => {
            setActiveTab("shipping");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:scale-105"
        >
          Add Consignee Address
        </button>
      </div>

      {/* Conditional Forms */}
      <div className="w-full mx-auto">
        {showPickupForm && (
          <AddressSection
            title="Pickup Address"
            prefix="pickup"
            delay={0.1}
            onSubmit={handlePickupSubmit}
            customerId={customerId}
            userSession={userSession}
          />
        )}

        {showShippingForm && (
          <AddressSection
            title="Consignee Address"
            prefix="shipping"
            delay={0.1}
            onSubmit={handleShippingSubmit}
            customerId={customerId}
            userSession={userSession}
          />
        )}
        {showSaveDetail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Saved Addresses</h2>
              <button
                onClick={handleDownloadData}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Download Data
              </button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by address, city, name, etc..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <div className="flex gap-4 mb-4 flex-wrap text-gray-700 font-medium">
              <label className="flex items-center gap-1 whitespace-nowrap">
                <input
                  type="radio"
                  name="filterType"
                  value="all"
                  checked={filterType === "all"}
                  onChange={() => setFilterType("all")}
                  className="cursor-pointer text-blue-600 focus:ring-blue-500"
                />{" "}
                All
              </label>
              <label className="flex items-center gap-1 whitespace-nowrap">
                <input
                  type="radio"
                  name="filterType"
                  value="Pickup Place" // Use full type string for consistency
                  checked={filterType === "Pickup Place"}
                  onChange={() => setFilterType("Pickup Place")}
                  className="cursor-pointer text-blue-600 focus:ring-blue-500"
                />{" "}
                Pickup Address
              </label>
              <label className="flex items-center gap-1 whitespace-nowrap">
                <input
                  type="radio"
                  name="filterType"
                  value="Consignee Place" // Use full type string for consistency
                  checked={filterType === "Consignee Place"}
                  onChange={() => setFilterType("Consignee Place")}
                  className="cursor-pointer text-blue-600 focus:ring-blue-500"
                />{" "}
                Consignee Address
              </label>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full border-collapse min-w-[1200px]">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left border-r border-blue-500">Place_Id</th>
                    <th className="p-3 text-left border-r border-blue-500">Type</th>
                    <th className="p-3 text-left border-r border-blue-500">Complete Address</th>
                    <th className="p-3 text-left border-r border-blue-500">City</th>
                    <th className="p-3 text-left border-r border-blue-500">Pincode</th>
                    <th className="p-3 text-left border-r border-blue-500">Contact Person Name</th>
                    <th className="p-3 text-left border-r border-blue-500">Company Name</th>
                    <th className="p-3 text-left border-r border-blue-500">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAddresses.length > 0 ? (
                    filteredAddresses.map((addr) => (
                      <tr key={addr.place_id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="p-3 border-r border-gray-200">{addr.place_id}</td>
                        <td className="p-3 border-r border-gray-200">{addr.place_type}</td>
                        <td className="p-3 border-r border-gray-200">
                          <TruncatedText text={addr.full_address || `${addr.address_line1 || ''}${addr.address_line2 ? ', ' + addr.address_line2 : ''}`} maxLength={15} />
                        </td>
                        <td className="p-3 border-r border-gray-200">{addr.city}</td>
                        <td className="p-3 border-r border-gray-200">{addr.pincode}</td>
                        <td className="p-3 border-r border-gray-200">{addr.contact_person_name}</td>
                        <td className="p-3 border-r border-gray-200">{addr.company_name || "-"}</td>
                        <td className="p-3 border-r border-gray-200 relative">
                          <span
                            className={`px-3 py-1 rounded-md text-sm font-medium
                                ${!addr.status || addr.status === 'New Registration' || addr.status === 'Under Review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : addr.status === 'Approved'
                                  ? 'bg-green-100 text-green-800'
                                  : addr.status === 'Suspended'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            {!addr.status || addr.status === 'New Registration' ? 'Under Review' : addr.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <button
                            onClick={() => handleShowDetails(addr)}
                            className="bg-green-500 text-white py-2 px-3 rounded-md hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(addr.place_id)}
                            className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 transition-colors text-sm font-medium shadow-sm ml-2"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="p-4 text-center text-gray-500"> {/* Updated colSpan */}
                        No addresses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Modal for Viewing Address Details (Copied from ManageAddress.jsx) */}
        {modalVisible && (
          <>
            {/* Semi-transparent overlay */}
            <div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onClick={handleCloseModal}
            />
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex justify-center items-center overflow-hidden p-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-auto max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="p-5 border-b sticky top-0 bg-white z-10 rounded-t-xl flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    {modalDetails.place_type || "Address Details"}
                  </h3>
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={handleEditAddress}
                        className="bg-amber-400 hover:bg-amber-500 text-white py-1.5 px-4 rounded-lg inline-flex items-center text-sm font-medium transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto p-6 flex-grow bg-white">
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-blue-800">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Place ID</label>
                        <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.place_id || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Address Type</label>
                        <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.place_type || "-"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Connected Hub</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.connected_hub || ""}
                            onChange={(e) => handleFieldChange("connected_hub", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50"
                            readOnly
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.connected_hub || "-"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-white rounded-xl shadow-sm p-6 mb-6 border border-green-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-green-800">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Contact Person Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.contact_person_name || ""}
                            onChange={(e) => handleFieldChange("contact_person_name", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.contact_person_name || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.contact_person_mobile || ""}
                            onChange={(e) => handleFieldChange("contact_person_mobile", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.contact_person_mobile || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Alternate Number</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.alternate_number || ""}
                            onChange={(e) => handleFieldChange("alternate_number", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Optional: 10-digit alternate number"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.alternate_number || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.company_name || ""}
                            onChange={(e) => handleFieldChange("company_name", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.company_name || "-"}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">GST Number (Optional)</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.gst_no || ""}
                            onChange={(e) => handleFieldChange("gst_no", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            placeholder="Format: 22AAAAA0000A1Z5"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.gst_no || "-"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-sm p-6 mb-6 border border-purple-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-purple-800">Address Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Address Line 1</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.address_line1 || editingDetails.address || ""}
                            onChange={(e) => handleFieldChange("address_line1", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.address_line1 || modalDetails.address || "-"}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Address Line 2</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.address_line2 || ""}
                            onChange={(e) => handleFieldChange("address_line2", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.address_line2 || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.city || ""}
                            onChange={(e) => handleFieldChange("city", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.city || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.state || ""}
                            onChange={(e) => handleFieldChange("state", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.state || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Pincode</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.pincode || ""}
                            onChange={(e) => handleFieldChange("pincode", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.pincode || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Parking Available</label>
                        {isEditing ? (
                          <select
                            value={editingDetails.parking_place_availability || "NO"}
                            onChange={(e) => handleFieldChange("parking_place_availability", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          >
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                          </select>
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">
                            {modalDetails.parking_place_availability === "YES" ? "Yes" : "No"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Details Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-white rounded-xl shadow-sm p-6 mb-6 border border-orange-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <h3 className="text-lg font-semibold text-orange-800">Location & Landmarks</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nearest Railway Station</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.nearest_railway_station || ""}
                            onChange={(e) => handleFieldChange("nearest_railway_station", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.nearest_railway_station || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nearest Bus Stop</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.nearest_bus_stop || ""}
                            onChange={(e) => handleFieldChange("nearest_bus_stop", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.nearest_bus_stop || "-"}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Landmark</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.landmark || ""}
                            onChange={(e) => handleFieldChange("landmark", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.landmark || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.latitude || ""}
                            onChange={(e) => handleFieldChange("latitude", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50"
                            readOnly
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.latitude || "-"}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingDetails.longitude || ""}
                            onChange={(e) => handleFieldChange("longitude", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50"
                            readOnly
                          />
                        ) : (
                          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{modalDetails.longitude || "-"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Timestamps Section */}
                  <div className="bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-sm p-6 mb-6 border border-indigo-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-indigo-800">Status & Timeline</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${modalDetails.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : modalDetails.status === "Suspended"
                                ? "bg-red-100 text-red-800"
                                : modalDetails.status === "Under Review" || modalDetails.status === "New Registration"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {modalDetails.status || "Under Review"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Status Remark</label>
                        <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">
                          {modalDetails.status === "Under Review" && (modalDetails.status_remarks || modalDetails.remark)
                            ? (modalDetails.status_remarks || modalDetails.remark)
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
                        <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{formatDate(modalDetails.created_at)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                        <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded">{formatDate(modalDetails.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Map Section - Always at the bottom */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {isEditing ? "Search and Set Location" : "Location on Map"}
                      </h3>
                    </div>
                    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
                      {isEditing ? (
                        <EditableMap
                          coordinates={
                            editingDetails.coordinates ||
                            (editingDetails.latitude && editingDetails.longitude
                              ? `${editingDetails.latitude},${editingDetails.longitude}`
                              : "")
                          }
                          onCoordinatesChange={(coords) => {
                            const [lat, lng] = coords.split(",").map(Number);
                            handleFieldChange("latitude", lat);
                            handleFieldChange("longitude", lng);
                            handleFieldChange("coordinates", coords);
                          }}
                          onAddressChange={(address) => {
                            // Don't update any address fields when location changes
                            // Only coordinates will be updated through onCoordinatesChange
                          }}
                        />
                      ) : modalDetails.latitude && modalDetails.longitude ? (
                        <GoogleMapComponent
                          coordinates={`${modalDetails.latitude},${modalDetails.longitude}`}
                          addressInfo={{
                            address: modalDetails.address_line1 || modalDetails.address,
                            city: modalDetails.city,
                            state: modalDetails.state,
                            pincode: modalDetails.pincode,
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p>No location data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="mt-2 text-xs text-gray-500">
                        Search for a location or drag the marker to set precise coordinates
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal footer */}
                <div className="p-4 border-t bg-white z-10 rounded-b-xl flex justify-end gap-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCloseModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-fade-in">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            Address updated successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceManagement;