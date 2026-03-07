import csv
import io
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Quiz, Question, Response, Answer
from services.auth_service import get_current_user

router = APIRouter()

@router.get("/quizzes")
def get_creator_quizzes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quizzes = db.query(Quiz).filter(Quiz.creator_id == current_user.id).order_by(Quiz.created_at.desc()).all()
    result = []
    for q in quizzes:
        response_count = db.query(Response).filter(Response.quiz_id == q.id).count()
        avg_score = db.query(func.avg(Response.percentage)).filter(Response.quiz_id == q.id).scalar()
        result.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "education_level": q.education_level,
            "timer_minutes": q.timer_minutes,
            "is_published": q.is_published,
            "created_at": q.created_at.isoformat() if q.created_at else None,
            "response_count": response_count,
            "avg_score": round(avg_score, 1) if avg_score else 0,
            "question_count": db.query(Question).filter(Question.quiz_id == q.id).count(),
        })
    return result

@router.get("/results/{quiz_id}")
def get_quiz_results(quiz_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.creator_id == current_user.id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    
    responses = db.query(Response).filter(Response.quiz_id == quiz_id).order_by(Response.submitted_at.desc()).all()
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).order_by(Question.order_index).all()
    
    # Score distribution buckets
    buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    scores = []
    participants = []
    
    for r in responses:
        pct = r.percentage or 0
        scores.append(pct)
        
        if pct <= 20: buckets["0-20"] += 1
        elif pct <= 40: buckets["21-40"] += 1
        elif pct <= 60: buckets["41-60"] += 1
        elif pct <= 80: buckets["61-80"] += 1
        else: buckets["81-100"] += 1
        
        participants.append({
            "id": r.id,
            "name": r.participant_name,
            "email": r.participant_email,
            "score": r.score,
            "max_score": r.max_score,
            "percentage": round(pct, 1),
            "time_taken_seconds": r.time_taken_seconds,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
        })
    
    # Question difficulty analysis
    question_stats = []
    for q in questions:
        answers = db.query(Answer).filter(Answer.question_id == q.id).all()
        total = len(answers)
        correct = sum(1 for a in answers if a.is_correct)
        rate = (correct / total * 100) if total > 0 else 0
        question_stats.append({
            "id": q.id,
            "question_text": q.question_text[:100],
            "type": q.type,
            "total_answers": total,
            "correct_count": correct,
            "correct_rate": round(rate, 1),
        })
    
    # Sort to find hardest question
    hardest = sorted(question_stats, key=lambda x: x["correct_rate"])
    
    avg_score = sum(scores) / len(scores) if scores else 0
    
    return {
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "difficulty": quiz.difficulty,
        },
        "summary": {
            "total_responses": len(responses),
            "avg_score": round(avg_score, 1),
            "highest_score": round(max(scores), 1) if scores else 0,
            "lowest_score": round(min(scores), 1) if scores else 0,
            "pass_rate": round(sum(1 for s in scores if s >= 60) / len(scores) * 100, 1) if scores else 0,
        },
        "score_distribution": [{"range": k, "count": v} for k, v in buckets.items()],
        "participants": participants,
        "question_stats": question_stats,
        "hardest_questions": hardest[:3],
    }

@router.get("/results/{quiz_id}/export")
def export_results_csv(quiz_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.creator_id == current_user.id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    
    responses = db.query(Response).filter(Response.quiz_id == quiz_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "Score", "Max Score", "Percentage", "Time (seconds)", "Submitted At"])
    
    for r in responses:
        writer.writerow([
            r.participant_name,
            r.participant_email or "",
            r.score,
            r.max_score,
            round(r.percentage or 0, 1),
            r.time_taken_seconds or "",
            r.submitted_at.isoformat() if r.submitted_at else "",
        ])
    
    output.seek(0)
    filename = f"results_{quiz.title[:30].replace(' ', '_')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
