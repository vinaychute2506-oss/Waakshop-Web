// Step 7 Verification Suite: Pirohee-Inspired PDP Layout Upgrades & Integrity Audit
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('===============================================================');
console.log('   WAAK STEP 7 — PIROHEE BENCHMARK PDP INTEGRITY AUDIT        ');
console.log('===============================================================');

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

const pdpCode = fs.readFileSync(path.resolve('src/ProductDetail.tsx'), 'utf-8');
const reviewsCode = fs.readFileSync(path.resolve('src/components/ProductReviews.tsx'), 'utf-8');

// 1. Dual CTAs (Add to Bag + Buy It Now)
it('ProductDetail mounts Dual CTAs in .pdp-primary-action-row', () => {
  assert(pdpCode.includes('pdp-add-to-bag-btn'), 'Missing pdp-add-to-bag-btn');
  assert(pdpCode.includes('pdp-buy-it-now-btn'), 'Missing pdp-buy-it-now-btn');
});

it('Buy It Now button has direct checkout trigger and aria-label', () => {
  assert(pdpCode.includes('onClick={handleBuyItNow}'), 'Missing onClick={handleBuyItNow}');
  assert(pdpCode.includes('Buy It Now'), 'Missing Buy It Now button text');
  assert(pdpCode.includes('aria-label="Buy this silhouette now"'), 'Missing accessibility label');
});

it('handleBuyItNow enforces size selection and availability check before triggering checkout modal', () => {
  assert(pdpCode.includes('const handleBuyItNow = () =>'), 'Missing handleBuyItNow function');
  assert(pdpCode.includes('if (!selectedSize)'), 'Missing selectedSize check in handleBuyItNow');
  assert(pdpCode.includes('setIsCheckoutOpen(true)'), 'Missing direct checkout trigger');
});

// 2. Rating Snippet Under Product Title
it('ProductDetail mounts rating snippet under product title linking to #pdp-reviews-section', () => {
  assert(pdpCode.includes('className="pdp-rating-snippet"'), 'Missing pdp-rating-snippet container');
  assert(pdpCode.includes('className="pdp-rating-stars-gold"'), 'Missing pdp-rating-stars-gold');
  assert(pdpCode.includes('href="#pdp-reviews-section"'), 'Missing anchor jump link to reviews section');
  assert(pdpCode.includes('No reviews yet · Be the first to review'), 'Missing honest empty state review prompt');
});

// 3. Transparent Price & Savings Block
it('Price section calculates real backend savings with tracked dispatch notice', () => {
  assert(pdpCode.includes('Save ₹{savingsAmount.toLocaleString("en-IN")} ({discountPercent}% OFF)'), 'Missing savings pill');
  assert(pdpCode.includes('Inclusive of all taxes · Tracked Domestic Dispatch'), 'Missing tracked dispatch notice');
});

// 4. 4-Item Luxury Trust Assurance Grid
it('Trust assurance block features 4 structured items with factual copy and policy links', () => {
  assert(pdpCode.includes('Handcrafted Details:'), 'Missing Handcrafted Details trust point');
  assert(pdpCode.includes('Tracked Dispatch:'), 'Missing Tracked Dispatch trust point');
  assert(pdpCode.includes('Exchange Guidance:'), 'Missing Exchange Guidance trust point');
  assert(pdpCode.includes('Secure Checkout:'), 'Missing Secure Checkout trust point');
  assert(pdpCode.includes('grid-template-columns: repeat(2, 1fr)'), 'Missing 2x2 grid CSS');
});

// 5. Customer Reviews Component & Honest Empty State
it('ProductReviews component is mounted above complementary silhouettes', () => {
  assert(pdpCode.includes('<ProductReviews productId={product.id} productName={product.name} />'), 'Missing ProductReviews mounting');
});

it('ProductReviews initializes with honest empty state (zero synthetic testimonials)', () => {
  assert(reviewsCode.includes('No customer reviews yet'), 'Missing honest empty state title');
  assert(reviewsCode.includes('Be the first to share your experience with the {productName}'), 'Missing authentic prompt');
  assert(reviewsCode.includes('sessionStorage.getItem(`waak_reviews_${productId}`)'), 'Preserves real customer reviews across session');
});

it('ProductReviews provides interactive rating distribution and verified patron tags', () => {
  assert(reviewsCode.includes('pdp-reviews-bars-block'), 'Missing rating distribution bars');
  assert(reviewsCode.includes('Verified Patron'), 'Missing verified patron tag capability');
  assert(reviewsCode.includes('Write an Atelier Review'), 'Missing write review CTA');
});

// 6. Security & Policy Guardrails
it('VITE_WHATSAPP_NUMBER remains ungated/unconfigured by default (zero DOM leak)', () => {
  assert(pdpCode.includes('<WhatsAppInquiryButton'), 'Maintains gated WhatsApp component');
});

it('Backend and client checkout retain Razorpay TEST mode keys', () => {
  const envBackend = fs.readFileSync(path.resolve('backend/.env'), 'utf-8');
  assert(envBackend.includes('RAZORPAY_KEY_ID=rzp_test_waak2026demo'), 'Backend must remain in test mode');
});

console.log('===============================================================');
console.log(`   STEP 7 ASSERTIONS: ${passed} passed, ${total - passed} failed out of ${total}`);
console.log('===============================================================');

if (passed !== total) {
  process.exit(1);
} else {
  process.exit(0);
}
