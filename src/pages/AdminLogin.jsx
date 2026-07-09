import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const { login } = useAdmin();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Small delay for UX feel
        await new Promise(r => setTimeout(r, 600));

        const success = login(password);
        if (success) {
            navigate('/admin/dashboard');
        } else {
            setError('Incorrect password. Please try again.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setPassword('');
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
                {/* Logo / Brand */}
                <div className="admin-login-brand">
                    <div className="admin-login-icon">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="admin-login-title">Carameloft</h1>
                    <p className="admin-login-subtitle">Admin Portal</p>
                </div>

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
                                className="admin-form-input"
                                placeholder="Enter admin password"
                                required
                                autoFocus
                            />
                            <button
                                type="button"
                                className="admin-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="admin-error-msg">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading || !password}
                    >
                        {loading ? (
                            <span className="admin-spinner"></span>
                        ) : (
                            'Login to Dashboard'
                        )}
                    </button>
                </form>

                <p className="admin-login-footer">
                    🔒 Secure admin access only
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
