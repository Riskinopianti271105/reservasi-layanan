-- ============================================================
-- SISTEM RESERVASI LAYANAN - Database Schema
-- ============================================================

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel products (layanan yang bisa dipesan)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel cart
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Tabel orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    receiver_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel order_items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('admin', 'admin@reservasi.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '081234567890', 'admin')
ON CONFLICT DO NOTHING;

-- Customer user (password: user123)
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('user1', 'user1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi Santoso', '082345678901', 'customer')
ON CONFLICT DO NOTHING;

-- Seed layanan/produk (5 kategori x 10 layanan = 50 layanan)
INSERT INTO products (name, description, category, price, stock, image_url) VALUES

-- ===== OTOMOTIF (10) =====
('Cuci Motor Standar', 'Cuci motor eksterior menggunakan shampo khusus motor, bilas bersih dan lap kering', 'Otomotif', 25000, 30, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'),
('Cuci Motor Premium', 'Cuci motor lengkap termasuk pembersihan mesin, rantai, dan pengkilap body', 'Otomotif', 45000, 25, 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&q=80'),
('Cuci Mobil Eksterior', 'Cuci mobil eksterior menggunakan shampo premium, bilas dan lap kering', 'Otomotif', 55000, 20, 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&q=80'),
('Cuci Mobil Interior', 'Pembersihan interior mobil termasuk vakum, lap dashboard, dan pembersih jok', 'Otomotif', 80000, 15, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80'),
('Cuci Mobil Full Package', 'Paket lengkap cuci eksterior + interior + wax body + parfum mobil', 'Otomotif', 150000, 10, 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80'),
('Ganti Oli Motor', 'Ganti oli mesin motor termasuk oli dan jasa, untuk semua jenis motor', 'Otomotif', 85000, 20, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80'),
('Ganti Oli Mobil', 'Ganti oli mesin mobil termasuk oli sintetik dan filter oli', 'Otomotif', 175000, 15, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80'),
('Servis Rem Motor', 'Pengecekan dan penggantian kampas rem depan dan belakang motor', 'Otomotif', 120000, 10, 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&q=80'),
('Tambal Ban Tubeless', 'Tambal ban tubeless menggunakan metode plug + patch, garansi 1 bulan', 'Otomotif', 35000, 40, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80'),
('Poles Body Mobil', 'Pemolesan body mobil untuk menghilangkan goresan halus dan memulihkan kilap cat', 'Otomotif', 300000, 8, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80'),

-- ===== ELEKTRONIK (10) =====
('Servis AC Rumah 1 PK', 'Cuci dan servis AC split 1 PK termasuk pembersihan filter dan evaporator', 'Elektronik', 120000, 15, 'https://images.unsplash.com/photo-1631185537725-2e4f20f65cf9?w=400&q=80'),
('Servis AC Rumah 2 PK', 'Cuci dan servis AC split 2 PK termasuk pengecekan freon dan komponen', 'Elektronik', 180000, 10, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80'),
('Isi Freon AC', 'Pengisian freon AC R32/R410 termasuk pengecekan kebocoran pipa', 'Elektronik', 250000, 12, 'https://images.unsplash.com/photo-1625227277013-d9be3e2e2f9c?w=400&q=80'),
('Servis Laptop', 'Pembersihan debu, penggantian thermal paste, dan optimasi performa laptop', 'Elektronik', 150000, 10, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80'),
('Install Ulang Windows', 'Instalasi ulang Windows 10/11 termasuk driver dan software dasar', 'Elektronik', 100000, 15, 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=400&q=80'),
('Servis HP Layar Retak', 'Penggantian layar HP yang retak untuk berbagai merek dan tipe', 'Elektronik', 350000, 8, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80'),
('Servis Kulkas', 'Pengecekan dan perbaikan kulkas tidak dingin, termasuk isi freon jika diperlukan', 'Elektronik', 200000, 6, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80'),
('Servis Mesin Cuci', 'Perbaikan mesin cuci bermasalah termasuk pengecekan motor dan pompa air', 'Elektronik', 175000, 8, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80'),
('Pasang CCTV 2 Kamera', 'Pemasangan 2 unit kamera CCTV indoor/outdoor termasuk DVR dan kabel', 'Elektronik', 1200000, 5, 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80'),
('Servis Printer', 'Servis printer tidak bisa print, head cleaning, dan isi tinta semua merek', 'Elektronik', 125000, 12, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&q=80'),

-- ===== KECANTIKAN (10) =====
('Potong Rambut Pria', 'Potong rambut pria dengan stylist berpengalaman, termasuk keramas dan blow dry', 'Kecantikan', 45000, 30, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80'),
('Potong Rambut Wanita', 'Potong rambut wanita sesuai keinginan, termasuk keramas dan blow dry rapi', 'Kecantikan', 75000, 25, 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&q=80'),
('Cat Rambut Full', 'Pengecatan rambut full dengan cat premium, termasuk keramas dan kondisioner', 'Kecantikan', 250000, 15, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80'),
('Creambath & Hair Spa', 'Perawatan rambut dengan creambath, hair mask, dan pijat kepala relaksasi', 'Kecantikan', 120000, 20, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80'),
('Manicure Pedicure', 'Perawatan kuku tangan dan kaki termasuk kutikula, pemotongan, dan pewarnaan', 'Kecantikan', 90000, 20, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80'),
('Facial Wajah Basic', 'Pembersihan wajah mendalam termasuk steam, ekstraksi komedo, dan masker', 'Kecantikan', 150000, 15, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80'),
('Facial Wajah Premium', 'Facial premium dengan teknologi ultrasonic + LED therapy + serum vitamin C', 'Kecantikan', 350000, 8, 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400&q=80'),
('Waxing Ketiak', 'Waxing bulu ketiak menggunakan lilin berkualitas, hasil bersih dan tahan lama', 'Kecantikan', 55000, 25, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80'),
('Makeup Wisuda', 'Jasa makeup wisuda profesional termasuk sanggul atau styling rambut', 'Kecantikan', 450000, 10, 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&q=80'),
('Lash Lifting & Tint', 'Pengangkatan bulu mata permanen + pewarnaan, hasil natural tahan 6-8 minggu', 'Kecantikan', 200000, 12, 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&q=80'),

-- ===== KESEHATAN (10) =====
('Konsultasi Dokter Umum', 'Konsultasi kesehatan dengan dokter umum berlisensi, termasuk pemeriksaan dasar', 'Kesehatan', 100000, 20, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80'),
('Konsultasi Dokter Gigi', 'Pemeriksaan gigi rutin dan konsultasi perawatan gigi dengan dokter gigi', 'Kesehatan', 150000, 15, 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80'),
('Pijat Relaksasi 60 Menit', 'Pijat seluruh tubuh teknik Swedish untuk relaksasi dan mengurangi stres', 'Kesehatan', 120000, 15, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80'),
('Pijat Refleksi Kaki', 'Pijat titik refleksi telapak kaki 45 menit untuk melancarkan peredaran darah', 'Kesehatan', 85000, 20, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80'),
('Pijat Bayi', 'Layanan pijat bayi oleh terapis bersertifikat untuk tumbuh kembang optimal', 'Kesehatan', 100000, 10, 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80'),
('Tes Gula Darah', 'Pemeriksaan kadar gula darah puasa dan 2 jam setelah makan', 'Kesehatan', 75000, 30, 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80'),
('Tes Kolesterol Lengkap', 'Pemeriksaan kolesterol total, LDL, HDL, dan trigliserida', 'Kesehatan', 150000, 20, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80'),
('Akupunktur', 'Terapi akupunktur oleh terapis bersertifikat untuk berbagai keluhan kesehatan', 'Kesehatan', 200000, 8, 'https://images.unsplash.com/photo-1611071536226-2d8eb2e4e55a?w=400&q=80'),
('Fisioterapi', 'Terapi fisik untuk pemulihan cedera, nyeri punggung, dan gangguan gerak', 'Kesehatan', 250000, 6, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80'),
('Home Visit Perawat', 'Kunjungan perawat ke rumah untuk perawatan luka, infus, atau injeksi obat', 'Kesehatan', 300000, 5, 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=400&q=80'),

-- ===== KREATIF (10) =====
('Foto Produk Standar', 'Sesi foto produk dengan latar putih, editing dasar, 10 foto hasil edit', 'Kreatif', 250000, 10, 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=80'),
('Foto Produk Premium', 'Foto produk dengan properti dan konsep kreatif, 20 foto hasil edit profesional', 'Kreatif', 500000, 6, 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&q=80'),
('Foto Portrait', 'Sesi foto portrait individu dengan konsep bebas, 15 foto hasil edit', 'Kreatif', 350000, 8, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80'),
('Video Profil Bisnis', 'Pembuatan video profil bisnis durasi 2-3 menit termasuk editing dan musik', 'Kreatif', 1500000, 4, 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80'),
('Desain Logo', 'Desain logo profesional termasuk 3 konsep awal, revisi 3x, dan file vector', 'Kreatif', 400000, 10, 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80'),
('Desain Brosur / Flyer', 'Desain brosur atau flyer promosi ukuran A5/A4, format print-ready', 'Kreatif', 150000, 15, 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80'),
('Desain Banner Spanduk', 'Desain spanduk atau banner outdoor ukuran custom, format print-ready', 'Kreatif', 200000, 12, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80'),
('Kelola Sosial Media', 'Pengelolaan 1 akun sosial media selama 1 bulan (12 konten + caption + posting)', 'Kreatif', 750000, 5, 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80'),
('Pembuatan Website Toko', 'Pembuatan website toko online sederhana menggunakan WordPress + WooCommerce', 'Kreatif', 2500000, 3, 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=80'),
('Edit Video Pendek', 'Editing video pendek durasi max 3 menit untuk konten reels/TikTok/YouTube Shorts', 'Kreatif', 200000, 10, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&q=80')

ON CONFLICT DO NOTHING; 'Cuci motor eksterior menggunakan shampo khusus motor, bilas bersih dan lap kering', 'Otomotif', 25000, 30),
('Cuci Motor Premium', 'Cuci motor lengkap termasuk pembersihan mesin, rantai, dan pengkilap body', 'Otomotif', 45000, 25),
('Cuci Mobil Eksterior', 'Cuci mobil eksterior menggunakan shampo premium, bilas dan lap kering', 'Otomotif', 55000, 20),
('Cuci Mobil Interior', 'Pembersihan interior mobil termasuk vakum, lap dashboard, dan pembersih jok', 'Otomotif', 80000, 15),
('Cuci Mobil Full Package', 'Paket lengkap cuci eksterior + interior + wax body + parfum mobil', 'Otomotif', 150000, 10),
('Ganti Oli Motor', 'Ganti oli mesin motor termasuk oli dan jasa, untuk semua jenis motor', 'Otomotif', 85000, 20),
('Ganti Oli Mobil', 'Ganti oli mesin mobil termasuk oli sintetik dan filter oli', 'Otomotif', 175000, 15),
('Servis Rem Motor', 'Pengecekan dan penggantian kampas rem depan dan belakang motor', 'Otomotif', 120000, 10),
('Tambal Ban Tubeless', 'Tambal ban tubeless menggunakan metode plug + patch, garansi 1 bulan', 'Otomotif', 35000, 40),
('Poles Body Mobil', 'Pemolesan body mobil untuk menghilangkan goresan halus dan memulihkan kilap cat', 'Otomotif', 300000, 8),

-- ===== ELEKTRONIK (10) =====
('Servis AC Rumah 1 PK', 'Cuci dan servis AC split 1 PK termasuk pembersihan filter dan evaporator', 'Elektronik', 120000, 15),
('Servis AC Rumah 2 PK', 'Cuci dan servis AC split 2 PK termasuk pengecekan freon dan komponen', 'Elektronik', 180000, 10),
('Isi Freon AC', 'Pengisian freon AC R32/R410 termasuk pengecekan kebocoran pipa', 'Elektronik', 250000, 12),
('Servis Laptop', 'Pembersihan debu, penggantian thermal paste, dan optimasi performa laptop', 'Elektronik', 150000, 10),
('Install Ulang Windows', 'Instalasi ulang Windows 10/11 termasuk driver dan software dasar', 'Elektronik', 100000, 15),
('Servis HP Layar Retak', 'Penggantian layar HP yang retak untuk berbagai merek dan tipe', 'Elektronik', 350000, 8),
('Servis Kulkas', 'Pengecekan dan perbaikan kulkas tidak dingin, termasuk isi freon jika diperlukan', 'Elektronik', 200000, 6),
('Servis Mesin Cuci', 'Perbaikan mesin cuci bermasalah termasuk pengecekan motor dan pompa air', 'Elektronik', 175000, 8),
('Pasang CCTV 2 Kamera', 'Pemasangan 2 unit kamera CCTV indoor/outdoor termasuk DVR dan kabel', 'Elektronik', 1200000, 5),
('Servis Printer', 'Servis printer tidak bisa print, head cleaning, dan isi tinta semua merek', 'Elektronik', 125000, 12),

-- ===== KECANTIKAN (10) =====
('Potong Rambut Pria', 'Potong rambut pria dengan stylist berpengalaman, termasuk keramas dan blow dry', 'Kecantikan', 45000, 30),
('Potong Rambut Wanita', 'Potong rambut wanita sesuai keinginan, termasuk keramas dan blow dry rapi', 'Kecantikan', 75000, 25),
('Cat Rambut Full', 'Pengecatan rambut full dengan cat premium, termasuk keramas dan kondisioner', 'Kecantikan', 250000, 15),
('Creambath & Hair Spa', 'Perawatan rambut dengan creambath, hair mask, dan pijat kepala relaksasi', 'Kecantikan', 120000, 20),
('Manicure Pedicure', 'Perawatan kuku tangan dan kaki termasuk kutikula, pemotongan, dan pewarnaan', 'Kecantikan', 90000, 20),
('Facial Wajah Basic', 'Pembersihan wajah mendalam termasuk steam, ekstraksi komedo, dan masker', 'Kecantikan', 150000, 15),
('Facial Wajah Premium', 'Facial premium dengan teknologi ultrasonic + LED therapy + serum vitamin C', 'Kecantikan', 350000, 8),
('Waxing Ketiak', 'Waxing bulu ketiak menggunakan lilin berkualitas, hasil bersih dan tahan lama', 'Kecantikan', 55000, 25),
('Makeup Wisuda', 'Jasa makeup wisuda profesional termasuk sanggul atau styling rambut', 'Kecantikan', 450000, 10),
('Lash Lifting & Tint', 'Pengangkatan bulu mata permanen + pewarnaan, hasil natural tahan 6-8 minggu', 'Kecantikan', 200000, 12),

-- ===== KESEHATAN (10) =====
('Konsultasi Dokter Umum', 'Konsultasi kesehatan dengan dokter umum berlisensi, termasuk pemeriksaan dasar', 'Kesehatan', 100000, 20),
('Konsultasi Dokter Gigi', 'Pemeriksaan gigi rutin dan konsultasi perawatan gigi dengan dokter gigi', 'Kesehatan', 150000, 15),
('Pijat Relaksasi 60 Menit', 'Pijat seluruh tubuh teknik Swedish untuk relaksasi dan mengurangi stres', 'Kesehatan', 120000, 15),
('Pijat Refleksi Kaki', 'Pijat titik refleksi telapak kaki 45 menit untuk melancarkan peredaran darah', 'Kesehatan', 85000, 20),
('Pijat Bayi', 'Layanan pijat bayi oleh terapis bersertifikat untuk tumbuh kembang optimal', 'Kesehatan', 100000, 10),
('Tes Gula Darah', 'Pemeriksaan kadar gula darah puasa dan 2 jam setelah makan', 'Kesehatan', 75000, 30),
('Tes Kolesterol Lengkap', 'Pemeriksaan kolesterol total, LDL, HDL, dan trigliserida', 'Kesehatan', 150000, 20),
('Akupunktur', 'Terapi akupunktur oleh terapis bersertifikat untuk berbagai keluhan kesehatan', 'Kesehatan', 200000, 8),
('Fisioterapi', 'Terapi fisik untuk pemulihan cedera, nyeri punggung, dan gangguan gerak', 'Kesehatan', 250000, 6),
('Home Visit Perawat', 'Kunjungan perawat ke rumah untuk perawatan luka, infus, atau injeksi obat', 'Kesehatan', 300000, 5),

-- ===== KREATIF (10) =====
('Foto Produk Standar', 'Sesi foto produk dengan latar putih, editing dasar, 10 foto hasil edit', 'Kreatif', 250000, 10),
('Foto Produk Premium', 'Foto produk dengan properti dan konsep kreatif, 20 foto hasil edit profesional', 'Kreatif', 500000, 6),
('Foto Portrait', 'Sesi foto portrait individu dengan konsep bebas, 15 foto hasil edit', 'Kreatif', 350000, 8),
('Video Profil Bisnis', 'Pembuatan video profil bisnis durasi 2-3 menit termasuk editing dan musik', 'Kreatif', 1500000, 4),
('Desain Logo', 'Desain logo profesional termasuk 3 konsep awal, revisi 3x, dan file vector', 'Kreatif', 400000, 10),
('Desain Brosur / Flyer', 'Desain brosur atau flyer promosi ukuran A5/A4, format print-ready', 'Kreatif', 150000, 15),
('Desain Banner Spanduk', 'Desain spanduk atau banner outdoor ukuran custom, format print-ready', 'Kreatif', 200000, 12),
('Kelola Sosial Media', 'Pengelolaan 1 akun sosial media selama 1 bulan (12 konten + caption + posting)', 'Kreatif', 750000, 5),
('Pembuatan Website Toko', 'Pembuatan website toko online sederhana menggunakan WordPress + WooCommerce', 'Kreatif', 2500000, 3),
('Edit Video Pendek', 'Editing video pendek durasi max 3 menit untuk konten reels/TikTok/YouTube Shorts', 'Kreatif', 200000, 10)

ON CONFLICT DO NOTHING;
