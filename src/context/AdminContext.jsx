import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AdminContext = createContext(null);

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_KEY = 'carameloft_admin_token';

// ── Lockout helpers (client-side brute-force protection) ──────────────────
const getLockout = () => {
    try { return JSON.parse(sessionStorage.getItem('carameloft_lockout') || '{}'); }
    catch { return {}; }
};
const setLockout = (data) => sessionStorage.setItem('carameloft_lockout', JSON.stringify(data));
const clearLockout = () => sessionStorage.removeItem('carameloft_lockout');

// ── Provider ───────────────────────────────────────────────────────────────
export const AdminProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lockoutInfo, setLockoutInfo] = useState({ locked: false, remaining: 0, attempts: 0 });
    const sessionTimerRef = useRef(null);
    const activityTimerRef = useRef(null);

    useEffect(() => {
        checkSession();
        return () => {
            clearTimeout(sessionTimerRef.current);
            clearTimeout(activityTimerRef.current);
        };
    }, []);

    // Check token expiry from server-issued token
    const checkSession = () => {
        try {
            const token = sessionStorage.getItem(SESSION_KEY);
            if (!token) return;
            const [expires] = token.split('.');
            const remaining = parseInt(expires) - Date.now();
            if (remaining > 0) {
                setIsAuthenticated(true);
                scheduleExpiry(remaining);
                setupActivity();
            } else {
                sessionStorage.removeItem(SESSION_KEY);
            }
        } catch {
            sessionStorage.removeItem(SESSION_KEY);
        }
    };

    const scheduleExpiry = (ms) => {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = setTimeout(() => logout('Session expired. Please log in again.'), ms);
    };

    const resetActivity = useCallback(() => {
        clearTimeout(activityTimerRef.current);
        activityTimerRef.current = setTimeout(
            () => logout('Logged out due to inactivity.'),
            2 * 60 * 60 * 1000
        );
    }, []);

    const setupActivity = () => {
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const handler = () => resetActivity();
        events.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetActivity();
        window._adminCleanup = () => events.forEach(e => window.removeEventListener(e, handler));
    };

    // ── Login — calls server-side Netlify function ────────────────────────
    const login = async (password) => {
        // Check client-side lockout first
        const lock = getLockout();
        const now = Date.now();
        if (lock.until > now) {
            const remaining = Math.ceil((lock.until - now) / 1000);
            setLockoutInfo({ locked: true, remaining, attempts: lock.attempts });
            return { success: false, locked: true, remaining };
        }

        try {
            const res = await fetch('/.netlify/functions/verifyAdmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok && data.success && data.token) {
                // Success
                clearLockout();
                setLockoutInfo({ locked: false, remaining: 0, attempts: 0 });
                sessionStorage.setItem(SESSION_KEY, data.token);
                setIsAuthenticated(true);
                const [expires] = data.token.split('.');
                scheduleExpiry(parseInt(expires) - Date.now());
                setupActivity();
                return { success: true };
            } else {
                // Failed — increment lockout counter
                const attempts = (lock.attempts || 0) + 1;
                if (attempts >= MAX_ATTEMPTS) {
                    const until = now + LOCKOUT_DURATION;
                    setLockout({ attempts, until });
                    setLockoutInfo({ locked: true, remaining: LOCKOUT_DURATION / 1000, attempts });
                    return { success: false, locked: true, remaining: LOCKOUT_DURATION / 1000 };
                } else {
                    setLockout({ attempts, until: 0 });
                    setLockoutInfo({ locked: false, remaining: 0, attempts });
                    return { success: false, locked: false, attemptsLeft: MAX_ATTEMPTS - attempts };
                }
            }
        } catch (err) {
            return { success: false, locked: false, error: 'Network error. Please try again.' };
        }
    };

    // ── Get session token (used by deploy function) ──────────────────────
    const getToken = () => sessionStorage.getItem(SESSION_KEY);

    // ── Logout ────────────────────────────────────────────────────────────
    const logout = (message) => {
        setIsAuthenticated(false);
        sessionStorage.removeItem(SESSION_KEY);
        clearTimeout(sessionTimerRef.current);
        clearTimeout(activityTimerRef.current);
        if (window._adminCleanup) { window._adminCleanup(); delete window._adminCleanup; }
        if (message) sessionStorage.setItem('carameloft_logout_msg', message);
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, lockoutInfo, login, logout, getToken }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
