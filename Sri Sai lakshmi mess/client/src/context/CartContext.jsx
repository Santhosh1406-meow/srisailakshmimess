import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ssl_mess_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (dish) => {
    if (!dish || !dish.id) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === dish.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: dish.id,
            name: dish.name,
            tamilName: dish.tamilName || '',
            price: Number(dish.price) || 0,
            image: dish.image || '',
            isVegetarian: !!dish.isVegetarian,
            quantity: 1
          }
        ];
      }
    });
  };

  const removeFromCart = (dishId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== dishId));
  };

  const updateQuantity = (dishId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === dishId ? { ...item, quantity: Math.min(qty, 50) } : item
      )
    );
  };

  const getItemQuantity = (dishId) => {
    const item = cartItems.find((i) => i.id === dishId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    openCart,
    closeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getItemQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
