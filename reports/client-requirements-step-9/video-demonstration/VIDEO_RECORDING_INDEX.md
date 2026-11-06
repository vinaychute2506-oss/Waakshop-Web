# WAAK Occasionwear — Video Demonstration Index & Scene Guide

**Client Presentation Deliverable**  
**Audience**: Ankur, WAAK Brand Owners, Staging Review Team  
**Date**: November 6, 2026  
**Git Baseline**: `feature/whatsapp-bodhx-ai-integration` (`a0e9a8f`)  
**Staging Mode**: Development & Testing Sandbox (Razorpay Test Mode, WhatsApp & BodhX Authorization Gated)

---

## 1. Master Video Deliverables

| Deliverable File | Focus Area | Resolution | FPS | Codec | Container | Duration | Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WAAK_COMPLETE_WEBSITE_DEMONSTRATION.mp4`** | Customer Experience, PDP, Cart, Checkout, Policies & Responsive | 1920×1080 | 30 | H.264 (AVC1, High, yuv420p) | MP4 (FastStart) | 02:35 | ~8.08 MB |
| **`WAAK_ADMIN_AND_TECHNICAL_DEMONSTRATION.mp4`** | Atelier Operations Portal, Orders, Inventory & API Diagnostics | 1920×1080 | 30 | H.264 (AVC1, High, yuv420p) | MP4 (FastStart) | 00:42 | ~1.09 MB |

---

## 2. Part 1: Complete Storefront Walkthrough (`WAAK_COMPLETE_WEBSITE_DEMONSTRATION.mp4`)

### Timestamp & Scene Breakdown

| Timestamp | Section | Scene Description | Interactive Elements Highlighted |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:05** | Intro Card | Executive Presentation Title Card | Brand identity, technical architecture scope & staging notice |
| **00:05 – 00:09** | Section 1 | Storefront Hero & Brand Identity | Centered luxury logo, bespoke typography, high-couture aesthetic |
| **00:09 – 00:15** | Section 2 | Header Navigation & Counters | Primary navigation, dynamic wishlist counter, bag counter pills |
| **00:15 – 00:36** | Section 3 | Homepage Visual Architecture | 7 circular category pills, New Arrivals showcase, occasion spotlight, 9-garment grid |
| **00:36 – 00:47** | Section 4 | Interactive Product Filtering | Multi-attribute matrix: Categories (Suits & Blazers, Kurta Sets), live re-rendering |
| **00:47 – 01:17** | Section 5 | Pirohee Benchmark PDP | The Ivory Zardozi Sherwani: high-res macro thumbnail switch, price/savings block (₹49,500 vs ₹56,000), size selection guardrail, PIN code checker (110001), composition accordion, and authentic customer feedback empty state |
| **01:17 – 01:21** | Section 6 | Wishlist Experience | Slide-over drawer with saved silhouettes, real-time pricing, instant item removal |
| **01:21 – 01:26** | Section 7 | Atelier Shopping Bag | Verified Size 40 bag entry, ₹49,500 subtotal, free insured transit indicator |
| **01:26 – 01:34** | Section 8 | Express Checkout Modal | Contact details & shipping validation; Razorpay TEST sandbox enclosure (`rzp_test_waak2026demo`) |
| **01:34 – 01:42** | Section 9 | WhatsApp Concierge Gate | Proposed business contact `+91 98217 07031`; configuration-gated via `VITE_WHATSAPP_NUMBER`; zero-PII payload |
| **01:42 – 01:55** | Section 10 & 11 | BodhX AI Architecture | BodhX widget loader architecture; 6 advisory categories; backend-authoritative commercial boundary |
| **01:55 – 02:09** | Section 12 | Policy & Information Pages | Shipping & Transit (Draft), Returns & Exchanges (Draft), Garment Care Guide, Atelier Concierge |
| **02:09 – 02:13** | Section 13 | Newsletter Subscription | Real-time email validation, PostgreSQL persistence & client acknowledgment |
| **02:13 – 02:27** | Section 15 | Responsive Viewports | Mobile (iPhone SE: 375px), Large Mobile (iPhone 15 Pro Max: 430px), Tablet (iPad: 768px), Desktop (1440px) |
| **02:27 – 02:35** | Outro Card | Milestone Summary | Storefront client acceptance status, security guardrails & next steps |

---

## 3. Part 2: Atelier Operations & Technical Demonstration (`WAAK_ADMIN_AND_TECHNICAL_DEMONSTRATION.mp4`)

### Timestamp & Scene Breakdown

| Timestamp | Section | Scene Description | Technical Governance Details |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:05** | Intro Card | Operations Presentation Title Card | Administrative portal scope, PostgreSQL synchronization & staging credentials |
| **00:05 – 00:13** | Section 14 | Admin Authentication Console | Dedicated staging login (`atelier@waak.in`); JWT session establishment |
| **00:13 – 00:17** | Section 14 | Atelier Operations Dashboard | Overview metrics: Gross Revenue, Active Orders, Stocked SKUs |
| **00:17 – 00:21** | Section 14 | Live Customer Orders Table | Patron details, order total, payment verification & fulfillment status tracking |
| **00:21 – 00:26** | Section 14 | PostgreSQL Inventory Matrix | Real-time stock counts across 9 silhouettes (Sizes 38, 40, 42, 44) |
| **00:26 – 00:29** | Section 14 | Session Termination & Security | Admin logout, JWT purge, route guard protection |
| **00:29 – 00:37** | Section 17 | Health Diagnostics & Gateway | `/health` API status (`database: connected`, `isTestPaymentMode: true`); API Gateway index |
| **00:37 – 00:42** | Outro Card | Technical Governance Summary | Zero-PII compliance, payment sandbox containment, regression health (411 tests passing) |
