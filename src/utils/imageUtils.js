export const getSecureImageUrl = (url) => {
    if (!url) return "";

    // 1. If we are in Production (not localhost), but the Image URL is localhost
    // (e.g. data saved from local dev), replace it with the Production Backend URL.
    if (window.location.hostname !== "localhost" && url.includes("localhost")) {
        const prodUrl = import.meta.env.VITE_API_URL || "https://selection-be-1.onrender.com";
        // Replace http://localhost:5000 (or similar) with the Prod URL
        return url.replace(/http:\/\/localhost:\d+/, prodUrl);
    }

    // 2. If we are ON localhost, keep localhost URLs as is.
    if (url.includes("localhost")) {
        return url;
    }

    // 3. For all other URLs (e.g. Render/Cloudinary), ensure HTTPS.
    if (url.startsWith("http://")) {
        return url.replace("http://", "https://");
    }

    return url;
};
