import ElasticMesh from '../components/ElasticMesh/ElasticMesh';

const previewImage =
  'https://raw.githubusercontent.com/mmr1337/moonz/main/image/preview.png';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mesh-wrap" aria-label="Moon interface preview">
        <ElasticMesh
          image={previewImage}
          showGrid={false}
          borderRadius={28}
          tilt={8}
          shading={0.35}
          interaction="hover"
        />
      </div>
    </main>
  );
}
