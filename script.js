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

document.getElementById('request-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="name"]').value;
    const contact = this.querySelector('[name="contact"]').value;
    const message = this.querySelector('[name="message"]').value;

    if (!name || !contact) {
        alert('Пожалуйста, заполните имя и контактные данные!');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact, message })
        });
        if (!response.ok) {
            throw new Error('Ошибка при отправке заявки');
        }
        alert('Заявка успешно отправлена!');
        this.reset();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

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