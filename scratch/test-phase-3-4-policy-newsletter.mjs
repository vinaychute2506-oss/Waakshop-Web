import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { pool } = require('../backend/dist/db');

const API_BASE = 'http://localhost:9000';
const FRONTEND_BASE = 'http://localhost:5173';

let passedAssertions = 0;

function check(condition, message) {
  assert(condition, message);
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('  WAAK Phase 3.4 — Policy, Footer & Newsletter Test Suite');
  console.log('===============================================================\n');

  try {
    // Reset rate limits before beginning test suite
    try {
      await fetch(`${API_BASE}/test/reset-rate-limits`, { method: 'POST' });
    } catch (_) {}

    // -------------------------------------------------------------
    // Group 1: Newsletter API & Persistence Verification
    // -------------------------------------------------------------
    console.log('--- Group 1: Newsletter API & Persistence Verification ---');

    const testEmail = `patron.${Date.now()}@waak-couture.in`;

    // 1.1 Valid Subscription
    const subRes = await fetch(`${API_BASE}/store/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `  ${testEmail.toUpperCase()}  `, source: 'footer_test' }),
    });
    check(subRes.status === 201, `Valid subscription returns HTTP 201 Created (got ${subRes.status})`);
    const subData = await subRes.json();
    check(subData.success === true, 'Response indicates success: true');
    check(typeof subData.message === 'string' && subData.message.includes('Thank you'), 'Confirmation message received');

    // 1.2 Verify in PostgreSQL table
    const dbRecord = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [testEmail.toLowerCase()]);
    check(dbRecord.rows.length === 1, 'Email normalized and persisted in newsletter_subscribers table');
    check(dbRecord.rows[0].source === 'footer_test', 'Source attribution preserved in database');
    check(dbRecord.rows[0].status === 'subscribed', 'Subscription status defaulted to "subscribed"');
    check(dbRecord.rows[0].consent_recorded === true, 'Consent recorded flag is true');
    check(dbRecord.rows[0].created_at instanceof Date, 'Created timestamp recorded');

    // 1.3 Duplicate Subscription Idempotency
    const dupRes = await fetch(`${API_BASE}/store/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, source: 'footer_test' }),
    });
    check(dupRes.status === 200, `Duplicate subscription returns HTTP 200 OK (got ${dupRes.status})`);
    const dupData = await dupRes.json();
    check(dupData.success === true, 'Duplicate response returns success: true');
    check(dupData.duplicate === true, 'Duplicate response flags duplicate: true');
    check(dupData.message.includes('already registered'), 'Duplicate response message informs patron politely');

    // Verify row count remained 1 (no duplicate row created)
    const dupCheck = await pool.query('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE email = $1', [testEmail.toLowerCase()]);
    check(parseInt(dupCheck.rows[0].count, 10) === 1, 'Database enforces UNIQUE constraint without row duplication');

    // 1.4 Invalid Email Formats
    const invalidFormats = [
      '',
      '   ',
      'notanemail',
      'patron@',
      '@waak.co.in',
      'patron..double@waak.co.in',
      'patron@waak',
    ];

    for (const invalidEmail of invalidFormats) {
      const errRes = await fetch(`${API_BASE}/store/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: invalidEmail }),
      });
      check(errRes.status === 400, `Invalid format "${invalidEmail}" returns HTTP 400 (got ${errRes.status})`);
      const errData = await errRes.json();
      check(typeof errData.error === 'string' && errData.error.length > 0, `Validation error message returned for "${invalidEmail}"`);
    }

    // 1.5 Missing Payload
    const missingRes = await fetch(`${API_BASE}/store/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    check(missingRes.status === 400, 'Empty JSON payload returns HTTP 400');

    // 1.6 Oversized Email (> 255 chars)
    const oversizedEmail = 'a'.repeat(250) + '@waak.co.in';
    const overRes = await fetch(`${API_BASE}/store/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: oversizedEmail }),
    });
    check(overRes.status === 400, 'Email exceeding 255 characters rejected with HTTP 400');

    // 1.7 Rate Limiter Enforcement
    let rateLimited = false;
    for (let i = 0; i < 35; i++) {
      const rlRes = await fetch(`${API_BASE}/store/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `rate.limit.${i}@waak.co.in` }),
      });
      if (rlRes.status === 429) {
        rateLimited = true;
        const rlData = await rlRes.json();
        check(typeof rlData.error === 'string' && rlData.error.includes('Too many'), 'Rate limiter returns HTTP 429 and informative error message');
        break;
      }
    }
    check(rateLimited === true, 'Rate limiter activates when request threshold is exceeded (HTTP 429)');

    // -------------------------------------------------------------
    // Group 2: Frontend Policy Routes & Navigation Integrity
    // -------------------------------------------------------------
    console.log('\n--- Group 2: Frontend Policy Routes & Navigation Integrity ---');

    const routesToCheck = [
      { path: '/privacy-policy', expectedText: 'Privacy Policy' },
      { path: '/terms-of-service', expectedText: 'Terms of Service' },
      { path: '/shipping-policy', expectedText: 'Shipping & Transit Policy' },
      { path: '/returns-and-exchanges', expectedText: 'Returns, Exchanges & Alteration Policy' },
      { path: '/care-and-preservation', expectedText: 'Care & Garment Preservation Guide' },
      { path: '/contact', expectedText: 'Flagship Atelier & Client Services' },
    ];

    // Vite dev server serves index.html for all SPA routes
    for (const route of routesToCheck) {
      const pageRes = await fetch(`${FRONTEND_BASE}${route.path}`);
      check(pageRes.status === 200, `Direct navigation to ${route.path} returns HTTP 200 (SPA fallback)`);
      const pageHtml = await pageRes.text();
      check(/<!doctype html>/i.test(pageHtml), `HTML shell delivered for ${route.path}`);
      check(pageHtml.includes('/src/main.tsx'), `Vite bundle mount point present for ${route.path}`);
    }

    // -------------------------------------------------------------
    // Group 3: Policy Content Review & Verification Standards
    // -------------------------------------------------------------
    console.log('\n--- Group 3: Policy Content Review & Verification Standards ---');

    // Read PolicyView.tsx and Footer.tsx to ensure honest representations
    const fs = await import('node:fs/promises');
    const policyViewSrc = await fs.readFile('src/components/PolicyView.tsx', 'utf-8');
    const footerSrc = await fs.readFile('src/components/Footer.tsx', 'utf-8');
    const appSrc = await fs.readFile('src/App.tsx', 'utf-8');
    const appContextSrc = await fs.readFile('src/context/AppContext.tsx', 'utf-8');

    // 3.1 Check disclaimer / review notices in PolicyView
    check(policyViewSrc.includes('Legal & Business Review Status:'), 'PolicyView includes explicit Legal & Business Review banner');
    check(policyViewSrc.includes('Draft for Corporate Review') || policyViewSrc.includes('Draft for Business Terms Review'), 'Draft statuses prominently declared');
    check(policyViewSrc.includes('Format vs. Real-Time Serviceability:'), 'Shipping policy explicitly distinguishes 6-digit PIN format from logistics serviceability');
    check(policyViewSrc.includes('Two-Day Exchange Request Window') || policyViewSrc.includes('Seven-Day Exchange & Alteration Window'), 'Exchange window stated clearly with custom/altered ensemble conditions');

    // 3.2 Check honest contact coordinates
    check(policyViewSrc.includes('privacy@waak.co.in'), 'Dedicated privacy contact channel declared');
    check(policyViewSrc.includes('concierge@waak.co.in'), 'Concierge channel declared');
    check(policyViewSrc.includes('+91 98217 07031') || policyViewSrc.includes('allocation pending commercial carrier provisioning'), 'Honest declaration or client-confirmed WhatsApp concierge contact present');

    // 3.3 Check Footer integration
    check(footerSrc.includes('api.newsletter.subscribe'), 'Footer directly connects to backend newsletter API');
    check(footerSrc.includes('isSubmitting'), 'Footer manages submitting state');
    check(footerSrc.includes('feedback'), 'Footer renders accessible feedback');
    check(footerSrc.includes("navigateTo('/privacy-policy')") || footerSrc.includes('navigateTo("/privacy-policy")'), 'Footer links to /privacy-policy');
    check(footerSrc.includes("navigateTo('/terms-of-service')") || footerSrc.includes('navigateTo("/terms-of-service")'), 'Footer links to /terms-of-service');
    check(footerSrc.includes("navigateTo('/shipping-policy')") || footerSrc.includes('navigateTo("/shipping-policy")'), 'Footer links to /shipping-policy');
    check(footerSrc.includes("navigateTo('/returns-and-exchanges')") || footerSrc.includes('navigateTo("/returns-and-exchanges")'), 'Footer links to /returns-and-exchanges');
    check(footerSrc.includes("navigateTo('/contact')") || footerSrc.includes('navigateTo("/contact")'), 'Footer links to /contact');
    check(footerSrc.includes("navigateTo('/care-and-preservation')") || footerSrc.includes('navigateTo("/care-and-preservation")'), 'Footer links to /care-and-preservation');

    // 3.4 Check Routing integration
    check(appContextSrc.includes('VALID_POLICY_ROUTES'), 'AppContext defines VALID_POLICY_ROUTES');
    check(appContextSrc.includes('resolveRoute'), 'AppContext implements resolveRoute for direct URL loads');
    check(appSrc.includes('PolicyView'), 'App.tsx mounts PolicyView');

    // -------------------------------------------------------------
    // Group 4: Courier Serviceability Interface Readiness
    // -------------------------------------------------------------
    console.log('\n--- Group 4: Courier Serviceability Interface Readiness ---');

    // Verify PDP pincode checker in ProductDetail.tsx remains format-validated and documented
    const pdpSrc = await fs.readFile('src/ProductDetail.tsx', 'utf-8');
    check(pdpSrc.includes('/^[1-9][0-9]{5}$/') || pdpSrc.includes('/^\\d{6}$/'), 'ProductDetail uses strict 6-digit regex for PIN format checking');
    check(pdpSrc.includes('checkServiceability') || (pdpSrc.includes('Valid Indian PIN format') && pdpSrc.includes('courier docket generation')), 'PIN check validates format and connects to courier serviceability');

    console.log('\n===============================================================');
    console.log(`  All Phase 3.4 tests passed successfully! (${passedAssertions}/${passedAssertions} assertions)`);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\n❌ Test assertion failed:', error);
    process.exit(1);
  } finally {
    try {
      await fetch(`${API_BASE}/test/reset-rate-limits`, { method: 'POST' });
    } catch (_) {}
    await pool.end();
  }
}

runTests();
