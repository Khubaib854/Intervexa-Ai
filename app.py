"""
InterviewPro - AI-Powered Mock Interview Platform
Main Flask application — stores interview state in a server-side file
instead of session cookies to avoid cookie size overflow (4KB limit).
"""

import os
import re
import json
from datetime import datetime
from flask import Flask, request, session, jsonify
from flask_cors import CORS
from backend.ai_interview_engine import (
    pdf_to_text, generate_first_question, generate_followup_question,
    evaluate_answer, generate_final_evaluation, cleanup_audio,
    generate_audio, TOTAL_QUESTIONS, UPLOAD_DIR, DIFFICULTY_PROMPTS,
    _gemini_call
)

app = Flask(__name__,
            template_folder=os.path.join('Frontend', 'templates'),
            static_folder=os.path.join('Frontend', 'static'))
CORS(app, origins=["https://intervexa-ai.vercel.app/"], supports_credentials=True)
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.secret_key = os.environ.get('SECRET_KEY', 'interviewpro-secret-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(UPLOAD_DIR, exist_ok=True)

HISTORY_FILE     = os.path.join('backend', 'history.json')
STATE_FILE       = os.path.join('backend', 'interview_state.json')   # ← replaces session


# ---------------------------------------------------------------------------
# Server-side state helpers (replaces Flask session for large data)
# ---------------------------------------------------------------------------

def _save_state(state: dict):
    """Save interview state to a server-side JSON file."""
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2)


def _load_state() -> dict:
    """Load interview state from server-side JSON file."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def _clear_state():
    """Delete the server-side state file."""
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)


# ---------------------------------------------------------------------------
# History helpers
# ---------------------------------------------------------------------------

def _load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.loads(f.read())
        except (json.JSONDecodeError, IOError):
            pass
    return []


def _save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        f.write(json.dumps(history, indent=2))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf'}


# ---------------------------------------------------------------------------
# API: Start Interview
# ---------------------------------------------------------------------------

@app.route('/api/start-interview', methods=['POST'])
def api_start_interview():
    resume_file     = request.files.get('resume')
    job_description = request.form.get('job_description', '').strip()
    difficulty      = request.form.get('difficulty', 'easy').strip()

    if difficulty not in DIFFICULTY_PROMPTS:
        difficulty = 'easy'
    if not resume_file or not allowed_file(resume_file.filename):
        return jsonify({'error': 'Please upload a valid PDF resume.'}), 400
    if not job_description:
        return jsonify({'error': 'Please enter a job description.'}), 400

    resume_path = os.path.join(UPLOAD_DIR, 'resume.pdf')
    resume_file.save(resume_path)

    try:
        resume_text = pdf_to_text(resume_path)
    except Exception as e:
        return jsonify({'error': f'Could not read PDF: {str(e)}'}), 400

    if not resume_text.strip():
        return jsonify({'error': 'The PDF appears to be empty or unreadable.'}), 400

    cleanup_audio()

    try:
        result = generate_first_question(resume_text, job_description, difficulty)
    except Exception as e:
        return jsonify({'error': f'Failed to generate question: {str(e)}'}), 500

    # ── Store ALL state server-side (not in session cookie) ──────────────────
    state = {
        'interview_active': True,
        'resume_text':      resume_text,
        'job_description':  job_description,
        'difficulty':       difficulty,
        'current_question': 1,
        'conversation':     [{'role': 'interviewer', 'text': result['question_text']}],
        'evaluations':      [],
        'timers':           [],
    }
    _save_state(state)

    # Only keep a tiny flag in the session cookie
    session['interview_active'] = True

    return jsonify({
        'success':         True,
        'question_text':   result['question_text'],
        'audio_data':      result['audio_data'],
        'question_number': 1,
        'total_questions': TOTAL_QUESTIONS,
    })


# ---------------------------------------------------------------------------
# API: Submit Answer
# ---------------------------------------------------------------------------

@app.route('/api/submit-answer', methods=['POST'])
def api_submit_answer():
    state = _load_state()
    if not state.get('interview_active'):
        return jsonify({'error': 'No active interview session.'}), 400

    data        = request.get_json()
    answer_text = data.get('answer', '').strip() if data else ''
    time_taken  = data.get('time_taken', 0)      if data else 0

    if not answer_text:
        return jsonify({'error': 'Please provide an answer.'}), 400

    current_q       = state['current_question']
    conversation    = state['conversation']
    job_description = state['job_description']
    resume_text     = state['resume_text']
    difficulty      = state.get('difficulty', 'easy')

    # Find last interviewer question
    last_question = ''
    for entry in reversed(conversation):
        if entry['role'] == 'interviewer':
            last_question = entry['text']
            break

    conversation.append({'role': 'candidate', 'text': answer_text})

    # Evaluate answer
    try:
        evaluation = evaluate_answer(last_question, answer_text, job_description)
    except Exception:
        evaluation = {
            'score':       5,
            'feedback':    'Evaluation temporarily unavailable.',
            'strengths':   'Answer provided',
            'weak_points': 'N/A',
            'improvement': 'N/A',
        }

    evaluations = state['evaluations']
    evaluations.append({
        'question':   last_question,
        'answer':     answer_text,
        'time_taken': time_taken,
        'skipped':    False,
        **evaluation,
    })
    state['timers'].append(time_taken)

    if current_q >= TOTAL_QUESTIONS:
        # ── Last question answered ────────────────────────────────────────────
        state['conversation'] = conversation
        state['evaluations']  = evaluations
        _save_state(state)
        print(f'[Interview] Question {current_q}/{TOTAL_QUESTIONS} answered — interview finished.')
        return jsonify({
            'success':          True,
            'finished':         True,
            'evaluation':       evaluation,
            'question_number':  current_q,
            'total_questions':  TOTAL_QUESTIONS,
        })

    # ── Generate next question ────────────────────────────────────────────────
    next_q_num = current_q + 1
    try:
        result = generate_followup_question(
            resume_text, job_description, conversation, next_q_num, difficulty)
    except Exception as e:
        return jsonify({'error': f'Failed to generate next question: {str(e)}'}), 500

    conversation.append({'role': 'interviewer', 'text': result['question_text']})
    state['conversation']    = conversation
    state['evaluations']     = evaluations
    state['current_question'] = next_q_num
    _save_state(state)

    return jsonify({
        'success':          True,
        'finished':         False,
        'evaluation':       evaluation,
        'question_text':    result['question_text'],
        'audio_data':       result['audio_data'],
        'question_number':  next_q_num,
        'total_questions':  TOTAL_QUESTIONS,
    })


# ---------------------------------------------------------------------------
# API: Skip Question
# ---------------------------------------------------------------------------

@app.route('/api/skip-question', methods=['POST'])
def api_skip_question():
    state = _load_state()
    if not state.get('interview_active'):
        return jsonify({'error': 'No active interview session.'}), 400

    current_q       = state['current_question']
    conversation    = state['conversation']
    job_description = state['job_description']
    resume_text     = state['resume_text']
    difficulty      = state.get('difficulty', 'easy')

    last_question = ''
    for entry in reversed(conversation):
        if entry['role'] == 'interviewer':
            last_question = entry['text']
            break

    conversation.append({'role': 'candidate', 'text': '[Skipped]'})
    state['evaluations'].append({
        'question':   last_question,
        'answer':     'Question was skipped.',
        'score':      0,
        'feedback':   'This question was skipped.',
        'strengths':  'N/A',
        'weak_points':'N/A',
        'improvement':'Try answering all questions for a complete evaluation.',
        'time_taken': 0,
        'skipped':    True,
    })

    if current_q >= TOTAL_QUESTIONS:
        state['conversation'] = conversation
        _save_state(state)
        return jsonify({
            'success':         True,
            'finished':        True,
            'question_number': current_q,
            'total_questions': TOTAL_QUESTIONS,
        })

    next_q_num = current_q + 1
    try:
        result = generate_followup_question(
            resume_text, job_description, conversation, next_q_num, difficulty)
    except Exception as e:
        return jsonify({'error': f'Failed to generate next question: {str(e)}'}), 500

    conversation.append({'role': 'interviewer', 'text': result['question_text']})
    state['conversation']     = conversation
    state['current_question'] = next_q_num
    _save_state(state)

    return jsonify({
        'success':         True,
        'finished':        False,
        'question_text':   result['question_text'],
        'audio_data':      result['audio_data'],
        'question_number': next_q_num,
        'total_questions': TOTAL_QUESTIONS,
    })


# ---------------------------------------------------------------------------
# API: Finish Interview
# ---------------------------------------------------------------------------

@app.route('/api/finish-interview', methods=['POST'])
def api_finish_interview():
    state = _load_state()

    if not state.get('interview_active'):
        print('[finish-interview] ERROR: no active interview in state file')
        return jsonify({'error': 'No active interview session.'}), 400

    evaluations = state.get('evaluations', [])
    print(f'[finish-interview] evaluations found: {len(evaluations)}')

    if not evaluations:
        return jsonify({'error': 'No answers to evaluate.'}), 400

    try:
        final_eval = generate_final_evaluation(
            state['resume_text'], state['job_description'], evaluations)
    except Exception as ex:
        print(f'[finish-interview] generate_final_evaluation error: {ex}')
        avg = sum(e.get('score', 0) for e in evaluations) / len(evaluations)
        final_eval = {
            'overall_score':       round(avg, 1),
            'overall_grade':       'C',
            'summary':             'Evaluation completed.',
            'top_strengths':       ['Completed the interview'],
            'areas_to_improve':    ['Continue practicing'],
            'tips':                ['Practice with the STAR method'],
            'hire_recommendation': 'More practice recommended.',
        }

    # Save to history
    history_entry = {
        'date':               datetime.now().strftime('%Y-%m-%d %H:%M'),
        'job_description':    state.get('job_description', '')[:120],
        'difficulty':         state.get('difficulty', 'easy'),
        'overall_score':      final_eval.get('overall_score', 0),
        'overall_grade':      final_eval.get('overall_grade', 'N/A'),
        'hire_recommendation':final_eval.get('hire_recommendation', ''),
        'summary':            final_eval.get('summary', ''),
        'questions_answered': len([e for e in evaluations if not e.get('skipped')]),
        'questions_skipped':  len([e for e in evaluations if e.get('skipped')]),
        'total_questions':    TOTAL_QUESTIONS,
        'evaluations':        evaluations,
    }
    history = _load_history()
    history.append(history_entry)
    _save_history(history)

    # Store final eval in state for Results page, clear active flag
    state['interview_active']  = False
    state['final_evaluation']  = final_eval
    _save_state(state)
    session.pop('interview_active', None)

    print('[finish-interview] Done — returning final evaluation.')
    return jsonify({'success': True, 'evaluation': final_eval})


# ---------------------------------------------------------------------------
# API: Get Results (called by Results page after finish-interview)
# ---------------------------------------------------------------------------

@app.route('/api/get-results', methods=['GET'])
def api_get_results():
    """Return the saved final evaluation from the state file."""
    state = _load_state()
    final_eval = state.get('final_evaluation')
    if not final_eval:
        print('[get-results] No final_evaluation found in state file')
        return jsonify({'error': 'No results found.'}), 404
    print('[get-results] Returning final evaluation.')
    return jsonify({'success': True, 'evaluation': final_eval})


# ---------------------------------------------------------------------------
# API: Get Current State
# ---------------------------------------------------------------------------

@app.route('/api/get-current-state', methods=['GET'])
def api_get_current_state():
    state = _load_state()
    if not state.get('interview_active'):
        return jsonify({'error': 'No active interview.'}), 400

    conversation = state.get('conversation', [])
    current_q    = state.get('current_question', 1)

    last_question = ''
    for entry in reversed(conversation):
        if entry['role'] == 'interviewer':
            last_question = entry['text']
            break

    audio_data = generate_audio(last_question, current_q)
    return jsonify({
        'question_text':   last_question,
        'audio_data':      audio_data,
        'question_number': current_q,
        'total_questions': TOTAL_QUESTIONS,
    })


# ---------------------------------------------------------------------------
# API: Reset
# ---------------------------------------------------------------------------

@app.route('/api/reset', methods=['POST'])
def api_reset():
    cleanup_audio()
    _clear_state()
    session.clear()
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# API: History
# ---------------------------------------------------------------------------

@app.route('/history', methods=['GET'])
@app.route('/api/history', methods=['GET'])
def history_api():
    entries = _load_history()
    entries.reverse()
    return jsonify(entries)


@app.route('/api/clear-history', methods=['POST'])
def api_clear_history():
    if os.path.exists(HISTORY_FILE):
        os.remove(HISTORY_FILE)
    return jsonify({'success': True})


# ---------------------------------------------------------------------------
# Interview Autopsy
# ---------------------------------------------------------------------------

@app.route('/api/autopsy', methods=['POST'])
def api_autopsy():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided.'}), 400

    job_role    = data.get('job_role', '').strip()
    company     = data.get('company', '').strip()
    resume_text = data.get('resume_text', '').strip()
    qa_pairs    = data.get('qa_pairs', [])

    if not job_role or not qa_pairs:
        return jsonify({'error': 'Job role and at least one Q&A pair are required.'}), 400

    def extract_json(raw):
        text = raw.strip()
        text = re.sub(r'```[\w]*\n?', '', text)
        text = text.replace('```', '').strip()
        start = text.find('{')
        end   = text.rfind('}')
        if start == -1 or end == -1 or end <= start:
            raise ValueError(f'No JSON found: {text[:300]}')
        json_str = text[start:end+1]
        json_str = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', json_str)
        return json.loads(json_str)

    analysed = []
    for i, pair in enumerate(qa_pairs):
        q = pair.get('question', '').strip()
        a = pair.get('answer', '').strip()
        if not q or not a:
            continue

        prompt = (
            f"You are a world-class interview coach. Analyse this specific interview answer.\n\n"
            f"Job Role: {job_role}\n"
            f"Company: {company if company else 'Not specified'}\n"
            f"Candidate Background: {resume_text[:400] if resume_text else 'Not provided'}\n\n"
            f"Question: {q}\n"
            f"Candidate Answer: {a}\n\n"
            f"Be specific to THIS answer. Reference the actual words used.\n\n"
            f"Return ONLY raw JSON, no markdown, no explanation:\n"
            f'{{"score": 5, "verdict": "Average", "interviewer_thought": "first person thought", '
            f'"what_killed_it": "specific weakness or None", '
            f'"ideal_answer_hint": "what great answer would include", '
            f'"feedback": "direct coaching feedback"}}\n\n'
            f"verdict must be one of: Excellent, Good, Average, Weak, Fatal"
        )

        try:
            raw    = _gemini_call(prompt)
            result = extract_json(raw)
        except Exception as e:
            return jsonify({'error': f'Failed on Question {i+1}: {str(e)}'}), 500

        analysed.append({'question': q, 'answer': a, **result})

    if not analysed:
        return jsonify({'error': 'No valid Q&A pairs found.'}), 400

    fatal_index  = 0
    lowest_score = 11
    for i, item in enumerate(analysed):
        s = item.get('score', 10)
        if isinstance(s, (int, float)) and s < lowest_score:
            lowest_score = s
            fatal_index  = i

    scores    = [item.get('score', 5) for item in analysed if isinstance(item.get('score'), (int, float))]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 5.0
    qa_summary = '\n'.join([
        f"Q{i+1} score={item.get('score','?')}/10 verdict={item.get('verdict','?')}: {item['question'][:60]}"
        for i, item in enumerate(analysed)
    ])

    summary_prompt = (
        f"You are an expert interview coach. Write a post-interview autopsy summary.\n\n"
        f"Job Role: {job_role}\n"
        f"Company: {company if company else 'Not specified'}\n"
        f"Average Score: {avg_score}/10\n"
        f"Worst Answer: Q{fatal_index + 1}\n\n"
        f"Performance:\n{qa_summary}\n\n"
        f"Return ONLY raw JSON, no markdown, no explanation:\n"
        f'{{"overall_verdict": "Needs Work", "death_certificate": "specific reason they failed", '
        f'"survival_tips": ["tip1", "tip2", "tip3"], '
        f'"rehire_readiness": "2 weeks", "one_thing_to_fix": "most important fix"}}\n\n'
        f"overall_verdict must be one of: Strong Candidate, Borderline, Needs Work, Not Ready"
    )

    try:
        raw2    = _gemini_call(summary_prompt)
        summary = extract_json(raw2)
    except Exception as e:
        return jsonify({'error': f'Summary failed: {str(e)}'}), 500

    return jsonify({
        'success':             True,
        'job_role':            job_role,
        'company':             company,
        'average_score':       avg_score,
        'fatal_question_index':fatal_index,
        'analysed':            analysed,
        'summary':             summary,
    })


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)