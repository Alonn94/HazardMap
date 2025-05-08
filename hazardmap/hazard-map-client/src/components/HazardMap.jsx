import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useState} from 'react';


const HazardMap = ({ hazards, onMapClick}) => {
  const center = [32.073, 34.781]; // Tel Aviv 
  const [clickedLocation, setClickedLocation] = useState(null);

  const ClickHandler = () => {
    useMapEvents ({
        click(e) {
            const { lat, lng } = e.latlng;
            setClickedLocation([lat, lng]);
            onMapClick({ latitude: lat, longitude: lng });
        }
    });
    return null
  };

  return (
    <MapContainer center={center} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {hazards.map(hazard => (
        <Marker
          key={hazard.id}
          position={[hazard.latitude, hazard.longitude]}
        >
<Popup>
  <div>
    <h3>{hazard.title}</h3>
    <p>{hazard.description}</p>
    <p><strong>Type:</strong> {hazard.type}</p>
    <p><strong>Severity:</strong> {hazard.severity}</p>
    {/* Optional: format timestamp */}
    <p><em>{new Date(hazard.created_at).toLocaleString()}</em></p>
  </div>
</Popup>
        </Marker>
      ))}
      {clickedLocation && (
        <Marker position = {clickedLocation}>
            <Popup>You clicked here! Ready to report a hazard?</Popup>
        </Marker>
      )}
      <ClickHandler />
    </MapContainer>
  );
};

export default HazardMap;