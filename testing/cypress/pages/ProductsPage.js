// ============================================================
// PAGE OBJECT: ProductsPage
// ============================================================
class ProductsPage {
  get productsContainer() { return cy.get('[data-testid="products-container"]'); }
  get productList() { return cy.get('[data-testid="product-list"]'); }
  get productCards() { return cy.get('[data-testid="product-card"]'); }
  get searchInput() { return cy.get('[data-testid="search-input"]'); }
  get categoryFilter() { return cy.get('[data-testid="category-filter"]'); }
  get addToCartButtons() { return cy.get('[data-testid="add-to-cart-btn"]'); }
  get confirmAddBtn() { return cy.get('[data-testid="confirm-add-to-cart"]'); }
  get quantityInput() { return cy.get('[data-testid="quantity-input"]'); }
  get cartBadge() { return cy.get('.cart-badge'); }

  visit() { cy.visit('/index.html'); return this; }

  waitForProducts() {
    this.productList.should('be.visible');
    return this;
  }

  searchFor(term) {
    this.searchInput.clear().type(term);
    cy.wait(500);
    return this;
  }

  filterByCategory(category) {
    this.categoryFilter.select(category);
    return this;
  }

  addFirstProductToCart(quantity = 1) {
    this.addToCartButtons.first().click();
    if (quantity > 1) {
      this.quantityInput.clear().type(quantity.toString());
    }
    this.confirmAddBtn.click();
    return this;
  }

  shouldShowProducts() {
    this.productList.should('be.visible');
    this.productCards.should('have.length.greaterThan', 0);
    return this;
  }

  shouldShowProductCount(count) {
    this.productCards.should('have.length', count);
    return this;
  }
}

module.exports = new ProductsPage();
