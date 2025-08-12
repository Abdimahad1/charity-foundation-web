import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/logo.png';

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close with Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link" aria-label="Go to Charity Foundation home">
            <img
              src={logo}
              alt="Charity Foundation logo"
              className="logo-img"
              width={55}
              height={55}
              loading="eager"
              decoding="async"
            />
            <span className="logo-text">
              AL-HAQ<span> Welfare Foundation</span>
            </span>
          </Link>
        </div>

        {/* Right rail: desktop nav + menu button */}
        <div className="right-rail">
          {/* Desktop nav */}
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/donate">Donate</NavLink>
            <NavLink to="/volunteers">Volunteers</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
          </nav>

          {/* Mobile menu button */}
          <button
            className="menu-btn"
            aria-label="Open menu"
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(v => !v)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`backdrop ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Mobile drawer */}
      <nav
        id="mobile-menu"
        className={`mobile-nav ${open ? 'open' : ''}`}
        aria-label="Mobile"
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-inner">
          <Link to="/" className="m-link" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/about" className="m-link" onClick={() => setOpen(false)}>About</Link>
          <Link to="/projects" className="m-link" onClick={() => setOpen(false)}>Projects</Link>
          <Link to="/donate" className="m-link" onClick={() => setOpen(false)}>Donate</Link>
          <Link to="/volunteers" className="m-link" onClick={() => setOpen(false)}>Volunteers</Link>
          <Link to="/contact" className="m-link" onClick={() => setOpen(false)}>Contact Us</Link>
        </div>
      </nav>
    </header>
  );
}
