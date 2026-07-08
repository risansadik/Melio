import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex flex-col items-center gap-4 py-20 text-center">
    <h1 className="text-3xl font-semibold text-pantry-900">Page not found</h1>
    <p className="text-pantry-700">The page you&apos;re looking for doesn&apos;t exist.</p>
    <Link to="/" className="btn-primary">
      Back to search
    </Link>
  </div>
);
