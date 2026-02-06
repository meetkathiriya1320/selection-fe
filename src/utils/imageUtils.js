export const getSecureImageUrl = (url) => {
    if (!url) return "";
    if (url.includes("localhost")) {
        return url;
    }
    if (url.startsWith("http://")) {
        return url.replace("http://", "https://");
    }
    return url;
};
