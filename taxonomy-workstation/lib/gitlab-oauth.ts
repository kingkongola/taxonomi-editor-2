// GitLab OAuth with PKCE (Proof Key for Code Exchange)
// This is secure for client-side apps without a backend

const GITLAB_URL = 'https://gitlab.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const REDIRECT_URI = typeof window !== 'undefined'
    ? `${window.location.origin}/callback`
    : 'http://localhost:3000/callback';

// PKCE helpers
function generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
        .map(v => charset[v % charset.length])
        .join('');
}

async function sha256(plain: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('gitlab_access_token');
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gitlab_access_token');
}

export function getUserInfo(): { username: string; name: string } | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem('gitlab_user');
    return userJson ? JSON.parse(userJson) : null;
}

export async function initiateLogin() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await sha256(codeVerifier);

    // Store verifier for later
    localStorage.setItem('pkce_verifier', codeVerifier);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'api',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
    });

    window.location.href = `${GITLAB_URL}/oauth/authorize?${params}`;
}

export async function handleCallback(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem('pkce_verifier');

    if (!codeVerifier) {
        throw new Error('No PKCE verifier found');
    }

    const response = await fetch(`${GITLAB_URL}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier
        })
    });

    if (!response.ok) {
        throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();

    // Store tokens
    localStorage.setItem('gitlab_access_token', data.access_token);
    localStorage.setItem('gitlab_refresh_token', data.refresh_token);
    localStorage.removeItem('pkce_verifier');

    // Fetch user info
    await fetchUserInfo(data.access_token);
}

async function fetchUserInfo(token: string) {
    const response = await fetch(`${GITLAB_URL}/api/v4/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        const user = await response.json();
        localStorage.setItem('gitlab_user', JSON.stringify({
            username: user.username,
            name: user.name
        }));
    }
}

export function logout() {
    localStorage.removeItem('gitlab_access_token');
    localStorage.removeItem('gitlab_refresh_token');
    localStorage.removeItem('gitlab_user');
    window.location.href = '/';
}
