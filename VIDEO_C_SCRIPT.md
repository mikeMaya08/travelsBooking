# Video C — Walkthrough de un PR real (3–5 min)

App: **Wayfarer**, planeador de viajes (hoteles, vuelos, autos, tours, boletos, restaurantes, traslados).
Repo local con 3 estados, todos listos para mostrar:

| Rama | Qué es |
|---|---|
| `main` | Línea base, 2 tests Playwright en verde |
| `feat/quick-add-button` | **El PR**: botón "Agregar al viaje" → "+ Añadir" (cambia copy y aria-label) |
| `proposal/fix-quick-add-locators` | **La reparación propuesta** (solo para revisión, no se mergea sola) |

## Guion (≈4:15)

**0:00–0:25 · Contexto**
Mostrar la app (`npm run dev`), agregar un hotel, un vuelo y un tour; confirmar viaje.
"Esta es Wayfarer. El flujo crítico: armar un viaje con varias categorías y confirmarlo. Tiene 2 tests E2E en Playwright, todo en verde en `main`."

**0:25–1:05 · El cambio (el PR)**
`git diff main..feat/quick-add-button -- src/App.jsx`
"Este PR hace el botón más compacto: de 'Agregar al viaje' a '+ Añadir'. Cambia el texto visible y el aria-label. Parece un cambio de copy, pero toca el contrato por el que los tests encuentran el botón."

**1:05–1:50 · Qué flujo se elige para probar**
Explicar el razonamiento: el diff toca `ItemCard`, que se usa en TODAS las categorías y es el paso 1 de cualquier reserva. Por eso se elige `plan-trip.spec.js › planear un viaje completo` (cubre 3 categorías + total + confirmación) y también `quitar un elemento`, porque usa el mismo botón. No hace falta correr nada más.

**1:50–2:40 · Corrida de Playwright**
`npx playwright test` → ambos tests fallan por timeout (~30 s).
Mostrar el call log: `waiting for getByRole('button', { name: 'Agregar al viaje' })`.
Abrir el trace: `npx playwright show-trace test-results/*/trace.zip` y el screenshot de falla.

**2:40–3:25 · Diagnóstico**
Preguntas que se responden con evidencia:
- ¿La app está rota? No: en el screenshot se ve el catálogo y el botón "+ Añadir" funciona.
- ¿Es un bug del producto o del test? **Del test** (locator desactualizado): el cambio de copy fue intencional.
- Clasificación: *test drift*, riesgo bajo, causa raíz = locator por texto.
- Nota de honestidad: si el botón hubiera desaparecido o no respondiera, sería un bug real y NO se parchearía el test.

**3:25–4:10 · Propuesta de reparación (para revisión)**
`git diff feat/quick-add-button..proposal/fix-quick-add-locators`
Cambio de 2 líneas (una por test): `{ name: 'Agregar al viaje' }` → `{ name: /^Añadir/ }`. Se corre en la rama de propuesta: 2/2 en verde.
"Esto no se mergea solo: queda como propuesta para que una persona revise. Ella decide si acepta el nuevo locator o prefiere un `data-testid` más estable."

**4:10–4:30 · Cierre**
Resumen del handoff: cambio → flujo elegido → corrida → diagnóstico → propuesta revisable.

## Comandos del día de grabación

```bash
cd ~/Documents/travelsBooking
git checkout main && npx playwright test            # verde
git checkout feat/quick-add-button && npx playwright test   # rojo
npx playwright show-trace test-results/*/trace.zip
git diff feat/quick-add-button..proposal/fix-quick-add-locators
git checkout proposal/fix-quick-add-locators && npx playwright test   # verde
```

Tip: baja `timeout` a 8 s en `playwright.config.js` mientras grabas para que la falla no tarde 30 s.
