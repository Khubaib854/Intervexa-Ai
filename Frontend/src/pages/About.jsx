import React from 'react'

export default function About() {
  return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Hero Section */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-extrabold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              About <span className="text-gradient">Intervexa AI</span>
            </h1>
            <p className="lead opacity-75 mx-auto" style={{ maxWidth: '650px' }}>
              We're on a mission to bridge the gap between preparation and opportunity using state-of-the-art Artificial Intelligence.
            </p>
          </div>

          {/* Mission Card */}
          <div className="glass rounded-5 p-4 p-md-5 mb-5 border-0 shadow-lg position-relative overflow-hidden">
            <div className="position-relative" style={{ zIndex: 1 }}>
              <h3 className="fw-bold mb-4 d-flex align-items-center">
                <span className="p-3 rounded-4 bg-primary bg-opacity-10 me-3">
                  <i className="bi bi-bullseye text-primary fs-3"></i>
                </span>
                Our Mission
              </h3>
              <p className="opacity-75 fs-5" style={{ lineHeight: '1.8' }}>
                Intervexa AI aims to democratize professional coaching. We believe everyone deserves high-quality interview
                practice regardless of their network or budget. By combining advanced LLMs with voice recognition, we create
                a safe, realistic environment for you to fail, learn, and eventually succeed.
              </p>
            </div>
            <div className="position-absolute bottom-0 end-0 opacity-05 translate-middle-x">
              <i className="bi bi-rocket-takeoff" style={{ fontSize: '12rem' }}></i>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="glass rounded-5 p-4 p-md-5 border-0 shadow-sm">
            <h3 className="fw-bold mb-5 d-flex align-items-center">
              <span className="p-3 rounded-4 bg-secondary bg-opacity-10 me-3">
                <i className="bi bi-stack text-secondary fs-3"></i>
              </span>
              The Technology
            </h3>

            <div className="row g-4">
              {[
                { icon: 'bi-server', title: 'Flask Backend', desc: 'Secure Python framework handling AI orchestration and session logic.', color: 'primary' },
                { icon: 'bi-robot', title: 'Gemini AI', desc: 'Google\'s most capable models (Gemini Pro) power the interview logic.', color: 'success' },
                { icon: 'bi-volume-up-fill', title: 'Synthetic Voice', desc: 'High-fidelity text-to-speech for immersive question delivery.', color: 'warning' },
                { icon: 'bi-code-square', title: 'React Frontend', desc: 'Modern, responsive interface built for speed and accessibility.', color: 'info' }
              ].map((tech, i) => (
                <div className="col-md-6" key={i}>
                  <div className="d-flex align-items-start gap-3 p-3 rounded-4 glass border-white border-opacity-10 h-100">
                    <div className={`p-3 rounded-pill bg-${tech.color} bg-opacity-10 text-${tech.color}`}>
                      <i className={`bi ${tech.icon} fs-4`}></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">{tech.title}</h6>
                      <small className="opacity-50">{tech.desc}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fw-extrabold { font-weight: 800; }
        .opacity-05 { opacity: 0.05; }
      `}</style>
    </div>
  )
}
