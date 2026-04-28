import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory()
      setHistory(data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return
    await api.clearHistory()
    setHistory([])
    setSelectedSession(null)
  }

  const getGradeColor = (grade) => {
    const colors = { A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }
    return colors[grade] || 'primary'
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'success'
    if (score >= 6) return 'info'
    if (score >= 4) return 'warning'
    return 'danger'
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3 opacity-50">Loading your history...</p>
      </div>
    )
  }

  // ── Detailed Session View ──────────────────────────────────────────────────
  if (selectedSession) {
    const s = selectedSession
    return (
      <div className="container py-5 animate-fade-in">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            {/* Back button */}
            <button
              className="btn-premium glass border-white border-opacity-10 mb-4"
              style={{ color: 'inherit' }}
              onClick={() => setSelectedSession(null)}
            >
              <i className="bi bi-arrow-left me-2"></i> Back to History
            </button>

            {/* Header */}
            <div className="glass rounded-5 p-5 mb-4 border-0 shadow-lg position-relative overflow-hidden">
              <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
                <div className="col-md-7">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>
                      {s.difficulty}
                    </span>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-10 rounded-pill px-3 py-2" style={{ fontSize: '0.65rem' }}>
                      <i className="bi bi-calendar3 me-1"></i>{s.date}
                    </span>
                  </div>
                  <h2 className="fw-extrabold mb-2">{s.job_description}</h2>
                  <p className="opacity-50 mb-0 small">
                    {s.questions_answered} answered · {s.questions_skipped} skipped · {s.total_questions} total
                  </p>
                </div>
                <div className="col-md-5 text-center">
                  <div className="d-inline-flex flex-column align-items-center p-4 rounded-pill glass border-4 border-primary">
                    <span className={`display-2 fw-extrabold text-${getGradeColor(s.overall_grade)}`}>
                      {s.overall_score}
                    </span>
                    <span className="opacity-50 fw-bold text-uppercase tiny">Score / 10</span>
                  </div>
                  <div className={`badge bg-${getGradeColor(s.overall_grade)} bg-opacity-10 text-${getGradeColor(s.overall_grade)} rounded-pill px-3 py-2 fw-bold mt-3 d-block`}>
                    Grade {s.overall_grade}
                  </div>
                </div>
              </div>
              <div className="position-absolute top-0 end-0 opacity-5">
                <i className="bi bi-journal-text" style={{ fontSize: '15rem' }}></i>
              </div>
            </div>

            {/* Hire Recommendation */}
            {s.hire_recommendation && (
              <div className="glass rounded-5 p-4 mb-4 border-0">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-person-check-fill fs-3"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Hiring Recommendation</h6>
                    <p className="mb-0 opacity-75">{s.hire_recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {s.summary && (
              <div className="glass rounded-5 p-4 p-md-5 mb-4 border-0">
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-card-text text-primary me-2"></i> Session Summary
                </h5>
                <p className="opacity-75 mb-0" style={{ lineHeight: '1.8' }}>{s.summary}</p>
              </div>
            )}

            {/* Individual Q&A */}
            {s.evaluations && s.evaluations.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-chat-square-text text-primary me-2"></i>
                  Question-by-Question Breakdown
                </h5>
                <div className="d-flex flex-column gap-4">
                  {s.evaluations.map((ev, idx) => (
                    <div key={idx} className="glass rounded-5 p-4 p-md-5 border-0 shadow-sm">

                      {/* Question header */}
                      <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
                        <div className="flex-grow-1">
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 mb-2 small">
                            Question {idx + 1}
                          </span>
                          <h6 className="fw-bold mb-0">{ev.question}</h6>
                        </div>
                        <div className="text-center flex-shrink-0">
                          {ev.skipped ? (
                            <span className="badge bg-secondary bg-opacity-20 text-secondary px-3 py-2 rounded-pill">
                              Skipped
                            </span>
                          ) : (
                            <div className={`d-inline-flex flex-column align-items-center p-2 rounded-4 bg-${getScoreColor(ev.score)} bg-opacity-10`}>
                              <span className={`fw-extrabold fs-4 text-${getScoreColor(ev.score)}`}>{ev.score}</span>
                              <span className="opacity-50 tiny">/10</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Candidate answer */}
                      {!ev.skipped && (
                        <div className="p-3 rounded-4 glass border-white border-opacity-10 mb-4">
                          <p className="small opacity-50 fw-bold mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-person-fill me-1"></i> Your Answer
                          </p>
                          <p className="mb-0 small opacity-75" style={{ lineHeight: '1.7' }}>{ev.answer}</p>
                        </div>
                      )}

                      {/* Feedback grid */}
                      {!ev.skipped && (
                        <div className="row g-3">
                          {ev.strengths && ev.strengths !== 'N/A' && (
                            <div className="col-md-4">
                              <div className="p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-10 h-100">
                                <p className="small fw-bold text-success mb-2">
                                  <i className="bi bi-shield-check me-1"></i> Strengths
                                </p>
                                <p className="small mb-0 opacity-75">{ev.strengths}</p>
                              </div>
                            </div>
                          )}
                          {ev.weak_points && ev.weak_points !== 'N/A' && (
                            <div className="col-md-4">
                              <div className="p-3 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-10 h-100">
                                <p className="small fw-bold text-danger mb-2">
                                  <i className="bi bi-lightning-charge me-1"></i> Weak Points
                                </p>
                                <p className="small mb-0 opacity-75">{ev.weak_points}</p>
                              </div>
                            </div>
                          )}
                          {ev.improvement && ev.improvement !== 'N/A' && (
                            <div className="col-md-4">
                              <div className="p-3 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-10 h-100">
                                <p className="small fw-bold text-info mb-2">
                                  <i className="bi bi-graph-up-arrow me-1"></i> Improvement
                                </p>
                                <p className="small mb-0 opacity-75">{ev.improvement}</p>
                              </div>
                            </div>
                          )}
                          {ev.feedback && (
                            <div className="col-12">
                              <div className="p-3 rounded-4 glass border-white border-opacity-10">
                                <p className="small fw-bold opacity-50 mb-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                                  <i className="bi bi-chat-left-quote me-1"></i> AI Feedback
                                </p>
                                <p className="small mb-0 opacity-75">{ev.feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
              <button
                className="btn-premium glass border-white border-opacity-10"
                style={{ color: 'inherit' }}
                onClick={() => setSelectedSession(null)}
              >
                <i className="bi bi-arrow-left me-2"></i> Back to History
              </button>
              <Link to="/setup" className="btn-premium btn-premium-primary text-decoration-none">
                <i className="bi bi-arrow-clockwise me-2"></i> New Session
              </Link>
            </div>

          </div>
        </div>

        <style>{`
          .fw-extrabold { font-weight: 800; }
          .tiny { font-size: 0.65rem; }
        `}</style>
      </div>
    )
  }

  // ── History List View ──────────────────────────────────────────────────────
  return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">

          <div className="d-flex align-items-center justify-content-between mb-5">
            <h2 className="display-6 fw-bold mb-0" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Interview <span className="text-gradient">History</span>
            </h2>
            <div className="d-flex gap-2">
              {history.length > 0 && (
                <button
                  className="btn-premium glass border-white border-opacity-10 py-2 px-3 small"
                  style={{ color: 'inherit' }}
                  onClick={handleClearHistory}
                >
                  <i className="bi bi-trash me-1"></i> Clear
                </button>
              )}
              <Link to="/setup" className="btn-premium btn-premium-primary text-decoration-none py-2 px-4 shadow-sm">
                <i className="bi bi-plus-lg me-2"></i> New Session
              </Link>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="glass rounded-5 p-5 text-center border-0 shadow-sm">
              <div className="p-4 rounded-circle bg-primary bg-opacity-10 d-inline-block mb-4">
                <i className="bi bi-inbox text-primary fs-1"></i>
              </div>
              <h4 className="fw-bold mb-2">No interviews yet</h4>
              <p className="opacity-50 mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                Your mock interview sessions and AI evaluations will appear here.
              </p>
              <Link to="/setup" className="btn-premium btn-premium-primary text-decoration-none">
                <i className="bi bi-play-fill me-1"></i> Begin Your First Interview
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {history.map((entry, idx) => (
                <div
                  key={idx}
                  className="glass rounded-5 p-4 p-md-5 border-0 hover-elevate shadow-sm overflow-hidden position-relative"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSession(entry)}
                >
                  <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
                    <div className="col-md-8">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {entry.difficulty}
                        </span>
                        <span className="opacity-50 small">
                          <i className="bi bi-calendar3 me-2"></i>{entry.date}
                        </span>
                      </div>

                      <h4 className="fw-bold mb-3 line-clamp-1">{entry.job_description}</h4>

                      <div className="d-flex flex-wrap gap-4 opacity-75">
                        <div className="small">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {entry.questions_answered} Questions Answered
                        </div>
                        {entry.questions_skipped > 0 && (
                          <div className="small">
                            <i className="bi bi-dash-circle-fill text-warning me-2"></i>
                            {entry.questions_skipped} Skipped
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 text-center text-md-end border-start border-white border-opacity-10 ps-md-5">
                      <div className="d-inline-flex flex-column align-items-center">
                        <div className={`display-5 fw-extrabold text-${getGradeColor(entry.overall_grade)} mb-0`}>
                          {entry.overall_score}<small className="fs-5 opacity-50">/10</small>
                        </div>
                        <div className={`badge bg-${getGradeColor(entry.overall_grade)} bg-opacity-10 text-${getGradeColor(entry.overall_grade)} rounded-pill px-3 py-1 fw-bold text-uppercase mt-2`} style={{ fontSize: '0.7rem' }}>
                          Grade {entry.overall_grade}
                        </div>
                        <small className="opacity-30 mt-2" style={{ fontSize: '0.65rem' }}>
                          Click to view details <i className="bi bi-arrow-right"></i>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .fw-extrabold { font-weight: 800; }
        .tiny { font-size: 0.65rem; }
      `}</style>
    </div>
  )
}