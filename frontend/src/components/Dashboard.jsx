import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import PredictionForm from './PredictionForm';
import MapViz from './MapViz';

// Dummy data for initial visualization or stats
const data = [
    { name: 'R001', delay: 12 },
    { name: 'R002', delay: 19 },
    { name: 'R003', delay: 3 },
    { name: 'R004', delay: 5 },
    { name: 'R005', delay: 2 },
];

const scenarioData = [
    { rain: 0, delay: 5 },
    { rain: 10, delay: 8 },
    { rain: 20, delay: 15 },
    { rain: 30, delay: 25 },
    { rain: 40, delay: 32 },
    { rain: 50, delay: 45 },
];

const Dashboard = () => {
    const [prediction, setPrediction] = useState(null);
    const [mapParams, setMapParams] = useState({ 
        origin: '', 
        destination: '',
        sourceCoords: null,
        destCoords: null,
        routeInfo: null
    });
    const [selectedRouteDetails, setSelectedRouteDetails] = useState(null);

    // Modified to receive formData with coordinates
    const handlePrediction = (delay, formData) => {
        setPrediction(delay);
        setMapParams({ 
            origin: formData.source, 
            destination: formData.destination,
            sourceCoords: formData.sourceCoords,
            destCoords: formData.destCoords,
            routeInfo: formData.routeInfo
        });
        // Set initial selected route to first route if available
        if (formData.routeInfo?.routes?.[0]) {
            setSelectedRouteDetails(formData.routeInfo.routes[0]);
        } else {
            // Clear route details if no route info available
            setSelectedRouteDetails(null);
        }
    };
    
    // Callback to update selected route from MapViz
    const handleRouteSelect = (route) => {
        setSelectedRouteDetails(route);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <h2>Current Route Risk (Avg Delays)</h2>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="delay" fill="#8884d8" name="Avg Delay (min)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h2>"What-If": Rain vs Delay Analysis</h2>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={scenarioData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rain" label={{ value: 'Rain (mm)', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: 'Delay (min)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="delay" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h2>Route Visualization & Traffic</h2>
                <MapViz 
                    key={mapParams.routeInfo ? `map-${mapParams.routeInfo.routes?.length || 0}-${JSON.stringify(mapParams.routeInfo.routes?.map(r => r.summary?.distance))}` : 'map-empty'}
                    origin={mapParams.origin} 
                    destination={mapParams.destination}
                    sourceCoords={mapParams.sourceCoords}
                    destCoords={mapParams.destCoords}
                    routeInfo={mapParams.routeInfo}
                    onRouteSelect={handleRouteSelect}
                />
            </div>

            <div className="dashboard-grid">
                <PredictionForm onPrediction={handlePrediction} />

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2>Prediction Result</h2>
                    {prediction !== null ? (
                        <div className="prediction-result">
                            <h3>Expected Delay</h3>
                            <div className="prediction-value">{prediction.toFixed(1)} min</div>
                            <p>
                                {prediction > 15
                                    ? "High Risk! Consider alternate routes or buffer time."
                                    : prediction > 5
                                        ? "Moderate delay expected."
                                        : "On time (minimal delay)."}
                            </p>
                            {selectedRouteDetails && (
                                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <h4 style={{ marginTop: 0, color: '#475569' }}>Route Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9em' }}>Distance</p>
                                            <p style={{ margin: '5px 0', fontSize: '1.2em', fontWeight: 'bold', color: '#0f172a' }}>
                                                {selectedRouteDetails.distance} km
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9em' }}>Travel Time</p>
                                            <p style={{ margin: '5px 0', fontSize: '1.2em', fontWeight: 'bold', color: '#0f172a' }}>
                                                {selectedRouteDetails.duration} min
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '6px' }}>
                                        <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9em' }}>Total Journey Time (with delay)</p>
                                        <p style={{ margin: '5px 0', fontSize: '1.3em', fontWeight: 'bold', color: '#dc2626' }}>
                                            {(selectedRouteDetails.duration + prediction).toFixed(1)} min
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <p>Enter parameters on the left to estimate delay.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
