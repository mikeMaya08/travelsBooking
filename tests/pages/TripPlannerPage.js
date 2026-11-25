// Page object for the Wayfarer trip planner (catalog, "My trip" itinerary and checkout).
export class TripPlannerPage {
  constructor(page) {
    this.page = page;

    // Itinerary sidebar
    this.itinerary = page.getByRole('complementary', { name: 'My trip' });
    this.tripTotal = page.getByTestId('trip-total');
    this.confirmTripButton = page.getByRole('button', { name: 'Confirm trip' });

    // Checkout form
    this.fullNameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email');
    this.payButton = page.getByRole('button', { name: /^Pay/ });

    // Confirmation
    this.confirmation = page.getByRole('status');
    this.bookingCode = page.getByTestId('booking-code');
  }

  async open() {
    await this.page.goto('/');
  }

  // Catalog card for an item, scoped by its visible name.
  itemCard(itemName) {
    return this.page.getByRole('article').filter({ hasText: itemName });
  }

  // Switches to a category tab (e.g. "Hotels") and adds the named item to the trip.
  async addItem(category, itemName) {
    await this.page.getByRole('tab', { name: category }).click();
    await this.itemCard(itemName).getByRole('button', { name: `Add ${itemName}` }).click();
  }

  // Button shown on a card once the item is already in the trip.
  addedButton(itemName) {
    return this.itemCard(itemName).getByRole('button', { name: `${itemName} added` });
  }

  // Entry for an item in the "My trip" itinerary.
  itineraryItem(itemName) {
    return this.itinerary.getByRole('listitem').filter({ hasText: itemName });
  }

  async goToCheckout() {
    await this.confirmTripButton.click();
  }

  async fillTravelerDetails(name, email) {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async pay() {
    await this.payButton.click();
  }
}
