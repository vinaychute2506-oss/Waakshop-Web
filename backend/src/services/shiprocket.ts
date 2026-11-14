/**
 * WAAK Occasionwear — Shiprocket Carrier Integration Service
 * 
 * Safety & Privacy Boundaries:
 * 1. Authenticates securely server-side using SHIPROCKET_EMAIL & SHIPROCKET_PASSWORD.
 * 2. Never exposes credentials to client-side bundles or frontend JavaScript.
 * 3. Enforces courier partner anonymity: All internal carrier names (e.g. Blue Dart, Delhivery)
 *    are stripped before sending response to client; branded as "Express Insured Atelier Delivery".
 * 4. In-memory token caching with auto-refresh prevents redundant auth roundtrips.
 * 5. Pincode result caching reduces outbound carrier API consumption.
 * 6. Graceful unconfigured staging fallback when credentials are not yet supplied by client.
 */

export interface ServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  city?: string;
  state?: string;
  estimated_delivery_days: string | number;
  estimated_delivery_date?: string;
  shipping_tier: string;
  shipping_fee: number;
  isComplimentary: boolean;
  isStagingFallback?: boolean;
  notice?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;
const pincodeCache = new Map<string, { result: ServiceabilityResult; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export class ShiprocketService {
  private static getApiBase(): string {
    return process.env.SHIPROCKET_API_BASE || 'https://apiv2.shiprocket.in/v1/external';
  }

  private static getPickupPincode(): string {
    // English Channel Company registered warehouse coordinates in Gandhi Nagar, Delhi
    return process.env.SHIPROCKET_PICKUP_PINCODE || '110033';
  }

  /**
   * Retrieves a valid Shiprocket JWT authentication token.
   * Caches token in-memory for up to 9 days (Shiprocket tokens expire in 10 days).
   */
  public static async getAuthToken(): Promise<string | null> {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      return null;
    }

    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt > now) {
      return tokenCache.token;
    }

    try {
      const response = await fetch(`${this.getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error(`Shiprocket auth failed with status ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      if (data && data.token) {
        // Cache token for 9 days (9 * 24 * 60 * 60 * 1000 ms)
        tokenCache = {
          token: data.token,
          expiresAt: now + 9 * 24 * 60 * 60 * 1000,
        };
        return data.token;
      }
      return null;
    } catch (err: any) {
      console.error('Shiprocket auth network error:', err.message);
      return null;
    }
  }

  /**
   * Checks PIN code serviceability and estimated delivery schedule.
   * Strips all internal courier partner names to maintain luxury WAAK branding.
   */
  public static async checkPincodeServiceability(
    deliveryPincode: string,
    weightKg: number = 1.5
  ): Promise<ServiceabilityResult> {
    const cleaned = String(deliveryPincode || '').trim();

    // Validate 6-digit Indian PIN
    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      throw new Error('Invalid PIN code. Please enter a valid 6-digit Indian postal code.');
    }

    // Check cache
    const now = Date.now();
    const cached = pincodeCache.get(cleaned);
    if (cached && cached.expiresAt > now) {
      return cached.result;
    }

    const token = await this.getAuthToken();

    // Fallback mode if credentials are unconfigured on staging
    if (!token) {
      const fallbackResult: ServiceabilityResult = {
        serviceable: true,
        pincode: cleaned,
        city: this.deriveApproximateRegion(cleaned),
        state: 'India',
        estimated_delivery_days: cleaned.startsWith('11') ? '2–3 business days' : '3–5 business days',
        estimated_delivery_date: cleaned.startsWith('11') ? 'Express Delhi NCR Dispatch' : 'Standard Insured Dispatch',
        shipping_tier: 'Express Insured Atelier Delivery',
        shipping_fee: 0,
        isComplimentary: true,
        isStagingFallback: true,
        notice: 'Shiprocket API credentials pending client configuration; estimated delivery displayed based on regional postal dispatch windows.',
      };

      pincodeCache.set(cleaned, { result: fallbackResult, expiresAt: now + CACHE_TTL_MS });
      return fallbackResult;
    }

    // Live Shiprocket API Call
    try {
      const pickupPincode = this.getPickupPincode();
      const url = `${this.getApiBase()}/courier/serviceability/?pickup_postcode=${encodeURIComponent(
        pickupPincode
      )}&delivery_postcode=${encodeURIComponent(cleaned)}&weight=${weightKg}&cod=0`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Carrier serviceability query returned status ${response.status}`);
      }

      const data: any = await response.json();
      const companies = data?.data?.available_courier_companies || [];

      if (!companies || companies.length === 0) {
        const unserviceableResult: ServiceabilityResult = {
          serviceable: false,
          pincode: cleaned,
          estimated_delivery_days: 'N/A',
          shipping_tier: 'Standard Delivery',
          shipping_fee: 0,
          isComplimentary: true,
          notice: 'This postal area is currently outside our express courier delivery network. Please contact our client concierge.',
        };
        pincodeCache.set(cleaned, { result: unserviceableResult, expiresAt: now + CACHE_TTL_MS });
        return unserviceableResult;
      }

      // Pick the company with the lowest estimated days or standard etd
      // CRITICAL: Strip any courier_name or partner brand identifier
      let minDays = 5;
      let targetEtd = '';
      for (const comp of companies) {
        const days = parseInt(comp.estimated_delivery_days, 10);
        if (!isNaN(days) && days < minDays && days > 0) {
          minDays = days;
          targetEtd = comp.etd || '';
        }
      }

      const liveResult: ServiceabilityResult = {
        serviceable: true,
        pincode: cleaned,
        city: data?.data?.city || this.deriveApproximateRegion(cleaned),
        state: data?.data?.state || 'India',
        estimated_delivery_days: `${minDays} business days`,
        estimated_delivery_date: targetEtd || `${minDays} business days from dispatch`,
        shipping_tier: 'Express Insured Atelier Delivery',
        shipping_fee: 0,
        isComplimentary: true,
        isStagingFallback: false,
      };

      pincodeCache.set(cleaned, { result: liveResult, expiresAt: now + CACHE_TTL_MS });
      return liveResult;
    } catch (error: any) {
      console.warn('Shiprocket API lookup failed, using reliable fallback:', error.message);
      const fallbackResult: ServiceabilityResult = {
        serviceable: true,
        pincode: cleaned,
        city: this.deriveApproximateRegion(cleaned),
        state: 'India',
        estimated_delivery_days: cleaned.startsWith('11') ? '2–3 business days' : '3–5 business days',
        estimated_delivery_date: 'Estimated 3–5 business days',
        shipping_tier: 'Express Insured Atelier Delivery',
        shipping_fee: 0,
        isComplimentary: true,
        isStagingFallback: true,
        notice: 'Live carrier query temporarily unavailable; standard insured dispatch window applied.',
      };
      return fallbackResult;
    }
  }

  /**
   * Helper to identify high-level Indian postal region for luxury feedback
   */
  private static deriveApproximateRegion(pincode: string): string {
    const firstDigit = pincode.charAt(0);
    switch (firstDigit) {
      case '1':
        return pincode.startsWith('11') ? 'Delhi NCR' : 'North India (Haryana/Punjab/HP)';
      case '2':
        return 'Uttar Pradesh / Uttarakhand';
      case '3':
        return 'West India (Gujarat/Rajasthan)';
      case '4':
        return 'Maharashtra / Goa / MP';
      case '5':
        return 'South India (Andhra/Telangana/Karnataka)';
      case '6':
        return 'South India (Tamil Nadu/Kerala)';
      case '7':
        return 'East India (West Bengal/Odisha/NE)';
      case '8':
        return 'Bihar / Jharkhand';
      default:
        return 'India';
    }
  }
}
