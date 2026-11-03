import React from "react"
import { useApp } from "../context/AppContext"

export type PolicyRoute =
  | "/privacy-policy"
  | "/terms-of-service"
  | "/shipping-policy"
  | "/returns-and-exchanges"
  | "/care-and-preservation"
  | "/contact"

interface PolicyViewProps {
  route: string
}

export default function PolicyView({ route }: PolicyViewProps) {
  const { navigateTo } = useApp()

  const policyNavigation = [
    { path: "/privacy-policy", label: "Privacy Policy" },
    { path: "/terms-of-service", label: "Terms of Service" },
    { path: "/shipping-policy", label: "Shipping Policy" },
    { path: "/returns-and-exchanges", label: "Returns & Exchanges" },
    { path: "/care-and-preservation", label: "Care & Preservation" },
    { path: "/contact", label: "Atelier & Contact" },
  ]

  const renderNotice = (topic: string) => (
    <div
      style={{
        backgroundColor: "rgba(197, 162, 101, 0.12)",
        border: "1.5px solid var(--color-gold)",
        borderRadius: "var(--radius-sm)",
        padding: "16px 20px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <span style={{ color: "var(--color-burgundy)", fontSize: "16px", marginTop: "2px" }}>⚠</span>
      <div style={{ fontSize: "12px", lineHeight: "1.7", color: "var(--color-burgundy)" }}>
        <strong style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Legal & Business Review Status: Unapproved Draft Policy (Pending Corporate Confirmation) —
        </strong>{" "}
        This document represents an unapproved internal draft of the {topic} prepared for technical compliance and client review.
        Commercial terms (including return/exchange timeframes, express dispatch guarantees, transit insurance) and statutory corporate details remain unconfirmed and are not legally binding until formal executive sign-off prior to commercial activation.
      </div>
    </div>
  )

  const renderContent = () => {
    switch (route) {
      case "/privacy-policy":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Governance & Client Trust
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Privacy Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Effective Date: November 2026 · Version 1.0 (Draft for Corporate Review)
              </p>
            </div>

            {renderNotice("Privacy & Data Protection Policy")}

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                1. Atelier Commitment to Discretion
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                WAAK Occasionwear (&ldquo;WAAK&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Atelier&rdquo;) values the privacy and personal confidence of our patrons. This policy details how we collect, safeguard, and process personal information acquired through our digital boutique, private consultation services, and bespoke fittings.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                2. Information Entrusted to Us
              </h2>
              <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                <li><strong>Patron Identification:</strong> Name, honorific, email address, telephonic coordinates, and shipping/billing destinations.</li>
                <li><strong>Bespoke Sizing & Sartorial Data:</strong> Exact measurement profiles (chest, waist, hip, shoulder, sleeve, and posture specifics) provided during bespoke consultations or online order customisation.</li>
                <li><strong>Transaction Coordinates:</strong> Secure tokenized identifiers generated via PCI-DSS Level 1 compliant payment gateways (e.g. Razorpay sandbox / production). WAAK does not store full credit card credentials on local or cloud servers.</li>
                <li><strong>Technical Telemetry:</strong> Anonymized interaction telemetry, device identifiers, and session cookies utilized strictly to preserve cart continuity and authentication security.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                3. Purpose of Processing
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                Information collected is deployed exclusively to:
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                <li>Execute handcrafting, tailoring, and dispatch of bespoke occasionwear ensembles.</li>
                <li>Verify fraud-free payment clearances via verified payment intermediaries.</li>
                <li>Deliver discrete curation updates and seasonal drop invitations when explicitly subscribed to our newsletter.</li>
                <li>Facilitate return, alteration, or archival repair requests.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                4. Data Sovereignty & Third-Party Disclosure
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                WAAK does not sell, rent, or trade patron databases. Data is shared solely with vetted operational partners essential to fulfillment: insured domestic courier carriers (e.g. Blue Dart, Delhivery), payment processing infrastructure (Razorpay), and transactional communication relays. All partners are bound by strict non-disclosure obligations.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                5. Patron Rights & Contact
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                Patrons retain the right to inspect, rectify, or request erasure of their measurement and account profile. For inquiries regarding data protection, direct correspondence to <span style={{ fontFamily: "monospace", color: "var(--color-burgundy)" }}>privacy@waak.co.in</span> or our Flagship Atelier, New Delhi.
              </p>
            </section>
          </article>
        )

      case "/terms-of-service":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Boutique Agreement
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Terms of Service
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Effective Date: November 2026 · Version 1.0 (Draft for Corporate Review)
              </p>
            </div>

            {renderNotice("Terms of Service")}

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                By accessing WAAK (&ldquo;waak.co.in&rdquo;) or placing an order through our digital platform or client concierge, you agree to be bound by these Terms of Service. If you do not accept these terms in full, please refrain from transacting on this platform.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                2. Artisan Handcraft & Textile Character
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                WAAK occasionwear pieces utilize pure silks, Banarasi brocades, hand-spun raw silk, and artisanal hand embroidery (including Zardozi, Aari, and threadwork).
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                <li>Subtle variations in weave, slub texture, dye hue, and metallic thread luster are intrinsic characteristics of natural fibers and authentic handloom weaving, not manufacturing defects.</li>
                <li>Digital screen resolutions and device color calibrations may produce minor perceptual variances between rendered photography and physical textiles.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                3. Order Acceptance & Atelier Capacity
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                Receipt of an electronic order confirmation constitutes an acknowledgment of order submission, not a final contract of sale. WAAK reserves the right to decline or cancel orders in cases of unserviceable delivery locations, artisan loom bottlenecks, or technical pricing discrepancies. In any such rare event, the patron will receive a full, immediate refund.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                4. Intellectual Property
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                All garment silhouettes, bespoke embroidery motifs, visual assets, lookbook imagery, brand hallmarks, and typography layouts are the proprietary intellectual property of WAAK. Unauthorized commercial reproduction, alteration, or distribution is strictly prohibited.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                5. Jurisdiction & Statutory Compliance
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                These terms are governed by the laws of India. Any disputes arising in connection with orders or digital platform interactions shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
              </p>
            </section>
          </article>
        )

      case "/shipping-policy":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Delivery & Transit
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Shipping & Transit Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Effective Date: November 2026 · Version 1.0 (Draft for Carrier & Logistics Confirmation)
              </p>
            </div>

            {renderNotice("Logistics & Transit Policy")}

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                1. Dedicated Courier Partners & Transit Insurance
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                All WAAK ceremonial pieces are dispatched in tamper-evident, bespoke luxury presentation packaging and transported via premium express air logistics partners (e.g. Blue Dart Express, Delhivery Air). Shipments are fully insured against loss or transit damage from our New Delhi atelier until signature upon physical delivery.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                2. Postal PIN Code Serviceability Notice
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                Our storefront provides an automated Indian postal index number (PIN) checker. Please note:
              </p>
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  borderLeft: "3px solid var(--color-gold)",
                  padding: "14px 18px",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  color: "var(--color-charcoal)",
                  marginBottom: "12px"
                }}
              >
                <strong>Format vs. Real-Time Serviceability:</strong> The storefront PIN tool verifies that the entered postal code satisfies the official 6-digit Indian Postal Code specification. Actual courier serviceability and express transit windows are determined during checkout against active logistics carrier coverage tables. If a PIN is classified as remote or Non-Serviceable (ODA), our concierge will contact the patron within 24 business hours to arrange specialized courier routing.
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                3. Tailoring & Fulfillment Timelines
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left", marginBottom: "16px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-gold)", color: "var(--color-burgundy)" }}>
                      <th style={{ padding: "10px 12px" }}>Garment Classification</th>
                      <th style={{ padding: "10px 12px" }}>Atelier Preparation</th>
                      <th style={{ padding: "10px 12px" }}>Transit Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "10px 12px" }}><strong>Ready-to-Wear Standard (Kurta Sets, Waistcoats)</strong></td>
                      <td style={{ padding: "10px 12px" }}>2–4 business days</td>
                      <td style={{ padding: "10px 12px" }}>2–4 business days (Metro) / 4–6 days (Rest of India)</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "10px 12px" }}><strong>Bespoke & Made-to-Measure (Sherwanis, Tuxedos)</strong></td>
                      <td style={{ padding: "10px 12px" }}>10–14 artisan days</td>
                      <td style={{ padding: "10px 12px" }}>2–3 business days express insured air transit</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 12px" }}><strong>Bridal Party Multi-Piece Commissions</strong></td>
                      <td style={{ padding: "10px 12px" }}>Per consultation calendar</td>
                      <td style={{ padding: "10px 12px" }}>Dedicated white-glove courier arrangement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                4. Complimentary Express Shipping Threshold
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                Complimentary insured express transit is currently provided on all domestic orders across India as part of our introductory seasonal service. International shipping arrangements for global wedding parties may be coordinated directly with our concierge desk.
              </p>
            </section>
          </article>
        )

      case "/returns-and-exchanges":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Atelier Guarantee
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Returns, Exchanges & Alteration Policy
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Effective Date: November 2026 · Version 1.0 (Draft for Business Terms Review)
              </p>
            </div>

            {renderNotice("Returns, Cancellations & Alteration Policy")}

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                1. Seven-Day Exchange & Alteration Window
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                To ensure complete sartorial satisfaction for your wedding or ceremonial occasion, WAAK offers an exchange and complimentary alteration window of seven (7) calendar days from the date of confirmed delivery.
              </p>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                2. Standard Sizing vs. Custom Tailored Ensembles
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--radius-sm)", padding: "16px", backgroundColor: "#fff" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-burgundy)", marginBottom: "8px" }}>
                    Standard Catalog Sizes (38, 40, 42, 44)
                  </h3>
                  <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                    Eligible for size exchange or store credit within 7 days, provided the garment is unworn, unwashed, unaltered, and retained in original packaging with all security tags intact.
                  </p>
                </div>
                <div style={{ border: "1px solid rgba(197, 162, 101, 0.3)", borderRadius: "var(--radius-sm)", padding: "16px", backgroundColor: "rgba(197, 162, 101, 0.04)" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-burgundy)", marginBottom: "8px" }}>
                    Bespoke & Altered Ensembles
                  </h3>
                  <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                    Garments customized to specific anatomical measurements or personalized monogramming are crafted solely for the patron. While ineligible for cash refunds, WAAK provides complimentary master tailoring adjustment until perfect fit is achieved.
                  </p>
                </div>
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                3. Quality Verification & Reverse Transit
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                To initiate an exchange, contact <span style={{ fontFamily: "monospace", color: "var(--color-burgundy)" }}>concierge@waak.co.in</span> with your Order ID and photograph of the garment. Our concierge arranges complimentary reverse courier pickup from your address. Returned pieces undergo rigorous inspection by our quality master before replacement dispatch or credit authorization.
              </p>
            </section>
          </article>
        )

      case "/care-and-preservation":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Occasionwear Longevity
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Care & Garment Preservation Guide
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Curated by WAAK Master Artisans & Weavers
              </p>
            </div>

            {renderNotice("Garment Care & Fabric Preservation Guidelines")}

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                1. Raw Silk, Banarasi Weaves & Velvet
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)", marginBottom: "12px" }}>
                WAAK ceremonial garments are investment pieces designed to endure across generations. To preserve fiber tension and natural sheen:
              </p>
              <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                <li><strong>Professional Dry Cleaning Only:</strong> Never machine wash or hand immerse silk or velvet silhouettes in water. Entrust garments strictly to premium dry cleaners experienced with bridal textiles.</li>
                <li><strong>Perfume & Botanical Mists:</strong> Apply fine fragrances, colognes, and attars directly to the skin and permit them to dry completely prior to donning the ensemble. Direct alcohol spray can spot delicate silk and tarnish metallic Zari.</li>
                <li><strong>Steam vs. Ironing:</strong> Use gentle vertical garment steaming on the reverse face. Avoid direct hot flatiron contact with brocade surfaces or velvet pile.</li>
              </ul>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                2. Zardozi, Aari & Metallic Embroidery Preservation
              </h2>
              <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                <li><strong>Protective Muslin Wrap:</strong> Store embroidered sherwanis wrapped in pure unbleached cotton muslin. Avoid synthetic plastic polybags, which trap moisture and induce micro-tarnish in genuine gold/silver threadwork.</li>
                <li><strong>Cedar Repellents:</strong> Use natural aromatic cedar wood blocks or dried neem sachets in your wardrobe rather than chemical naphthalene balls.</li>
                <li><strong>Contoured Hangers:</strong> Always suspend sherwanis and jackets on wide-shoulder contoured wooden hangers to preserve shoulder pad architecture and breastplate roll.</li>
              </ul>
            </section>
          </article>
        )

      case "/contact":
        return (
          <article>
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "var(--color-gold)", textTransform: "uppercase" }}>
                Client Concierge
              </span>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", color: "var(--color-burgundy)", marginTop: "6px" }}>
                Flagship Atelier & Client Services
              </h1>
              <p style={{ fontSize: "13px", color: "var(--color-charcoal-muted)", marginTop: "4px" }}>
                Private Bridal & Groom Appointments
              </p>
            </div>

            {renderNotice("Atelier Operating Coordinates")}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              <div style={{ border: "1px solid rgba(197, 162, 101, 0.3)", borderRadius: "var(--radius-sm)", padding: "24px", backgroundColor: "#fff" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                  Flagship Atelier
                </h2>
                <div style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                  <p style={{ marginBottom: "8px" }}>
                    <strong>WAAK Occasionwear Flagship</strong><br />
                    Mehrauli Heritage Couture District<br />
                    New Delhi, 110030 · India
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-charcoal-muted)", fontStyle: "italic" }}>
                    (Physical bridal salon viewings strictly by prior appointment)
                  </p>
                </div>
              </div>

              <div style={{ border: "1px solid rgba(197, 162, 101, 0.3)", borderRadius: "var(--radius-sm)", padding: "24px", backgroundColor: "#fff" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-burgundy)", marginBottom: "12px" }}>
                  Digital Concierge Desks
                </h2>
                <div style={{ fontSize: "13px", lineHeight: "1.8", color: "var(--color-charcoal)" }}>
                  <p style={{ marginBottom: "6px" }}>
                    <strong>Bespoke Styling Consultations:</strong><br />
                    <span style={{ color: "var(--color-burgundy)" }}>concierge@waak.co.in</span>
                  </p>
                  <p style={{ marginBottom: "6px" }}>
                    <strong>Order Status & Dispatch Inquiries:</strong><br />
                    <span style={{ color: "var(--color-burgundy)" }}>orders@waak.co.in</span>
                  </p>
                  <p style={{ marginBottom: "6px" }}>
                    <strong>Corporate & Press Relations:</strong><br />
                    <span style={{ color: "var(--color-burgundy)" }}>press@waak.co.in</span>
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-charcoal-muted)", marginTop: "8px" }}>
                    Direct WhatsApp & Telephonic Line: Dedicated line allocation pending commercial carrier provisioning.
                  </p>
                </div>
              </div>
            </div>

            <section style={{ backgroundColor: "rgba(90, 18, 26, 0.03)", padding: "24px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(90, 18, 26, 0.1)" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-burgundy)", marginBottom: "8px" }}>
                Atelier Hours
              </h2>
              <p style={{ fontSize: "13px", lineHeight: "1.7", color: "var(--color-charcoal)" }}>
                Monday through Saturday: 11:00 AM – 7:30 PM IST<br />
                Sunday: Closed for artisan handcraft & loom maintenance.<br />
                Private evening styling appointments accommodated upon request.
              </p>
            </section>
          </article>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ backgroundColor: "var(--color-cream-light, #FAF7F2)", minHeight: "80vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "28px", fontSize: "12px", color: "var(--color-charcoal-muted)" }}>
          <button
            onClick={() => navigateTo("/")}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
            className="editorial-underline"
          >
            Home
          </button>
          <span style={{ margin: "0 8px", color: "var(--color-gold)" }}>/</span>
          <span style={{ color: "var(--color-burgundy)", fontWeight: 500 }}>
            {policyNavigation.find((p) => p.path === route)?.label || "Policy"}
          </span>
        </nav>

        {/* Layout Grid: Sidebar Navigation + Main Policy Content */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr)) 3fr", gap: "40px" }}>
          {/* Quick Policy Navigation Sidebar */}
          <aside aria-label="Policy Navigation" style={{ alignSelf: "start" }}>
            <div
              style={{
                backgroundColor: "#fff",
                border: "1px solid rgba(197, 162, 101, 0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "20px",
                position: "sticky",
                top: "100px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--color-burgundy)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid rgba(197, 162, 101, 0.2)",
                }}
              >
                Legal & Atelier Information
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {policyNavigation.map((item) => {
                  const isActive = item.path === route
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => navigateTo(item.path)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "13px",
                          fontWeight: isActive ? 600 : 400,
                          backgroundColor: isActive ? "rgba(90, 18, 26, 0.08)" : "transparent",
                          color: isActive ? "var(--color-burgundy)" : "var(--color-charcoal)",
                          border: "none",
                          borderLeft: isActive ? "3px solid var(--color-gold)" : "3px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <button
                  onClick={() => navigateTo("/")}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "var(--color-burgundy)",
                    color: "var(--color-cream)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                  }}
                >
                  ← Return to Boutique
                </button>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main
            style={{
              backgroundColor: "#fff",
              border: "1px solid rgba(197, 162, 101, 0.2)",
              borderRadius: "var(--radius-sm)",
              padding: "40px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            }}
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}
