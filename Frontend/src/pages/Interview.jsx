// import React, { useState, useEffect, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { api } from '../services/api'

// export default function Interview() {
//   const navigate = useNavigate()
//   const [questionData, setQuestionData] = useState(null)
//   const [answer, setAnswer] = useState('')
//   const [isRecording, setIsRecording] = useState(false)
//   const [recordingTime, setRecordingTime] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [feedbackData, setFeedbackData] = useState(null)
//   const [nextQuestionData, setNextQuestionData] = useState(null)
//   const [submittedAnswer, setSubmittedAnswer] = useState('')
//   const [isFinished, setIsFinished] = useState(false)

//   const audioRef = useRef(null)
//   const recordingIntervalRef = useRef(null)
//   const recognitionRef = useRef(null)
//   const mediaRecorderRef = useRef(null)

//   useEffect(() => {
//     loadQuestion()
//     return () => {
//       if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
//     }
//   }, [])

//   const loadQuestion = async () => {
//     try {
//       const stored = sessionStorage.getItem('currentQuestion')
//       if (stored) {
//         setQuestionData(JSON.parse(stored))
//         sessionStorage.removeItem('currentQuestion')
//       } else {
//         const data = await api.getCurrentState()
//         if (data.error) {
//           navigate('/setup')
//         } else {
//           setQuestionData(data)
//         }
//       }
//     } catch (err) {
//       setError('Failed to load question')
//       navigate('/setup')
//     }
//   }

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       setIsRecording(true)
//       setAnswer('')
//       setRecordingTime(0)

//       recordingIntervalRef.current = setInterval(() => {
//         setRecordingTime((t) => t + 1)
//       }, 1000)

//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
//       if (SpeechRecognition) {
//         recognitionRef.current = new SpeechRecognition()
//         recognitionRef.current.continuous = true
//         recognitionRef.current.interimResults = true
//         recognitionRef.current.lang = 'en-US'

//         let finalTranscript = ''
//         recognitionRef.current.onresult = (event) => {
//           let interim = ''
//           for (let i = event.resultIndex; i < event.results.length; i++) {
//             if (event.results[i].isFinal) {
//               finalTranscript += event.results[i][0].transcript + ' '
//             } else {
//               interim += event.results[i][0].transcript
//             }
//           }
//           setAnswer(finalTranscript + interim)
//         }
//         recognitionRef.current.start()
//       }

//       mediaRecorderRef.current = new MediaRecorder(stream)
//       mediaRecorderRef.current.start()
//     } catch (err) {
//       setError('Microphone access denied. Please type your answer.')
//     }
//   }

//   const stopRecording = () => {
//     setIsRecording(false)
//     if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
//     if (recognitionRef.current) recognitionRef.current.stop()
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop()
//       mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
//     }
//   }

//   const submitAnswer = async () => {
//     if (!answer.trim()) {
//       setError('Please provide an answer.')
//       return
//     }

//     setLoading(true)
//     try {
//       const data = await api.submitAnswer(answer, recordingTime)
//       if (data.error) {
//         setError(data.error)
//       } else {
//         setFeedbackData(data.evaluation)
//         setSubmittedAnswer(answer)
//         setAnswer('')

//         if (data.finished) {
//           // Interview is done — mark finished but wait for user to click button
//           setIsFinished(true)
//         } else {
//           // More questions remain
//           setNextQuestionData({
//             question_text: data.question_text,
//             audio_data: data.audio_data,
//             question_number: data.question_number,
//             total_questions: data.total_questions,
//           })
//         }
//       }
//     } catch (err) {
//       setError('Failed to submit answer: ' + err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const skipQuestion = async () => {
//     setLoading(true)
//     try {
//       const data = await api.skipQuestion()
//       if (data.error) {
//         setError(data.error)
//       } else {
//         if (data.finished) {
//           // Last question was skipped — finish the interview
//           await finishInterview()
//         } else {
//           setQuestionData({
//             question_text: data.question_text,
//             audio_data: data.audio_data,
//             question_number: data.question_number,
//             total_questions: data.total_questions,
//           })
//           setAnswer('')
//           setSubmittedAnswer('')
//           setFeedbackData(null)
//         }
//       }
//     } catch (err) {
//       setError('Failed to skip question')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ── This is the KEY fix: always call finish-interview before navigating ──
//   const finishInterview = async () => {
//     setLoading(true)
//     try {
//       const result = await api.finishInterview()
//       if (result.error) {
//         setError(result.error)
//       } else {
//         navigate('/results')
//       }
//     } catch (err) {
//       setError('Failed to finish interview: ' + err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleProceed = async () => {
//     if (isFinished) {
//       // Call finish-interview API then go to results
//       await finishInterview()
//     } else if (nextQuestionData) {
//       // Move to next question
//       setQuestionData(nextQuestionData)
//       setNextQuestionData(null)
//       setFeedbackData(null)
//       setSubmittedAnswer('')
//       setRecordingTime(0)
//     }
//   }

//   if (!questionData) {
//     return (
//       <div className="container py-5 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     )
//   }

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60)
//     const s = seconds % 60
//     return `${m}:${s < 10 ? '0' : ''}${s}`
//   }

//   return (
//     <div className="container py-5 animate-fade-in">
//       <div className="row justify-content-center">
//         <div className="col-lg-10">
//           {/* Header & Progress */}
//           <div className="glass rounded-5 p-4 mb-4 border-0">
//             <div className="row align-items-center">
//               <div className="col-md-6 mb-3 mb-md-0">
//                 <div className="d-flex align-items-center gap-3">
//                   <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
//                     <i className="bi bi-robot fs-3"></i>
//                   </div>
//                   <div>
//                     <h4 className="fw-bold mb-0">Interview Session</h4>
//                     <small className="opacity-50 tracking-wider text-uppercase fw-bold tiny">Question {questionData.question_number} of {questionData.total_questions}</small>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="d-flex flex-column gap-2">
//                   <div className="d-flex justify-content-between small fw-bold">
//                     <span>Progress</span>
//                     <span>{Math.round((questionData.question_number / questionData.total_questions) * 100)}%</span>
//                   </div>
//                   <div className="progress rounded-pill bg-dark bg-opacity-10" style={{ height: '8px' }}>
//                     <div
//                       className="progress-bar rounded-pill transition-all"
//                       style={{ width: `${(questionData.question_number / questionData.total_questions) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center">
//               <i className="bi bi-exclamation-circle-fill me-3 fs-4"></i>
//               <div className="flex-grow-1">{error}</div>
//               <button type="button" className="btn-close shadow-none" onClick={() => setError('')}></button>
//             </div>
//           )}

//           <div className="row g-4">
//             {/* Main Question Card */}
//             <div className="col-12 col-xl-7">
//               <div className="glass rounded-5 p-4 p-md-5 h-100 border-0 overflow-hidden position-relative">
//                 <div className="mb-4">
//                   <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3 py-2 mb-3">
//                     <i className="bi bi-chat-left-dots-fill me-2"></i>Interviewer is speaking
//                   </span>
//                   <h3 className="fw-bold mb-4 line-height-base">{questionData.question_text}</h3>

//                   {questionData.audio_data && (
//                     <div className="mt-4 p-3 glass rounded-4 border-white border-opacity-10 animate-fade-in">
//                       <audio ref={audioRef} src={questionData.audio_data} className="w-100" controls />
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-auto d-flex gap-2">
//                   <button className="btn btn-premium glass hover-elevate rounded-4 opacity-50 small px-3 py-2 border-0" onClick={() => audioRef.current?.play()}>
//                     <i className="bi bi-play-fill me-1"></i> Re-play Question
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Answer Section */}
//             <div className="col-12 col-xl-5">
//               <div className="glass rounded-5 p-4 p-md-5 h-100 border-0 d-flex flex-column">
//                 <h5 className="fw-bold mb-4 d-flex align-items-center">
//                   <i className="bi bi-record-circle text-danger me-2 animate-pulse"></i> Your Response
//                   <span className="ms-auto small opacity-50 fw-normal">{formatTime(recordingTime)}</span>
//                 </h5>

//                 {!feedbackData ? (
//                   <>
//                     <div className="flex-grow-1 mb-4 position-relative">
//                       <textarea
//                         className="form-control rounded-4 p-4 glass bg-transparent border-white border-opacity-10 focus-primary h-100 mb-0"
//                         style={{ minHeight: '180px', color: 'inherit', resize: 'none' }}
//                         placeholder="Your answer will appear here as you speak..."
//                         value={answer}
//                         onChange={(e) => setAnswer(e.target.value)}
//                         disabled={loading}
//                       ></textarea>
//                       {isRecording && (
//                         <div className="position-absolute bottom-0 start-0 w-100 p-3">
//                           <div className="d-flex justify-content-center gap-1 h-1 my-2">
//                             {[...Array(8)].map((_, i) => (
//                               <div key={i} className="bg-primary rounded-pill animate-wave" style={{ width: '4px', height: '100%', animationDelay: `${i * 0.1}s` }}></div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div className="d-grid gap-3">
//                       {!isRecording ? (
//                         <button className="btn-premium btn-premium-primary py-3" onClick={startRecording} disabled={loading}>
//                           <i className="bi bi-mic-fill"></i> Start Speaking
//                         </button>
//                       ) : (
//                         <button className="btn-premium btn-danger py-3 border-0 shadow-lg animate-pulse" style={{ background: '#ef4444' }} onClick={stopRecording}>
//                           <i className="bi bi-stop-fill"></i> Stop Recording
//                         </button>
//                       )}

//                       <div className="d-flex gap-2">
//                         <button className="btn-premium glass flex-grow-1 border-white border-opacity-10" style={{ color: 'inherit' }} onClick={submitAnswer} disabled={loading || !answer.trim()}>
//                           {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-send-fill me-1"></i> Submit</>}
//                         </button>
//                         <button className="btn-premium glass px-3 border-white border-opacity-10" style={{ color: 'inherit' }} onClick={skipQuestion} disabled={loading}>
//                           <i className="bi bi-skip-forward-fill"></i>
//                         </button>
//                       </div>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="animate-fade-in flex-grow-1">
//                     <div className="p-4 rounded-4 glass border-primary border-opacity-20 mb-0 h-100 d-flex flex-column justify-content-center">
//                       <p className="mb-0 fs-5 fw-medium italic" style={{ lineHeight: '1.6' }}>"{submittedAnswer}"</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Feedback Card */}
//           {feedbackData && (
//             <div className="mt-4 glass rounded-5 p-4 p-md-5 border-0 shadow-lg animate-fade-in">
//               <div className="row g-4 align-items-center mb-5">
//                 <div className="col-md-8 text-center text-md-start">
//                   <h2 className="fw-bold mb-2">AI Performance Review</h2>
//                   <p className="opacity-75 mb-0">Comprehensive analysis of your response for question {questionData.question_number}.</p>
//                 </div>
//                 <div className="col-md-4 text-center">
//                   <div className="d-inline-block p-4 rounded-pill glass border-4 border-primary">
//                     <span className="display-4 fw-extrabold text-primary mb-0">{feedbackData.score}</span>
//                     <span className="opacity-50 fw-bold">/10</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="row g-4">
//                 <div className="col-lg-4">
//                   <div className="p-4 rounded-5 bg-success bg-opacity-10 border border-success border-opacity-10 h-100 hover-elevate">
//                     <h6 className="fw-bold text-success mb-3 d-flex align-items-center">
//                       <i className="bi bi-shield-check fs-4 me-2"></i> Key Strengths
//                     </h6>
//                     <p className="small mb-0">{feedbackData.strengths}</p>
//                   </div>
//                 </div>
//                 <div className="col-lg-4">
//                   <div className="p-4 rounded-5 bg-danger bg-opacity-10 border border-danger border-opacity-10 h-100 hover-elevate">
//                     <h6 className="fw-bold text-danger mb-3 d-flex align-items-center">
//                       <i className="bi bi-lightning-charge fs-4 me-2"></i> Weak Points
//                     </h6>
//                     <p className="small mb-0">{feedbackData.weak_points || 'N/A'}</p>
//                   </div>
//                 </div>
//                 <div className="col-lg-4">
//                   <div className="p-4 rounded-5 bg-info bg-opacity-10 border border-info border-opacity-10 h-100 hover-elevate">
//                     <h6 className="fw-bold text-info mb-3 d-flex align-items-center">
//                       <i className="bi bi-graph-up-arrow fs-4 me-2"></i> Suggestions
//                     </h6>
//                     <p className="small mb-0">{feedbackData.improvement}</p>
//                   </div>
//                 </div>

//                 <div className="col-12 mt-5 text-center">
//                   <button
//                     className="btn-premium btn-premium-primary px-5 py-3 fs-5 shadow-lg"
//                     onClick={handleProceed}
//                     disabled={loading}
//                   >
//                     {loading
//                       ? <><span className="spinner-border spinner-border-sm me-2"></span>Please wait...</>
//                       : isFinished
//                         ? <><i className="bi bi-trophy-fill me-2"></i>Complete Session & View Final Report</>
//                         : <>Move to Next Question <i className="bi bi-arrow-right ms-2"></i></>
//                     }
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         .line-height-base { line-height: 1.4; }
//         .tiny { font-size: 0.7rem; }
//         .fw-extrabold { font-weight: 800; }
//         .animate-pulse { animation: pulse 2s infinite; }
//         @keyframes pulse {
//           0% { transform: scale(0.95); opacity: 0.7; }
//           70% { transform: scale(1); opacity: 1; }
//           100% { transform: scale(0.95); opacity: 0.7; }
//         }
//         @keyframes wave {
//           0%, 100% { height: 10%; }
//           50% { height: 100%; }
//         }
//         .animate-wave {
//           animation: wave 1s ease-in-out infinite;
//         }
//         .italic { font-style: italic; }
//       `}</style>
//     </div>
//   )
// }
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// Interview stages — makes the flow crystal clear
const STAGE = {
  ANSWERING: 'answering',      // user is answering current question
  FEEDBACK: 'feedback',       // showing feedback, more questions remain
  LAST_FEEDBACK: 'last_feedback',  // showing feedback for the final question
  FINISHING: 'finishing',      // calling finish-interview API
}

export default function Interview() {
  const navigate = useNavigate()

  const [questionData, setQuestionData] = useState(null)
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedbackData, setFeedbackData] = useState(null)
  const [nextQuestionData, setNextQuestionData] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState('')
  const [stage, setStage] = useState(STAGE.ANSWERING)

  const audioRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)

  useEffect(() => {
    loadQuestion()
    return () => { if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current) }
  }, [])

  // ── Load initial question ──────────────────────────────────────────────────
  const loadQuestion = async () => {
    try {
      const stored = sessionStorage.getItem('currentQuestion')
      if (stored) {
        setQuestionData(JSON.parse(stored))
        sessionStorage.removeItem('currentQuestion')
      } else {
        const data = await api.getCurrentState()
        if (data.error) navigate('/setup')
        else setQuestionData(data)
      }
    } catch {
      navigate('/setup')
    }
  }

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)
      setAnswer('')
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        recognitionRef.current = new SR()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        let finalTranscript = ''
        recognitionRef.current.onresult = (event) => {
          let interim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' '
            else interim += event.results[i][0].transcript
          }
          setAnswer(finalTranscript + interim)
        }
        recognitionRef.current.start()
      }

      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.start()
    } catch {
      setError('Microphone access denied. Please type your answer.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    if (recognitionRef.current) recognitionRef.current.stop()
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
  }

  // ── Submit answer ──────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (!answer.trim()) { setError('Please provide an answer.'); return }

    setLoading(true)
    setError('')
    try {
      const data = await api.submitAnswer(answer, recordingTime)

      if (data.error) {
        setError(data.error)
        return
      }

      setSubmittedAnswer(answer)
      setAnswer('')
      setFeedbackData(data.evaluation)

      if (data.finished) {
        // ✅ This was the last question
        console.log('[Interview] Last question done. Stage → LAST_FEEDBACK')
        setStage(STAGE.LAST_FEEDBACK)
      } else {
        // ✅ More questions remain
        console.log('[Interview] Next question:', data.question_number)
        setNextQuestionData({
          question_text: data.question_text,
          audio_data: data.audio_data,
          question_number: data.question_number,
          total_questions: data.total_questions,
        })
        setStage(STAGE.FEEDBACK)
      }
    } catch (err) {
      setError('Failed to submit answer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Skip question ──────────────────────────────────────────────────────────
  const skipQuestion = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.skipQuestion()
      if (data.error) { setError(data.error); return }

      if (data.finished) {
        await callFinishInterview()
      } else {
        setQuestionData({
          question_text: data.question_text,
          audio_data: data.audio_data,
          question_number: data.question_number,
          total_questions: data.total_questions,
        })
        setAnswer('')
        setSubmittedAnswer('')
        setFeedbackData(null)
        setStage(STAGE.ANSWERING)
      }
    } catch (err) {
      setError('Failed to skip: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Call finish-interview API then navigate ────────────────────────────────
  const callFinishInterview = async () => {
    setStage(STAGE.FINISHING)
    setLoading(true)
    setError('')
    console.log('[Interview] Calling /api/finish-interview ...')
    try {
      const result = await api.finishInterview()
      console.log('[Interview] Result:', result)
      if (result.error) {
        setError(result.error)
        setStage(STAGE.LAST_FEEDBACK)
      } else {
        console.log('[Interview] Success — navigating to /results')
        navigate('/results')
      }
    } catch (err) {
      setError('Failed to finish: ' + err.message)
      setStage(STAGE.LAST_FEEDBACK)
    } finally {
      setLoading(false)
    }
  }

  // ── Proceed button ─────────────────────────────────────────────────────────
  const handleProceed = () => {
    if (stage === STAGE.LAST_FEEDBACK) {
      callFinishInterview()
    } else if (stage === STAGE.FEEDBACK && nextQuestionData) {
      setQuestionData(nextQuestionData)
      setNextQuestionData(null)
      setFeedbackData(null)
      setSubmittedAnswer('')
      setRecordingTime(0)
      setStage(STAGE.ANSWERING)
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (!questionData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const isShowingFeedback = stage === STAGE.FEEDBACK || stage === STAGE.LAST_FEEDBACK
  const isLastQuestion = stage === STAGE.LAST_FEEDBACK
  const isFinishing = stage === STAGE.FINISHING

  return (
    <div className="container py-5 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-lg-10">

          {/* Header & Progress */}
          <div className="glass rounded-5 p-4 mb-4 border-0">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                    <i className="bi bi-robot fs-3"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Interview Session</h4>
                    <small className="opacity-50 tracking-wider text-uppercase fw-bold tiny">
                      Question {questionData.question_number} of {questionData.total_questions}
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between small fw-bold">
                    <span>Progress</span>
                    <span>{Math.round((questionData.question_number / questionData.total_questions) * 100)}%</span>
                  </div>
                  <div className="progress rounded-pill bg-dark bg-opacity-10" style={{ height: '8px' }}>
                    <div
                      className="progress-bar rounded-pill"
                      style={{
                        width: `${(questionData.question_number / questionData.total_questions) * 100}%`,
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center">
              <i className="bi bi-exclamation-circle-fill me-3 fs-4"></i>
              <div className="flex-grow-1">{error}</div>
              <button className="btn-close shadow-none" onClick={() => setError('')} />
            </div>
          )}

          <div className="row g-4">
            {/* Question Card */}
            <div className="col-12 col-xl-7">
              <div className="glass rounded-5 p-4 p-md-5 h-100 border-0 position-relative">
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10 rounded-pill px-3 py-2 mb-3">
                  <i className="bi bi-chat-left-dots-fill me-2"></i>Interviewer is speaking
                </span>
                <h3 className="fw-bold mb-4 line-height-base">{questionData.question_text}</h3>
                {questionData.audio_data && (
                  <div className="mt-4 p-3 glass rounded-4 border-white border-opacity-10">
                    <audio ref={audioRef} src={questionData.audio_data} className="w-100" controls />
                  </div>
                )}
                <div className="mt-3">
                  <button
                    className="btn btn-premium glass hover-elevate rounded-4 opacity-50 small px-3 py-2 border-0"
                    onClick={() => audioRef.current?.play()}
                  >
                    <i className="bi bi-play-fill me-1"></i> Re-play Question
                  </button>
                </div>
              </div>
            </div>

            {/* Answer Section */}
            <div className="col-12 col-xl-5">
              <div className="glass rounded-5 p-4 p-md-5 h-100 border-0 d-flex flex-column">
                <h5 className="fw-bold mb-4 d-flex align-items-center">
                  <i className="bi bi-record-circle text-danger me-2 animate-pulse"></i> Your Response
                  <span className="ms-auto small opacity-50 fw-normal">{formatTime(recordingTime)}</span>
                </h5>

                {!isShowingFeedback ? (
                  <>
                    <div className="flex-grow-1 mb-4 position-relative">
                      <textarea
                        className="form-control rounded-4 p-4 glass bg-transparent border-white border-opacity-10 h-100"
                        style={{ minHeight: '180px', color: 'inherit', resize: 'none' }}
                        placeholder="Your answer will appear here as you speak..."
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        disabled={loading}
                      />
                      {isRecording && (
                        <div className="position-absolute bottom-0 start-0 w-100 p-3">
                          <div className="d-flex justify-content-center gap-1 my-2">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="bg-primary rounded-pill animate-wave"
                                style={{ width: '4px', height: '20px', animationDelay: `${i * 0.1}s` }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="d-grid gap-3">
                      {!isRecording ? (
                        <button className="btn-premium btn-premium-primary py-3" onClick={startRecording} disabled={loading}>
                          <i className="bi bi-mic-fill"></i> Start Speaking
                        </button>
                      ) : (
                        <button
                          className="btn-premium btn-danger py-3 border-0 shadow-lg animate-pulse"
                          style={{ background: '#ef4444' }}
                          onClick={stopRecording}
                        >
                          <i className="bi bi-stop-fill"></i> Stop Recording
                        </button>
                      )}
                      <div className="d-flex gap-2">
                        <button
                          className="btn-premium glass flex-grow-1 border-white border-opacity-10"
                          style={{ color: 'inherit' }}
                          onClick={submitAnswer}
                          disabled={loading || !answer.trim()}
                        >
                          {loading
                            ? <span className="spinner-border spinner-border-sm" />
                            : <><i className="bi bi-send-fill me-1"></i> Submit</>
                          }
                        </button>
                        <button
                          className="btn-premium glass px-3 border-white border-opacity-10"
                          style={{ color: 'inherit' }}
                          onClick={skipQuestion}
                          disabled={loading}
                        >
                          <i className="bi bi-skip-forward-fill"></i>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="animate-fade-in flex-grow-1">
                    <div className="p-4 rounded-4 glass border-primary border-opacity-20 h-100 d-flex flex-column justify-content-center">
                      <p className="mb-0 fs-5 fw-medium italic" style={{ lineHeight: '1.6' }}>
                        "{submittedAnswer}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          {isShowingFeedback && feedbackData && (
            <div className="mt-4 glass rounded-5 p-4 p-md-5 border-0 shadow-lg animate-fade-in">
              <div className="row g-4 align-items-center mb-5">
                <div className="col-md-8 text-center text-md-start">
                  <h2 className="fw-bold mb-2">AI Performance Review</h2>
                  <p className="opacity-75 mb-0">
                    Analysis of your response for question {questionData.question_number}.
                    {isLastQuestion && (
                      <span className="badge bg-success ms-2 px-3 py-2">🎉 Final Question</span>
                    )}
                  </p>
                </div>
                <div className="col-md-4 text-center">
                  <div className="d-inline-block p-4 rounded-pill glass border-4 border-primary">
                    <span className="display-4 fw-extrabold text-primary">{feedbackData.score}</span>
                    <span className="opacity-50 fw-bold">/10</span>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="p-4 rounded-5 bg-success bg-opacity-10 border border-success border-opacity-10 h-100">
                    <h6 className="fw-bold text-success mb-3 d-flex align-items-center">
                      <i className="bi bi-shield-check fs-4 me-2"></i> Key Strengths
                    </h6>
                    <p className="small mb-0">{feedbackData.strengths}</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="p-4 rounded-5 bg-danger bg-opacity-10 border border-danger border-opacity-10 h-100">
                    <h6 className="fw-bold text-danger mb-3 d-flex align-items-center">
                      <i className="bi bi-lightning-charge fs-4 me-2"></i> Weak Points
                    </h6>
                    <p className="small mb-0">{feedbackData.weak_points || 'N/A'}</p>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="p-4 rounded-5 bg-info bg-opacity-10 border border-info border-opacity-10 h-100">
                    <h6 className="fw-bold text-info mb-3 d-flex align-items-center">
                      <i className="bi bi-graph-up-arrow fs-4 me-2"></i> Suggestions
                    </h6>
                    <p className="small mb-0">{feedbackData.improvement}</p>
                  </div>
                </div>

                <div className="col-12 mt-4 text-center">
                  <button
                    className="btn-premium btn-premium-primary px-5 py-3 fs-5 shadow-lg"
                    onClick={handleProceed}
                    disabled={loading || isFinishing}
                  >
                    {isFinishing ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Generating Final Report...</>
                    ) : isLastQuestion ? (
                      <><i className="bi bi-trophy-fill me-2"></i>Complete & View Final Report</>
                    ) : (
                      <>Next Question <i className="bi bi-arrow-right ms-2"></i></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .line-height-base { line-height: 1.4; }
        .tiny { font-size: 0.7rem; }
        .fw-extrabold { font-weight: 800; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0%   { transform: scale(0.95); opacity: 0.7; }
          70%  { transform: scale(1);    opacity: 1;   }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1);   }
        }
        .animate-wave { animation: wave 1s ease-in-out infinite; }
        .italic { font-style: italic; }
      `}</style>
    </div>
  )
}