'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([
    {
      id: 'custom-card-1',
      title: 'CUSTOM CARD',
      subtitle: 'matte grey card for mums',
      price: 8500,
      quantity: 1,
      size: 'XL 1',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'custom-card-2',
      title: 'CUSTOM CARD',
      subtitle: 'minimalist foil edition',
      price: 7900,
      quantity: 1,
      size: 'XL 1',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
