import { useState } from 'react';
import { CATEGORIES, ITEMS, formatMXN } from './data.js';

function ItemCard({ item, added, onAdd }) {
  return (
    <article className="card" data-testid={`item-${item.id}`}>
      <div>
        <h3>{item.name}</h3>
        <p className="meta">{item.meta}</p>
      </div>
      <div className="card-foot">
        <strong>{formatMXN(item.price)}</strong>
        <button className="btn" onClick={() => onAdd(item)} disabled={added}>
          {added ? 'Agregado' : 'Agregar al viaje'}
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [cat, setCat] = useState('hotels');
  const [trip, setTrip] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const add = (item) => setTrip((t) => [...t, item]);
  const remove = (id) => setTrip((t) => t.filter((i) => i.id !== id));
  const total = trip.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="layout">
      <header>
        <h1>Wayfarer</h1>
        <p>Planea todo tu viaje en un solo lugar</p>
      </header>

      <nav className="tabs" aria-label="Categorías">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.id}
            className={cat === c.id ? 'tab active' : 'tab'}
            onClick={() => setCat(c.id)}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </nav>

      <main>
        <section className="catalog">
          {ITEMS.filter((i) => i.cat === cat).map((item) => (
            <ItemCard key={item.id} item={item} added={trip.some((t) => t.id === item.id)} onAdd={add} />
          ))}
        </section>

        <aside className="itinerary" aria-label="Mi viaje">
          <h2>Mi viaje</h2>
          {confirmed ? (
            <p role="status" className="ok">¡Viaje confirmado! {trip.length} reservaciones por {formatMXN(total)}.</p>
          ) : (
            <>
              {trip.length === 0 && <p className="meta">Aún no agregas nada.</p>}
              <ul>
                {trip.map((i) => (
                  <li key={i.id}>
                    <span>{i.name}</span>
                    <span>{formatMXN(i.price)}</span>
                    <button className="link" aria-label={`Quitar ${i.name}`} onClick={() => remove(i.id)}>✕</button>
                  </li>
                ))}
              </ul>
              <div className="total">
                <span>Total</span>
                <strong data-testid="trip-total">{formatMXN(total)}</strong>
              </div>
              <button className="btn primary" disabled={trip.length === 0} onClick={() => setConfirmed(true)}>
                Confirmar viaje
              </button>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
