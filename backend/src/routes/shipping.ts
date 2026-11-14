import { Router, Request, Response } from 'express';
import { ShiprocketService } from '../services/shiprocket';
import { shippingRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /serviceability?pincode=110001
 * POST /serviceability { pincode: "110001" }
 * 
 * Checks PIN code serviceability and delivery timeline via Shiprocket API.
 * Courier partner brand name is strictly omitted from customer response.
 */
async function handleServiceabilityCheck(req: Request, res: Response): Promise<void> {
  const pincode = String(req.query.pincode || req.body?.pincode || '').trim();
  const weight = parseFloat(String(req.query.weight || req.body?.weight || '1.5'));

  if (!pincode) {
    res.status(400).json({ error: 'PIN code is required' });
    return;
  }

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    res.status(400).json({
      error: 'Invalid PIN code. Please enter a valid 6-digit Indian postal code (e.g. 110001).',
      pincode,
    });
    return;
  }

  try {
    const result = await ShiprocketService.checkPincodeServiceability(pincode, isNaN(weight) ? 1.5 : weight);
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Shipping serviceability error:', err.message);
    res.status(500).json({
      error: err.message || 'Unable to verify postal serviceability at this moment.',
      pincode,
    });
  }
}

router.get('/serviceability', shippingRateLimiter, handleServiceabilityCheck);
router.post('/serviceability', shippingRateLimiter, handleServiceabilityCheck);

/**
 * GET /status
 * Internal integration diagnostics (indicates whether Shiprocket credentials are active)
 */
router.get('/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
  res.json({
    integration: 'Shiprocket Carrier Integration',
    status: isConfigured ? 'configured' : 'pending_credentials',
    pickup_pincode: process.env.SHIPROCKET_PICKUP_PINCODE || '110033 (Default: Gandhi Nagar, Delhi)',
    api_base: process.env.SHIPROCKET_API_BASE || 'https://apiv2.shiprocket.in/v1/external',
    courier_masking: 'active (internal partner names hidden from customer payload)',
  });
});

export default router;
