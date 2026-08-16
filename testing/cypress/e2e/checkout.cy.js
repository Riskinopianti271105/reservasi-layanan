// ============================================================
// TEST: Checkout
// ============================================================
const CheckoutPage = require('../pages/CheckoutPage');

describe('Checkout / Pembuatan Pesanan', () => {

  before(() => {
    cy.loginViaAPI('user1', 'password');
  });

  beforeEach(() => {
    cy.clearCartViaAPI();
    cy.getFirstProduct().then(product => {
      cy.addToCartViaAPI(product.id, 1);
    });
  });

  // TC-UI-08: Checkout berhasil dengan data valid
  it('TC-UI-08: Checkout berhasil dengan data penerima yang valid', () => {
    CheckoutPage.visit();
    CheckoutPage.fillForm({
      receiverName: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Contoh No. 123, Makassar',
      notes: 'Tolong hubungi sebelum datang',
    });
    CheckoutPage.submitOrder();
    CheckoutPage.shouldRedirectToOrders();
  });

  // TC-UI-09: Checkout gagal dengan data tidak lengkap
  it('TC-UI-09: Checkout ditolak ketika data penerima tidak lengkap', () => {
    CheckoutPage.visit();
    // Kosongkan semua field yang mungkin sudah terisi
    cy.get('[data-testid="receiver-name-input"]').clear();
    cy.get('[data-testid="phone-input"]').clear();
    cy.get('[data-testid="address-input"]').clear();
    CheckoutPage.submitOrder();
    CheckoutPage.shouldShowError();
    cy.url().should('include', '/checkout.html');
  });
});
