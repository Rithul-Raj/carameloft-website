import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductModal = ({ cake, onClose }) => {
    const { addToCart } = useCart();

    const [selectedWeight, setSelectedWeight] = React.useState(1);
    const [isCustomWeight, setIsCustomWeight] = React.useState(false);
    const [customWeightValue, setCustomWeightValue] = React.useState('');

    const weightOptions = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

    // Reset weight when cake changes
    useEffect(() => {
        setSelectedWeight(1);
        setIsCustomWeight(false);
        setCustomWeightValue('');
    }, [cake]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!cake) return null;

    // Calculate effective weight and price
    const effectiveWeight = isCustomWeight ? (parseFloat(customWeightValue) || 0) : selectedWeight;
    const currentPrice = Math.round(cake.price * (effectiveWeight || 1)); // Handle 0/NaN gracefully for display
    const currentOriginal = Math.round(cake.originalPrice * (effectiveWeight || 1));

    const handleAddToCart = () => {
        if (isCustomWeight && (!customWeightValue || parseFloat(customWeightValue) <= 0)) {
            alert("Please enter a valid weight!");
            return;
        }
        addToCart(cake, effectiveWeight, currentPrice);
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            <div className="modal-backdrop" onClick={onClose}>
                <motion.div
                    className="modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="btn-modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="modal-grid">
                        <div className="modal-image-col">
                            <img src={cake.image} alt={cake.name} className="modal-img" />
                        </div>

                        <div className="modal-details-col">
                            <h2 className="modal-title">{cake.name}</h2>
                            <div className="modal-category-badge">{cake.category}</div>

                            <p className="modal-desc">{cake.description}</p>

                            {/* Weight Selection */}
                            <div className="weight-selection" style={{ margin: '20px 0' }}>
                                <label style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Select Weight (kg)</label>
                                <div className="weight-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {weightOptions.map(w => (
                                        <button
                                            key={w}
                                            onClick={() => { setSelectedWeight(w); setIsCustomWeight(false); }}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: `1px solid ${!isCustomWeight && selectedWeight === w ? '#d4af37' : '#333'}`,
                                                background: !isCustomWeight && selectedWeight === w ? '#d4af37' : 'transparent',
                                                color: !isCustomWeight && selectedWeight === w ? '#000' : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {w} kg
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setIsCustomWeight(true)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: `1px solid ${isCustomWeight ? '#d4af37' : '#333'}`,
                                            background: isCustomWeight ? '#d4af37' : 'transparent',
                                            color: isCustomWeight ? '#000' : '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Custom
                                    </button>
                                </div>

                                {isCustomWeight && (
                                    <div style={{ marginTop: '15px' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            placeholder="Enter weight in kg (e.g. 7.5)"
                                            value={customWeightValue}
                                            onChange={(e) => setCustomWeightValue(e.target.value)}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid #d4af37',
                                                background: '#1a1a1a',
                                                color: '#fff',
                                                width: '100%',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-highlights">
                                <h3>Why you'll love it:</h3>
                                <ul>
                                    {cake.highlights ? (
                                        cake.highlights.map((highlight, index) => (
                                            <li key={index}>{highlight}</li>
                                        ))
                                    ) : (
                                        <>
                                            <li>✨ Premium Ingredients</li>
                                            <li>🥚 Freshly Baked</li>
                                            <li>🍫 Rich & Creamy Texture</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <div className="modal-price-row">
                                <div className="price-block">
                                    <span className="original">₹{currentOriginal}</span>
                                    <span className="current">₹{currentPrice}</span>
                                </div>

                                <button className="btn-primary btn-modal-order" onClick={handleAddToCart}>
                                    <ShoppingBag size={20} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

        </AnimatePresence>,
        document.body
    );
};

export default ProductModal;
