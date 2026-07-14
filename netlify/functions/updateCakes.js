// Netlify Serverless Function — updateCakes.js
// Runs on Netlify's server (not in the browser), so GitHub token is safe here.
// Called by the admin dashboard when "Save & Deploy" is clicked.

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Rithul-Raj';
const GITHUB_REPO  = process.env.GITHUB_REPO  || 'carameloft-website';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;   // Set in Netlify dashboard

const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verify admin token (same hash stored in localStorage on the client)
const verifyAdminToken = (requestToken) => {
    const storedToken = process.env.ADMIN_DEPLOY_TOKEN;
    if (!storedToken) return true; // skip if not set (dev mode)
    return requestToken === storedToken;
};

// Get current file SHA from GitHub (required to update a file)
const getFileSHA = async (path) => {
    const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'Carameloft-Admin' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha;
};

// Update a file on GitHub via API
const updateFile = async (path, content, message) => {
    const sha = await getFileSHA(path);
    const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    const body = {
        message,
        content: encoded,
        ...(sha ? { sha } : {}),
    };

    const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Carameloft-Admin',
            },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub API error: ${err.message}`);
    }
    return await res.json();
};

// ── Main Handler ─────────────────────────────────────────────────────────────
exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (!GITHUB_TOKEN) {
        return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'GitHub token not configured. Please set GITHUB_TOKEN in Netlify environment variables.' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { rajapuramCakes, mangaloreCakes, deployedBy = 'Admin' } = body;

    if (!rajapuramCakes && !mangaloreCakes) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No cake data provided' }) };
    }

    try {
        const timestamp = new Date().toISOString();
        const results = [];

        if (rajapuramCakes) {
            await updateFile(
                'src/data/cakesData.json',
                rajapuramCakes,
                `admin: update Rajapuram cakes (${deployedBy}) [${timestamp}]`
            );
            results.push('Rajapuram cakes updated');
        }

        if (mangaloreCakes) {
            await updateFile(
                'src/data/mangaloreCakesData.json',
                mangaloreCakes,
                `admin: update Mangalore cakes (${deployedBy}) [${timestamp}]`
            );
            results.push('Mangalore cakes updated');
        }

        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({
                success: true,
                message: `${results.join(' & ')}. Netlify will rebuild and deploy in ~2 minutes.`,
                timestamp,
            }),
        };

    } catch (err) {
        console.error('Deploy error:', err);
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ error: err.message || 'Failed to update GitHub files' }),
        };
    }
};
