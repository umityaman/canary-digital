import { google } from 'googleapis';

/**
 * Google OAuth 2.0 Configuration
 * 
 * Setup: 
 * 1. Go to https://console.cloud.google.com
 * 2. Create a new project (or select existing)
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs:
 *    - http://localhost:4000/api/auth/google/callback (development)
 *    - https://your-domain.com/api/auth/google/callback (production)
 * 6. Copy Client ID and Client Secret to .env
 */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'
);

/**
 * Scopes required for Google Calendar integration
 */
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Generate authorization URL for user consent
 * @returns {string} Authorization URL
 */
export const getAuthUrl = (): string => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh token
    scope: SCOPES,
    prompt: 'consent' // Force consent screen to get refresh token
  });
};

/**
 * Exchange authorization code for access token and refresh token
 * @param {string} code - Authorization code from callback
 * @returns {Promise} Token object
 */
export const getTokenFromCode = async (code: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} New access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh access token');
  }
};

/**
 * Get OAuth2 client with credentials
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token (optional)
 * @returns OAuth2 client
 */
export const getAuthClient = (accessToken: string, refreshToken?: string) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });
  
  return client;
};

/**
 * Revoke access token
 * @param {string} accessToken - Access token to revoke
 */
export const revokeToken = async (accessToken: string) => {
  try {
    await oauth2Client.revokeToken(accessToken);
  } catch (error) {
    console.error('Error revoking token:', error);
    throw new Error('Failed to revoke access token');
  }
};

export default oauth2Client;
