'use client';

import { useEffect, useRef, useState } from 'react';
import './LatticeLoader.css';

const PATTERNS = {
  orbit: {
    4: {
      cells: [0,1,2,3,11,null,null,4,10,null,null,5,9,8,7,6],
      loop: 6,
      scale: 1.2,
      lit: 0.45
    }
  }
};

const MARKS = {
  4: {
    done: [7, 8, 10, 13],
    error: [0, 3, 5, 6, 9, 10, 12, 15]
  }
};

export default function LatticeLoader({
  label = 'Working',
  doneLabel = 'Done',
  errorLabel = 'Failed',
  status = 'working',
  pattern = 'orbit',
  grid = 4,
  shape = 'round',
  color = '#7979ff',
  doneColor = '#22c55e',
  errorColor = '#ef4444',
  cellSize = 6,
  gap = 2,
  fontSize = 14,
  step = 75,
  idleOpacity = 0.15,
  glow = true,
  glowColor = '#7979ff',
  showLabel = true,
  className = '',
  style
}) {
  const n = grid === 4 ? 4 : 4;
  const pat = PATTERNS[pattern]?.[n] || PATTERNS.orbit[4];
  const marks = MARKS[n];
  const d = step * pat.scale;
  const cycle = Math.round(pat.loop * d);

  const markRef = useRef('done');
  const mark = status === 'working' ? markRef.current : status;
  markRef.current = mark;

  const [announce, setAnnounce] = useState(label);

  useEffect(() => {
    setAnnounce(
      status === 'working'
        ? label
        : status === 'done'
          ? doneLabel
          : errorLabel
    );
  }, [status, label, doneLabel, errorLabel]);

  return (
    <span
      role="status"
      className={`lattice-loader${className ? ` ${className}` : ''}`}
      data-status={status}
      data-shape={shape}
      data-glow={glow ? '' : undefined}
      style={{
        '--ll-n': n,
        '--ll-cell': `${cellSize}px`,
        '--ll-gap': `${gap}px`,
        '--ll-font': `${fontSize}px`,
        '--ll-color': color,
        '--ll-mark': status === 'error' ? errorColor : doneColor,
        '--ll-idle': idleOpacity,
        '--ll-glow': glowColor || color,
        '--ll-mark-glow':
          glowColor || (status === 'error' ? errorColor : doneColor),
        '--ll-cycle': `${cycle}ms`,
        ...style
      }}
    >
      <span className="lattice-loader__grid" aria-hidden="true">
        <span className="lattice-loader__layer lattice-loader__run">
          {pat.cells.map((unit, i) => (
            <span
              key={i}
              className="lattice-loader__cell"
              data-hole={unit == null ? '' : undefined}
              data-lit={pat.lit ? Math.round(pat.lit * 100) : undefined}
              style={
                unit == null
                  ? undefined
                  : { animationDelay: `${Math.round(unit * d)}ms` }
              }
            />
          ))}
        </span>

        <span className="lattice-loader__layer lattice-loader__mark">
          {pat.cells.map((_, i) => (
            <span
              key={i}
              className="lattice-loader__cell"
              data-on={marks[mark].includes(i) ? '' : undefined}
            />
          ))}
        </span>
      </span>

      {showLabel ? (
      <span className="lattice-loader__label" aria-hidden="true">
        <span
          className="lattice-loader__text"
          data-active={status === 'working' ? '' : undefined}
        >
          {label}
        </span>
        <span
          className="lattice-loader__text"
          data-active={status === 'done' ? '' : undefined}
        >
          {doneLabel}
        </span>
        <span
          className="lattice-loader__text"
          data-active={status === 'error' ? '' : undefined}
        >
          {errorLabel}
        </span>
      </span>
      ) : null}

      <span className="lattice-loader__sr">{announce}</span>
    </span>
  );
}
