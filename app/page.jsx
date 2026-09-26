'use client';

import { useEffect, useRef, useState } from 'react';
import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';
import HeroBrand from '../components/HeroBrand/HeroBrand';
import BranchedMenu from '../components/BranchedMenu/BranchedMenu';
import LatticeLoader from '../components/LatticeLoader/LatticeLoader';
import SwipeToast from '../components/SwipeToast/SwipeToast';

const previewImage = '/preview.png';

const galleryItems = [
  { image: '/gallery/death-ball.png', text: 'Death Ball' },
  { image: '/gallery/retro-tower-defense.png', text: 'Retro Tower Defense' },
  { image: '/gallery/silly-defense.png', text: 'Silly Defense' },
  { image: '/gallery/slayers-2.png', text: 'Slayers 2' },
  { image: '/gallery/tower-defense-x.png', text: 'Tower Defense X' },
  { image: '/gallery/violence-district.png', text: 'Violence District' }
];

const scripts = [
  {
    key: 'death-ball',
    label: 'Death Ball',
    image: '/gallery/death-ball.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/c12d7a4a94f0d10c27f21ff462e781d5.lua"))()'
  },
  {
    key: 'retro-tower-defense',
    label: 'Retro Tower Defense',
    image: '/gallery/retro-tower-defense.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/3c8cbc7e049bf4f49bac804b6d20b337.lua"))()'
  },
  {
    key: 'silly-defense',
    label: 'Silly Defense',
    image: '/gallery/silly-defense.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/2c7eb16a08c32a940d6df4fedceae130.lua"))()'
  },
  {
    key: 'slayers-2',
    label: 'Slayers 2',
    image: '/gallery/slayers-2.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/15d48ff2a0df2a1e43a7e0a717bae92a.lua"))()'
  },
  {
    key: 'tower-defense-x',
    label: 'Tower Defense X',
    image: '/gallery/tower-defense-x.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/5ca685865a7af9226b5e9fef98ae47a7.lua"))()'
  },
  {
    key: 'violence-district',
    label: 'Violence District',
    image: '/gallery/violence-district.png',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/b64eaf788b0c15c54c17ee96a133bc7a.lua"))()'
  }
];

const scriptMenuItems = [
  {
    label: 'Scripts',
    children: scripts.map(item => ({
      value: item.key,
      label: item.label
    }))
  }
];

function LuaCode({ code, selected }) {
  const match = code.match(
    /^loadstring\(game:HttpGet\("([^"]+)"\)\)\(\)$/
  );

  if (!match) {
    return (
      <code className={`lua-code${selected ? ' is-selected' : ''}`}>
        {code}
      </code>
    );
  }

  const url = match[1];

  return (
    <code className={`lua-code${selected ? ' is-selected' : ''}`}>
      <span className="lua-fn">loadstring</span>
      <span className="lua-paren">(</span>
      <span className="lua-global">game</span>
      <span className="lua-operator">:</span>
      <span className="lua-method">HttpGet</span>
      <span className="lua-paren">(</span>
      <span className="lua-string">"{url}"</span>
      <span className="lua-paren">))()</span>
    </code>
  );
}

export default function HomePage() {
  const topRef = useRef(null);
  const galleryRef = useRef(null);
  const menuRef = useRef(null);
  const copiedTimerRef = useRef(0);

  const [selectedScript, setSelectedScript] = useState('death-ball');
  const [copiedScript, setCopiedScript] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  const selectScript = value => {
    setSelectedScript(value);
  };

  const copyScript = async (key, text) => {
    clearTimeout(copiedTimerRef.current);

    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {}

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        copied = document.execCommand('copy');
        textarea.remove();
      } catch {
        copied = false;
      }
    }

    if (!copied) return;

    setCopiedScript(key);
    setToastOpen(true);
    setToastKey(previous => previous + 1);

    copiedTimerRef.current = window.setTimeout(() => {
      setCopiedScript('');
    }, 3000);
  };

  useEffect(
    () => () => {
      clearTimeout(copiedTimerRef.current);
    },
    []
  );

  useEffect(() => {
    let animating = false;
    let transitionRaf = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchAxis = null;
    let touchHandled = false;

    const getSections = () =>
      [topRef.current, galleryRef.current, menuRef.current].filter(Boolean);

    const finishTransition = () => {
      animating = false;
      transitionRaf = 0;
      document.documentElement.classList.remove('is-section-animating');
    };

    const easeInOutQuint = t =>
      t < 0.5
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2;

    const moveTo = section => {
      if (!section || animating) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const startY = window.scrollY;
      const targetY =
        startY + section.getBoundingClientRect().top;
      const distance = targetY - startY;

      if (Math.abs(distance) < 2) return;

      if (reduceMotion) {
        window.scrollTo(0, targetY);
        return;
      }

      animating = true;
      document.documentElement.classList.add('is-section-animating');

      const duration = Math.min(
        680,
        Math.max(500, 480 + Math.abs(distance) * 0.08)
      );
      const startedAt = performance.now();

      const frame = now => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = easeInOutQuint(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          transitionRaf = requestAnimationFrame(frame);
        } else {
          window.scrollTo(0, targetY);
          finishTransition();
        }
      };

      transitionRaf = requestAnimationFrame(frame);
    };

    const getCurrentIndex = sections => {
      let closestIndex = 0;
      let closestDistance = Infinity;

      sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const moveByDirection = direction => {
      const sections = getSections();
      if (sections.length !== 3 || animating) return;

      const currentIndex = getCurrentIndex(sections);
      const nextIndex = Math.max(
        0,
        Math.min(sections.length - 1, currentIndex + direction)
      );

      if (nextIndex !== currentIndex) {
        moveTo(sections[nextIndex]);
      }
    };

    const onWheel = event => {
      const verticalIntent =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX);

      if (!verticalIntent || Math.abs(event.deltaY) < 4) return;

      event.preventDefault();

      if (animating) return;

      moveByDirection(event.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = event => {
      if (event.touches.length !== 1) return;
      if (event.target.closest?.('.swipe-toast')) return;

      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchAxis = null;
      touchHandled = false;
    };

    const onTouchMove = event => {
      if (event.touches.length !== 1 || touchHandled) return;
      if (event.target.closest?.('.swipe-toast')) return;

      const x = event.touches[0].clientX;
      const y = event.touches[0].clientY;
      const dx = x - touchStartX;
      const dy = y - touchStartY;

      if (!touchAxis && Math.max(Math.abs(dx), Math.abs(dy)) >= 7) {
        touchAxis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
      }

      if (touchAxis !== 'y') return;

      // Stop native scrolling as soon as the gesture is known to be vertical.
      // This prevents the small pre-scroll jump before our section animation.
      event.preventDefault();

      if (animating || Math.abs(dy) < 30) return;

      const sections = getSections();
      if (sections.length !== 3) return;

      const currentIndex = getCurrentIndex(sections);
      const direction = dy < 0 ? 1 : -1;
      const nextIndex = Math.max(
        0,
        Math.min(sections.length - 1, currentIndex + direction)
      );

      if (nextIndex === currentIndex) return;

      touchHandled = true;
      moveTo(sections[nextIndex]);
    };

    const onTouchEnd = () => {
      touchAxis = null;
      touchHandled = false;
    };

    const onKeyDown = event => {
      if (!['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      if (animating) return;

      moveByDirection(
        event.key === 'PageDown' || event.key === 'ArrowDown' ? 1 : -1
      );
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      if (transitionRaf) cancelAnimationFrame(transitionRaf);

      document.documentElement.classList.remove('is-section-animating');
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <main className="page-shell">
      <section ref={topRef} className="top-section">
        <div className="top-background" aria-hidden="true">
          <Ferrofluid
            colors={['#ffffff', '#ffffff', '#ffffff']}
            speed={0.35}
            scale={1.05}
            turbulence={0.9}
            fluidity={0.12}
            rimWidth={0.2}
            sharpness={3}
            shimmer={1}
            glow={1.5}
            flowDirection="down"
            opacity={0.42}
          />
        </div>

        <div className="top-stack">
          <div className="mesh-wrap" aria-label="Moon interface preview">
            <ElasticMesh
              image={previewImage}
              showGrid={false}
              borderRadius={28}
              tilt={8}
              shading={0}
              resolution={30}
              interaction="hover"
              enabled={false}
            />
          </div>

          <HeroBrand />
        </div>
      </section>

      <section ref={galleryRef} className="gallery-section">
        <CircularGallery
          items={galleryItems}
          bend={-5}
          borderRadius={0.055}
          scrollSpeed={1}
          scrollEase={0.08}
          textColor="#b9bdc7"
          font="600 20px Arial"
          interactive
        />
      </section>

      <SwipeToast
        key={toastKey}
        title="Script"
        description="Copied!"
        actionLabel="Close"
        open={toastOpen}
        onAction={() => setToastOpen(false)}
        onClose={() => setToastOpen(false)}
        background="#27272a"
        color="#f5f5f5"
        fuseColor="#10b981"
        width={356}
        radius={12}
        slideMs={400}
        settleBounce={0.2}
        swipeDistance={40}
        duration={4000}
        fuse="bottom"
        pauseOnHover
        closeButton={false}
        inline={false}
        dismissible
      />

      <section ref={menuRef} className="menu-section">
        <div className="menu-shell">
          <BranchedMenu
            items={scriptMenuItems}
            defaultOpen={0}
            defaultActive="death-ball"
            onSelect={selectScript}
            color="#ffffff"
            accentColor="#7979ff"
            lineColor="#7979ff"
            width={240}
            rowHeight={32}
            indent={40}
            trunk={14}
            radius={10}
            lineWidth={1.5}
            fontSize={14}
            drawDuration={400}
            foldDuration={300}
          />
        </div>

        <div className="scripts-layout">
          <div className="scripts-list">
            {scripts.map(item => {
              const isSelected = item.key === selectedScript;
              const isCopied = item.key === copiedScript;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`script-row${isSelected ? ' is-selected' : ''}${
                    isCopied ? ' is-copied' : ''
                  }`}
                  onClick={() => copyScript(item.key, item.code)}
                  aria-label={`Copy ${item.label} loadstring`}
                >
                  <span className="script-row__loader" aria-hidden="true">
                    <LatticeLoader
                      status={isCopied ? 'done' : 'working'}
                      label=""
                      doneLabel=""
                      errorLabel=""
                      pattern="orbit"
                      grid={4}
                      shape="round"
                      color="#7979ff"
                      doneColor="#22c55e"
                      errorColor="#ef4444"
                      cellSize={6}
                      gap={2}
                      fontSize={14}
                      step={75}
                      idleOpacity={0.15}
                      glow
                      glowColor="#7979ff"
                      showLabel={false}
                    />
                  </span>

                  <span className="script-row__code">
                    <LuaCode code={item.code} selected={isSelected} />
                  </span>

                  <span
                    className={`script-row__image-frame${
                      isSelected ? ' is-selected' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="script-row__image"
                      draggable="false"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
