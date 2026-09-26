import ElasticMesh from '../components/ElasticMesh/ElasticMesh';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="mesh-wrap" aria-label="Интерактивная эластичная сетка">
        <ElasticMesh
          color1="#111827"
          color2="#4F46E5"
          gridColor="#FFFFFF"
          gridOpacity={0.22}
          gridDensity={18}
          borderRadius={28}
          tilt={12}
          shading={0.85}
          interaction="hover"
        />
      </div>
    </main>
  );
}
