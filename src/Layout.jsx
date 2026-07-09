import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import Footer from './components/Footer';
import StickyActions from './components/StickyActions';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <Cart />
            <StickyActions />
            <main>
                {children || <Outlet />}
            </main>
            <Footer />
        </>
    );
};

export default Layout;
