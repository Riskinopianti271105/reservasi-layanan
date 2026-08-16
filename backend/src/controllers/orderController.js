const pool = require('../config/database');
const { validateStatusTransition, generateOrderNumber, calculateTotal } = require('../utils/orderValidator');

// POST /api/orders
const createOrder = async (req, res) => {
  const { receiver_name, address, phone, notes } = req.body;

  if (!receiver_name || receiver_name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nama penerima wajib diisi.' });
  }
  if (!address || address.trim() === '') {
    return res.status(400).json({ success: false, message: 'Alamat pengiriman wajib diisi.' });
  }
  if (!phone || phone.trim() === '') {
    return res.status(400).json({ success: false, message: 'Nomor telepon wajib diisi.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ambil isi keranjang
    const cartResult = await client.query(
      `SELECT c.id as cart_id, c.quantity, p.id as product_id, p.name, p.price, p.stock
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1 AND p.is_active = true`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Keranjang belanja kosong.' });
    }

    // Validasi stok setiap item
    for (const item of cartResult.rows) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Stok ${item.name} tidak mencukupi. Tersedia: ${item.stock}, diminta: ${item.quantity}.`,
        });
      }
    }

    const totalPrice = calculateTotal(cartResult.rows.map(i => ({ price: i.price, quantity: i.quantity })));
    const orderNumber = generateOrderNumber();

    // Buat pesanan
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, receiver_name, address, phone, total_price, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [orderNumber, req.user.id, receiver_name.trim(), address.trim(), phone.trim(), totalPrice, notes]
    );
    const order = orderResult.rows[0];

    // Buat order items dan kurangi stok
    for (const item of cartResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.price, item.quantity, item.price * item.quantity]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Kosongkan keranjang
    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    // Ambil detail pesanan lengkap
    const fullOrder = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
        'product_price', oi.product_price, 'quantity', oi.quantity, 'subtotal', oi.subtotal
      )) as items FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1 GROUP BY o.id`,
      [order.id]
    );

    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat.', data: fullOrder.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  } finally {
    client.release();
  }
};

// GET /api/orders
const getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? `SELECT o.*, u.username, u.full_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
      : `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`;

    const params = req.user.role === 'admin' ? [] : [req.user.id];
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const order = orderResult.rows[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
    res.json({ success: true, data: { ...order, items: itemsResult.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status wajib diisi.' });
  }

  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const order = orderResult.rows[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const validation = validateStatusTransition(order.status, status);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({ success: true, message: `Status pesanan berhasil diubah menjadi ${status}.`, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
