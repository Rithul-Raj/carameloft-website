import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductSection from '../components/ProductSection';
import ProductModal from '../components/ProductModal';
import defaultMangaloreCakes from '../data/mangaloreCakesData.json';
import { MessageCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Mangalore = () => {
    // Load cakes: localStorage override (set by admin) takes priority over bundled JSON
    const getInitialCakes = () => {
        try {
            const stored = localStorage.getItem('carameloft_mangalore_cakes');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return defaultMangaloreCakes;
    };

    // 1. Initial Data
    const [allCakes, setAllCakes] = useState(getInitialCakes);
    const [filteredCakes, setFilteredCakes] = useState(getInitialCakes);
    const [selectedCake, setSelectedCake] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('popularity');

    // 2. Filter Logic (Duplicated for now, ideally extracted to hook)
    useEffect(() => {
        let result = [...allCakes];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(cake =>
                cake.name.toLowerCase().includes(query) ||
                cake.category.toLowerCase().includes(query) ||
                cake.description.toLowerCase().includes(query)
            );
        }

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                result = result.filter(cake => cake.price >= min && cake.price <= max);
            } else if (priceRange === '1400-1500') {
                result = result.filter(cake => cake.price >= 1400 && cake.price <= 1500);
            }
        }

        if (sortBy === 'lowHigh') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'highLow') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredCakes(result);
    }, [searchQuery, priceRange, sortBy, allCakes]);

    // 3. Derived Categories
    const classicCakes = filteredCakes.filter(c => c.category === 'classic');
    const premiumCakes = filteredCakes.filter(c => c.category === 'premium');

    const handleFeedback = () => {
        const message = encodeURIComponent("Hi Carameloft Mangalore! I loved your cake and wanted to share my feedback: ");
        window.open(`https://wa.me/919074363264?text=${message}`, '_blank');
    };

    return (
        <div style={{ backgroundColor: '#2b1d16', color: '#f5e6d3' }}> {/* Warm Chocolate Theme */}
            <SEO
                title="Premium Custom Cakes in Mangalore | Carameloft"
                description="Order premium, hygienic custom cakes in Mangalore. Free delivery within 5km and delivery up to 15km. Birthday and custom cakes by Carameloft."
            />
            <style>
                {`
                    /* Specific overrides for Mangalore page to match "cake theme" */
                    .highlight { color: #ffe0b2 !important; } /* Lighter Gold/Cream for better readability */
                    .btn-primary { background-color: #d4a373; color: #1a120b; border: none; }
                    .btn-primary:hover { background-color: #e5b98f; }
                    .about-section h2, .feedback-section h2 { color: #d4a373; }
                    .filter-select, .search-input { background-color: #3e2e26 !important; color: #f5e6d3 !important; border: 1px solid #5c4335 !important; }
                    .product-card { background-color: #3e2e26 !important; border: 1px solid #5c4335 !important; }
                    .product-card h3 { color: #f5e6d3 !important; }
                    .product-card p { color: #cbb8a9 !important; }
                    .price { color: #d4a373 !important; }
                    
                    @media (max-width: 768px) {
                        .cake-grid {
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 15px !important;
                        }
                    }
                `}
            </style>

            <Hero
                sequenceBaseUrl="/assets/cake-sequence-2/"
                frameCount={192}
                title="Premium Custom Cakes in"
                highlightText="Mangalore"
                subtitle="Exquisite flavors, crafted for Mangaluru."
            >
                <div style={{ marginTop: '15px' }}>
                    <a
                        href="#section-products"
                        className="btn-outline"
                        style={{
                            textDecoration: 'none',
                            color: '#d4a373',
                            borderColor: '#d4a373',
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

            <div style={{ background: '#2b1d16', position: 'relative', zIndex: 10 }}>

                <section className="about-section">
                    <div className="container">
                        <div className="about-content">
                            <h2>Carameloft Mangalore</h2>
                            <p>
                                Experience the same premium quality and exquisite taste at our Mangalore outlet.
                                We specialize in custom cakes, birthday cakes, and premium celebrations.
                                100% Hygienic preparation.
                            </p>
                            <p className="highlight" style={{ marginTop: '20px', fontSize: '1.2rem' }}>
                                🚚 Free delivery within 5 km of <span style={{ color: '#fff' }}>Mangaluru</span> (Paid delivery up to 15km)
                            </p>

                            <div style={{ marginTop: '30px' }}>
                                <Link to="/" className="btn-outline" style={{ borderColor: '#d4a373', color: '#d4a373' }}>
                                    &larr; Back to Main Menu
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="section-products" className="filter-section container" style={{ padding: '20px 0' }}>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search Mangalore cakes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-controls">
                        <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="filter-select">
                            <option value="all">Price Range</option>
                            <option value="500-900">₹500 - ₹900</option>
                            <option value="900-1100">₹900 - ₹1100</option>
                            <option value="1100-1500">₹1100+</option>
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
                        id="m-premium"
                        title="Premium Signatures (₹1100)"
                        cakes={premiumCakes}
                        onCakeClick={setSelectedCake}
                        locationName="Mangalore"
                    />
                )}

                {classicCakes.length > 0 && (
                    <ProductSection
                        id="m-classic"
                        title="Classic Creations (₹800)"
                        cakes={classicCakes}
                        onCakeClick={setSelectedCake}
                        locationName="Mangalore"
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

                <section className="feedback-section">
                    <div className="container text-center">
                        <Heart size={48} className="heart-icon" style={{ color: '#d4a373' }} />
                        <h2>Loved the Cake? Tell Us!</h2>
                        <button className="btn-primary feedback-btn" onClick={handleFeedback}>
                            <MessageCircle size={20} /> Send Feedback via WhatsApp
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Mangalore;
