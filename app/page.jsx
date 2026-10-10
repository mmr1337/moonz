import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import HeroBrand from '../components/HeroBrand/HeroBrand';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="top-section" aria-label="moon">
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
          <HeroBrand />
        </div>
      </section>
    </main>
  );
}
