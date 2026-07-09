import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductSection from '../components/ProductSection';
import ProductModal from '../components/ProductModal';
import defaultCakes from '../data/cakesData.json';
import { MessageCircle, Heart, MapPin } from 'lucide-react';

import SEO from '../components/SEO';

const Rajapuram = () => {
    // Load cakes: localStorage override (set by admin) takes priority over bundled JSON
    const getInitialCakes = () => {
        try {
            const stored = localStorage.getItem('carameloft_rajapuram_cakes');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return defaultCakes;
    };

    // 1. Initial Data
    const [allCakes, setAllCakes] = useState(getInitialCakes);
    const [filteredCakes, setFilteredCakes] = useState(getInitialCakes);
    const [selectedCake, setSelectedCake] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('popularity');

    // 2. Filter Logic
    useEffect(() => {
        let result = [...allCakes];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(cake =>
                cake.name.toLowerCase().includes(query) ||
                cake.category.toLowerCase().includes(query) ||
                cake.description.toLowerCase().includes(query)
            );
        }

        // Price Filter
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                result = result.filter(cake => cake.price >= min && cake.price <= max);
            } else {
                if (priceRange === '1400-1500') result = result.filter(cake => cake.price >= 1400 && cake.price <= 1500);
            }
        }

        // Sort
        if (sortBy === 'lowHigh') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'highLow') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredCakes(result);
    }, [searchQuery, priceRange, sortBy, allCakes]);

    // 3. Derived Categories
    const premiumCakes = filteredCakes.filter(c => c.category === 'premium');
    const budgetCakes = filteredCakes.filter(c => c.category === 'budget');
    const crownCakes = filteredCakes.filter(c => c.category === 'crown');

    const handleFeedback = () => {
        const message = encodeURIComponent("Hi Carameloft! I loved your cake and wanted to share my feedback: ");
        window.open(`https://wa.me/919074363264?text=${message}`, '_blank');
    };

    return (
        <div>
            <SEO
                title="Premium Cakes in Rajapuram | Carameloft"
                description="Order premium, hygienic custom cakes in Rajapuram (Kanhangad). Free delivery within 5km and delivery up to 15km. Birthday and celebration cakes by Carameloft."
            />
            {/* Using standard sequenceBaseUrl for Rajapuram (original animation) */}
            <Hero
                title="Premium Cakes in"
                highlightText="Rajapuram"
            >
                <div style={{ marginTop: '15px' }}>
                    <a
                        href="#section-premium"
                        className="btn-outline"
                        style={{
                            textDecoration: 'none',
                            color: '#d4af37',
                            borderColor: '#d4af37',
                            padding: '10px 30px',
                            fontSize: '1rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            display: 'inline-block'
                        }}
                    >
                        View Menu
                    </a>
                </div>
            </Hero>

            <div style={{ background: '#0d0d0d', position: 'relative', zIndex: 10 }}>

                <section id="section-about" className="about-section">
                    <div className="container">
                        <div className="about-content">
                            <p>
                                <strong>Purity. Precision. Premium.</strong><br />
                                Experience the finest cakes in Rajapuram and Kanhangad.
                                Crafted in a hyper-hygienic environment using only the finest global ingredients.
                                Specializing in custom orders for birthdays, weddings, and celebrations.
                            </p>
                            <p className="highlight" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                                🚚 Free delivery within 5 km of <span style={{ color: '#fff' }}>Rajapuram</span> (Paid delivery up to 15km)
                            </p>
                            <p className="highlight">✨ 100% Hygienic • Premium Ingredients • Freshly Baked</p>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="filter-section container" style={{ padding: '20px 0' }}>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search cakes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-controls">
                        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="filter-select">
                            <option value="all">Price Range</option>
                            <option value="500-900">₹500 - ₹900</option>
                            <option value="900-1000">₹900 - ₹1000</option>
                            <option value="1000-1200">₹1000 - ₹1200</option>
                            <option value="1200-1400">₹1200 - ₹1400</option>
                            <option value="1400-1500">₹1400 - ₹1500</option>
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                            <option value="popularity">Popularity</option>
                            <option value="lowHigh">Price: Low to High</option>
                            <option value="highLow">Price: High to Low</option>
                        </select>
                    </div>
                </section>

                {premiumCakes.length > 0 && (
                    <ProductSection
                        id="section-premium"
                        title="Premium Creations"
                        cakes={premiumCakes}
                        onCakeClick={setSelectedCake}
                        locationName="Rajapuram"
                    />
                )}

                {budgetCakes.length > 0 && (
                    <ProductSection
                        id="section-budget"
                        title="Delicious & Budget-Friendly"
                        cakes={budgetCakes}
                        onCakeClick={setSelectedCake}
                        locationName="Rajapuram"
                    />
                )}

                {crownCakes.length > 0 && (
                    <ProductSection
                        id="section-crown"
                        title="Crown Edition – Ultra Premium"
                        cakes={crownCakes}
                        onCakeClick={setSelectedCake}
                        locationName="Rajapuram"
                    />
                )}

                {filteredCakes.length === 0 && (
                    <div className="container text-center" style={{ padding: '50px' }}>
                        <p>No cakes found matching your criteria.</p>
                    </div>
                )}

                {selectedCake && (
                    <ProductModal cake={selectedCake} onClose={() => setSelectedCake(null)} />
                )}

                <section id="section-reviews" className="feedback-section">
                    <div className="container text-center">
                        <Heart size={48} className="heart-icon" />
                        <h2>Loved the Cake? Tell Us!</h2>
                        <p>Your feedback makes our day sweeter.</p>
                        <button className="btn-primary feedback-btn" onClick={handleFeedback}>
                            <MessageCircle size={20} /> Send Feedback via WhatsApp
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Rajapuram;
