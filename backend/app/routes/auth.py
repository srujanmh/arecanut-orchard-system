import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.database import get_db, Session
from app.models.schemas import User, UserCreate, UserResponse, Token, LoginRequest
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    hashed_pw = get_password_hash(user_in.password)
    user_id = str(uuid.uuid4())
    db_user = User(
        id=user_id,
        email=user_in.email,
        hashed_password=hashed_pw,
        role=user_in.role,
        full_name=user_in.full_name,
        created_at=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "id": db_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name
    }

@router.post("/login-json", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == payload.email).first()
    if not db_user or not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "id": db_user.id}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "full_name": db_user.full_name
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == current_user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
