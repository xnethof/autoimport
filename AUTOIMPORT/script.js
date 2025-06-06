// Инициализация слайдера
const swiper = new Swiper('.swiper-container', {
    loop: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    autoplay: {
        delay: 4500,
    },
    on: {
        slideChange: function () {
            console.log('Slide changed to:', this.realIndex);
        },
        init: function () {
            console.log('Swiper initialized');
        }
    }
});

// Загрузка случайных автомобилей
async function loadPopularCars() {
    try {
        const response = await fetch('http://localhost:8001/api/cars/random');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке автомобилей');
        }
        const cars = await response.json();
        const grid = document.getElementById('popular-cars');
        grid.innerHTML = cars.map(car => {
            const imageUrl = `http://localhost:8001${car.image}`;
            console.log('Loading image:', imageUrl); // Логирование
            return `
                <div class="car-card">
                    <img src="${imageUrl}" alt="${car.brand} ${car.model}" 
                         onerror="this.onerror=null; this.src='/images/placeholder.jpg'; console.error('Failed to load image: ${imageUrl}')"
                         style="width: 100%; height: auto;">
                    <h3>${car.brand} ${car.model}</h3>
                    <p>${car.year}, ${car.engine_type}, $${car.price.toLocaleString()}</p>
                    <p>Поколение: ${car.generation}, КПП: ${car.transmission}</p>
                    <p>Привод: ${car.drive_type}, Пробег: ${car.mileage.toLocaleString()} км</p>
                    <p>Страна: ${car.country}</p>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('popular-cars').innerHTML = '<p>Ошибка загрузки автомобилей</p>';
    }
}

// Калькулятор стоимости
document.getElementById('calc-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const brand = this.querySelector('[name="brand"]').value;
    const year = parseInt(this.querySelector('[name="year"]').value);
    const basePrice = parseFloat(this.querySelector('[name="base-price"]').value);

    if (!brand || isNaN(year) || isNaN(basePrice) || year < 1900 || basePrice <= 0) {
        document.getElementById('calc-result').textContent = 'Ошибка: проверьте ввод!';
        return;
    }

    const tax = basePrice * 0.1;
    const delivery = 2000;
    const total = basePrice + tax + delivery;

    document.getElementById('calc-result').textContent = 
        `Стоимость ${brand} (${year}): $${total.toFixed(2)}`;
});

// Отправка заявки (Главная страница)
const requestForm = document.getElementById('request-form');
if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = requestForm.querySelector('input[name="name"]').value;
        const contact = requestForm.querySelector('input[name="phone"]').value;

        try {
            const response = await fetch('http://localhost:8001/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact })
            });

            const result = await response.json();
            if (response.ok) {
                showNotification('Заявка успешно отправлена!');
                requestForm.reset();
            } else {
                showNotification(result.error || 'Ошибка при отправке заявки.', true);
            }
        } catch (error) {
            showNotification('Ошибка сети. Попробуйте позже.', true);
        }
    });
}

// Отправка заявки (Страница Контакты)
const contactRequestForm = document.getElementById('contact-request-form');
if (contactRequestForm) {
    contactRequestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = contactRequestForm.querySelector('input[name="name"]').value;
        const contact = contactRequestForm.querySelector('input[name="phone"]').value;

        try {
            const response = await fetch('http://localhost:8001/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact })
            });

            const result = await response.json();
            if (response.ok) {
                showNotification('Заявка успешно отправлена!');
                contactRequestForm.reset();
            } else {
                showNotification(result.error || 'Ошибка при отправке заявки.', true);
            }
        } catch (error) {
            showNotification('Ошибка сети. Попробуйте позже.', true);
        }
    });
}

// Функция для показа уведомления
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Показать уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Скрыть через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Получение курсов валют через API
if (document.getElementById('currency-rates')) {
    axios.get('https://api.exchangerate-api.com/v4/latest/RUB')
        .then(response => {
            const rates = response.data.rates;
            document.getElementById('currency-rates').innerHTML = `
                <li><img src="images/flags/usd.png" alt="Флаг США" class="currency-flag">  $1 = ${(1 / rates.USD).toFixed(2)}₽ (USD/RUB)</li>
                <li><img src="images/flags/eur.png" alt="Флаг Евросоюза" class="currency-flag">  €1 = ${(1 / rates.EUR).toFixed(2)}₽ (EUR/RUB)</li>
                <li><img src="images/flags/cny.png" alt="Флаг Китая" class="currency-flag">  1元 = ${(1 / rates.CNY).toFixed(2)}₽ (CNY/RUB)</li>
                <li><img src="images/flags/jpy.png" alt="Флаг Японии" class="currency-flag">  1₽ = ${rates.JPY.toFixed(2)}¥ (RUB/JPY)</li>
                <li><img src="images/flags/krw.png" alt="Флаг Южной Кореи" class="currency-flag">  1₽ = ${rates.KRW.toFixed(2)}₩ (RUB/KRW)</li>
            `;
        })
        .catch(error => {
            document.getElementById('currency-rates').innerHTML = `
                <li>Ошибка загрузки курсов валют</li>
            `;
        });
}

// Анимация появления секций при скролле
const sections = document.querySelectorAll('[data-animate]');
const observerOptions = {
    threshold: 0.1
};
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
sections.forEach(section => {
    observer.observe(section);
});

// Загрузка популярных автомобилей при загрузке страницы
document.addEventListener('DOMContentLoaded', loadPopularCars);