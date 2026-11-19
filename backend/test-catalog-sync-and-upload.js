import assert from 'assert';

const BASE_URL = 'http://localhost:9000';
let adminToken = '';
let customerToken = '';

async function runTests() {
  console.log('==========================================================');
  console.log('   WAAK CATALOGUE SYNC & IMAGE UPLOAD VERIFICATION SUITE  ');
  console.log('==========================================================\n');

  let passed = 0;
  let failed = 0;

  function record(pass, msg) {
    if (pass) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate Admin
    const loginRes = await fetch(`${BASE_URL}/admin/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'atelier@waak.in', password: 'waakAdmin2026!' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'Admin authentication successful');
    adminToken = loginData.token;
    record(true, 'Admin authentication successful and issued JWT token');

    // 2. Authenticate Customer for authorization boundary checks
    const cusLoginRes = await fetch(`${BASE_URL}/auth/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@waak.in', password: 'waakClient2026!' }),
    });
    const cusLoginData = await cusLoginRes.json();
    customerToken = cusLoginData.token;
    record(Boolean(customerToken), 'Customer account authenticated for role boundary test');

    // 3. Unauthenticated upload request rejected
    const unauthUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      body: new FormData(),
    });
    record(unauthUploadRes.status === 401, 'Unauthenticated image upload rejected with HTTP 401');

    // 4. Customer token rejected from image upload
    const customerUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` },
      body: new FormData(),
    });
    record(customerUploadRes.status === 403, 'Customer token on image upload endpoint rejected with HTTP 403');

    // 5. Empty multipart form rejected
    const emptyForm = new FormData();
    const emptyUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: emptyForm,
    });
    record(emptyUploadRes.status === 400, 'Empty upload payload rejected with HTTP 400');

    // 6. Non-image file rejected (MIME filter)
    const textBlob = new Blob(['this is not an image'], { type: 'text/plain' });
    const textForm = new FormData();
    textForm.append('images', textBlob, 'notes.txt');
    const textUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: textForm,
    });
    record(textUploadRes.status === 400, 'Non-image MIME type (text/plain) rejected with HTTP 400');

    // 7. Invalid magic bytes rejected (spoofed extension)
    const fakePngBlob = new Blob(['FAKE_PNG_HEADER_DATA_NOT_REAL'], { type: 'image/png' });
    const fakeForm = new FormData();
    fakeForm.append('images', fakePngBlob, 'fake.png');
    const fakeUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: fakeForm,
    });
    record(fakeUploadRes.status === 400, 'File with invalid image magic bytes rejected with HTTP 400');

    // 8. Valid PNG image upload accepted
    // Minimal valid 1x1 transparent PNG buffer
    const validPngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);
    const validBlob = new Blob([validPngBytes], { type: 'image/png' });
    const validForm = new FormData();
    validForm.append('images', validBlob, 'test_garment.png');

    const validUploadRes = await fetch(`${BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: validForm,
    });
    const validUploadData = await validUploadRes.json();
    record(validUploadRes.status === 200 && validUploadData.success, 'Valid image upload accepted with HTTP 200');
    record(Array.isArray(validUploadData.images) && validUploadData.images.length === 1, 'Upload returned image result array with 1 item');
    record(Boolean(validUploadData.images[0]?.secure_url), `Uploaded image secure URL returned: ${validUploadData.images[0]?.secure_url}`);

    // 9. Catalogue Synchronization: Verify Admin sees all 9 products
    const adminProductsRes = await fetch(`${BASE_URL}/admin/products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const adminProductsData = await adminProductsRes.json();
    const allProds = adminProductsData.products || [];
    record(allProds.length === 9, `Admin catalogue returns exactly 9 products (Found: ${allProds.length})`);

    // 10. Verify 4 original flagship products remain PUBLISHED with their intact inventory
    const originalIds = ['waak-01', 'waak-02', 'waak-03', 'waak-04'];
    const originalProds = allProds.filter((p) => originalIds.includes(p.id));
    record(originalProds.length === 4, 'All 4 original flagship garments present in database');
    const allOriginalPublished = originalProds.every((p) => p.is_published === true);
    record(allOriginalPublished, 'All 4 original garments remain in PUBLISHED status');

    // 11. Verify the 5 reconciled archival products are strictly DRAFT / UNPUBLISHED
    const archivalIds = [
      'black-tailored-suit',
      'navy-waistcoat',
      'cream-occasion-kurta',
      'regal-velvet-sherwani',
      'black-waistcoat'
    ];
    const archivalProds = allProds.filter((p) => archivalIds.includes(p.id));
    record(archivalProds.length === 5, 'All 5 archival garments successfully synchronized into Admin DB');
    const allArchivalDraft = archivalProds.every((p) => p.is_published === false);
    record(allArchivalDraft, 'All 5 archival garments are strictly UNPUBLISHED / DRAFT in database');

    // 12. Verify the 5 archival products have total_inventory = 0 (no invented inventory)
    const allArchivalZeroStock = archivalProds.every((p) => p.total_inventory === 0);
    record(allArchivalZeroStock, 'All 5 archival garments have strictly 0 inventory (inventory not artificially assigned)');

    // 13. Verify all 5 archival products have standard sizes 36, 38, 40, 42, 44 registered
    const allHave5Sizes = archivalProds.every((p) => (p.variants || []).length === 5);
    record(allHave5Sizes, 'All 5 archival garments have complete 5-size variant matrix (36-44) registered in DB');

    // 14. Verify Public Storefront GET /store/products returns ONLY the 4 published products
    const storeRes = await fetch(`${BASE_URL}/store/products`);
    const storeData = await storeRes.json();
    const publicProds = storeData.products || [];
    record(publicProds.length === 4, `Public storefront API returns strictly 4 published products (Found: ${publicProds.length})`);
    const noArchivalInStore = publicProds.every((p) => !archivalIds.includes(p.id));
    record(noArchivalInStore, 'None of the 5 archival draft garments are leaked to the public storefront API');

    // 15. Verify direct public lookup of an archival draft garment returns HTTP 404
    const directArchivalRes = await fetch(`${BASE_URL}/store/products/black-tailored-suit`);
    record(directArchivalRes.status === 404, 'Direct public lookup of archival draft garment returns HTTP 404 Not Found');

    // 16. Non-destructive product edit: Updating product metadata preserves existing images
    const targetProduct = archivalProds.find((p) => p.id === 'black-tailored-suit');
    const originalThumbnail = targetProduct.thumbnail;
    const originalImages = targetProduct.images || [];

    const updateRes = await fetch(`${BASE_URL}/admin/products/black-tailored-suit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        description: 'Updated bespoke description verifying non-destructive image preservation.',
        price: 18900,
        // Omit thumbnail and images to verify COALESCE non-destructive preservation
      }),
    });
    const updateData = await updateRes.json();
    record(updateRes.status === 200, 'Product metadata updated via PUT /admin/products/:id');

    // Re-fetch and verify images intact
    const verifyProdRes = await fetch(`${BASE_URL}/admin/products/black-tailored-suit`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const verifyProdData = await verifyProdRes.json();
    const updatedProd = verifyProdData.product;
    record(updatedProd.thumbnail === originalThumbnail, 'Product thumbnail strictly preserved after metadata-only edit');
    record(
      JSON.stringify(updatedProd.images) === JSON.stringify(originalImages),
      'Product images gallery array strictly preserved after metadata-only edit'
    );

    console.log('\n==========================================================');
    console.log(`   SUITE RESULTS: ${passed} passed, ${failed} failed`);
    console.log('==========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
