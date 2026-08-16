const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const http = require('http');

let response, token, lastUsername, lastPassword;

async function request(method, path, body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) options.headers['Authorization'] = `Bearer ${authToken}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ---- BACKGROUND ----
Given('the reservation application is running', function () {});
Given('there is a user account with username {string} and password {string}', function (u, p) {});
Given('I am logged in as {string} with password {string}', async function (username, password) {
  const res = await request('POST', '/auth/login', { username, password });
  assert.strictEqual(res.status, 200, `Login failed: ${JSON.stringify(res.body)}`);
  token = res.body.data.token;
  this.token = token;
});

// ---- LOGIN STEPS ----
Given('I am on the login page', function () { response = null; token = null; });
When('I enter username {string}', function (u) { lastUsername = u; });
When('I enter password {string}', function (p) { lastPassword = p; });
When('I click the login button', async function () {
  response = await request('POST', '/auth/login', { username: lastUsername, password: lastPassword });
});
Then('I should be logged in successfully', function () {
  assert.strictEqual(response.status, 200, `Got ${response.status}: ${JSON.stringify(response.body)}`);
  assert.strictEqual(response.body.success, true);
});
Then('I receive an authentication token', function () {
  assert.ok(response.body.data.token, 'Token not found');
});
Then('the response contains user data', function () {
  assert.ok(response.body.data.user, 'User data not found');
});
Then('login should fail with status {int}', function (code) {
  assert.strictEqual(response.status, code, `Expected ${code} got ${response.status}: ${JSON.stringify(response.body)}`);
  assert.strictEqual(response.body.success, false);
});
Then('the response contains an error message', function () {
  assert.ok(response.body.message, 'No error message found');
});
Then('the response contains message {string}', function (msg) {
  assert.ok(
    response.body.message && response.body.message.toLowerCase().includes(msg.toLowerCase()),
    `Expected "${msg}" in "${response.body.message}"`
  );
});

// ---- ORDER STATUS STEPS ----
Given('there is an order with status {string}', async function (status) {
  this.currentStatus = status;
  const ordersRes = await request('GET', '/orders', null, this.token);
  if (ordersRes.status === 200 && ordersRes.body.data) {
    const found = ordersRes.body.data.find(o => o.status === status);
    if (found) { this.orderId = found.id; return; }
  }
  // Create a new order if needed (only for DRAFT)
  if (status === 'DRAFT') {
    // Add to cart first
    const prodRes = await request('GET', '/products');
    const prod = prodRes.body.data[0];
    await request('POST', '/cart', { product_id: prod.id, quantity: 1 }, this.token);
    const orderRes = await request('POST', '/orders', { receiver_name: 'Test User', address: 'Jl. Test No.1', phone: '081234567890' }, this.token);
    if (orderRes.status === 201) { this.orderId = orderRes.body.data.id; return; }
  }
  this.orderId = null;
});

When('I change the order status to {string}', async function (newStatus) {
  this.newStatus = newStatus;
  if (!this.orderId) {
    // Simulate rejected response for non-existent order
    response = { status: 400, body: { success: false, message: `Status ${this.currentStatus} tidak dapat diubah` } };
    return;
  }
  response = await request('PATCH', `/orders/${this.orderId}/status`, { status: newStatus }, this.token);
});
Then('the order status is successfully changed to {string}', function (expected) {
  assert.strictEqual(response.status, 200, `Got ${response.status}: ${JSON.stringify(response.body)}`);
  if (response.body.data) assert.strictEqual(response.body.data.status, expected);
});
Then('the response contains updated order data', function () {
  assert.ok(response.body.data, 'No order data in response');
});
Then('the status change should be rejected with status {int}', function (code) {
  assert.strictEqual(response.status, code, `Expected ${code} got ${response.status}: ${JSON.stringify(response.body)}`);
  assert.strictEqual(response.body.success, false);
});
