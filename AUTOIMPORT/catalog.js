const modelsByBrand = {
    Nissan: ["Leaf", "Serena"],
    Hyundai: ["Sonata"],
    BYD: ["Han"],
    Daihatsu: ["Move"],
    Chery: ["Tiggo 8 Pro"],
    Toyota: ["Voxy"],
    Kia: ["K5"],
    Haval: ["H6"],
    Honda: ["Breeze"],
    Tank: ["300"],
    "Lynk and co": ["05"]
};

function displayCars(carsToShow) {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    carsToShow.forEach(car => {
        const imageUrl = `http://localhost:8001${car.image}`;
        console.log('Loading image:', imageUrl); // Логирование
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
            <img src="${imageUrl}" alt="${car.brand} ${car.model}" 
                 onerror="this.onerror=null; this.src='/images/placeholder.jpg'; console.error('Failed to load image: ${imageUrl}')"
                 style="width: 100%; height: auto;">
            <h3>${car.brand} ${car.model}</h3>
            <p>${car.year}, ${car.engine_type}, $${car.price.toLocaleString()}</p>
            <p>Поколение: ${car.generation}, КПП: ${car.transmission}</p>
            <p>Привод: ${car.drive_type}, Пробег: ${car.mileage.toLocaleString()} км</p>
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
        brand: formData.get('brand') || null,
        model: formData.get('model') || null,
        generation: formData.get('generation') || null,
        transmission: formData.get('transmission') || null,
        engineType: formData.get('engineType') || null,
        yearMin: formData.get('year-min') ? parseInt(formData.get('year-min')) : null,
        yearMax: formData.get('year-max') ? parseInt(formData.get('year-max')) : null,
        driveType: formData.get('driveType') || null,
        priceMin: formData.get('price-min') ? parseFloat(formData.get('price-min')) : null,
        priceMax: formData.get('price-max') ? parseFloat(formData.get('price-max')) : null,
        mileageMin: formData.get('mileage-min') ? parseInt(formData.get('mileage-min')) : null,
        mileageMax: formData.get('mileage-max') ? parseInt(formData.get('mileage-max')) : null
    };

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value !== null) {
            queryParams.append(key, value);
        }
    }

    try {
        const response = await fetch(`http://localhost:8001/api/cars?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении данных с сервера');
        }
        const filteredCars = await response.json();
        displayCars(filteredCars);
    } catch (error) {
        console.error('Ошибка:', error);
        displayCars([]);
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
document.addEventListener('DOMContentLoaded', applyFilters);