// ============================================================
// TDD - Unit Test: productValidator
// Fungsi ini menerapkan White-Box Testing (Cyclomatic Complexity)
// ============================================================

/**
 * Fungsi validateProduct - dipilih untuk analisis Cyclomatic Complexity
 * Cyclomatic Complexity = E - N + 2P
 * Percabangan: name kosong, price <= 0, stock < 0, category kosong = CC = 5
 */
const validateProduct = (product) => {
  const errors = [];

  if (!product.name || product.name.trim() === '') {
    errors.push('Nama produk wajib diisi.');
  }

  if (product.price === undefined || product.price === null || parseFloat(product.price) <= 0) {
    errors.push('Harga produk harus lebih besar dari nol.');
  }

  if (product.stock !== undefined && parseInt(product.stock) < 0) {
    errors.push('Stok tidak boleh bernilai negatif.');
  }

  if (!product.category || product.category.trim() === '') {
    errors.push('Kategori produk wajib diisi.');
  }

  return { valid: errors.length === 0, errors };
};

module.exports = { validateProduct };


describe('validateProduct - White-Box Testing (Cyclomatic Complexity)', () => {

  // Path 1: Semua valid (no branch taken)
  test('Path 1: Produk valid - semua field benar', () => {
    const result = validateProduct({
      name: 'Cuci Motor', price: 35000, stock: 10, category: 'Otomotif'
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Path 2: Nama kosong
  test('Path 2: Nama produk kosong - harus error', () => {
    const result = validateProduct({
      name: '', price: 35000, stock: 10, category: 'Otomotif'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Nama produk wajib diisi.');
  });

  // Path 3: Harga nol atau negatif
  test('Path 3: Harga nol - harus error', () => {
    const result = validateProduct({
      name: 'Cuci Motor', price: 0, stock: 10, category: 'Otomotif'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga produk harus lebih besar dari nol.');
  });

  test('Path 3b: Harga negatif - harus error', () => {
    const result = validateProduct({
      name: 'Cuci Motor', price: -100, stock: 10, category: 'Otomotif'
    });
    expect(result.valid).toBe(false);
  });

  // Path 4: Stok negatif
  test('Path 4: Stok negatif - harus error', () => {
    const result = validateProduct({
      name: 'Cuci Motor', price: 35000, stock: -5, category: 'Otomotif'
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Stok tidak boleh bernilai negatif.');
  });

  // Path 5: Kategori kosong
  test('Path 5: Kategori kosong - harus error', () => {
    const result = validateProduct({
      name: 'Cuci Motor', price: 35000, stock: 10, category: ''
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Kategori produk wajib diisi.');
  });

  // Multiple errors
  test('Multiple error: Semua field invalid', () => {
    const result = validateProduct({ name: '', price: -1, stock: -1, category: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(4);
  });

  // Edge: Stok 0 (valid)
  test('Stok 0 harus valid (bukan negatif)', () => {
    const result = validateProduct({
      name: 'Layanan X', price: 50000, stock: 0, category: 'Elektronik'
    });
    expect(result.valid).toBe(true);
  });

  // Edge: Harga undefined
  test('Harga undefined harus error', () => {
    const result = validateProduct({ name: 'Layanan X', stock: 5, category: 'Elektronik' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Harga produk harus lebih besar dari nol.');
  });
});
