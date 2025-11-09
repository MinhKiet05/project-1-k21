import React, { memo } from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = memo(() => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-price"></div>
      </div>
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;