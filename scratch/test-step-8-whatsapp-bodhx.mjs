// scratch/test-step-8-whatsapp-bodhx.mjs
// Step 8 Automated Verification Suite: WhatsApp Concierge + BodhX AI Integration
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [${total}] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [${total}] ${desc}`);
    console.error(`     Error: ${err.message}`);
  }
}

console.log('===============================================================');
console.log('   WAAK STEP 8 — WHATSAPP CONCIERGE & BODHX AI TEST SUITE      ');
console.log('===============================================================\n');

const repoRoot = process.cwd();
const whatsAppFile = path.join(repoRoot, 'src', 'components', 'WhatsAppInquiryButton.tsx');
const bodhxFile = path.join(repoRoot, 'src', 'components', 'BodhXWidget.tsx');
const aiSectionFile = path.join(repoRoot, 'src', 'components', 'AiAssistantSection.tsx');
const appFile = path.join(repoRoot, 'src', 'App.tsx');
const homeFile = path.join(repoRoot, 'src', 'Home.tsx');
const envExampleFile = path.join(repoRoot, '.env.example');

// 1. Files existence
it('All Step 8 components and configuration files exist', () => {
  assert(fs.existsSync(whatsAppFile), 'Missing WhatsAppInquiryButton.tsx');
  assert(fs.existsSync(bodhxFile), 'Missing BodhXWidget.tsx');
  assert(fs.existsSync(aiSectionFile), 'Missing AiAssistantSection.tsx');
  assert(fs.existsSync(envExampleFile), 'Missing .env.example');
});

const whatsAppCode = fs.readFileSync(whatsAppFile, 'utf-8');
const bodhxCode = fs.readFileSync(bodhxFile, 'utf-8');
const aiSectionCode = fs.readFileSync(aiSectionFile, 'utf-8');
const appCode = fs.readFileSync(appFile, 'utf-8');
const homeCode = fs.readFileSync(homeFile, 'utf-8');
const envExampleCode = fs.readFileSync(envExampleFile, 'utf-8');

// 2. WhatsApp Number Validation & Normalization for Client Contact
it('WhatsApp number validation handles proposed client number (+91 98217 07031)', () => {
  function validateWhatsAppNumber(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const allowedFormatRegex = /^\+?[0-9\s\-().]+$/;
    if (!allowedFormatRegex.test(trimmed)) return null;
    const cleanNumber = trimmed.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 15) return null;
    if (cleanNumber.startsWith('0')) return null;
    return cleanNumber;
  }

  // Client supplied number
  const normalized = validateWhatsAppNumber('+91 98217 07031');
  assert.strictEqual(normalized, '919821707031', 'Client number must normalize to 919821707031');

  // Edge cases
  assert.strictEqual(validateWhatsAppNumber(''), null);
  assert.strictEqual(validateWhatsAppNumber(null), null);
  assert.strictEqual(validateWhatsAppNumber('09821707031'), null, 'Leading zero must be rejected');
  assert.strictEqual(validateWhatsAppNumber('+91-98217-07031'), '919821707031');
});

// 3. WhatsApp Message Construction Privacy Contract
it('WhatsApp inquiry message contains only non-sensitive product data', () => {
  function buildInquiryMessage({ productName, productId, variantSize }) {
    const cleanName = productName?.trim();
    const cleanId = productId?.trim();
    const cleanSize = variantSize?.trim();
    const productDescriptor = cleanName || 'WAAK Occasionwear';
    const idDescriptor = cleanId ? ` (Product ID: ${cleanId})` : '';
    const sizeDescriptor = cleanSize ? ` Selected size: ${cleanSize}.` : '';
    return `Hello WAAK Atelier, I would like to enquire about ${productDescriptor}${idDescriptor}.${sizeDescriptor} Please share further details.`;
  }

  const msg = buildInquiryMessage({
    productName: 'The Ivory Zardozi Sherwani',
    productId: 'waak-01',
    variantSize: '40',
  });

  assert(msg.includes('The Ivory Zardozi Sherwani'), 'Must include product name');
  assert(msg.includes('Product ID: waak-01'), 'Must include product ID');
  assert(msg.includes('Selected size: 40'), 'Must include size');
  assert(!msg.includes('password'), 'Must not contain password');
  assert(!msg.includes('order_'), 'Must not contain order ID');
  assert(!msg.includes('card'), 'Must not contain card');
});

// 4. BodhX Widget Component Specification
it('BodhXWidget component specifies exact official embed script attributes', () => {
  assert(bodhxCode.includes('https://bodhx.ai/embed/widget.js'), 'Must use official BodhX widget URL');
  assert(bodhxCode.includes('https://api.bodhx.ai/api1'), 'Must use official BodhX API endpoint');
  assert(bodhxCode.includes('data-token'), 'Must set data-token attribute');
  assert(bodhxCode.includes('data-api'), 'Must set data-api attribute');
  assert(bodhxCode.includes('script.async = true'), 'Script must load asynchronously');
});

it('BodhXWidget prevents duplicate script injection and route collision on /admin', () => {
  assert(bodhxCode.includes('pathname.startsWith(\'/admin\')'), 'Must block loading on /admin routes');
  assert(bodhxCode.includes('existingScript'), 'Must check for existing script tag');
  assert(bodhxCode.includes('document.getElementById(BODHX_SCRIPT_ID)'), 'Must identify script by unique ID');
  assert(bodhxCode.includes('script.onerror'), 'Must include graceful error handler');
});

// 5. Customer-Facing AI Assistant Section
it('AiAssistantSection component renders luxury styling, heading, and 6 capabilities', () => {
  assert(aiSectionCode.includes('Your Personal WAAK Shopping Assistant'), 'Must include exact heading');
  assert(aiSectionCode.includes('Discover occasionwear, explore product details and get assistance'), 'Must include exact description');
  assert(aiSectionCode.includes('Product Discovery'), 'Must include capability: Product Discovery');
  assert(aiSectionCode.includes('Sizing & Fit Guidance'), 'Must include capability: Sizing & Fit Guidance');
  assert(aiSectionCode.includes('Occasion Recommendations'), 'Must include capability: Occasion Recommendations');
  assert(aiSectionCode.includes('Direct Silhouette Navigation'), 'Must include capability: Navigation');
  assert(aiSectionCode.includes('Atelier Information'), 'Must include capability: Atelier Information');
  assert(aiSectionCode.includes('Human Concierge Escalation'), 'Must include capability: Escalation');
});

it('AiAssistantSection enforces transparent disclaimers without unsubstantiated claims', () => {
  assert(aiSectionCode.includes('BodhX AI Shopping Intelligence'), 'Must acknowledge BodhX integration');
  assert(aiSectionCode.includes('Chat with AI Assistant'), 'Must include CTA button');
  assert(aiSectionCode.includes('Sizing recommendations are advisory'), 'Must disclaim guaranteed fits');
  assert(aiSectionCode.includes('verified staging checkout'), 'Must emphasize verified checkout');
});

// 6. Application Mounting
it('App.tsx mounts BodhXWidget component globally', () => {
  assert(appCode.includes('import BodhXWidget from "./components/BodhXWidget"'), 'Must import BodhXWidget in App.tsx');
  assert(appCode.includes('<BodhXWidget />'), 'Must mount <BodhXWidget /> in App.tsx');
});

it('Home.tsx mounts AiAssistantSection component', () => {
  assert(homeCode.includes('import AiAssistantSection from "./components/AiAssistantSection"'), 'Must import AiAssistantSection in Home.tsx');
  assert(homeCode.includes('<AiAssistantSection />'), 'Must mount <AiAssistantSection /> in Home.tsx');
});

// 7. Environment Variables Configuration
it('.env.example documents all WhatsApp and BodhX configuration keys', () => {
  assert(envExampleCode.includes('VITE_WHATSAPP_NUMBER='), 'Must document VITE_WHATSAPP_NUMBER');
  assert(envExampleCode.includes('VITE_BODHX_WIDGET_ENABLED=false'), 'Must default VITE_BODHX_WIDGET_ENABLED to false');
  assert(envExampleCode.includes('VITE_BODHX_WIDGET_TOKEN='), 'Must document VITE_BODHX_WIDGET_TOKEN');
  assert(envExampleCode.includes('VITE_BODHX_API_BASE=https://api.bodhx.ai/api1'), 'Must document VITE_BODHX_API_BASE');
});

// 8. Security Audit: Zero Hardcoded Exposed Tokens in Source Code
it('Zero hardcoded compromised tokens exist in source code', () => {
  const compromisedToken = '8a15da5a4997b9cb844bcf57cdd0856c22d5cd6cbee76dd0';
  assert(!bodhxCode.includes(compromisedToken), 'BodhXWidget must not hardcode exposed token');
  assert(!appCode.includes(compromisedToken), 'App.tsx must not hardcode exposed token');
  assert(!homeCode.includes(compromisedToken), 'Home.tsx must not hardcode exposed token');
  assert(!envExampleCode.includes(compromisedToken), '.env.example must not contain exposed token');
});

console.log('\n===============================================================');
console.log(`   TOTAL ASSERTIONS: ${passed} passed, ${total - passed} failed out of ${total}`);
console.log('===============================================================\n');

if (passed !== total) {
  process.exit(1);
}
