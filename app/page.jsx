'use client';

import { useEffect, useRef, useState } from 'react';
import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';
import HeroBrand from '../components/HeroBrand/HeroBrand';
import BranchedMenu from '../components/BranchedMenu/BranchedMenu';
import LatticeLoader from '../components/LatticeLoader/LatticeLoader';

const previewImage = '/preview.png';

const galleryItems = [
  { image: '/gallery/death-ball.png', text: 'Death Ball' },
  { image: '/gallery/retro-tower-defense.png', text: 'Retro Tower Defense' },
  { image: '/gallery/silly-defense.png', text: 'Silly Defense' },
  { image: '/gallery/slayers-2.png', text: 'Slayers 2' },
  { image: '/gallery/tower-defense-x.png', text: 'Tower Defense X' },
  { image: '/gallery/violence-district.png', text: 'Violence District' }
];

const scripts = {
  'death-ball': {
    label: 'Death Ball',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/c12d7a4a94f0d10c27f21ff462e781d5.lua"))()'
  },
  'slayers-2': {
    label: 'Slayer 2',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/15d48ff2a0df2a1e43a7e0a717bae92a.lua"))()'
  },
  'violence-district': {
    label: 'Violence District',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/b64eaf788b0c15c54c17ee96a133bc7a.lua"))()'
  },
  'tower-defense-x': {
    label: 'Tower Defense X',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/5ca685865a7af9226b5e9fef98ae47a7.lua"))()'
  },
  'silly-defense': {
    label: 'Silly Defense',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/2c7eb16a08c32a940d6df4fedceae130.lua"))()'
  },
  'retro-tower-defense': {
    label: 'Retro Tower Defense',
    code: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/3c8cbc7e049bf4f49bac804b6d20b337.lua"))()'
  }
};

const scriptImageMap = {
  'death-ball': '/gallery/death-ball.png',
  'retro-tower-defense': '/gallery/retro-tower-defense.png',
  'silly-defense': '/gallery/silly-defense.png',
  'slayers-2': '/gallery/slayers-2.png',
  'tower-defense-x': '/gallery/tower-defense-x.png',
  'violence-district': '/gallery/violence-district.png'
};

const scriptEntries = Object.entries(scripts);

const scriptMenuItems = [
  {
    label: 'Scripts',
    children: [
      { value: 'death-ball', label: 'Death Ball' },
      { value: 'retro-tower-defense', label: 'Retro Tower Defense' },
      { value: 'silly-defense', label: 'Silly Defense' },
      { value: 'slayers-2', label: 'Slayers 2' },
      { value: 'tower-defense-x', label: 'Tower Defense X' },
      { value: 'violence-district', label: 'Violence District' }
    ]
  }
];

function LuaCode({ code, highlighted }) {
  if (!highlighted) {
    return <code className="lua-code lua-code--plain">{code}</code>;
  }

  const match = code.match(/^loadstring\\(game:HttpGet\\("(.+)"\\)\\)\\(\\)$/);

  if (!match) {
    return <code className="lua-code">{code}</code>;
  }

  const url = match[1];

  return (
    <code className="lua-code">
      <span className="lua-fn">loadstring</span>
      <span className="lua-punc">(</span>
      <span className="lua-global">game</span>
      <span className="lua-punc">:</span>
      <span className="lua-method">HttpGet</span>
      <span className="lua-punc">(</span>
      <span className="lua-string">"{url}"</span>
      <span className="lua-punc">))()</span>
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

  const selected = scripts[selectedScript];

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
    let unlockTimer = 0;
    let scrollEndHandler = null;

    const getSections = () =>
      [topRef.current, galleryRef.current, menuRef.current].filter(Boolean);

    const finishTransition = () => {
      if (!animating) return;

      animating = false;
      document.documentElement.classList.remove('is-section-animating');
      clearTimeout(unlockTimer);

      if (scrollEndHandler) {
        window.removeEventListener('scrollend', scrollEndHandler);
        scrollEndHandler = null;
      }
    };

    const moveTo = section => {
      if (!section || animating) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      animating = true;
      document.documentElement.classList.add('is-section-animating');

      section.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      if (reduceMotion) {
        finishTransition();
        return;
      }

      if ('onscrollend' in window) {
        scrollEndHandler = finishTransition;
        window.addEventListener('scrollend', scrollEndHandler, {
          once: true
        });
      }

      unlockTimer = window.setTimeout(finishTransition, 950);
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

    const onWheel = event => {
      const verticalIntent =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX);

      if (!verticalIntent || Math.abs(event.deltaY) < 3) return;

      const sections = getSections();
      if (sections.length !== 3) return;

      if (animating) {
        event.preventDefault();
        return;
      }

      const currentIndex = getCurrentIndex(sections);
      const nextIndex =
        event.deltaY > 0
          ? Math.min(sections.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      moveTo(sections[nextIndex]);
    };

    const onKeyDown = event => {
      if (!['PageDown', 'PageUp'].includes(event.key)) return;

      const sections = getSections();
      if (sections.length !== 3) return;

      if (animating) {
        event.preventDefault();
        return;
      }

      const currentIndex = getCurrentIndex(sections);
      const nextIndex =
        event.key === 'PageDown'
          ? Math.min(sections.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      moveTo(sections[nextIndex]);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(unlockTimer);

      if (scrollEndHandler) {
        window.removeEventListener('scrollend', scrollEndHandler);
      }

      document.documentElement.classList.remove('is-section-animating');
      window.removeEventListener('wheel', onWheel);
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
            {scriptEntries.map(([key, item]) => {
              const isSelected = key === selectedScript;
              const isCopied = key === copiedScript;

              return (
                <button
                  key={key}
                  type="button"
                  className={`script-row${isSelected ? ' is-selected' : ''}${
                    isCopied ? ' is-copied' : ''
                  }`}
                  onClick={() => copyScript(key, item.code)}
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

                  <span className="script-row__content">
                    <span className="script-row__meta">
                      <span className="script-row__name">{item.label}</span>
                      <span
                        className={`script-row__status${
                          isCopied ? ' is-visible' : ''
                        }`}
                      >
                        Copied!
                      </span>
                    </span>

                    <LuaCode code={item.code} highlighted={isSelected} />
                  </span>

                  <span
                    className={`script-row__image-frame${
                      isSelected ? ' is-selected' : ''
                    }`}
                    aria-hidden="true"
                  >
                    <img
                      src={scriptImageMap[key]}
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
