const pool = require('../config/database');
const { validateCartQuantity } = require('../utils/orderValidator');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, c.updated_at,
              p.id as product_id, p.name, p.price, p.stock, p.category, p.image_url,
              (c.quantity * p.price) as subtotal
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1 AND p.is_active = true
       ORDER BY c.created_at ASC`,
      [req.user.id]
    );

    const totalPrice = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      data: { items: result.rows, total_price: totalPrice, total_items: result.rows.length },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: 'Product ID wajib diisi.' });
  }

  try {
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const product = productResult.rows[0];
    const qty = parseInt(quantity) || 1;

    const validation = validateCartQuantity(qty, product.stock);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const existing = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND product_id = $2', [req.user.id, product_id]);

    let result;
    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + qty;
      const revalidate = validateCartQuantity(newQty, product.stock);
      if (!revalidate.valid) {
        return res.status(400).json({ success: false, message: revalidate.message });
      }
      result = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [newQty, req.user.id, product_id]
      );
    } else {
      result = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, product_id, qty]
      );
    }

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan ke keranjang.', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PATCH /api/cart/:id
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartResult = await pool.query(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1 AND c.user_id = $2',
      [id, req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item keranjang tidak ditemukan.' });
    }

    const qty = parseInt(quantity);
    const validation = validateCartQuantity(qty, cartResult.rows[0].stock);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const result = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [qty, id, req.user.id]
    );
    res.json({ success: true, message: 'Jumlah produk berhasil diperbarui.', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item keranjang tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Produk berhasil dihapus dari keranjang.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Keranjang berhasil dikosongkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
