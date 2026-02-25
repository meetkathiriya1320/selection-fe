import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import {
  fetchWishlist,
  addWishlistItem,
  removeWishlistItem,
} from "../api/wishlistService";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const loadWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true);
      const data = await fetchWishlist();
      setWishlist(data || []);
    } catch (err) {
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  const onUserLogout = useCallback(() => {
    setWishlist([]);
  }, []);

  // Load wishlist on mount if already logged in + listen for auth events
  useEffect(() => {
    if (getToken()) {
      loadWishlist();
    }
    window.addEventListener("user-login", loadWishlist);
    window.addEventListener("user-logout", onUserLogout);
    return () => {
      window.removeEventListener("user-login", loadWishlist);
      window.removeEventListener("user-logout", onUserLogout);
    };
  }, [loadWishlist, onUserLogout]);

  const isWishlisted = (id) =>
    wishlist.some((item) => item._id === id || item === id);

  const toggleWishlist = async (item) => {
    if (!getToken()) {
      toast.error("Please login to save items to wishlist");
      return;
    }
    const alreadySaved = isWishlisted(item._id);
    try {
      if (alreadySaved) {
        setWishlist((prev) => prev.filter((i) => i._id !== item._id));
        await removeWishlistItem(item._id);
        toast("Removed from wishlist", { icon: "💔" });
      } else {
        setWishlist((prev) => [...prev, item]);
        await addWishlistItem(item._id);
        toast.success("Added to wishlist! ❤️");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      loadWishlist();
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      setWishlist((prev) => prev.filter((item) => item._id !== id));
      await removeWishlistItem(id);
      toast("Removed from wishlist", { icon: "💔" });
    } catch (err) {
      toast.error("Could not remove item");
      loadWishlist();
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistLoading,
        toggleWishlist,
        isWishlisted,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
