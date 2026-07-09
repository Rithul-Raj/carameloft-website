import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('carameloft_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('carameloft_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, weight = 1, adjustedPrice = null) => {
        const finalPrice = adjustedPrice || product.price;
        // Create a unique ID for the cart item based on product ID and weight
        const cartItemId = `${product.id}-${weight}`;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.cartItemId === cartItemId);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Add new item with cartItemId and weight
            return [...prevCart, { ...product, cartItemId, weight, price: finalPrice, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartItemId) => {
        setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, delta) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.cartItemId === cartItemId) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                toggleCart,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
