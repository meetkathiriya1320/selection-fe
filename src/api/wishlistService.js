import api from "./axios";

export const fetchWishlist = async () => {
    const response = await api.get("/wishlist");
    return response.data.data;
};

export const addWishlistItem = async (selectionId) => {
    const response = await api.post("/wishlist", { selectionId });
    return response.data.data;
};

export const removeWishlistItem = async (selectionId) => {
    const response = await api.delete(`/wishlist/${selectionId}`);
    return response.data.data;
};
