// ============================================================
// TEST: Products - menampilkan daftar produk
// ============================================================
const ProductsPage = require('../pages/ProductsPage');

describe('Daftar Produk/Layanan', () => {

  before(() => {
    cy.loginViaAPI('user1', 'password');
  });

  // TC-UI-04: Menampilkan daftar produk
  it('TC-UI-04: Halaman berhasil menampilkan daftar layanan', () => {
    ProductsPage.visit();
    ProductsPage.waitForProducts();
    ProductsPage.shouldShowProducts();
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('.product-name').should('be.visible');
      cy.get('.product-price').should('be.visible');
      cy.get('.product-stock').should('be.visible');
    });
  });

  // TC-UI-05: Tambah produk ke keranjang
  it('TC-UI-05: Menambahkan layanan ke keranjang', () => {
    cy.clearCartViaAPI();
    ProductsPage.visit();
    ProductsPage.waitForProducts();
    ProductsPage.addFirstProductToCart(1);
    cy.contains('berhasil ditambahkan').should('be.visible');
  });
});
