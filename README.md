# InterviewPro — AI-Powered Mock Interview Platform

An intelligent mock interview platform that uses Google's Gemini AI to conduct personalized, realistic interview practice sessions. Upload your resume, paste a job description, and practice with AI-generated questions tailored to your profile.

## Features

| Feature                       | Description                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Resume-Tailored Questions** | AI generates questions based on your resume and target job description          |
| **Voice Interview**           | Listen to questions via audio and respond with your microphone (Web Speech API) |
| **Three Difficulty Levels**   | Choose Easy, Medium, or Hard to match your preparation needs                    |
| **Real-Time Scoring**         | Each answer scored 1-10 with detailed strengths and improvement areas           |
| **Skip Questions**            | Skip any question you want and move to the next one                             |
| **Per-Question Timer**        | Track how long you spend on each question                                       |
| **Comprehensive Report**      | Final evaluation with overall grade, hire recommendation, and tips              |
| **PDF Export**                | Download your results as a professional PDF report                              |
| **Interview History**         | Track past interviews and monitor your progress over time                       |
| **Dark Mode**                 | Toggle between light and dark themes for comfortable usage                      |
| **Responsive Design**         | Works on desktop, tablet, and mobile devices                                    |

## Tech Stack

### Backend

- **Flask** — Python web framework (routing, sessions, REST API)
- **Google Gemini 2.5 Flash** — AI question generation and answer evaluation
- **gTTS** — Google Text-to-Speech for audio question playback
- **pdfplumber** — PDF text extraction for resume parsing
- **python-dotenv** — Environment variable management

### Frontend

- **Bootstrap 5.3** — Responsive UI framework with custom theming
- **Web Speech API** — Browser-native speech-to-text for voice answers
- **html2pdf.js** — Client-side PDF generation for report export
- **Vanilla JavaScript** — No framework dependencies

## Project Structure

```
InterviewPro/
├── app.py                      # Flask application (routes + API endpoints)
├── backend/
│   ├── audiofunctions.py       # AI engine (Gemini, TTS, evaluation)
│   ├── history.json            # Saved interview history
│   └── uploads/                # Temporary PDF uploads
├── templates/
│   ├── base.html               # Shared layout (navbar, footer, dark mode)
│   ├── start.html              # Landing page
│   ├── setup.html              # Resume upload + job description + difficulty
│   ├── interview.html          # Interview session UI
│   ├── results.html            # Results report + PDF export
│   ├── history.html            # Interview history page
│   └── about.html              # About the project
├── static/
│   ├── css/styles.css          # Custom CSS + dark mode
│   ├── js/scripts.js           # Interview page logic
│   ├── audio/                  # Generated TTS audio files
│   └── assets/favicon.ico      # Site icon
├── requirements.txt
├── run.bat                     # Windows launcher
└── .env                        # API key (GEMINI_API_KEY)
```

## Setup & Installation

### Prerequisites

- Python 3.9+
- A Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))

### Steps


1. **Create a virtual environment**

   ```bash
   python -m venv .venv
   .venv\Scripts\activate     # Windows
   source .venv/bin/activate   # macOS/Linux
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set up your API key**
   Create a `.env` file in the project root:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the application**

   ```bash
   python app.py
   ```

   Or on Windows, just double-click `run.bat`.

5. **Open in browser**
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

## API Endpoints

| Method | Endpoint                 | Description                                   |
| ------ | ------------------------ | --------------------------------------------- |
| POST   | `/api/start-interview`   | Upload resume + job desc, get first question  |
| POST   | `/api/submit-answer`     | Submit answer, get evaluation + next question |
| POST   | `/api/skip-question`     | Skip current question, get next one           |
| POST   | `/api/finish-interview`  | Generate final evaluation report              |
| GET    | `/api/get-current-state` | Get current interview state                   |
| POST   | `/api/reset`             | Clear session                                 |
| POST   | `/api/clear-history`     | Clear all saved interview history             |

## Pages

| Route        | Page      | Description                                         |
| ------------ | --------- | --------------------------------------------------- |
| `/`          | Landing   | Hero, features, how-it-works                        |
| `/setup`     | Setup     | Resume upload, job description, difficulty selector |
| `/interview` | Interview | 5-question AI interview with audio, timer, skip     |
| `/results`   | Results   | Scores, feedback, tips, PDF export                  |
| `/history`   | History   | Past interview records with stats                   |
| `/about`     | About     | Project info, tech stack, architecture              |

## Interview Question Types

1. **Opening** — Introduction and motivation
2. **Behavioral** — "Tell me about a time when..." (STAR method)
3. **Technical** — Skills and tools from job description
4. **Situational** — "What would you do if..." scenarios
5. **Closing** — Career goals and role alignment

## Browser Compatibility

| Browser | Speech-to-Text | Audio Playback | PDF Export |
| ------- | :------------: | :------------: | :--------: |
| Chrome  |      Yes       |      Yes       |    Yes     |
| Edge    |      Yes       |      Yes       |    Yes     |
| Firefox |       No       |      Yes       |    Yes     |
| Safari  |    Partial     |      Yes       |    Yes     |

## License

This project is developed as a final year degree project.
