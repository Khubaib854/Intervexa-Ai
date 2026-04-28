import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ toggleDarkMode }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="container mt-4 mb-4 sticky-top">
      <nav className="navbar navbar-expand-lg glass rounded-4 shadow-lg border border-white border-opacity-10 px-3 px-lg-4">
        <div className="container-fluid px-0">
          <Link
            className="navbar-brand fw-bold fs-3 text-gradient d-flex align-items-center gap-3"
            to="/"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <div className="p-1 rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
              <img src="/intervexa-icon.png" alt="Intervexa AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="ls-tight">Intervexa AI</span>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center gap-4 py-2 py-lg-0">
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/') ? 'active' : ''}`} to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/setup') ? 'active' : ''}`} to="/setup">Start Interview</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/autopsy') ? 'active' : ''}`} to="/autopsy">Interview Autopsy</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/history') ? 'active' : ''}`} to="/history">History</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/about') ? 'active' : ''}`} to="/about">About</Link>
              </li>

              <li className="nav-item ms-lg-2">
                <button
                  onClick={toggleDarkMode}
                  className="btn glass hover-elevate rounded-circle p-0 d-flex align-items-center justify-content-center border-0"
                  style={{ width: '42px', height: '42px' }}
                  aria-label="Toggle Dark Mode"
                >
                  <i className="bi bi-brightness-high-fill text-warning dark-hide fs-5"></i>
                  <i className="bi bi-moon-stars-fill text-info light-hide fs-5"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style>{`
        .ls-tight { letter-spacing: -0.025em; }
        [data-theme='dark'] .light-hide { display: block; }
        [data-theme='dark'] .dark-hide { display: none; }
        [data-theme='light'] .light-hide { display: none; }
        [data-theme='light'] .dark-hide { display: block; }
      `}</style>

    </div>

  )
}
