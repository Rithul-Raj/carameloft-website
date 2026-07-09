import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Menu, X } from 'lucide-react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { cart, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);

    if (item.path) {
      navigate(item.path);
      return;
    }

    if (item.target) {
      // If we are not on home and target is a home section, go home first
      if (location.pathname !== '/' && item.isHomeSection) {
        navigate('/');
        // Need a way to scroll after nav, but simple strategy is just go home
        // For now, simple navigation
        setTimeout(() => {
          const element = document.getElementById(item.target);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(item.target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rajapuram', path: '/rajapuram' },
    { name: 'Mangalore', path: '/mangalore' },
    { name: 'About', target: 'section-about', isHomeSection: true },
    { name: 'Reviews', target: 'section-reviews', isHomeSection: true },
  ];
  // Wait, I should verify where reviews are. 
  // In Rajapuram.jsx I copied everything, so reviews are there.
  // In Home.jsx I KEPT reviews section? Let me check Home.jsx content again. 
  // I removed ProductSection but I might have removed Reviews too or kept it. 
  // Looking at my previous replace_file_content for Home.jsx, I REMOVED the review section?
  // No, wait. I replaced up to `</div>` of the main container. 
  // Let me quickly check Home.jsx again to be sure.

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="/assets/logo.jpg" alt="Carameloft" className="logo-img" />
          <span className="logo-text">Carameloft</span>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <button key={link.name} onClick={() => handleNavClick(link)} className="nav-link">
              {link.name}
            </button>
          ))}
          <button className="nav-link mobile-only" onClick={() => setMobileMenuOpen(false)}>
            Close
          </button>
        </div>

        <div className="nav-actions">
          <button className="cart-btn" onClick={toggleCart}>
            <ShoppingBag size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
          <button className="menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
