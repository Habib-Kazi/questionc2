import os
import json
import re
from groq import Groq
from typing import List, Dict, Any

client = Groq(api_key=os.getenv("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
"))

QUESTION_TYPE_PROMPTS = {
    "mcq": "multiple choice questions with 4 options (A, B, C, D). Mark the correct answer clearly.",
    "short_answer": "short answer questions requiring 1-3 sentence responses.",
    "true_false": "true/false questions. Answer must be exactly 'True' or 'False'.",
    "fill_blank": "fill-in-the-blank questions with a single blank (___). Provide the exact word/phrase.",
    "long_answer": "essay/long answer questions requiring detailed explanations.",
}

DIFFICULTY_DESCRIPTIONS = {
    "easy": "straightforward recall and comprehension questions",
    "medium": "application and analysis questions requiring understanding",
    "hard": "complex synthesis and evaluation questions",
    "analytical": "deep analytical questions requiring critical thinking and reasoning",
    "creative": "creative and open-ended questions encouraging novel thinking",
    "iq_based": "logical reasoning and pattern recognition questions",
}

EDUCATION_CONTEXTS = {
    "school": "for high school students (ages 14-18)",
    "college": "for college students (ages 18-21)",
    "undergraduate": "for undergraduate university students",
    "graduate": "for graduate/postgraduate students",
    "research": "for researchers and subject matter experts",
}

def generate_questions(
    content: str,
    question_type: str,
    num_questions: int,
    education_level: str,
    difficulty: str,
) -> List[Dict[str, Any]]:

    q_type_prompt = QUESTION_TYPE_PROMPTS.get(question_type, QUESTION_TYPE_PROMPTS["mcq"])
    diff_desc = DIFFICULTY_DESCRIPTIONS.get(difficulty, DIFFICULTY_DESCRIPTIONS["medium"])
    edu_ctx = EDUCATION_CONTEXTS.get(education_level, EDUCATION_CONTEXTS["college"])

    system_prompt = f"""You are an expert educational assessment designer. 
Generate exactly {num_questions} {q_type_prompt}
The questions should be {diff_desc}, appropriate {edu_ctx}.
You MUST respond with ONLY a valid JSON array. No markdown, no explanation, just JSON.

For MCQ questions, use this format:
{{
  "type": "mcq",
  "question_text": "Question here?",
  "options": {{"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"}},
  "correct_answer": "A",
  "explanation": "Why A is correct"
}}

For true/false:
{{
  "type": "true_false",
  "question_text": "Statement here.",
  "options": {{"A": "True", "B": "False"}},
  "correct_answer": "True",
  "explanation": "Explanation here"
}}

For fill_blank:
{{
  "type": "fill_blank",
  "question_text": "The ___ is the powerhouse of the cell.",
  "options": null,
  "correct_answer": "mitochondria",
  "explanation": "Explanation here"
}}

For short_answer and long_answer:
{{
  "type": "short_answer",
  "question_text": "Question here?",
  "options": null,
  "correct_answer": "Model answer here",
  "explanation": "Grading criteria"
}}"""

    user_prompt = f"""Based on the following content, generate {num_questions} {question_type} questions:

CONTENT:
{content[:8000]}

Generate exactly {num_questions} questions as a JSON array."""

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    questions = json.loads(raw)

    normalized = []
    for i, q in enumerate(questions):
        normalized.append({
            "type": question_type,
            "question_text": q.get("question_text", ""),
            "options_json": q.get("options"),
            "correct_answer": str(q.get("correct_answer", "")),
            "explanation": q.get("explanation", ""),
            "order_index": i,
            "points": 1,
        })

    return normalized


def grade_answer(question_type: str, correct_answer: str, user_answer: str) -> tuple:
    """Grade a user answer. Returns (is_correct, points_earned)"""
    if not user_answer or not user_answer.strip():
        return False, 0.0

    if question_type in ["mcq", "true_false"]:
        is_correct = user_answer.strip().upper() == correct_answer.strip().upper()
        return is_correct, 1.0 if is_correct else 0.0

    elif question_type == "fill_blank":
        is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
        return is_correct, 1.0 if is_correct else 0.0

    elif question_type in ["short_answer", "long_answer"]:
        prompt = f"""Grade this answer on a scale of 0.0 to 1.0.
Model Answer: {correct_answer}
Student Answer: {user_answer}

Respond with ONLY a JSON: {{"score": 0.8, "is_correct": true}}
Score >= 0.6 means is_correct = true."""

        try:
            response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r'^```json\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            result = json.loads(raw)
            score = float(result.get("score", 0))
            return result.get("is_correct", score >= 0.6), score
        except:
            return False, 0.0

    return False, 0.0


def suggest_quiz_title(content: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{
                "role": "user",
                "content": f"Suggest a concise quiz title (5-8 words) for this content. Reply ONLY with the title:\n\n{content[:1000]}"
            }],
            max_tokens=30,
            temperature=0.5,
        )
        return response.choices[0].message.content.strip().strip('"')
    except:
        return "Untitled Quiz"
