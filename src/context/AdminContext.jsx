import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AdminContext = createContext(null);

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;           // Lock after 5 failed attempts
const LOCKOUT_DURATION = 15 * 60 * 1000;  // 15 minutes lockout
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours session expiry
const DEFAULT_PASSWORD = 'carameloft@admin2024';

// ── SHA-256 hashing via Web Crypto API (built into all modern browsers) ─────
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'carameloft_salt_2024'); // salted hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ── Store hashed default password on first run ─────────────────────────────
const initDefaultPassword = async () => {
    if (!localStorage.getItem('carameloft_admin_pwd_hash')) {
        const hash = await hashPassword(DEFAULT_PASSWORD);
        localStorage.setItem('carameloft_admin_pwd_hash', hash);
    }
};

// ── Lockout helpers ────────────────────────────────────────────────────────
const getLockoutState = () => {
    try {
        const raw = localStorage.getItem('carameloft_admin_lockout');
        if (!raw) return { attempts: 0, lockedUntil: 0 };
        return JSON.parse(raw);
    } catch { return { attempts: 0, lockedUntil: 0 }; }
};

const setLockoutState = (state) => {
    localStorage.setItem('carameloft_admin_lockout', JSON.stringify(state));
};

const clearLockout = () => localStorage.removeItem('carameloft_admin_lockout');

// ── Provider ───────────────────────────────────────────────────────────────
export const AdminProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lockoutInfo, setLockoutInfo] = useState({ locked: false, remaining: 0, attempts: 0 });
    const sessionTimerRef = useRef(null);
    const activityTimerRef = useRef(null);

    // Initialize hashed default password on mount
    useEffect(() => {
        initDefaultPassword();
        checkSession();
        return () => {
            clearTimeout(sessionTimerRef.current);
            clearTimeout(activityTimerRef.current);
        };
    }, []);

    // Check for existing valid session
    const checkSession = () => {
        try {
            const sessionData = sessionStorage.getItem('carameloft_admin_session');
            if (!sessionData) return;
            const { timestamp } = JSON.parse(sessionData);
            const elapsed = Date.now() - timestamp;
            if (elapsed < SESSION_TIMEOUT) {
                setIsAuthenticated(true);
                scheduleSessionExpiry(SESSION_TIMEOUT - elapsed);
                setupActivityListener();
            } else {
                sessionStorage.removeItem('carameloft_admin_session');
            }
        } catch {
            sessionStorage.removeItem('carameloft_admin_session');
        }
    };

    // Auto-logout timer
    const scheduleSessionExpiry = (remaining) => {
        clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = setTimeout(() => {
            logout('Session expired. Please log in again.');
        }, remaining);
    };

    // Reset timer on user activity (keep session alive while active)
    const resetActivityTimer = useCallback(() => {
        clearTimeout(activityTimerRef.current);
        activityTimerRef.current = setTimeout(() => {
            logout('Logged out due to inactivity.');
        }, SESSION_TIMEOUT);
    }, []);

    const setupActivityListener = () => {
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const handler = () => resetActivityTimer();
        events.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetActivityTimer();
        // Store cleanup reference
        window._adminActivityCleanup = () => events.forEach(e => window.removeEventListener(e, handler));
    };

    const cleanupActivityListener = () => {
        if (window._adminActivityCleanup) {
            window._adminActivityCleanup();
            delete window._adminActivityCleanup;
        }
        clearTimeout(activityTimerRef.current);
    };

    // ── Login with lockout ───────────────────────────────────────────────
    const login = async (password) => {
        // Check lockout
        const lockState = getLockoutState();
        const now = Date.now();

        if (lockState.lockedUntil > now) {
            const remaining = Math.ceil((lockState.lockedUntil - now) / 1000);
            setLockoutInfo({ locked: true, remaining, attempts: lockState.attempts });
            return { success: false, locked: true, remaining };
        }

        // Hash and verify password
        const inputHash = await hashPassword(password);
        const storedHash = localStorage.getItem('carameloft_admin_pwd_hash');

        if (inputHash === storedHash) {
            // Success — clear lockout
            clearLockout();
            setLockoutInfo({ locked: false, remaining: 0, attempts: 0 });
            setIsAuthenticated(true);

            // Save session with timestamp
            sessionStorage.setItem('carameloft_admin_session', JSON.stringify({ timestamp: now }));
            scheduleSessionExpiry(SESSION_TIMEOUT);
            setupActivityListener();
            return { success: true };
        } else {
            // Failed — increment attempts
            const newAttempts = (lockState.attempts || 0) + 1;
            const remaining = MAX_ATTEMPTS - newAttempts;

            if (newAttempts >= MAX_ATTEMPTS) {
                const lockedUntil = now + LOCKOUT_DURATION;
                setLockoutState({ attempts: newAttempts, lockedUntil });
                setLockoutInfo({ locked: true, remaining: LOCKOUT_DURATION / 1000, attempts: newAttempts });
                return { success: false, locked: true, remaining: LOCKOUT_DURATION / 1000, message: `Too many attempts. Locked for 15 minutes.` };
            } else {
                setLockoutState({ attempts: newAttempts, lockedUntil: 0 });
                setLockoutInfo({ locked: false, remaining: 0, attempts: newAttempts });
                return { success: false, locked: false, attemptsLeft: remaining };
            }
        }
    };

    // ── Logout ──────────────────────────────────────────────────────────
    const logout = (message) => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('carameloft_admin_session');
        clearTimeout(sessionTimerRef.current);
        cleanupActivityListener();
        if (message) {
            sessionStorage.setItem('carameloft_logout_msg', message);
        }
    };

    // ── Change Password ──────────────────────────────────────────────────
    const changePassword = async (currentPassword, newPassword) => {
        if (newPassword.length < 10) {
            return { success: false, message: 'New password must be at least 10 characters.' };
        }
        if (!/[A-Z]/.test(newPassword)) {
            return { success: false, message: 'Password must contain at least one uppercase letter.' };
        }
        if (!/[0-9!@#$%^&*]/.test(newPassword)) {
            return { success: false, message: 'Password must contain a number or special character (!@#$%^&*).' };
        }

        const currentHash = await hashPassword(currentPassword);
        const storedHash = localStorage.getItem('carameloft_admin_pwd_hash');

        if (currentHash !== storedHash) {
            return { success: false, message: 'Current password is incorrect.' };
        }

        const newHash = await hashPassword(newPassword);
        localStorage.setItem('carameloft_admin_pwd_hash', newHash);
        return { success: true, message: 'Password changed successfully!' };
    };

    return (
        <AdminContext.Provider value={{
            isAuthenticated,
            lockoutInfo,
            login,
            logout,
            changePassword
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
