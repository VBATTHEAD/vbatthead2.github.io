const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const langame = require('./langame');
const payment = require('./payment');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Раздаём статические файлы из папки public (наш index.html)
app.use(express.static('public'));

// ----- ЭНДПОИНТЫ -----

// 1. Получить список всех ПК с актуальными статусами
app.get('/api/pcs', async (req, res) => {
  try {
    // Получаем из БД
    let pcs = await db.getPCs();
    // Для каждого ПК запрашиваем статус из Langame (заглушка)
    for (let pc of pcs) {
      const status = await langame.getPcStatusFromLangame(pc.id);
      pc.status = status; // перезаписываем статус из Langame
      // Обновляем в БД (на случай рассинхрона)
      await db.updatePCStatus(pc.id, status);
    }
    res.json(pcs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка получения списка ПК' });
  }
});

// 2. Создать бронирование
app.post('/api/book', async (req, res) => {
  try {
    const { pcId, userName, startTime, duration } = req.body;
    if (!pcId || !userName || !startTime || !duration) {
      return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    // Проверяем, свободен ли ПК в Langame
    const status = await langame.getPcStatusFromLangame(pcId);
    if (status === 'busy') {
      return res.status(409).json({ error: 'ПК уже занят' });
    }

    // Проверяем конфликты с существующими бронями в БД
    const date = new Date(startTime);
    const existing = await db.getTodayBookings(pcId, date);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'На это время уже есть бронирование' });
    }

    // Получаем цену за час из БД
    const pcs = await db.getPCs();
    const pc = pcs.find(p => p.id === pcId);
    if (!pc) return res.status(404).json({ error: 'ПК не найден' });
    const totalPrice = pc.price_per_hour * duration;

    // Создаём бронь в БД (пока не оплачена)
    const booking = await db.createBooking(pcId, userName, startTime, duration, totalPrice, false);

    // Резервируем ПК в Langame
    const reserved = await langame.reservePcOnLangame(pcId, startTime, duration);
    if (!reserved) {
      // Откат в БД (можно удалить бронь)
      // Здесь нужна транзакция, для простоты оставим
      return res.status(500).json({ error: 'Ошибка резервирования в Langame' });
    }

    // Обновляем статус ПК в нашей БД
    await db.updatePCStatus(pcId, 'busy');

    // Создаём сессию для оплаты (заглушка)
    const paymentUrl = await payment.createPaymentSession(totalPrice, `Бронь ПК #${pcId}`, booking.id);

    res.json({
      bookingId: booking.id,
      totalPrice,
      paymentUrl,
      message: 'Бронирование создано, ожидайте оплаты'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании брони' });
  }
});

// 3. (Опционально) Вебхук для подтверждения оплаты – пока заглушка
app.post('/api/payment-webhook', async (req, res) => {
  // Здесь будет обработка уведомления от платёжной системы
  // и обновление статуса paid в БД
  res.send('OK');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});