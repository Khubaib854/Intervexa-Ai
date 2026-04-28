import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="py-5 position-relative overflow-hidden">
        <div className="container py-lg-5">
          <div className="row align-items-center min-vh-75 gy-5">
            <div className="col-lg-7">
              <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 fw-semibold px-3 py-2 mb-4 rounded-pill">
                <i className="bi bi-stars me-2"></i>AI-Powered Career Growth
              </div>
              <h1 className="display-3 fw-extrabold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Master Your Interviews with
                <span className="text-gradient d-block">Next-Gen AI Coaching</span>
              </h1>
              <p className="lead opacity-75 mb-5 fs-4">
                Upload your resume, get tailored questions, and practice with real-time AI evaluation.
                Experience a mock interview that feels remarkably real.
              </p>
              <div className="d-flex flex-wrap gap-4">
                <Link to="/setup" className="btn-premium btn-premium-primary text-decoration-none">
                  <i className="bi bi-rocket-takeoff"></i> Launch Practice Session
                </Link>
                <a href="#features" className="btn-premium glass text-decoration-none" style={{ color: 'inherit' }}>
                  Explore Features
                </a>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-visual glass p-2 rounded-5 hover-elevate shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="card border-0 bg-transparent p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className="p-3 rounded-4 bg-primary text-white me-3 shadow-sm">
                      <i className="bi bi-robot fs-3"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Gemini 1.5 Pro</h5>
                      <span className="small opacity-50"><i className="bi bi-circle-fill text-success me-1 small"></i> Evaluating in real-time</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-4 bg-light bg-opacity-10 border border-white border-opacity-10 mb-3">
                    <p className="small mb-0 opacity-75">"Your use of the STAR method was excellent, but let's sharpen your technical depth."</p>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-3 rounded-4 glass text-center">
                        <div className="display-6 fw-bold text-primary mb-0">8.5</div>
                        <small className="opacity-50 text-uppercase fw-bold tiny">Score</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 rounded-4 glass text-center">
                        <div className="display-6 fw-bold text-success mb-0">94%</div>
                        <small className="opacity-50 text-uppercase fw-bold tiny">Confidence</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="position-absolute top-0 end-0 translate-middle-y opacity-10" style={{ zIndex: -1 }}>
          <div className="rounded-circle bg-primary filter-blur" style={{ width: '400px', height: '400px', filter: 'blur(100px)' }}></div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5" id="features">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powering Your Preparation</h2>
            <p className="opacity-75 lead mx-auto" style={{ maxWidth: '600px' }}>
              We've combined advanced LLMs with voice processing to create the ultimate interview simulator.
            </p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-file-earmark-person', title: 'Resume Targeted', desc: 'AI analyzes your PDF resume to generate questions specific to your background.', color: 'primary' },
              { icon: 'bi-mic-fill', title: 'Voice Interactive', desc: 'Natural speech-to-text allows you to speak your answers naturally.', color: 'secondary' },
              { icon: 'bi-graph-up', title: 'Deep Analytics', desc: 'Get granular feedback on scores, strengths, and specific areas for growth.', color: 'accent' },
              { icon: 'bi-shield-lock-fill', title: 'Privacy First', desc: 'Secure processing ensures your interview data remains yours alone.', color: 'dark' }
            ].map((f, i) => (
              <div className="col-md-6 col-lg-3" key={i}>
                <div className="card h-100 glass border-0 rounded-5 p-4 hover-elevate">
                  <div className={`p-3 rounded-4 bg-${f.color} bg-opacity-10 text-${f.color} mb-4 d-inline-block`} style={{ width: 'fit-content' }}>
                    <i className={`bi ${f.icon} fs-4`}></i>
                  </div>
                  <h4 className="fw-bold mb-3">{f.title}</h4>
                  <p className="opacity-75 mb-0 small">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="glass rounded-5 p-5 text-center shadow-lg border-0 overflow-hidden position-relative">
            <div className="row align-items-center justify-content-center g-4 position-relative" style={{ zIndex: 1 }}>
              <div className="col-6 col-md-3">
                <div className="display-4 fw-extrabold text-primary">5+</div>
                <div className="text-uppercase fw-bold opacity-50 small tracking-wider">Dynamic Questions</div>
              </div>
              <div className="col-6 col-md-3 border-start border-white border-opacity-10">
                <div className="display-4 fw-extrabold text-secondary">AI</div>
                <div className="text-uppercase fw-bold opacity-50 small tracking-wider">Powered Feedback</div>
              </div>
              <div className="col-6 col-md-3 border-start border-white border-opacity-10">
                <div className="display-4 fw-extrabold text-accent">100%</div>
                <div className="text-uppercase fw-bold opacity-50 small tracking-wider">Realistic Prep</div>
              </div>
              <div className="col-6 col-md-3 border-start border-white border-opacity-10">
                <div className="display-4 fw-extrabold text-dark">∞</div>
                <div className="text-uppercase fw-bold opacity-50 small tracking-wider">Possibilities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .tiny { font-size: 0.65rem; }
        .fw-extrabold { font-weight: 800; }
        .hero-visual {
          transition: var(--transition);
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.1));
        }
      `}</style>
    </div>
  )
}
