// ============================================================
// PAGE OBJECT: CheckoutPage
// ============================================================
class CheckoutPage {
  get receiverNameInput() { return cy.get('[data-testid="receiver-name-input"]'); }
  get phoneInput() { return cy.get('[data-testid="phone-input"]'); }
  get addressInput() { return cy.get('[data-testid="address-input"]'); }
  get notesInput() { return cy.get('[data-testid="notes-input"]'); }
  get placeOrderBtn() { return cy.get('[data-testid="place-order-btn"]'); }
  get errorMessage() { return cy.get('[data-testid="checkout-error"]'); }
  get totalPrice() { return cy.get('[data-testid="checkout-total"]'); }

  visit() { cy.visit('/checkout.html'); return this; }

  fillReceiverName(name) { this.receiverNameInput.clear().type(name); return this; }
  fillPhone(phone) { this.phoneInput.clear().type(phone); return this; }
  fillAddress(address) { this.addressInput.clear().type(address); return this; }
  fillNotes(notes) { this.notesInput.clear().type(notes); return this; }

  fillForm({ receiverName, phone, address, notes }) {
    if (receiverName !== undefined) this.fillReceiverName(receiverName);
    if (phone !== undefined) this.fillPhone(phone);
    if (address !== undefined) this.fillAddress(address);
    if (notes !== undefined) this.fillNotes(notes);
    return this;
  }

  submitOrder() { this.placeOrderBtn.click(); return this; }

  shouldShowError(message = null) {
    this.errorMessage.should('be.visible');
    if (message) this.errorMessage.should('contain.text', message);
    return this;
  }

  shouldRedirectToOrders() {
    cy.url().should('include', '/orders.html');
    return this;
  }
}

module.exports = new CheckoutPage();
