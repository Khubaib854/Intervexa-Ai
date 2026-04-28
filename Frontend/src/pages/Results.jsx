import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Results() {
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // ✅ Read saved results — do NOT call finishInterview() again
        const data = await api.getResults()
        if (data.evaluation) {
          setEvaluation(data.evaluation)
        } else {
          console.error('No evaluation in response:', data)
          navigate('/setup')
        }
      } catch (err) {
        console.error('Failed to fetch results:', err)
        navigate('/setup')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [navigate])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
        <p className="mt-3 opacity-50">Loading your results...</p>
      </div>
    )
  }

  if (!evaluation) return null

  const getGradeColor = (grade) => {
    const colors = { A: 'success', B: 'info', C: 'warning', D: 'warning', F: 'danger' }
    return colors[grade] || 'primary'
  }

  return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          {/* Hero Header */}
          <div className="glass rounded-5 p-5 mb-4 border-0 position-relative overflow-hidden shadow-lg">
            <div className="row align-items-center g-4 position-relative" style={{ zIndex: 1 }}>
              <div className="col-md-7 text-center text-md-start">
                <div className="badge badge-solid-primary px-3 py-2 rounded-pill mb-3">
                  <i className="bi bi-award-fill me-2"></i>Official Report Generated
                </div>
                <h1 className="display-4 fw-extrabold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Interview <span className="text-gradient">Performance Overview</span>
                </h1>
                <p className="lead opacity-75 mb-0">You've successfully completed the AI assessment. Here is your detailed breakdown.</p>
              </div>
              <div className="col-md-5 text-center">
                <div className="d-inline-flex flex-column align-items-center p-4 rounded-pill glass border-4 border-primary">
                  <span className="display-2 fw-extrabold text-primary mb-0">{evaluation.overall_score}</span>
                  <span className="opacity-50 fw-bold tracking-widest text-uppercase tiny">Final Score / 10</span>
                </div>
              </div>
            </div>
            <div className="position-absolute top-0 end-0 opacity-10 translate-middle-x">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '15rem' }}></i>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Grade Card */}
            <div className="col-md-4">
              <div className="glass rounded-5 p-4 text-center h-100 border-0 hover-elevate">
                <h6 className="text-uppercase tracking-wider opacity-50 fw-bold small mb-3">Overall Grade</h6>
                <div className={`display-1 fw-extrabold text-${getGradeColor(evaluation.overall_grade)} mb-2`}>
                  {evaluation.overall_grade}
                </div>
                <p className="small mb-0 opacity-75">Relative to JD requirements</p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="col-md-8">
              <div className="glass rounded-5 p-4 p-md-5 h-100 border-0">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-card-text text-primary me-2"></i> Executive Summary
                </h5>
                <p className="opacity-75 mb-0" style={{ lineHeight: '1.8' }}>{evaluation.summary}</p>
              </div>
            </div>
          </div>

          {/* Hire Recommendation */}
          <div className="glass rounded-5 p-4 mb-4 border-0 shadow-sm">
            <div className="d-flex flex-wrap align-items-center justify-content-between g-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-person-check-fill fs-3"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Hiring Recommendation</h5>
                  <span className="opacity-50 small">Based on your performance and technical depth</span>
                </div>
              </div>
              <div className="mt-3 mt-md-0">
                <span className="btn-premium btn-premium-primary fs-5 px-4 py-2 pointer-none">
                  {evaluation.hire_recommendation}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Feedback Grid */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <div className="glass rounded-5 p-4 p-md-5 h-100 border-0">
                <h5 className="fw-bold text-success mb-4 d-flex align-items-center">
                  <i className="bi bi-patch-check-fill me-2"></i> Key Strengths
                </h5>
                <div className="d-flex flex-column gap-3">
                  {evaluation.top_strengths?.map((s, i) => (
                    <div key={i} className="d-flex gap-3 align-items-start glass p-3 rounded-4 border-white border-opacity-10">
                      <i className="bi bi-star-fill text-success mt-1"></i>
                      <p className="mb-0 small opacity-75">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="glass rounded-5 p-4 p-md-5 h-100 border-0">
                <h5 className="fw-bold text-warning mb-4 d-flex align-items-center">
                  <i className="bi bi-graph-up-arrow me-2"></i> Growth Areas
                </h5>
                <div className="d-flex flex-column gap-3">
                  {evaluation.areas_to_improve?.map((a, i) => (
                    <div key={i} className="d-flex gap-3 align-items-start glass p-3 rounded-4 border-white border-opacity-10">
                      <i className="bi bi-arrow-right-short text-warning fs-4 mt-n1"></i>
                      <p className="mb-0 small opacity-75">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="glass rounded-5 p-4 p-md-5 mb-5 border-0">
            <h5 className="fw-bold mb-4 d-flex align-items-center">
              <i className="bi bi-lightbulb-fill text-warning me-2"></i> Actionable Improvement Tips
            </h5>
            <div className="row g-4">
              {evaluation.tips?.map((tip, i) => (
                <div key={i} className="col-md-6">
                  <div className="p-3 rounded-4 bg-light bg-opacity-5 border border-white border-opacity-5 h-100">
                    <small className="opacity-75">{tip}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Actions */}
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/history" className="btn-premium glass text-decoration-none border-white border-opacity-10" style={{ color: 'inherit' }}>
              <i className="bi bi-clock-history"></i> Sessions History
            </Link>
            <Link to="/setup" className="btn-premium btn-premium-primary text-decoration-none">
              <i className="bi bi-arrow-clockwise"></i> New Practice Session
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .fw-extrabold { font-weight: 800; }
        .tiny { font-size: 0.7rem; }
        .pointer-none { pointer-events: none; }
        .mt-n1 { margin-top: -0.25rem !important; }
      `}</style>
    </div>
  )
}
