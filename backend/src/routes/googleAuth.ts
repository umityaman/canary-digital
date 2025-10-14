import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getAuthUrl, getTokenFromCode, revokeToken } from '../services/oauth';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Middleware to authenticate user
 */
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // TODO: Verify JWT token and extract user ID
  // For now, we'll use a simplified approach
  req.user = { id: 1 }; // Replace with actual JWT verification
  next();
};

/**
 * GET /api/auth/google
 * Generate Google OAuth authorization URL
 */
router.get('/google', authenticateToken, (req, res) => {
  try {
    const authUrl = getAuthUrl();
    
    // Store state in session or database to verify callback
    const state = Math.random().toString(36).substring(7);
    
    // In production, store state in Redis or database
    // For now, we'll just return the URL
    
    res.json({
      authUrl: authUrl + `&state=${state}`,
      state
    });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?error=${error}`);
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for tokens
    const tokens = await getTokenFromCode(code as string);

    // TODO: Get user ID from state or session
    // For now, we'll use a hardcoded user ID
    const userId = 1;

    // Save tokens to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date 
          ? new Date(tokens.expiry_date) 
          : null,
        googleCalendarId: 'primary',
        googleCalendarEnabled: true
      }
    });

    // Redirect to frontend settings page with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?calendar=connected`);
  } catch (error: any) {
    console.error('Error handling OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/settings?error=callback_failed`);
  }
});

/**
 * GET /api/auth/google/status
 * Check if user has connected Google Calendar
 */
router.get('/google/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleCalendarEnabled: true,
        googleCalendarId: true,
        googleTokenExpiry: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isConnected = user.googleCalendarEnabled;
    const isExpired = user.googleTokenExpiry 
      ? new Date() > user.googleTokenExpiry 
      : false;

    res.json({
      connected: isConnected && !isExpired,
      calendarId: user.googleCalendarId,
      tokenExpiry: user.googleTokenExpiry,
      needsReconnect: isExpired
    });
  } catch (error: any) {
    console.error('Error checking Google Calendar status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

/**
 * POST /api/auth/google/disconnect
 * Disconnect Google Calendar
 */
router.post('/google/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleAccessToken: true }
    });

    if (!user?.googleAccessToken) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    // Revoke token
    try {
      await revokeToken(user.googleAccessToken);
    } catch (error) {
      console.error('Error revoking token:', error);
      // Continue anyway to clear from database
    }

    // Clear tokens from database
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarId: null,
        googleCalendarEnabled: false
      }
    });

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});

export default router;
