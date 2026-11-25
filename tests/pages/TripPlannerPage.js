// Page object for the Wayfarer trip planner (trip setup, catalog, "My trip" itinerary and checkout).
export const DEMO_CARDS = {
  approved: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
};

export class TripPlannerPage {
  constructor(page) {
    this.page = page;

    // Itinerary sidebar
    this.itinerary = page.getByRole('complementary', { name: 'My trip' });
    this.tripTotal = page.getByTestId('trip-total');
    this.confirmTripButton = page.getByRole('button', { name: 'Confirm trip' });

    // Checkout form: traveler + (fake) card payment
    this.fullNameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email');
    this.cardNumberInput = page.getByLabel('Card number');
    this.expiryInput = page.getByLabel('Expiry');
    this.cvcInput = page.getByLabel('CVC');
    this.payButton = page.getByRole('button', { name: /^Pay/ });
    this.paymentError = page.getByTestId('pay-error');
    this.validationErrors = page.getByRole('alert');

    // Confirmation
    this.confirmation = page.getByRole('status');
    this.bookingCode = page.getByTestId('booking-code');

    // Trip setup (empty by default; the catalog stays locked until Search is clicked)
    this.destinationSelect = page.getByLabel('Destination');
    this.arrivalInput = page.getByLabel('Arrival');
    this.departureInput = page.getByLabel('Departure');
    this.travelersInput = page.getByLabel('Travelers');
    this.tripSearchButton = page.getByRole('button', { name: 'Search', exact: true });

    // Catalog filters
    this.searchInput = page.getByLabel('Search catalog');
    this.noResultsMessage = page.getByText('No results for your search.');
    this.catalogCards = page.getByRole('article');
  }

  async open() {
    await this.page.goto('/');
  }

  async setTravelers(count) {
    await this.travelersInput.fill(String(count));
  }

  async setDestination(label) {
    await this.destinationSelect.selectOption({ label });
  }

  async setDates(arrival, departure) {
    await this.arrivalInput.fill(arrival);
    await this.departureInput.fill(departure);
  }

  // Submits the trip setup; the catalog stays disabled until this is done.
  async submitTripSetup() {
    await this.tripSearchButton.click();
  }

  // Trip details are not prefilled: choose destination, dates and travelers, then click Search.
  async startTrip({ destination = 'Mexico City', arrival = '2026-12-10', departure = '2026-12-12', travelers = 1 } = {}) {
    await this.setDestination(destination);
    await this.setDates(arrival, departure);
    await this.setTravelers(travelers);
    await this.submitTripSetup();
  }

  async search(term) {
    await this.searchInput.fill(term);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async selectCategory(category) {
    await this.page.getByRole('tab', { name: category }).click();
  }

  // Catalog card for an item, scoped by its visible name.
  itemCard(itemName) {
    return this.page.getByRole('article').filter({ hasText: itemName });
  }

  // Switches to a category tab (e.g. "Hotels") and adds the named item to the trip.
  // The card is already scoped to the item, so the button is matched by its "Add ..." prefix
  // (works for both "Add to trip" and the compact "+ Add" button whose aria-label is "Add <item> to trip").
  async addItem(category, itemName) {
    await this.selectCategory(category);
    await this.itemCard(itemName).getByRole('button', { name: /^Add\b/ }).click();
  }

  // Button shown on a card once the item is already in the trip ("Added" / "<item> added").
  addedButton(itemName) {
    return this.itemCard(itemName).getByRole('button', { name: /added/i });
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

  // Card fields auto-format; expiry accepts digits only (e.g. "1230" becomes 12/30).
  async fillCardDetails({ number = DEMO_CARDS.approved, expiry = '1230', cvc = '123' } = {}) {
    await this.cardNumberInput.fill(number);
    await this.expiryInput.fill(expiry);
    await this.cvcInput.fill(cvc);
  }

  async pay() {
    await this.payButton.click();
  }
}
