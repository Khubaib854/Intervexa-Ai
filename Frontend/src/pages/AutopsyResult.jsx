import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const VERDICT_CONFIG = {
    'Excellent': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: 'bi-patch-check-fill' },
    'Good': { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'bi-hand-thumbs-up-fill' },
    'Average': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'bi-dash-circle-fill' },
    'Weak': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: 'bi-exclamation-triangle-fill' },
    'Fatal': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'bi-x-circle-fill' },
}

const OVERALL_CONFIG = {
    'Strong Candidate': { color: '#22c55e', emoji: '🏆' },
    'Borderline': { color: '#f59e0b', emoji: '⚖️' },
    'Needs Work': { color: '#f97316', emoji: '🔧' },
    'Not Ready': { color: '#ef4444', emoji: '💀' },
}

export default function AutopsyResult() {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [activeQ, setActiveQ] = useState(null)

    useEffect(() => {
        const stored = sessionStorage.getItem('autopsyResult')
        if (!stored) { navigate('/autopsy'); return }
        const parsed = JSON.parse(stored)
        setData(parsed)
        setActiveQ(parsed.fatal_question_index)
    }, [navigate])

    if (!data) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-danger" role="status"></div>
        </div>
    )

    const { job_role, company, average_score, fatal_question_index, analysed, summary } = data
    const overallCfg = OVERALL_CONFIG[summary.overall_verdict] || OVERALL_CONFIG['Needs Work']

    return (
        <div className="result-page">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">

                        {/* Hero */}
                        <div className="result-hero mb-5">
                            <div className="hero-label">AUTOPSY COMPLETE</div>
                            <h1 className="result-title">
                                Interview <span className="title-red">Autopsy</span> Report
                            </h1>
                            <p className="result-meta">
                                {job_role}{company ? ` · ${company}` : ''}
                                &nbsp;·&nbsp;{analysed.length} Question{analysed.length !== 1 ? 's' : ''} Analysed
                            </p>
                        </div>

                        {/* Score Row */}
                        <div className="score-row mb-4">
                            <div className="score-card">
                                <div className="score-num">{average_score}</div>
                                <div className="score-label">Avg Score / 10</div>
                            </div>
                            <div className="verdict-card" style={{ borderColor: overallCfg.color }}>
                                <div className="verdict-emoji">{overallCfg.emoji}</div>
                                <div className="verdict-text" style={{ color: overallCfg.color }}>
                                    {summary.overall_verdict}
                                </div>
                                <div className="verdict-label">Overall Verdict</div>
                            </div>
                            <div className="fatal-card">
                                <div className="fatal-icon"><i className="bi bi-heartbreak-fill"></i></div>
                                <div className="fatal-num">Q{fatal_question_index + 1}</div>
                                <div className="fatal-label">Fatal Moment</div>
                            </div>
                        </div>

                        {/* Death Certificate */}
                        <div className="death-cert mb-4">
                            <div className="cert-header">
                                <i className="bi bi-file-earmark-x-fill me-2"></i>
                                CAUSE OF REJECTION
                            </div>
                            <p className="cert-body">{summary.death_certificate}</p>
                        </div>

                        {/* Q&A Timeline */}
                        <div className="section-title mb-3">
                            <i className="bi bi-activity me-2 text-danger"></i>
                            Question-by-Question Breakdown
                        </div>

                        <div className="qa-timeline mb-4">
                            {/* Tab buttons */}
                            <div className="tab-buttons mb-3">
                                {analysed.map((item, i) => {
                                    const cfg = VERDICT_CONFIG[item.verdict] || VERDICT_CONFIG['Average']
                                    return (
                                        <button
                                            key={i}
                                            className={`tab-btn ${activeQ === i ? 'active' : ''}`}
                                            style={activeQ === i ? { borderColor: cfg.color, color: cfg.color } : {}}
                                            onClick={() => setActiveQ(activeQ === i ? null : i)}
                                        >
                                            Q{i + 1}
                                            {i === fatal_question_index && <span className="skull">💀</span>}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Active Q detail */}
                            {activeQ !== null && analysed[activeQ] && (() => {
                                const item = analysed[activeQ]
                                const cfg = VERDICT_CONFIG[item.verdict] || VERDICT_CONFIG['Average']
                                return (
                                    <div className="qa-detail" style={{ borderColor: cfg.color }}>
                                        <div className="qa-top">
                                            <div className="qa-verdict-badge" style={{ background: cfg.bg, color: cfg.color }}>
                                                <i className={`bi ${cfg.icon} me-1`}></i>{item.verdict}
                                            </div>
                                            <div className="qa-score" style={{ color: cfg.color }}>{item.score}/10</div>
                                        </div>

                                        <div className="qa-section">
                                            <div className="qa-section-label">QUESTION</div>
                                            <p className="qa-question-text">{item.question}</p>
                                        </div>

                                        <div className="qa-section">
                                            <div className="qa-section-label">YOUR ANSWER</div>
                                            <p className="qa-answer-text">"{item.answer}"</p>
                                        </div>

                                        <div className="qa-grid">
                                            <div className="qa-block interviewer-block">
                                                <div className="block-label">
                                                    <i className="bi bi-person-circle me-1"></i>Interviewer's Thought
                                                </div>
                                                <p className="block-text italic">"{item.interviewer_thought}"</p>
                                            </div>

                                            {item.what_killed_it && item.what_killed_it !== 'None' && (
                                                <div className="qa-block kill-block">
                                                    <div className="block-label text-danger">
                                                        <i className="bi bi-x-circle me-1"></i>What Killed It
                                                    </div>
                                                    <p className="block-text">{item.what_killed_it}</p>
                                                </div>
                                            )}

                                            <div className="qa-block ideal-block">
                                                <div className="block-label text-success">
                                                    <i className="bi bi-lightbulb me-1"></i>Ideal Answer Hint
                                                </div>
                                                <p className="block-text">{item.ideal_answer_hint}</p>
                                            </div>

                                            <div className="qa-block feedback-block">
                                                <div className="block-label" style={{ color: '#3b82f6' }}>
                                                    <i className="bi bi-chat-dots me-1"></i>Coach Feedback
                                                </div>
                                                <p className="block-text">{item.feedback}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        {/* Survival Kit */}
                        <div className="survival-kit mb-4">
                            <div className="survival-header">
                                <i className="bi bi-shield-check me-2"></i>Survival Kit — Fix This Before Next Interview
                            </div>
                            <div className="one-fix">
                                <span className="fix-label">THE ONE THING TO FIX</span>
                                <p className="fix-text">{summary.one_thing_to_fix}</p>
                            </div>
                            <div className="tips-grid">
                                {summary.survival_tips?.map((tip, i) => (
                                    <div className="tip-item" key={i}>
                                        <span className="tip-num">{i + 1}</span>
                                        <span className="tip-text">{tip}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="readiness">
                                <i className="bi bi-clock me-2 opacity-50"></i>
                                Estimated readiness: <strong>{summary.rehire_readiness}</strong>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="actions-row">
                            <Link to="/autopsy" className="action-btn secondary">
                                <i className="bi bi-arrow-repeat me-2"></i>New Autopsy
                            </Link>
                            <Link to="/setup" className="action-btn primary">
                                <i className="bi bi-play-fill me-2"></i>Practice Now
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            <style>{`
        .result-page { min-height: 100vh; font-family: 'Segoe UI', system-ui, sans-serif; }

        /* Hero */
        .result-hero { text-align: center; }
        .hero-label {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.2em;
          color: #ef4444; text-transform: uppercase; margin-bottom: 0.75rem;
        }
        .result-title {
          font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 900;
          letter-spacing: -0.03em; margin-bottom: 0.5rem; line-height: 1.1;
        }
        .title-red {
          background: linear-gradient(135deg, #ef4444, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .result-meta { opacity: 0.45; font-size: 0.9rem; letter-spacing: 0.03em; }

        /* Score Row */
        .score-row {
          display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 1rem;
        }
        @media(max-width: 576px) { .score-row { grid-template-columns: 1fr 1fr; } }

        .score-card, .verdict-card, .fatal-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; padding: 1.5rem; text-align: center;
          backdrop-filter: blur(10px);
        }
        .verdict-card { border-width: 2px; }
        .score-num { font-size: 3rem; font-weight: 900; line-height: 1; color: #ef4444; }
        .score-label, .verdict-label, .fatal-label {
          font-size: 0.72rem; opacity: 0.45; text-transform: uppercase;
          letter-spacing: 0.1em; margin-top: 0.25rem;
        }
        .verdict-emoji { font-size: 2rem; margin-bottom: 0.25rem; }
        .verdict-text { font-size: 1.2rem; font-weight: 800; }
        .fatal-icon { font-size: 2rem; color: #ef4444; margin-bottom: 0.25rem; }
        .fatal-num { font-size: 2rem; font-weight: 900; color: #ef4444; line-height: 1; }

        /* Death Cert */
        .death-cert {
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.25);
          border-left: 4px solid #ef4444;
          border-radius: 14px; padding: 1.2rem 1.5rem;
        }
        .cert-header {
          font-size: 0.72rem; font-weight: 800; color: #ef4444;
          letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.6rem;
        }
        .cert-body { margin: 0; opacity: 0.85; line-height: 1.7; font-size: 0.95rem; }

        /* Section */
        .section-title { font-weight: 700; font-size: 1rem; }

        /* Tabs */
        .tab-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tab-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
          color: inherit; border-radius: 10px; padding: 0.4rem 0.9rem;
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s; position: relative;
        }
        .tab-btn:hover { background: rgba(255,255,255,0.1); }
        .tab-btn.active { background: rgba(239,68,68,0.08); }
        .skull { position: absolute; top: -8px; right: -6px; font-size: 0.75rem; }

        /* QA Detail */
        .qa-detail {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-left: 3px solid;
          border-radius: 16px; padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .qa-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .qa-verdict-badge {
          font-size: 0.8rem; font-weight: 700; padding: 0.3rem 0.8rem;
          border-radius: 20px; display: inline-flex; align-items: center;
        }
        .qa-score { font-size: 1.5rem; font-weight: 900; }

        .qa-section { margin-bottom: 1rem; }
        .qa-section-label {
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.15em;
          opacity: 0.4; text-transform: uppercase; margin-bottom: 0.3rem;
        }
        .qa-question-text { font-weight: 600; font-size: 0.95rem; margin: 0; }
        .qa-answer-text { font-style: italic; opacity: 0.7; font-size: 0.9rem; margin: 0; }

        .qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; }
        @media(max-width: 576px) { .qa-grid { grid-template-columns: 1fr; } }

        .qa-block {
          background: rgba(255,255,255,0.04); border-radius: 12px;
          padding: 0.9rem; border: 1px solid rgba(255,255,255,0.07);
        }
        .block-label {
          font-size: 0.72rem; font-weight: 700; opacity: 0.6;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem;
        }
        .block-text { font-size: 0.85rem; margin: 0; line-height: 1.6; opacity: 0.85; }
        .italic { font-style: italic; }

        /* Survival Kit */
        .survival-kit {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px; padding: 1.5rem 2rem;
        }
        .survival-header {
          font-weight: 700; font-size: 1rem; margin-bottom: 1.2rem;
          color: #22c55e;
        }
        .one-fix {
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1rem;
        }
        .fix-label {
          font-size: 0.68rem; font-weight: 800; color: #22c55e;
          letter-spacing: 0.15em; text-transform: uppercase; display: block;
          margin-bottom: 0.3rem;
        }
        .fix-text { margin: 0; font-weight: 600; font-size: 0.95rem; }

        .tips-grid { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .tip-item { display: flex; gap: 0.75rem; align-items: flex-start; }
        .tip-num {
          background: rgba(255,255,255,0.08); border-radius: 6px;
          width: 24px; height: 24px; display: flex; align-items: center;
          justify-content: center; font-size: 0.75rem; font-weight: 700;
          flex-shrink: 0; margin-top: 1px;
        }
        .tip-text { font-size: 0.9rem; opacity: 0.8; line-height: 1.5; }
        .readiness { font-size: 0.85rem; opacity: 0.55; margin-top: 0.5rem; }

        /* Actions */
        .actions-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .action-btn {
          padding: 0.85rem 2rem; border-radius: 50px; font-weight: 700;
          font-size: 0.95rem; text-decoration: none; transition: all 0.2s;
          display: inline-flex; align-items: center;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: white; box-shadow: 0 6px 24px rgba(239,68,68,0.3);
        }
        .action-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(239,68,68,0.45); color: white; }
        .action-btn.secondary {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          color: inherit;
        }
        .action-btn.secondary:hover { background: rgba(255,255,255,0.12); color: inherit; }
      `}</style>
        </div>
    )
}
