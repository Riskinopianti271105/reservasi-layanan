// ============================================================
// TDD - Unit Test: validateStatusTransition
// TAHAP RED: Test ditulis sebelum implementasi
// ============================================================
const { validateStatusTransition, validateCartQuantity, calculateTotal } = require('../../src/utils/orderValidator');

describe('validateStatusTransition - State Transition Testing', () => {

  // ---- Transisi VALID ----
  describe('Transisi Status Valid', () => {
    test('DRAFT -> CONFIRMED harus valid', () => {
      const result = validateStatusTransition('DRAFT', 'CONFIRMED');
      expect(result.valid).toBe(true);
    });

    test('DRAFT -> CANCELLED harus valid', () => {
      const result = validateStatusTransition('DRAFT', 'CANCELLED');
      expect(result.valid).toBe(true);
    });

    test('CONFIRMED -> COMPLETED harus valid', () => {
      const result = validateStatusTransition('CONFIRMED', 'COMPLETED');
      expect(result.valid).toBe(true);
    });

    test('CONFIRMED -> CANCELLED harus valid', () => {
      const result = validateStatusTransition('CONFIRMED', 'CANCELLED');
      expect(result.valid).toBe(true);
    });
  });

  // ---- Transisi TIDAK VALID ----
  describe('Transisi Status Tidak Valid', () => {
    test('COMPLETED -> apapun harus ditolak', () => {
      expect(validateStatusTransition('COMPLETED', 'CANCELLED').valid).toBe(false);
      expect(validateStatusTransition('COMPLETED', 'DRAFT').valid).toBe(false);
      expect(validateStatusTransition('COMPLETED', 'CONFIRMED').valid).toBe(false);
    });

    test('CANCELLED -> apapun harus ditolak', () => {
      expect(validateStatusTransition('CANCELLED', 'DRAFT').valid).toBe(false);
      expect(validateStatusTransition('CANCELLED', 'CONFIRMED').valid).toBe(false);
      expect(validateStatusTransition('CANCELLED', 'COMPLETED').valid).toBe(false);
    });

    test('DRAFT -> COMPLETED harus ditolak (skip CONFIRMED)', () => {
      const result = validateStatusTransition('DRAFT', 'COMPLETED');
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/tidak dapat langsung/i);
    });

    test('CONFIRMED -> DRAFT harus ditolak (mundur ke DRAFT)', () => {
      const result = validateStatusTransition('CONFIRMED', 'DRAFT');
      expect(result.valid).toBe(false);
    });

    test('Status sama harus ditolak', () => {
      expect(validateStatusTransition('DRAFT', 'DRAFT').valid).toBe(false);
      expect(validateStatusTransition('CONFIRMED', 'CONFIRMED').valid).toBe(false);
    });

    test('Status tidak dikenal harus ditolak', () => {
      expect(validateStatusTransition('UNKNOWN', 'CONFIRMED').valid).toBe(false);
      expect(validateStatusTransition('DRAFT', 'INVALID').valid).toBe(false);
    });
  });

  // ---- Pesan Error ----
  describe('Pesan Kesalahan', () => {
    test('COMPLETED harus menghasilkan pesan yang tepat', () => {
      const result = validateStatusTransition('COMPLETED', 'CANCELLED');
      expect(result.message).toMatch(/COMPLETED/);
    });

    test('CANCELLED harus menghasilkan pesan yang tepat', () => {
      const result = validateStatusTransition('CANCELLED', 'CONFIRMED');
      expect(result.message).toMatch(/CANCELLED/);
    });
  });
});


describe('validateCartQuantity - Cart Quantity Testing', () => {

  // ---- Nilai VALID ----
  describe('Jumlah Valid', () => {
    test('Jumlah 1 dengan stok 5 harus valid', () => {
      const result = validateCartQuantity(1, 5);
      expect(result.valid).toBe(true);
    });

    test('Jumlah 10 dengan stok 10 harus valid (batas maksimal)', () => {
      const result = validateCartQuantity(10, 10);
      expect(result.valid).toBe(true);
    });

    test('Jumlah 5 dengan stok 5 harus valid (batas stok)', () => {
      const result = validateCartQuantity(5, 5);
      expect(result.valid).toBe(true);
    });
  });

  // ---- Nilai TIDAK VALID ----
  describe('Jumlah Tidak Valid', () => {
    test('Jumlah 0 harus ditolak', () => {
      const result = validateCartQuantity(0, 5);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/minimal/i);
    });

    test('Jumlah negatif harus ditolak', () => {
      const result = validateCartQuantity(-1, 5);
      expect(result.valid).toBe(false);
    });

    test('Jumlah 11 harus ditolak (melebihi maksimal 10)', () => {
      const result = validateCartQuantity(11, 20);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/maksimal/i);
    });

    test('Jumlah melebihi stok harus ditolak', () => {
      const result = validateCartQuantity(6, 5);
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/stok/i);
    });

    test('Jumlah desimal harus ditolak', () => {
      const result = validateCartQuantity(1.5, 5);
      expect(result.valid).toBe(false);
    });

    test('Jumlah berupa teks harus ditolak', () => {
      const result = validateCartQuantity('abc', 5);
      expect(result.valid).toBe(false);
    });
  });
});


describe('calculateTotal - Total Price Calculation', () => {
  test('Menghitung total dari array items dengan benar', () => {
    const items = [
      { price: 35000, quantity: 2 },
      { price: 120000, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(190000);
  });

  test('Array kosong menghasilkan 0', () => {
    expect(calculateTotal([])).toBe(0);
  });

  test('Input bukan array menghasilkan 0', () => {
    expect(calculateTotal(null)).toBe(0);
    expect(calculateTotal(undefined)).toBe(0);
  });

  test('Satu item dengan quantity 1', () => {
    expect(calculateTotal([{ price: 50000, quantity: 1 }])).toBe(50000);
  });
});
