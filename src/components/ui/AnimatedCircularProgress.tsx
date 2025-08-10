'use client';

import React from 'react';
import './animatedProgress.css'; // CSS extracted below

interface AnimatedCircularProgressProps {
  percentage: number;
  label?: string;
  variant?: 'green' | 'light' | 'pink';
}

const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  percentage,
  label = `${percentage}%`,
  variant = 'green',
}) => {
  // Decide animation class based on percentage
  const animationClass = (() => {
    if (percentage <= 20) return 'loading-4'; // pink
    if (percentage <= 50) return 'loading-3'; // light
    if (percentage <= 70) return 'loading-5'; // green slow
    if (percentage <= 90) return 'loading-2'; // green fast
    return 'loading-1'; // full 180
  })();

  return (
    <div className={`progress ${variant}`}>
      <span className="progress-left">
        <span className={`progress-bar ${animationClass}`} />
      </span>
      <span className="progress-right">
        <span className="progress-bar loading-1" />
      </span>
      <div className="progress-value">{label}</div>
    </div>
  );
};

export default AnimatedCircularProgress;
