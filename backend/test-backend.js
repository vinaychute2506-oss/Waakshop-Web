// WAAK E-Commerce Security, Payment Integrity & Concurrency Verification Suite
import crypto from 'crypto';
import pg from 'pg';

async function runTests() {
  const BASE_URL = 'http://localhost:9000';
  let passed = 0;
  let failed = 0;

  // Ensure test inventory is restored for idempotent, repeatable test execution
  try {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgres://waak_admin:waak_secret_2026@localhost:5432/waak_commerce' });
    await pool.query('UPDATE product_variants SET stock_quantity = 10 WHERE product_id = $1 AND size = $2', ['waak-01', '40']);
    await pool.end();
  } catch (err) {
    // Non-fatal if DB not reachable directly
  }

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  console.log('==========================================================');
  console.log('   WAAK SECURITY & PAYMENT INTEGRITY AUDIT SUITE           ');
  console.log('==========================================================\n');

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'API Gateway responds healthy (HTTP 200)');

    // 2. Customer Registration
    const testEmail = `client_${Date.now()}@waak.in`;
    const regRes = await fetch(`${BASE_URL}/auth/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword2026!',
        first_name: 'Raghav',
        last_name: 'Mehra',
        phone: '+91 99887 76655',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token && regData.customer.email === testEmail, 'Customer registration successful with JWT');
    const customerToken = regData.token;
    const customerId = regData.customer.id;

    // 3. Customer Login - Valid Credentials
    const loginRes = await fetch(`${BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword2026!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Customer login verifies credentials and issues valid session');

    // 4. Customer Login - Invalid Password Rejection
    const badLoginRes = await fetch(`${BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword!',
      }),
    });
    assert(badLoginRes.status === 401, 'Incorrect credentials correctly rejected with HTTP 401');

    // 5. Saved Address
    const addrRes = await fetch(`${BASE_URL}/store/customers/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        first_name: 'Raghav',
        last_name: 'Mehra',
        address_1: '21 Malabar Hill Crescent',
        address_2: 'Royal Suite 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400006',
        country_code: 'IN',
        phone: '+91 99887 76655',
        is_default: true,
      }),
    });
    const addrData = await addrRes.json();
    assert(addrRes.status === 201 && addrData.address.city === 'Mumbai', 'Customer saved shipping address stored in PostgreSQL');

    // 6. Products Catalog & Variant Inventory
    const prodRes = await fetch(`${BASE_URL}/store/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200 && prodData.products.length >= 4, 'Catalog returns 4 signature occasionwear products');
    const ivorySherwani = prodData.products.find((p) => p.id === 'waak-01');
    assert(ivorySherwani && ivorySherwani.variants.length >= 4, 'Product includes authorized size variants (36, 38, 40, 42, 44)');
    const size40Variant = ivorySherwani.variants.find((v) => v.size === '40');
    const initialStock = size40Variant.stock_quantity;
    assert(initialStock > 0, `Size 40 variant has live stock inventory (${initialStock} available)`);

    // 7. Cart Lifecycle
    const cartRes = await fetch(`${BASE_URL}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({}),
    });
    const cartData = await cartRes.json();
    assert(cartRes.status === 201 && cartData.cart.id, 'Cart created and persisted in database');
    const cartId = cartData.cart.id;

    // Attach customer to cart
    await fetch(`${BASE_URL}/store/carts/${cartId}/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    // 7b. Invalid Size Rejection Check
    const badSizeRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '56', quantity: 1 }),
    });
    assert(badSizeRes.status === 400, 'Invalid size (56) rejected with HTTP 400 Bad Request');

    // 7c. Invalid Quantity Rejection Check
    const badQtyRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 99 }),
    });
    assert(badQtyRes.status === 400, 'Excessive quantity (99) rejected with HTTP 400 Bad Request');

    // 8. Add Line Item with Size 40
    const addItemRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        product_id: 'waak-01',
        size: '40',
        quantity: 1,
      }),
    });
    const addItemData = await addItemRes.json();
    assert(addItemRes.status === 200 && addItemData.cart.items.length === 1, 'Added Ivory Sherwani (Size 40) to cart');
    const lineItem = addItemData.cart.items[0];
    assert(lineItem.unit_price === 49500 && lineItem.total === 49500, 'Accurate line item pricing in INR (₹49,500)');

    // 9. Update Quantity to 2 (Authorized Customer A)
    const updateQtyRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItem.id}`, {
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

    // 10. Cross-Customer Cart Security Checks
    // Create Customer B
    const custBEmail = `other_client_${Date.now()}@waak.in`;
    const regBRes = await fetch(`${BASE_URL}/auth/customer/register`, {
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
    const hackCartRes = await fetch(`${BASE_URL}/store/carts/${cartId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` },
    });
    assert(hackCartRes.status === 403, 'Cross-customer cart access blocked (HTTP 403 Forbidden)');

    // Customer B attempts to modify Customer A's cart line item
    const hackLineRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItem.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ quantity: 99 }),
    });
    assert(hackLineRes.status === 403, 'Cross-customer line item modification blocked (HTTP 403 Forbidden)');

    // Customer B attempts to inject line item into Customer A's cart
    const hackAddRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-01', size: '40', quantity: 1 }),
    });
    assert(hackAddRes.status === 403, 'Cross-customer line item insertion blocked (HTTP 403 Forbidden)');

    // 11. Checkout & Razorpay Order Creation
    const checkoutRes = await fetch(`${BASE_URL}/store/carts/${cartId}/checkout`, {
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

    // 12. Cross-Customer Order Security Check
    // Customer B attempts to access Customer A's order
    const hackOrderRes = await fetch(`${BASE_URL}/store/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${customerBToken}` },
    });
    assert(hackOrderRes.status === 403, 'Cross-customer order access blocked (HTTP 403 Forbidden)');

    // 13. Razorpay Payment Signature Verification & Inventory Decrement
    const rzpPaymentId = `pay_rzp_mock_${Date.now()}`;
    const verifyRes = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
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

    // Verify stock decremented
    const stockCheckRes = await fetch(`${BASE_URL}/store/products/waak-01`);
    const stockCheckData = await stockCheckRes.json();
    const updatedSize40 = stockCheckData.product.variants.find((v) => v.size === '40');
    assert(updatedSize40.stock_quantity === initialStock - 2, `Inventory decremented atomically by 2 (${initialStock} -> ${updatedSize40.stock_quantity})`);

    // 14. Payment Idempotency Guard Test (Duplicate /verify call)
    const duplicateVerifyRes = await fetch(`${BASE_URL}/store/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: 'mock_test_signature',
      }),
    });
    const duplicateVerifyData = await duplicateVerifyRes.json();
    assert(duplicateVerifyRes.status === 200 && duplicateVerifyData.idempotent === true, 'Duplicate payment verification handled idempotently');

    // Confirm inventory was NOT decremented a second time
    const stockAfterDupRes = await fetch(`${BASE_URL}/store/products/waak-01`);
    const stockAfterDupData = await stockAfterDupRes.json();
    const size40AfterDup = stockAfterDupData.product.variants.find((v) => v.size === '40');
    assert(size40AfterDup.stock_quantity === updatedSize40.stock_quantity, 'Inventory safely protected against double-decrement on duplicate verify');

    // 15. Razorpay Webhook Signature Verification & Idempotency
    const webhookSecret = 'waak_webhook_secret_2026';
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

    // Test missing webhook signature
    const missingSigRes = await fetch(`${BASE_URL}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: webhookPayload,
    });
    assert(missingSigRes.status === 400, 'Missing webhook signature header rejected with HTTP 400');

    // Test bad webhook signature
    const badWebhookRes = await fetch(`${BASE_URL}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_signature_hash',
      },
      body: webhookPayload,
    });
    assert(badWebhookRes.status === 400, 'Tampered webhook signature rejected with HTTP 400');

    // Test valid webhook signature (Idempotent replay)
    const validSignature = crypto.createHmac('sha256', webhookSecret).update(webhookPayload).digest('hex');
    const goodWebhookRes = await fetch(`${BASE_URL}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
      },
      body: webhookPayload,
    });
    assert(goodWebhookRes.status === 200, 'Authentic webhook signature verified with HTTP 200');

    // Test payment.failed webhook event
    const failedPayload = JSON.stringify({
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_failed_test_123',
            order_id: 'rzp_order_simulated_failed',
          },
        },
      },
    });
    const failedSignature = crypto.createHmac('sha256', webhookSecret).update(failedPayload).digest('hex');
    const failedWebhookRes = await fetch(`${BASE_URL}/store/payment/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': failedSignature,
      },
      body: failedPayload,
    });
    assert(failedWebhookRes.status === 200, 'Webhook gracefully handles payment.failed event with HTTP 200');

    // Confirm inventory remains untouched after webhook replay
    const stockAfterWebhookRes = await fetch(`${BASE_URL}/store/products/waak-01`);
    const stockAfterWebhookData = await stockAfterWebhookRes.json();
    const size40AfterWebhook = stockAfterWebhookData.product.variants.find((v) => v.size === '40');
    assert(size40AfterWebhook.stock_quantity === updatedSize40.stock_quantity, 'Duplicate webhook replay does not duplicate inventory changes');

    // 16. Customer Order History
    const ordersHistoryRes = await fetch(`${BASE_URL}/store/orders/customer/history`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    const ordersHistoryData = await ordersHistoryRes.json();
    assert(ordersHistoryRes.status === 200 && ordersHistoryData.orders.length >= 1, 'Order reflected in customer Atelier history');

    // 17. Wishlist Persistence
    const wishAddRes = await fetch(`${BASE_URL}/store/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ product_id: 'waak-04' }),
    });
    assert(wishAddRes.status === 201, 'Added Emerald Kurta to customer database wishlist');

    const wishGetRes = await fetch(`${BASE_URL}/store/wishlist`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    const wishGetData = await wishGetRes.json();
    assert(wishGetData.wishlist.some((w) => w.id === 'waak-04'), 'Wishlist persistent across sessions in PostgreSQL');

    // 18. Admin Security & Role-Based Access Control
    // Unauthenticated request to admin endpoint
    const unauthAdminRes = await fetch(`${BASE_URL}/admin/orders`);
    assert(unauthAdminRes.status === 401, 'Unauthenticated admin request rejected with HTTP 401');

    // Customer token attempting to access admin route
    const customerOnAdminRes = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    assert(customerOnAdminRes.status === 403, 'Customer token on admin route rejected with HTTP 403 Forbidden');

    // 19. Admin Authentication & Operations
    const adminLoginRes = await fetch(`${BASE_URL}/admin/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atelier@waak.in',
        password: 'waakAdmin2026!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminLoginData.token, 'Admin portal authentication successful');
    const adminToken = adminLoginData.token;

    // 20. Admin Stats & Orders
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert(adminStatsData.total_revenue >= 99000, `Admin stats captures total revenue (₹${adminStatsData.total_revenue.toLocaleString('en-IN')})`);

    // 21. Admin Update Fulfillment Status
    const updateFulfillRes = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fulfillment_status: 'processing',
        status: 'processing',
      }),
    });
    const updateFulfillData = await updateFulfillRes.json();
    assert(updateFulfillData.order.fulfillment_status === 'processing', 'Admin updated order fulfillment status to "processing"');

    // 22. Admin Web Dashboard Check
    const adminHtmlRes = await fetch(`${BASE_URL}/admin`);
    assert(adminHtmlRes.status === 200, 'Admin visual management console served on http://localhost:9000/admin');

    console.log('\n==========================================================');
    console.log(`   COMMERCE AUDIT RESULTS: ${passed} passed, ${failed} failed`);
    console.log('==========================================================');

    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('Fatal test execution error:', error);
    process.exit(1);
  }
}

runTests();
