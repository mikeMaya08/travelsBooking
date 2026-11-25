// Mock API (no backend): artificial latency and minimal business rules.
import { ITEMS } from './data.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function searchItems({ city, cat, q = '', sort = 'relevance' }) {
  await wait(150);
  const term = q.trim().toLowerCase();
  let out = ITEMS.filter(
    (i) => i.city === city && i.cat === cat && (!term || i.name.toLowerCase().includes(term)),
  );
  if (sort === 'price-asc') out = [...out].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') out = [...out].sort((a, b) => b.price - a.price);
  if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating);
  return out;
}

// FAKE payment gateway. Nothing is charged and card data never leaves the browser.
// Demo cards: 4242 4242 4242 4242 -> approved, 4000 0000 0000 0002 -> declined.
export async function processPayment({ amount, card }) {
  await wait(1500);
  const digits = card.number.replace(/\s/g, '');
  if (digits.endsWith('0002')) {
    const err = new Error('Your card was declined. Please try another card.');
    err.code = 'card_declined';
    throw err;
  }
  return { id: 'pay_' + Math.random().toString(36).slice(2, 10), last4: digits.slice(-4), amount };
}

export async function createBooking({ trip, traveler, total, payment }) {
  await wait(400);
  const code = 'WAY-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { code, count: trip.length, total, email: traveler.email, last4: payment.last4 };
}
