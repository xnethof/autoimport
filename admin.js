// admin.js
document.getElementById('car-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const token = localStorage.getItem('token'); // Предполагается, что токен сохранён после логина

    try {
        const response = await fetch('http://localhost:8000/api/cars', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Отправляем FormData для поддержки файлов
        });
        if (!response.ok) {
            throw new Error('Ошибка при добавлении автомобиля');
        }
        document.getElementById('car-result').textContent = 'Автомобиль добавлен!';
        this.reset();
    } catch (error) {
        document.getElementById('car-result').textContent = 'Ошибка: ' + error.message;
    }
});

async function loadRequests() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:8000/api/requests', {
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
                <strong>Контакт:</strong> ${req.contact}<br>
                <strong>Сообщение:</strong> ${req.message || 'Нет сообщения'}
            </p>
        `).join('');
    } catch (error) {
        document.getElementById('requests-list').innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

document.getElementById('login-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = this.querySelector('[name="username"]').value 
    const password = this.querySelector('[name="password"]').value;

    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        alert('Вход выполнен!');
        loadRequests(); // Загружаем заявки после входа
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Загружаем заявки при загрузке страницы, если есть токен
if (localStorage.getItem('token')) {
    loadRequests();
}