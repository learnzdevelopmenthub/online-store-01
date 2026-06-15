import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-base-100">
      <h1 className="text-3xl font-bold">Buyer App</h1>
      <nav className="flex gap-3">
        <Link to="/login" className="btn btn-primary">
          Log in
        </Link>
        <Link to="/register" className="btn btn-ghost">
          Register
        </Link>
        <Link to="/profile" className="btn btn-ghost">
          Profile
        </Link>
      </nav>
    </main>
  );
}
