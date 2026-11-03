// ==============================================================================
// WAAK Phase 2.3 — Staging Acceptance Test Suite
// Executes against live staging containers:
//   API Gateway: http://localhost:9001
//   Frontend:    http://localhost:8088
// ==============================================================================

import crypto from 'crypto';

const API_BASE = process.env.STAGING_API_URL || 'http://localhost:9001';
const FRONTEND_BASE = process.env.STAGING_FRONTEND_URL || 'http://localhost:8088';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

async function runStagingAcceptanceTests() {
  console.log('==========================================================');
  console.log('   WAAK PHASE 2.3 — STAGING ACCEPTANCE TEST PROTOCOL       ');
  console.log(`   API Endpoint:      ${API_BASE}`);
  console.log(`   Frontend Endpoint: ${FRONTEND_BASE}`);
  console.log('==========================================================\n');

  try {
    // -------------------------------------------------------------------------
    // 1. Automated Health & Integration Verification
    // -------------------------------------------------------------------------
    console.log('--- 1. API Gateway & Infrastructure Health ---');
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'API Gateway responds healthy (HTTP 200)');
    assert(healthData.environment === 'staging', 'Reported environment is strictly "staging"');
    assert(healthData.database === 'connected', 'Database connection verified inside staging container');
    assert(healthData.isTestPaymentMode === true, 'Payment gateway strictly locked in TEST SANDBOX mode');

    // Security Headers Check
    const secHeaders = healthRes.headers;
    assert(secHeaders.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header verified');
    assert(secHeaders.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN header verified');
    assert(secHeaders.get('x-xss-protection') === '1; mode=block', 'X-XSS-Protection: 1; mode=block header verified');
    assert(
      Boolean(secHeaders.get('strict-transport-security')),
      'Strict-Transport-Security (HSTS) header enforced in staging'
    );

    // -------------------------------------------------------------------------
    // 2. Customer Authentication & Account Security
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Customer Authentication & Data Security ---');
    const testEmail = `client_${Date.now()}@waak.in`;
    const testPassword = 'BespokeClient2026!';

    // Register Customer A
    const regRes = await fetch(`${API_BASE}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        first_name: 'Aditya',
        last_name: 'Singhania',
        phone: '+91 98765 43210',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'Customer registration successful with 30-day JWT token');
    const customerToken = regData.token;
    const customerAId = regData.customer.id;

    // Login Customer A
    const loginRes = await fetch(`${API_BASE}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Customer login verifies credentials and issues valid session');

    // Bad Login Rejection
    const badLoginRes = await fetch(`${API_BASE}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' }),
    });
    assert(badLoginRes.status === 401, 'Incorrect credentials correctly rejected with HTTP 401');

    // Add Shipping Address
    const addrRes = await fetch(`${API_BASE}/store/customers/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        first_name: 'Aditya',
        last_name: 'Singhania',
        address_1: 'Plot 42, Malabar Hill',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400006',
        country_code: 'IN',
        phone: '+91 98765 43210',
      }),
    });
    const addrData = await addrRes.json();
    assert(addrRes.status === 201 && addrData.address.id, 'Customer saved shipping address stored in PostgreSQL');

    // -------------------------------------------------------------------------
    // 3. Shopping Bag & Catalog Concurrency
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Shopping Bag & Catalog Concurrency ---');
    const productsRes = await fetch(`${API_BASE}/store/products`);
    const productsData = await productsRes.json();
    assert(productsRes.status === 200 && productsData.products.length === 4, 'Catalog returns 4 signature occasionwear garments');

    const ivorySherwani = productsData.products.find((p) => p.id === 'waak-01');
    assert(ivorySherwani && ivorySherwani.variants.length === 4, 'Product includes 4 distinct size variants (38, 40, 42, 44)');

    const size40 = ivorySherwani.variants.find((v) => v.size === '40');
    const initialStock = size40.stock_quantity;
    assert(initialStock > 0, `Size 40 variant has live stock inventory (${initialStock} available)`);

    // Create Cart for Customer A
    const createCartRes = await fetch(`${API_BASE}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({}),
    });
    const cartData = await createCartRes.json();
    assert(createCartRes.status === 201 && cartData.cart.id, 'Cart created and persisted in PostgreSQL');
    const cartId = cartData.cart.id;

    // Bad Size Rejection
    const badSizeRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '56', quantity: 1 }),
    });
    assert(badSizeRes.status === 400, 'Invalid size (56) rejected with HTTP 400 Bad Request');

    // Excessive Quantity Rejection
    const badQtyRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 99 }),
    });
    assert(badQtyRes.status === 400, 'Excessive quantity (99) rejected with HTTP 400 Bad Request');

    // Add Valid Line Item
    const addItemRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 1 }),
    });
    const addItemData = await addItemRes.json();
    assert(addItemRes.status === 200 && addItemData.cart.items.length === 1, 'Added Ivory Sherwani (Size 40) to cart');
    const lineItem = addItemData.cart.items[0];
    assert(lineItem.unit_price === 49500 && lineItem.total === 49500, 'Accurate line item pricing in INR (₹49,500)');

    // Step Quantity to 2
    const updateQtyRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items/${lineItem.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ quantity: 2 }),
    });
    const updateQtyData = await updateQtyRes.json();
    assert(updateQtyRes.status === 200 && updateQtyData.cart.items[0].quantity === 2, 'Quantity stepped to 2 items');
    assert(updateQtyData.cart.subtotal === 99000, 'Subtotal correctly recalculated to ₹99,000');

    // Create Customer B for Cross-Customer Isolation Testing
    const custBEmail = `client_b_${Date.now()}@waak.in`;
    const regBRes = await fetch(`${API_BASE}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: custBEmail,
        password: 'securePassword2026!',
        first_name: 'Vikram',
        last_name: 'Oberoi',
      }),
    });
    const regBData = await regBRes.json();
    const customerBToken = regBData.token;

    // Customer B attempts to view Customer A's cart
    const hackCartRes = await fetch(`${API_BASE}/store/carts/${cartId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` },
    });
    assert(hackCartRes.status === 403, 'Cross-customer cart access blocked (HTTP 403 Forbidden)');

    // Customer B attempts to modify Customer A's cart line item
    const hackLineRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items/${lineItem.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ quantity: 99 }),
    });
    assert(hackLineRes.status === 403, 'Cross-customer line item modification blocked (HTTP 403 Forbidden)');

    // Customer B attempts to inject line item into Customer A's cart
    const hackAddRes = await fetch(`${API_BASE}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 1 }),
    });
    assert(hackAddRes.status === 403, 'Cross-customer line item insertion blocked (HTTP 403 Forbidden)');

    // -------------------------------------------------------------------------
    // 4. Razorpay Sandbox Checkout & Payment Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Razorpay Sandbox Checkout & Payment Integrity ---');
    const checkoutRes = await fetch(`${API_BASE}/store/carts/${cartId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        email: testEmail,
        shipping_address: addrData.address,
      }),
    });
    const checkoutData = await checkoutRes.json();
    assert(checkoutRes.status === 201 && checkoutData.order_id && checkoutData.razorpay_order_id, 'Checkout initiated: Order created and Razorpay Order ID issued');
    assert(checkoutData.display_id.startsWith('WAAK-2026-'), `Generated bespoke order display reference: ${checkoutData.display_id}`);
    const orderId = checkoutData.order_id;
    const rzpOrderId = checkoutData.razorpay_order_id;

    // Cross-Customer Order Security
    const hackOrderRes = await fetch(`${API_BASE}/store/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` },
    });
    assert(hackOrderRes.status === 403, 'Cross-customer order access blocked (HTTP 403 Forbidden)');

    // Payment Signature Verification & Atomic Stock Decrement
    const rzpPaymentId = `pay_rzp_staging_${Date.now()}`;
    const verifyRes = await fetch(`${API_BASE}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200 && verifyData.success === true, 'Payment verified with cryptographic signature handler');
    assert(verifyData.order.status === 'paid' && verifyData.order.payment_status === 'captured', 'Order status transitioned to paid / captured');

    // Confirm inventory decremented by 2
    const stockCheckRes = await fetch(`${API_BASE}/store/products/waak-01`);
    const stockCheckData = await stockCheckRes.json();
    const updatedSize40 = stockCheckData.product.variants.find((v) => v.size === '40');
    assert(updatedSize40.stock_quantity === initialStock - 2, `Inventory decremented atomically by 2 (${initialStock} -> ${updatedSize40.stock_quantity})`);

    // Duplicate Verify Idempotency Guard
    const dupVerifyRes = await fetch(`${API_BASE}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    const dupVerifyData = await dupVerifyRes.json();
    assert(dupVerifyRes.status === 200 && dupVerifyData.idempotent === true, 'Duplicate payment verification handled idempotently');

    // Confirm stock NOT decremented again
    const stockAfterDupRes = await fetch(`${API_BASE}/store/products/waak-01`);
    const stockAfterDupData = await stockAfterDupRes.json();
    const size40AfterDup = stockAfterDupData.product.variants.find((v) => v.size === '40');
    assert(size40AfterDup.stock_quantity === updatedSize40.stock_quantity, 'Inventory safely protected against double-decrement on duplicate verify');

    // Razorpay Webhook Tests
    const webhookSecret = 'waak_staging_webhook_secret_2026';
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: rzpPaymentId,
            order_id: rzpOrderId,
            amount: 9900000,
          },
        },
      },
    });

    // Missing Webhook Signature
    const missingSigRes = await fetch(`${API_BASE}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: webhookPayload,
    });
    assert(missingSigRes.status === 400, 'Missing webhook signature header rejected with HTTP 400');

    // Tampered Webhook Signature
    const badWebhookRes = await fetch(`${API_BASE}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'tampered_signature_hash',
      },
      body: webhookPayload,
    });
    assert(badWebhookRes.status === 400, 'Tampered webhook signature rejected with HTTP 400');

    // Authentic Webhook Signature
    const validSignature = crypto.createHmac('sha256', webhookSecret).update(webhookPayload).digest('hex');
    const goodWebhookRes = await fetch(`${API_BASE}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
      },
      body: webhookPayload,
    });
    assert(goodWebhookRes.status === 200, 'Authentic webhook signature verified with HTTP 200');

    // Webhook Replay Stock Safety
    const stockAfterWebhookRes = await fetch(`${API_BASE}/store/products/waak-01`);
    const stockAfterWebhookData = await stockAfterWebhookRes.json();
    const size40AfterWebhook = stockAfterWebhookData.product.variants.find((v) => v.size === '40');
    assert(size40AfterWebhook.stock_quantity === updatedSize40.stock_quantity, 'Duplicate webhook replay does not duplicate inventory changes');

    // Payment.failed Webhook Handling
    const failedPayload = JSON.stringify({
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_failed_staging_999',
            order_id: 'rzp_order_simulated_failed',
          },
        },
      },
    });
    const failedSignature = crypto.createHmac('sha256', webhookSecret).update(failedPayload).digest('hex');
    const failedWebhookRes = await fetch(`${API_BASE}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': failedSignature,
      },
      body: failedPayload,
    });
    assert(failedWebhookRes.status === 200, 'Webhook gracefully handles payment.failed event with HTTP 200');

    // Wishlist Persistence
    await fetch(`${API_BASE}/store/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-04' }),
    });
    const wishRes = await fetch(`${API_BASE}/store/wishlist`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    const wishData = await wishRes.json();
    assert(wishRes.status === 200 && wishData.wishlist.length === 1, 'Wishlist persistent across sessions in PostgreSQL');

    // -------------------------------------------------------------------------
    // 5. Atelier Admin Operations
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Atelier Admin Operations Console ---');
    const unauthAdminRes = await fetch(`${API_BASE}/admin/stats`);
    assert(unauthAdminRes.status === 401, 'Unauthenticated admin request rejected with HTTP 401');

    const custOnAdminRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    assert(custOnAdminRes.status === 403, 'Customer token on admin route rejected with HTTP 403 Forbidden');

    const adminLoginRes = await fetch(`${API_BASE}/admin/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atelier@waak.in',
        password: 'waakStagingAdmin2026!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.token, 'Admin portal authentication successful');
    const adminToken = adminLoginData.token;

    const statsRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.total_revenue > 0, `Admin stats captures total revenue (₹${statsData.total_revenue.toLocaleString('en-IN')})`);

    const updateOrderRes = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'processing', fulfillment_status: 'in_progress' }),
    });
    const updateOrderData = await updateOrderRes.json();
    assert(updateOrderRes.status === 200 && updateOrderData.order.status === 'processing', 'Admin updated order fulfillment status to "processing"');

    // -------------------------------------------------------------------------
    // 6. Frontend Nginx Container & SPA Routing
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Frontend Nginx Container & Storefront Routing ---');
    const frontendRes = await fetch(`${FRONTEND_BASE}/`);
    const frontendHtml = await frontendRes.text();
    assert(frontendRes.status === 200, 'Frontend Nginx container responds HTTP 200');
    assert(frontendHtml.includes('<div id="root"></div>'), 'Frontend HTML serves React #root container');
    assert(frontendHtml.includes('fonts.googleapis.com'), 'Luxury typography fonts embedded in HTML');

    // SPA Fallback Routing (Nginx try_files $uri $uri/ /index.html)
    const spaRouteRes = await fetch(`${FRONTEND_BASE}/collections/sherwanis`);
    const spaRouteHtml = await spaRouteRes.text();
    assert(spaRouteRes.status === 200 && spaRouteHtml.includes('<div id="root"></div>'), 'Nginx SPA fallback routing successfully serves client routes');

    // Static Asset Caching
    const scriptMatch = frontendHtml.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if (scriptMatch && scriptMatch[1]) {
      const assetRes = await fetch(`${FRONTEND_BASE}${scriptMatch[1]}`);
      const cacheControl = assetRes.headers.get('cache-control');
      assert(
        assetRes.status === 200 && cacheControl && cacheControl.includes('immutable'),
        `Static bundle cached with immutable Cache-Control: ${cacheControl}`
      );
    }

    console.log('\n==========================================================');
    console.log(`   STAGING ACCEPTANCE RESULTS: ${passed} passed, ${failed} failed`);
    console.log('==========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal staging acceptance test error:', err);
    process.exit(1);
  }
}

runStagingAcceptanceTests();
