// ============================================================
// ORDER VALIDATOR - Utility untuk validasi aturan bisnis pesanan
// Fungsi ini dipilih untuk TDD dan Cyclomatic Complexity
// ============================================================

const ORDER_STATUSES = ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

/**
 * Validasi transisi status pesanan
 * FR-09: Aturan perubahan status pesanan
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @returns {{ valid: boolean, message: string }}
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  if (!ORDER_STATUSES.includes(currentStatus)) {
    return { valid: false, message: `Status saat ini '${currentStatus}' tidak valid.` };
  }
  if (!ORDER_STATUSES.includes(newStatus)) {
    return { valid: false, message: `Status baru '${newStatus}' tidak valid.` };
  }
  if (currentStatus === newStatus) {
    return { valid: false, message: 'Status baru sama dengan status saat ini.' };
  }
  if (currentStatus === 'COMPLETED') {
    return { valid: false, message: 'Pesanan dengan status COMPLETED tidak dapat diubah.' };
  }
  if (currentStatus === 'CANCELLED') {
    return { valid: false, message: 'Pesanan dengan status CANCELLED tidak dapat diaktifkan kembali.' };
  }
  if (currentStatus === 'DRAFT' && newStatus === 'COMPLETED') {
    return { valid: false, message: 'Status DRAFT tidak dapat langsung berubah menjadi COMPLETED.' };
  }
  if (currentStatus === 'CONFIRMED' && newStatus === 'DRAFT') {
    return { valid: false, message: 'Status CONFIRMED tidak dapat kembali ke DRAFT.' };
  }
  return { valid: true, message: 'Transisi status valid.' };
};

/**
 * Validasi jumlah item keranjang
 * FR-06: Aturan jumlah produk dalam keranjang
 * @param {number} quantity 
 * @param {number} stock 
 * @returns {{ valid: boolean, message: string }}
 */
const validateCartQuantity = (quantity, stock) => {
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return { valid: false, message: 'Jumlah harus berupa bilangan bulat.' };
  }
  if (quantity <= 0) {
    return { valid: false, message: 'Jumlah minimal pembelian adalah 1 unit.' };
  }
  if (quantity > 10) {
    return { valid: false, message: 'Jumlah maksimal pembelian adalah 10 unit per produk.' };
  }
  if (quantity > stock) {
    return { valid: false, message: `Jumlah melebihi stok tersedia (${stock} unit).` };
  }
  return { valid: true, message: 'Jumlah valid.' };
};

/**
 * Generate nomor pesanan unik
 * Format: RSV-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RSV-${date}-${random}`;
};

/**
 * Hitung total harga dari items
 * @param {Array} items - Array of { price, quantity }
 * @returns {number}
 */
const calculateTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity) || 0;
    return total + (price * qty);
  }, 0);
};

module.exports = {
  validateStatusTransition,
  validateCartQuantity,
  generateOrderNumber,
  calculateTotal,
  ORDER_STATUSES,
};
