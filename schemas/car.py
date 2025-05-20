from pydantic import BaseModel
from typing import Optional

class CarBase(BaseModel):
    brand: str
    model: str
    generation: str
    transmission: str
    engine_type: str
    year: int
    price: float
    drive_type: str
    mileage: int
    country: str
    image: Optional[str] = None

class CarCreate(CarBase):
    pass

class Car(CarBase):
    id: int

    class Config:
        from_attributes = True