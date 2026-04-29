import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ toggleDarkMode }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const toggleNavbar = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="container mt-4 mb-4 sticky-top">
      <nav className="navbar navbar-expand-lg glass rounded-4 shadow-lg border border-white border-opacity-10 px-3 px-lg-4">
        
        {/* Mobile Backdrop inside nav to share stacking context with the menu */}
        <div 
          className={`mobile-backdrop d-lg-none ${isOpen ? 'show' : ''}`} 
          onClick={closeNavbar}
        ></div>

        <div className="container-fluid px-0">
          <Link
            className="navbar-brand fw-bold fs-3 text-gradient d-flex align-items-center gap-3"
            to="/"
            style={{ fontFamily: 'Outfit, sans-serif' }}
            onClick={closeNavbar}
          >
            <div className="p-1 rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', overflow: 'hidden' }}>
              <img src="/intervexa-icon.png" alt="Intervexa AI Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span className="ls-tight">Intervexa AI</span>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none position-relative"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarNav"
            aria-expanded={isOpen}
            aria-label="Toggle navigation"
            style={{ zIndex: 1050 }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse mobile-menu ${isOpen ? 'show' : ''}`} id="navbarNav">
            
            <div className="d-lg-none w-100 d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-white border-opacity-10">
              <span className="fw-bold fs-4 text-gradient" style={{ fontFamily: 'Outfit, sans-serif' }}>Menu</span>
              <button 
                className="btn btn-link text-decoration-none p-0 text-body" 
                onClick={closeNavbar}
                aria-label="Close menu"
              >
                <i className="bi bi-x-lg fs-3"></i>
              </button>
            </div>

            <ul className="navbar-nav ms-auto align-items-lg-center align-items-start gap-4 gap-lg-4 py-2 py-lg-0 w-100">
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/') ? 'active' : ''}`} to="/" onClick={closeNavbar}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/setup') ? 'active' : ''}`} to="/setup" onClick={closeNavbar}>Start Interview</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/autopsy') ? 'active' : ''}`} to="/autopsy" onClick={closeNavbar}>Interview Autopsy</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/history') ? 'active' : ''}`} to="/history" onClick={closeNavbar}>History</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link-custom ${isActive('/about') ? 'active' : ''}`} to="/about" onClick={closeNavbar}>About</Link>
              </li>

              <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    closeNavbar();
                  }}
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

        @media (max-width: 991px) {
          .mobile-menu {
            position: fixed;
            top: 0;
            left: -300px;
            width: 280px;
            height: 100vh;
            background: #ffffff;
            transition: left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 1055;
            padding: 2rem 1.5rem;
            display: flex !important;
            flex-direction: column;
            border-right: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 5px 0 25px rgba(0,0,0,0.15);
          }
          [data-theme='dark'] .mobile-menu {
            background: #1a1d20;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
          }
          .mobile-menu.show {
            left: 0;
          }
          .mobile-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.6);
            z-index: 1045;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s ease;
          }
          .mobile-backdrop.show {
            opacity: 1;
            visibility: visible;
          }
          .mobile-menu .nav-item {
            width: 100%;
          }
          .mobile-menu .nav-link-custom {
            display: block;
            width: 100%;
            padding: 0.75rem 0;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  )
}
