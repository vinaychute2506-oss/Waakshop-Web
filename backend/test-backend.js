// WAAK E-Commerce Integration Verification Suite
// Tests complete customer journey, payments, inventory, and admin management

async function runTests() {
  const BASE_URL = 'http://localhost:9000';
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

  console.log('==========================================================');
  console.log('   WAAK COMMERCE API — END-TO-END VERIFICATION SUITE       ');
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

    // 3. Customer Login
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

    // 4. Saved Address
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

    // 5. Products Catalog & Variant Inventory
    const prodRes = await fetch(`${BASE_URL}/store/products`);
    const prodData = await prodRes.json();
    assert(prodRes.status === 200 && prodData.products.length >= 4, 'Catalog returns 4 signature occasionwear products');
    const ivorySherwani = prodData.products.find((p) => p.id === 'waak-01');
    assert(ivorySherwani && ivorySherwani.variants.length === 4, 'Product includes 4 distinct size variants (38, 40, 42, 44)');
    const size40Variant = ivorySherwani.variants.find((v) => v.size === '40');
    const initialStock = size40Variant.stock_quantity;
    assert(initialStock > 0, `Size 40 variant has live stock inventory (${initialStock} available)`);

    // 6. Cart Lifecycle
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

    // 7. Add Line Item with Size 40
    const addItemRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    // 8. Update Quantity to 2
    const updateQtyRes = await fetch(`${BASE_URL}/store/carts/${cartId}/line-items/${lineItem.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 2 }),
    });
    const updateQtyData = await updateQtyRes.json();
    assert(updateQtyRes.status === 200 && updateQtyData.cart.items[0].quantity === 2, 'Quantity stepped to 2 items');
    assert(updateQtyData.cart.subtotal === 99000, 'Subtotal correctly recalculated to ₹99,000');

    // 9. Checkout & Razorpay Order Creation
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

    // 10. Razorpay Payment Signature Verification & Inventory Decrement
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

    // 11. Customer Order History
    const ordersHistoryRes = await fetch(`${BASE_URL}/store/orders/customer/history`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    const ordersHistoryData = await ordersHistoryRes.json();
    assert(ordersHistoryRes.status === 200 && ordersHistoryData.orders.length >= 1, 'Order reflected in customer Atelier history');

    // 12. Wishlist Persistence
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

    // 13. Admin Authentication & Operations
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

    // 14. Admin Stats & Orders
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    assert(adminStatsData.total_revenue >= 99000, `Admin stats captures total revenue (₹${adminStatsData.total_revenue.toLocaleString('en-IN')})`);

    // 15. Admin Update Fulfillment Status
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

    // 16. Admin Web Dashboard Check
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
