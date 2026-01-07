import React, { useState, useEffect } from 'react';
import { getRoutes, getTrips, getStops, fetchRouteInfo, predictDelay } from '../api';
import { Search, Loader2, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

const TripSelector = ({ onPrediction, onRouteSelect }) => {
    const [formData, setFormData] = useState({
        city: 'hyderabad',
        route_id: '',
        direction: '',
        source: '',
        destination: '',
        date: new Date().toISOString().slice(0, 10),
        time_of_day: '08:00',
        event_type: 'None',
        weather_condition: 'Auto',
    });

    const [routes, setRoutes] = useState([]);
    const [trips, setTrips] = useState([]);
    const [stops, setStops] = useState([]);

    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [error, setError] = useState(null);

    // Initial Load
    useEffect(() => {
        const loadRoutes = async () => {
            try {
                const data = await getRoutes(formData.city);
                setRoutes(data);
                if (data.length > 0) setFormData(p => ({ ...p, route_id: data[0].route_short_name }));
            } catch (e) { console.error("Failed to load routes", e); }
        };
        loadRoutes();
    }, [formData.city]);

    // Load Trips
    useEffect(() => {
        if (!formData.route_id) return;
        const loadTrips = async () => {
            const data = await getTrips(formData.city, formData.route_id);
            setTrips(data);
            if (data.length > 0) setFormData(p => ({ ...p, direction: data[0].trip_headsign }));
        };
        loadTrips();
    }, [formData.city, formData.route_id]);

    // Load Stops
    useEffect(() => {
        if (!formData.route_id) return;
        const loadStops = async () => {
            const data = await getStops(formData.city, formData.route_id, formData.direction);
            setStops(data);
            if (data.length > 0) {
                setFormData(p => ({
                    ...p,
                    source: data[0].stop_name,
                    destination: data.length > 1 ? data[data.length - 1].stop_name : data[0].stop_name
                }));
            }
        };
        loadStops();
    }, [formData.city, formData.route_id, formData.direction]);

    // Update Map
    useEffect(() => {
        const updateRouteInfo = async () => {
            if (stops.length === 0 || !formData.source || !formData.destination || formData.source === formData.destination) return;

            const sourceStop = stops.find(s => s.stop_name === formData.source);
            const destStop = stops.find(s => s.stop_name === formData.destination);

            if (sourceStop && destStop) {
                try {
                    const info = await fetchRouteInfo(sourceStop.stop_lat, sourceStop.stop_lon, destStop.stop_lat, destStop.stop_lon);
                    onRouteSelect({
                        ...info,
                        sourceCoords: [sourceStop.stop_lat, sourceStop.stop_lon],
                        destCoords: [destStop.stop_lat, destStop.stop_lon],
                        origin: formData.source,
                        destination: formData.destination
                    });
                } catch (e) { console.error(e); }
            }
        };
        const timer = setTimeout(updateRouteInfo, 500);
        return () => clearTimeout(timer);
    }, [formData.source, formData.destination, stops]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPredicting(true);
        setError(null);
        try {
            const sourceStop = stops.find(s => s.stop_name === formData.source);
            const payload = { ...formData, lat: sourceStop?.stop_lat, lon: sourceStop?.stop_lon };
            const result = await predictDelay(payload);
            onPrediction(result);
        } catch (err) {
            setError('Failed to get prediction');
        } finally {
            setPredicting(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const inputClasses = "w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-black/30";
    const labelClasses = "text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block";

    return (
        <div className="space-y-5">
            <div className="space-y-4">
                <div>
                    <label className={labelClasses}>Select City</label>
                    <select name="city" className={inputClasses} value={formData.city} onChange={handleChange}>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="karnataka">Karnataka</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Bus Route</label>
                        <select name="route_id" className={inputClasses} value={formData.route_id} onChange={handleChange}>
                            {routes.map((r, i) => <option key={i} value={r.route_short_name}>{r.route_short_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Direction</label>
                        <select name="direction" className={inputClasses} value={formData.direction} onChange={handleChange}>
                            {trips.map((t, i) => <option key={i} value={t.trip_headsign}>{t.trip_headsign}</option>)}
                        </select>
                    </div>
                </div>

                <div className="relative py-2 px-1">
                    <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/50 to-purple-500/50 rounded-full"></div>

                    <div className="space-y-4 pl-4">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                            <label className={labelClasses}>Origin Stop</label>
                            <select name="source" className={inputClasses} value={formData.source} onChange={handleChange}>
                                {stops.map((s, i) => <option key={i} value={s.stop_name}>{s.stop_name}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-background"></div>
                            <label className={labelClasses}>Destination Stop</label>
                            <select name="destination" className={inputClasses} value={formData.destination} onChange={handleChange}>
                                {stops.map((s, i) => <option key={i} value={s.stop_name}>{s.stop_name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                        <label className={labelClasses}>Travel Date</label>
                        <input type="date" name="date" className={inputClasses} value={formData.date} onChange={handleChange} />
                    </div>
                    <div>
                        <label className={labelClasses}>Time</label>
                        <input type="time" name="time_of_day" className={inputClasses} value={formData.time_of_day} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {error}
            </div>}

            <button
                onClick={handleSubmit}
                disabled={predicting}
                className="group w-full bg-gradient-to-r from-primary to-blue-600 hover:to-blue-500 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {predicting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <>
                        Calculate Delay <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
    );
};

export default TripSelector;
