/**
 * WAAK Phase 3.1 End-to-End Test Suite
 * Tests:
 * 1. Indian PIN code format validation (strictly 6 numeric digits) in Checkout & Address APIs
 * 2. Rejection of 5-digit, 7-digit, alphanumeric, and empty PIN codes
 * 3. Dynamic Catalog API retrieval and canonical product mapping (waak-01..waak-04)
 * 4. End-to-end checkout with valid 6-digit PIN and test payment verification
 * 5. PIN code whitespace trimming
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
  console.log('   WAAK PHASE 3.1: DYNAMIC CATALOG & PIN AUDIT SUITE      ');
  console.log(`   Target Endpoint: ${API_URL}`);
  console.log('==========================================================\n');

  try {
    // --- 1. Dynamic Catalog API Verification ---
    console.log('--- 1. Dynamic Catalog API Verification ---');
    const catalogRes = await fetch(`${API_URL}/store/products`);
    assert(catalogRes.status === 200, 'Catalog endpoint (/store/products) returns HTTP 200 OK');
    const catalogData = await catalogRes.json();
    assert(Array.isArray(catalogData.products), 'Catalog payload contains products array');
    assert(catalogData.products.length === 4, 'Catalog contains exactly 4 canonical products');

    const expectedProducts = [
      { id: 'waak-01', price: 49500 },
      { id: 'waak-02', price: 54500 },
      { id: 'waak-03', price: 38500 },
      { id: 'waak-04', price: 24500 },
    ];

    for (const exp of expectedProducts) {
      const prod = catalogData.products.find((p) => p.id === exp.id);
      assert(Boolean(prod), `Found canonical product ${exp.id}`);
      assert(prod && Number(prod.price) === exp.price, `Product ${exp.id} price is ₹${exp.price.toLocaleString('en-IN')}`);
      assert(prod && Array.isArray(prod.variants) && prod.variants.length === 4, `Product ${exp.id} has 4 size variants`);
      const sizes = prod ? prod.variants.map((v) => v.size).sort() : [];
      assert(JSON.stringify(sizes) === JSON.stringify(['38', '40', '42', '44']), `Product ${exp.id} variants match chest sizes 38, 40, 42, 44`);
    }

    // --- 2. Customer Setup & Address PIN Code Validation ---
    console.log('\n--- 2. Customer Setup & Address PIN Code Validation ---');
    const testEmail = `pin_tester_${Date.now()}@waak.in`;
    const regRes = await fetch(`${API_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password123!',
        first_name: 'Aditya',
        last_name: 'Singhania',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token;
    assert(Boolean(token), 'Customer registered with JWT token');

    // Test Address Creation with Invalid PIN Codes
    const invalidPins = [
      { pin: '11000', label: '5-digit PIN (11000)' },
      { pin: '1100001', label: '7-digit PIN (1100001)' },
      { pin: '11000A', label: 'Alphanumeric PIN (11000A)' },
      { pin: 'SW1A1A', label: 'UK Postal Code (SW1A1A)' },
      { pin: '', label: 'Empty PIN' },
    ];

    for (const item of invalidPins) {
      const addrRes = await fetch(`${API_URL}/store/customers/me/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: 'Aditya',
          last_name: 'Singhania',
          address_1: '14, Golf Links',
          city: 'New Delhi',
          state: 'Delhi',
          postal_code: item.pin,
          country_code: 'IN',
        }),
      });
      assert(addrRes.status === 400, `Address creation with ${item.label} rejected with HTTP 400`);
      const errBody = await addrRes.json();
      assert(
        errBody.error && (/PIN|postal|digits|required/i.test(errBody.error)),
        `Address creation rejected with informative message: "${errBody.error}"`
      );
    }

    // Test Address Creation with Valid 6-digit PIN
    const validAddrRes = await fetch(`${API_URL}/store/customers/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: 'Aditya',
        last_name: 'Singhania',
        address_1: '14, Golf Links',
        city: 'New Delhi',
        state: 'Delhi',
        postal_code: '110003',
        country_code: 'IN',
      }),
    });
    assert(validAddrRes.status === 201, 'Address creation with valid 6-digit PIN (110003) accepted with HTTP 201');

    // --- 3. Checkout PIN Code Validation ---
    console.log('\n--- 3. Checkout Delivery PIN Code Format Verification ---');
    // Create cart and add product
    const cartRes = await fetch(`${API_URL}/store/carts`, { method: 'POST' });
    const cartData = await cartRes.json();
    const cartId = cartData.cart.id;

    await fetch(`${API_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'waak-01',
        size: '42',
        quantity: 1,
      }),
    });

    // Test checkout initiation with invalid PINs
    for (const item of invalidPins) {
      const chkRes = await fetch(`${API_URL}/store/carts/${cartId}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: testEmail,
          shipping_address: {
            first_name: 'Aditya',
            last_name: 'Singhania',
            address_1: '14, Golf Links',
            city: 'New Delhi',
            state: 'Delhi',
            postal_code: item.pin,
            country_code: 'IN',
          },
        }),
      });
      assert(chkRes.status === 400, `Checkout with ${item.label} rejected with HTTP 400`);
      const chkErr = await chkRes.json();
      assert(
        chkErr.error && chkErr.error.includes('PIN'),
        `Checkout error explicitly cites 6-digit Indian PIN code requirement: "${chkErr.error}"`
      );
    }

    // Test checkout with valid 6-digit PIN
    const validChkRes = await fetch(`${API_URL}/store/carts/${cartId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: testEmail,
        shipping_address: {
          first_name: 'Aditya',
          last_name: 'Singhania',
          address_1: '14, Golf Links',
          city: 'New Delhi',
          state: 'Delhi',
          postal_code: '110003',
          country_code: 'IN',
        },
      }),
    });
    assert(validChkRes.status === 201, 'Checkout with valid 6-digit PIN (110003) initiated successfully (HTTP 201)');
    const chkSuccess = await validChkRes.json();
    assert(Boolean(chkSuccess.order_id), `Order created with server ID ${chkSuccess.order_id}`);
    assert(Boolean(chkSuccess.razorpay_order_id), `Razorpay sandbox order issued: ${chkSuccess.razorpay_order_id}`);

    // Verify payment in test sandbox
    const verifyRes = await fetch(`${API_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: chkSuccess.order_id,
        razorpay_order_id: chkSuccess.razorpay_order_id,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    assert(verifyRes.status === 200, 'Test payment verification succeeded with HTTP 200');
    const verifyData = await verifyRes.json();
    assert(verifyData.order?.status === 'paid', 'Order status transitioned to "paid"');
    assert(verifyData.order?.shipping_address?.postal_code === '110003', 'Verified order retains 6-digit PIN code');

    // --- 4. Whitespace Trimming Verification ---
    console.log('\n--- 4. PIN Code Whitespace Trimming Verification ---');
    const cartRes2 = await fetch(`${API_URL}/store/carts`, { method: 'POST' });
    const cartData2 = await cartRes2.json();
    await fetch(`${API_URL}/store/carts/${cartData2.cart.id}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'waak-03',
        size: '40',
        quantity: 1,
      }),
    });

    const trimChkRes = await fetch(`${API_URL}/store/carts/${cartData2.cart.id}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: testEmail,
        shipping_address: {
          first_name: 'Aditya',
          last_name: 'Singhania',
          address_1: '14, Golf Links',
          city: 'New Delhi',
          state: 'Delhi',
          postal_code: '  110001  ', // Leading and trailing whitespace
          country_code: 'IN',
        },
      }),
    });
    assert(trimChkRes.status === 201, 'PIN code with leading/trailing whitespace ("  110001  ") is cleanly trimmed and accepted');
    const trimData = await trimChkRes.json();
    assert(Boolean(trimData.order_id), 'Order created for trimmed PIN code');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n==========================================================');
  console.log(`   PHASE 3.1 TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
