import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';

const AdminLogin = () => {
    const { login, lockoutInfo } = useAdmin();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [logoutMsg, setLogoutMsg] = useState('');

    // Show message if redirected from auto-logout
    useEffect(() => {
        const msg = sessionStorage.getItem('carameloft_logout_msg');
        if (msg) {
            setLogoutMsg(msg);
            sessionStorage.removeItem('carameloft_logout_msg');
        }
    }, []);

    // Lockout countdown timer
    useEffect(() => {
        if (lockoutInfo.locked && lockoutInfo.remaining > 0) {
            setCountdown(lockoutInfo.remaining);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [lockoutInfo]);

    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const isLocked = countdown > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLocked || loading) return;

        setLoading(true);
        setError('');

        const result = await login(password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPassword('');

            if (result.locked) {
                setCountdown(result.remaining);
                setError(`🔒 Too many failed attempts. Locked for 15 minutes.`);
            } else {
                const left = result.attemptsLeft;
                setError(
                    left === 1
                        ? `Incorrect password. ⚠️ 1 attempt left before lockout.`
                        : `Incorrect password. ${left} attempts remaining.`
                );
            }
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-bg">
                <div className="admin-login-orb orb-1"></div>
                <div className="admin-login-orb orb-2"></div>
            </div>

            <div className={`admin-login-card ${shake ? 'admin-shake' : ''}`}>
                {/* Brand */}
                <div className="admin-login-brand">
                    <div className="admin-login-icon">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="admin-login-title">Carameloft</h1>
                    <p className="admin-login-subtitle">Admin Portal</p>
                </div>

                {/* Session expired / auto-logout message */}
                {logoutMsg && (
                    <div className="admin-error-msg" style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Clock size={16} /> {logoutMsg}
                    </div>
                )}

                {/* Lockout Banner */}
                {isLocked && (
                    <div className="admin-lockout-banner">
                        <AlertTriangle size={20} />
                        <div>
                            <strong>Account Temporarily Locked</strong>
                            <p>Too many failed attempts. Try again in <strong>{formatCountdown(countdown)}</strong></p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            <Lock size={16} /> Admin Password
                        </label>
                        <div className="admin-password-wrapper">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`admin-form-input ${isLocked ? 'input-error' : ''}`}
                                placeholder={isLocked ? 'Locked — wait for timer' : 'Enter admin password'}
                                required
                                autoFocus
                                disabled={isLocked}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="admin-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && !isLocked && (
                        <div className="admin-error-msg">⚠️ {error}</div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading || isLocked || !password}
                    >
                        {loading ? (
                            <span className="admin-spinner"></span>
                        ) : isLocked ? (
                            <><Clock size={18} /> Locked — {formatCountdown(countdown)}</>
                        ) : (
                            'Login to Dashboard'
                        )}
                    </button>
                </form>

                <div className="admin-login-footer">
                    🔒 Secure admin access only
                    {lockoutInfo.attempts > 0 && !isLocked && (
                        <span style={{ display: 'block', marginTop: '6px', color: '#e74c3c', fontSize: '0.75rem' }}>
                            ⚠️ {lockoutInfo.attempts} failed attempt{lockoutInfo.attempts > 1 ? 's' : ''} recorded
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
