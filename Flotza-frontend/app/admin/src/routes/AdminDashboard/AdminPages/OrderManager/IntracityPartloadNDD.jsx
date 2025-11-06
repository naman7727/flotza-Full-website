// RouteOptimizerSPA.jsx
// Single-file React SPA (default export) implementing a route optimizer (TSP heuristics)
// UI: Tailwind CSS. Map: react-leaflet (OpenStreetMap tiles).
// Features:
// - Add locations (name + lat/lng).
// - Demo sample points.
// - Compute route via Nearest Neighbor + 2-opt improvement.
// - Show route on interactive map with markers & polyline.
// - Import/Export JSON (simple CSV import helper included).
// Notes: For address -> lat/lng geocoding, add your preferred geocoding provider (Mapbox/Google/Nominatim).

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Helper: Haversine distance in meters
function haversine([lat1, lon1], [lat2, lon2]){
  const toRad = v => v * Math.PI / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Nearest Neighbor heuristic
function nearestNeighbor(points, startIndex = 0){
  if(points.length === 0) return [];
  const unvisited = new Set(points.map((_, i) => i));
  const route = [];
  let current = startIndex;
  route.push(current);
  unvisited.delete(current);
  while(unvisited.size){
    let nearest = null;
    let nearestDist = Infinity;
    for(const idx of unvisited){
      const d = haversine([points[current].lat, points[current].lng],[points[idx].lat, points[idx].lng]);
      if(d < nearestDist){ nearestDist = d; nearest = idx; }
    }
    route.push(nearest);
    unvisited.delete(nearest);
    current = nearest;
  }
  return route;
}

// 2-opt improvement
function twoOpt(route, points){
  let improved = true;
  const n = route.length;
  const copy = route.slice();
  const distance = (i,j) => haversine([points[i].lat, points[i].lng],[points[j].lat, points[j].lng]);
  while(improved){
    improved = false;
    for(let i=1;i<n-2;i++){
      for(let k=i+1;k<n-1;k++){
        const a = copy[i-1], b = copy[i], c = copy[k], d = copy[k+1];
        const delta = (distance(a,c) + distance(b,d)) - (distance(a,b) + distance(c,d));
        if(delta < -1e-6){ // improvement
          // reverse segment i..k
          const newSeg = copy.slice(i, k+1).reverse();
          copy.splice(i, k-i+1, ...newSeg);
          improved = true;
        }
      }
    }
  }
  return copy;
}

function computeRouteOrder(points){
  if(points.length <= 1) return points.map((_,i)=>i);
  const nn = nearestNeighbor(points, 0);
  const improved = twoOpt(nn, points);
  return improved;
}

function FitBounds({ points }){
  const map = useMap();
  useEffect(()=>{
    if(!map) return;
    if(points.length === 0) return;
    const latlngs = points.map(p => [p.lat, p.lng]);
    map.fitBounds(latlngs, { padding: [50,50] });
  }, [map, points]);
  return null;
}

export default function RouteOptimizerSPA(){
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [routeOrder, setRouteOrder] = useState([]);
  const fileRef = useRef();

  // Demo sample
  function addDemo(){
    const sample = [
      { name: 'Start', lat: 28.6139, lng: 77.2090 }, // New Delhi
      { name: 'Point A', lat: 28.644800, lng: 77.216721 },
      { name: 'Point B', lat: 28.5355, lng: 77.3910 },
      { name: 'Point C', lat: 28.4089, lng: 77.3178 },
      { name: 'Point D', lat: 28.7041, lng: 77.1025 }
    ];
    setLocations(sample);
    setRouteOrder([]);
  }

  function addLocation(){
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if(!name || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)){
      alert('Provide name + valid lat/lng');
      return;
    }
    setLocations(prev => [...prev, { name, lat: parsedLat, lng: parsedLng }]);
    setName(''); setLat(''); setLng('');
  }

  function clearAll(){ setLocations([]); setRouteOrder([]); }

  function optimize(){
    if(locations.length === 0) return;
    const order = computeRouteOrder(locations);
    setRouteOrder(order);
  }

  function reorderManually(fromIdx, toIdx){
    const copy = locations.slice();
    const [item] = copy.splice(fromIdx,1);
    copy.splice(toIdx,0,item);
    setLocations(copy);
    setRouteOrder([]);
  }

  function importJSON(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{
        const data = JSON.parse(ev.target.result);
        if(Array.isArray(data)) setLocations(data.map(d=>({ name: d.name||'loc', lat: +d.lat, lng: +d.lng })));
        else alert('Invalid JSON: expected array');
      }catch(err){ alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(locations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'locations.json'; a.click();
    URL.revokeObjectURL(url);
  }

  // Simple CSV parser for "name,lat,lng" per line
  function importCSV(text){
    const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
    const parsed = [];
    for(const ln of lines){
      const parts = ln.split(',').map(p=>p.trim());
      if(parts.length >= 3){
        const name = parts[0];
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        if(!Number.isNaN(lat) && !Number.isNaN(lng)) parsed.push({ name, lat, lng });
      }
    }
    if(parsed.length) setLocations(parsed);
  }

  // File upload handler for CSV
  function handleCSVFile(e){
    const f = e.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ev => importCSV(ev.target.result);
    reader.readAsText(f);
  }

  // Derived: ordered points for drawing polyline
  const orderedPoints = routeOrder.length ? routeOrder.map(i => locations[i]) : locations;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left panel: controls */}
      <aside className="w-full md:w-96 p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold mb-3">Route Optimizer</h1>
        <p className="text-sm mb-4">Add coordinates (lat,lng) or import CSV/JSON. Click <span className="font-semibold">Optimize</span> to compute a near-optimal route (nearest neighbor + 2-opt).</p>

        <div className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Location name" value={name} onChange={e=>setName(e.target.value)} />
          <div className="flex gap-2">
            <input className="flex-1 p-2 border rounded" placeholder="Latitude" value={lat} onChange={e=>setLat(e.target.value)} />
            <input className="flex-1 p-2 border rounded" placeholder="Longitude" value={lng} onChange={e=>setLng(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 p-2 rounded bg-blue-600 text-white" onClick={addLocation}>Add</button>
            <button className="flex-1 p-2 rounded bg-gray-200" onClick={()=>{ setName(''); setLat(''); setLng(''); }}>Reset</button>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 p-2 rounded bg-green-600 text-white" onClick={optimize}>Optimize</button>
            <button className="flex-1 p-2 rounded bg-yellow-500 text-white" onClick={()=>setRouteOrder([])}>Clear Route</button>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 p-2 rounded bg-indigo-600 text-white" onClick={addDemo}>Load Demo</button>
            <button className="flex-1 p-2 rounded bg-red-500 text-white" onClick={clearAll}>Clear All</button>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Import CSV (name,lat,lng)</label>
            <input type="file" accept=".csv" onChange={handleCSVFile} className="text-sm" />
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Import JSON</label>
            <input type="file" accept="application/json" onChange={importJSON} className="text-sm" />
          </div>

          <div className="mt-2 flex gap-2">
            <button onClick={exportJSON} className="p-2 rounded bg-slate-700 text-white flex-1">Export JSON</button>
            <button onClick={()=>fileRef.current?.click()} className="p-2 rounded bg-slate-400 text-white">Upload CSV (alt)</button>
            <input ref={fileRef} type="file" style={{display:'none'}} accept=".csv" onChange={handleCSVFile} />
          </div>

        </div>

        <div className="mt-6">
          <h2 className="font-semibold">Locations ({locations.length})</h2>
          <ul className="mt-2 max-h-64 overflow-auto divide-y">
            {locations.map((loc, idx) => (
              <li key={idx} className="py-2 flex items-start justify-between">
                <div>
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-xs text-gray-600">{loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs text-gray-500">#{idx+1}</div>
                  <div className="flex gap-1">
                    <button className="text-xs px-2 py-1 rounded bg-gray-200" onClick={()=>{ setLocations(prev=>prev.filter((_,i)=>i!==idx)); setRouteOrder([]); }}>Del</button>
                    {idx>0 && <button className="text-xs px-2 py-1 rounded bg-gray-200" onClick={()=>reorderManually(idx, idx-1)}>Up</button>}
                    {idx < locations.length-1 && <button className="text-xs px-2 py-1 rounded bg-gray-200" onClick={()=>reorderManually(idx, idx+1)}>Down</button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <strong>Notes:</strong>
          <ul className="list-disc pl-5">
            <li>Algorithm runs entirely in browser — no server required for basic use.</li>
            <li>For real-world driving routes (road distances/times), integrate with a routing provider (Google Directions, Mapbox Directions, OSRM). Replace distance function accordingly.</li>
            <li>Geocoding (address → lat/lng) is not included. Use your preferred geocoding API and set lat/lng fields automatically.</li>
          </ul>
        </div>
      </aside>

      {/* Right panel: map */}
      <main className="flex-1 min-h-[60vh] z-0 relative">
        <MapContainer center={[20.5937,78.9629]} zoom={5} className="h-screen">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={orderedPoints} />

          {orderedPoints.map((p, idx) => (
            <Marker key={idx} position={[p.lat, p.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs">#{idx+1}</div>
                  <div className="text-xs">{p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {orderedPoints.length >= 2 && (
            <Polyline positions={orderedPoints.map(p => [p.lat, p.lng])} pathOptions={{ weight: 4 }} />
          )}

        </MapContainer >
      </main>
    </div>
  );
}
