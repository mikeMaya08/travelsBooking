import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, CITIES, ITEMS, daysBetween, formatMXN, itemTotal } from './data.js';
import { createBooking, searchItems } from './api.js';

const STORAGE_KEY = 'wayfarer:v1';
const DEFAULTS = { city: 'cdmx', start: '2026-12-10', end: '2026-12-12', travelers: 1, trip: [] };

const load = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return DEFAULTS; }
};

function ItemCard({ item, added, travelers, onAdd }) {
  return (
    <article className="card" data-testid={`item-${item.id}`}>
      <div>
        <h3>{item.name}</h3>
        <p className="meta">{item.meta}</p>
        <p className="meta">★ {item.rating}{item.perPerson ? ' · precio por persona' : ''}</p>
      </div>
      <div className="card-foot">
        <strong>{formatMXN(item.price)}</strong>
        {item.perPerson && travelers > 1 && <span className="meta">{formatMXN(itemTotal(item, travelers))} total</span>}
        <button className="btn" onClick={() => onAdd(item)} disabled={added}>
          {added ? 'Agregado' : 'Agregar al viaje'}
        </button>
      </div>
    </article>
  );
}

function Checkout({ total, onBack, onPay, busy }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Escribe tu nombre completo';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Correo no válido';
    setErrors(next);
    if (!Object.keys(next).length) onPay(form);
  };
  return (
    <form onSubmit={submit} noValidate className="checkout">
      <label>Nombre completo
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      {errors.name && <p role="alert" className="err">{errors.name}</p>}
      <label>Correo electrónico
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      {errors.email && <p role="alert" className="err">{errors.email}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'Procesando…' : `Pagar ${formatMXN(total)}`}</button>
      <button type="button" className="link-btn" onClick={onBack}>← Volver al viaje</button>
    </form>
  );
}

export default function App() {
  const [init] = useState(load);
  const [city, setCity] = useState(init.city);
  const [start, setStart] = useState(init.start);
  const [end, setEnd] = useState(init.end);
  const [travelers, setTravelers] = useState(init.travelers);
  const [trip, setTrip] = useState(init.trip); // [{ id, day }]

  const [cat, setCat] = useState('hotels');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState('plan'); // plan | checkout | done
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(null);

  const days = daysBetween(start, end);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ city, start, end, travelers, trip })); } catch {}
  }, [city, start, end, travelers, trip]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    searchItems({ city, cat, q, sort }).then((r) => { if (live) { setResults(r); setLoading(false); } });
    return () => { live = false; };
  }, [city, cat, q, sort]);

  const tripItems = useMemo(
    () => trip.map((t) => ({ ...ITEMS.find((i) => i.id === t.id), day: Math.min(t.day, days) })),
    [trip, days],
  );
  const total = tripItems.reduce((s, i) => s + itemTotal(i, travelers), 0);

  const changeCity = (c) => { setCity(c); setTrip([]); setQ(''); };
  const add = (item) => setTrip((t) => [...t, { id: item.id, day: 1 }]);
  const remove = (id) => setTrip((t) => t.filter((i) => i.id !== id));
  const setDay = (id, day) => setTrip((t) => t.map((i) => (i.id === id ? { ...i, day } : i)));

  const pay = async (traveler) => {
    setBusy(true);
    const b = await createBooking({ trip: tripItems, traveler, total });
    setBooking(b); setBusy(false); setStep('done'); setTrip([]);
  };
  const reset = () => { setBooking(null); setStep('plan'); };

  return (
    <div className="layout">
      <header>
        <h1>Wayfarer</h1>
        <p>Planea todo tu viaje en un solo lugar</p>
      </header>

      <section className="setup" aria-label="Datos del viaje">
        <label>Destino
          <select value={city} onChange={(e) => changeCity(e.target.value)}>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label>Llegada
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>Salida
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label>Viajeros
          <input type="number" min="1" max="10" value={travelers}
            onChange={(e) => setTravelers(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
        </label>
      </section>

      <nav className="tabs" aria-label="Categorías">
        {CATEGORIES.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id}
            className={cat === c.id ? 'tab active' : 'tab'} onClick={() => setCat(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </nav>

      <main>
        <section className="catalog">
          <div className="filters">
            <input type="search" placeholder="Buscar…" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
            <select aria-label="Ordenar" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
            </select>
          </div>
          {loading && <p className="meta" role="progressbar">Cargando…</p>}
          {!loading && results.length === 0 && <p className="meta">Sin resultados para tu búsqueda.</p>}
          {!loading && results.map((item) => (
            <ItemCard key={item.id} item={item} travelers={travelers}
              added={trip.some((t) => t.id === item.id)} onAdd={add} />
          ))}
        </section>

        <aside className="itinerary" aria-label="Mi viaje">
          <h2>Mi viaje</h2>
          <p className="meta">{CITIES.find((c) => c.id === city).label} · {days} días · {travelers} {travelers === 1 ? 'viajero' : 'viajeros'}</p>

          {step === 'done' && booking && (
            <div role="status" className="ok">
              <p>¡Viaje confirmado! {booking.count} reservaciones por {formatMXN(booking.total)}.</p>
              <p>Código: <strong data-testid="booking-code">{booking.code}</strong></p>
              <p className="meta">Enviamos el resumen a {booking.email}.</p>
              <button className="btn" onClick={reset}>Planear otro viaje</button>
            </div>
          )}

          {step === 'checkout' && (
            <Checkout total={total} busy={busy} onBack={() => setStep('plan')} onPay={pay} />
          )}

          {step === 'plan' && (
            <>
              {trip.length === 0 && <p className="meta">Aún no agregas nada.</p>}
              {Array.from({ length: days }, (_, d) => d + 1).map((day) => {
                const list = tripItems.filter((i) => i.day === day);
                if (!list.length) return null;
                return (
                  <div key={day} className="day">
                    <h4>Día {day}</h4>
                    <ul>
                      {list.map((i) => (
                        <li key={i.id}>
                          <span>{i.name}</span>
                          <span>{formatMXN(itemTotal(i, travelers))}</span>
                          <select aria-label={`Día de ${i.name}`} value={i.day} onChange={(e) => setDay(i.id, Number(e.target.value))}>
                            {Array.from({ length: days }, (_, d) => <option key={d} value={d + 1}>Día {d + 1}</option>)}
                          </select>
                          <button className="link" aria-label={`Quitar ${i.name}`} onClick={() => remove(i.id)}>✕</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="total">
                <span>Total</span>
                <strong data-testid="trip-total">{formatMXN(total)}</strong>
              </div>
              <button className="btn primary" disabled={trip.length === 0} onClick={() => setStep('checkout')}>
                Confirmar viaje
              </button>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
