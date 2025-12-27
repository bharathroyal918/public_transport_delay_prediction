import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(err => setHealth('offline'));
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Public Transport Delay Prediction</h1>
        <span className={`status-badge ${health === 'healthy' ? 'online' : 'offline'}`}>
          System: {health}
        </span>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
