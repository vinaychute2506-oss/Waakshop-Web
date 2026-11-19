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
      --badge-red: #c62828;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 0%, #461017 0%, var(--bg-deep) 100%);
      color: var(--text-ivory);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      padding: 24px 20px;
    }
    .header {
      max-width: 1300px;
      margin: 0 auto 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-gold);
      padding-bottom: 16px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
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
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 9px 18px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 2px;
    }
    .btn:hover { filter: brightness(1.15); }
    .btn-outline {
      background: transparent;
      color: var(--accent-gold);
      border: 1px solid var(--border-gold);
    }
    .btn-outline:hover { background: rgba(197, 162, 101, 0.12); }
    .btn-danger {
      background: rgba(198, 40, 40, 0.2);
      color: #ef9a9a;
      border: 1px solid rgba(198, 40, 40, 0.5);
    }
    .btn-danger:hover {
      background: rgba(198, 40, 40, 0.4);
    }
    .container { max-width: 1300px; margin: 0 auto; }
    
    /* Navigation Tabs */
    .tabs-nav {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-gold);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 10px 20px;
      font-family: 'Cinzel', serif;
      font-size: 13px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 2px 2px 0 0;
    }
    .tab-btn:hover {
      color: var(--text-ivory);
      background: rgba(197, 162, 101, 0.08);
    }
    .tab-btn.active {
      color: var(--accent-gold-light);
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      border-bottom: 2px solid var(--accent-gold);
    }

    .auth-box {
      max-width: 420px;
      margin: 80px auto;
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      padding: 36px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      padding: 20px;
    }
    .stat-val {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      color: var(--accent-gold-light);
      margin-top: 6px;
    }
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 19px;
      color: var(--accent-gold);
      margin: 24px 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    /* Toolbar & Filter Bar */
    .filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
      background: var(--bg-card);
      padding: 14px 18px;
      border: 1px solid var(--border-gold);
    }
    .filter-input, .filter-select {
      background: var(--bg-input);
      border: 1px solid var(--border-gold);
      color: var(--text-ivory);
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 2px;
      outline: none;
    }
    .filter-input:focus, .filter-select:focus {
      border-color: var(--accent-gold);
    }
    .filter-input { min-width: 240px; flex-grow: 1; }

    /* Tables */
    .data-table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--border-gold);
      background: var(--bg-card);
      margin-bottom: 32px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-gold);
      vertical-align: middle;
    }
    .data-table th {
      background: rgba(0,0,0,0.3);
      color: var(--accent-gold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 11px;
      white-space: nowrap;
    }
    .data-table tr:hover td {
      background: rgba(197, 162, 101, 0.04);
    }

    /* Badges */
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
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
    
    .badge-published { background: rgba(46, 125, 50, 0.2); color: #81c784; border: 1px solid rgba(129, 199, 132, 0.5); }
    .badge-draft { background: rgba(239, 108, 0, 0.2); color: #ffb74d; border: 1px solid rgba(255, 183, 77, 0.5); }
    .badge-instock { background: rgba(46, 125, 50, 0.15); color: #a5d6a7; }
    .badge-lowstock { background: rgba(239, 108, 0, 0.15); color: #ffcc80; }
    .badge-nostock { background: rgba(198, 40, 40, 0.2); color: #ef9a9a; }

    .tag-pill {
      display: inline-block;
      font-size: 10px;
      padding: 2px 6px;
      background: rgba(197, 162, 101, 0.12);
      border: 1px solid rgba(197, 162, 101, 0.3);
      color: var(--accent-gold-light);
      margin-right: 4px;
      margin-top: 4px;
      border-radius: 2px;
    }

    .product-thumb {
      width: 48px;
      height: 60px;
      object-fit: cover;
      border: 1px solid var(--border-gold);
      background: #120507;
      border-radius: 2px;
      transition: transform 0.2s ease;
      will-change: transform;
      transform-origin: center;
    }
    .product-thumb:hover {
      transform: scale(1.6);
      z-index: 10;
      box-shadow: 0 4px 16px rgba(0,0,0,0.8);
    }

    /* Modal Overlay & Card */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 2, 4, 0.88);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      will-change: opacity;
    }
    .modal-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.8);
      position: relative;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-gold);
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .modal-title {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: var(--accent-gold);
    }
    .modal-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 24px;
      cursor: pointer;
      line-height: 1;
    }
    .modal-close:hover { color: var(--accent-gold); }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .form-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .form-input, .form-textarea, .form-select {
      background: var(--bg-input);
      border: 1px solid var(--border-gold);
      color: var(--text-ivory);
      padding: 9px 12px;
      font-size: 13px;
      border-radius: 2px;
      outline: none;
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: var(--accent-gold);
    }
    .form-textarea { resize: vertical; min-height: 80px; }
    
    .checkbox-row {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      margin: 12px 0;
      background: rgba(0,0,0,0.2);
      padding: 10px 14px;
      border: 1px solid var(--border-gold);
    }
    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      cursor: pointer;
      color: var(--text-ivory);
    }

    /* Size allocation grid */
    .sizes-matrix {
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--border-gold);
      padding: 14px;
      margin-top: 10px;
    }
    .size-row {
      display: grid;
      grid-template-columns: 80px 100px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(197, 162, 101, 0.15);
    }
    .size-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

    /* Media Manager & Dropzone */
    .image-dropzone {
      border: 1px dashed var(--border-gold);
      background: rgba(42, 8, 13, 0.4);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.2s ease;
      margin-bottom: 10px;
    }
    .image-dropzone:hover, .image-dropzone.dragover {
      background: rgba(197, 162, 101, 0.12);
      border-color: var(--accent-gold);
    }
    .gallery-tiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
      gap: 8px;
      margin-top: 8px;
      max-height: 180px;
      overflow-y: auto;
      padding: 6px;
      background: rgba(0,0,0,0.25);
      border: 1px solid var(--border-gold);
      border-radius: 2px;
    }
    .gallery-tile {
      position: relative;
      width: 100%;
      height: 94px;
      border: 1px solid var(--border-gold);
      background: #120507;
      overflow: hidden;
      border-radius: 2px;
    }
    .gallery-tile.is-cover {
      border: 2px solid var(--accent-gold);
      box-shadow: 0 0 8px rgba(197, 162, 101, 0.5);
    }
    .gallery-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .tile-cover-badge {
      position: absolute;
      top: 2px;
      left: 2px;
      background: var(--accent-gold);
      color: #1a0407;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 4px;
      letter-spacing: 0.5px;
      border-radius: 1px;
    }
    .tile-overlay-btns {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(15, 2, 4, 0.88);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 3px 2px;
    }
    .tile-btn {
      background: transparent;
      border: none;
      color: var(--accent-gold);
      cursor: pointer;
      font-size: 11px;
      padding: 1px 3px;
      line-height: 1;
    }
    .tile-btn:hover {
      color: #ffffff;
      transform: scale(1.15);
    }
    .tile-btn.btn-del:hover {
      color: #ef9a9a;
    }

    /* Toast Notification */
    #toast-notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #3d0c13;
      border: 1px solid var(--accent-gold);
      color: var(--text-ivory);
      padding: 12px 20px;
      font-size: 13px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      display: none;
      z-index: 2000;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">WAAK ATELIER</div>
      <div class="brand-sub">Luxury Occasionwear — Commerce Operations Portal</div>
    </div>
    <div id="nav-actions" style="display:none; align-items:center;">
      <span id="admin-user-label" style="font-size:12px; margin-right:16px; color:var(--text-muted);"></span>
      <button class="btn btn-outline" onclick="logoutAdmin()">Sign Out</button>
    </div>
  </div>

  <div class="container">
    <!-- Login Panel -->
    <div id="auth-panel" class="auth-box">
      <h2 style="font-family:'Cinzel',serif; color:var(--accent-gold); margin-bottom:12px;">Atelier Portal Login</h2>
      <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Authenticated merchant console for catalogue, inventory, & orders</p>
      <input type="email" id="login-email" value="atelier@waak.in" placeholder="Admin Email" />
      <input type="password" id="login-password" value="waakAdmin2026!" placeholder="Password" />
      <button class="btn" style="width:100%;" onclick="loginAdmin()">Authenticate Session</button>
      <div id="login-error" style="color:#ef9a9a; font-size:12px; margin-top:12px;"></div>
    </div>

    <!-- Authenticated Dashboard -->
    <div id="dashboard-panel" style="display:none;">
      <!-- Navigation Tabs -->
      <div class="tabs-nav">
        <button class="tab-btn active" id="tab-btn-products" onclick="switchTab('products')">Garment Catalogue & Products</button>
        <button class="tab-btn" id="tab-btn-orders" onclick="switchTab('orders')">Bespoke Orders & Fulfillment</button>
      </div>

      <!-- High-level Operations Overview -->
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
          <div class="stat-label">Catalogue Garments</div>
          <div class="stat-val" id="stat-products">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Live Inventory Units</div>
          <div class="stat-val" id="stat-total-stock">0</div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 1: PRODUCT CATALOGUE MANAGEMENT            -->
      <!-- ============================================== -->
      <div id="view-products">
        <div class="section-title">
          <span>Atelier Occasionwear Collection</span>
          <button class="btn" onclick="openAddProductModal()">
            <span>+</span> Add New Garment
          </button>
        </div>

        <!-- Filter & Search Toolbar (Instant in-memory filtering) -->
        <div class="filter-bar">
          <input type="text" id="prod-search" class="filter-input" placeholder="Search by garment title, ID, or SKU..." oninput="applyLocalFilters()" />
          
          <select id="prod-category-filter" class="filter-select" onchange="applyLocalFilters()">
            <option value="All">All Categories</option>
            <option value="Sherwanis">Sherwanis</option>
            <option value="Kurta Sets">Kurta Sets</option>
            <option value="Indo-Western">Indo-Western</option>
            <option value="Suits & Blazers">Suits & Blazers</option>
            <option value="Waistcoats">Waistcoats</option>
            <option value="Indian Wear">Indian Wear</option>
          </select>

          <select id="prod-status-filter" class="filter-select" onchange="applyLocalFilters()">
            <option value="all">All Visibility</option>
            <option value="published">Published in Store</option>
            <option value="draft">Draft / Unpublished</option>
          </select>

          <select id="prod-stock-filter" class="filter-select" onchange="applyLocalFilters()">
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (>4)</option>
            <option value="low_stock">Low Stock (1-4)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          <button class="btn btn-outline" style="padding:7px 12px; font-size:11px;" onclick="fetchProductsFromServer(true)">Refresh</button>
        </div>

        <!-- Products Table -->
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:50px;">Preview</th>
                <th>Garment Title & Handle</th>
                <th>Category / Occasion</th>
                <th>Price (INR)</th>
                <th>Stock / Sizing Allocation</th>
                <th>Status</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="products-table-body">
              <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">Loading Atelier collection...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 2: ORDERS & FULFILLMENT                    -->
      <!-- ============================================== -->
      <div id="view-orders" style="display:none;">
        <div class="section-title">
          <span>Bespoke Orders & Fulfillment</span>
          <button class="btn btn-outline" style="font-size:11px;" onclick="loadOrders()">Refresh Orders</button>
        </div>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Client / Contact</th>
                <th>Garments & Sizing</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody id="orders-tbody">
              <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">Loading client orders...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- ADD / EDIT PRODUCT MODAL                       -->
  <!-- ============================================== -->
  <div id="product-modal" class="modal-overlay" style="display:none;">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-product-heading">Add New Atelier Garment</h3>
        <button class="modal-close" onclick="closeProductModal()">&times;</button>
      </div>

      <form id="product-form" onsubmit="handleProductFormSubmit(event)">
        <input type="hidden" id="form-is-edit" value="false" />
        <input type="hidden" id="form-product-id" value="" />

        <div class="form-grid">
          <!-- Column 1: Details -->
          <div>
            <div class="form-group">
              <label class="form-label">Garment Title *</label>
              <input type="text" id="form-title" class="form-input" required placeholder="e.g. The Ivory Zardozi Sherwani" oninput="autoGenerateId()" />
            </div>

            <div class="form-group">
              <label class="form-label">Handle / Product ID * (Unique)</label>
              <input type="text" id="form-custom-id" class="form-input" required placeholder="e.g. waak-05-emerald-kurta" />
              <small style="font-size:10px; color:var(--text-muted);">Used in URLs and variant SKU prefix</small>
            </div>

            <div class="form-group">
              <label class="form-label">Subtitle / Craft Note</label>
              <input type="text" id="form-subtitle" class="form-input" placeholder="e.g. Spun Banarasi Silk with Handcrafted Antique Wirework" />
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select id="form-category" class="form-select" required>
                  <option value="Sherwanis">Sherwanis</option>
                  <option value="Kurta Sets">Kurta Sets</option>
                  <option value="Indo-Western">Indo-Western</option>
                  <option value="Suits & Blazers">Suits & Blazers</option>
                  <option value="Waistcoats">Waistcoats</option>
                  <option value="Indian Wear">Indian Wear</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Occasion *</label>
                <select id="form-occasion" class="form-select" required>
                  <option value="Wedding">Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Sangeet">Sangeet</option>
                  <option value="Mehendi">Mehendi</option>
                  <option value="Festive">Festive</option>
                  <option value="Formal">Formal</option>
                  <option value="Cocktail">Cocktail</option>
                </select>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group">
                <label class="form-label">Price (INR ₹) *</label>
                <input type="number" id="form-price" class="form-input" min="1" required placeholder="49500" />
              </div>

              <div class="form-group">
                <label class="form-label">Compare-at Price (INR ₹)</label>
                <input type="number" id="form-original-price" class="form-input" min="0" placeholder="Optional original price" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Collection / Series</label>
              <input type="text" id="form-collection" class="form-input" placeholder="e.g. Royal Heritage 2026" />
            </div>

            <div class="checkbox-row">
              <label class="checkbox-label">
                <input type="checkbox" id="form-published" checked />
                <span>Published in Store</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="form-bestseller" />
                <span>Best Seller</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="form-new-arrival" />
                <span>New Arrival</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="form-on-sale" />
                <span>On Sale</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Atelier Description</label>
              <textarea id="form-description" class="form-textarea" placeholder="Detailed garment description, tailoring details, and craftsmanship notes..."></textarea>
            </div>
          </div>

          <!-- Column 2: Imagery & Sizing Matrix -->
          <div>
            <div class="form-group">
              <label class="form-label">Garment Photography & Gallery *</label>
              
              <!-- Cloudinary Dropzone -->
              <div id="image-dropzone" class="image-dropzone" onclick="document.getElementById('file-upload-input').click()" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c5a265" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style="color:var(--text-ivory); font-size:12px; font-weight:600; margin-top:4px;">Upload Photos from Computer</div>
                <div style="color:var(--text-muted); font-size:10px;">Drag & drop or click to browse (JPEG, PNG, WebP · Max 5MB each)</div>
                <input type="file" id="file-upload-input" multiple accept="image/jpeg,image/png,image/webp" style="display:none;" onchange="handleFileSelect(event)" />
              </div>

              <div id="upload-progress-box" style="display:none; margin-bottom:8px; font-size:11px; color:var(--accent-gold); align-items:center; gap:8px;">
                <span id="upload-progress-text">Uploading to Atelier media storage...</span>
              </div>

              <!-- Visual Gallery Tiles -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span style="font-size:11px; color:var(--text-muted);">Current Garment Photos (<span id="gallery-count">0</span>):</span>
                <span style="font-size:10px; color:var(--accent-gold);">Click ★ to set Cover Photo</span>
              </div>
              <div id="gallery-tiles-container" class="gallery-tiles-grid">
                <!-- Injected via renderGalleryTiles() -->
              </div>

              <!-- Quick Studio Presets -->
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:11px; color:var(--text-muted);">
                <span>Quick Studio Presets:</span>
                <div>
                  <a href="#" onclick="addPresetImage('/assets/products/ivory-sherwani.jpg'); return false;" style="color:var(--accent-gold); margin-right:6px;">Ivory</a>
                  <a href="#" onclick="addPresetImage('/assets/products/midnight-sherwani.jpg'); return false;" style="color:var(--accent-gold); margin-right:6px;">Midnight</a>
                  <a href="#" onclick="addPresetImage('/assets/products/emerald-kurta.jpg'); return false;" style="color:var(--accent-gold); margin-right:6px;">Emerald</a>
                  <a href="#" onclick="addPresetImage('/assets/products/mauve-bandhgala.jpg'); return false;" style="color:var(--accent-gold);">Mauve</a>
                </div>
              </div>

              <!-- Synchronized Storage Fields -->
              <input type="hidden" id="form-thumbnail" required />
              <textarea id="form-images" style="display:none;"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Sizing & Inventory Allocation</label>
              <div class="sizes-matrix">
                <div style="display:grid; grid-template-columns:80px 100px 1fr; gap:12px; font-size:10px; color:var(--accent-gold); font-weight:600; text-transform:uppercase; margin-bottom:8px;">
                  <span>Size</span>
                  <span>Stock Qty</span>
                  <span>Generated SKU</span>
                </div>

                <div class="size-row">
                  <span style="font-weight:600; color:var(--text-ivory);">Size 36</span>
                  <input type="number" id="size-stock-36" class="form-input" min="0" value="0" />
                  <span id="sku-preview-36" style="font-size:11px; color:var(--text-muted); font-family:monospace;">WAAK-...-36</span>
                </div>

                <div class="size-row">
                  <span style="font-weight:600; color:var(--text-ivory);">Size 38</span>
                  <input type="number" id="size-stock-38" class="form-input" min="0" value="6" />
                  <span id="sku-preview-38" style="font-size:11px; color:var(--text-muted); font-family:monospace;">WAAK-...-38</span>
                </div>

                <div class="size-row">
                  <span style="font-weight:600; color:var(--text-ivory);">Size 40</span>
                  <input type="number" id="size-stock-40" class="form-input" min="0" value="10" />
                  <span id="sku-preview-40" style="font-size:11px; color:var(--text-muted); font-family:monospace;">WAAK-...-40</span>
                </div>

                <div class="size-row">
                  <span style="font-weight:600; color:var(--text-ivory);">Size 42</span>
                  <input type="number" id="size-stock-42" class="form-input" min="0" value="8" />
                  <span id="sku-preview-42" style="font-size:11px; color:var(--text-muted); font-family:monospace;">WAAK-...-42</span>
                </div>

                <div class="size-row">
                  <span style="font-weight:600; color:var(--text-ivory);">Size 44</span>
                  <input type="number" id="size-stock-44" class="form-input" min="0" value="4" />
                  <span id="sku-preview-44" style="font-size:11px; color:var(--text-muted); font-family:monospace;">WAAK-...-44</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; border-top:1px solid var(--border-gold); padding-top:16px;">
          <div>
            <button type="button" id="modal-delete-btn" class="btn btn-danger" style="display:none;" onclick="triggerDeleteFromModal()">Delete Garment</button>
          </div>
          <div style="display:flex; gap:12px;">
            <button type="button" class="btn btn-outline" onclick="closeProductModal()">Cancel</button>
            <button type="submit" id="modal-submit-btn" class="btn">Save Garment</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Notification element -->
  <div id="toast-notification">Notification message</div>

  <script>
    let adminToken = localStorage.getItem('waak_admin_token');
    let allProducts = [];
    const FALLBACK_THUMB = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='75' viewBox='0 0 60 75' fill='%232a080d'><rect width='60' height='75' fill='%232a080d' stroke='%23c5a265' stroke-width='1'/><text x='50%' y='44%' dominant-baseline='middle' text-anchor='middle' fill='%23dfc28d' font-family='serif' font-size='9' font-weight='600' letter-spacing='1'>WAAK</text><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' fill='%23bfa79f' font-family='sans-serif' font-size='6' letter-spacing='0.5'>ATELIER</text></svg>";

    // Tab Switching
    function switchTab(tab) {
      document.getElementById('view-products').style.display = tab === 'products' ? 'block' : 'none';
      document.getElementById('view-orders').style.display = tab === 'orders' ? 'block' : 'none';
      document.getElementById('tab-btn-products').className = 'tab-btn ' + (tab === 'products' ? 'active' : '');
      document.getElementById('tab-btn-orders').className = 'tab-btn ' + (tab === 'orders' ? 'active' : '');
      if (tab === 'orders') loadOrders();
      if (tab === 'products') {
        if (allProducts.length === 0) {
          fetchProductsFromServer();
        } else {
          applyLocalFilters();
        }
      }
    }

    // Toast Alert
    function showToast(msg, isError = false) {
      const toast = document.getElementById('toast-notification');
      toast.innerText = msg;
      toast.style.borderColor = isError ? '#ef9a9a' : '#c5a265';
      toast.style.color = isError ? '#ef9a9a' : '#f4efe6';
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    // Authentication
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
      allProducts = [];
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
      loadStats();
      fetchProductsFromServer();
    }

    async function loadStats() {
      if (!adminToken) return;
      try {
        const res = await fetch('/admin/stats', { headers: { 'Authorization': 'Bearer ' + adminToken } });
        if (res.status === 401 || res.status === 403) return logoutAdmin();
        const stats = await res.json();
        document.getElementById('stat-revenue').innerText = '₹' + (stats.total_revenue || 0).toLocaleString('en-IN');
        document.getElementById('stat-orders').innerText = stats.total_orders || 0;
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    }

    // Fast In-Memory Catalogue Synchronization
    async function fetchProductsFromServer(notify = false) {
      if (!adminToken) return;
      try {
        const res = await fetch('/admin/products', {
          headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        if (res.status === 401 || res.status === 403) return logoutAdmin();
        const data = await res.json();
        allProducts = data.products || [];

        // Update aggregate counts
        document.getElementById('stat-products').innerText = allProducts.length;
        const totalUnits = allProducts.reduce((acc, p) => acc + (p.total_inventory || 0), 0);
        document.getElementById('stat-total-stock').innerText = totalUnits;

        applyLocalFilters();
        if (notify) showToast('Catalogue synchronized with database');
      } catch (err) {
        showToast('Failed to load products: ' + err.message, true);
      }
    }

    // Instant Synchronous Client-Side Filtering (0ms network latency on typing/filter changes)
    function applyLocalFilters() {
      const search = (document.getElementById('prod-search').value || '').trim().toLowerCase();
      const category = document.getElementById('prod-category-filter').value;
      const status = document.getElementById('prod-status-filter').value;
      const stock = document.getElementById('prod-stock-filter').value;

      const filtered = allProducts.filter(p => {
        // 1. Search filter: matches title, id, subtitle, or variant sku
        if (search) {
          const matchTitle = (p.title || '').toLowerCase().includes(search);
          const matchId = (p.id || '').toLowerCase().includes(search);
          const matchSubtitle = (p.subtitle || '').toLowerCase().includes(search);
          const matchSku = (p.variants || []).some(v => (v.sku || '').toLowerCase().includes(search));
          if (!matchTitle && !matchId && !matchSubtitle && !matchSku) return false;
        }

        // 2. Category filter
        if (category && category !== 'All' && category !== 'all') {
          if ((p.category || '').toLowerCase() !== category.toLowerCase()) return false;
        }

        // 3. Status filter
        if (status === 'published') {
          if (p.is_published === false) return false;
        } else if (status === 'draft') {
          if (p.is_published !== false) return false;
        }

        // 4. Stock filter
        const totalStock = p.total_inventory !== undefined ? p.total_inventory : (p.variants || []).reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
        if (stock === 'in_stock') {
          if (totalStock <= 4) return false;
        } else if (stock === 'low_stock') {
          if (totalStock === 0 || totalStock > 4) return false;
        } else if (stock === 'out_of_stock') {
          if (totalStock > 0) return false;
        }

        return true;
      });

      renderProductsTable(filtered);
    }

    function renderProductsTable(products) {
      const tbody = document.getElementById('products-table-body');
      if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted);">No garments match the current criteria.</td></tr>';
        return;
      }

      tbody.innerHTML = products.map(p => {
        const totalStock = p.total_inventory !== undefined ? p.total_inventory : (p.variants || []).reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
        let stockBadge = '<span class="status-badge badge-instock">' + totalStock + ' in stock</span>';
        if (totalStock === 0) {
          stockBadge = '<span class="status-badge badge-nostock">Out of Stock</span>';
        } else if (totalStock <= 4) {
          stockBadge = '<span class="status-badge badge-lowstock">' + totalStock + ' low stock</span>';
        }

        const isPub = p.is_published !== false;
        const statusBadge = isPub 
          ? '<span class="status-badge badge-published">Published</span>' 
          : '<span class="status-badge badge-draft">Draft</span>';

        // Size breakdown pills
        const sizePills = (p.variants || []).map(v => 
          '<span class="tag-pill">Sz ' + v.size + ': ' + v.stock_quantity + '</span>'
        ).join('');

        const comparePrice = p.original_price ? '<span style="text-decoration:line-through; font-size:11px; color:var(--text-muted); margin-left:6px;">₹' + p.original_price.toLocaleString('en-IN') + '</span>' : '';

        return '<tr>' +
          '<td><img src="' + (p.thumbnail || FALLBACK_THUMB) + '" class="product-thumb" alt="' + p.title + '" loading="lazy" onerror="this.onerror=null; this.src=FALLBACK_THUMB;" /></td>' +
          '<td>' +
            '<strong style="color:var(--text-ivory); font-size:14px;">' + p.title + '</strong><br/>' +
            '<small style="font-family:monospace; color:var(--accent-gold); font-size:11px;">' + p.id + '</small>' +
            (p.subtitle ? '<br/><small style="color:var(--text-muted); font-size:11px;">' + p.subtitle + '</small>' : '') +
          '</td>' +
          '<td>' +
            '<div>' + p.category + '</div>' +
            '<small style="color:var(--text-muted);">' + p.occasion + '</small>' +
          '</td>' +
          '<td>' +
            '<strong>₹' + p.price.toLocaleString('en-IN') + '</strong>' + comparePrice +
          '</td>' +
          '<td>' +
            '<div>' + stockBadge + '</div>' +
            '<div style="margin-top:4px;">' + (sizePills || '<small style="color:var(--text-muted);">No sizes registered</small>') + '</div>' +
          '</td>' +
          '<td>' +
            '<a href="#" onclick="toggleProductPublish(\\'' + p.id + '\\', ' + (!isPub) + '); return false;" style="text-decoration:none;" title="Click to toggle store publication">' +
              statusBadge +
            '</a>' +
          '</td>' +
          '<td style="text-align:right; white-space:nowrap;">' +
            '<button class="btn btn-outline" style="padding:4px 10px; font-size:11px; margin-right:6px;" onclick="openEditProductModal(\\'' + p.id + '\\')">Edit</button>' +
            '<button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="confirmDeleteProduct(\\'' + p.id + '\\', \\'' + p.title.replace(/'/g, "\\\\'") + '\\')">Delete</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    // Toggle Published / Draft
    async function toggleProductPublish(productId, newStatus) {
      if (!adminToken) return;
      try {
        const res = await fetch('/admin/products/' + productId + '/publish', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
          },
          body: JSON.stringify({ is_published: newStatus })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update publication status');
        showToast('Garment ' + (newStatus ? 'published in store' : 'moved to draft'));
        await fetchProductsFromServer();
      } catch (err) {
        showToast(err.message, true);
      }
    }

    // Modal Operations
    function openAddProductModal() {
      document.getElementById('modal-product-heading').innerText = 'Add New Atelier Garment';
      document.getElementById('form-is-edit').value = 'false';
      document.getElementById('form-product-id').value = '';
      document.getElementById('form-custom-id').readOnly = false;
      document.getElementById('modal-delete-btn').style.display = 'none';

      // Reset fields
      document.getElementById('form-title').value = '';
      document.getElementById('form-custom-id').value = '';
      document.getElementById('form-subtitle').value = '';
      document.getElementById('form-category').value = 'Sherwanis';
      document.getElementById('form-occasion').value = 'Wedding';
      document.getElementById('form-price').value = '';
      document.getElementById('form-original-price').value = '';
      document.getElementById('form-collection').value = '';
      document.getElementById('form-published').checked = true;
      document.getElementById('form-bestseller').checked = false;
      document.getElementById('form-new-arrival').checked = true;
      document.getElementById('form-on-sale').checked = false;
      document.getElementById('form-description').value = '';

      // Reset media manager
      currentModalImages = ['/assets/products/ivory-sherwani.jpg'];
      currentCoverImage = '/assets/products/ivory-sherwani.jpg';
      renderGalleryTiles();

      // Reset stock
      ['36','38','40','42','44'].forEach(sz => {
        document.getElementById('size-stock-' + sz).value = sz === '36' ? '0' : '6';
      });
      updateSkuPreviews('waak-new');
      document.getElementById('product-modal').style.display = 'flex';
    }

    async function openEditProductModal(productId) {
      if (!adminToken) return;
      try {
        const res = await fetch('/admin/products/' + productId, {
          headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch garment details');
        const p = data.product;

        document.getElementById('modal-product-heading').innerText = 'Edit Garment: ' + p.title;
        document.getElementById('form-is-edit').value = 'true';
        document.getElementById('form-product-id').value = p.id;
        document.getElementById('form-custom-id').value = p.id;
        document.getElementById('form-custom-id').readOnly = true;
        document.getElementById('modal-delete-btn').style.display = 'inline-block';

        document.getElementById('form-title').value = p.title || '';
        document.getElementById('form-subtitle').value = p.subtitle || '';
        document.getElementById('form-category').value = p.category || 'Sherwanis';
        document.getElementById('form-occasion').value = p.occasion || 'Wedding';
        document.getElementById('form-price').value = p.price || '';
        document.getElementById('form-original-price').value = p.original_price || '';
        document.getElementById('form-collection').value = p.collection || '';
        document.getElementById('form-published').checked = p.is_published !== false;
        document.getElementById('form-bestseller').checked = Boolean(p.is_bestseller);
        document.getElementById('form-new-arrival').checked = Boolean(p.is_new_arrival);
        document.getElementById('form-on-sale').checked = Boolean(p.on_sale);
        document.getElementById('form-description').value = p.description || '';

        // Non-destructive image loading: preserve all existing photos
        const existingThumb = (p.thumbnail || '').trim();
        const existingImgs = (p.images || []).map(s => (s || '').trim()).filter(Boolean);
        const combined = [existingThumb, ...existingImgs].filter(Boolean);
        currentModalImages = Array.from(new Set(combined));
        if (currentModalImages.length === 0) {
          currentModalImages = ['/assets/products/ivory-sherwani.jpg'];
        }
        currentCoverImage = existingThumb || currentModalImages[0];
        renderGalleryTiles();

        // Populate sizes
        const sizeMap = {};
        (p.variants || []).forEach(v => { sizeMap[v.size] = v.stock_quantity; });
        ['36','38','40','42','44'].forEach(sz => {
          document.getElementById('size-stock-' + sz).value = sizeMap[sz] !== undefined ? sizeMap[sz] : 0;
        });

        updateSkuPreviews(p.id);
        document.getElementById('product-modal').style.display = 'flex';
      } catch (err) {
        showToast(err.message, true);
      }
    }

    function closeProductModal() {
      document.getElementById('product-modal').style.display = 'none';
    }

    function autoGenerateId() {
      if (document.getElementById('form-is-edit').value === 'true') return;
      const title = document.getElementById('form-title').value;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      document.getElementById('form-custom-id').value = slug ? ('waak-' + slug) : '';
      updateSkuPreviews(slug ? ('waak-' + slug) : 'waak-new');
    }

    function updateSkuPreviews(prefix) {
      const cleanPrefix = (prefix || 'WAAK').toUpperCase();
      ['36','38','40','42','44'].forEach(sz => {
        document.getElementById('sku-preview-' + sz).innerText = 'WAAK-' + cleanPrefix + '-' + sz;
      });
    }

    // Media Manager Studio State & Methods
    let currentModalImages = [];
    let currentCoverImage = '';

    function renderGalleryTiles() {
      const container = document.getElementById('gallery-tiles-container');
      const countEl = document.getElementById('gallery-count');
      if (!container) return;

      if (!currentModalImages || currentModalImages.length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:16px; font-size:11px; color:var(--text-muted);">No photos attached. Upload photos from your computer or choose a preset.</div>';
        if (countEl) countEl.innerText = '0';
        document.getElementById('form-thumbnail').value = '';
        document.getElementById('form-images').value = '';
        return;
      }

      if (!currentCoverImage || !currentModalImages.includes(currentCoverImage)) {
        currentCoverImage = currentModalImages[0];
      }

      if (countEl) countEl.innerText = currentModalImages.length;
      document.getElementById('form-thumbnail').value = currentCoverImage;
      document.getElementById('form-images').value = currentModalImages.join('\\n');

      container.innerHTML = currentModalImages.map((url, idx) => {
        const isCover = url === currentCoverImage;
        const leftDisabled = idx === 0 ? 'opacity:0.25; pointer-events:none;' : '';
        const rightDisabled = idx === currentModalImages.length - 1 ? 'opacity:0.25; pointer-events:none;' : '';
        const safeUrl = url.replace(/'/g, "\\\\'");

        return '<div class="gallery-tile ' + (isCover ? 'is-cover' : '') + '">' +
          '<img src="' + url + '" onerror="this.onerror=null; this.src=FALLBACK_THUMB;" />' +
          (isCover ? '<span class="tile-cover-badge">★ Cover</span>' : '') +
          '<div class="tile-overlay-btns">' +
            '<button type="button" class="tile-btn" title="Set as Cover Photo" onclick="setCoverPhoto(\\'' + safeUrl + '\\')">' + (isCover ? '★' : '☆') + '</button>' +
            '<button type="button" class="tile-btn" style="' + leftDisabled + '" title="Move Left" onclick="moveGalleryPhoto(' + idx + ', -1)">◀</button>' +
            '<button type="button" class="tile-btn" style="' + rightDisabled + '" title="Move Right" onclick="moveGalleryPhoto(' + idx + ', 1)">▶</button>' +
            '<button type="button" class="tile-btn btn-del" title="Remove Photo" onclick="removeGalleryPhoto(' + idx + ')">×</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function setCoverPhoto(url) {
      currentCoverImage = url;
      renderGalleryTiles();
    }

    function moveGalleryPhoto(idx, dir) {
      const targetIdx = idx + dir;
      if (targetIdx < 0 || targetIdx >= currentModalImages.length) return;
      const temp = currentModalImages[idx];
      currentModalImages[idx] = currentModalImages[targetIdx];
      currentModalImages[targetIdx] = temp;
      renderGalleryTiles();
    }

    function removeGalleryPhoto(idx) {
      const removed = currentModalImages.splice(idx, 1)[0];
      if (currentCoverImage === removed) {
        currentCoverImage = currentModalImages[0] || '';
      }
      renderGalleryTiles();
    }

    function addPresetImage(url) {
      if (!currentModalImages.includes(url)) {
        currentModalImages.push(url);
      }
      if (!currentCoverImage) currentCoverImage = url;
      renderGalleryTiles();
    }

    // Drag and Drop & File Upload Handlers
    function handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      const el = document.getElementById('image-dropzone');
      if (el) el.classList.add('dragover');
    }

    function handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      const el = document.getElementById('image-dropzone');
      if (el) el.classList.remove('dragover');
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      const el = document.getElementById('image-dropzone');
      if (el) el.classList.remove('dragover');
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) {
        uploadFilesToServer(files);
      }
    }

    function handleFileSelect(e) {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFilesToServer(files);
      }
      e.target.value = '';
    }

    async function uploadFilesToServer(fileList) {
      if (!adminToken) return;
      const progressBox = document.getElementById('upload-progress-box');
      const progressText = document.getElementById('upload-progress-text');

      const formData = new FormData();
      let validCount = 0;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.size > 5 * 1024 * 1024) {
          showToast('Image ' + file.name + ' exceeds 5MB limit.', true);
          continue;
        }
        formData.append('images', file);
        validCount++;
      }

      if (validCount === 0) return;

      if (progressBox) progressBox.style.display = 'flex';
      if (progressText) progressText.innerText = 'Uploading ' + validCount + ' image(s) to Atelier cloud storage...';

      try {
        const res = await fetch('/admin/upload/images', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + adminToken },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        (data.images || []).forEach(img => {
          const url = img.secure_url;
          if (!currentModalImages.includes(url)) {
            currentModalImages.push(url);
          }
        });

        if (!currentCoverImage && currentModalImages.length > 0) {
          currentCoverImage = currentModalImages[0];
        }

        renderGalleryTiles();
        showToast('Successfully uploaded ' + (data.images ? data.images.length : validCount) + ' image(s)');
      } catch (err) {
        showToast('Upload error: ' + err.message, true);
      } finally {
        if (progressBox) progressBox.style.display = 'none';
      }
    }

    // Submit Add or Edit Form
    async function handleProductFormSubmit(e) {
      e.preventDefault();
      if (!adminToken) return;

      const isEdit = document.getElementById('form-is-edit').value === 'true';
      const productId = document.getElementById('form-product-id').value || document.getElementById('form-custom-id').value;
      const submitBtn = document.getElementById('modal-submit-btn');
      submitBtn.innerText = 'Saving...';
      submitBtn.disabled = true;

      // Prepare variants
      const sizes = ['36', '38', '40', '42', '44'];
      const variants = sizes.map(sz => ({
        size: sz,
        stock_quantity: parseInt(document.getElementById('size-stock-' + sz).value || '0', 10),
      }));

      // Prepare gallery images from media manager
      const rawImages = currentModalImages.length > 0
        ? currentModalImages
        : [currentCoverImage || document.getElementById('form-thumbnail').value || FALLBACK_THUMB];
      const thumbnailVal = currentCoverImage || rawImages[0] || FALLBACK_THUMB;

      const payload = {
        id: document.getElementById('form-custom-id').value.trim(),
        title: document.getElementById('form-title').value.trim(),
        subtitle: document.getElementById('form-subtitle').value.trim(),
        description: document.getElementById('form-description').value.trim(),
        price: parseInt(document.getElementById('form-price').value, 10),
        original_price: document.getElementById('form-original-price').value ? parseInt(document.getElementById('form-original-price').value, 10) : null,
        category: document.getElementById('form-category').value,
        occasion: document.getElementById('form-occasion').value,
        collection: document.getElementById('form-collection').value.trim(),
        is_published: document.getElementById('form-published').checked,
        is_bestseller: document.getElementById('form-bestseller').checked,
        is_new_arrival: document.getElementById('form-new-arrival').checked,
        on_sale: document.getElementById('form-on-sale').checked,
        thumbnail: thumbnailVal,
        images: rawImages,
        variants: variants,
      };

      try {
        const url = isEdit ? ('/admin/products/' + productId) : '/admin/products';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + adminToken
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save product');

        closeProductModal();
        showToast('Garment saved to Atelier catalogue successfully');
        await fetchProductsFromServer();
      } catch (err) {
        showToast(err.message, true);
      } finally {
        submitBtn.innerText = 'Save Garment';
        submitBtn.disabled = false;
      }
    }

    // Delete Operations
    function triggerDeleteFromModal() {
      const productId = document.getElementById('form-product-id').value;
      const title = document.getElementById('form-title').value;
      confirmDeleteProduct(productId, title);
    }

    async function confirmDeleteProduct(productId, title) {
      if (!adminToken) return;
      const confirmed = confirm('Are you sure you wish to delete garment "' + title + '"?\\n\\nNotice: Products linked to existing customer orders cannot be permanently deleted and must be unpublished instead.');
      if (!confirmed) return;

      try {
        const res = await fetch('/admin/products/' + productId, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + adminToken }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete product');
        }
        closeProductModal();
        showToast('Garment deleted successfully');
        await fetchProductsFromServer();
      } catch (err) {
        alert(err.message);
      }
    }

    // Orders Functions (Retained from existing console)
    async function loadOrders() {
      if (!adminToken) return;
      try {
        const ordersRes = await fetch('/admin/orders', { headers: { 'Authorization': 'Bearer ' + adminToken } });
        const ordersData = await ordersRes.json();
        renderOrders(ordersData.orders || []);
      } catch (err) {
        console.error('Failed to load orders', err);
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
        if (res.ok) loadOrders();
      } catch (err) {
        alert('Failed to update status');
      }
    }

    if (adminToken) {
      showDashboard();
    }
  </script>
</body>
</html>`;
