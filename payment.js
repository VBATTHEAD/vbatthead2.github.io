require('dotenv').config();

// Создание платёжной сессии (возвращает ссылку на оплату)
async function createPaymentSession(amount, description, bookingId) {
  console.log(`[Payment] Создание сессии для оплаты ${amount}₽, бронь #${bookingId}`);
  // Здесь будет реальный запрос к ЮKassa или Tinkoff
  // Пока возвращаем тестовую ссылку
  return `https://test-payment-gateway.com/pay/${bookingId}`;
}

// Проверка статуса платежа (для вебхука)
async function checkPaymentStatus(paymentId) {
  // Заглушка
  return 'succeeded';
}

module.exports = { createPaymentSession, checkPaymentStatus };