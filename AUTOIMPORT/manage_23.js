document.addEventListener('DOMContentLoaded', () => {
    // Проверка авторизации
    async function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('admin-section').style.display = 'none';
            return false;
        }

        try {
            const response = await fetch('http://localhost:8001/api/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-section').style.display = 'block';
                loadCars();
                loadRequests();
                return true;
            } else {
                localStorage.removeItem('token');
                document.getElementById('login-section').style.display = 'block';
                document.getElementById('admin-section').style.display = 'none';
                document.getElementById('login-result').textContent = 'Сессия истекла. Войдите снова.';
                return false;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('admin-section').style.display = 'none';
            document.getElementById('login-result').textContent = 'Ошибка проверки авторизации.';
            return false;
        }
    }

    // Периодическая проверка авторизации (каждые 5 минут)
    checkAuth();
    setInterval(checkAuth, 5 * 60 * 1000);

    // Обработка логина
    document.getElementById('login-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = this.querySelector('[name="username"]').value;
        const password = this.querySelector('[name="password"]').value;

        try {
            const response = await fetch('http://localhost:8001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error('Ошибка авторизации');
            }
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            document.getElementById('login-result').textContent = 'Вход выполнен!';
            document.getElementById('login-result').style.color = '#2ECC71';
            checkAuth();
        } catch (error) {
            document.getElementById('login-result').textContent = 'Ошибка: ' + error.message;
            document.getElementById('login-result').style.color = '#e74c3c';
        }
    });

    // Добавление автомобиля
    document.getElementById('car-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8001/api/cars', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при добавлении автомобиля');
            }
            document.getElementById('car-result').textContent = 'Автомобиль добавлен!';
            document.getElementById('car-result').style.color = '#2ECC71';
            this.reset();
            loadCars();
        } catch (error) {
            document.getElementById('car-result').textContent = 'Ошибка: ' + error.message;
            document.getElementById('car-result').style.color = '#e74c3c';
        }
    });

    // Загрузка автомобилей
    async function loadCars() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8001/api/cars', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Ошибка при загрузке автомобилей');
            }
            const cars = await response.json();
            const carsList = document.getElementById('cars-list');
            carsList.innerHTML = cars.map(car => {
                const imageUrl = `http://localhost:8001${car.image}`;
                console.log('Loading image:', imageUrl); // Логирование
                return `
                    <div class="car-card">
                        <img src="${imageUrl}" alt="${car.brand} ${car.model}" 
                             style="max-width: 200px;" 
                             onerror="this.onerror=null; this.src='/images/placeholder.jpg'; console.error('Failed to load image: ${imageUrl}')">
                        <p><strong>${car.brand} ${car.model}</strong><br>
                        Год: ${car.year}, Цена: $${car.price.toLocaleString()}<br>
                        Поколение: ${car.generation}, КПП: ${car.transmission}<br>
                        Привод: ${car.drive_type}, Пробег: ${car.mileage.toLocaleString()} км<br>
                        Страна: ${car.country}</p>
                        <button onclick="deleteCar(${car.id})">Удалить</button>
                    </div>
                `;
            }).join('');
        } catch (error) {
            document.getElementById('cars-list').innerHTML = `<p>Ошибка: ${error.message}</p>`;
        }
    }

    // Удаление автомобиля
    async function deleteCar(carId) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8001/api/cars/${carId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Ошибка при удалении автомобиля');
            }
            alert('Автомобиль удалён!');
            loadCars();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    // Загрузка заявок
    async function loadRequests() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:8001/api/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Ошибка при загрузке заявок');
            }
            const requests = await response.json();
            const requestsList = document.getElementById('requests-list');
            requestsList.innerHTML = requests.map(req => `
                <p>
                    <strong>Имя:</strong> ${req.name}<br>
                    <strong>Телефон:</strong> ${req.contact}<br>
                    <strong>Сообщение:</strong> ${req.message || 'Нет сообщения'}<br>
                    <small>Дата: ${new Date(req.created_at || Date.now()).toLocaleString()}</small><br>
                    <button onclick="deleteRequest(${req.id})">Удалить</button>
                </p>
            `).join('');
        } catch (error) {
            document.getElementById('requests-list').innerHTML = `<p>Ошибка: ${error.message}</p>`;
        }
    }

    // Удаление заявки
    async function deleteRequest(requestId) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8001/api/requests/${requestId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Ошибка при удалении заявки');
            }
            alert('Заявка удалена!');
            loadRequests();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    // Инициализация при наличии токена
    if (localStorage.getItem('token')) {
        checkAuth();
    }
});