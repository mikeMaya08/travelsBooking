export const CATEGORIES = [
  { id: 'hotels', label: 'Hoteles', icon: '🏨' },
  { id: 'flights', label: 'Vuelos', icon: '✈️' },
  { id: 'cars', label: 'Autos', icon: '🚗' },
  { id: 'tours', label: 'Tours', icon: '🧭' },
  { id: 'tickets', label: 'Boletos', icon: '🎟️' },
  { id: 'dining', label: 'Restaurantes', icon: '🍽️' },
  { id: 'transfers', label: 'Traslados', icon: '🚕' },
];

export const ITEMS = [
  { id: 'h1', cat: 'hotels', name: 'Hotel Casa Reforma', meta: 'CDMX · 3 noches', price: 4200 },
  { id: 'h2', cat: 'hotels', name: 'Boutique Roma Norte', meta: 'CDMX · 3 noches', price: 3100 },
  { id: 'f1', cat: 'flights', name: 'Vuelo MTY → CDMX', meta: 'Ida y vuelta · Directo', price: 2850 },
  { id: 'f2', cat: 'flights', name: 'Vuelo GDL → CDMX', meta: 'Ida y vuelta · Directo', price: 2400 },
  { id: 'c1', cat: 'cars', name: 'Renta compacto 3 días', meta: 'Aeropuerto CDMX', price: 1650 },
  { id: 't1', cat: 'tours', name: 'Tour Teotihuacán al amanecer', meta: '6 horas · Guía bilingüe', price: 980 },
  { id: 't2', cat: 'tours', name: 'Xochimilco en trajinera', meta: '3 horas', price: 720 },
  { id: 'k1', cat: 'tickets', name: 'Museo Frida Kahlo', meta: 'Entrada general', price: 350 },
  { id: 'k2', cat: 'tickets', name: 'Partido Estadio Azteca', meta: 'Zona preferente', price: 1900 },
  { id: 'd1', cat: 'dining', name: 'Cena en Pujol', meta: 'Menú degustación · 2 personas', price: 4800 },
  { id: 'r1', cat: 'transfers', name: 'Chofer privado aeropuerto', meta: 'Sedán · 1 trayecto', price: 650 },
];

export const formatMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
