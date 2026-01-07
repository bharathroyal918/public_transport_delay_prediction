import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Zap, Navigation, Shield, Award } from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
            </div>

            {/* Hero Section */}
            <section id="home" className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl"
                >
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] backdrop-blur-md"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-[pulse_2s_infinite]"></span>
                        Next-Gen Transit Prediction AI
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
                        <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">Predict Delays.</span> <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">Save Time.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Harness the power of <span className="text-foreground font-semibold">Gemini AI</span> and real-time weather data to navigate your city with precision.
                    </p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                    >
                        <Link to="/register" className="group relative px-8 py-4 bg-primary rounded-xl font-bold text-lg text-primary-foreground shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center">
                            Start Predicting <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
                        </Link>
                        <Link to="/login" className="px-8 py-4 bg-secondary/30 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-lg hover:bg-secondary/50 transition-all hover:border-white/20">
                            Existing Account
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats/Floaters */}
            <div className="absolute top-1/3 left-10 md:left-20 hidden lg:block opacity-20 hover:opacity-100 transition-opacity duration-500">
                <FloatingCard icon={<Navigation />} text="Smart Routing" delay={0} />
            </div>
            <div className="absolute bottom-1/3 right-10 md:right-20 hidden lg:block opacity-20 hover:opacity-100 transition-opacity duration-500">
                <FloatingCard icon={<Shield />} text="Reliable Data" delay={1} />
            </div>

            {/* Features Grid */}
            <section className="py-24 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="h-10 w-10 text-yellow-400" />}
                            title="Hyper-Fast AI"
                            description="Our Random Forest models combined with Google's Gemini allow for instant delay estimations."
                            gradient="from-yellow-400/10 to-orange-400/5"
                        />
                        <FeatureCard
                            icon={<MapPin className="h-10 w-10 text-blue-400" />}
                            title="Live Visualization"
                            description="See exactly where you are going with interactive map routing and traffic layers."
                            gradient="from-blue-400/10 to-indigo-400/5"
                        />
                        <FeatureCard
                            icon={<Clock className="h-10 w-10 text-green-400" />}
                            title="Weather Aware"
                            description="Rain, fog, or snow? We automatically adjust travel times based on live conditions."
                            gradient="from-green-400/10 to-emerald-400/5"
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 relative">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <h2 className="text-3xl font-bold mb-6 text-foreground">About TransitFlow</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        TransitFlow is dedicated to making urban commute predictable and stress-free.
                        By combining historical transit data with real-time weather and traffic intelligence,
                        we provide you with the most accurate delay predictions available.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-secondary/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-foreground">Get in Touch</h2>
                    <div className="flex justify-center gap-8 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Navigation className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Office</div>
                                <div className="text-sm text-muted-foreground">Hyderabad, India</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-foreground">Support</div>
                                <div className="text-sm text-muted-foreground">help@transitflow.ai</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, gradient }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className={`p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${gradient} backdrop-blur-sm relative overflow-hidden group`}
    >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="mb-6 p-4 bg-black/40 rounded-2xl w-fit border border-white/10 shadow-inner">{icon}</div>
        <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
);

const FloatingCard = ({ icon, text, delay }) => (
    <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: delay, ease: "easeInOut" }}
        className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl"
    >
        <div className="text-primary">{icon}</div>
        <span className="font-semibold text-sm text-white">{text}</span>
    </motion.div>
);

export default Landing;
