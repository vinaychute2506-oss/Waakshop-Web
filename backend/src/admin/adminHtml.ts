export const adminDashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WAAK Atelier — Merchant & Commerce Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-deep: #2a080d;
      --bg-card: #3d0c13;
      --bg-input: #1f0509;
      --accent-gold: #c5a265;
      --accent-gold-light: #dfc28d;
      --text-ivory: #f4efe6;
      --text-muted: #bfa79f;
      --border-gold: rgba(197, 162, 101, 0.25);
      --border-gold-strong: rgba(197, 162, 101, 0.6);
      --badge-green: #2e7d32;
      --badge-blue: #1565c0;
      --badge-orange: #ef6c00;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 0%, #461017 0%, var(--bg-deep) 100%);
      color: var(--text-ivory);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 32px 24px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-gold);
      padding-bottom: 20px;
    }
    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      letter-spacing: 0.18em;
      color: var(--accent-gold);
    }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .btn {
      background: linear-gradient(135deg, #c5a265 0%, #a68244 100%);
      color: #2a080d;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 10px 20px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn:hover { filter: brightness(1.15); }
    .btn-outline {
      background: transparent;
      color: var(--accent-gold);
      border: 1px solid var(--border-gold);
    }
    .btn-outline:hover { background: rgba(197, 162, 101, 0.1); }
    .container { max-width: 1200px; margin: 0 auto; }
    .auth-box {
      max-width: 420px;
      margin: 80px auto;
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      padding: 36px;
      text-align: center;
    }
    .auth-box input {
      width: 100%;
      padding: 12px 14px;
      margin: 10px 0 16px;
      background: var(--bg-input);
      border: 1px solid var(--border-gold);
      color: var(--text-ivory);
      font-size: 14px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      padding: 24px;
    }
    .stat-val {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      color: var(--accent-gold-light);
      margin-top: 8px;
    }
    .stat-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: var(--accent-gold);
      margin: 32px 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      font-size: 13px;
      margin-bottom: 32px;
    }
    .data-table th, .data-table td {
      padding: 14px 18px;
      text-align: left;
      border-bottom: 1px solid var(--border-gold);
    }
    .data-table th {
      background: rgba(0,0,0,0.25);
      color: var(--accent-gold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 11px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 2px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-paid { background: rgba(46, 125, 50, 0.25); color: #81c784; border: 1px solid #81c784; }
    .status-pending { background: rgba(239, 108, 0, 0.25); color: #ffb74d; border: 1px solid #ffb74d; }
    .status-shipped { background: rgba(21, 101, 192, 0.25); color: #64b5f6; border: 1px solid #64b5f6; }
    .status-delivered { background: rgba(76, 175, 80, 0.25); color: #a5d6a7; border: 1px solid #a5d6a7; }
    .status-cancelled { background: rgba(211, 47, 47, 0.25); color: #ef9a9a; border: 1px solid #ef9a9a; }
    .stock-input {
      width: 60px;
      padding: 4px 8px;
      background: var(--bg-input);
      border: 1px solid var(--border-gold);
      color: var(--text-ivory);
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">WAAK ATELIER</div>
      <div class="brand-sub">Commerce Operations & Fulfillment Console</div>
    </div>
    <div id="nav-actions" style="display:none;">
      <span id="admin-user-label" style="font-size:12px; margin-right:16px; color:var(--text-muted);"></span>
      <button class="btn btn-outline" onclick="logoutAdmin()">Sign Out</button>
    </div>
  </div>

  <div class="container">
    <div id="auth-panel" class="auth-box">
      <h2 style="font-family:'Cinzel',serif; color:var(--accent-gold); margin-bottom:16px;">Atelier Portal Login</h2>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Administrative access to orders, inventory and fulfillment</p>
      <input type="email" id="login-email" value="atelier@waak.in" placeholder="Admin Email" />
      <input type="password" id="login-password" value="waakAdmin2026!" placeholder="Password" />
      <button class="btn" style="width:100%;" onclick="loginAdmin()">Authenticate</button>
      <div id="login-error" style="color:#ef9a9a; font-size:12px; margin-top:12px;"></div>
    </div>

    <div id="dashboard-panel" style="display:none;">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Realized Revenue</div>
          <div class="stat-val" id="stat-revenue">₹0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Orders Placed</div>
          <div class="stat-val" id="stat-orders">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Registered Clients</div>
          <div class="stat-val" id="stat-customers">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Database</div>
          <div class="stat-val" style="font-size:20px; margin-top:14px; color:#81c784;">PostgreSQL 16 (Online)</div>
        </div>
      </div>

      <div class="section-title">
        <span>Bespoke Orders & Fulfillment</span>
        <button class="btn btn-outline" style="font-size:11px;" onclick="loadDashboardData()">Refresh Data</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer / Email</th>
            <th>Garment / Size</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Fulfillment Status</th>
            <th>Update Fulfillment</th>
          </tr>
        </thead>
        <tbody id="orders-tbody">
          <tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Loading orders...</td></tr>
        </tbody>
      </table>

      <div class="section-title">
        <span>Live Atelier Garment Inventory by Size</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Garment Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Sizes & Stock Allocation</th>
          </tr>
        </thead>
        <tbody id="products-tbody">
          <tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Loading products...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let adminToken = localStorage.getItem('waak_admin_token');

    async function loginAdmin() {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorDiv = document.getElementById('login-error');
      errorDiv.innerText = '';

      try {
        const res = await fetch('/admin/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failed');

        adminToken = data.token;
        localStorage.setItem('waak_admin_token', adminToken);
        localStorage.setItem('waak_admin_user', JSON.stringify(data.admin));
        showDashboard();
      } catch (err) {
        errorDiv.innerText = err.message;
      }
    }

    function logoutAdmin() {
      localStorage.removeItem('waak_admin_token');
      localStorage.removeItem('waak_admin_user');
      adminToken = null;
      document.getElementById('dashboard-panel').style.display = 'none';
      document.getElementById('nav-actions').style.display = 'none';
      document.getElementById('auth-panel').style.display = 'block';
    }

    function showDashboard() {
      document.getElementById('auth-panel').style.display = 'none';
      document.getElementById('dashboard-panel').style.display = 'block';
      document.getElementById('nav-actions').style.display = 'flex';
      const user = JSON.parse(localStorage.getItem('waak_admin_user') || '{}');
      document.getElementById('admin-user-label').innerText = 'Signed in as ' + (user.email || 'Admin');
      loadDashboardData();
    }

    async function loadDashboardData() {
      if (!adminToken) return;
      const headers = { 'Authorization': 'Bearer ' + adminToken };

      try {
        // Stats
        const statsRes = await fetch('/admin/stats', { headers });
        if (statsRes.status === 401 || statsRes.status === 403) return logoutAdmin();
        const stats = await statsRes.json();
        document.getElementById('stat-revenue').innerText = '₹' + (stats.total_revenue || 0).toLocaleString('en-IN');
        document.getElementById('stat-orders').innerText = stats.total_orders || 0;
        document.getElementById('stat-customers').innerText = stats.total_customers || 0;

        // Orders
        const ordersRes = await fetch('/admin/orders', { headers });
        const ordersData = await ordersRes.json();
        renderOrders(ordersData.orders || []);

        // Products & Stock
        const productsRes = await fetch('/admin/products', { headers });
        const productsData = await productsRes.json();
        renderProducts(productsData.products || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    }

    function renderOrders(orders) {
      const tbody = document.getElementById('orders-tbody');
      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No orders recorded in database yet.</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(o => {
        const itemsSummary = (o.items || []).map(i => i.title + ' (Sz ' + i.size + ' × ' + i.quantity + ')').join('<br/>');
        return '<tr>' +
          '<td><strong style="color:var(--accent-gold);">' + o.display_id + '</strong><br/><small style="color:var(--text-muted);">' + new Date(o.created_at).toLocaleDateString() + '</small></td>' +
          '<td>' + o.email + '<br/><small style="color:var(--text-muted);">' + (o.shipping_address?.city || '') + ', ' + (o.shipping_address?.state || '') + '</small></td>' +
          '<td>' + (itemsSummary || 'Custom Order') + '</td>' +
          '<td><strong>₹' + o.total.toLocaleString('en-IN') + '</strong></td>' +
          '<td><span class="status-badge status-' + o.payment_status + '">' + o.payment_status + '</span></td>' +
          '<td><span class="status-badge status-' + o.fulfillment_status + '">' + o.fulfillment_status + '</span></td>' +
          '<td>' +
            '<select onchange="updateFulfillment(\\'' + o.id + '\\', this.value)" style="background:var(--bg-input); color:var(--text-ivory); border:1px solid var(--border-gold); padding:4px 6px;">' +
              '<option value="">Change Status...</option>' +
              '<option value="processing">Processing</option>' +
              '<option value="fulfilled">Fulfilled / Shipped</option>' +
              '<option value="delivered">Delivered</option>' +
              '<option value="cancelled">Cancelled</option>' +
            '</select>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderProducts(products) {
      const tbody = document.getElementById('products-tbody');
      tbody.innerHTML = products.map(p => {
        const variantsHtml = (p.variants || []).map(v => 
          '<div style="display:inline-flex; align-items:center; margin-right:12px; margin-bottom:6px; background:rgba(0,0,0,0.2); padding:4px 8px; border:1px solid var(--border-gold);">' +
            '<span style="font-size:11px; margin-right:6px; color:var(--accent-gold);">Size ' + v.size + ':</span>' +
            '<input type="number" class="stock-input" id="stock_' + v.id + '" value="' + v.stock_quantity + '" />' +
            '<button class="btn" style="padding:2px 8px; font-size:10px; margin-left:4px;" onclick="saveStock(\\'' + p.id + '\\', \\'' + v.id + '\\')">Save</button>' +
          '</div>'
        ).join('');

        return '<tr>' +
          '<td><strong style="color:var(--text-ivory);">' + p.title + '</strong></td>' +
          '<td>' + p.category + '</td>' +
          '<td>₹' + p.price.toLocaleString('en-IN') + '</td>' +
          '<td>' + variantsHtml + '</td>' +
        '</tr>';
      }).join('');
    }

    async function updateFulfillment(orderId, status) {
      if (!status || !adminToken) return;
      try {
        const res = await fetch('/admin/orders/' + orderId + '/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
          },
          body: JSON.stringify({ fulfillment_status: status, status: status === 'cancelled' ? 'cancelled' : 'processing' })
        });
        if (res.ok) loadDashboardData();
      } catch (err) {
        alert('Failed to update status');
      }
    }

    async function saveStock(productId, variantId) {
      if (!adminToken) return;
      const input = document.getElementById('stock_' + variantId);
      const stock = parseInt(input.value, 10);
      try {
        const res = await fetch('/admin/products/' + productId + '/stock', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
          },
          body: JSON.stringify({ variant_id: variantId, stock_quantity: stock })
        });
        if (res.ok) {
          alert('Stock quantity updated to ' + stock);
          loadDashboardData();
        }
      } catch (err) {
        alert('Failed to update stock');
      }
    }

    if (adminToken) {
      showDashboard();
    }
  </script>
</body>
</html>`;
