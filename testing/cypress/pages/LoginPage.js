// ============================================================
// PAGE OBJECT: LoginPage
// ============================================================
class LoginPage {
  // Selectors
  get usernameInput() { return cy.get('[data-testid="username-input"]'); }
  get passwordInput() { return cy.get('[data-testid="password-input"]'); }
  get loginButton() { return cy.get('[data-testid="login-button"]'); }
  get errorMessage() { return cy.get('[data-testid="error-message"]'); }

  // Actions
  visit() { cy.visit('/login.html'); return this; }

  fillUsername(username) { this.usernameInput.clear().type(username); return this; }

  fillPassword(password) { this.passwordInput.clear().type(password); return this; }

  submit() { this.loginButton.click(); return this; }

  login(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
    return this;
  }

  // Assertions
  shouldShowError(message = null) {
    this.errorMessage.should('be.visible');
    if (message) this.errorMessage.should('contain.text', message);
    return this;
  }

  shouldBeOnHomePage() {
    cy.url().should('include', '/index.html');
    return this;
  }
}

module.exports = new LoginPage();
