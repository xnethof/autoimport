document.getElementById('contact-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="name"]').value;
    const contact = this.querySelector('[name="contact"]').value;
    const message = this.querySelector('[name="message"]').value;

    if (!name || !contact) {
        document.getElementById('form-result').textContent = 'Пожалуйста, заполните имя и телефон!';
        return;
    }

    try {
        const response = await fetch('http://localhost:8001/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, contact, message: message || null })
        });
        if (!response.ok) {
            throw new Error('Ошибка при отправке сообщения');
        }
        document.getElementById('form-result').textContent = 'Сообщение успешно отправлено!';
        this.reset();
    } catch (error) {
        document.getElementById('form-result').textContent = 'Ошибка: ' + error.message;
    }
});