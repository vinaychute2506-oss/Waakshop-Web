/**
 * WAAK Occasionwear — Centralized Client & Storefront Configuration
 * 
 * Stores authorized brand parameters, client-confirmed contact coordinates,
 * and environment bindings.
 */

export const WAAK_CONFIG = {
  // WhatsApp Business Concierge
  whatsapp: {
    // E.164 normalized digits only
    number: (import.meta.env.VITE_WHATSAPP_NUMBER || '919821707031').replace(/[^0-9]/g, ''),
    display: '+91 98217 07031',
    hours: '10:30 AM – 7:30 PM IST (Mon–Sat)',
    getUrl(message?: string): string {
      const num = this.number;
      if (!num) return '';
      return message
        ? `https://wa.me/${num}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${num}`;
    },
  },

  // Official Business Coordinates (Client-Confirmed)
  business: {
    legalName: 'ENGLISH CHANNEL COMPANY',
    tradeName: 'WAAK Occasionwear',
    registeredAddress: '37, Furniture Market, Gandhi Nagar, Delhi – 110033',
    gstin: '07AAGFE4560K1ZA',
    conciergeEmail: 'concierge@waak.co.in',
    ordersEmail: 'orders@waak.co.in',
    privacyEmail: 'privacy@waak.co.in',
    atelierHours: 'Monday through Saturday: 11:00 AM – 7:30 PM IST',
  },

  // Catalog Sizing Specification
  sizing: {
    authorizedSizes: ['36', '38', '40', '42', '44'] as const,
    defaultSize: '40',
  },
} as const;
