import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getSecureImageUrl } from "../utils/imageUtils";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Loader2, Calendar, AlertCircle, ShoppingBag } from "lucide-react";
import "./SelectionDetailsPage.css";

const SelectionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // Selection states
  const [selectedTop, setSelectedTop] = useState("");
  const [selectedBottom, setSelectedBottom] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/selection/${id}`);
        const data = response.data.data;
        setSelection(data);
        // Set initial image
        setSelectedImage(
          getSecureImageUrl(data.photos?.[0] || data.photo) ||
            "https://via.placeholder.com/600x800",
        );
      } catch (err) {
        console.error("Error fetching details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Availability State
  const [bookedDates, setBookedDates] = useState([]);

  // Fetch Availability when size changes
  useEffect(() => {
    const fetchAvailability = async () => {
      // Logic: Only fetch if needed. If item has sizes, wait for size.
      // But user might want to see general availability?
      // For now, let's fetch always, but backend filters if params present.

      let query = `?`;
      if (selectedTop) query += `topSize=${selectedTop}&`;
      if (selectedBottom) query += `bottomSize=${selectedBottom}&`;

      try {
        const response = await api.get(
          `/selection-order/availability/${id}${query}`,
        );
        setBookedDates(response.data.data);
      } catch (err) {
        console.error("Failed to check availability", err);
      }
    };

    if (selection) {
      fetchAvailability();
    }
  }, [id, selection, selectedTop, selectedBottom]);

  // Check if a date range overlaps with booked dates
  const isRangeAvailable = (start, end) => {
    if (!start || !end) return true;
    const s = new Date(start);
    const e = new Date(end);

    return !bookedDates.some((booking) => {
      const bookedStart = new Date(booking.from);
      const bookedEnd = new Date(booking.to);
      // Check Intersect: (StartA <= EndB) and (EndA >= StartB)
      return s <= bookedEnd && e >= bookedStart;
    });
  };

  const handleDateChange = (start, end) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);

    const s = start || startDate;
    const e = end || endDate;

    if (s && e) {
      if (!isRangeAvailable(s, e)) {
        const msg = "Selected dates are unavailable for this size.";
        setError(msg);
        toast.error(msg, { id: "date-conflict" });
      } else {
        setError("");
      }
    }
  };

  const { addToCart } = useCart(); // Use Cart Context

  const handleAddToCart = (e) => {
    e.preventDefault();
    setError("");

    // Variant Validation
    if (selection.topSizes?.length > 0 && !selectedTop) {
      setError("Please select a Top Size");
      return;
    }
    if (selection.bottomSizes?.length > 0 && !selectedBottom) {
      setError("Please select a Bottom Size");
      return;
    }
    if (selection.colors?.length > 0 && !selectedColor) {
      setError("Please select a Color");
      return;
    }

    // Add to Cart Logic
    const cartItem = {
      ...selection,
      selectedTopSize: selectedTop,
      selectedBottomSize: selectedBottom,
      selectedColor: selectedColor,
      uniqueId: Date.now(), // Simple unique ID for cart
    };

    addToCart(cartItem);
  };

  if (loading)
    return (
      <div className="flex-center" style={{ minHeight: "80vh" }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  if (!selection)
    return <div className="text-center py-5">Selection not found</div>;

  const photos =
    selection.photos && selection.photos.length > 0
      ? selection.photos.map((p) => getSecureImageUrl(p))
      : [
          getSecureImageUrl(selection.photo) ||
            "https://via.placeholder.com/600x800",
        ];

  return (
    <div className="details-page">
      <div className="details-container">
        {/* Left Column: Media Gallery */}
        <div className="media-gallery">
          <div className="main-image-wrapper">
            <img src={selectedImage} alt={selection.name} />
          </div>
          {photos.length > 1 && (
            <div className="thumbnail-strip">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  className={`thumb-btn ${selectedImage === photo ? "active" : ""}`}
                  onClick={() => setSelectedImage(photo)}
                >
                  <img src={photo} alt={`View ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="product-info-panel">
          <div className="sticky-info-wrapper">
            {/* Header */}
            <div className="info-header">
              <span className="category-label">
                {selection.category || "Collection"}
              </span>
              <h1 className="product-heading">{selection.name}</h1>
              <div className="price-sku-row">
                <div className="price-tag">
                  ₹{selection.price.toLocaleString()}
                </div>
                {selection.SKU && (
                  <span className="sku-tag">SKU: {selection.SKU}</span>
                )}
              </div>
            </div>

            <div className="description-text">
              <p>
                {selection.description ||
                  "Crafted with precision, this exclusive piece embodies elegance and tradition. Perfect for special occasions."}
              </p>
            </div>

            <div className="divider-line" />

            {/* Booking Module */}
            <div className="booking-module">
              {/* Variants */}
              <div className="variants-container">
                {selection.topSizes?.length > 0 && (
                  <div className="variant-group">
                    <label>Top Size</label>
                    <div className="chips-grid">
                      {selection.topSizes.map((s) => (
                        <button
                          key={s}
                          className={`chip-btn ${selectedTop === s ? "selected" : ""}`}
                          onClick={() => setSelectedTop(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selection.bottomSizes?.length > 0 && (
                  <div className="variant-group">
                    <label>Bottom Size</label>
                    <div className="chips-grid">
                      {selection.bottomSizes.map((s) => (
                        <button
                          key={s}
                          className={`chip-btn ${selectedBottom === s ? "selected" : ""}`}
                          onClick={() => setSelectedBottom(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selection.colors?.length > 0 && (
                  <div className="variant-group">
                    <label>Color</label>
                    <div className="chips-grid">
                      {selection.colors.map((c) => (
                        <button
                          key={c}
                          className={`chip-btn ${selectedColor === c ? "selected" : ""}`}
                          onClick={() => setSelectedColor(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div className="variant-group">
                  <label>Booking Dates</label>
                  <div className="date-inputs-row">
                    <div className="date-field">
                      <span className="sub-label">Deliver From</span>
                      <div className="input-with-icon">
                        <Calendar size={16} className="input-icon" />
                        <input
                          type="date"
                          className="custom-date-input"
                          value={startDate}
                          min={new Date().toLocaleDateString("en-CA")}
                          onChange={(e) =>
                            handleDateChange(e.target.value, null)
                          }
                        />
                      </div>
                    </div>
                    <div className="date-field">
                      <span className="sub-label">Receive By</span>
                      <div className="input-with-icon">
                        <Calendar size={16} className="input-icon" />
                        <input
                          type="date"
                          className="custom-date-input"
                          value={endDate}
                          min={
                            startDate || new Date().toLocaleDateString("en-CA")
                          }
                          onChange={(e) =>
                            handleDateChange(null, e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="action-area">
                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <Button onClick={handleAddToCart} className="add-to-cart-btn">
                  <ShoppingBag size={20} /> Add to Cart
                </Button>
                <p className="shipping-note">
                  Free shipping on all orders. Secure checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionDetailsPage;
