import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Scale, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon-box">
            <Scale size={19} />
          </div>
          <span>TeamLedger</span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <Link to="/groups/new" className="btn btn-sm btn-primary">
            <Plus size={15} />
            <span>Create Group</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
