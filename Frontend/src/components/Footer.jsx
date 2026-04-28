import React from 'react'

export default function Footer() {
  return (
    <footer className="py-5 mt-auto border-top border-white border-opacity-10">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center gap-2 mb-2 justify-content-center justify-content-md-start">
              <i className="bi bi-robot text-primary fs-4"></i>
              <span className="fw-bold fs-5" style={{ fontFamily: 'Outfit, sans-serif' }}>Intervexa AI</span>
            </div>
            <p className="small opacity-50 mb-0">© 2026 AI-Powered Mock Interview Simulator. Empowering candidates worldwide.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex gap-3 justify-content-center justify-content-md-end mb-2">
              <span className="badge glass rounded-pill px-3 py-2 border-white border-opacity-10 fw-normal opacity-75">Built with Gemini AI</span>
              <span className="badge glass rounded-pill px-3 py-2 border-white border-opacity-10 fw-normal opacity-75">Flask</span>
              <span className="badge glass rounded-pill px-3 py-2 border-white border-opacity-10 fw-normal opacity-75">React</span>
            </div>
            <small className="opacity-40">Precision AI Engineering</small>
          </div>
        </div>
      </div>
    </footer>
  )
}
