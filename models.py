from pydantic import BaseModel
from typing import Optional

# Модель для создания автомобиля
class CarCreate(BaseModel):
    brand: str
    model: str
    generation: str
    transmission: str
    engineType: str
    year: int
    price: int
    driveType: str
    mileage: int
    country: str
    image: Optional[str] = None

# Модель для возврата автомобиля
class Car(CarCreate):
    id: int

# Модель для создания заявки
class RequestCreate(BaseModel):
    name: str
    contact: str
    message: Optional[str] = None

# Модель для возврата заявки
class Request(RequestCreate):
    id: int
    created_at: str