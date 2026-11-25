import { test, expect } from '@playwright/test';

// Flujo crítico: armar un viaje con varias categorías y confirmarlo.
test('planear un viaje completo: hotel + vuelo + tour, y confirmar', async ({ page }) => {
  await page.goto('/');

  const add = async (tab, itemName) => {
    await page.getByRole('tab', { name: tab }).click();
    const card = page.getByRole('article').filter({ hasText: itemName });
    await card.getByRole('button', { name: 'Agregar al viaje' }).click();
  };

  await add('Hoteles', 'Hotel Casa Reforma');
  await add('Vuelos', 'Vuelo MTY → CDMX');
  await add('Tours', 'Tour Teotihuacán al amanecer');

  // 4200 + 2850 + 980
  await expect(page.getByTestId('trip-total')).toHaveText(/8,030/);

  await page.getByRole('button', { name: 'Confirmar viaje' }).click();
  await expect(page.getByRole('status')).toContainText('¡Viaje confirmado! 3 reservaciones');
});

test('quitar un elemento recalcula el total', async ({ page }) => {
  await page.goto('/');
  const card = page.getByRole('article').filter({ hasText: 'Boutique Roma Norte' });
  await card.getByRole('button', { name: 'Agregar al viaje' }).click();
  await expect(page.getByTestId('trip-total')).toHaveText(/3,100/);
  await page.getByRole('button', { name: 'Quitar Boutique Roma Norte' }).click();
  await expect(page.getByTestId('trip-total')).toHaveText(/\$0/);
});
