import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map bounds adjustment
const MapBounds = ({ sourceCoords, destCoords }) => {
    const map = useMap();
    
    useEffect(() => {
        if (sourceCoords && destCoords) {
            const bounds = L.latLngBounds([sourceCoords, destCoords]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (sourceCoords) {
            map.setView(sourceCoords, 13);
        }
    }, [sourceCoords, destCoords, map]);
    
    return null;
};

const MapViz = ({ origin, destination, sourceCoords, destCoords }) => {
    // Default center (Hyderabad coordinates)
    const defaultCenter = [17.385044, 78.486671];
    
    // Use source coordinates if available, otherwise default
    const mapCenter = sourceCoords || defaultCenter;

    return (
        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer 
                center={mapCenter} 
                zoom={12} 
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapBounds sourceCoords={sourceCoords} destCoords={destCoords} />
                
                {/* Display origin marker if coordinates provided */}
                {origin && sourceCoords && (
                    <Marker position={sourceCoords}>
                        <Popup>
                            <strong>Origin:</strong> {origin}
                        </Popup>
                    </Marker>
                )}
                
                {/* Display destination marker if coordinates provided */}
                {destination && destCoords && (
                    <Marker position={destCoords}>
                        <Popup>
                            <strong>Destination:</strong> {destination}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontSize: '12px'
            }}>
                <div><strong>Route:</strong></div>
                <div>{origin || 'Select origin'}</div>
                <div>↓</div>
                <div>{destination || 'Select destination'}</div>
            </div>
        </div>
    );
};

export default MapViz;
