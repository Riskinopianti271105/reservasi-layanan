// ============================================================
// TEST: Cart - keranjang belanja
// ============================================================
const CartPage = require('../pages/CartPage');

describe('Keranjang Belanja', () => {

  before(() => {
    cy.loginViaAPI('user1', 'password');
  });

  beforeEach(() => {
    cy.clearCartViaAPI();
    cy.getFirstProduct().then(product => {
      cy.addToCartViaAPI(product.id, 1);
    });
  });

  // TC-UI-06: Mengubah jumlah produk di keranjang
  it('TC-UI-06: Mengubah jumlah produk dalam keranjang', () => {
    CartPage.visit();
    CartPage.waitForCart();
    CartPage.shouldHaveItems(1);
    CartPage.increaseQty(0);
    CartPage.qtyValues.first().should('contain', '2');
  });

  // TC-UI-07: Menghapus produk dari keranjang
  it('TC-UI-07: Menghapus produk dari keranjang', () => {
    CartPage.visit();
    CartPage.waitForCart();
    CartPage.removeFirstItem();
    cy.wait(500);
    CartPage.shouldBeEmpty();
  });
});
