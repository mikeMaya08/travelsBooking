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

    // Trip setup and catalog filters
    this.destinationSelect = page.getByLabel('Destination');
    this.arrivalInput = page.getByLabel('Arrival');
    this.departureInput = page.getByLabel('Departure');
    this.tripSearchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.travelersInput = page.getByLabel('Travelers');
    this.searchInput = page.getByLabel('Search');
    this.noResultsMessage = page.getByText('No results for your search.');
    this.catalogCards = page.getByRole('article');
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

  // Trip details are no longer prefilled: choose destination, dates and travelers, then start planning.
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
    // The card is already scoped to the item, so match the button by its "Add ..." prefix:
    // the deployed app now labels it "Add to trip" instead of "Add <item>".
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

  async pay() {
    await this.payButton.click();
  }
}
