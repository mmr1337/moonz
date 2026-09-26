'use client';

import { useCallback, useState } from 'react';
import StrokeText from '../StrokeText/StrokeText';
import './HeroBrand.css';

export default function HeroBrand() {
  const [iconVisible, setIconVisible] = useState(false);

  const revealIcon = useCallback(() => {
    setIconVisible(true);
  }, []);

  return (
    <div className="hero-brand" aria-label="moon">
      <img
        className={`hero-brand__icon ${
          iconVisible ? 'hero-brand__icon--visible' : ''
        }`}
        src="/branding/icon.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div className="hero-brand__wordmark">
        <StrokeText
          text="moon"
          strokeColor="#000000"
          fillColor="#F8FAFC"
          strokeWidth={1.4}
          drawDuration={3}
          fillDelay={0.2}
          stagger={0.05}
          ease="power2.out"
          trigger="mount"
          fillMode="fade"
          fontSize={128}
          fontWeight={800}
          letterSpacing={-4}
          onFillStart={revealIcon}
        />
      </div>
    </div>
  );
}
