from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from database import get_db
from models import Quiz, Question, Response, Answer
from services.ai_engine import grade_answer

router = APIRouter()

@router.get("/quiz/{quiz_id}")
def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_published == True).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found or not published")
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).order_by(Question.order_index).all()
    
    # Don't expose correct answers to participants
    public_questions = []
    for q in questions:
        public_questions.append({
            "id": q.id,
            "type": q.type,
            "question_text": q.question_text,
            "options_json": q.options_json,
            "points": q.points,
            "order_index": q.order_index,
        })
    
    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "difficulty": quiz.difficulty,
        "education_level": quiz.education_level,
        "timer_minutes": quiz.timer_minutes,
        "question_count": len(questions),
        "questions": public_questions,
    }

class AnswerIn(BaseModel):
    question_id: int
    selected_answer: Optional[str] = None

class SubmitQuizRequest(BaseModel):
    participant_name: str
    participant_email: Optional[str] = None
    answers: List[AnswerIn]
    time_taken_seconds: Optional[int] = None

@router.post("/quiz/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, req: SubmitQuizRequest, request: Request, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_published == True).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    
    # Check for duplicate submission (by email if provided)
    if req.participant_email and not quiz.allow_multiple_attempts:
        existing = db.query(Response).filter(
            Response.quiz_id == quiz_id,
            Response.participant_email == req.participant_email
        ).first()
        if existing:
            raise HTTPException(400, "You have already submitted this quiz")
    
    questions = {q.id: q for q in db.query(Question).filter(Question.quiz_id == quiz_id).all()}
    
    ip = request.client.host if request.client else None
    response_obj = Response(
        quiz_id=quiz_id,
        participant_name=req.participant_name,
        participant_email=req.participant_email,
        time_taken_seconds=req.time_taken_seconds,
        ip_address=ip,
    )
    db.add(response_obj)
    db.flush()
    
    total_score = 0.0
    max_score = 0.0
    answer_results = []
    
    for ans in req.answers:
        q = questions.get(ans.question_id)
        if not q:
            continue
        
        max_score += q.points
        is_correct, points = grade_answer(q.type, q.correct_answer or "", ans.selected_answer or "")
        points_earned = points * q.points
        total_score += points_earned
        
        answer_obj = Answer(
            response_id=response_obj.id,
            question_id=ans.question_id,
            selected_answer=ans.selected_answer,
            is_correct=is_correct,
            points_earned=points_earned,
        )
        db.add(answer_obj)
        answer_results.append({
            "question_id": ans.question_id,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
        })
    
    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    response_obj.score = total_score
    response_obj.max_score = max_score
    response_obj.percentage = percentage
    
    db.commit()
    
    return {
        "response_id": response_obj.id,
        "score": total_score,
        "max_score": max_score,
        "percentage": round(percentage, 1),
        "answers": answer_results,
        "message": "Quiz submitted successfully",
    }
