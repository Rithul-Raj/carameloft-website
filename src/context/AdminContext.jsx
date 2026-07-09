import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext(null);

// Default password — hashed simply for basic protection
// The admin can change this from the dashboard (stored in localStorage)
const DEFAULT_PASSWORD = 'carameloft@admin2024';

export const AdminProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if already logged in this session
    useEffect(() => {
        const session = sessionStorage.getItem('carameloft_admin_session');
        if (session === 'true') setIsAuthenticated(true);
    }, []);

    const getStoredPassword = () => {
        return localStorage.getItem('carameloft_admin_password') || DEFAULT_PASSWORD;
    };

    const login = (password) => {
        const stored = getStoredPassword();
        if (password === stored) {
            setIsAuthenticated(true);
            sessionStorage.setItem('carameloft_admin_session', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('carameloft_admin_session');
    };

    const changePassword = (currentPassword, newPassword) => {
        const stored = getStoredPassword();
        if (currentPassword !== stored) return { success: false, message: 'Current password is incorrect.' };
        if (newPassword.length < 8) return { success: false, message: 'New password must be at least 8 characters.' };
        localStorage.setItem('carameloft_admin_password', newPassword);
        return { success: true, message: 'Password changed successfully!' };
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, login, logout, changePassword }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
