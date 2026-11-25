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

export async function createBooking({ trip, traveler, total }) {
  await wait(400);
  const code = 'WAY-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { code, count: trip.length, total, email: traveler.email };
}
