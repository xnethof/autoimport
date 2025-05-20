from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db
from models.request import Request as RequestModel
from schemas.request import Request, RequestCreate
from auth import get_current_user
from typing import List

router = APIRouter()

@router.post("/api/requests", response_model=Request)
async def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    db_request = RequestModel(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/api/requests", response_model=List[Request])
async def get_requests(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(RequestModel).all()