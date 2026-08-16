// ============================================================
// API SERVICE - Centralized API calls
// ============================================================
const API_BASE = '/api';

const api = {
  getToken() { return localStorage.getItem('token'); },
  getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; },
  isLoggedIn() { return !!this.getToken(); },

  headers(json = true) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  async request(method, path, body = null) {
    const opts = { method, headers: this.headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.message || 'Terjadi kesalahan.' };
    return data;
  },

  // Auth
  async login(username, password) {
    const data = await this.request('POST', '/auth/login', { username, password });
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data;
  },
  logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); },

  // Products
  getProducts(params = '') { return this.request('GET', `/products${params}`); },
  getProduct(id) { return this.request('GET', `/products/${id}`); },
  createProduct(body) { return this.request('POST', '/products', body); },
  updateProduct(id, body) { return this.request('PATCH', `/products/${id}`, body); },
  deleteProduct(id) { return this.request('DELETE', `/products/${id}`); },

  // Cart
  getCart() { return this.request('GET', '/cart'); },
  addToCart(product_id, quantity) { return this.request('POST', '/cart', { product_id, quantity }); },
  updateCart(id, quantity) { return this.request('PATCH', `/cart/${id}`, { quantity }); },
  removeFromCart(id) { return this.request('DELETE', `/cart/${id}`); },
  clearCart() { return this.request('DELETE', '/cart/clear'); },

  // Orders
  getOrders() { return this.request('GET', '/orders'); },
  getOrder(id) { return this.request('GET', `/orders/${id}`); },
  createOrder(body) { return this.request('POST', '/orders', body); },
  updateOrderStatus(id, status) { return this.request('PATCH', `/orders/${id}/status`, { status }); },
};

// ============================================================
// UI HELPERS
// ============================================================
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function requireLogin() {
  if (!api.isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function renderNavbar(cartCount = 0) {
  const user = api.getUser();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const isAdmin = user?.role === 'admin';

  const adminMenu = `
    <span style="font-size:0.75rem;background:rgba(186,150,193,0.35);color:#DCD7D5;padding:0.2rem 0.6rem;border-radius:4px;font-weight:700;letter-spacing:0.05em">ADMIN</span>
    <a href="/admin-dashboard.html">Dashboard</a>
    <a href="/admin-products.html">Kelola Layanan</a>
    <a href="/admin-orders.html">Semua Pesanan</a>
    <a href="/products.html" style="opacity:0.7">Lihat Toko</a>
  `;

  const userMenu = `
    <a href="/products.html">Layanan</a>
    <a href="/cart.html" class="cart-badge" id="cart-link">
      🛒 Keranjang <span id="cart-count">${cartCount}</span>
    </a>
    <a href="/orders.html">Pesanan Saya</a>
  `;

  nav.innerHTML = `
    <a href="${isAdmin ? '/admin-dashboard.html' : '/products.html'}" class="navbar-brand">Reservasi<span>Layanan</span></a>
    <nav class="navbar-nav">
      ${user ? (isAdmin ? adminMenu : userMenu) : ''}
      ${user ? `
        <span style="font-size:0.82rem;color:#DCD7D5;padding:0 0.25rem">Hai, ${user.full_name.split(' ')[0]}</span>
        <button onclick="handleLogout()" class="btn btn-outline btn-sm" style="color:#DCD7D5;border-color:rgba(220,215,213,0.4)">Keluar</button>
      ` : `
        <a href="/login.html" class="btn btn-primary btn-sm">Masuk</a>
      `}
    </nav>
  `;
}

async function handleLogout() {
  api.logout();
  showToast('Berhasil keluar. Sampai jumpa!');
  setTimeout(() => window.location.href = '/login.html', 800);
}

async function updateCartCount() {
  if (!api.isLoggedIn()) return;
  try {
    const data = await api.getCart();
    const count = data.data.total_items;
    const el = document.getElementById('cart-count');
    if (el) el.textContent = count;
    return count;
  } catch { return 0; }
}

function getCategoryEmoji(category) {
  const map = { Otomotif: '🚗', Elektronik: '💻', Kecantikan: '✂️', Kesehatan: '🏥', Kreatif: '📸' };
  return map[category] || '📦';
}
