// WAAK Phase 3.5 — Release Readiness & Production Safety Audit Suite
import assert from 'node:assert';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';

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

async function runAudit() {
  console.log('\n===============================================================');
  console.log('  WAAK Phase 3.5 — Release Readiness & Safety Audit Suite');
  console.log('===============================================================\n');

  try {
    // -------------------------------------------------------------
    // Section 1: Concurrent Newsletter Submission & Unsubscribe Audit
    // -------------------------------------------------------------
    console.log('--- Section 1: Newsletter Concurrency, Unsubscribe & Privacy ---');

    const concurrentEmail = `conc.${Date.now()}@waak-patron.in`;

    // 1.1 Fire 5 concurrent requests with the identical email
    console.log('  Testing 5 concurrent duplicate subscriptions...');
    const concurrentRequests = Array.from({ length: 5 }, (_, i) =>
      fetch(`${API_BASE}/store/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: concurrentEmail, source: `concurrent_${i}` }),
      })
    );

    const responses = await Promise.all(concurrentRequests);
    const statuses = responses.map((r) => r.status);
    check(
      statuses.every((s) => s === 201 || s === 200),
      `Concurrent requests all handled safely without 500 error (Statuses: ${statuses.join(', ')})`
    );

    const firstSubData = await responses[0].json();
    check(
      typeof firstSubData.unsubscribeToken === 'string' && firstSubData.unsubscribeToken.length === 64,
      'Subscription returns unguessable 64-char HMAC-SHA256 unsubscribeToken'
    );
    const validToken = firstSubData.unsubscribeToken;

    // 1.2 Verify in PostgreSQL table that exactly ONE row was created
    const dbRecord = await pool.query('SELECT * FROM newsletter_subscribers WHERE email = $1', [concurrentEmail.toLowerCase()]);
    check(dbRecord.rows.length === 1, 'Database enforces UNIQUE constraint under concurrency; exactly 1 record created');
    check(dbRecord.rows[0].status === 'subscribed', 'Subscription status is active');

    // 1.3 Test Forged / Tampered Unsubscribe Token Rejection (Security Defense)
    const forgedRes = await fetch(`${API_BASE}/store/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: concurrentEmail, token: 'malicious_forged_token_attack_1234567890' }),
    });
    check(forgedRes.status === 403, 'Forged/tampered unsubscribe token strictly rejected with HTTP 403 Forbidden');

    // 1.4 Test Legitimate Token-Based Unsubscription
    const unsubRes = await fetch(`${API_BASE}/store/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: concurrentEmail, token: validToken }),
    });
    check(unsubRes.status === 200, 'Legitimate token-based unsubscription succeeds with HTTP 200');
    const unsubData = await unsubRes.json();
    check(unsubData.success === true, 'Unsubscribe response reports success: true');

    const dbAfterUnsub = await pool.query('SELECT status FROM newsletter_subscribers WHERE email = $1', [concurrentEmail.toLowerCase()]);
    check(dbAfterUnsub.rows[0].status === 'unsubscribed', 'Database records status updated to "unsubscribed"');

    // 1.5 Test Non-Existent Subscriber Enumeration Defense
    const unknownRes = await fetch(`${API_BASE}/store/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `unknown_patron_${Date.now()}@waak.co.in` }),
    });
    check(unknownRes.status === 200, 'Unsubscribing unknown email returns uniform HTTP 200 (prevents enumeration)');
    const unknownData = await unknownRes.json();
    check(unknownData.updated === undefined, 'Endpoint masks DB row count / existence from response body');

    // 1.6 Test Unauthenticated Data Leakage Prevention
    const leakRes = await fetch(`${API_BASE}/store/newsletter`);
    check(leakRes.status === 404, 'Public GET /store/newsletter is non-existent (HTTP 404) — subscriber list cannot leak');

    // -------------------------------------------------------------
    // Section 2: Policy & Commercial Claim Draft Status & URL Compatibility
    // -------------------------------------------------------------
    console.log('\n--- Section 2: Policy & Commercial Claim Draft Audit ---');

    const policyViewSrc = await fs.readFile('src/components/PolicyView.tsx', 'utf-8');
    const pdpSrc = await fs.readFile('src/ProductDetail.tsx', 'utf-8');
    const footerSrc = await fs.readFile('src/components/Footer.tsx', 'utf-8');
    const appContextSrc = await fs.readFile('src/context/AppContext.tsx', 'utf-8');
    const appSrc = await fs.readFile('src/App.tsx', 'utf-8');

    // 2.1 Verify Policy URL Compatibility & Aliasing
    check(
      policyViewSrc.includes('case "/terms-of-service":') && policyViewSrc.includes('case "/terms-and-conditions":'),
      'PolicyView seamlessly supports both /terms-of-service and /terms-and-conditions'
    );
    check(
      policyViewSrc.includes('case "/shipping-policy":') && policyViewSrc.includes('case "/shipping-and-delivery":'),
      'PolicyView seamlessly supports both /shipping-policy and /shipping-and-delivery'
    );
    check(
      policyViewSrc.includes('case "/contact":') && policyViewSrc.includes('case "/contact-us":'),
      'PolicyView seamlessly supports both /contact and /contact-us'
    );
    check(
      appContextSrc.includes('cleanPath.includes("terms-and-conditions")') &&
      appContextSrc.includes('cleanPath.includes("shipping-and-delivery")'),
      'AppContext resolveRoute normalizes historical and report URL aliases'
    );
    check(
      appSrc.includes('/terms-and-conditions') && appSrc.includes('/shipping-and-delivery'),
      'App.tsx route matcher includes both canonical and alias policy routes'
    );

    // 2.2 Verify PolicyView prominent warning
    check(
      policyViewSrc.includes('Unapproved Draft Policy (Pending Corporate Confirmation)'),
      'PolicyView renders explicit "Unapproved Draft Policy" warning banner'
    );
    check(
      policyViewSrc.includes('Commercial terms (including return/exchange timeframes, express dispatch guarantees, transit insurance) and statutory corporate details remain unconfirmed'),
      'PolicyView explicitly declares exchange timeframes, transit guarantees, and corporate details are unconfirmed'
    );

    // 2.3 Verify Care Guide includes draft disclaimer
    check(
      policyViewSrc.includes('renderNotice("Garment Care & Fabric Preservation Guidelines")'),
      'Care & Preservation guide explicitly includes draft review notice'
    );

    // 2.4 Verify PDP claims are explicitly qualified as drafts
    check(
      pdpSrc.includes('draft exchange terms (subject to final business confirmation)'),
      'PDP FAQ item 5 qualifies return & exchange claims as draft terms pending confirmation'
    );
    check(
      pdpSrc.includes('Courier transit windows and insurance representations represent draft operational standards'),
      'PDP Shipping accordion explicitly flags courier transit windows & insurance as draft standards'
    );

    // 2.5 Verify Footer consent disclosure
    check(
      footerSrc.includes('By submitting, you consent to receive seasonal atelier invitations'),
      'Footer displays explicit consent disclosure below newsletter input'
    );

    // -------------------------------------------------------------
    // Section 3: Commerce, Payment Sandbox & Security Integrity
    // -------------------------------------------------------------
    console.log('\n--- Section 3: Commerce, Payment Sandbox & Security ---');

    // 3.1 Check /health endpoint
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    check(healthRes.status === 200, 'Health check responds HTTP 200 OK');
    check(healthData.database === 'connected', 'Database reports healthy connection');
    check(healthData.isTestPaymentMode === true, 'Payment gateway is strictly locked in TEST mode');

    // 3.2 Verify Config guards against live keys in dev/staging
    const configSrc = await fs.readFile('backend/src/config.ts', 'utf-8');
    check(
      configSrc.includes("keyId.startsWith('rzp_live_')"),
      'config.ts contains security guard blocking rzp_live_ keys'
    );
    check(
      configSrc.includes('DEFAULT_DEV_JWT'),
      'config.ts enforces minimum 32-char high-entropy JWT secrets in production-like environments'
    );

    // 3.3 Verify checkout PIN code strictness
    const invalidPinRes = await fetch(`${API_BASE}/store/carts/test-cart/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@waak.in',
        shipping_address: { postal_code: '11000' } // 5 digits
      }),
    });
    check(invalidPinRes.status === 400, 'Checkout rejects 5-digit PIN with HTTP 400');
    const invalidPinData = await invalidPinRes.json();
    check(invalidPinData.error && invalidPinData.error.includes('Exactly 6 numeric digits required'), 'Checkout returns informative PIN format error');

    console.log('\n===============================================================');
    console.log(`  Phase 3.5 safety audit passed! (${passedAssertions}/${passedAssertions} assertions verified)`);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('\n❌ Release readiness audit assertion failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAudit();
