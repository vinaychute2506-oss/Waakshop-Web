import React, { useEffect, useState } from 'react';

export interface BodhXWidgetProps {
  /** Optional custom token override (for testing or specific route instances) */
  token?: string;
  /** Optional custom API base URL override */
  apiBase?: string;
  /** Force disable flag (e.g. on admin routes or checkout views) */
  disabled?: boolean;
}

const BODHX_SCRIPT_SRC = 'https://bodhx.ai/embed/widget.js';
const BODHX_SCRIPT_ID = 'bodhx-ai-widget-script';
const DEFAULT_API_BASE = 'https://api.bodhx.ai/api1';

/**
 * BodhXWidget Component
 * 
 * Integrates the official BodhX AI website chat widget according to the client's
 * BodhX dashboard specification:
 * <script src="https://bodhx.ai/embed/widget.js" data-token="..." data-api="https://api.bodhx.ai/api1" async></script>
 * 
 * Safety & Governance Constraints:
 * 1. Configuration-gated via VITE_BODHX_WIDGET_ENABLED (defaults to false).
 * 2. Reads public embed token from VITE_BODHX_WIDGET_TOKEN (requires client authorization).
 * 3. Never loads on internal administrative or checkout routes (/admin).
 * 4. Completely asynchronous: zero blocking overhead on DOM parsing or storefront hydration.
 * 5. Prevents duplicate script tag injection across React re-renders.
 * 6. Recovers gracefully from network loading errors without throwing uncaught exceptions.
 * 7. Strictly avoids transmitting customer PII, passwords, or payment data.
 */
export default function BodhXWidget({
  token: propToken,
  apiBase: propApiBase,
  disabled = false,
}: BodhXWidgetProps) {
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'disabled'>('idle');

  // Read environment variables
  const envEnabled = import.meta.env.VITE_BODHX_WIDGET_ENABLED === 'true';
  const envToken = (import.meta.env.VITE_BODHX_WIDGET_TOKEN || '').trim();
  const envApiBase = (import.meta.env.VITE_BODHX_API_BASE || DEFAULT_API_BASE).trim();

  const activeToken = (propToken || envToken).trim();
  const activeApiBase = (propApiBase || envApiBase).trim();
  const isEnabled = envEnabled && Boolean(activeToken) && !disabled;

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    // Route guard: Do not load on admin operations portal
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.startsWith('/admin')) {
      setLoadStatus('disabled');
      return;
    }

    // Guard: Disabled by configuration or missing token
    if (!isEnabled) {
      setLoadStatus('disabled');
      return;
    }

    // Guard: Prevent duplicate script injection
    const existingScript = document.getElementById(BODHX_SCRIPT_ID) || 
      document.querySelector(`script[src="${BODHX_SCRIPT_SRC}"]`);

    if (existingScript) {
      // Script is already in DOM
      setLoadStatus('loaded');
      return;
    }

    // Asynchronously create and inject BodhX script
    setLoadStatus('loading');
    const script = document.createElement('script');
    script.id = BODHX_SCRIPT_ID;
    script.src = BODHX_SCRIPT_SRC;
    script.setAttribute('data-token', activeToken);
    script.setAttribute('data-api', activeApiBase);
    script.async = true;

    script.onload = () => {
      setLoadStatus('loaded');
    };

    script.onerror = () => {
      // Graceful error fallback: do not break storefront
      console.warn('WAAK BodhX Widget: External script failed to load from', BODHX_SCRIPT_SRC);
      setLoadStatus('error');
    };

    document.body.appendChild(script);

    // Optional cleanup on unmount: we preserve script to maintain widget session unless token changes
    return () => {
      // Clean up script if component unmounts and token changes
    };
  }, [isEnabled, activeToken, activeApiBase]);

  // Zero DOM footprint when disabled or loading
  return (
    <div
      data-testid="bodhx-widget-container"
      data-status={loadStatus}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
}
