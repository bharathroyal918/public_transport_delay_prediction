import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

const MapViz = ({ origin, destination, sourceCoords, destCoords, routeInfo, onRouteSelect }) => {
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    
    // Handle route selection with immediate callback
    const handleRouteSelection = (idx) => {
        setSelectedRouteIndex(idx);
        if (routeInfo?.routes?.[idx]) {
            onRouteSelect?.(routeInfo.routes[idx]);
        }
    };
    
    // Initialize with first route when routeInfo is available
    useEffect(() => {
        if (routeInfo?.routes?.[0]) {
            setSelectedRouteIndex(0);
            onRouteSelect?.(routeInfo.routes[0]);
        }
    }, [routeInfo]);
    
    // Default center (Hyderabad coordinates)
    const defaultCenter = [17.385044, 78.486671];
    
    // Use source coordinates if available, otherwise default
    const mapCenter = sourceCoords || defaultCenter;
    
    // Get the currently selected route
    const selectedRoute = routeInfo?.routes?.[selectedRouteIndex];
    
    // Route colors for different alternatives (darker colors for better visibility)
    const routeColors = ['#1d4ed8', '#047857', '#b45309', '#dc2626'];

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
                
                {/* Display all route polylines if available */}
                {routeInfo?.routes && routeInfo.routes.map((route, idx) => {
                    const isSelected = selectedRouteIndex === idx;
                    return (
                        <React.Fragment key={`route-fragment-${idx}`}>
                            <Polyline 
                                key={`route-${idx}-${selectedRouteIndex}`}
                                positions={route.coordinates} 
                                color={routeColors[idx % routeColors.length]}
                                weight={isSelected ? 9 : 2}
                                opacity={isSelected ? 1 : 0.15}
                                dashArray={isSelected ? null : '10, 15'}
                                eventHandlers={{
                                    click: () => {
                                        handleRouteSelection(idx);
                                    },
                                    mouseover: (e) => {
                                        if (!isSelected) {
                                            e.target.setStyle({ weight: 4, opacity: 0.4 });
                                        }
                                    },
                                    mouseout: (e) => {
                                        if (!isSelected) {
                                            e.target.setStyle({ weight: 2, opacity: 0.15 });
                                        }
                                    }
                                }}
                            />
                        </React.Fragment>
                    );
                })}
                
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
                fontSize: '12px',
                maxWidth: '250px',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 1000
            }}>
                <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>
                    <div><strong>🚏 Route:</strong></div>
                    <div style={{ fontSize: '11px', marginTop: '3px', color: '#059669' }}>
                        <strong>From:</strong> {origin || 'Select origin'}
                    </div>
                    {sourceCoords && (
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            📍 {sourceCoords[0].toFixed(6)}, {sourceCoords[1].toFixed(6)}
                        </div>
                    )}
                    <div style={{ margin: '3px 0', textAlign: 'center' }}>↓</div>
                    <div style={{ fontSize: '11px', color: '#dc2626' }}>
                        <strong>To:</strong> {destination || 'Select destination'}
                    </div>
                    {destCoords && (
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            📍 {destCoords[0].toFixed(6)}, {destCoords[1].toFixed(6)}
                        </div>
                    )}
                </div>
                
                {selectedRoute ? (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                        <div><strong>Distance:</strong> {selectedRoute.distance} km</div>
                        <div><strong>Duration:</strong> {selectedRoute.duration} min</div>
                    </div>
                ) : (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', fontSize: '11px', color: '#666' }}>
                        Select source and destination to see route
                    </div>
                )}
                
                {/* Route alternatives selector */}
                {routeInfo?.routes && routeInfo.routes.length > 1 && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
                        <div><strong>Alternative Routes:</strong></div>
                        {routeInfo.routes.map((route, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    handleRouteSelection(idx);
                                }}
                                style={{
                                    padding: '8px',
                                    marginTop: '5px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedRouteIndex === idx ? '#e0f2fe' : '#f9fafb',
                                    border: `2px solid ${selectedRouteIndex === idx ? routeColors[idx % routeColors.length] : '#e5e7eb'}`,
                                    transition: 'all 0.15s',
                                    transform: selectedRouteIndex === idx ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: selectedRouteIndex === idx ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: routeColors[idx % routeColors.length]
                                    }}></div>
                                    <strong>Route {idx + 1}</strong>
                                </div>
                                <div style={{ fontSize: '11px', marginTop: '3px' }}>
                                    {route.distance} km · {route.duration} min
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapViz;
