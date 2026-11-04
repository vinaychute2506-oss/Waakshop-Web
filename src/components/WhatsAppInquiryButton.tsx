import React from 'react';

export interface WhatsAppInquiryProps {
  productName?: string;
  productId?: string;
  variantSize?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * WhatsAppInquiryButton
 * 
 * Safety & Privacy Rules:
 * 1. Reads official business number from environment (VITE_WHATSAPP_NUMBER).
 * 2. If the number is unset or empty, renders NULL (zero DOM footprint).
 * 3. Never includes customer PII (names, passwords, addresses, cards, tokens).
 * 4. Generates a standard non-sensitive inquiry template with product name/ID.
 * 5. Uses safe external anchor behavior (target="_blank", rel="noopener noreferrer").
 */
export default function WhatsAppInquiryButton({
  productName,
  productId,
  variantSize,
  className = '',
  style = {},
}: WhatsAppInquiryProps) {
  // Read configured business number; strip any non-digit characters
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  const cleanNumber = rawNumber.replace(/\D/g, '');

  // Guard: If no valid business number is configured, completely hide the button
  if (!cleanNumber) {
    return null;
  }

  // Construct safe, non-sensitive inquiry message template
  const productLabel = productName || 'WAAK Occasionwear';
  const refLabel = productId ? ` (Ref: ${productId}${variantSize ? `, Size: ${variantSize}` : ''})` : '';
  const message = `Hello WAAK Atelier, I would like to inquire about ${productLabel}${refLabel}.`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`waak-whatsapp-inquiry-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 18px',
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-sm, 4px)',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        minHeight: '44px',
        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        ...style,
      }}
      aria-label={`Inquire about ${productLabel} on WhatsApp`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.214 8.214 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.43c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
      </svg>
      <span>Inquire on WhatsApp</span>
    </a>
  );
}
