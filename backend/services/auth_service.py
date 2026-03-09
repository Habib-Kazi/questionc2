import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from fastapi import HTTPException, Header
from database import SessionLocal

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
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
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Handle both "Bearer token" and plain "token"
    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    else:
        token = authorization
    
    try:
        payload = jwt.decode(
            token, 
            os.getenv("SECRET_KEY", "secret"), 
            algorithms=["HS256"]
        )
        from models import User
        db = SessionLocal()
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        db.close()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")
