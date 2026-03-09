import os
import uuid
import json
import shutil
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from database import get_db
from models import User, Quiz, Question
from services.auth_service import get_current_user
from services.extraction_engine import extract_content
from services.ai_engine import generate_questions, suggest_quiz_title

router = APIRouter()

UPLOAD_DIR = "uploads"
ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
}

@router.post("/upload-source")
async def upload_source(
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
):
    if not file and not url:
        raise HTTPException(400, "Provide either a file or URL")
    
    if url:
        try:
            content = extract_content(url=url)
            return {"content": content, "source_type": "url", "source": url, "length": len(content)}
        except ValueError as e:
            raise HTTPException(400, str(e))
    
    if file:
        content_type = file.content_type
        file_type = ALLOWED_TYPES.get(content_type)
        if not file_type:
            ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
            file_type = ext if ext in ["pdf", "docx", "txt", "png", "jpg", "jpeg"] else None
        
        if not file_type:
            raise HTTPException(400, f"Unsupported file type: {content_type}")
        
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.{file_type}")
        
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        try:
            content = extract_content(file_path=file_path, file_type=file_type)
        except ValueError as e:
            os.remove(file_path)
            raise HTTPException(400, str(e))
        
        return {
            "content": content,
            "source_type": "file",
            "source": file.filename,
            "length": len(content),
            "file_path": file_path,
        }

class GenerateRequest(BaseModel):
    content: str
    question_type: str
    num_questions: int = 10
    education_level: str = "college"
    difficulty: str = "medium"

@router.post("/generate-questions")
def generate(req: GenerateRequest, current_user: User = Depends(get_current_user)):
    if len(req.content) < 50:
        raise HTTPException(400, "Content too short to generate questions")
    if req.num_questions < 1 or req.num_questions > 50:
        raise HTTPException(400, "Number of questions must be between 1 and 50")
    
    valid_types = ["mcq", "short_answer", "true_false", "fill_blank", "long_answer"]
    if req.question_type not in valid_types:
        raise HTTPException(400, f"Question type must be one of: {valid_types}")
    
    try:
        questions = generate_questions(
            content=req.content,
            question_type=req.question_type,
            num_questions=req.num_questions,
            education_level=req.education_level,
            difficulty=req.difficulty,
        )
        suggested_title = suggest_quiz_title(req.content)
        return {"questions": questions, "suggested_title": suggested_title}
    except Exception as e:
        raise HTTPException(500, f"AI generation failed: {str(e)}")

class QuestionIn(BaseModel):
    type: str
    question_text: str
    options_json: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    order_index: int = 0
    points: int = 1

class CreateQuizRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    difficulty: str = "medium"
    education_level: str = "college"
    timer_minutes: int = 0
    allow_multiple_attempts: bool = False
    questions: List[QuestionIn]

@router.post("/create-quiz")
def create_quiz(req: CreateQuizRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    quiz_id = str(uuid.uuid4())
    quiz = Quiz(
        id=quiz_id,
        creator_id=current_user.id,
        title=req.title,
        description=req.description,
        difficulty=req.difficulty,
        education_level=req.education_level,
        timer_minutes=req.timer_minutes,
        allow_multiple_attempts=req.allow_multiple_attempts,
        is_published=True,
    )
    db.add(quiz)
    db.flush()  # ← THIS IS THE KEY FIX - saves quiz to DB before adding questions
    
    for i, q in enumerate(req.questions):
        question = Question(
            quiz_id=quiz_id,
            type=q.type,
            question_text=q.question_text,
            options_json=json.dumps(q.options_json) if q.options_json else None, if q.options_json else None,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            order_index=i,
            points=q.points,
        )
        db.add(question)
    
    db.commit()
    return {"quiz_id": quiz_id, "url": f"/quiz/{quiz_id}"}

@router.put("/quiz/{quiz_id}")
def update_quiz(quiz_id: str, req: CreateQuizRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.creator_id == current_user.id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    
    quiz.title = req.title
    quiz.description = req.description
    quiz.difficulty = req.difficulty
    quiz.education_level = req.education_level
    quiz.timer_minutes = req.timer_minutes
    
    db.query(Question).filter(Question.quiz_id == quiz_id).delete()
    
    for i, q in enumerate(req.questions):
        question = Question(
            quiz_id=quiz_id,
            type=q.type,
            question_text=q.question_text,
            options_json=json.dumps(q.options_json) if q.options_json else None,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            order_index=i,
            points=q.points,
        )
        db.add(question)
    
    db.commit()
    return {"quiz_id": quiz_id, "message": "Quiz updated"}

@router.delete("/quiz/{quiz_id}")
def delete_quiz(quiz_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.creator_id == current_user.id).first()
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted"}
