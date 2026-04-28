// /**
//  * API Service - Communicates with Flask backend
//  */

// export const api = {
//   // Start interview: POST resume and job description
//   async startInterview(formData) {
//     const response = await fetch('/api/start-interview', {
//       method: 'POST',
//       body: formData,
//     })
//     return response.json()
//   },

//   // Submit answer and get next question
//   async submitAnswer(answer, timeTaken) {
//     const response = await fetch('/api/submit-answer', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ answer, time_taken: timeTaken }),
//     })
//     return response.json()
//   },

//   // Skip current question
//   async skipQuestion() {
//     const response = await fetch('/api/skip-question', {
//       method: 'POST',
//     })
//     return response.json()
//   },

//   // Get current interview state
//   async getCurrentState() {
//     const response = await fetch('/api/get-current-state')
//     return response.json()
//   },

//   // Finish interview and get final evaluation
//   async finishInterview() {
//     const response = await fetch('/api/finish-interview', {
//       method: 'POST',
//     })
//     return response.json()
//   },

//   // Get final results after interview is finished (called by Results page)
//   async getResults() {
//     const response = await fetch('/api/get-results')
//     return response.json()
//   },

//   // Reset session
//   async reset() {
//     const response = await fetch('/api/reset', {
//       method: 'POST',
//     })
//     return response.json()
//   },

//   // Get history data (JSON list)
//   async getHistory() {
//     const response = await fetch('/api/history', {
//       headers: { 'Accept': 'application/json' }
//     })
//     return response.json()
//   },

//   // Clear history
//   async clearHistory() {
//     const response = await fetch('/api/clear-history', {
//       method: 'POST',
//     })
//     return response.json()
//   },
// }

/**
 * API Service - Communicates with Flask backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

export const api = {
  // Start interview: POST resume and job description
  async startInterview(formData) {
    const response = await fetch(`${BASE_URL}/api/start-interview`, {
      method: 'POST',
      body: formData,
    })
    return response.json()
  },

  // Submit answer and get next question
  async submitAnswer(answer, timeTaken) {
    const response = await fetch(`${BASE_URL}/api/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, time_taken: timeTaken }),
    })
    return response.json()
  },

  // Skip current question
  async skipQuestion() {
    const response = await fetch(`${BASE_URL}/api/skip-question`, {
      method: 'POST',
    })
    return response.json()
  },

  // Get current interview state
  async getCurrentState() {
    const response = await fetch(`${BASE_URL}/api/get-current-state`)
    return response.json()
  },

  // Finish interview and get final evaluation
  async finishInterview() {
    const response = await fetch(`${BASE_URL}/api/finish-interview`, {
      method: 'POST',
    })
    return response.json()
  },

  // Get final results after interview is finished
  async getResults() {
    const response = await fetch(`${BASE_URL}/api/get-results`)
    return response.json()
  },

  // Reset session
  async reset() {
    const response = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
    })
    return response.json()
  },

  // Get history data (JSON list)
  async getHistory() {
    const response = await fetch(`${BASE_URL}/api/history`, {
      headers: { 'Accept': 'application/json' }
    })
    return response.json()
  },

  // Clear history
  async clearHistory() {
    const response = await fetch(`${BASE_URL}/api/clear-history`, {
      method: 'POST',
    })
    return response.json()
  },
}