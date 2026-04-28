import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Setup() {
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleResumeChange = (e) => {
    setResume(e.target.files?.[0] || null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') setResume(file)
    else setError('Please upload a valid PDF file.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!resume) {
      setError('Please upload your resume (PDF).')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('job_description', jobDescription)
      formData.append('difficulty', difficulty)

      const data = await api.startInterview(formData)
      if (data.error) {
        setError(data.error)
      } else {
        sessionStorage.setItem('currentQuestion', JSON.stringify(data))
        navigate('/interview')
      }
    } catch (err) {
      setError('Failed to start interview: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          <div className="glass rounded-5 p-4 p-md-5 shadow-lg border-0">
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold mb-2">Configure Your Interview</h2>
              <p className="opacity-75">Let our AI build a custom interview experience for you.</p>
            </div>

            {error && (
              <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                <div className="flex-grow-1">{error}</div>
                <button type="button" className="btn-close shadow-none" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Left Column */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold mb-3 d-flex align-items-center">
                    <span className="p-2 rounded-3 bg-soft-primary me-2">
                      <i className="bi bi-file-earmark-pdf text-primary"></i>
                    </span>
                    Upload PDF Resume
                  </label>

                  <div
                    className={`upload-zone p-5 rounded-5 border-2 border-dashed transition-all d-flex flex-column align-items-center justify-content-center text-center cursor-pointer ${isDragging ? 'border-primary bg-primary bg-opacity-5' : 'border-white border-opacity-10'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-input').click()}
                    style={{ minHeight: '260px', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <input
                      type="file"
                      id="resume-input"
                      className="d-none"
                      accept=".pdf"
                      onChange={handleResumeChange}
                    />

                    {!resume ? (
                      <>
                        <div className="p-4 rounded-circle bg-soft-primary mb-3 hover-elevate">
                          <i className="bi bi-cloud-arrow-up fs-1 text-primary"></i>
                        </div>
                        <h6 className="fw-bold mb-1">Click or drag & drop</h6>
                        <small className="opacity-50">Only PDF files supported</small>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-circle bg-success bg-opacity-10 mb-3 animate-fade-in">
                          <i className="bi bi-check-all fs-1 text-success"></i>
                        </div>
                        <h6 className="fw-bold mb-1 text-success">Resume Uploaded!</h6>
                        <small className="opacity-75">{resume.name}</small>
                        <button
                          className="btn btn-sm btn-link text-danger text-decoration-none mt-2"
                          onClick={(e) => { e.stopPropagation(); setResume(null); }}
                        >
                          Change File
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-bold mb-3 d-flex align-items-center">
                    <span className="p-2 rounded-3 bg-soft-secondary me-2">
                      <i className="bi bi-briefcase text-secondary"></i>
                    </span>
                    Job Description
                  </label>
                  <textarea
                    className="form-control rounded-5 p-4 glass bg-transparent border-white border-opacity-10 focus-primary h-100"
                    rows={8}
                    placeholder="Paste the job description or requirements here..."
                    style={{ minHeight: '260px', color: 'inherit' }}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  ></textarea>
                </div>

                {/* Bottom Row */}
                <div className="col-12">
                  <div className="glass p-4 rounded-5 border-white border-opacity-10">
                    <div className="row align-items-center g-3">
                      <div className="col-md-6">
                        <label className="fw-bold mb-2 d-block small opacity-75">Interview Intensity</label>
                        <div className="btn-group w-100 p-1 bg-dark bg-opacity-20 rounded-4">
                          {['easy', 'medium', 'hard'].map(d => (
                            <button
                              key={d}
                              type="button"
                              className={`btn btn-sm rounded-4 border-0 py-2 text-capitalize fw-bold transition-all ${difficulty === d ? 'bg-primary text-white shadow' : 'bg-transparent opacity-50'}`}
                              onClick={() => setDifficulty(d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-md-6 pt-md-4">
                        <button
                          type="submit"
                          className="btn-premium btn-premium-primary w-100 py-3 mt-md-1"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Preparing Interview...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-lightning-charge-fill me-2"></i>
                              Generate Interview
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .focus-primary:focus {
           border-color: var(--primary) !important;
           box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1) !important;
           outline: none;
        }
        .upload-zone:hover {
          border-color: var(--primary) !important;
          background: rgba(14, 165, 233, 0.05) !important;
        }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease; }
      `}</style>
    </div>
  )
}
