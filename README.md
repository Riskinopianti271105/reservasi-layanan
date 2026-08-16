# Sistem Reservasi Layanan

Aplikasi web sistem reservasi layanan untuk UTS Advanced Software Testing and Quality Assurance.

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML/CSS/JavaScript
- **Container**: Docker + Docker Compose
- **Testing UI**: Cypress (Page Object Model)
- **Testing API**: Postman + Newman
- **TDD**: Jest
- **BDD**: Cucumber-JS

---

## Cara Menjalankan Aplikasi

### 1. Jalankan dengan Docker Compose

```bash
docker-compose up --build
```

Akses aplikasi:
- Frontend: http://localhost:8081
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

### Akun Demo
| Username | Password | Role |
|----------|----------|------|
| admin    | password | Admin |
| user1    | password | Customer |

---

## Cara Menjalankan Testing

### TDD - Jest (Unit Test)
```bash
cd backend
npm install
npm test
# Dengan coverage:
npm run test:coverage
```

### BDD - Cucumber-JS
```bash
cd backend
npm run test:bdd
```

### UI Testing - Cypress
```bash
cd testing
npm install
# Run headless:
npm run cypress:run
# Run dengan GUI:
npm run cypress:open
```
> Pastikan aplikasi sudah berjalan sebelum menjalankan Cypress

### API Testing - Newman
```bash
# Pastikan Newman terinstall:
npm install -g newman newman-reporter-htmlextra

cd testing
npm run newman
```
> Pastikan backend berjalan di http://localhost:3000

### Menjalankan Semua Test Sekaligus (Docker)
```bash
docker-compose --profile testing up cypress
docker-compose --profile testing up newman
```

---

## Struktur Proyek

```
reservasi-layanan/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js                    # Entry point
│   │   ├── config/
│   │   │   ├── database.js           # Koneksi PostgreSQL
│   │   │   └── init.sql              # Schema + Seed data
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, Register
│   │   │   ├── productController.js  # CRUD Produk
│   │   │   ├── cartController.js     # Keranjang
│   │   │   └── orderController.js    # Pesanan
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT Authentication
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   └── orderRoutes.js
│   │   └── utils/
│   │       └── orderValidator.js     # Validasi bisnis (TDD target)
│   └── tests/
│       ├── unit/
│       │   ├── orderValidator.test.js  # TDD - validateStatusTransition
│       │   └── productValidator.test.js # TDD - validateProduct (White-box)
│       └── bdd/
│           ├── features/
│           │   ├── login.feature       # BDD Feature 1
│           │   └── order-status.feature # BDD Feature 2
│           └── step-definitions/
│               └── steps.js
├── frontend/
│   ├── nginx.conf
│   └── public/
│       ├── index.html      # Halaman Produk
│       ├── login.html      # Halaman Login
│       ├── register.html   # Halaman Registrasi
│       ├── cart.html       # Halaman Keranjang
│       ├── orders.html     # Halaman Pesanan
│       ├── css/style.css
│       └── js/services/api.js
└── testing/
    ├── cypress.config.js
    ├── package.json
    ├── cypress/
    │   ├── pages/            # Page Object Model
    │   │   ├── LoginPage.js
    │   │   ├── ProductsPage.js
    │   │   ├── CartPage.js
    │   │   └── CheckoutPage.js
    │   ├── e2e/              # Test Scripts
    │   │   ├── login.cy.js       # TC-UI-01,02,03
    │   │   ├── products.cy.js    # TC-UI-04,05
    │   │   ├── cart.cy.js        # TC-UI-06,07
    │   │   └── checkout.cy.js    # TC-UI-08,09
    │   └── support/
    │       └── commands.js       # Custom Cypress commands
    └── api/
        ├── reservasi-api-collection.json  # Postman Collection (13 test)
        └── environment.json               # Environment variables
```

---

## RESTful API Endpoints

| Method | Endpoint | Fungsi | Auth |
|--------|----------|--------|------|
| POST | /api/auth/login | Login pengguna | - |
| POST | /api/auth/register | Registrasi | - |
| GET | /api/auth/me | Profil user | ✓ |
| GET | /api/products | Semua produk | - |
| GET | /api/products/:id | Detail produk | - |
| POST | /api/products | Tambah produk | Admin |
| PATCH | /api/products/:id | Update produk | Admin |
| DELETE | /api/products/:id | Hapus produk | Admin |
| GET | /api/cart | Isi keranjang | ✓ |
| POST | /api/cart | Tambah ke keranjang | ✓ |
| PATCH | /api/cart/:id | Update qty | ✓ |
| DELETE | /api/cart/:id | Hapus item | ✓ |
| DELETE | /api/cart/clear | Kosongkan keranjang | ✓ |
| GET | /api/orders | Daftar pesanan | ✓ |
| POST | /api/orders | Buat pesanan | ✓ |
| GET | /api/orders/:id | Detail pesanan | ✓ |
| PATCH | /api/orders/:id/status | Update status | ✓ |
