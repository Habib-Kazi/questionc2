import jwt
import os
from datetime import datetime, timedelta
from fastapi import HTTPException, Header
from models import User
from database import get_db

def hash_password(password: str) -> str:
    import bcrypt
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    import bcrypt
    password_bytes = password.encode('utf-8')[:72]
    return bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))

def create_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY", "secret"), algorithm="HS256")

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY", "secret"), algorithms=["HS256"])
        from sqlalchemy.orm import Session
        from database import SessionLocal
        db = SessionLocal()
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        db.close()
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
