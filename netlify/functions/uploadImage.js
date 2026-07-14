// netlify/functions/uploadImage.js
// Uploads a cake image as a file to the GitHub repo (public/assets/cakes/)
// Returns the relative URL path to use in the JSON data.

const crypto = require('crypto');

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Rithul-Raj';
const GITHUB_REPO  = process.env.GITHUB_REPO  || 'carameloft-website';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify HMAC session token
const verifyToken = (token) => {
    if (!token || !ADMIN_SECRET) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [expires, sig] = parts;
    if (Date.now() > parseInt(expires)) return false;
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(expires).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    } catch { return false; }
};

// Get file SHA if it already exists (needed to overwrite)
const getFileSHA = async (path) => {
    const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'Carameloft-Admin' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha;
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (!GITHUB_TOKEN) {
        return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'GITHUB_TOKEN not configured' }) };
    }

    // Verify session token
    const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (!verifyToken(token)) {
        return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    let body;
    try { body = JSON.parse(event.body); }
    catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

    const { filename, base64Content } = body;

    if (!filename || !base64Content) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'filename and base64Content required' }) };
    }

    // Sanitize filename — only allow safe characters
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const timestamp = Date.now();
    const finalName = `cake_${timestamp}_${safe}`;
    const filePath = `public/assets/cakes/${finalName}`;

    // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const pureBase64 = base64Content.includes(',')
        ? base64Content.split(',')[1]
        : base64Content;

    try {
        const sha = await getFileSHA(filePath);

        const res = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Carameloft-Admin',
                },
                body: JSON.stringify({
                    message: `admin: upload cake image ${finalName}`,
                    content: pureBase64,
                    ...(sha ? { sha } : {}),
                }),
            }
        );

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'GitHub upload failed');
        }

        return {
            statusCode: 200, headers: HEADERS,
            body: JSON.stringify({
                success: true,
                url: `/assets/cakes/${finalName}`,
                message: 'Image uploaded successfully'
            })
        };
    } catch (err) {
        return {
            statusCode: 500, headers: HEADERS,
            body: JSON.stringify({ error: err.message || 'Upload failed' })
        };
    }
};
