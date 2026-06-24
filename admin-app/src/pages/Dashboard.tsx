import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <section className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Store Admin</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="panel admin-hero-panel">
        <p className="eyebrow">Catalogue management</p>
        <h2>Add, publish, and manage every PDF book in one place.</h2>
        <p className="muted">
          Upload cover assets, attach private PDF files, publish releases, and run bulk catalogue
          actions from the admin workspace.
        </p>
        <div className="row" style={{ marginTop: 'var(--sp-6)' }}>
          <Link to="/books" className="btn btn-primary">
            Manage Books
          </Link>
        </div>
      </div>
    </section>
  );
}
