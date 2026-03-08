from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    plan = Column(String, default="free")
    created_at = Column(DateTime, server_default=func.now())
    quizzes = relationship("Quiz", back_populates="creator")

class Quiz(Base):
    __tablename__ = "quizzes"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"))
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    creator = relationship("User", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz")

class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(Text, nullable=False)
    options = Column(Text)
    correct_answer = Column(String)
    points = Column(Float, default=1.0)
    quiz = relationship("Quiz", back_populates="questions")

class Response(Base):
    __tablename__ = "responses"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    participant_name = Column(String)
    participant_email = Column(String)
    score = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    answers = relationship("Answer", back_populates="response")

class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = {"extend_existing": True}
    
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_answer = Column(Text)
    is_correct = Column(Boolean)
    points_earned = Column(Float)
    response = relationship("Response", back_populates="answers")
