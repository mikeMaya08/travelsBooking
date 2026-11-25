import { test, expect } from '@playwright/test';

const addItem = async (page, tab, itemName) => {
  await page.getByRole('tab', { name: tab }).click();
  const card = page.getByRole('article').filter({ hasText: itemName });
  await card.getByRole('button', { name: /^Add / }).click();
};

test('plan a full trip: hotel + flight + tour, pay and confirm', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await addItem(page, 'Flights', 'Flight MTY → MEX');
  await addItem(page, 'Tours', 'Teotihuacan Sunrise Tour');

  // 210 + 145 + 50 (1 traveler)
  await expect(page.getByTestId('trip-total')).toHaveText('$405');

  await page.getByRole('button', { name: 'Confirm trip' }).click();
  await page.getByLabel('Full name').fill('Ana Torres');
  await page.getByLabel('Email').fill('ana@example.com');
  await page.getByRole('button', { name: /^Pay/ }).click();

  await expect(page.getByRole('status')).toContainText('Trip confirmed! 3 bookings');
  await expect(page.getByTestId('booking-code')).toHaveText(/^WAY-[A-Z0-9]{6}$/);
});

test('removing an item recalculates the total', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hotels', 'Boutique Roma Norte');
  await expect(page.getByTestId('trip-total')).toHaveText('$155');
  await page.getByRole('button', { name: 'Remove Boutique Roma Norte' }).click();
  await expect(page.getByTestId('trip-total')).toHaveText('$0');
});

test('more travelers only multiplies per-person items', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Travelers').fill('2');
  await addItem(page, 'Hotels', 'Hotel Casa Reforma'); // flat: $210
  await addItem(page, 'Tours', 'Xochimilco Boat Ride'); // $36 x 2
  await expect(page.getByTestId('trip-total')).toHaveText('$282');
});

test('search and sort the catalog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Tours' }).click();
  await page.getByLabel('Search').fill('xochi');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByLabel('Search').fill('');
  await page.getByLabel('Sort by').selectOption('price-asc');
  await expect(page.getByRole('article').first()).toContainText('Xochimilco');
});

test('changing destination shows its catalog and clears the trip', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await page.getByLabel('Destination').selectOption('cun');
  await expect(page.getByTestId('trip-total')).toHaveText('$0');
  await expect(page.getByRole('article').filter({ hasText: 'Laguna Azul Resort' })).toBeVisible();
});

test('checkout validates name and email', async ({ page }) => {
  await page.goto('/');
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await page.getByRole('button', { name: 'Confirm trip' }).click();
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: /^Pay/ }).click();
  await expect(page.getByRole('alert')).toHaveCount(2);
});
