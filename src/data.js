export const CITIES = [
  { id: 'cdmx', label: 'Ciudad de México' },
  { id: 'cun', label: 'Cancún' },
];

export const CATEGORIES = [
  { id: 'hotels', label: 'Hoteles', icon: '🏨' },
  { id: 'flights', label: 'Vuelos', icon: '✈️' },
  { id: 'cars', label: 'Autos', icon: '🚗' },
  { id: 'tours', label: 'Tours', icon: '🧭' },
  { id: 'tickets', label: 'Boletos', icon: '🎟️' },
  { id: 'dining', label: 'Restaurantes', icon: '🍽️' },
  { id: 'transfers', label: 'Traslados', icon: '🚕' },
];

// perPerson: el precio se multiplica por el número de viajeros.
export const ITEMS = [
  // CDMX
  { id: 'h1', city: 'cdmx', cat: 'hotels', name: 'Hotel Casa Reforma', meta: '3 noches · Desayuno incluido', price: 4200, rating: 4.7 },
  { id: 'h2', city: 'cdmx', cat: 'hotels', name: 'Boutique Roma Norte', meta: '3 noches · Terraza', price: 3100, rating: 4.5 },
  { id: 'f1', city: 'cdmx', cat: 'flights', name: 'Vuelo MTY → CDMX', meta: 'Ida y vuelta · Directo', price: 2850, rating: 4.3, perPerson: true },
  { id: 'f2', city: 'cdmx', cat: 'flights', name: 'Vuelo GDL → CDMX', meta: 'Ida y vuelta · Directo', price: 2400, rating: 4.1, perPerson: true },
  { id: 'c1', city: 'cdmx', cat: 'cars', name: 'Renta compacto 3 días', meta: 'Aeropuerto CDMX', price: 1650, rating: 4.2 },
  { id: 't1', city: 'cdmx', cat: 'tours', name: 'Tour Teotihuacán al amanecer', meta: '6 horas · Guía bilingüe', price: 980, rating: 4.9, perPerson: true },
  { id: 't2', city: 'cdmx', cat: 'tours', name: 'Xochimilco en trajinera', meta: '3 horas', price: 720, rating: 4.4, perPerson: true },
  { id: 'k1', city: 'cdmx', cat: 'tickets', name: 'Museo Frida Kahlo', meta: 'Entrada general', price: 350, rating: 4.6, perPerson: true },
  { id: 'k2', city: 'cdmx', cat: 'tickets', name: 'Partido Estadio Azteca', meta: 'Zona preferente', price: 1900, rating: 4.8, perPerson: true },
  { id: 'd1', city: 'cdmx', cat: 'dining', name: 'Cena en Pujol', meta: 'Menú degustación', price: 2400, rating: 4.9, perPerson: true },
  { id: 'd2', city: 'cdmx', cat: 'dining', name: 'Tacos en El Califa', meta: 'Cena casual', price: 280, rating: 4.4, perPerson: true },
  { id: 'r1', city: 'cdmx', cat: 'transfers', name: 'Chofer privado aeropuerto', meta: 'Sedán · 1 trayecto', price: 650, rating: 4.7 },
  // Cancún
  { id: 'h3', city: 'cun', cat: 'hotels', name: 'Resort Laguna Azul', meta: '4 noches · Todo incluido', price: 9800, rating: 4.8 },
  { id: 'h4', city: 'cun', cat: 'hotels', name: 'Hotel Zona Centro', meta: '4 noches', price: 3600, rating: 4.0 },
  { id: 'f3', city: 'cun', cat: 'flights', name: 'Vuelo CDMX → Cancún', meta: 'Ida y vuelta · Directo', price: 3300, rating: 4.4, perPerson: true },
  { id: 'c2', city: 'cun', cat: 'cars', name: 'Renta SUV 4 días', meta: 'Aeropuerto CUN', price: 2900, rating: 4.3 },
  { id: 't3', city: 'cun', cat: 'tours', name: 'Snorkel en Isla Mujeres', meta: '5 horas · Catamarán', price: 1250, rating: 4.8, perPerson: true },
  { id: 't4', city: 'cun', cat: 'tours', name: 'Chichén Itzá + cenote', meta: 'Día completo', price: 1450, rating: 4.7, perPerson: true },
  { id: 'k3', city: 'cun', cat: 'tickets', name: 'Parque Xcaret', meta: 'Entrada general', price: 2100, rating: 4.9, perPerson: true },
  { id: 'd3', city: 'cun', cat: 'dining', name: 'Cena frente al mar', meta: 'Mariscos · Terraza', price: 950, rating: 4.5, perPerson: true },
  { id: 'r2', city: 'cun', cat: 'transfers', name: 'Taxi aeropuerto → zona hotelera', meta: '1 trayecto', price: 520, rating: 4.1 },
];

export const itemTotal = (item, travelers) => item.price * (item.perPerson ? travelers : 1);

export const formatMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / 86400000) + 1);
};
