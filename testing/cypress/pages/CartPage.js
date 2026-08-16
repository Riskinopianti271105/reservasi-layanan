// ============================================================
// PAGE OBJECT: CartPage
// ============================================================
class CartPage {
  get cartContainer() { return cy.get('[data-testid="cart-container"]'); }
  get cartItems() { return cy.get('[data-testid="cart-item"]'); }
  get totalPrice() { return cy.get('[data-testid="total-price"]'); }
  get checkoutBtn() { return cy.get('[data-testid="checkout-btn"]'); }
  get clearCartBtn() { return cy.get('[data-testid="clear-cart-btn"]'); }
  get removeItemBtns() { return cy.get('[data-testid="remove-item-btn"]'); }
  get qtyIncreaseBtn() { return cy.get('[data-testid="qty-increase"]'); }
  get qtyDecreaseBtn() { return cy.get('[data-testid="qty-decrease"]'); }
  get qtyValues() { return cy.get('[data-testid="qty-value"]'); }

  visit() { cy.visit('/cart.html'); return this; }

  waitForCart() {
    cy.get('[data-testid="cart-container"]').should('be.visible');
    return this;
  }

  increaseQty(index = 0) {
    this.qtyIncreaseBtn.eq(index).click();
    cy.wait(300);
    return this;
  }

  decreaseQty(index = 0) {
    this.qtyDecreaseBtn.eq(index).click();
    cy.wait(300);
    return this;
  }

  removeFirstItem() {
    this.removeItemBtns.first().click();
    return this;
  }

  proceedToCheckout() {
    this.checkoutBtn.click();
    return this;
  }

  shouldBeEmpty() {
    cy.contains('Keranjang Anda kosong').should('be.visible');
    return this;
  }

  shouldHaveItems(count) {
    this.cartItems.should('have.length', count);
    return this;
  }
}

module.exports = new CartPage();
