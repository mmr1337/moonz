import ElasticMesh from '../components/ElasticMesh/ElasticMesh';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="info-card">
        <header className="card-copy">
          <span className="eyebrow">MOON</span>
          <h1>Информационная карточка</h1>
          <p>
            Здесь будет собрана основная информация. Пока добавлен первый
            интерактивный элемент — эластичная WebGL-сетка.
          </p>
        </header>

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

        <div className="card-footer">
          <span>Interactive element 01</span>
          <span>Проведи курсором по поверхности</span>
        </div>
      </section>
    </main>
  );
}
