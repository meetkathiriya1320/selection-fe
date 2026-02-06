import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load from local storage on init
    const saved = localStorage.getItem("selection_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Save to local storage whenever cart changes
    localStorage.setItem("selection_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // Allow adding same items as long as they are distinct "add" actions (uniqueId differs)
      // Check if EXACT same item instance (uniqueId) is there to prevent double-click dupes if needed,
      // but usually we want to allow adding same item twice if user wants 2 of same size.
      // However, usually "Add to Card" implies adding a new line item.

      // Let's check if there is an item with same ID AND same variants.
      // Actually, since SelectionDetailsPage generates a fresh uniqueId every time,
      // we can just treat every add as a new item.
      // But maybe we want to prevent identical dupes?
      // User request "add cart time multipal size add in cart" implies adding same item with diff sizes.
      // So checking just _id is bad.

      // Let's just trust uniqueId. If simple dupe prevention is needed, check variants.
      // For now, let's allow all adds, but prevent adding exact same uniqueId (which shouldn't happen anyway).

      const exists = prev.find((i) => i.uniqueId === item.uniqueId);
      if (exists) {
        // Should rarely happen unless uniqueId isn't unique enough
        return prev;
      }

      toast.success("Added to cart");
      setIsCartOpen(true);
      return [...prev, item];
    });
  };

  const removeFromCart = (uniqueId) => {
    // Remove by uniqueId to target specific variant instance
    setCartItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("selection_cart");
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    cartTotal: cartItems.reduce(
      (total, item) => total + (Number(item.price) || 0),
      0,
    ),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
