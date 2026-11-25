import { test, expect } from '@playwright/test';

const addItem = async (page, tab, itemName) => {
  await page.getByRole('tab', { name: tab }).click();
  const card = page.getByRole('article').filter({ hasText: itemName });
  await card.getByRole('button', { name: 'Agregar al viaje' }).click();
};

test('planear un viaje completo: hotel + vuelo + tour, pagar y confirmar', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hoteles', 'Hotel Casa Reforma');
  await addItem(page, 'Vuelos', 'Vuelo MTY → CDMX');
  await addItem(page, 'Tours', 'Tour Teotihuacán al amanecer');

  // 4200 + 2850 + 980 (1 viajero)
  await expect(page.getByTestId('trip-total')).toHaveText(/8,030/);

  await page.getByRole('button', { name: 'Confirmar viaje' }).click();
  await page.getByLabel('Nombre completo').fill('Ana Torres');
  await page.getByLabel('Correo electrónico').fill('ana@example.com');
  await page.getByRole('button', { name: /^Pagar/ }).click();

  await expect(page.getByRole('status')).toContainText('¡Viaje confirmado! 3 reservaciones');
  await expect(page.getByTestId('booking-code')).toHaveText(/^WAY-[A-Z0-9]{6}$/);
});

test('quitar un elemento recalcula el total', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hoteles', 'Boutique Roma Norte');
  await expect(page.getByTestId('trip-total')).toHaveText(/3,100/);
  await page.getByRole('button', { name: 'Quitar Boutique Roma Norte' }).click();
  await expect(page.getByTestId('trip-total')).toHaveText(/\$0/);
});

test('más viajeros multiplica solo lo que es por persona', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Viajeros').fill('2');
  await addItem(page, 'Hoteles', 'Hotel Casa Reforma'); // fijo: 4,200
  await addItem(page, 'Tours', 'Xochimilco en trajinera'); // 720 x 2
  await expect(page.getByTestId('trip-total')).toHaveText(/5,640/);
});

test('buscar y ordenar el catálogo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Tours' }).click();
  await page.getByLabel('Buscar').fill('xochi');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByLabel('Buscar').fill('');
  await page.getByLabel('Ordenar').selectOption('price-asc');
  await expect(page.getByRole('article').first()).toContainText('Xochimilco');
});

test('cambiar de destino muestra su catálogo y limpia el viaje', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hoteles', 'Hotel Casa Reforma');
  await page.getByLabel('Destino').selectOption('cun');
  await expect(page.getByTestId('trip-total')).toHaveText(/\$0/);
  await expect(page.getByRole('article').filter({ hasText: 'Resort Laguna Azul' })).toBeVisible();
});

test('el checkout valida nombre y correo', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hoteles', 'Hotel Casa Reforma');
  await page.getByRole('button', { name: 'Confirmar viaje' }).click();
  await page.getByLabel('Correo electrónico').fill('no-es-correo');
  await page.getByRole('button', { name: /^Pagar/ }).click();
  await expect(page.getByRole('alert')).toHaveCount(2);
});
