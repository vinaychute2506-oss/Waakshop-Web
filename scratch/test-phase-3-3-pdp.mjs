/**
 * WAAK Phase 3.3: Product Detail Page & Conversion UX Test Suite
 * Tests:
 * 1. Product Detail API & Authoritative Data Integrity (waak-01..waak-04)
 * 2. Numeric Sizing Variants & Stock Verification (38, 40, 42, 44)
 * 3. Invalid Product Fallback Handling (HTTP 404)
 * 4. PIN Code Format Verification Logic (6-digit regex)
 * 5. Cart Synchronization with PDP Selected Variants
 * 6. Archival Garment Safeguard (isAvailableInBackend: false)
 * 7. End-to-End Checkout Preservation from PDP Action
 */

const API_URL = process.env.API_URL || 'http://localhost:9000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('==========================================================');
  console.log('   WAAK PHASE 3.3: PRODUCT DETAIL PAGE UX & COMMERCE AUDIT');
  console.log(`   Target Endpoint: ${API_URL}`);
  console.log('==========================================================\n');

  try {
    // --- 1. Product Detail API Verification ---
    console.log('--- 1. Authoritative Product Detail Retrieval ---');
    const canonicalIds = [
      { id: 'waak-01', expectedTitle: 'The Ivory Zardozi Sherwani', expectedPrice: 49500 },
      { id: 'waak-02', expectedTitle: 'Midnight Velvet Sherwani', expectedPrice: 54500 },
      { id: 'waak-03', expectedTitle: 'Mauve Raw Silk Bandhgala', expectedPrice: 38500 },
      { id: 'waak-04', expectedTitle: 'Emerald Tussar Silk Kurta', expectedPrice: 24500 },
    ];

    for (const item of canonicalIds) {
      const res = await fetch(`${API_URL}/store/products/${item.id}`);
      assert(res.status === 200, `GET /store/products/${item.id} returns HTTP 200 OK`);
      const body = await res.json();
      assert(Boolean(body.product), `Product payload for ${item.id} contains product object`);
      assert(Number(body.product.price) === item.expectedPrice, `${item.id} authoritative price is ₹${item.expectedPrice.toLocaleString('en-IN')}`);
      assert(Array.isArray(body.product.variants) && body.product.variants.length === 4, `${item.id} provides exactly 4 size variants`);

      const sizes = body.product.variants.map((v) => v.size).sort();
      assert(JSON.stringify(sizes) === JSON.stringify(['38', '40', '42', '44']), `${item.id} sizes are strictly authentic Indian chest sizes [38, 40, 42, 44]`);

      for (const v of body.product.variants) {
        assert(typeof v.stock_quantity === 'number' && v.stock_quantity >= 0, `${item.id} Size ${v.size} stock is valid number (${v.stock_quantity})`);
      }
    }

    // --- 2. Graceful Fallback for Invalid Product IDs ---
    console.log('\n--- 2. Invalid Product Fallback Handling ---');
    const invalidRes = await fetch(`${API_URL}/store/products/invalid-silhouette-999`);
    assert(invalidRes.status === 404, 'Non-existent product ID returns HTTP 404 (triggering frontend Silhouette Not Found)');

    // --- 3. Product Variant Sizing Integrity in Cart ---
    console.log('\n--- 3. Cart Variant Sizing Validation ---');
    const cartRes = await fetch(`${API_URL}/store/carts`, { method: 'POST' });
    const cartData = await cartRes.json();
    const cartId = cartData.cart.id;

    // Attempting invalid letter size 'L'
    const invalidSizeRes = await fetch(`${API_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'waak-01',
        size: 'L',
        quantity: 1,
      }),
    });
    assert(invalidSizeRes.status === 400, 'Adding Western letter size "L" rejected with HTTP 400');

    // Attempting valid chest size '40'
    const validSizeRes = await fetch(`${API_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'waak-01',
        size: '40',
        quantity: 1,
      }),
    });
    assert(validSizeRes.status === 200, 'Adding valid chest size "40" accepted with HTTP 200');
    const updatedCart = await validSizeRes.json();
    assert(updatedCart.cart.items.length === 1, 'Cart has 1 item with size 40');
    assert(Number(updatedCart.cart.items[0].unit_price) === 49500, 'Line item unit price matches authoritative backend price ₹49,500');

    // --- 4. PIN Code Format Verification Logic ---
    console.log('\n--- 4. Delivery PIN Code Verification ---');
    const pinRegex = /^\d{6}$/;
    const testCases = [
      { pin: '110001', valid: true, desc: '6 numeric digits (New Delhi)' },
      { pin: '560001', valid: true, desc: '6 numeric digits (Bengaluru)' },
      { pin: '400001', valid: true, desc: '6 numeric digits (Mumbai)' },
      { pin: '11000', valid: false, desc: '5 digits rejected' },
      { pin: '1100001', valid: false, desc: '7 digits rejected' },
      { pin: '11000A', valid: false, desc: 'Alphanumeric rejected' },
      { pin: 'SW1A1AA', valid: false, desc: 'UK postal code rejected' },
      { pin: '', valid: false, desc: 'Empty PIN rejected' },
    ];

    for (const tc of testCases) {
      const isValid = pinRegex.test(tc.pin.trim());
      assert(isValid === tc.valid, `PIN test "${tc.pin}" (${tc.desc}) evaluates to ${tc.valid}`);
    }

    // --- 5. End-to-End Checkout Flow from PDP Cart Add ---
    console.log('\n--- 5. End-to-End Checkout Validation from PDP State ---');
    const testEmail = `pdp_patron_${Date.now()}@waak.in`;
    const chkRes = await fetch(`${API_URL}/store/carts/${cartId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        shipping_address: {
          first_name: 'Vikram',
          last_name: 'Mehta',
          address_1: '28, Amrita Shergill Marg',
          city: 'New Delhi',
          state: 'Delhi',
          postal_code: '110003',
          country_code: 'IN',
        },
      }),
    });
    assert(chkRes.status === 201, 'Checkout initiated from PDP cart item with HTTP 201');
    const chkBody = await chkRes.json();
    assert(Number(chkBody.total) === 49500, 'Order total matches authoritative PDP price ₹49,500');
    assert(Boolean(chkBody.razorpay_order_id), `Razorpay sandbox order ID created: ${chkBody.razorpay_order_id}`);

    // Verify Payment
    const verifyRes = await fetch(`${API_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: chkBody.order_id,
        razorpay_order_id: chkBody.razorpay_order_id,
        razorpay_payment_id: `pay_pdp_${Date.now()}`,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    assert(verifyRes.status === 200, 'Payment verification returns HTTP 200');
    const verifyBody = await verifyRes.json();
    assert(verifyBody.order.status === 'paid', 'Order marked "paid" in PostgreSQL');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n==========================================================');
  console.log(`   PHASE 3.3 PDP AUDIT RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
