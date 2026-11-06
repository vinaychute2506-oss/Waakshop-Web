import React, { useState } from 'react';

export default function AiAssistantSection() {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const isWidgetEnabled = import.meta.env.VITE_BODHX_WIDGET_ENABLED === 'true';
  const hasToken = Boolean(import.meta.env.VITE_BODHX_WIDGET_TOKEN);

  const handleOpenAssistant = () => {
    // If BodhX widget is loaded on window, trigger its open method if exposed
    const win = window as any;
    if (win.bodhx && typeof win.bodhx.open === 'function') {
      win.bodhx.open();
      return;
    }
    // Otherwise show informative status preview dialog
    setShowStatusModal(true);
  };

  const capabilities = [
    {
      title: "Product Discovery",
      desc: "Explore handcrafted sherwanis, bandhgalas, tuxedos, and silk kurtas tailored to your aesthetic.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      title: "Sizing & Fit Guidance",
      desc: "Understand size dimensions, chest measurements, and bespoke tailoring considerations.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      title: "Occasion Recommendations",
      desc: "Receive curated suggestions for Weddings, Receptions, Sangeet galas, and festive ceremonies.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      title: "Direct Silhouette Navigation",
      desc: "Jump straight to matching product detail pages and inspect embroidery craftsmanship.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      ),
    },
    {
      title: "Atelier Information",
      desc: "Learn about pure Banarasi fabrics, dry-cleaning requirements, and dispatch timelines.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
    {
      title: "Human Concierge Escalation",
      desc: "Seamlessly transition complex bespoke questions to our dedicated atelier team via WhatsApp.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="ai-assistant-section"
      className="waak-ai-assistant-section"
      style={{
        backgroundColor: '#1E0B0E',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(197, 162, 101, 0.12) 0%, transparent 70%)',
        borderTop: '1px solid rgba(197, 162, 101, 0.3)',
        borderBottom: '1px solid rgba(197, 162, 101, 0.3)',
        padding: '72px 24px',
        color: '#F4EFE6',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="WAAK AI Shopping Assistant"
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        {/* Subtle Luxury Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '24px',
            backgroundColor: 'rgba(197, 162, 101, 0.12)',
            border: '1px solid rgba(197, 162, 101, 0.4)',
            color: '#C5A265',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C5A265' }} />
          BodhX AI Shopping Intelligence
        </div>

        {/* Section Heading */}
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(26px, 3.5vw, 38px)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#F4EFE6',
            margin: '0 0 16px',
          }}
        >
          Your Personal WAAK Shopping Assistant
        </h2>

        {/* Section Description */}
        <p
          style={{
            color: 'rgba(244, 239, 230, 0.82)',
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            maxWidth: '680px',
            margin: '0 auto 40px',
            lineHeight: 1.65,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Discover occasionwear, explore product details and get assistance finding the right outfit with our AI-powered shopping assistant.
        </p>

        {/* 6 Capabilities Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            textAlign: 'left',
            marginBottom: '44px',
          }}
        >
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(42, 8, 13, 0.65)',
                border: '1px solid rgba(197, 162, 101, 0.22)',
                borderRadius: '8px',
                padding: '24px 20px',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  color: '#C5A265',
                  marginBottom: '14px',
                  display: 'inline-flex',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(197, 162, 101, 0.1)',
                }}
              >
                {cap.icon}
              </div>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: '#F4EFE6',
                  margin: '0 0 8px',
                }}
              >
                {cap.title}
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(244, 239, 230, 0.72)',
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {cap.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAssistant}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#C5A265',
              color: '#1E0B0E',
              border: 'none',
              borderRadius: '4px',
              padding: '14px 28px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 6px 20px rgba(197, 162, 101, 0.25)',
            }}
            aria-label="Open WAAK AI Shopping Assistant"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            Chat with AI Assistant
          </button>
        </div>

        {/* Commercial & Privacy Transparency Note */}
        <p
          style={{
            marginTop: '28px',
            fontSize: '11px',
            color: 'rgba(244, 239, 230, 0.55)',
            lineHeight: 1.5,
            maxWidth: '640px',
            margin: '28px auto 0',
          }}
        >
          Curated guidance powered by BodhX AI. Sizing recommendations are advisory. Secure transactions, verified inventory reservation, and payment processing are fulfilled through WAAK’s verified staging checkout.
        </p>
      </div>

      {/* Preview / Staging Status Modal */}
      {showStatusModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowStatusModal(false)}
        >
          <div
            style={{
              backgroundColor: '#2A080D',
              border: '1px solid #C5A265',
              borderRadius: '8px',
              maxWidth: '460px',
              width: '100%',
              padding: '32px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 162, 101, 0.15)',
                color: '#C5A265',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '20px',
                color: '#C5A265',
                marginBottom: '12px',
              }}
            >
              AI Assistant Staging Preview
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#F4EFE6',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              {isWidgetEnabled && hasToken
                ? "The BodhX AI chat bubble is active in the bottom right corner of your screen. Click the bubble to start a conversation!"
                : "The BodhX chat widget integration is configured in staging mode awaiting client token regeneration and business approval. For immediate assistance, connect with our human concierge."}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(197, 162, 101, 0.4)',
                  color: '#F4EFE6',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
