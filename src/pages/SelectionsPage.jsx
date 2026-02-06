import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import "./SelectionsPage.css";

const SelectionsPage = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get("category") || "All";
  const [categories, setCategories] = useState(["All"]);

  // Fetch Categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await api.get("/category");
        const catNames = ["All", ...response.data.data.map((c) => c.name)];
        setCategories(catNames);
      } catch (e) {
        console.error(e);
      }
    };
    getCategories();
  }, []);

  // Fetch Selections
  useEffect(() => {
    const fetchSelections = async () => {
      setLoading(true);
      try {
        const query =
          currentCategory === "All" ? "" : `?category=${currentCategory}`;
        const response = await api.get(`/selection${query}`);
        setSelections(response.data.data);
      } catch (error) {
        console.error("Failed to fetch selections", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelections();
  }, [currentCategory]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".hero-select-wrapper")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const handleCustomCategoryChange = (category) => {
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
    setIsDropdownOpen(false);
  };

  return (
    <div className="selections-page">
      {/* Hero Header */}
      <div className="selections-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Exclusive Collection</h1>
            <p className="hero-subtitle">
              Discover our premium range of{" "}
              {selections.length > 0 ? selections.length : ""} handcrafted
              ethnic wear.
            </p>

            {/* Custom Hero Filter Dropdown */}
            <div className="hero-filter-container">
              <div className="hero-select-wrapper">
                <button
                  className={`hero-custom-trigger ${isDropdownOpen ? "open" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {currentCategory}
                  <ChevronDown
                    size={16}
                    className={`hero-select-icon ${isDropdownOpen ? "rotate" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="hero-custom-options">
                    {categories.map((cat) => (
                      <div
                        key={cat}
                        className={`hero-option ${currentCategory === cat ? "selected" : ""}`}
                        onClick={() => handleCustomCategoryChange(cat)}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container main-layout-container">
        {/* Main Content */}
        <div className="shop-content-centered">
          <div className="product-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="product-card skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-text short" />
                    <div className="skeleton-text long" />
                  </div>
                </div>
              ))
            ) : selections.length > 0 ? (
              selections.map((item) => (
                <Link
                  to={`/selections/${item._id}`}
                  key={item._id}
                  className="product-card"
                >
                  <div className="img-wrapper">
                    <img
                      src={
                        item.photos?.[0] ||
                        item.photo ||
                        "https://via.placeholder.com/400x500"
                      }
                      alt={item.name}
                      loading="lazy"
                    />
                    <div className="card-overlay">
                      <span className="view-btn">View Details</span>
                    </div>
                  </div>
                  <div className="product-info-block">
                    <span className="category-tag">{item.category}</span>
                    <h3 className="product-title">{item.name}</h3>
                    <div className="price-row">
                      <span className="price">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <div className="action-icon-wrapper">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results-card">
                <div className="no-result-icon">
                  <Search size={40} />
                </div>
                <h3>No matches found</h3>
                <p>Try selecting a different category.</p>
                <button
                  onClick={() => {
                    searchParams.delete("category");
                    setSearchParams(searchParams);
                  }}
                  className="btn-reset"
                >
                  View All Items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionsPage;
