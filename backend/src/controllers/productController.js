const pool = require('../config/database');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan.` });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const { name, description, category, price, stock, image_url } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama produk wajib diisi.' });
  }
  if (!price || parseFloat(price) <= 0) {
    return res.status(400).json({ success: false, message: 'Harga produk harus lebih besar dari nol.' });
  }
  if (stock !== undefined && parseInt(stock) < 0) {
    return res.status(400).json({ success: false, message: 'Stok tidak boleh bernilai negatif.' });
  }
  if (!category) {
    return res.status(400).json({ success: false, message: 'Kategori produk wajib diisi.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, category, price, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name.trim(), description, category, parseFloat(price), parseInt(stock) || 0, image_url]
    );
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan.', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PATCH /api/products/:id
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, stock, image_url, is_active } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan.` });
    }

    if (price !== undefined && parseFloat(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Harga produk harus lebih besar dari nol.' });
    }
    if (stock !== undefined && parseInt(stock) < 0) {
      return res.status(400).json({ success: false, message: 'Stok tidak boleh bernilai negatif.' });
    }

    const current = existing.rows[0];
    const result = await pool.query(
      `UPDATE products SET 
        name = $1, description = $2, category = $3, price = $4, stock = $5, 
        image_url = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [
        name ?? current.name,
        description ?? current.description,
        category ?? current.category,
        price !== undefined ? parseFloat(price) : current.price,
        stock !== undefined ? parseInt(stock) : current.stock,
        image_url ?? current.image_url,
        is_active !== undefined ? is_active : current.is_active,
        id,
      ]
    );
    res.json({ success: true, message: 'Produk berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Produk dengan ID ${id} tidak ditemukan.` });
    }
    await pool.query('UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
