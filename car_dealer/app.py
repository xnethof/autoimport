from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import jwt
import hashlib
import datetime
import os
from werkzeug.utils import secure_filename
from collections import defaultdict  # Новое: для отслеживания заявок по IP

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов

SECRET_KEY = "VOVA_BEST123"  # Замени на безопасный ключ в продакшене
SALT = "autoimport_salt"
UPLOAD_FOLDER = "static/images"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Новое: Хранилище для отслеживания заявок по IP
request_counts = defaultdict(list)

# Новое: Очистка старых заявок (старше 24 часов)
def clean_old_requests():
    now = datetime.datetime.now()
    for ip in list(request_counts.keys()):
        request_counts[ip] = [t for t in request_counts[ip] if (now - t).total_seconds() < 24 * 3600]
        if not request_counts[ip]:
            del request_counts[ip]

# Проверка расширения файла
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Хеширование пароля
def hash_password(password):
    salted_password = password + SALT
    return hashlib.sha256(salted_password.encode()).hexdigest()

# Проверка токена
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Подключение к базе данных
def get_db():
    conn = sqlite3.connect("car_dealer.db")
    conn.row_factory = sqlite3.Row
    return conn

# Аутентификация
ADMIN_CREDENTIALS = {"username": "vavok111", "hashed_password": hash_password("dyadyavova1203")}

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if (username != ADMIN_CREDENTIALS["username"] or
            hash_password(password) != ADMIN_CREDENTIALS["hashed_password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "sub": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    return jsonify({"access_token": token, "token_type": "bearer"})

# Получение и фильтрация автомобилей
@app.route("/api/cars", methods=["GET"])
def get_cars():
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM cars WHERE 1=1"
    params = []

    filters = {
        "brand": request.args.get("brand"),
        "model": request.args.get("model"),
        "generation": request.args.get("generation"),
        "transmission": request.args.get("transmission"),
        "engineType": request.args.get("engineType"),
        "yearMin": request.args.get("yearMin", type=int),
        "yearMax": request.args.get("yearMax", type=int),
        "driveType": request.args.get("driveType"),
        "priceMin": request.args.get("priceMin", type=float),
        "priceMax": request.args.get("priceMax", type=float),
        "mileageMin": request.args.get("mileageMin", type=int),
        "mileageMax": request.args.get("mileageMax", type=int)
    }

    if filters["brand"]:
        query += " AND brand = ?"
        params.append(filters["brand"])
    if filters["model"]:
        query += " AND model = ?"
        params.append(filters["model"])
    if filters["generation"]:
        query += " AND generation = ?"
        params.append(filters["generation"])
    if filters["transmission"]:
        query += " AND transmission = ?"
        params.append(filters["transmission"])
    if filters["engineType"]:
        query += " AND engine_type = ?"
        params.append(filters["engineType"])
    if filters["yearMin"]:
        query += " AND year >= ?"
        params.append(filters["yearMin"])
    if filters["yearMax"]:
        query += " AND year <= ?"
        params.append(filters["yearMax"])
    if filters["driveType"]:
        query += " AND drive_type = ?"
        params.append(filters["driveType"])
    if filters["priceMin"]:
        query += " AND price >= ?"
        params.append(filters["priceMin"])
    if filters["priceMax"]:
        query += " AND price <= ?"
        params.append(filters["priceMax"])
    if filters["mileageMin"]:
        query += " AND mileage >= ?"
        params.append(filters["mileageMin"])
    if filters["mileageMax"]:
        query += " AND mileage <= ?"
        params.append(filters["mileageMax"])

    cursor.execute(query, params)
    cars = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(cars)

# Получение 5 случайных автомобилей
@app.route("/api/cars/random", methods=["GET"])
def get_random_cars():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cars ORDER BY RANDOM() LIMIT 5")
    cars = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(cars)

# Создание автомобиля
@app.route("/api/cars", methods=["POST"])
def create_car():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    if not verify_token(token):
        return jsonify({"error": "Invalid token"}), 401

    if "image" not in request.files:
        return jsonify({"error": "Image required"}), 400

    file = request.files["image"]
    if not file or not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or missing file"}), 400

    data = request.form
    required_fields = ["brand", "model", "generation", "transmission", "engine_type", "year", "price", "drive_type", "mileage", "country"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing {field}"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cars (brand, model, generation, transmission, engine_type, year, price, drive_type, mileage, country, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["brand"], data["model"], data["generation"], data["transmission"], data["engine_type"],
        int(data["year"]), float(data["price"]), data["drive_type"], int(data["mileage"]), data["country"],
        f"/{file_path}"
    ))
    conn.commit()
    car_id = cursor.lastrowid
    cursor.execute("SELECT * FROM cars WHERE id = ?", (car_id,))
    car = dict(cursor.fetchone())
    conn.close()
    return jsonify(car), 201

# Удаление автомобиля
@app.route("/api/cars/<int:car_id>", methods=["DELETE"])
def delete_car(car_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    if not verify_token(token):
        return jsonify({"error": "Invalid token"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT image FROM cars WHERE id = ?", (car_id,))
    car = cursor.fetchone()
    if not car:
        conn.close()
        return jsonify({"error": "Car not found"}), 404

    image_path = car["image"].lstrip("/")
    if os.path.exists(image_path):
        os.remove(image_path)

    cursor.execute("DELETE FROM cars WHERE id = ?", (car_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Car deleted"})

# Создание заявки
@app.route("/api/requests", methods=["POST"])
def create_request():
    client_ip = request.remote_addr  # Новое: Получаем IP клиента
    clean_old_requests()  # Новое: Очищаем старые заявки

    # Новое: Проверка лимита заявок
    if len(request_counts[client_ip]) >= 2:
        print(f"IP {client_ip} exceeded request limit")  # Логирование
        return jsonify({"error": "Request limit exceeded. Try again tomorrow."}), 429

    data = request.get_json()
    required_fields = ["name", "contact"]
    for field in required_fields:
        if field not in data:
            print(f"Missing field: {field} from IP {client_ip}")  # Логирование
            return jsonify({"error": f"Missing {field}"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO requests (name, contact, message)
        VALUES (?, ?, ?)
    """, (data["name"], data["contact"], data.get("message")))
    conn.commit()
    request_id = cursor.lastrowid
    cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
    req = dict(cursor.fetchone())
    conn.close()

    request_counts[client_ip].append(datetime.datetime.now())  # Новое: Добавляем заявку в счётчик
    print(f"Request created by IP {client_ip}, total: {len(request_counts[client_ip])}")  # Логирование
    return jsonify(req), 201

# Получение заявок
@app.route("/api/requests", methods=["GET"])
def get_requests():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("Missing Authorization header")  # Логирование
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    if not verify_token(token):
        print("Invalid or expired token")  # Логирование
        return jsonify({"error": "Invalid token"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM requests")
    requests = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(requests)

# Удаление заявки
@app.route("/api/requests/<int:request_id>", methods=["DELETE"])
def delete_request(request_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("Missing Authorization header for delete request")  # Логирование
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    if not verify_token(token):
        print("Invalid or expired token for delete request")  # Логирование
        return jsonify({"error": "Invalid token"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Request not found"}), 404

    cursor.execute("DELETE FROM requests WHERE id = ?", (request_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Request deleted"})

# Статические файлы
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)

@app.route("/")
def root():
    return jsonify({"message": "Welcome to the Car Dealer API!"})

if __name__ == "__main__":
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(host="0.0.0.0", port=8001, debug=True)