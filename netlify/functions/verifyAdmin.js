// netlify/functions/verifyAdmin.js
// Password NEVER touches the browser — verified server-side only.
// The actual password lives in Netlify environment variables.

const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;  // Set in Netlify env vars
const ADMIN_SECRET   = process.env.ADMIN_SECRET;    // Set in Netlify env vars (random string)

const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Generate a 2-hour HMAC-signed session token
const generateToken = () => {
    const expires = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(String(expires)).digest('hex');
    return `${expires}.${sig}`;
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Check env vars are configured
    if (!ADMIN_PASSWORD || !ADMIN_SECRET) {
        return {
            statusCode: 500, headers: HEADERS,
            body: JSON.stringify({ error: 'Admin credentials not configured. Please set ADMIN_PASSWORD and ADMIN_SECRET in Netlify environment variables.' })
        };
    }

    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid request' }) }; }

    const { password } = body;
    if (!password) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Password required' }) };
    }

    // Timing-safe comparison (prevents timing attacks)
    const inputBuf  = Buffer.alloc(256); Buffer.from(password).copy(inputBuf);
    const storedBuf = Buffer.alloc(256); Buffer.from(ADMIN_PASSWORD).copy(storedBuf);
    const isMatch = crypto.timingSafeEqual(inputBuf, storedBuf) && password === ADMIN_PASSWORD;

    if (isMatch) {
        return {
            statusCode: 200, headers: HEADERS,
            body: JSON.stringify({ success: true, token: generateToken() })
        };
    }

    // Add a small delay on failure to slow brute force
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
    return {
        statusCode: 401, headers: HEADERS,
        body: JSON.stringify({ success: false, message: 'Incorrect password' })
    };
};
