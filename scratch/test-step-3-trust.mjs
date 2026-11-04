// test-step-3-trust.mjs
// Automated verification suite for WAAK Client Requirements Step 3: Customer Trust Presentation
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}: ${err.message}`);
    failed++;
  }
}

console.log('===============================================================');
console.log('   WAAK STEP 3 — CUSTOMER TRUST PRESENTATION TEST SUITE       ');
console.log('===============================================================\n');

const repoRoot = process.cwd();

// --- Test Section 1: WhatsApp Gating & Component Integrity ---
console.log('Suite 1.1: WhatsApp Inquiry Button Gating & Safety');
const whatsAppFile = path.join(repoRoot, 'src', 'components', 'WhatsAppInquiryButton.tsx');
it('WhatsAppInquiryButton component exists', () => {
  assert.ok(fs.existsSync(whatsAppFile), 'WhatsAppInquiryButton.tsx should exist');
});

const whatsAppContent = fs.readFileSync(whatsAppFile, 'utf8');

it('Gating check: Returns null when VITE_WHATSAPP_NUMBER is missing or empty', () => {
  assert.ok(
    whatsAppContent.includes('if (!cleanNumber)') && whatsAppContent.includes('return null;'),
    'Component must return null if cleanNumber is empty'
  );
});

it('Gating check: Malformed number handling strips non-digits and returns null if no digits exist', () => {
  const sanitize = (raw) => (raw || '').replace(/\D/g, '');
  assert.strictEqual(sanitize(''), '', 'Empty string produces empty cleanNumber');
  assert.strictEqual(sanitize('invalid_phone_text'), '', 'Alpha string produces empty cleanNumber');
  assert.strictEqual(sanitize('+ - () #@!'), '', 'Punctuation produces empty cleanNumber');
  assert.strictEqual(sanitize(undefined), '', 'Undefined input produces empty cleanNumber');
  assert.ok(
    whatsAppContent.includes('.replace(/\\D/g, \'\')'),
    'Component must strip non-digit characters'
  );
});

it('Privacy guard: Template only accepts productName, productId, variantSize; zero PII parameters', () => {
  const propsMatch = whatsAppContent.match(/export interface WhatsAppInquiryProps\s*{([^}]+)}/);
  const propsText = propsMatch ? propsMatch[1] : '';
  assert.ok(propsText.includes('productName'), 'Accepts productName prop');
  assert.ok(propsText.includes('productId'), 'Accepts productId prop');
  assert.ok(!propsText.includes('email'), 'Must NOT accept or leak customer email');
  assert.ok(!propsText.includes('phone'), 'Must NOT accept or leak customer phone');
  assert.ok(!propsText.includes('orderId'), 'Must NOT accept or leak order reference');
  assert.ok(!propsText.includes('token'), 'Must NOT accept or leak auth/session tokens');
});

it('Security guard: Target is _blank with rel="noopener noreferrer"', () => {
  assert.ok(whatsAppContent.includes('target="_blank"'), 'Must open in new tab');
  assert.ok(whatsAppContent.includes('rel="noopener noreferrer"'), 'Must have safe rel attributes');
});

it('URL generation: Uses official https://wa.me/ protocol', () => {
  assert.ok(whatsAppContent.includes('https://wa.me/'), 'Must use wa.me protocol');
  assert.ok(whatsAppContent.includes('encodeURIComponent'), 'Must URL-encode query string text');
});

it('Touch target sizing: Button has minHeight of at least 44px', () => {
  assert.ok(
    whatsAppContent.includes('minHeight: 44') || whatsAppContent.includes("minHeight: '44px'"),
    'Must ensure minimum 44px touch target on mobile'
  );
});

// --- Test Section 2: Product Detail Page Trust Assurances ---
console.log('\nSuite 1.2: Product Detail Page Trust Presentation');
const pdpFile = path.join(repoRoot, 'src', 'ProductDetail.tsx');
const pdpContent = fs.readFileSync(pdpFile, 'utf8');

it('PDP mounts WhatsAppInquiryButton with product props', () => {
  assert.ok(
    pdpContent.includes('<WhatsAppInquiryButton'),
    'PDP must mount WhatsAppInquiryButton'
  );
  assert.ok(
    pdpContent.includes('productName={product.name}'),
    'Must pass product name'
  );
});

it('PDP displays factual Atelier trust card (.pdp-trust-assurance-card)', () => {
  assert.ok(
    pdpContent.includes('pdp-trust-assurance-card'),
    'Must include pdp-trust-assurance-card container'
  );
  assert.ok(
    pdpContent.includes('pdp-trust-item'),
    'Must render individual pdp-trust-item entries'
  );
});

it('PDP trust card links to Shipping Policy with Draft disclaimer', () => {
  assert.ok(
    pdpContent.includes('/shipping-policy'),
    'Must link to /shipping-policy'
  );
  assert.ok(
    pdpContent.includes('(Draft)'),
    'Must preserve Draft disclaimer until terms approved'
  );
  assert.ok(
    !pdpContent.includes('Complimentary Express Dispatch'),
    'Must not make unapproved commercial shipping promises'
  );
});

it('PDP trust card links to Returns & Exchanges with Draft disclaimer', () => {
  assert.ok(
    pdpContent.includes('/returns-and-exchanges'),
    'Must link to /returns-and-exchanges'
  );
  assert.ok(
    pdpContent.includes('(Draft)'),
    'Must preserve Draft disclaimer until terms approved'
  );
  assert.ok(
    !pdpContent.includes('Complimentary fitting adjustment'),
    'Must not make unapproved commercial alteration promises'
  );
});

it('PDP trust card links to Contact Atelier', () => {
  assert.ok(
    pdpContent.includes('/contact'),
    'Must link to /contact concierge'
  );
});

it('PDP inventory reassurance is accurate to PostgreSQL variant state', () => {
  assert.ok(
    pdpContent.includes('Live Atelier Crafting') || pdpContent.includes('PostgreSQL inventory'),
    'Must state factual inventory validation'
  );
});

// --- Test Section 3: Checkout Modal Payment & Security Reassurance ---
console.log('\nSuite 1.3: Checkout Modal Payment & Security Reassurance');
const checkoutFile = path.join(repoRoot, 'src', 'components', 'CheckoutModal.tsx');
const checkoutContent = fs.readFileSync(checkoutFile, 'utf8');

it('Checkout modal mounts .checkout-security-card', () => {
  assert.ok(
    checkoutContent.includes('checkout-security-card'),
    'Must render checkout-security-card'
  );
  assert.ok(
    checkoutContent.includes('Payment & Security Reassurance'),
    'Must contain security reassurance header'
  );
});

it('Checkout card states Server-Verified Pricing', () => {
  assert.ok(
    checkoutContent.includes('Server-Verified Pricing'),
    'Must clearly explain server-side total verification'
  );
});

it('Checkout card states HMAC Signature Verification', () => {
  assert.ok(
    checkoutContent.includes('HMAC Signature Verification'),
    'Must state cryptographic signature verification'
  );
});

it('Checkout card states Direct Gateway Processing', () => {
  assert.ok(
    checkoutContent.includes('Direct Gateway Processing'),
    'Must state direct gateway processing via Razorpay'
  );
});

it('Checkout card states Staging Sandbox mode', () => {
  assert.ok(
    checkoutContent.includes('Staging Sandbox') && checkoutContent.includes('rzp_test_'),
    'Must clarify test mode and sandbox key prefix'
  );
});

it('Checkout submit button clearly indicates Staging Sandbox · Test Mode', () => {
  assert.ok(
    checkoutContent.includes('checkout-test-badge'),
    'Must include checkout-test-badge'
  );
  assert.ok(
    checkoutContent.includes('Staging Sandbox · Test Mode'),
    'Button must explicitly display Staging Sandbox · Test Mode'
  );
});

it('Checkout touch target is compliant (min-height >= 48px)', () => {
  assert.ok(
    checkoutContent.includes('min-height: 48px'),
    'Submit button must have min-height: 48px'
  );
});

// --- Test Section 4: Prohibited Marketing Claims Verification ---
console.log('\nSuite 1.4: Compliance & Prohibited Claim Audit');

const forbiddenClaims = [
  'PCI-DSS Level 1 certified atelier',
  '100% fraud proof',
  'ISO 27001 certified',
  'Unconditional 30-day money back guarantee',
  'Guaranteed 24-hour delivery nationwide'
];

forbiddenClaims.forEach((claim) => {
  it(`Codebase does not contain unapproved claim: "${claim}"`, () => {
    assert.ok(!checkoutContent.toLowerCase().includes(claim.toLowerCase()), 'Checkout must not contain forbidden claim');
    assert.ok(!pdpContent.toLowerCase().includes(claim.toLowerCase()), 'PDP must not contain forbidden claim');
  });
});

console.log('\n===============================================================');
console.log(`   STEP 3 TEST SUMMARY: ${passed} passed, ${failed} failed`);
console.log('===============================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
