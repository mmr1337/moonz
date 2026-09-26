'use client';

import { useCallback, useState } from 'react';
import StrokeText from '../StrokeText/StrokeText';
import ElectricLogo from '../ElectricLogo/ElectricLogo';
import './HeroBrand.css';

export default function HeroBrand() {
  const [logoVisible, setLogoVisible] = useState(false);

  const revealLogo = useCallback(() => {
    setLogoVisible(true);
  }, []);

  return (
    <div className="hero-brand" aria-label="moon">
      <div className="hero-brand__logo" aria-hidden="true">
        {logoVisible ? (
          <ElectricLogo
            src="/branding/icon.png"
            color="#ffffff"
            glowColor="#000000"
            scale={0.5}
            intensity={1}
            glow={0}
            fill={0}
            thickness={1.5}
            strands={4}
            bend={0.6}
            crackle={1.5}
            arcs={1}
            flicker={0.6}
            speed={2.5}
            interactive={false}
            theme="dark"
          />
        ) : null}
      </div>

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
          fontSize={220}
          fontWeight={800}
          letterSpacing={-7}
          onFillStart={revealLogo}
        />
      </div>
    </div>
  );
}
