export const CITIES = [
  { id: 'cdmx', label: 'Mexico City' },
  { id: 'cun', label: 'Cancun' },
];

export const CATEGORIES = [
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'cars', label: 'Cars', icon: '🚗' },
  { id: 'tours', label: 'Tours', icon: '🧭' },
  { id: 'tickets', label: 'Tickets', icon: '🎟️' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
  { id: 'transfers', label: 'Transfers', icon: '🚕' },
];

// perPerson: price is multiplied by the number of travelers.
export const ITEMS = [
  // CDMX
  { id: 'h1', city: 'cdmx', cat: 'hotels', name: 'Hotel Casa Reforma', meta: '3 nights · Breakfast included', price: 210, rating: 4.7 },
  { id: 'h2', city: 'cdmx', cat: 'hotels', name: 'Boutique Roma Norte', meta: '3 nights · Rooftop terrace', price: 155, rating: 4.5 },
  { id: 'f1', city: 'cdmx', cat: 'flights', name: 'Flight MTY → MEX', meta: 'Round trip · Nonstop', price: 145, rating: 4.3, perPerson: true },
  { id: 'f2', city: 'cdmx', cat: 'flights', name: 'Flight GDL → MEX', meta: 'Round trip · Nonstop', price: 120, rating: 4.1, perPerson: true },
  { id: 'c1', city: 'cdmx', cat: 'cars', name: 'Compact car rental, 3 days', meta: 'Mexico City Airport', price: 85, rating: 4.2 },
  { id: 't1', city: 'cdmx', cat: 'tours', name: 'Teotihuacan Sunrise Tour', meta: '6 hours · Bilingual guide', price: 50, rating: 4.9, perPerson: true },
  { id: 't2', city: 'cdmx', cat: 'tours', name: 'Xochimilco Boat Ride', meta: '3 hours', price: 36, rating: 4.4, perPerson: true },
  { id: 'k1', city: 'cdmx', cat: 'tickets', name: 'Frida Kahlo Museum', meta: 'General admission', price: 18, rating: 4.6, perPerson: true },
  { id: 'k2', city: 'cdmx', cat: 'tickets', name: 'Match at Estadio Azteca', meta: 'Premium seating', price: 95, rating: 4.8, perPerson: true },
  { id: 'd1', city: 'cdmx', cat: 'dining', name: 'Dinner at Pujol', meta: 'Tasting menu', price: 120, rating: 4.9, perPerson: true },
  { id: 'd2', city: 'cdmx', cat: 'dining', name: 'Tacos at El Califa', meta: 'Casual dinner', price: 14, rating: 4.4, perPerson: true },
  { id: 'r1', city: 'cdmx', cat: 'transfers', name: 'Private airport driver', meta: 'Sedan · 1 trip', price: 33, rating: 4.7 },
  // Cancun
  { id: 'h3', city: 'cun', cat: 'hotels', name: 'Laguna Azul Resort', meta: '4 nights · All-inclusive', price: 490, rating: 4.8 },
  { id: 'h4', city: 'cun', cat: 'hotels', name: 'Downtown Hotel', meta: '4 nights', price: 180, rating: 4.0 },
  { id: 'f3', city: 'cun', cat: 'flights', name: 'Flight MEX → Cancun', meta: 'Round trip · Nonstop', price: 165, rating: 4.4, perPerson: true },
  { id: 'c2', city: 'cun', cat: 'cars', name: 'SUV rental, 4 days', meta: 'Cancun Airport', price: 145, rating: 4.3 },
  { id: 't3', city: 'cun', cat: 'tours', name: 'Snorkeling at Isla Mujeres', meta: '5 hours · Catamaran', price: 62, rating: 4.8, perPerson: true },
  { id: 't4', city: 'cun', cat: 'tours', name: 'Chichen Itza + Cenote', meta: 'Full day', price: 72, rating: 4.7, perPerson: true },
  { id: 'k3', city: 'cun', cat: 'tickets', name: 'Xcaret Park', meta: 'General admission', price: 105, rating: 4.9, perPerson: true },
  { id: 'd3', city: 'cun', cat: 'dining', name: 'Beachfront Dinner', meta: 'Seafood · Terrace', price: 48, rating: 4.5, perPerson: true },
  { id: 'r2', city: 'cun', cat: 'transfers', name: 'Airport Taxi → Hotel Zone', meta: '1 trip', price: 26, rating: 4.1 },
];

export const itemTotal = (item, travelers) => item.price * (item.perPerson ? travelers : 1);

export const formatUSD = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000) + 1);
};
