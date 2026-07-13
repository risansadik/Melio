import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `font-medium transition-colors ${isActive ? 'text-clay-600' : 'text-pantry-800 hover:text-clay-600'}`;

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-pantry-700/10 bg-pantry-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-semibold text-pantry-900">
          Melio.
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" end className={navLinkClasses}>
            Search
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/saved" className={navLinkClasses}>
              Saved Recipes
            </NavLink>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-pantry-700">Hi, {user?.name.split(' ')[0]}</span>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-card border border-pantry-700/20 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-pantry-900" />
            <span className="block h-0.5 w-5 bg-pantry-900" />
            <span className="block h-0.5 w-5 bg-pantry-900" />
          </div>
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-pantry-700/10 px-4 py-4 sm:hidden">
          <NavLink to="/" end className={navLinkClasses} onClick={() => setMenuOpen(false)}>
            Search
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/saved" className={navLinkClasses} onClick={() => setMenuOpen(false)}>
              Saved Recipes
            </NavLink>
          )}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="btn-secondary w-full">
              Log out
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary flex-1" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/register" className="btn-primary flex-1" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
