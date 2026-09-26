import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';

const previewImage = '/preview.png';

const galleryItems = [
  { image: '/gallery/death-ball.png', text: 'Death Ball' },
  { image: '/gallery/retro-tower-defense.png', text: 'Retro Tower Defense' },
  { image: '/gallery/silly-defense.png', text: 'Silly Defense' },
  { image: '/gallery/slayers-2.png', text: 'Slayers 2' },
  { image: '/gallery/tower-defense-x.png', text: 'Tower Defense X' },
  { image: '/gallery/violence-district.png', text: 'Violence District' }
];

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

      <section className="gallery-section">
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
