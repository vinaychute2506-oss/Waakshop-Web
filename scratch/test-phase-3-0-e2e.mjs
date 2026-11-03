// WAAK Phase 3.0 End-to-End Commerce Journey Verification Script
// Tests Product Selection -> Variant Sizing -> Cart Synchronization -> Checkout -> Test Payment

const API_BASE = 'http://localhost:9000';

async function runPhase3E2ETests() {
  console.log('==========================================================');
  console.log('   WAAK PHASE 3.0 — COMMERCE INTEGRATION E2E TEST SUITE   ');
  console.log('==========================================================\n');

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

  try {
    // 1. Verify Catalog Products & Authentic Pricing
    console.log('--- 1. Catalog Products & Variant Sizing Verification ---');
    const catalogRes = await fetch(`${API_BASE}/store/products`);
    const catalogData = await catalogRes.json();
    assert(catalogRes.status === 200, 'Catalog API responds 200 OK');
    assert(catalogData.products.length === 4, 'Catalog contains 4 signature occasionwear pieces');

    const expectedProducts = [
      { id: 'waak-01', title: 'The Ivory Zardozi Sherwani', price: 49500 },
      { id: 'waak-02', title: 'Midnight Velvet Sherwani', price: 54500 },
      { id: 'waak-03', title: 'Mauve Raw Silk Bandhgala', price: 38500 },
      { id: 'waak-04', title: 'Emerald Tussar Silk Kurta', price: 24500 },
    ];

    for (const exp of expectedProducts) {
      const p = catalogData.products.find(item => item.id === exp.id);
      assert(p !== undefined, `Product ${exp.id} (${exp.title}) exists in PostgreSQL catalog`);
      assert(p && p.price === exp.price, `Product ${exp.id} authoritative price is ₹${exp.price.toLocaleString('en-IN')}`);
      
      const sizes = p?.variants?.map(v => v.size) || [];
      assert(
        sizes.includes('38') && sizes.includes('40') && sizes.includes('42') && sizes.includes('44'),
        `Product ${exp.id} provides authentic Indian occasionwear chest sizes [38, 40, 42, 44]`
      );
    }

    // 2. Test Invalid Sizing Rejection (BUG-01 Fix Verification)
    console.log('\n--- 2. Size Validation & Error Rejection (BUG-01) ---');
    const cartRes = await fetch(`${API_BASE}/store/carts`, { method: 'POST' });
    const cartData = await cartRes.json();
    const cartId = cartData.cart.id;
    assert(cartRes.status === 201 && cartId, `Created dedicated shopping cart: ${cartId}`);

    // Attempting Western letter size 'M' (Old frontend bug)
    const letterSizeRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: 'waak-01', size: 'M', quantity: 1 }),
    });
    const letterSizeData = await letterSizeRes.json();
    assert(
      letterSizeRes.status === 400 && letterSizeData.error.includes("Invalid size 'M'"),
      'Server strictly rejects Western letter size "M" with descriptive error'
    );

    // Attempting invalid numeric size '56'
    const invalidNumRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: 'waak-01', size: '56', quantity: 1 }),
    });
    assert(invalidNumRes.status === 400, 'Server strictly rejects out-of-range size "56"');

    // 3. Test Valid Sizing Addition (BUG-01 & BUG-02 Fix Verification)
    console.log('\n--- 3. Valid Sizing & Cart Synchronization ---');
    const validAddRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 1 }),
    });
    const validAddData = await validAddRes.json();
    assert(validAddRes.status === 200, 'Adding valid chest size "40" succeeds (HTTP 200)');
    assert(validAddData.cart.items.length === 1, 'Cart contains exactly 1 line item');
    assert(validAddData.cart.items[0].size === '40', 'Line item size is recorded as "40"');
    assert(validAddData.cart.items[0].unit_price === 49500, 'Unit price matches backend DB: ₹49,500');
    assert(validAddData.cart.subtotal === 49500, 'Subtotal correctly computed: ₹49,500');

    // Add a second product (waak-04 size 42)
    const addSecondRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: 'waak-04', size: '42', quantity: 1 }),
    });
    const addSecondData = await addSecondRes.json();
    assert(addSecondRes.status === 200, 'Adding second product (waak-04 Size 42) succeeds');
    assert(addSecondData.cart.items.length === 2, 'Cart now contains 2 line items');
    assert(addSecondData.cart.subtotal === 49500 + 24500, 'Combined subtotal correctly recalculated: ₹74,000');

    // 4. Test Checkout Initiation & Authoritative Price Enforcement
    console.log('\n--- 4. Checkout Initiation & Server Price Calculation ---');
    const checkoutRes = await fetch(`${API_BASE}/store/carts/${cartId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'qa.bespoke@waak.in',
        shipping_address: {
          first_name: 'Devraj',
          last_name: 'Kapoor',
          phone: '+91 98111 22334',
          address_1: '24, Aurangzeb Lane, Suite 10',
          city: 'New Delhi',
          state: 'Delhi',
          postal_code: '110011',
          country_code: 'IN',
        },
      }),
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.status === 201, 'Checkout initiated successfully (HTTP 201)');
    assert(checkoutData.order_id && checkoutData.order_id.startsWith('order_'), 'Internal Order ID generated');
    assert(checkoutData.razorpay_order_id && checkoutData.razorpay_order_id.startsWith('rzp_order_'), 'Razorpay Order ID generated');
    assert(checkoutData.total === 74000, 'Server enforced authoritative total ₹74,000');
    assert(checkoutData.amount === 7400000, 'Razorpay amount is exactly 7,400,000 paise');

    // 5. Test Cryptographic Payment Verification & Order Finalization
    console.log('\n--- 5. Payment Verification & Stock Reservation ---');
    const paymentId = `pay_test_${Date.now()}`;
    const verifyRes = await fetch(`${API_BASE}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: checkoutData.order_id,
        razorpay_order_id: checkoutData.razorpay_order_id,
        razorpay_payment_id: paymentId,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.success === true, 'Payment verification succeeded (HTTP 200)');
    assert(verifyData.order.status === 'paid', 'Order status marked "paid"');
    assert(verifyData.order.payment_status === 'captured', 'Payment status marked "captured"');

    // 6. Test Error Handling on Empty Bag (BUG-03 Verification)
    console.log('\n--- 6. Error Handling & Empty Bag Guard (BUG-03) ---');
    const emptyCartRes = await fetch(`${API_BASE}/store/carts`, { method: 'POST' });
    const emptyCartData = await emptyCartRes.json();
    const emptyCheckoutRes = await fetch(`${API_BASE}/store/carts/${emptyCartData.cart.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'empty@waak.in',
        shipping_address: { address_1: 'Nowhere', city: 'Delhi', state: 'Delhi', postal_code: '110001' },
      }),
    });
    const emptyCheckoutData = await emptyCheckoutRes.json();
    assert(
      emptyCheckoutRes.status === 400 && emptyCheckoutData.error === 'Your bespoke shopping bag is empty',
      'Empty bag checkout rejected with clear error message (not swallowed)'
    );

  } catch (err) {
    console.error('Unhandled test execution error:', err);
    failed++;
  }

  console.log('\n==========================================================');
  console.log(`   PHASE 3.0 E2E RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==========================================================');

  if (failed > 0) process.exit(1);
}

runPhase3E2ETests();
