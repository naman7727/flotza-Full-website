import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const mapStyles = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#444444"}]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [{"color": "#f2f2f2"}]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [{"saturation": -100}, {"lightness": 45}]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [{"visibility": "simplified"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
  }
];

const OrderMap = ({ 
  consigneePoints = [], 
  driverCounts = {}, 
  selectedHub, 
  selectedStatus, 
  orders = [], 
  hubCoordinates = {},
  onMarkerClick 
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCDhyFI5zyW3KR-ESWfvUS__44LMUPU25c", // Replace in production
    libraries: ['places'],
  });

  const center = useMemo(() => ({ lat: 19.0760, lng: 72.8777 }), []); // Mumbai center
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [map, setMap] = useState(null);

  // Debug logging
  console.log('OrderMap received orders:', orders);
  console.log('OrderMap selectedHub:', selectedHub);
  console.log('OrderMap selectedStatus:', selectedStatus);

  // FIXED: Simplified filtering logic - let parent handle most filtering
  const validOrders = useMemo(() => {
    // Only filter out orders without valid coordinates, don't apply hub/status filters here
    // since they're already filtered in the parent component
    const valid = orders.filter(order => {
      // Check if order has at least one valid coordinate pair
      const hasValidPickup = order.pickupLatitude && order.pickupLongitude && 
                            !isNaN(parseFloat(order.pickupLatitude)) && 
                            !isNaN(parseFloat(order.pickupLongitude)) &&
                            parseFloat(order.pickupLatitude) !== 0 &&
                            parseFloat(order.pickupLongitude) !== 0;
                            
      const hasValidDrop = order.consigneeLatitude && order.consigneeLongitude && 
                          !isNaN(parseFloat(order.consigneeLatitude)) && 
                          !isNaN(parseFloat(order.consigneeLongitude)) &&
                          parseFloat(order.consigneeLatitude) !== 0 &&
                          parseFloat(order.consigneeLongitude) !== 0;
      
      return hasValidPickup || hasValidDrop;
    });
    
    console.log('Valid orders for map (after coordinate check):', valid);
    console.log('Valid orders count:', valid.length);
    return valid;
  }, [orders]);

  // Helper function to add small offsets to overlapping markers
  const addMarkersWithOffset = (markers, baseOffset = 0.0001) => {
    const positionCounts = {};
    
    return markers.map((marker, index) => {
      const key = `${marker.lat.toFixed(6)},${marker.lng.toFixed(6)}`;
      
      if (!positionCounts[key]) {
        positionCounts[key] = 0;
      } else {
        positionCounts[key]++;
      }
      
      // Add small offset for overlapping markers
      const offsetMultiplier = positionCounts[key];
      const offsetLat = baseOffset * offsetMultiplier * Math.cos(index * Math.PI / 3);
      const offsetLng = baseOffset * offsetMultiplier * Math.sin(index * Math.PI / 3);
      
      return {
        ...marker,
        lat: marker.lat + offsetLat,
        lng: marker.lng + offsetLng,
        isOffset: offsetMultiplier > 0,
        offsetCount: offsetMultiplier
      };
    });
  };

  // Separate pickup and drop markers with better validation and offset handling
  const pickupMarkers = useMemo(() => {
    const pickups = validOrders.filter(order => {
      const lat = parseFloat(order.pickupLatitude);
      const lng = parseFloat(order.pickupLongitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    }).map(order => ({
      ...order,
      lat: parseFloat(order.pickupLatitude),
      lng: parseFloat(order.pickupLongitude)
    }));
    
    // Add offsets for overlapping markers
    const pickupsWithOffset = addMarkersWithOffset(pickups, 0.0003);
    
    console.log('Pickup markers with offsets:', pickupsWithOffset);
    console.log('Pickup markers count:', pickupsWithOffset.length);
    return pickupsWithOffset;
  }, [validOrders]);

  const dropMarkers = useMemo(() => {
    const drops = validOrders.filter(order => {
      const lat = parseFloat(order.consigneeLatitude);
      const lng = parseFloat(order.consigneeLongitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    }).map(order => ({
      ...order,
      lat: parseFloat(order.consigneeLatitude),
      lng: parseFloat(order.consigneeLongitude)
    }));
    
    // Add offsets for overlapping markers  
    const dropsWithOffset = addMarkersWithOffset(drops, 0.0003);
    
    console.log('Drop markers with offsets:', dropsWithOffset);
    console.log('Drop markers count:', dropsWithOffset.length);
    return dropsWithOffset;
  }, [validOrders]);

  // Memoize hub stats
  const hubStats = useMemo(() => {
    const stats = {};
    
    validOrders.forEach(order => {
      const hub = order.currentHub;
      if (hub) {
        if (!stats[hub]) {
          stats[hub] = { 
            pickups: 0, 
            drops: 0,
            pending: 0,
            'picked up': 0,
            'in transit': 0,
            'delivered': 0,
            total: 0
          };
        }
        
        stats[hub].total++;
        
        // Count pickups and drops
        if (order.pickupLatitude && order.pickupLongitude && 
            parseFloat(order.pickupLatitude) !== 0 && parseFloat(order.pickupLongitude) !== 0) {
          stats[hub].pickups++;
        }
        if (order.consigneeLatitude && order.consigneeLongitude && 
            parseFloat(order.consigneeLatitude) !== 0 && parseFloat(order.consigneeLongitude) !== 0) {
          stats[hub].drops++;
        }
        
        // Count by status
        const status = order.orderStatus?.toLowerCase();
        if (status && stats[hub][status] !== undefined) {
          stats[hub][status]++;
        }
      }
    });

    console.log('Hub stats:', stats);
    return stats;
  }, [validOrders]);

  // Memoize hubs to show
  const hubsToShow = useMemo(() => {
    if (!isLoaded || !hubCoordinates) return {};
    return selectedHub && hubCoordinates[selectedHub] 
      ? { [selectedHub]: hubCoordinates[selectedHub] } 
      : { ...hubCoordinates };
  }, [selectedHub, hubCoordinates, isLoaded]);

  // Handle map load
  const onLoad = useCallback((map) => {
    console.log('Map loaded');
    setMap(map);
    setIsMapReady(true);
  }, []);

  // Handle map unload
  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
    setIsMapReady(false);
  }, []);

  // Simplified click handlers for InfoWindows
  const handleMarkerClick = useCallback((type, orderId, data, position) => {
    console.log('Marker clicked:', type, orderId);
    setActiveInfoWindow({
      type,
      id: orderId,
      data,
      position
    });
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setActiveInfoWindow(null);
  }, []);

  // Early return after all hooks have been called
  if (loadError) {
    console.error('Maps loading error:', loadError);
    return <div>Error loading maps. Please refresh the page.</div>;
  }
  
  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleInfoWindowClose} // Close info window when clicking on map
      options={{
        styles: mapStyles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      {/* Pickup Markers - Orange */}
      {pickupMarkers.map((order, idx) => {
        const position = { lat: order.lat, lng: order.lng };
        const key = `pickup-${order.orderId}-${idx}`;
        
        console.log(`Rendering pickup marker ${key} at`, position, order.isOffset ? `(offset ${order.offsetCount})` : '');
        
        return (
          <Marker
            key={key}
            position={position}
            title={`Pickup: ${order.orderId}${order.isOffset ? ` (nearby location ${order.offsetCount + 1})` : ''}`}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
              scaledSize: new window.google.maps.Size(order.isOffset ? 28 : 32, order.isOffset ? 28 : 32)
            }}
            label={order.isOffset ? {
              text: (order.offsetCount + 1).toString(),
              color: "#000000",
              fontWeight: "bold",
              fontSize: "10px"
            } : undefined}
            onClick={() => handleMarkerClick('pickup', order.orderId, order, position)}
          />
        );
      })}

      {/* Drop Markers - Green */}
      {dropMarkers.map((order, idx) => {
        const position = { lat: order.lat, lng: order.lng };
        const key = `drop-${order.orderId}-${idx}`;
        
        console.log(`Rendering drop marker ${key} at`, position, order.isOffset ? `(offset ${order.offsetCount})` : '');
        
        return (
          <Marker
            key={key}
            position={position}
            title={`Drop: ${order.orderId}${order.isOffset ? ` (nearby location ${order.offsetCount + 1})` : ''}`}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(order.isOffset ? 28 : 32, order.isOffset ? 28 : 32)
            }}
            label={order.isOffset ? {
              text: (order.offsetCount + 1).toString(),
              color: "#000000", 
              fontWeight: "bold",
              fontSize: "10px"
            } : undefined}
            onClick={() => handleMarkerClick('drop', order.orderId, order, position)}
          />
        );
      })}

      {/* Hub Markers - Blue */}
      {isMapReady && Object.entries(hubsToShow).map(([hub, coords]) => {
        if (!coords || typeof coords !== 'object' || !coords.lat || !coords.lng) {
          console.warn(`Invalid coordinates for hub: ${hub}`, coords);
          return null;
        }
        
        const position = { lat: coords.lat, lng: coords.lng };
        const key = `hub-${hub}`;
        
        console.log(`Rendering hub marker ${key} at`, position);
        
        return (
          <Marker
            key={key}
            position={position}
            title={`Hub: ${hub}`}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            label={{
              text: hub.substring(0, 3).toUpperCase(),
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "10px",
            }}
            onClick={() => handleMarkerClick('hub', hub, { hub, coords, stats: hubStats[hub] }, position)}
          />
        );
      })}

      {/* Single InfoWindow */}
      {activeInfoWindow && (
        <InfoWindow
          position={activeInfoWindow.position}
          onCloseClick={handleInfoWindowClose}
          options={{
            disableAutoPan: false,
            maxWidth: 300,
            pixelOffset: new window.google.maps.Size(0, -10)
          }}
        >
          <div className="p-2 max-w-xs max-h-64 overflow-y-auto">
            {activeInfoWindow.type === 'pickup' && (
              <div>
                <h4 className="font-bold text-orange-600 mb-2 text-sm">Pickup Details</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold">Order ID:</span> {activeInfoWindow.data.orderId}</p>
                  <p><span className="font-semibold">Customer:</span> {activeInfoWindow.data.customerName}</p>
                  <p><span className="font-semibold">Mobile:</span> {activeInfoWindow.data.customerMobile}</p>
                  <p><span className="font-semibold">Address:</span> {activeInfoWindow.data.senderAddress}</p>
                  <p><span className="font-semibold">Status:</span> 
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'picked up' ? 'bg-purple-100 text-purple-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'in transit' ? 'bg-blue-100 text-blue-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeInfoWindow.data.orderStatus}
                    </span>
                  </p>
                  {activeInfoWindow.data.pickupTime && (
                    <p><span className="font-semibold">Pickup Time:</span> {activeInfoWindow.data.pickupTime}</p>
                  )}
                  {activeInfoWindow.data.commodity && (
                    <p><span className="font-semibold">Items:</span> {activeInfoWindow.data.commodity}</p>
                  )}
                </div>
              </div>
            )}

            {activeInfoWindow.type === 'drop' && (
              <div>
                <h4 className="font-bold text-green-600 mb-2 text-sm">Drop Details</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold">Order ID:</span> {activeInfoWindow.data.orderId}</p>
                  <p><span className="font-semibold">Consignee:</span> {activeInfoWindow.data.receiverName}</p>
                  <p><span className="font-semibold">Address:</span> {activeInfoWindow.data.receiverAddress}</p>
                  <p><span className="font-semibold">Status:</span> 
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'picked up' ? 'bg-purple-100 text-purple-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'in transit' ? 'bg-blue-100 text-blue-800' :
                      activeInfoWindow.data.orderStatus?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeInfoWindow.data.orderStatus}
                    </span>
                  </p>
                  {activeInfoWindow.data.codAmount && parseFloat(activeInfoWindow.data.codAmount) > 0 && (
                    <p><span className="font-semibold">COD:</span> ₹{activeInfoWindow.data.codAmount}</p>
                  )}
                  {activeInfoWindow.data.totalAmount && (
                    <p><span className="font-semibold">Total:</span> ₹{activeInfoWindow.data.totalAmount}</p>
                  )}
                </div>
              </div>
            )}

            {activeInfoWindow.type === 'hub' && (
              <div>
                <h4 className="font-bold text-blue-600 mb-2 text-sm">{activeInfoWindow.data.hub}</h4>
                <div className="space-y-2 text-xs">
                  {activeInfoWindow.data.coords.address && (
                    <p><span className="font-semibold">Address:</span> {activeInfoWindow.data.coords.address}</p>
                  )}
                  {activeInfoWindow.data.coords.mobile && (
                    <p><span className="font-semibold">Contact:</span> {activeInfoWindow.data.coords.mobile}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-orange-50 p-1 rounded text-center">
                      <p className="text-xs text-gray-600">Pickups</p>
                      <p className="font-bold text-orange-600">{activeInfoWindow.data.stats?.pickups || 0}</p>
                    </div>
                    <div className="bg-green-50 p-1 rounded text-center">
                      <p className="text-xs text-gray-600">Drops</p>
                      <p className="font-bold text-green-600">{activeInfoWindow.data.stats?.drops || 0}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Status Summary:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-semibold text-yellow-600">{activeInfoWindow.data.stats?.pending || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Transit:</span>
                        <span className="font-semibold text-blue-600">{activeInfoWindow.data.stats?.['in transit'] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivered:</span>
                        <span className="font-semibold text-green-600">{activeInfoWindow.data.stats?.delivered || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><span className="font-semibold">Total Orders:</span> {activeInfoWindow.data.stats?.total || 0}</p>
                    {driverCounts[activeInfoWindow.data.hub] && (
                      <p><span className="font-semibold">Drivers:</span> {driverCounts[activeInfoWindow.data.hub]}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
      
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow">Initializing map...</div>
        </div>
      )}
    </GoogleMap>
  );
};

export default OrderMap;