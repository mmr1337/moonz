'use client';

import { useEffect, useRef } from 'react';
import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';
import HeroBrand from '../components/HeroBrand/HeroBrand';

const previewImage = '/preview.png';

const galleryItems = [
  { image: '/gallery/death-ball.png', text: 'Death Ball' },
  { image: '/gallery/retro-tower-defense.png', text: 'Retro Tower Defense' },
  { image: '/gallery/silly-defense.png', text: 'Silly Defense' },
  { image: '/gallery/slayers-2.png', text: 'Slayers 2' },
  { image: '/gallery/tower-defense-x.png', text: 'Tower Defense X' },
  { image: '/gallery/violence-district.png', text: 'Violence District' }
];

const easeInOutQuint = t =>
  t < 0.5
    ? 16 * t * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 5) / 2;

export default function HomePage() {
  const topRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    let animating = false;
    let raf = 0;

    const getSections = () =>
      [topRef.current, galleryRef.current].filter(Boolean);

    const animateTo = targetY => {
      if (animating) return;

      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (reduceMotion) {
        window.scrollTo(0, targetY);
        return;
      }

      animating = true;
      document.documentElement.classList.add('is-section-animating');

      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 720;
      const startTime = performance.now();

      const frame = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = easeInOutQuint(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          raf = requestAnimationFrame(frame);
          return;
        }

        window.scrollTo(0, targetY);
        document.documentElement.classList.remove('is-section-animating');
        animating = false;
      };

      raf = requestAnimationFrame(frame);
    };

    const onWheel = event => {
      const verticalIntent =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX);

      if (!verticalIntent || Math.abs(event.deltaY) < 3) return;

      const sections = getSections();
      if (sections.length !== 2) return;

      if (animating) {
        event.preventDefault();
        return;
      }

      const viewport = window.innerHeight || 1;
      const currentIndex =
        Math.abs(window.scrollY - sections[1].offsetTop) <
        viewport * 0.5
          ? 1
          : 0;

      const nextIndex =
        event.deltaY > 0
          ? Math.min(1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      animateTo(sections[nextIndex].offsetTop);
    };

    const onKeyDown = event => {
      if (
        !['PageDown', 'PageUp'].includes(event.key) ||
        animating
      ) {
        return;
      }

      const sections = getSections();
      if (sections.length !== 2) return;

      const viewport = window.innerHeight || 1;
      const currentIndex =
        Math.abs(window.scrollY - sections[1].offsetTop) <
        viewport * 0.5
          ? 1
          : 0;

      const nextIndex =
        event.key === 'PageDown'
          ? Math.min(1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);

      if (nextIndex === currentIndex) return;

      event.preventDefault();
      animateTo(sections[nextIndex].offsetTop);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
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
        />
      </section>
    </main>
  );
}
