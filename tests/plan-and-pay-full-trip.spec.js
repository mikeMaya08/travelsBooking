import { test, expect } from '@playwright/test';
import { TripPlannerPage } from './pages/TripPlannerPage.js';

test.describe('Plan and pay a full multi-category trip', () => {
  test('user builds a hotel + flight + tour trip, pays and receives a booking code', async ({ page }) => {
    const planner = new TripPlannerPage(page);
    const traveler = { name: 'Ana Torres', email: 'ana@example.com' };

    await planner.open();
    // Destination, dates and travelers start empty: set them and click Search to unlock the catalog.
    await planner.startTrip({ travelers: 1 });
    await expect(planner.tripTotal).toHaveText('$0');
    await expect(planner.confirmTripButton).toBeDisabled();

    // Step 1: add one item from three different categories.
    await planner.addItem('Hotels', 'Hotel Casa Reforma');
    await planner.addItem('Flights', 'Flight MTY → MEX');
    await planner.addItem('Tours', 'Teotihuacan Sunrise Tour');

    // Added items show up in the itinerary and are marked as added in the catalog.
    await expect(planner.itineraryItem('Hotel Casa Reforma')).toBeVisible();
    await expect(planner.itineraryItem('Flight MTY → MEX')).toBeVisible();
    await expect(planner.itineraryItem('Teotihuacan Sunrise Tour')).toBeVisible();
    await expect(planner.addedButton('Teotihuacan Sunrise Tour')).toBeDisabled();

    // Step 2: total = 210 + 145 + 50 (1 traveler).
    await expect(planner.tripTotal).toHaveText('$405');
    await expect(planner.confirmTripButton).toBeEnabled();

    // Step 3: checkout shows the same amount on the pay button.
    await planner.goToCheckout();
    await expect(planner.payButton).toHaveText('Pay $405');

    // Step 4: fill traveler details and pay.
    await planner.fillTravelerDetails(traveler.name, traveler.email);
    await planner.pay();

    // Step 5: confirmation with the booking summary and code.
    await expect(planner.confirmation).toContainText('Trip confirmed! 3 bookings for $405');
    await expect(planner.bookingCode).toHaveText(/^WAY-[A-Z0-9]{6}$/);
    await expect(planner.confirmation).toContainText(`We sent the summary to ${traveler.email}`);

    // The itinerary is cleared once the trip is booked.
    await expect(planner.confirmTripButton).toBeHidden();
  });
});