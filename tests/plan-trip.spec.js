import { test, expect } from '@playwright/test';

const OK_CARD = '4242 4242 4242 4242';
const DECLINED_CARD = '4000 0000 0000 0002';

// Fills the trip details (they start empty) and clicks Search to unlock planning.
const startTrip = async (page, { dest = 'cdmx', start = '2026-12-10', end = '2026-12-12', travelers = '1' } = {}) => {
  await page.goto('/');
  await page.getByLabel('Destination').selectOption(dest);
  await page.getByLabel('Arrival').fill(start);
  await page.getByLabel('Departure').fill(end);
  await page.getByLabel('Travelers').fill(travelers);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
};

const addItem = async (page, tab, itemName) => {
  await page.getByRole('tab', { name: tab }).click();
  const card = page.getByRole('article').filter({ hasText: itemName });
  await card.getByRole('button', { name: 'Add to trip' }).click();
};

const fillCheckout = async (page, card = OK_CARD) => {
  await page.getByLabel('Full name').fill('Ana Torres');
  await page.getByLabel('Email').fill('ana@example.com');
  await page.getByLabel('Card number').fill(card);
  await page.getByLabel('Expiry').fill('1230');
  await page.getByLabel('CVC').fill('123');
};

test('trip details start empty and planning is locked until Search', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Destination')).toHaveValue('');
  await expect(page.getByLabel('Arrival')).toHaveValue('');
  await expect(page.getByLabel('Departure')).toHaveValue('');
  await expect(page.getByLabel('Travelers')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeDisabled();
  await expect(page.getByRole('tab', { name: 'Hotels' })).toBeDisabled();
  await expect(page.getByRole('article')).toHaveCount(0);

  await startTrip(page);
  await expect(page.getByRole('tab', { name: 'Hotels' })).toBeEnabled();
  await expect(page.getByRole('article').first()).toBeVisible();
});

test('plan a full trip: hotel + flight + tour, pay and confirm', async ({ page }) => {
  await startTrip(page);
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await addItem(page, 'Flights', 'Flight MTY → MEX');
  await addItem(page, 'Tours', 'Teotihuacan Sunrise Tour');

  // 210 + 145 + 50 (1 traveler)
  await expect(page.getByTestId('trip-total')).toHaveText('$405');

  await page.getByRole('button', { name: 'Confirm trip' }).click();
  await fillCheckout(page);
  await page.getByRole('button', { name: /^Pay/ }).click();

  await expect(page.getByRole('status')).toContainText('Trip confirmed! 3 bookings');
  await expect(page.getByRole('status')).toContainText('card ending 4242');
  await expect(page.getByTestId('booking-code')).toHaveText(/^WAY-[A-Z0-9]{6}$/);
});

test('a declined card shows an error and a retry succeeds', async ({ page }) => {
  await startTrip(page);
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await page.getByRole('button', { name: 'Confirm trip' }).click();

  await fillCheckout(page, DECLINED_CARD);
  await page.getByRole('button', { name: /^Pay/ }).click();
  await expect(page.getByTestId('pay-error')).toContainText('declined');

  await page.getByLabel('Card number').fill(OK_CARD);
  await page.getByRole('button', { name: /^Pay/ }).click();
  await expect(page.getByRole('status')).toContainText('Trip confirmed!');
});

test('checkout validates traveler and card fields', async ({ page }) => {
  await startTrip(page);
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await page.getByRole('button', { name: 'Confirm trip' }).click();
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Card number').fill('4242');
  await page.getByRole('button', { name: /^Pay/ }).click();
  // name, email, card number, expiry, cvc
  await expect(page.getByRole('alert')).toHaveCount(5);
});

test('removing an item recalculates the total', async ({ page }) => {
  await startTrip(page);
  await addItem(page, 'Hotels', 'Boutique Roma Norte');
  await expect(page.getByTestId('trip-total')).toHaveText('$155');
  await page.getByRole('button', { name: 'Remove Boutique Roma Norte' }).click();
  await expect(page.getByTestId('trip-total')).toHaveText('$0');
});

test('more travelers only multiplies per-person items', async ({ page }) => {
  await startTrip(page, { travelers: '2' });
  await addItem(page, 'Hotels', 'Hotel Casa Reforma'); // flat: $210
  await addItem(page, 'Tours', 'Xochimilco Boat Ride'); // $36 x 2
  await expect(page.getByTestId('trip-total')).toHaveText('$282');
});

test('search and sort the catalog', async ({ page }) => {
  await startTrip(page);
  await page.getByRole('tab', { name: 'Tours' }).click();
  await page.getByLabel('Search catalog').fill('xochi');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByLabel('Search catalog').fill('');
  await page.getByLabel('Sort by').selectOption('price-asc');
  await expect(page.getByRole('article').first()).toContainText('Xochimilco');
});

test('changing destination and searching again clears the trip', async ({ page }) => {
  await startTrip(page);
  await addItem(page, 'Hotels', 'Hotel Casa Reforma');
  await page.getByLabel('Destination').selectOption('cun');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByTestId('trip-total')).toHaveText('$0');
  await page.getByRole('tab', { name: 'Hotels' }).click();
  await expect(page.getByRole('article').filter({ hasText: 'Laguna Azul Resort' })).toBeVisible();
});
