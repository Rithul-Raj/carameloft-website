import React from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const StickyActions = () => {
    const { toggleCart, cart, isCartOpen } = useCart();

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent("Hi Carameloft! I have a query.");
        window.open(`https://wa.me/919074363264?text=${message}`, '_blank');
    };

    if (isCartOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 1000,
            alignItems: 'center'
        }}>
            {/* Cart Button */}
            <button
                onClick={toggleCart}
                style={{
                    backgroundColor: '#d4af37', // Gold color
                    color: '#000',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                aria-label="View Cart"
            >
                <ShoppingCart size={28} />
                {cart.length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#c0392b',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff'
                    }}>
                        {cart.length}
                    </span>
                )}
            </button>

            {/* WhatsApp Button */}
            <button
                onClick={handleWhatsAppClick}
                style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle size={32} />
            </button>
        </div>
    );
};

export default StickyActions;
