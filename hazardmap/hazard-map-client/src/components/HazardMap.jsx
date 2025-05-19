import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';

import '../styles/pulsingMarker.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


// Custom icons for start and end points
const startIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  
  const endIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  

const HazardMap = ({
    hazards = [],
    routeHazards = [],
    routeLine = [],
    startPoint,
    endPoint,
    onMapClick
  }) => {

const center = [32.073, 34.781];
  const [clickedLocation, setClickedLocation] = useState(null);

  const regularHazardIcon = L.icon({
    iconUrl: markerIcon,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });

  const PulsingDivIcon = () =>
    L.divIcon({
      className: 'pulsing-marker',
      html: `<div class="pulse-wrapper"><img src="${markerIcon}" style="height: 41px;" /></div>`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setClickedLocation([lat, lng]);
        onMapClick({ latitude: lat, longitude: lng });
      },
    });
    return null;
  };


  return (
<MapContainer center={center} zoom={13} className="map-container" scrollWheelZoom={true}>      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {hazards.map((hazard) => {
        const isOnRoute = routeHazards.some((h) => h.id === hazard.id);
        const markerIcon = isOnRoute
          ? PulsingDivIcon()
          : regularHazardIcon;

        return (
          <Marker key={hazard.id} position={[hazard.latitude, hazard.longitude]} icon={markerIcon}>
            <Popup>
              <div>
                <h3>{hazard.title}</h3>
                <p>{hazard.description}</p>
                <p><strong>Type:</strong> {hazard.type}</p>
                <p><strong>Severity:</strong> {hazard.severity}</p>
                <p><em>{new Date(hazard.created_at).toLocaleString()}</em></p>
                {isOnRoute && <p style={{ color: 'red', fontWeight: 'bold' }}>⚠ On Your Route</p>}
                {hazard.image && (
      <img
        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${hazard.image}`}
        alt="Hazard"
        style={{ width: '100%', maxWidth: '200px', marginTop: '0.5rem', borderRadius: '6px' }}
      />
    )}
              </div>
            </Popup>
          </Marker>
        );
      })}
{startPoint && (
  <Marker position={[startPoint[1], startPoint[0]]} icon={startIcon}>
    <Popup>Start Point</Popup>
  </Marker>
)}

{endPoint && (
  <Marker position={[endPoint[1], endPoint[0]]} icon={endIcon}>
    <Popup>End Point</Popup>
  </Marker>
)}



      {routeLine.length > 0 && <Polyline positions={routeLine} color="blue" />}

      {clickedLocation && (
        <Marker position={clickedLocation}>
          <Popup>You clicked here! Ready to report a hazard?</Popup>
        </Marker>
      )}

      <ClickHandler />
    </MapContainer>
  );
};

export default HazardMap;