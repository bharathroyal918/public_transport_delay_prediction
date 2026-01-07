import React, { useState } from 'react';
import MapViz from '../components/MapViz';
import TripSelector from '../components/TripSelector';
import ChatWidget from '../components/ChatWidget';
import { CloudRain, Clock, Train, Wind, Map, Navigation } from 'lucide-react';

const Dashboard = () => {
    const [predictionResult, setPredictionResult] = useState(null);
    const [routeContext, setRouteContext] = useState(null);

    const handleRouteSelect = (info) => {
        setRouteContext(prev => ({
            ...prev,
            ...info
        }));
    };

    const handlePrediction = (result) => {
        setPredictionResult(result);
        if (result.weather_used) {
            setRouteContext(prev => ({
                ...prev,
                weather: result.weather_used,
                delay: result.delay_minutes
            }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">

                {/* Left Sidebar - Glass Panel */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

                    {/* Input Card */}
                    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl ring-1 ring-black/5">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Navigation className="h-5 w-5" />
                            </div>
                            Plan Your Trip
                        </h2>
                        <TripSelector onPrediction={handlePrediction} onRouteSelect={handleRouteSelect} />
                    </div>

                    {/* Prediction Result Card */}
                    {predictionResult && (
                        <div className="bg-gradient-to-br from-card to-secondary/30 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden group">

                            {/* Decorative Glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/30 transition-all"></div>

                            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                Live Prediction
                            </h3>

                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <div className="text-5xl font-black tracking-tighter text-white">
                                        {predictionResult.delay_minutes.toFixed(0)} <span className="text-lg font-medium text-muted-foreground ml-1">min</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1 font-medium">Expected Delay</div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border ${predictionResult.delay_minutes > 15 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        predictionResult.delay_minutes > 5 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                            'bg-green-500/20 text-green-400 border-green-500/30'
                                    }`}>
                                    {predictionResult.delay_minutes > 15 ? 'HEAVY TRAFFIC' : predictionResult.delay_minutes > 5 ? 'MODERATE' : 'ON TIME'}
                                </div>
                            </div>

                            {predictionResult.weather_used && (
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <CloudRain className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{predictionResult.weather_used.condition}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Conditions</div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-[1px] bg-white/10"></div>
                                        <div className="flex items-center gap-3 pr-2">
                                            <div>
                                                <div className="text-sm font-semibold">{predictionResult.weather_used.temperature_c?.toFixed(1)}°C</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Temp</div>
                                            </div>
                                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                                <Wind className="h-4 w-4 text-orange-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Main Area - Map Stage */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-black/40 backdrop-blur-sm">
                    <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-medium text-white/80 flex items-center gap-2">
                        <Map className="h-3 w-3 text-primary" /> Live Route Visualization
                    </div>
                    <div className="flex-1 w-full h-full">
                        <MapViz
                            origin={routeContext?.origin}
                            destination={routeContext?.destination}
                            sourceCoords={routeContext?.sourceCoords}
                            destCoords={routeContext?.destCoords}
                            routeInfo={routeContext}
                        />
                    </div>
                </div>
            </div>

            <ChatWidget context={routeContext} />
        </div>
    );
};

export default Dashboard;
