require('dotenv').config();

// Заглушка – замените на реальные вызовы Langame API
async function getPcStatusFromLangame(pcId) {
  // Здесь будет реальный запрос к Langame: fetch(`${LANGAME_API_URL}/pc/${pcId}`)
  console.log(`[Langame] Запрос статуса ПК #${pcId}`);
  // Имитация ответа: возвращаем 'free' или 'busy'
  // Для демонстрации: все ПК, кроме 7-го, свободны
  return pcId % 7 === 0 ? 'busy' : 'free';
}

async function reservePcOnLangame(pcId, startTime, duration) {
  console.log(`[Langame] Бронирование ПК #${pcId} с ${startTime} на ${duration} ч.`);
  // Здесь будет реальный запрос к Langame на резервирование
  // Возвращаем true, если успешно
  return true;
}

async function releasePcOnLangame(pcId) {
  console.log(`[Langame] Освобождение ПК #${pcId}`);
  return true;
}

module.exports = { getPcStatusFromLangame, reservePcOnLangame, releasePcOnLangame };