from sqlalchemy import Column, Integer, String, Float
from models.database import Base

class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    generation = Column(String)
    transmission = Column(String)
    engine_type = Column(String)
    year = Column(Integer)
    price = Column(Float)
    drive_type = Column(String)
    mileage = Column(Integer)
    country = Column(String)
    image = Column(String)  # Путь к изображению