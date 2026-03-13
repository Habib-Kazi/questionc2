from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from services.auth_service import hash_password, verify_password, create_token
import httpx

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleRequest(BaseModel):
    access_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.email)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan}}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user.id, user.email)
    return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan}}

@router.post("/google")
def google_login(req: GoogleRequest, db: Session = Depends(get_db)):
    try:
        response = httpx.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {req.access_token}"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        google_data = response.json()
        email = google_data.get("email")
        name = google_data.get("name", email.split("@")[0])
        if not email:
            raise HTTPException(status_code=400, detail="Could not get email from Google")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                password_hash=hash_password(email + "_google_oauth")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        token = create_token(user.id, user.email)
        return {"token": token, "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google login error: {str(e)}")

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    return {"message": "If this email exists, a reset link has been sent!"}

@router.get("/me")
def me(db: Session = Depends(get_db), current_user: User = Depends(__import__('services.auth_service', fromlist=['get_current_user']).get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "plan": current_user.plan}
