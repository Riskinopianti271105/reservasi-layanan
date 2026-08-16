// ============================================================
// CYPRESS SUPPORT - Custom Commands
// ============================================================

// Command: Login via API (lebih cepat dari UI)
Cypress.Commands.add('loginViaAPI', (username, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { username, password })
    .then((response) => {
      expect(response.status).to.eq(200);
      localStorage.setItem('token', response.body.data.token);
      localStorage.setItem('user', JSON.stringify(response.body.data.user));
    });
});

// Command: Add product to cart via API
Cypress.Commands.add('addToCartViaAPI', (productId, quantity = 1) => {
  const token = localStorage.getItem('token');
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/cart`,
    headers: { Authorization: `Bearer ${token}` },
    body: { product_id: productId, quantity },
  });
});

// Command: Clear cart via API
Cypress.Commands.add('clearCartViaAPI', () => {
  const token = localStorage.getItem('token');
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/cart/clear`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  });
});

// Command: Get first product
Cypress.Commands.add('getFirstProduct', () => {
  cy.request(`${Cypress.env('apiUrl')}/products`).then(res => {
    return res.body.data[0];
  });
});
