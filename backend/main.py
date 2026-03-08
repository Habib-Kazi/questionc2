from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
from routes import auth, quiz, participation, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Quiz Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://questionc2.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(participation.router, prefix="/api", tags=["participation"])
app.include_router(dashboard.router, prefix="/api/creator", tags=["dashboard"])

@app.get("/")
def root():
    return {"message": "AI Quiz Platform API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
