import ElasticMesh from '../components/ElasticMesh/ElasticMesh';
import Ferrofluid from '../components/Ferrofluid/Ferrofluid';
import CircularGallery from '../components/CircularGallery/CircularGallery';

const previewImage = '/preview.png';

const galleryItems = [
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Death%20Ball.png',
    text: 'Death Ball'
  },
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Retro%20Tower%20Defense.png',
    text: 'Retro Tower Defense'
  },
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Silly%20Defense.png',
    text: 'Silly Defense'
  },
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Slayers%202.png',
    text: 'Slayers 2'
  },
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Tower%20Defense%20X.png',
    text: 'Tower Defense X'
  },
  {
    image:
      'https://raw.githubusercontent.com/mmr1337/moonz/main/image/Violence%20District.png',
    text: 'Violence District'
  }
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
          scrollEase={0.12}
        />
      </section>
    </main>
  );
}
