'use client';

import { useEffect, useState } from 'react';

interface AnimatedProgressProviderProps {
  valueStart: number;
  valueEnd: number;
  duration?: number; // in seconds
  children: (value: number) => JSX.Element;
}

const AnimatedProgressProvider = ({
  valueStart,
  valueEnd,
  duration = 1.4,
  children,
}: AnimatedProgressProviderProps) => {
  const [value, setValue] = useState(valueStart);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const currentVal = valueStart + (valueEnd - valueStart) * progress;
      setValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [valueStart, valueEnd, duration]);

  return children(value);
};

export default AnimatedProgressProvider;
