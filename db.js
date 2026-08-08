const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Получить список всех ПК
async function getPCs() {
  const { data, error } = await supabase
    .from('pcs')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

// Обновить статус ПК (free/busy)
async function updatePCStatus(pcId, status) {
  const { error } = await supabase
    .from('pcs')
    .update({ status })
    .eq('id', pcId);
  if (error) throw error;
}

// Создать бронирование
async function createBooking(pcId, userName, startTime, duration, totalPrice, paid = false) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      { pc_id: pcId, user_name: userName, start_time: startTime, duration, total_price: totalPrice, paid }
    ])
    .select();
  if (error) throw error;
  return data[0];
}

// Получить бронирования на сегодня (для проверки конфликтов)
async function getTodayBookings(pcId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('pc_id', pcId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());
  if (error) throw error;
  return data;
}

module.exports = { getPCs, updatePCStatus, createBooking, getTodayBookings };