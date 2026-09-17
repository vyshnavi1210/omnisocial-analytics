import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { AdapterFactory } from '../adapters/adapterFactory.js';

const router = Router();

// Get all platform accounts
router.get('/', authenticateJWT, (req: AuthRequest, res: Response): void => {
  const platforms = db.getPlatforms();
  res.json({ platforms });
});

// Update platform settings / credentials (Admin only)
router.put('/:platform', authenticateJWT, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform } = req.params;
  const { apiKey, apiSecret, accessToken, isSimulated, handle, name } = req.body;

  const existing = db.getPlatform(platform);
  if (!existing) {
    res.status(404).json({ error: `Platform ${platform} not found` });
    return;
  }

  const updated = db.updatePlatform(platform, {
    apiKey: apiKey !== undefined ? apiKey : existing.apiKey,
    apiSecret: apiSecret !== undefined ? apiSecret : existing.apiSecret,
    accessToken: accessToken !== undefined ? accessToken : existing.accessToken,
    isSimulated: isSimulated !== undefined ? isSimulated : existing.isSimulated,
    handle: handle || existing.handle,
    name: name || existing.name,
    isConnected: true
  });

  db.addAuditLog({
    id: `aud_${Date.now()}`,
    userId: req.user!.id,
    userName: req.user!.name,
    action: 'PLATFORM_UPDATED',
    details: `Updated settings for ${platform}. Simulated mode: ${updated?.isSimulated}`,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `Platform ${platform} updated successfully`, platform: updated });
});

// Test API connection
router.post('/:platform/test', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform } = req.params;
  const account = db.getPlatform(platform);

  if (!account) {
    res.status(404).json({ error: `Platform ${platform} not found` });
    return;
  }

  const adapter = AdapterFactory.getAdapter(account);
  const result = await adapter.testConnection();

  res.json({
    platform,
    success: result.success,
    message: result.message
  });
});

// Manual Sync Platform
router.post('/:platform/sync', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform } = req.params;
  const account = db.getPlatform(platform);

  if (!account) {
    res.status(404).json({ error: `Platform ${platform} not found` });
    return;
  }

  const adapter = AdapterFactory.getAdapter(account);
  const profile = await adapter.fetchProfile();
  const metrics = await adapter.fetchLatestMetrics();

  const updated = db.updatePlatform(platform, {
    followersCount: profile.followersCount,
    postsCount: profile.postsCount,
    engagementRate: metrics.engagementRate,
    impressions30d: metrics.impressions,
    reach30d: metrics.reach
  });

  res.json({
    message: `Successfully synchronized ${account.name}`,
    platform: updated
  });
});

export default router;
