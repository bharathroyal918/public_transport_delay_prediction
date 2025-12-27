import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapViz = ({ origin, destination }) => {
    // Default center (Hyderabad coordinates)
    const defaultCenter = [17.385044, 78.486671];

    return (
        <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
            <MapContainer 
                center={defaultCenter} 
                zoom={12} 
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Display origin and destination if provided */}
                {origin && (
                    <Marker position={defaultCenter}>
                        <Popup>
                            <strong>Origin:</strong> {origin}
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
