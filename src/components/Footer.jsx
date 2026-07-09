import React from 'react';
import { Instagram, Mail, MapPin, Wallet, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">Carameloft</h3>
            <p>Handcrafted premium bakery serving Rajapuram & Mangaluru.</p>
            <p className="delivery-info">🚚 Free delivery within 5 km</p>
          </div>

          <div className="footer-section">
            <h4>Locations</h4>
            <div className="contact-item">
              <MapPin size={18} className="icon" />
              <p>
                <strong>Rajapuram:</strong><br />
                King’s Bakery, Chullikkara,<br />
                Panathur Road, Kasaragod
              </p>
            </div>
            <div className="contact-item">
              <MapPin size={18} className="icon" />
              <p>
                <strong>Mangaluru:</strong><br />
                (Outlet details coming soon)
              </p>
            </div>
            <div className="contact-item" style={{ marginTop: '20px' }}>
              <p>📞 +91 9074363264</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="contact-item">
              <Instagram size={18} className="icon" />
              <a href="https://instagram.com/carame.loft" target="_blank" rel="noopener noreferrer">@carame.loft</a>
            </div>
            <div className="contact-item">
              <Mail size={18} className="icon" />
              <a href="mailto:carameloftcakes@gmail.com">carameloftcakes@gmail.com</a>
            </div>
            <div className="contact-item">
              <Globe size={18} className="icon" />
              <a href="https://www.carameloft.com" target="_blank" rel="noopener noreferrer">www.carameloft.com</a>
            </div>
            <div className="contact-item">
              <Wallet size={18} className="icon" />
              <p>UPI ID: sachinvinto550@okaxis</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Carameloft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
