

import os
import re
import io
import json
import time
import base64
import pdfplumber
from gtts import gTTS
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ── Groq client setup ─────────────────────────────────────────────────────────
groq_api_key = os.getenv('GROQ_API_KEY')
if groq_api_key:
    print(f"[Groq] API Key loaded. Prefix: {groq_api_key[:6]}...{groq_api_key[-4:]}")
else:
    print("[Groq] ERROR: GROQ_API_KEY not found in .env file!")

client = Groq(api_key=groq_api_key)

TOTAL_QUESTIONS = 5
UPLOAD_DIR = os.path.join('backend', 'uploads')

# Difficulty level prompt modifiers
DIFFICULTY_PROMPTS = {
    'easy': {
        'tone': 'warm, friendly, and encouraging',
        'complexity': 'simple, everyday language — like chatting with a friend',
        'word_limit': 60,
        'question_style': 'basic and easy-to-answer',
    },
    'medium': {
        'tone': 'professional but approachable',
        'complexity': 'clear professional language with some industry terms',
        'word_limit': 80,
        'question_style': 'moderately challenging, expecting structured answers',
    },
    'hard': {
        'tone': 'formal and business-like',
        'complexity': 'professional language with industry terminology and depth',
        'word_limit': 100,
        'question_style': 'challenging, expecting detailed STAR-method answers with specifics',
    },
}

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Groq helper (replaces _gemini_call)
# ---------------------------------------------------------------------------

def _gemini_call(prompt, max_retries=3):
   
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
            )
            result = response.choices[0].message.content
            print(f"[Groq] Response received ({len(result)} chars)")
            return result
        except Exception as e:
            err_msg = str(e)
            print(f"[Groq] Error (attempt {attempt+1}/{max_retries}): {err_msg}")
            if attempt < max_retries - 1:
                print(f"[Groq] Retrying in 5 seconds...")
                time.sleep(5)
            else:
                raise


def _clean_text_for_speech(text):
    """Remove markdown formatting so TTS reads cleanly."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)   # bold
    text = re.sub(r'\*(.+?)\*', r'\1', text)        # italic
    text = re.sub(r'#{1,6}\s*', '', text)            # headings
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text)   # code
    text = re.sub(r'\n{2,}', '. ', text)             # multiple newlines
    text = text.replace('\n', ' ')
    return text.strip()


# ---------------------------------------------------------------------------
# PDF parsing
# ---------------------------------------------------------------------------

def pdf_to_text(file_path):
    """Extract text from a PDF file."""
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text.strip()


# ---------------------------------------------------------------------------
# Audio generation
# ---------------------------------------------------------------------------

def generate_audio(text, question_number):
    """Generate TTS audio in memory and return a base64 data URL."""
    clean = _clean_text_for_speech(text)
    tts = gTTS(text=clean, lang='en')
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    print(f"[Audio] Generated in-memory audio for question {question_number}")
    return f'data:audio/mp3;base64,{b64}'


def cleanup_audio():
    """No-op: audio is no longer saved to disk."""
    pass


# ---------------------------------------------------------------------------
# Interview logic
# ---------------------------------------------------------------------------

def generate_first_question(resume_text, job_description, difficulty='easy'):
    """Generate a personalized greeting and opening interview question."""
    diff = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS['easy'])
    prompt = f"""You are a {diff['tone']} interviewer conducting a mock interview practice session.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

Instructions:
- Greet the candidate by their name (extract from resume).
- Mention the role they are applying for.
- Ask ONE {diff['question_style']} opening question like "Can you briefly introduce yourself and tell me why you're interested in this role?"
- Keep the question short and conversational (under {diff['word_limit']} words total).
- Use {diff['complexity']}.
- Do NOT use any markdown formatting like **, ##, etc.
- Speak naturally."""

    response = _gemini_call(prompt)
    audio_data = generate_audio(response, 1)
    return {
        'question_text': response,
        'audio_data': audio_data,
        'question_number': 1
    }


def generate_followup_question(resume_text, job_description,
                               conversation_history, question_number,
                               difficulty='easy'):
    """Generate the next interview question based on the conversation so far."""
    diff = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS['easy'])
    history_text = ""
    for entry in conversation_history:
        if entry['role'] == 'interviewer':
            history_text += f"Interviewer: {entry['text']}\n"
        else:
            history_text += f"Candidate: {entry['text']}\n"

    prompt = f"""You are a {diff['tone']} interviewer conducting a mock interview practice.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

CONVERSATION SO FAR:
{history_text}

Instructions:
- First, give a brief acknowledgment of the candidate's last answer (1 short sentence).
- Then, based on the resume, job description, and conversation so far, ask the most relevant, insightful, and context-aware follow-up interview question for question {question_number} of {TOTAL_QUESTIONS}.
- The question can be of any type (behavioral, technical, situational, closing, etc.) as appropriate for the flow of the interview.
- Make sure the question is not a repeat and fits naturally after the previous discussion.
- Keep the question concise (under {diff['word_limit']} words total).
- Use {diff['complexity']}.
- Ask only ONE clear question at a time — no multi-part questions.
- Do NOT use any markdown formatting.
- Do NOT repeat questions already asked."""

    response = _gemini_call(prompt)
    audio_data = generate_audio(response, question_number)
    return {
        'question_text': response,
        'audio_data': audio_data,
        'question_number': question_number
    }


def evaluate_answer(question_text, answer_text, job_description):
    """Evaluate a single answer and return score + feedback."""
    prompt = f"""You are an expert interview coach evaluating a candidate's answer.

JOB DESCRIPTION:
{job_description}

INTERVIEW QUESTION:
{question_text}

CANDIDATE'S ANSWER:
{answer_text}

Evaluate this answer and respond in EXACTLY this JSON format (no markdown, no code blocks):
{{"score": <number 1-10>, "feedback": "<2-3 sentences of constructive feedback>", "strengths": "<1-2 key strengths>", "weak_points": "<1-2 specific weak points>", "improvement": "<1-2 specific areas to improve>"}}

Scoring guide:
- 1-3: Poor (irrelevant, very short, or incoherent)
- 4-5: Below average (partially relevant but missing key elements)
- 6-7: Good (relevant with decent structure)
- 8-9: Very good (specific, well-structured, compelling)
- 10: Exceptional (perfect STAR format, highly relevant, impressive)"""

    response = _gemini_call(prompt)
    try:
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        pass

    return {
        'score': 5,
        'feedback': response[:200],
        'strengths': 'Answer was provided',
        'weak_points': 'N/A',
        'improvement': 'Try to be more specific and structured'
    }


def generate_final_evaluation(resume_text, job_description, evaluations):
    """Generate a comprehensive final evaluation based on all answers."""
    eval_summary = ""
    for i, ev in enumerate(evaluations, 1):
        eval_summary += (f"Q{i}: Score {ev.get('score', 'N/A')}/10 - "
                         f"{ev.get('feedback', 'N/A')}\n")

    avg_score = sum(e.get('score', 0) for e in evaluations) / max(len(evaluations), 1)

    prompt = f"""You are a senior career coach providing a comprehensive interview performance review.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{resume_text}

INDIVIDUAL QUESTION EVALUATIONS:
{eval_summary}

AVERAGE SCORE: {avg_score:.1f}/10

Provide a comprehensive review in EXACTLY this JSON format (no markdown, no code blocks):
{{
  "overall_score": {avg_score:.1f},
  "overall_grade": "<A/B/C/D/F based on score>",
  "summary": "<3-4 sentence overall assessment>",
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areas_to_improve": ["<area 1>", "<area 2>", "<area 3>"],
  "tips": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>", "<actionable tip 4>"],
  "hire_recommendation": "<Strong Yes / Yes / Maybe / No with 1 sentence reasoning>"
}}

Grading scale: A (9-10), B (7-8.9), C (5-6.9), D (3-4.9), F (1-2.9)"""

    response = _gemini_call(prompt)
    try:
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            result['overall_score'] = round(avg_score, 1)
            return result
    except (json.JSONDecodeError, AttributeError):
        pass

    return {
        'overall_score': round(avg_score, 1),
        'overall_grade': 'C',
        'summary': 'Interview evaluation completed.',
        'top_strengths': ['Completed the interview'],
        'areas_to_improve': ['Practice more structured responses'],
        'tips': ['Use the STAR method', 'Research the company', 'Practice common questions'],
        'hire_recommendation': 'Maybe - More practice recommended.'
    }
