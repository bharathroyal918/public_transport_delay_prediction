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
    const [mapParams, setMapParams] = useState({ origin: '', destination: '' });

    const handleFormUpdate = (formData) => {
        // Update map params when form changes (or when prediction happens? let's do real-time or on predict)
        // For better UX, let's update when prediction happens or add a specific "Update Map" action.
        // Actually, let's pass a handler to PredictionForm to bubble up changes if we want real-time map, 
        // OR just keep it simple: Map updates when Prediction is triggered.
        // Let's assume onPrediction also receives the full form data.
        // We need to modify PredictionForm to pass formData back up.
    };

    // Modified to receive formData
    const handlePrediction = (delay, formData) => {
        setPrediction(delay);
        setMapParams({ origin: formData.source, destination: formData.destination });
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
                <MapViz origin={mapParams.origin} destination={mapParams.destination} />
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
