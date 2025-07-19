import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import LoadingOverlay from './components/LoadingOverlay/LoadingOverlay';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading time or wait for resources to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Show loading overlay for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <LoadingOverlay isLoading={isLoading} />
      <header className="App-header">
        <Dashboard />
      </header>
    </div>
  );
}

export default App;
