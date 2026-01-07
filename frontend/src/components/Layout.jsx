import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, LogOut, Map, User } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLanding = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <nav className={`fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-all`}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
                        <Bus className="h-6 w-6" />
                        <span>TransitFlow</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                        <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</a>
                        <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
                                <span className="text-muted-foreground/30">/</span>
                                <Link to="/register" className="text-sm font-medium hover:text-primary transition-colors">Register</Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                                    <Map className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-border">
                                    <span className="text-sm text-muted-foreground hidden md:inline-block">Hi, {user}</span>
                                    <button onClick={handleLogout} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="flex-1 pt-16">
                {children}
            </main>

            {!isLanding && (
                <footer className="border-t border-border py-6 bg-secondary/20">
                    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                        © 2026 TransitFlow AI. All rights reserved.
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
