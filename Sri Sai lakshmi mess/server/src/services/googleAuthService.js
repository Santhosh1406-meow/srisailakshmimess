const { OAuth2Client } = require('google-auth-library');
const config = require('../config');

const client = new OAuth2Client(config.googleClientId);

/**
 * Verify a Google ID token received from the frontend Google Identity Services
 * @param {string} token - Google ID token / JWT
 * @returns {Promise<{googleId: string, email: string, name: string, avatar: string, emailVerified: boolean}>}
 */
async function verifyGoogleToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Google credential/token is missing.');
  }

  // 1. Try google-auth-library if googleClientId is configured
  if (config.googleClientId) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.googleClientId
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new Error('Invalid token payload from Google.');
      }
      return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        avatar: payload.picture || null,
        emailVerified: payload.email_verified || false
      };
    } catch (err) {
      console.warn('[GoogleAuthService] verifyIdToken with audience failed, trying tokeninfo endpoint:', err.message);
      return await verifyViaTokenInfo(token);
    }
  }

  // 2. If googleClientId is not configured in server env, verify via Google's tokeninfo endpoint
  return await verifyViaTokenInfo(token);
}

/**
 * Verify token with Google's public tokeninfo endpoint
 */
async function verifyViaTokenInfo(token) {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const payload = await res.json();
      if (payload && payload.email) {
        return {
          googleId: payload.sub,
          email: payload.email.toLowerCase(),
          name: payload.name || payload.given_name || payload.email.split('@')[0],
          avatar: payload.picture || null,
          emailVerified: payload.email_verified === 'true' || payload.email_verified === true
        };
      }
    }
  } catch (err) {
    console.warn('[GoogleAuthService] Google tokeninfo network fetch error:', err.message);
  }

  // 3. For local development / offline testing: support base64 test tokens
  if (config.nodeEnv !== 'production' && token.startsWith('demo_google_')) {
    try {
      const base64Data = token.replace('demo_google_', '');
      const decoded = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf8'));
      if (decoded && decoded.email) {
        return {
          googleId: decoded.googleId || `goog_demo_${Date.now()}`,
          email: decoded.email.toLowerCase(),
          name: decoded.name || 'Demo Google Customer',
          avatar: decoded.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          emailVerified: true
        };
      }
    } catch (e) {
      // ignore
    }
  }

  throw new Error('Google ID token verification failed. Please ensure your Google Client ID is configured or try again.');
}

module.exports = {
  verifyGoogleToken
};
