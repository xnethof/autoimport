from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from models.database import get_db
from models.car import Car as CarModel
from schemas.car import Car, CarCreate
from auth import get_current_user
from typing import List, Optional
import shutil
import os
from sqlalchemy.sql import func

router = APIRouter()

@router.get("/api/cars", response_model=List[Car])
async def get_cars(
    brand: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    generation: Optional[str] = Query(None),
    transmission: Optional[str] = Query(None),
    engineType: Optional[str] = Query(None, alias="engineType"),
    yearMin: Optional[int] = Query(None, alias="yearMin"),
    yearMax: Optional[int] = Query(None, alias="yearMax"),
    driveType: Optional[str] = Query(None, alias="driveType"),
    priceMin: Optional[float] = Query(None, alias="priceMin"),
    priceMax: Optional[float] = Query(None, alias="priceMax"),
    mileageMin: Optional[int] = Query(None, alias="mileageMin"),
    mileageMax: Optional[int] = Query(None, alias="mileageMax"),
    db: Session = Depends(get_db)
):
    query = db.query(CarModel)
    if brand:
        query = query.filter(CarModel.brand == brand)
    if model:
        query = query.filter(CarModel.model == model)
    if generation:
        query = query.filter(CarModel.generation == generation)
    if transmission:
        query = query.filter(CarModel.transmission == transmission)
    if engineType:
        query = query.filter(CarModel.engine_type == engineType)
    if yearMin:
        query = query.filter(CarModel.year >= yearMin)
    if yearMax:
        query = query.filter(CarModel.year <= yearMax)
    if driveType:
        query = query.filter(CarModel.drive_type == driveType)
    if priceMin:
        query = query.filter(CarModel.price >= priceMin)
    if priceMax:
        query = query.filter(CarModel.price <= priceMax)
    if mileageMin:
        query = query.filter(CarModel.mileage >= mileageMin)
    if mileageMax:
        query = query.filter(CarModel.mileage <= mileageMax)
    return query.all()

@router.get("/api/cars/random", response_model=List[Car])
async def get_random_cars(db: Session = Depends(get_db)):
    return db.query(CarModel).order_by(func.random()).limit(4).all()

@router.post("/api/cars", response_model=Car)
async def create_car(
    car: CarCreate,
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if file:
        file_path = f"static/images/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        car.image = f"/{file_path}"
    db_car = CarModel(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

@router.delete("/api/cars/{car_id}")
async def delete_car(
    car_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    car = db.query(CarModel).filter(CarModel.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    if car.image:
        try:
            os.remove(car.image.lstrip("/"))
        except FileNotFoundError:
            pass
    db.delete(car)
    db.commit()
    return {"message": "Car deleted"}