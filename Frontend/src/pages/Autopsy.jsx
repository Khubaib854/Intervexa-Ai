import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Autopsy() {
    const navigate = useNavigate()
    const [jobRole, setJobRole] = useState('')
    const [company, setCompany] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [pairs, setPairs] = useState([{ question: '', answer: '' }])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addPair = () => setPairs([...pairs, { question: '', answer: '' }])

    const removePair = (i) => {
        if (pairs.length === 1) return
        setPairs(pairs.filter((_, idx) => idx !== i))
    }

    const updatePair = (i, field, value) => {
        const updated = [...pairs]
        updated[i][field] = value
        setPairs(updated)
    }

    const handleSubmit = async () => {
        if (!jobRole.trim()) { setError('Please enter the job role.'); return }
        const valid = pairs.filter(p => p.question.trim() && p.answer.trim())
        if (valid.length === 0) { setError('Please add at least one complete Q&A pair.'); return }

        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/autopsy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_role: jobRole,
                    company,
                    resume_text: resumeText,
                    qa_pairs: valid
                })
            })
            const data = await res.json()
            if (data.error) { setError(data.error); return }
            sessionStorage.setItem('autopsyResult', JSON.stringify(data))
            navigate('/autopsy/result')
        } catch (e) {
            setError('Failed to connect to server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="autopsy-page">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9">

                        {/* Header */}
                        <div className="autopsy-hero mb-5">
                            <div className="hero-badge">
                                <span className="badge-dot"></span>
                                POST-INTERVIEW ANALYSIS
                            </div>
                            <h1 className="hero-title">
                                Interview<br />
                                <span className="title-accent">Autopsy</span>
                            </h1>
                            <p className="hero-sub">
                                Just failed an interview? Reconstruct what happened. Our AI will dissect every answer,
                                reveal the exact moment you lost the interviewer, and show you what to fix.
                            </p>
                        </div>

                        {error && (
                            <div className="autopsy-alert mb-4">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                <button className="alert-close" onClick={() => setError('')}>✕</button>
                            </div>
                        )}

                        {/* Step 1 - Job Info */}
                        <div className="autopsy-card mb-4">
                            <div className="card-step">01</div>
                            <h3 className="card-title">The Interview Details</h3>
                            <p className="card-sub">Tell us about the role you interviewed for.</p>
                            <div className="row g-3 mt-2">
                                <div className="col-md-6">
                                    <label className="field-label">Job Role <span className="required">*</span></label>
                                    <input
                                        className="autopsy-input"
                                        placeholder="e.g. Frontend Developer"
                                        value={jobRole}
                                        onChange={e => setJobRole(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="field-label">Company <span className="optional">(optional)</span></label>
                                    <input
                                        className="autopsy-input"
                                        placeholder="e.g. Google, Arbisoft, Netsol..."
                                        value={company}
                                        onChange={e => setCompany(e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="field-label">Your Resume / Skills Summary <span className="optional">(optional but recommended)</span></label>
                                    <textarea
                                        className="autopsy-input"
                                        rows={3}
                                        placeholder="Paste key skills, experience, or your resume text here for deeper analysis..."
                                        value={resumeText}
                                        onChange={e => setResumeText(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 2 - Q&A Pairs */}
                        <div className="autopsy-card mb-4">
                            <div className="card-step">02</div>
                            <h3 className="card-title">Reconstruct the Interview</h3>
                            <p className="card-sub">Enter each question they asked and what you answered. Be honest — the AI only helps if you are truthful.</p>

                            <div className="pairs-list mt-3">
                                {pairs.map((pair, i) => (
                                    <div className="pair-block" key={i}>
                                        <div className="pair-number">Q{i + 1}</div>
                                        <div className="pair-fields">
                                            <input
                                                className="autopsy-input mb-2"
                                                placeholder={`Question ${i + 1} — What did they ask?`}
                                                value={pair.question}
                                                onChange={e => updatePair(i, 'question', e.target.value)}
                                            />
                                            <textarea
                                                className="autopsy-input"
                                                rows={3}
                                                placeholder="What did you answer? Be as accurate as possible..."
                                                value={pair.answer}
                                                onChange={e => updatePair(i, 'answer', e.target.value)}
                                            />
                                        </div>
                                        {pairs.length > 1 && (
                                            <button className="pair-remove" onClick={() => removePair(i)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="add-pair-btn mt-3" onClick={addPair}>
                                <i className="bi bi-plus-circle me-2"></i>Add Another Question
                            </button>
                        </div>

                        {/* Submit */}
                        <div className="text-center">
                            <button
                                className="autopsy-submit"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Performing Autopsy...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-activity me-2"></i>
                                        Run Interview Autopsy
                                    </>
                                )}
                            </button>
                            {loading && (
                                <p className="loading-note mt-3">
                                    🔬 AI is dissecting your interview... this takes 15–30 seconds
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
        .autopsy-page {
          min-height: 100vh;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Hero */
        .autopsy-hero { text-align: center; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.18em;
          color: #ef4444; text-transform: uppercase; margin-bottom: 1.2rem;
        }
        .badge-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #ef4444;
          animation: blink 1.2s infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .hero-title {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.03em; margin-bottom: 1rem;
        }
        .title-accent {
          background: linear-gradient(135deg, #ef4444, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: 1.05rem; opacity: 0.65; max-width: 560px;
          margin: 0 auto; line-height: 1.7;
        }

        /* Cards */
        .autopsy-card {
          background: var(--glass-bg, rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 2rem 2rem 2rem;
          position: relative; overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .card-step {
          font-size: 4.5rem; font-weight: 900; line-height: 1;
          opacity: 0.07; position: absolute; top: 1rem; right: 1.5rem;
          letter-spacing: -0.05em;
        }
        .card-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.25rem; }
        .card-sub { opacity: 0.55; font-size: 0.9rem; margin-bottom: 0; }

        /* Fields */
        .field-label {
          display: block; font-size: 0.8rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.6;
          margin-bottom: 0.4rem;
        }
        .required { color: #ef4444; }
        .optional { color: rgba(255,255,255,0.35); font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.8rem; }
        .autopsy-input {
          width: 100%; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px; padding: 0.75rem 1rem;
          color: inherit; font-size: 0.95rem; transition: border-color 0.2s;
          outline: none; resize: vertical;
        }
        .autopsy-input:focus { border-color: #ef4444; background: rgba(239,68,68,0.05); }
        .autopsy-input::placeholder { opacity: 0.35; }

        /* Pairs */
        .pair-block {
          display: flex; gap: 1rem; align-items: flex-start;
          padding: 1.2rem; border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 0.75rem;
        }
        .pair-number {
          font-size: 0.75rem; font-weight: 800; color: #ef4444;
          background: rgba(239,68,68,0.1); border-radius: 8px;
          padding: 0.3rem 0.5rem; white-space: nowrap; letter-spacing: 0.05em;
          margin-top: 2px;
        }
        .pair-fields { flex: 1; }
        .pair-remove {
          background: rgba(239,68,68,0.1); border: none;
          color: #ef4444; border-radius: 8px; padding: 0.4rem 0.6rem;
          cursor: pointer; transition: background 0.2s; font-size: 0.9rem;
        }
        .pair-remove:hover { background: rgba(239,68,68,0.25); }

        .add-pair-btn {
          background: transparent; border: 1px dashed rgba(255,255,255,0.2);
          color: inherit; border-radius: 12px; padding: 0.7rem 1.5rem;
          font-size: 0.9rem; cursor: pointer; opacity: 0.6;
          transition: all 0.2s; width: 100%;
        }
        .add-pair-btn:hover { opacity: 1; border-color: #ef4444; color: #ef4444; }

        /* Submit */
        .autopsy-submit {
          background: linear-gradient(135deg, #ef4444, #f97316);
          border: none; color: white; font-weight: 700; font-size: 1.1rem;
          padding: 1rem 3rem; border-radius: 50px; cursor: pointer;
          transition: all 0.3s; letter-spacing: 0.02em;
          box-shadow: 0 8px 30px rgba(239,68,68,0.35);
        }
        .autopsy-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(239,68,68,0.5);
        }
        .autopsy-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite; margin-right: 0.5rem;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-note { opacity: 0.5; font-size: 0.9rem; }

        /* Alert */
        .autopsy-alert {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444; border-radius: 12px; padding: 0.9rem 1.2rem;
          display: flex; align-items: center; font-size: 0.9rem;
        }
        .alert-close {
          background: none; border: none; color: #ef4444;
          margin-left: auto; cursor: pointer; font-size: 0.9rem; opacity: 0.7;
        }
      `}</style>
        </div>
    )
}
