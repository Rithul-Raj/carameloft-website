import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = "Hi Carameloft 👋\nI'd like to place an order:\n\n";
    cart.forEach((item) => {
      message += `• ${item.name} (${item.weight}kg)\n  Qty: ${item.quantity} x ₹${item.price} = ₹${item.price * item.quantity}\n`;
    });
    message += `\n*Total Amount: ₹${cartTotal}*\n\nPlease confirm availability and delivery.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919074363264?text=${encodedMessage}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />
          <motion.div
            className="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="cart-header">
              <h2>Your Selection</h2>
              <button className="btn-close" onClick={toggleCart}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty.</p>
                  <button className="btn-outline" onClick={() => {
                    toggleCart();
                    setTimeout(() => {
                      const element = document.querySelector('.filter-section') || document.querySelector('.product-section');
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}>Start Browsing</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId || item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <h3>{item.name} <span style={{ fontSize: '0.8em', color: '#aaa' }}>({item.weight}kg)</span></h3>
                      <p className="item-price">₹{item.price}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.cartItemId || item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId || item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.cartItemId || item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="total-row">
                  <span>Total</span>
                  <span className="total-amount">₹{cartTotal}</span>
                </div>
                <button className="btn-primary btn-checkout" onClick={handleCheckout}>
                  Order via WhatsApp
                </button>
                <div style={{ textAlign: 'center', marginTop: '15px', color: '#888', fontSize: '0.9rem' }}>
                  or contact through<br /> <span style={{ color: '#d4af37' }}>+91 9074363264</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
