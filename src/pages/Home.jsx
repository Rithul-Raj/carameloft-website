import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductSection from '../components/ProductSection';
import ProductModal from '../components/ProductModal';
import { cakes } from '../data/cakes';
import { MessageCircle, Heart, Filter, ShieldCheck, Award, Clock, Gem, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';

const Home = () => {
    return (
        <div>
            <SEO
                title="Carameloft | Premium Cakes in Rajapuram & Mangalore"
                description="Order premium, handcrafted cakes from Carameloft. Serving Rajapuram, Mangalore, and Kanhangad with the finest ingredients and free delivery."
            />
            <Hero
                sequenceBaseUrl="/assets/cake-sequence-home/"
                frameCount={168}
                mobileSequenceBaseUrl="/assets/cake-sequence-mv/"
                mobileFrameCount={192}
                showDefaultButton={false}
                subtitle="Every slice tells a story"
            >
                <div className="hero-btn-container" style={{ marginBottom: '40px' }}> {/* Increased margin for hover gap */}
                    <div className="btn-primary hero-btn main-order-btn" role="button" tabIndex={0}>
                        Order Now
                        <div className="split-options">
                            <Link to="/rajapuram" className="split-option">Order from Rajapuram</Link>
                            <Link to="/mangalore" className="split-option">Order from Mangalore</Link>
                        </div>
                    </div>
                </div>

                {/* Explore Menu Button with Visual Mapping */}
                <div className="explore-menu-wrapper">
                    <button className="btn-outline explore-btn">
                        Explore Menu
                    </button>

                    <div className="explore-mapping">
                        <svg className="mapping-lines" width="300" height="60" viewBox="0 0 300 60">
                            {/* Left curve to Rajapuram */}
                            <path d="M150 0 C 150 30, 50 10, 50 60" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="5,5" />
                            {/* Right curve to Mangalore */}
                            <path d="M150 0 C 150 30, 250 10, 250 60" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="5,5" />
                        </svg>

                        <div className="explore-destinations">
                            <Link to="/rajapuram#section-premium" className="explore-dest-btn">
                                Rajapuram
                            </Link>
                            <Link to="/mangalore#m-premium" className="explore-dest-btn">
                                Mangalore
                            </Link>
                        </div>
                    </div>
                </div>
            </Hero>

            <div style={{ background: '#0d0d0d', position: 'relative', zIndex: 10 }}>
                <section id="section-about" className="about-section">
                    <div className="container">
                        <div className="about-content">
                            <h2>About Carameloft</h2>
                            <p>
                                <strong>Purity. Precision. Premium.</strong><br />
                                At Carameloft, we believe that a cake is more than just a dessert—it's an experience.
                                Crafted in a hyper-hygienic environment using only the finest global ingredients, our creations are a testament to quality.
                            </p>
                            <p>
                                From our oven to your celebration, we ensure a premium experience that tastes as flawless as it looks.
                            </p>
                            <p className="highlight" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                                🚚 Free delivery within 5 km of <span style={{ color: '#fff' }}>Rajapuram</span> & <span style={{ color: '#fff' }}>Mangaluru</span>
                            </p>
                            <p className="highlight">✨ 100% Hygienic • Premium Ingredients • Freshly Baked</p>
                        </div>
                    </div>
                </section>

                <section className="features-section container">
                    <h2 className="section-title text-center" style={{ marginBottom: '50px' }}>
                        We serve with L<Heart className="love-icon" fill="#c0392b" stroke="none" style={{ display: 'inline', verticalAlign: 'middle', width: '0.8em', marginTop: '-5px' }} />ve
                    </h2>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <ShieldCheck size={40} />
                            </div>
                            <h3>100% Hygiene</h3>
                            <p>Sanitized kitchens & strict protocols.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Award size={40} />
                            </div>
                            <h3>Top Quality</h3>
                            <p>Finest quality ingredients.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Clock size={40} />
                            </div>
                            <h3>Freshness</h3>
                            <p>Baked fresh upon order.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Gem size={40} />
                            </div>
                            <h3>Premium</h3>
                            <p>Luxury aesthetics and exquisite taste.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Truck size={40} />
                            </div>
                            <h3>Quick Delivery</h3>
                            <p>Safe and fast doorstep delivery.</p>
                        </div>
                    </div>
                </section>

                <section id="section-reviews" className="feedback-section">
                    <div className="container feedback-container">
                        <Heart size={48} className="heart-icon" style={{ marginBottom: '25px', color: '#d4af37', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))' }} />
                        <h2 className="feedback-title">
                            Loved the Cake? Tell Us!
                        </h2>
                        <p className="feedback-subtitle">
                            Your feedback makes our day sweeter.
                        </p>
                        <button className="feedback-btn" onClick={() => {
                            const message = encodeURIComponent("Hi Carameloft! I loved your cake and wanted to share my feedback: ");
                            window.open(`https://wa.me/919074363264?text=${message}`, '_blank');
                        }}>
                            <MessageCircle size={22} /> Send Feedback via WhatsApp
                        </button>
                    </div>
                </section>

                {/* Footer is handled by Layout, so we don't need to add it here explicitly if it's in Layout. 
                    Based on previous file reads, Footer IS in Layout.jsx. 
                    So we just end the div here. 
                */}
            </div>
        </div>
    );
};

// Simple Icon component helper if not imported
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

export default Home;
