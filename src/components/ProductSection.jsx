import React, { useState, useEffect } from 'react';
import CakeCard from './CakeCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProductSection = ({ title, cakes, id, onCakeClick, locationName }) => {
    const [showAll, setShowAll] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const initialLimit = isMobile ? 4 : 3;
    const displayedCakes = showAll ? cakes : cakes.slice(0, initialLimit);

    return (
        <section id={id} className="product-section">
            <div className="container">
                <h2 className="section-title text-center">{title}</h2>

                <div className="cake-grid">
                    <AnimatePresence>
                        {displayedCakes.map((cake) => (
                            <motion.div
                                key={cake.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                            >
                                <CakeCard cake={cake} onClick={onCakeClick} locationName={locationName} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {cakes.length > initialLimit && (
                    <div className="see-more-container">
                        <button
                            className="btn-outline"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : (isMobile ? 'Load More Cakes' : 'See More Cakes')}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductSection;
