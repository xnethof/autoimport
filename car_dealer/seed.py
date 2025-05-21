import sqlite3
import datetime

def create_database():
    conn = sqlite3.connect("car_dealer.db")
    cursor = conn.cursor()

    # Создание таблицы cars
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            generation TEXT,
            transmission TEXT,
            engine_type TEXT,
            year INTEGER,
            price REAL,
            drive_type TEXT,
            mileage INTEGER,
            country TEXT,
            image TEXT
        )
    """)

    # Создание таблицы requests
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT NOT NULL,
            message TEXT,
            created_at TEXT  -- Новое: Поле для времени создания
        )
    """)

    # Тестовые данные для cars
    cars = [
        ("Haval", "H6", "2-е", "MT", "Бензин", 2025, 71900, "2WD", 0, "Китай", "/static/images/haval_h6.jpg"),
        ("Honda", "Breeze", "1-е", "AT", "Бензин", 2020, 140000, "4WD", 40000, "Япония", "/static/images/honda_breeze.jpg"),
        ("Tank", "300", "1-е", "AT", "Бензин", 2023, 158000, "4WD", 27000, "Китай", "/static/images/tank_300.jpg"),
        ("Lynk and co", "05", "1-е", "AT", "Бензин", 2022, 103000, "4WD", 56500, "Китай", "/static/images/lynk_05.jpg"),
        ("Toyota", "Voxy", "3-е", "AT", "Гибрид", 2022, 50000, "Передний", 10000, "Япония", "/static/images/toyota_voxy.jpg")
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO cars (brand, model, generation, transmission, engine_type, year, price, drive_type, mileage, country, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, cars)

    # Тестовые данные для requests
    requests = [
        ("Иван", "+79991234567", "Хочу Haval H6", datetime.datetime.now().isoformat()),
        ("Мария", "+79997654321", None, (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat()),
        ("Алексей", "+79999876543", "Интересует Toyota Voxy", (datetime.datetime.now() - datetime.timedelta(hours=5)).isoformat())
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO requests (name, contact, message, created_at)
        VALUES (?, ?, ?, ?)
    """, requests)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_database()
    print("База данных создана и заполнена тестовыми данными.")