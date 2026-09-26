import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';

const previewImage = '/preview.png';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="top-section">
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

        <div className="mesh-wrap" aria-label="Moon interface preview">
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
      </section>

      <section className="below-fold" aria-hidden="true" />
    </main>
  );
}
