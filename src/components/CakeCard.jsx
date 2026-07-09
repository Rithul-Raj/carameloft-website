import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag } from 'lucide-react';

const CakeCard = ({ cake, onClick, locationName }) => {
  const { addToCart } = useCart();
  const [rating, setRating] = useState(cake.rating);

  return (
    <div className="cake-card">
      <div className="card-image-container" onClick={() => onClick(cake)} style={{ cursor: 'pointer' }}>
        <img
          src={cake.image}
          alt={locationName ? `${cake.name} - Premium Cake in ${locationName}` : cake.name}
          loading="lazy"
        />
        <div className="card-overlay">
          <button className="btn-quick-view" onClick={(e) => { e.stopPropagation(); onClick(cake); }}>
            Quick View
          </button>
          <button className="btn-wishlist-icon" title="Add to Cart" onClick={(e) => { e.stopPropagation(); addToCart(cake); }}>
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="cake-name">{cake.name}</h3>
          <div className="cake-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= rating ? '#D4AF37' : 'none'}
                stroke={star <= rating ? '#D4AF37' : '#666'}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <p className="cake-desc">{cake.description}</p>

        <div className="card-footer">
          <div className="price-tag">
            <span className="original-price">₹{cake.originalPrice}</span>
            <span className="current-price">₹{cake.price}</span>
          </div>
          <button className="btn-order-mobile" onClick={(e) => { e.stopPropagation(); onClick(cake); }}>
            Order
          </button>
          <button className="btn-order-desktop" onClick={(e) => { e.stopPropagation(); onClick(cake); }}>
            Order
          </button>
        </div>
      </div>

    </div>
  );
};

export default CakeCard;
