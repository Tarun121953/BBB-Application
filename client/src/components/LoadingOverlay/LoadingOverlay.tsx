import React from 'react';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="analytics-icon">
          <div className="analytics-circle">
            <div className="analytics-chart">
              <div className="bar bar1"></div>
              <div className="bar bar2"></div>
              <div className="bar bar3"></div>
              <div className="bar bar4"></div>
            </div>
          </div>
        </div>
        <div className="loading-spinner"></div>
        <h2>Analytics Dashboard</h2>
        <p>Loading your insights...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
