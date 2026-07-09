import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import Layout from './Layout';
import Home from './pages/Home';
import Mangalore from './pages/Mangalore';
import Rajapuram from './pages/Rajapuram';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import ScrollProgress from './components/ScrollProgress';

// ScrollToTop component to ensure navigation resets scroll
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  React.useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Delay slightly to ensure page load/render
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, hash]);
  return null;
};

const App = () => {
  return (
    <AdminProvider>
      <CartProvider>
        <ScrollProgress />
        <ScrollToTop />
        <Routes>
          {/* Admin routes — no Layout (no navbar/footer) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Public routes — wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/mangalore" element={<Mangalore />} />
            <Route path="/rajapuram" element={<Rajapuram />} />
          </Route>
        </Routes>
      </CartProvider>
    </AdminProvider>
  );
};

export default App;
