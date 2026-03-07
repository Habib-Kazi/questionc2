from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    plan = Column(String(50), default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    quizzes = relationship("Quiz", back_populates="creator")

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String(36), primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    difficulty = Column(String(50))
    education_level = Column(String(50))
    timer_minutes = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    allow_multiple_attempts = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    creator = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    type = Column(String(50), nullable=False)  # mcq, short_answer, true_false, fill_blank, long_answer
    question_text = Column(Text, nullable=False)
    options_json = Column(JSON)
    correct_answer = Column(Text)
    explanation = Column(Text)
    order_index = Column(Integer, default=0)
    points = Column(Integer, default=1)
    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False)
    participant_name = Column(String(255))
    participant_email = Column(String(255))
    score = Column(Float, default=0)
    max_score = Column(Float, default=0)
    percentage = Column(Float, default=0)
    time_taken_seconds = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(50))
    quiz = relationship("Quiz", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(Text)
    is_correct = Column(Boolean)
    points_earned = Column(Float, default=0)
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
