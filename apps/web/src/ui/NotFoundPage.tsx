import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="notfound-page">
      <section className="card notfound-card">
        <div className="eyebrow notfound-eyebrow">404</div>
        <h1 className="h1 notfound-heading">This route does not exist.</h1>
        <p className="body notfound-body">
          The requested page is not part of the current application bundle. Use one of the primary
          entry points below.
        </p>
        <div className="notfound-actions">
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
