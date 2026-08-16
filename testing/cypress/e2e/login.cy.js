// ============================================================
// TEST: Login - 2 test cases (valid + invalid)
// ============================================================
const LoginPage = require('../pages/LoginPage');

describe('Login Pengguna', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // TC-UI-01: Login dengan data valid
  it('TC-UI-01: Login berhasil dengan username dan password valid', () => {
    LoginPage.visit();
    LoginPage.login('user1', 'password');
    LoginPage.shouldBeOnHomePage();
    cy.contains('Hai,').should('be.visible');
  });

  // TC-UI-02: Login gagal dengan password salah
  it('TC-UI-02: Login gagal dengan password yang salah', () => {
    LoginPage.visit();
    LoginPage.login('user1', 'passwordsalah123');
    LoginPage.shouldShowError('salah');
    cy.url().should('include', '/login.html');
  });

  // TC-UI-03: Login gagal dengan field kosong
  it('TC-UI-03: Validasi field kosong saat login', () => {
    LoginPage.visit();
    LoginPage.submit();
    cy.get('.is-invalid').should('exist');
  });
});
