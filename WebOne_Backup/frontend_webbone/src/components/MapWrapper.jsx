import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapUpdater({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lon) {
      map.setView([coords.lat, coords.lon], map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export default function MapWrapper({ lat, lon }) {
  if (!lat || !lon) return null;
  return (
    <div className="h-full w-full">
      <MapContainer center={[lat, lon]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        <Marker position={[lat, lon]}>
          <Popup>
            Lat: {lat} <br /> Lon: {lon}
          </Popup>
        </Marker>
        <MapUpdater coords={{ lat, lon }} />
      </MapContainer>
    </div>
  );
}
