import { test, expect } from '@playwright/test';
import { TripPlannerPage } from './pages/TripPlannerPage.js';

test.describe('Group trip and empty catalog searches', () => {
  test('empty search shows a message, clearing it restores the catalog and the user can still add an item', async ({ page }) => {
    const planner = new TripPlannerPage(page);
    await planner.open();
    // Trip details are not prefilled: set them to unlock the catalog.
    await planner.startTrip({ travelers: 1 });

    // Hotels is the default category; a term that matches nothing leaves the catalog empty.
    await planner.search('zzzz-no-such-hotel');
    await expect(planner.noResultsMessage).toBeVisible();
    await expect(planner.catalogCards).toHaveCount(0);
    await expect(planner.tripTotal).toHaveText('$0');
    await expect(planner.confirmTripButton).toBeDisabled();

    // Clearing the search brings the catalog back.
    await planner.clearSearch();
    await expect(planner.noResultsMessage).toBeHidden();
    await expect(planner.itemCard('Hotel Casa Reforma')).toBeVisible();
    await expect(planner.itemCard('Boutique Roma Norte')).toBeVisible();

    // The user can recover from the empty state and add an item normally.
    await planner.addItem('Hotels', 'Hotel Casa Reforma');
    await expect(planner.itineraryItem('Hotel Casa Reforma')).toBeVisible();
    await expect(planner.tripTotal).toHaveText('$210');

    // An empty search in another category also shows the message.
    await planner.selectCategory('Tours');
    await planner.search('zzzz-no-such-tour');
    await expect(planner.noResultsMessage).toBeVisible();
  });

  test('group of 3 travelers multiplies only per-person items, then pays and confirms', async ({ page }) => {
    const planner = new TripPlannerPage(page);
    await planner.open();

    // The traveler count is capped at 10.
    await planner.setTravelers(99);
    await expect(planner.travelersInput).toHaveValue('10');

    // Trip details are not prefilled: set destination, dates and 3 travelers, then start planning.
    await planner.startTrip({ travelers: 3 });
    await expect(planner.itinerary).toContainText('3 travelers');

    // Hotel is flat ($210); flight ($145 x 3) and tour ($36 x 3) are per person.
    await planner.addItem('Hotels', 'Hotel Casa Reforma');
    await planner.addItem('Flights', 'Flight MTY → MEX');
    await planner.addItem('Tours', 'Xochimilco Boat Ride');

    await expect(planner.itineraryItem('Hotel Casa Reforma')).toContainText('$210');
    await expect(planner.itineraryItem('Flight MTY → MEX')).toContainText('$435');
    await expect(planner.itineraryItem('Xochimilco Boat Ride')).toContainText('$108');
    // 210 + 435 + 108
    await expect(planner.tripTotal).toHaveText('$753');

    await planner.goToCheckout();
    await expect(planner.payButton).toHaveText('Pay $753');
    await planner.fillTravelerDetails('Ana Torres', 'ana@example.com');
    await planner.fillCardDetails();
    await planner.pay();

    await expect(planner.confirmation).toContainText('Trip confirmed! 3 bookings for $753');
    await expect(planner.bookingCode).toHaveText(/^WAY-[A-Z0-9]+$/);
    await expect(planner.confirmation).toContainText('ana@example.com');
  });
});
