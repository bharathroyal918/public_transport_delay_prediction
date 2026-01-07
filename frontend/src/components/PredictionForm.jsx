import React, { useState, useEffect } from 'react';
import { predictDelay, getRoutes, getTrips, getStops, fetchRouteInfo } from '../api';

const PredictionForm = ({ onPrediction }) => {
    const [formData, setFormData] = useState({
        city: 'hyderabad',
        route_id: '',
        direction: '',
        source: '',
        destination: '',
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        time_of_day: '08:00',
        weather_condition: 'Clear',
        temperature_c: 20,
        precipitation_mm: 0,
        event_type: 'None',
        event_attendance: 0,
        traffic_factor: 1.0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [stops, setStops] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);

    // 1. Load Routes on City Change
    useEffect(() => {
        const loadRoutes = async () => {
            setRoutes([]); setTrips([]); setStops([]);
            const data = await getRoutes(formData.city);
            setRoutes(data);
            if (data.length > 0) {
                // Select first route
                setFormData(prev => ({ ...prev, route_id: data[0].route_short_name }));
            }
        };
        loadRoutes();
    }, [formData.city]);

    // 2. Load Trips (Directions) on Route Change
    useEffect(() => {
        if (!formData.route_id) return;
        const loadTrips = async () => {
            const tripData = await getTrips(formData.city, formData.route_id);
            setTrips(tripData);
            // Select first direction if available, else empty (fetching all stops)
            const headsign = tripData.length > 0 ? tripData[0].trip_headsign : '';
            setFormData(prev => ({ ...prev, direction: headsign }));
        };
        loadTrips();
    }, [formData.city, formData.route_id]);

    // 3. Load Stops on Direction/Route Change
    useEffect(() => {
        if (!formData.route_id) return;
        const loadStops = async () => {
            const stopData = await getStops(formData.city, formData.route_id, formData.direction);
            setStops(stopData);
            if (stopData.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    source: stopData[0].stop_name,
                    destination: stopData.length > 1 ? stopData[stopData.length - 1].stop_name : stopData[0].stop_name
                }));
            }
        };
        loadStops();
    }, [formData.city, formData.route_id, formData.direction]);

    // Fetch route info when both source and destination are selected
    useEffect(() => {
        let cancelled = false;

        const loadRouteData = async () => {
            // Only proceed if we have stops loaded and valid selections
            if (stops.length === 0 || !formData.source || !formData.destination || formData.source === formData.destination) {
                return;
            }

            const sourceStop = stops.find(s => s.stop_name === formData.source);
            const destStop = stops.find(s => s.stop_name === formData.destination);

            if (sourceStop && destStop && sourceStop.stop_id !== destStop.stop_id) {
                try {
                    const info = await fetchRouteInfo(
                        sourceStop.stop_lat,
                        sourceStop.stop_lon,
                        destStop.stop_lat,
                        destStop.stop_lon
                    );
                    if (!cancelled) {
                        setRouteInfo(info);
                    }
                } catch (error) {
                    console.error('Failed to fetch route info:', error);
                    if (!cancelled) {
                        setRouteInfo(null);
                    }
                }
            } else {
                if (!cancelled) {
                    setRouteInfo(null);
                }
            }
        };

        // Add a small delay to ensure stops are fully loaded
        const timeoutId = setTimeout(loadRouteData, 100);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [formData.source, formData.destination, stops.length]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updates = { [name]: value };

        // Auto-calculate day of week if date changes
        if (name === 'date') {
            const dateObj = new Date(value);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            updates.day_of_week = days[dateObj.getDay()];
        }

        // Handle number inputs
        if (['temperature_c', 'precipitation_mm', 'event_attendance', 'traffic_factor'].includes(name)) {
            updates[name] = parseFloat(value);
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate that source and destination are different
        if (formData.source === formData.destination) {
            setError('Source and destination cannot be the same');
            setLoading(false);
            return;
        }

        try {
            // Wait for route info if it's not available yet
            let currentRouteInfo = routeInfo;
            if (!currentRouteInfo && formData.source && formData.destination) {
                const sourceStop = stops.find(s => s.stop_name === formData.source);
                const destStop = stops.find(s => s.stop_name === formData.destination);

                if (sourceStop && destStop && sourceStop.stop_id !== destStop.stop_id) {
                    currentRouteInfo = await fetchRouteInfo(
                        sourceStop.stop_lat,
                        sourceStop.stop_lon,
                        destStop.stop_lat,
                        destStop.stop_lon
                    );
                    // Update the component state so it's available for future renders
                    setRouteInfo(currentRouteInfo);
                }
            }

            const result = await predictDelay(formData);

            // Find coordinates for source and destination
            const sourceStop = stops.find(s => s.stop_name === formData.source);
            const destStop = stops.find(s => s.stop_name === formData.destination);

            const enrichedFormData = {
                ...formData,
                sourceCoords: sourceStop ? [sourceStop.stop_lat, sourceStop.stop_lon] : null,
                destCoords: destStop ? [destStop.stop_lat, destStop.stop_lon] : null,
                routeInfo: currentRouteInfo
            };

            onPrediction(result.delay_minutes, enrichedFormData);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Failed to get prediction';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Predict Delay</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>City</label>
                    <select name="city" value={formData.city} onChange={handleChange}>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="karnataka">Karnataka (Bengaluru)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Route</label>
                    <select name="route_id" value={formData.route_id} onChange={handleChange}>
                        {routes.map((r, index) => <option key={`${r.route_id}_${index}`} value={r.route_short_name}>{r.route_short_name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Direction (Headsign)</label>
                    <select name="direction" value={formData.direction} onChange={handleChange}>
                        {trips.length > 0 ? (
                            trips.map((t, index) => <option key={`${t.trip_headsign}_${index}`} value={t.trip_headsign}>{t.trip_headsign}</option>)
                        ) : (
                            <option value="">Any</option>
                        )}
                    </select>
                </div>

                <div className="dashboard-grid">
                    <div className="form-group">
                        <label>Source</label>
                        <select name="source" value={formData.source} onChange={handleChange}>
                            {stops.length > 0 ? (
                                stops.map((s, index) => <option key={`src_${index}`} value={s.stop_name}>{s.stop_name}</option>)
                            ) : (
                                <option value="">Loading stops...</option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Destination</label>
                        <select name="destination" value={formData.destination} onChange={handleChange}>
                            {stops.length > 0 ? (
                                stops.map((s, index) => <option key={`dest_${index}`} value={s.stop_name}>{s.stop_name}</option>)
                            ) : (
                                <option value="">Loading stops...</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Time of Day</label>
                        <input type="time" name="time_of_day" value={formData.time_of_day} onChange={handleChange} />
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="form-group">
                        <label>Weather</label>
                        <select name="weather_condition" value={formData.weather_condition} onChange={handleChange}>
                            {['Clear', 'Rain', 'Snow', 'Fog'].map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Precipitation (mm)</label>
                        <input type="number" name="precipitation_mm" value={formData.precipitation_mm} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Event Type</label>
                    <select name="event_type" value={formData.event_type} onChange={handleChange}>
                        {['None', 'Sports', 'Concert', 'Festival'].map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>

                <button type="submit" className="primary-btn" disabled={loading || formData.source === formData.destination}>
                    {loading ? 'Calculating...' : 'Predict Delay'}
                </button>

                {formData.source === formData.destination && formData.source && (
                    <p style={{ color: 'orange', marginTop: '10px' }}>⚠️ Source and destination must be different</p>
                )}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
};

export default PredictionForm;
