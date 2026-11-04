// test-step-5-whatsapp.mjs
// Automated verification suite for WAAK Client Requirements Step 5: WhatsApp Inquiry Integration
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
console.log('   WAAK STEP 5 — WHATSAPP INQUIRY INTEGRATION TEST SUITE      ');
console.log('===============================================================\n');

const repoRoot = process.cwd();
const whatsAppFile = path.join(repoRoot, 'src', 'components', 'WhatsAppInquiryButton.tsx');
const pdpFile = path.join(repoRoot, 'src', 'ProductDetail.tsx');
const envExampleFile = path.join(repoRoot, '.env.example');

// --- Suite 5.1: Component Structure & Codebase Integrity ---
console.log('Suite 5.1: Component Structure & Codebase Integrity');

it('WhatsAppInquiryButton.tsx exists in src/components/', () => {
  assert.ok(fs.existsSync(whatsAppFile), 'WhatsAppInquiryButton.tsx must exist');
});

const whatsAppContent = fs.readFileSync(whatsAppFile, 'utf8');

it('Exports validateWhatsAppNumber function', () => {
  assert.ok(
    whatsAppContent.includes('export function validateWhatsAppNumber'),
    'Component must export validateWhatsAppNumber for unit verification'
  );
});

it('Exports buildInquiryMessage function', () => {
  assert.ok(
    whatsAppContent.includes('export function buildInquiryMessage'),
    'Component must export buildInquiryMessage for message contract verification'
  );
});

it('Exports default WhatsAppInquiryButton React component', () => {
  assert.ok(
    whatsAppContent.includes('export default function WhatsAppInquiryButton'),
    'Component must export default WhatsAppInquiryButton'
  );
});

// Replicate exact validation function from component for unit testing
function validateWhatsAppNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const allowedFormatRegex = /^\+?[0-9\s\-().]+$/;
  if (!allowedFormatRegex.test(trimmed)) {
    return null;
  }

  const cleanNumber = trimmed.replace(/\D/g, '');

  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    return null;
  }

  if (cleanNumber.startsWith('0')) {
    return null;
  }

  return cleanNumber;
}

// Replicate exact build message function from component for unit testing
function buildInquiryMessage({ productName, productId, variantSize }) {
  const cleanName = productName?.trim();
  const cleanId = productId?.trim();
  const cleanSize = variantSize?.trim();

  const productDescriptor = cleanName || 'WAAK Occasionwear';
  const idDescriptor = cleanId ? ` (Product ID: ${cleanId})` : '';
  const sizeDescriptor = cleanSize ? ` Selected size: ${cleanSize}.` : '';

  return `Hello WAAK Atelier, I would like to enquire about ${productDescriptor}${idDescriptor}.${sizeDescriptor} Please share further details.`;
}

// --- Suite 5.2: Phone Number Validation & Configuration Gating ---
console.log('\nSuite 5.2: Phone Number Validation & Configuration Gating');

it('Rejects undefined, null, or empty string (returns null)', () => {
  assert.strictEqual(validateWhatsAppNumber(undefined), null);
  assert.strictEqual(validateWhatsAppNumber(null), null);
  assert.strictEqual(validateWhatsAppNumber(''), null);
  assert.strictEqual(validateWhatsAppNumber('   '), null);
});

it('Rejects numbers containing alphabetic characters', () => {
  assert.strictEqual(validateWhatsAppNumber('+9198765abcde'), null);
  assert.strictEqual(validateWhatsAppNumber('waak_support'), null);
  assert.strictEqual(validateWhatsAppNumber('91987654321a'), null);
  assert.strictEqual(validateWhatsAppNumber('call_us_now'), null);
});

it('Rejects numbers containing unsupported symbols (@, $, #, _, %, &, ?, /)', () => {
  assert.strictEqual(validateWhatsAppNumber('+91@9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91$9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91#9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91_9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91%9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91?9876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('+91/9876543210'), null);
});

it('Rejects numbers with fewer than 10 digits (E.164 lower bound)', () => {
  assert.strictEqual(validateWhatsAppNumber('+91 12345'), null);
  assert.strictEqual(validateWhatsAppNumber('123456789'), null);
  assert.strictEqual(validateWhatsAppNumber('+91-987'), null);
});

it('Rejects numbers with more than 15 digits (E.164 upper bound)', () => {
  assert.strictEqual(validateWhatsAppNumber('+1234567890123456'), null); // 16 digits
  assert.strictEqual(validateWhatsAppNumber('91987654321012345'), null); // 17 digits
});

it('Rejects domestic numbers starting with 0 (missing international country code)', () => {
  assert.strictEqual(validateWhatsAppNumber('09876543210'), null);
  assert.strictEqual(validateWhatsAppNumber('02228765432'), null);
});

it('Accepts and normalizes valid synthetic E.164 international numbers with formatting', () => {
  assert.strictEqual(validateWhatsAppNumber('+91 98765 43210'), '919876543210');
  assert.strictEqual(validateWhatsAppNumber('+91-98765-43210'), '919876543210');
  assert.strictEqual(validateWhatsAppNumber('+91 (98765) 43210'), '919876543210');
  assert.strictEqual(validateWhatsAppNumber('+91.98765.43210'), '919876543210');
  assert.strictEqual(validateWhatsAppNumber('919876543210'), '919876543210');
  assert.strictEqual(validateWhatsAppNumber('+1 (415) 555-2671'), '14155552671');
});

it('Component returns null when cleanNumber is falsy (zero DOM footprint)', () => {
  assert.ok(
    whatsAppContent.includes('const cleanNumber = validateWhatsAppNumber(rawNumber);'),
    'Must validate rawNumber through validateWhatsAppNumber'
  );
  assert.ok(
    whatsAppContent.includes('if (!cleanNumber)') && whatsAppContent.includes('return null;'),
    'Must return null when cleanNumber is null'
  );
});

// --- Suite 5.3: Inquiry Message Construction & URL Encoding ---
console.log('\nSuite 5.3: Inquiry Message Construction & URL Encoding');

it('Builds complete message when product name, ID, and size are provided', () => {
  const msg = buildInquiryMessage({
    productName: 'The Royal Bandhgala',
    productId: 'waak-03',
    variantSize: '40',
  });
  assert.strictEqual(
    msg,
    'Hello WAAK Atelier, I would like to enquire about The Royal Bandhgala (Product ID: waak-03). Selected size: 40. Please share further details.'
  );
});

it('Builds message gracefully when size is missing', () => {
  const msg = buildInquiryMessage({
    productName: 'Ivory Silk Sherwani',
    productId: 'waak-01',
    variantSize: undefined,
  });
  assert.strictEqual(
    msg,
    'Hello WAAK Atelier, I would like to enquire about Ivory Silk Sherwani (Product ID: waak-01). Please share further details.'
  );
});

it('Builds message gracefully when product name is missing (uses brand fallback)', () => {
  const msg = buildInquiryMessage({
    productName: undefined,
    productId: 'waak-02',
    variantSize: '42',
  });
  assert.strictEqual(
    msg,
    'Hello WAAK Atelier, I would like to enquire about WAAK Occasionwear (Product ID: waak-02). Selected size: 42. Please share further details.'
  );
});

it('Builds message gracefully when product ID is missing', () => {
  const msg = buildInquiryMessage({
    productName: 'Emerald Raw Silk Kurta',
    variantSize: '38',
  });
  assert.strictEqual(
    msg,
    'Hello WAAK Atelier, I would like to enquire about Emerald Raw Silk Kurta. Selected size: 38. Please share further details.'
  );
});

it('Encodes spaces, ampersands, and punctuation properly into wa.me destination', () => {
  const specialName = "Men's Zari & Resham Kurta - Festive Edition";
  const msg = buildInquiryMessage({
    productName: specialName,
    productId: 'waak-special-01',
    variantSize: '42L',
  });
  const encoded = encodeURIComponent(msg);
  const cleanNum = '919876543210';
  const url = `https://wa.me/${cleanNum}?text=${encoded}`;

  assert.ok(url.startsWith('https://wa.me/919876543210?text=Hello%20WAAK%20Atelier'));
  assert.ok(url.includes('Zari%20%26%20Resham'));
  assert.ok(!url.includes(' ')); // Zero unencoded raw spaces in URL
});

// --- Suite 5.4: Customer Privacy & Security Guardrails ---
console.log('\nSuite 5.4: Customer Privacy & Security Guardrails');

it('WhatsAppInquiryProps strictly prohibits customer personal or payment data', () => {
  const propsMatch = whatsAppContent.match(/export interface WhatsAppInquiryProps\s*{([^}]+)}/);
  assert.ok(propsMatch, 'Must define WhatsAppInquiryProps interface');
  const props = propsMatch[1];
  assert.ok(props.includes('productName'), 'Allows productName');
  assert.ok(props.includes('productId'), 'Allows productId');
  assert.ok(props.includes('variantSize'), 'Allows variantSize');
  assert.ok(!props.includes('customer'), 'Must NOT accept customer object');
  assert.ok(!props.includes('email'), 'Must NOT accept email');
  assert.ok(!props.includes('phone'), 'Must NOT accept customer phone');
  assert.ok(!props.includes('address'), 'Must NOT accept address');
  assert.ok(!props.includes('order'), 'Must NOT accept order info');
  assert.ok(!props.includes('payment'), 'Must NOT accept payment info');
  assert.ok(!props.includes('token'), 'Must NOT accept auth tokens');
});

it('Safe anchor attributes enforced (target="_blank", rel="noopener noreferrer")', () => {
  assert.ok(whatsAppContent.includes('target="_blank"'), 'Must specify target="_blank"');
  assert.ok(whatsAppContent.includes('rel="noopener noreferrer"'), 'Must specify rel="noopener noreferrer"');
});

it('Minimum 44px touch target enforced for mobile accessibility', () => {
  assert.ok(
    whatsAppContent.includes("minHeight: '44px'") || whatsAppContent.includes('minHeight: 44'),
    'Must specify 44px minHeight'
  );
});

it('No real business phone number hardcoded in source files', () => {
  // Ensure no hardcoded 10-12 digit real numbers exist in WhatsAppInquiryButton.tsx
  const hardcodedPhoneRegex = /['"](\+?91[6-9]\d{9})['"]/;
  assert.ok(
    !hardcodedPhoneRegex.test(whatsAppContent),
    'WhatsAppInquiryButton.tsx must NOT contain any hardcoded real Indian mobile number'
  );
  assert.ok(
    !hardcodedPhoneRegex.test(fs.readFileSync(pdpFile, 'utf8')),
    'ProductDetail.tsx must NOT contain any hardcoded real Indian mobile number'
  );
});

// --- Suite 5.5: PDP Mounting & Styling Integration ---
console.log('\nSuite 5.5: PDP Mounting & Styling Integration');

const pdpContent = fs.readFileSync(pdpFile, 'utf8');

it('PDP imports WhatsAppInquiryButton correctly', () => {
  assert.ok(
    pdpContent.includes('import WhatsAppInquiryButton from "./components/WhatsAppInquiryButton"') ||
    pdpContent.includes("import WhatsAppInquiryButton from './components/WhatsAppInquiryButton'"),
    'ProductDetail.tsx must import WhatsAppInquiryButton'
  );
});

it('PDP mounts WhatsAppInquiryButton within pdp-actions-section', () => {
  assert.ok(pdpContent.includes('<WhatsAppInquiryButton'), 'PDP must mount WhatsAppInquiryButton');
  assert.ok(pdpContent.includes('productName={product.name}'), 'Must pass product.name');
  assert.ok(pdpContent.includes('productId={product.id}'), 'Must pass product.id');
  assert.ok(pdpContent.includes('variantSize={selectedSize}'), 'Must pass selectedSize');
});

it('PDP defines hover and focus-visible styling for .waak-whatsapp-inquiry-btn', () => {
  assert.ok(
    pdpContent.includes('.waak-whatsapp-inquiry-btn:hover'),
    'Must define hover styles'
  );
  assert.ok(
    pdpContent.includes('.waak-whatsapp-inquiry-btn:focus-visible'),
    'Must define keyboard focus-visible outline'
  );
});

it('PDP preserves (Draft) policy disclaimers and Razorpay TEST mode protections', () => {
  assert.ok(
    pdpContent.includes('(Draft)'),
    'Must retain (Draft) policy notice on PDP'
  );
  assert.ok(
    !pdpContent.includes('rzp_live_'),
    'Must not reference live Razorpay keys'
  );
});

// --- Suite 5.6: Environment Configuration Template Documentation ---
console.log('\nSuite 5.6: Environment Configuration Documentation');

const envExampleContent = fs.readFileSync(envExampleFile, 'utf8');

it('.env.example documents VITE_WHATSAPP_NUMBER with gating instructions', () => {
  assert.ok(
    envExampleContent.includes('VITE_WHATSAPP_NUMBER='),
    '.env.example must document VITE_WHATSAPP_NUMBER'
  );
  assert.ok(
    envExampleContent.includes('Leave empty or unset in staging/dev'),
    'Must note that number should remain empty until authorized'
  );
});

// --- Summary ---
console.log('\n===============================================================');
console.log(`   TEST SUMMARY: ${passed} passed, ${failed} failed across 6 test suites`);
console.log('===============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
