from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from auth import verify_password, create_access_token, ADMIN_CREDENTIALS
from typing import Optional

router = APIRouter(prefix="/api")

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/api/login")
async def login(login: LoginRequest):
    if (login.username != ADMIN_CREDENTIALS["username"] or
        not verify_password(login.password, ADMIN_CREDENTIALS["hashed_password"])):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": login.username})
    return {"access_token": access_token, "token_type": "bearer"}