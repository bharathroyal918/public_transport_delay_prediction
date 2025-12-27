import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

const center = {
    lat: 40.7128,
    lng: -74.0060
};

const libraries = ['places'];

const MapViz = ({ origin, destination }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // REPLACE THIS WITH YOUR KEY
        libraries: libraries
    });

    const [response, setResponse] = useState(null);

    const directionsCallback = useCallback((res) => {
        console.log("Directions response: ", res);
        if (res !== null) {
            if (res.status === 'OK') {
                setResponse(res);
            } else {
                console.error('response: ', res);
            }
        }
    }, []);

    // Effect to reset response if inputs change, triggering a re-fetch by DirectionsService
    useEffect(() => {
        // DirectionsService component handles the fetch when props change, 
        // but we need to clear old response if origin/dest are empty to avoid stuck map
        if (!origin || !destination) {
            setResponse(null);
        }
    }, [origin, destination]);

    if (!isLoaded) return <div>Loading Map...</div>;

    const leg = response?.routes[0]?.legs[0];
    const duration = leg?.duration_in_traffic?.text || leg?.duration?.text;

    return (
        <div style={{ position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
            >
                { /* Show Directions if we have both points */}
                {origin && destination && (
                    <DirectionsService
                        options={{
                            destination: destination,
                            origin: origin,
                            travelMode: 'TRANSIT', // Or DRIVING
                            provideRouteAlternatives: true,
                            drivingOptions: {
                                departureTime: new Date(), // For real-time traffic
                                trafficModel: 'bestguess'
                            }
                        }}
                        callback={directionsCallback}
                    />
                )}

                {response && (
                    <DirectionsRenderer
                        options={{
                            directions: response
                        }}
                    />
                )}

                <TrafficLayer />
            </GoogleMap>

            {duration && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    fontWeight: 'bold'
                }}>
                    Traffic Duration: {duration}
                </div>
            )}
        </div>
    );
};

export default React.memo(MapViz);
