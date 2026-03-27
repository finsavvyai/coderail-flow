import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background:
          'radial-gradient(circle at top left, rgba(125, 211, 252, 0.18), transparent 32%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.16), transparent 26%), #07111f',
      }}
    >
      <section
        className="card"
        style={{
          width: 'min(560px, 100%)',
          padding: 28,
          textAlign: 'left',
        }}
      >
        <div className="eyebrow" style={{ color: '#7dd3fc', marginBottom: 12 }}>
          404
        </div>
        <h1 className="h1" style={{ marginBottom: 12 }}>
          This route does not exist.
        </h1>
        <p className="body" style={{ marginBottom: 24, color: '#a8b3cf' }}>
          The requested page is not part of the current application bundle. Use one of the primary
          entry points below.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link className="btn btn-primary" to="/">
            Landing Page
          </Link>
          <Link className="btn" to="/app">
            Open App
          </Link>
        </div>
      </section>
    </main>
  );
}
