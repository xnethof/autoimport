const modelsByBrand = {
    Nissan: ["Leaf", "Serena"],
    Hyundai: ["Sonata"],
    BYD: ["Han"],
    Daihatsu: ["Move"],
    Chery: ["Tiggo 8 Pro"],
    Toyota: ["Voxy"],
    Kia: ["K5"]
};

function displayCars(carsToShow) {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    carsToShow.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${car.image}" alt="${car.brand} ${car.model}">
            <h3>${car.brand} ${car.model}</h3>
            <p>${car.year}, ${car.engineType}, $${car.price.toLocaleString()}</p>
            <p>Поколение: ${car.generation}, КПП: ${car.transmission}</p>
            <p>Привод: ${car.driveType}, Пробег: ${car.mileage.toLocaleString()} км</p>
            <p>Страна: ${car.country}</p>
        `;
        grid.appendChild(card);
    });

    const filterCount = document.querySelector('.filter-count');
    filterCount.textContent = `Найдено: ${carsToShow.length} автомобиля(ов)`;
}

async function applyFilters() {
    const formData = new FormData(document.getElementById('filter-form'));
    const filters = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        generation: formData.get('generation'),
        transmission: formData.get('transmission'),
        engineType: formData.get('engineType'),
        yearMin: parseInt(formData.get('year-min')) || 2000,
        yearMax: parseInt(formData.get('year-max')) || 2025,
        driveType: formData.get('driveType'),
        priceMin: parseInt(formData.get('price-min')) || 0,
        priceMax: parseInt(formData.get('price-max')) || 999999999,
        mileageMin: parseInt(formData.get('mileage-min')) || 0,
        mileageMax: parseInt(formData.get('mileage-max')) || 999999999
    };

    // Формируем URL с query-параметрами
    const queryParams = new URLSearchParams(filters).toString();
    try {
        const response = await fetch(`http://localhost:8000/api/cars?${queryParams}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных с сервера');
        }
        const filteredCars = await response.json();
        displayCars(filteredCars);
    } catch (error) {
        console.error('Ошибка:', error);
        displayCars([]); // Если ошибка, показываем пустой список
        const filterCount = document.querySelector('.filter-count');
        filterCount.textContent = 'Ошибка загрузки данных';
    }
}

document.getElementById('brand-select').addEventListener('change', function() {
    const brand = this.value;
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = '<option value="">Все</option>';
    
    if (brand && modelsByBrand[brand]) {
        modelsByBrand[brand].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
    applyFilters();
});

document.querySelectorAll('#filter-form select, #filter-form input').forEach(element => {
    element.addEventListener('change', applyFilters);
    element.addEventListener('input', applyFilters);
});

document.getElementById('reset-filters').addEventListener('click', function() {
    const form = document.getElementById('filter-form');
    form.reset();
    document.getElementById('model-select').innerHTML = '<option value="">Все</option>';
    applyFilters();
});

// Первоначальное отображение всех автомобилей
applyFilters();