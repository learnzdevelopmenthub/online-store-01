import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="rounded-box bg-base-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Catalogue management</h2>
        <p className="mt-2 max-w-2xl text-base-content/70">
          Add PDF books, upload cover assets, publish releases, and manage bulk catalogue actions.
        </p>
        <Link to="/books" className="btn btn-primary mt-4">
          Manage Books
        </Link>
      </div>
    </section>
  );
}
