from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.car import Car
from models.database import Base

engine = create_engine("sqlite:///./car_dealer.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_data():
    db = SessionLocal()
    Base.metadata.create_all(bind=engine)

    cars = [
        {
            "brand": "Haval", "model": "H6", "generation": "2-е", "transmission": "MT",
            "engine_type": "Бензин", "year": 2025, "price": 71900, "drive_type": "2WD",
            "mileage": 0, "country": "Китай", "image": "/static/images/haval_h6.jpg"
        },
        {
            "brand": "Honda", "model": "Breeze", "generation": "1-е", "transmission": "AT",
            "engine_type": "Бензин", "year": 2020, "price": 140000, "drive_type": "4WD",
            "mileage": 40000, "country": "Япония", "image": "/static/images/honda_breeze.jpg"
        },
        {
            "brand": "Tank", "model": "300", "generation": "1-е", "transmission": "AT",
            "engine_type": "Бензин", "year": 2023, "price": 158000, "drive_type": "4WD",
            "mileage": 27000, "country": "Китай", "image": "/static/images/tank_300.jpg"
        },
        {
            "brand": "Lynk and co", "model": "05", "generation": "1-е", "transmission": "AT",
            "engine_type": "Бензин", "year": 2022, "price": 103000, "drive_type": "4WD",
            "mileage": 56500, "country": "Китай", "image": "/static/images/lynk_05.jpg"
        }
    ]

    for car_data in cars:
        car = Car(**car_data)
        db.add(car)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()