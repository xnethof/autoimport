document.getElementById('contact-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="name"]').value;
    const email = this.querySelector('[name="email"]').value; // Используем email как contact
    const message = this.querySelector('[name="message"]').value;

    try {
        const response = await fetch('http://localhost:8000/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                phone: "",  // Пустое поле, если телефон не требуется
                email,      // Используем email
                message 
            })
        });
        // ... остальной код
    } catch (error) {
        // ... обработка ошибок
    }
});