import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, CITIES, ITEMS, daysBetween, formatUSD, itemTotal } from './data.js';
import { createBooking, processPayment, searchItems } from './api.js';

const STORAGE_KEY = 'wayfarer:v2';
// Card data is never persisted; only trip details and the trip itself.
const loadSaved = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
};

function ItemCard({ item, added, travelers, onAdd }) {
  return (
    <article className="card" data-testid={`item-${item.id}`}>
      <div>
        <h3>{item.name}</h3>
        <p className="meta">{item.meta}</p>
        <p className="meta">★ {item.rating}{item.perPerson ? ' · price per person' : ''}</p>
      </div>
      <div className="card-foot">
        <strong>{formatUSD(item.price)}</strong>
        {item.perPerson && travelers > 1 && <span className="meta">{formatUSD(itemTotal(item, travelers))} total</span>}
        <button
          className="btn"
          aria-label={added ? `${item.name} added` : `Add ${item.name} to trip`}
          onClick={() => onAdd(item)}
          disabled={added}
        >
          {added ? '✓' : '+ Add'}
        </button>
      </div>
    </article>
  );
}

const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Invalid email';
  if (f.number.replace(/\s/g, '').length !== 16) e.number = 'Enter a 16-digit card number';
  const m = /^(\d{2})\/(\d{2})$/.exec(f.expiry);
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.expiry = 'Use MM/YY';
  else if (new Date(2000 + Number(m[2]), Number(m[1])) <= new Date()) e.expiry = 'Card expired';
  if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = 'Enter the 3 or 4 digit CVC';
  return e;
}

function Checkout({ total, onBack, onPay, busy, payError }) {
  const [form, setForm] = useState({ name: '', email: '', number: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const set = (k, fmt = (v) => v) => (e) => setForm({ ...form, [k]: fmt(e.target.value) });
  const submit = (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (!Object.keys(next).length) onPay(form);
  };
  const field = (k) => errors[k] && <p role="alert" className="err">{errors[k]}</p>;
  return (
    <form onSubmit={submit} noValidate className="checkout">
      <h3>Traveler</h3>
      <label>Full name<input value={form.name} onChange={set('name')} autoComplete="off" /></label>
      {field('name')}
      <label>Email<input type="email" value={form.email} onChange={set('email')} autoComplete="off" /></label>
      {field('email')}

      <h3>Payment</h3>
      <p className="demo-note">Demo only — no real charge. Use 4242 4242 4242 4242 (approved) or 4000 0000 0000 0002 (declined).</p>
      <label>Card number
        <input inputMode="numeric" placeholder="1234 5678 9012 3456" value={form.number}
          onChange={set('number', formatCardNumber)} autoComplete="off" />
      </label>
      {field('number')}
      <div className="row2">
        <label>Expiry<input placeholder="MM/YY" value={form.expiry} onChange={set('expiry', formatExpiry)} autoComplete="off" /></label>
        <label>CVC<input inputMode="numeric" placeholder="123" value={form.cvc}
          onChange={set('cvc', (v) => v.replace(/\D/g, '').slice(0, 4))} autoComplete="off" /></label>
      </div>
      {field('expiry')}
      {field('cvc')}

      {payError && <p role="alert" className="err" data-testid="pay-error">{payError}</p>}
      <button className="btn primary" disabled={busy}>{busy ? 'Processing payment…' : `Pay ${formatUSD(total)}`}</button>
      <button type="button" className="link-btn" disabled={busy} onClick={onBack}>← Back to trip</button>
    </form>
  );
}

export default function App() {
  const [saved] = useState(loadSaved);
  // Draft trip details: start EMPTY. Nothing is applied until the user clicks Search.
  const [draft, setDraft] = useState(saved?.draft ?? { city: '', start: '', end: '', travelers: '' });
  const [applied, setApplied] = useState(saved?.applied ?? null);
  const [trip, setTrip] = useState(saved?.trip ?? []); // [{ id, day }]

  const [cat, setCat] = useState('hotels');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState('plan'); // plan | checkout | done
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState('');
  const [booking, setBooking] = useState(null);

  const draftValid =
    draft.city && draft.start && draft.end && draft.end >= draft.start && Number(draft.travelers) >= 1;
  const unlocked = Boolean(applied);
  const city = applied?.city;
  const travelers = applied?.travelers ?? 1;
  const days = applied ? daysBetween(applied.start, applied.end) : 1;

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, applied, trip })); } catch {}
  }, [draft, applied, trip]);

  useEffect(() => {
    if (!unlocked) return undefined;
    let live = true;
    setLoading(true);
    searchItems({ city, cat, q, sort }).then((r) => { if (live) { setResults(r); setLoading(false); } });
    return () => { live = false; };
  }, [unlocked, city, cat, q, sort]);

  const tripItems = useMemo(
    () => trip.map((t) => ({ ...ITEMS.find((i) => i.id === t.id), day: Math.min(t.day, days) })),
    [trip, days],
  );
  const total = tripItems.reduce((s, i) => s + itemTotal(i, travelers), 0);

  const search = () => {
    const next = { ...draft, travelers: Number(draft.travelers) };
    if (applied && applied.city !== next.city) { setTrip([]); setQ(''); }
    setApplied(next);
    setStep('plan');
  };
  const add = (item) => setTrip((t) => [...t, { id: item.id, day: 1 }]);
  const remove = (id) => setTrip((t) => t.filter((i) => i.id !== id));
  const setDay = (id, day) => setTrip((t) => t.map((i) => (i.id === id ? { ...i, day } : i)));

  const pay = async (form) => {
    setBusy(true); setPayError('');
    try {
      const payment = await processPayment({ amount: total, card: form });
      const b = await createBooking({ trip: tripItems, traveler: form, total, payment });
      setBooking(b); setStep('done'); setTrip([]);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const reset = () => { setBooking(null); setStep('plan'); };

  return (
    <div className="layout">
      <header>
        <h1>Wayfarer</h1>
        <p>Plan your whole trip in one place</p>
      </header>

      <form className="setup" aria-label="Trip details" onSubmit={(e) => { e.preventDefault(); if (draftValid) search(); }}>
        <label>Destination
          <select value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
            <option value="" disabled>Select destination</option>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label>Arrival
          <input type="date" value={draft.start} max={draft.end || undefined}
            onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
        </label>
        <label>Departure
          <input type="date" value={draft.end} min={draft.start || undefined}
            onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
        </label>
        <label>Travelers
          <input type="number" min="1" max="10" placeholder="How many?" value={draft.travelers}
            onChange={(e) => setDraft({ ...draft, travelers: e.target.value === '' ? '' : String(Math.min(10, Math.max(1, Number(e.target.value) || 1))) })} />
        </label>
        <button type="submit" className="btn primary search-btn" disabled={!draftValid}>Search</button>
      </form>

      {!unlocked && <p className="hint">Choose a destination, dates and travelers, then click Search to start planning.</p>}

      <fieldset className={unlocked ? 'planner' : 'planner locked'} disabled={!unlocked}>
        <nav className="tabs" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} disabled={!unlocked}
              className={cat === c.id ? 'tab active' : 'tab'} onClick={() => setCat(c.id)}>
              {c.icon} {c.label}
            </button>
          ))}
        </nav>

        <main>
          <section className="catalog">
            <div className="filters">
              <input type="search" placeholder="Search catalog…" aria-label="Search catalog" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
            {!unlocked && <p className="meta">Options will appear here after you search.</p>}
            {unlocked && loading && <p className="meta" role="progressbar">Loading…</p>}
            {unlocked && !loading && results.length === 0 && <p className="meta">No results for your search.</p>}
            {unlocked && !loading && results.map((item) => (
              <ItemCard key={item.id} item={item} travelers={travelers}
                added={trip.some((t) => t.id === item.id)} onAdd={add} />
            ))}
          </section>

          <aside className="itinerary" aria-label="My trip">
            <h2>My trip</h2>
            {unlocked && (
              <p className="meta">
                {CITIES.find((c) => c.id === city).label} · {days} days · {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
              </p>
            )}

            {step === 'done' && booking && (
              <div role="status" className="ok">
                <p>Trip confirmed! {booking.count} bookings for {formatUSD(booking.total)}.</p>
                <p>Payment approved · card ending {booking.last4}</p>
                <p>Code: <strong data-testid="booking-code">{booking.code}</strong></p>
                <p className="meta">We sent the summary to {booking.email}.</p>
                <button className="btn" onClick={reset}>Plan another trip</button>
              </div>
            )}

            {step === 'checkout' && (
              <Checkout total={total} busy={busy} payError={payError} onBack={() => { setPayError(''); setStep('plan'); }} onPay={pay} />
            )}

            {step === 'plan' && (
              <>
                {trip.length === 0 && <p className="meta">Nothing added yet.</p>}
                {Array.from({ length: days }, (_, d) => d + 1).map((day) => {
                  const list = tripItems.filter((i) => i.day === day);
                  if (!list.length) return null;
                  return (
                    <div key={day} className="day">
                      <h4>Day {day}</h4>
                      <ul>
                        {list.map((i) => (
                          <li key={i.id}>
                            <span>{i.name}</span>
                            <span>{formatUSD(itemTotal(i, travelers))}</span>
                            <select aria-label={`Day for ${i.name}`} value={i.day} onChange={(e) => setDay(i.id, Number(e.target.value))}>
                              {Array.from({ length: days }, (_, d) => <option key={d} value={d + 1}>Day {d + 1}</option>)}
                            </select>
                            <button className="link" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}>✕</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                <div className="total">
                  <span>Total</span>
                  <strong data-testid="trip-total">{formatUSD(total)}</strong>
                </div>
                <button className="btn primary" disabled={trip.length === 0} onClick={() => setStep('checkout')}>
                  Confirm trip
                </button>
              </>
            )}
          </aside>
        </main>
      </fieldset>
    </div>
  );
}
