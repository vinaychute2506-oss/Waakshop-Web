// test-step-4-security-audit.mjs
// Comprehensive Automated Security Audit for Razorpay Signature Handling & Order Isolation
import assert from 'node:assert';
import crypto from 'node:crypto';

const BASE_URL = 'http://localhost:9000';
let passed = 0;
let failed = 0;

function it(desc, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      console.log(`  ✓ ${desc}`);
      passed++;
    })
    .catch((err) => {
      console.error(`  ✗ ${desc}: ${err.message}`);
      failed++;
    });
}

console.log('===============================================================');
console.log('   WAAK STEP 4 — PAYMENT SECURITY & ORDER ISOLATION AUDIT      ');
console.log('===============================================================\n');

async function main() {
  // Test Secret used in Development/Staging environment
  const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'waakSecretRazorpayKey2026';

  // Setup: Register Customer A
  console.log('--- Phase 1: Customer & Order Initialization ---');
  const emailA = `patron_sec_a_${Date.now()}@waak.in`;
  const regResA = await fetch(`${BASE_URL}/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailA,
      password: 'SecurePassword2026!@#',
      first_name: 'Aditya',
      last_name: 'Singhania',
      phone: '+919876543210'
    })
  });
  const authA = await regResA.json();
  const tokenA = authA.token;

  // Register Customer B
  const emailB = `patron_sec_b_${Date.now()}@waak.in`;
  const regResB = await fetch(`${BASE_URL}/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailB,
      password: 'SecurePassword2026!@#',
      first_name: 'Vikram',
      last_name: 'Mehta',
      phone: '+919876543211'
    })
  });
  const authB = await regResB.json();
  const tokenB = authB.token;

  // Create Cart for Customer A
  const cartRes = await fetch(`${BASE_URL}/store/carts`, { method: 'POST' });
  const cartData = await cartRes.json();
  const cartId = cartData.cart ? cartData.cart.id : cartData.id;

  // Add Item to Cart
  const addItemRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: 'waak-01',
      size: '40',
      quantity: 1
    })
  });

  // Initiate Checkout for Customer A
  const checkoutRes = await fetch(`${BASE_URL}/store/carts/${cartId}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      email: emailA,
      shipping_address: {
        first_name: 'Aditya',
        last_name: 'Singhania',
        phone: '+919876543210',
        address_1: '12, Aurangzeb Road',
        city: 'New Delhi',
        state: 'Delhi',
        postal_code: '110011',
        country_code: 'IN'
      }
    })
  });
  const checkoutData = await checkoutRes.json();
  const orderId = checkoutData.order_id;
  const rzpOrderId = checkoutData.razorpay_order_id;
  const paymentId = `pay_rzp_sec_${Date.now()}`;

  console.log('\n--- Phase 2: Malformed & Invalid Signature Testing ---');

  await it('Rejects signature with non-hexadecimal characters (HTTP 400)', async () => {
    const invalidSignature = 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'; // 64 chars, but non-hex
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: invalidSignature
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Invalid payment signature'));
  });

  await it('Rejects signature with invalid length: 63 hex characters (HTTP 400)', async () => {
    const shortSignature = 'a'.repeat(63);
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: shortSignature
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await it('Rejects signature with invalid length: 65 hex characters (HTTP 400)', async () => {
    const longSignature = 'b'.repeat(65);
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: longSignature
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await it('Rejects signature when passed as non-string type (number) (HTTP 400)', async () => {
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: 1234567890
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await it('Rejects signature when passed as an object payload (HTTP 400)', async () => {
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: { forged: true }
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await it('Rejects empty or missing signature parameter (HTTP 400)', async () => {
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: ''
      })
    });
    assert.strictEqual(res.status, 400);
  });

  await it('Rejects validly formatted 64-hex string that does not match authentic HMAC digest (HTTP 400)', async () => {
    const wrongValidHexSignature = crypto.randomBytes(32).toString('hex'); // 64 valid hex chars, but wrong hash
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: wrongValidHexSignature
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Invalid payment signature'));
  });

  console.log('\n--- Phase 3: Authentic Signature & Idempotency Testing ---');

  // Compute authentic HMAC-SHA256 signature
  const authenticSignature = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(`${rzpOrderId}|${paymentId}`)
    .digest('hex');

  await it('Accepts genuine cryptographic HMAC-SHA256 signature (HTTP 200)', async () => {
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: authenticSignature
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.order.payment_status, 'captured');
  });

  await it('Idempotency check: Repeated verification call returns HTTP 200 without duplicate execution', async () => {
    const res = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: authenticSignature
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.order.payment_status, 'captured');
  });

  console.log('\n--- Phase 4: Order Authorization & Data Leakage Prevention ---');

  await it('Cross-Customer Isolation: Customer B is rejected with HTTP 403 when trying to access Customer A order', async () => {
    const res = await fetch(`${BASE_URL}/store/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.error.includes('Access denied'));
  });

  await it('Signature Leak Guard (GET /store/orders/:id): Does NOT expose razorpay_signature to Customer A', async () => {
    const res = await fetch(`${BASE_URL}/store/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    
    // Ensure payments array does not contain razorpay_signature
    assert.ok(Array.isArray(body.order.payments), 'Order contains payments array');
    body.order.payments.forEach((p) => {
      assert.strictEqual(p.razorpay_signature, undefined, 'razorpay_signature must not be returned');
      assert.strictEqual(p.signature, undefined, 'signature must not be returned');
    });
  });

  await it('Signature Leak Guard (GET /store/customers/me/orders): Customer order history does NOT expose signature', async () => {
    const res = await fetch(`${BASE_URL}/store/orders/customer/history`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.orders), 'Returns orders array');
    const orderStr = JSON.stringify(body);
    assert.ok(!orderStr.includes(authenticSignature), 'Customer history JSON must not contain authenticSignature');
  });

  console.log('\n===============================================================');
  console.log(`   SECURITY AUDIT SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

main().catch((err) => {
  console.error('Fatal security audit error:', err);
  process.exit(1);
});
