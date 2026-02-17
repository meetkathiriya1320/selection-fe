import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { getSecureImageUrl } from "../utils/imageUtils";
import { ArrowRight } from "lucide-react";
import "./HomePage.css";

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    // ... (fetch logic remains same)
    const fetchData = async () => {
      try {
        const [bannerRes, catRes] = await Promise.all([
          api.get("/banner"),
          api.get("/category"),
        ]);

        const activeBanners = bannerRes.data.data.filter((b) => b.isActive);
        setBanners(activeBanners);

        // Filter featured categories
        const featured = catRes.data.data.filter(
          (c) => c.isFeatured && c.isActive,
        );
        setFeaturedCategories(featured);
      } catch (err) {
        console.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length,
    );
  };

  const handleDotClick = (index) => {
    setCurrentBannerIndex(index);
  };

  const currentBanner = banners[currentBannerIndex];

  const heroImage =
    banners.length > 0 && currentBanner
      ? getSecureImageUrl(currentBanner.image)
      : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";

  const heroTitle =
    banners.length > 0 && currentBanner
      ? currentBanner.title
      : "New Collection";

  return (
    <div className="home-page">
      {/* Clean Hero */}
      <section className="hero-clean">
        {banners.length > 0 ? (
          banners.map((banner, index) => (
            <div
              key={banner._id || index}
              className={`hero-image-wrapper ${
                index === currentBannerIndex ? "active" : ""
              }`}
            >
              <img src={getSecureImageUrl(banner.image)} alt={banner.title} />
            </div>
          ))
        ) : (
          <div className="hero-image-wrapper active">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
              alt="Hero"
            />
          </div>
        )}

        {banners.length > 1 && (
          <>
            <div className="carousel-dots">
              {banners.map((_, index) => (
                <span
                  key={index}
                  className={`carousel-dot ${index === currentBannerIndex ? "active" : ""}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          </>
        )}

        <div className="hero-text-content">
          <h1 className="hero-headline">{heroTitle}</h1>
          <p className="hero-subheadline">
            Timeless elegance for your special occasions. Explore our curated
            selection of premium attire.
          </p>
          <Link to="/selections" className="btn-hero-primary">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Categories - Clean Grid */}
      <section className="featured-clean container">
        <div className="section-header-clean">
          <h2>Shop by Category</h2>
          <Link to="/selections" className="view-all-link">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid-clean">
          {featuredCategories.length > 0 ? (
            featuredCategories.map((category) => (
              <Link
                to={`/selections?category=${category.name}`}
                key={category._id}
                className="cat-card-clean"
              >
                <div className="cat-img-wrapper">
                  <img
                    src={
                      getSecureImageUrl(category.image) ||
                      `https://source.unsplash.com/random/800x1000?fashion,${category.name}`
                    }
                    alt={category.name}
                  />
                </div>
                <div className="cat-info-clean">
                  <h3>{category.name}</h3>
                  <span className="shop-link">Shop Now</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <p>New collections arriving soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust/Info Section (Optional for Professional feel) */}
      <section className="trust-section">
        <div className="container trust-grid">
          <div className="trust-item">
            <h4>Premium Quality</h4>
            <p>Hand-picked fabrics and designs.</p>
          </div>
          <div className="trust-item">
            <h4>Perfect Fit</h4>
            <p>Expert tailoring for every size.</p>
          </div>
          <div className="trust-item">
            <h4>Easy Booking</h4>
            <p>Seamless online reservation.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
