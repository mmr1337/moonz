'use client';

import { useEffect, useRef } from 'react';
import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';
import HeroBrand from '../components/HeroBrand/HeroBrand';
import BranchedMenu from '../components/BranchedMenu/BranchedMenu';

const previewImage = '/preview.png';

const galleryItems = [
  { image: '/gallery/death-ball.png', text: 'Death Ball' },
  { image: '/gallery/retro-tower-defense.png', text: 'Retro Tower Defense' },
  { image: '/gallery/silly-defense.png', text: 'Silly Defense' },
  { image: '/gallery/slayers-2.png', text: 'Slayers 2' },
  { image: '/gallery/tower-defense-x.png', text: 'Tower Defense X' },
  { image: '/gallery/violence-district.png', text: 'Violence District' }
];

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

export default function HomePage() {
  const topRef = useRef(null);
  const galleryRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    let animating = false;
    let unlockTimer = 0;
    let scrollEndHandler = null;

    const getSections = () =>
      [
        topRef.current,
        galleryRef.current,
        menuRef.current
      ].filter(Boolean);

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
        const distance = Math.abs(
          section.getBoundingClientRect().top
        );

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
          <div
            className="mesh-wrap"
            aria-label="Moon interface preview"
          >
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
      </section>
    </main>
  );
}
