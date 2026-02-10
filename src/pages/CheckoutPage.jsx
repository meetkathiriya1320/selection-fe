import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import "./CheckoutPage.css";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Checkout Form State
  const [dates, setDates] = useState({
    deliveryDate: "",
    returnDate: "",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate("/selections");
    } else if (cartItems.length > 0) {
      // Pre-fill dates from first item if available
      const firstItem = cartItems[0];
      if (firstItem.deliverDate && firstItem.returnDate) {
        // fix: receiveDate vs returnDate mismatch in variable naming?
        // In SelectionDetails it is 'receiveDate' or 'endDate'
        // In cartItem it is: deliverDate, receiveDate (from my previous edit)
        setDates({
          deliveryDate: firstItem.deliverDate,
          returnDate: firstItem.receiveDate,
        });
      } else if (firstItem.deliverDate && firstItem.receiveDate) {
        setDates({
          deliveryDate: firstItem.deliverDate,
          returnDate: firstItem.receiveDate,
        });
      }
    }
  }, [cartItems, navigate, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to complete your booking");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Validate Dates
    if (new Date(dates.deliveryDate) >= new Date(dates.returnDate)) {
      toast.error("Return date must be after delivery date");
      return;
    }

    setLoading(true);
    try {
      // Map cart items to API payload structure
      const itemsPayload = cartItems.map((item) => {
        // Use item-specific dates if available (from SelectionDetails), else fallback to global checkoug dates
        const finalDeliverDate = item.deliverDate || dates.deliveryDate;
        const finalReceiveDate = item.receiveDate || dates.returnDate;

        if (!finalDeliverDate || !finalReceiveDate) {
          throw new Error(`Please select dates for item: ${item.name}`);
        }

        return {
          selection_id: item._id,
          deposit: item.price * 0.5,
          pay: item.price,
          selectedTopSize: item.selectedTopSize,
          selectedBottomSize: item.selectedBottomSize,
          selectedColor: item.selectedColor,
          deliver_date: finalDeliverDate,
          receive_date: finalReceiveDate,
          // Notes could be added if backend supports it per item or globally
        };
      });

      await api.post("/order", { items: itemsPayload, notes }); // Assuming backend might accept global notes?

      setSuccess(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success">
        <div className="success-card">
          <CheckCircle size={64} className="text-success" />
          <h1>Booking Confirmed!</h1>
          <p>
            Thank you for choosing Selection. We will review your request
            shortly.
          </p>
          <div className="success-actions">
            <Link to="/dashboard">
              <Button variant="primary">View My Orders</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/selections" className="back-link">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 className="page-title">Complete Your Booking</h1>

        <div className="checkout-layout">
          {/* Left: Form */}
          <div className="checkout-form-section">
            <div className="form-card">
              <h3>Event Details</h3>
              <p className="form-desc">
                Please specify when you need the items.
              </p>

              <form onSubmit={handleSubmit} id="checkout-form">
                <div className="form-row">
                  <Input
                    label="Delivery Date"
                    type="date"
                    required
                    value={dates.deliveryDate}
                    onChange={(e) =>
                      setDates({ ...dates, deliveryDate: e.target.value })
                    }
                  />
                  <Input
                    label="Return Date"
                    type="date"
                    required
                    value={dates.returnDate}
                    onChange={(e) =>
                      setDates({ ...dates, returnDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Any special requests?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {!user && (
              <div className="login-alert">
                <p>You must be logged in to place an order.</p>
                <Link to="/login" state={{ from: "/checkout" }}>
                  <Button variant="outline" size="sm">
                    Login Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.uniqueId} className="summary-item">
                    <div className="sum-img">
                      <img
                        src={item.photos?.[0] || item.photo}
                        alt={item.name}
                      />
                    </div>
                    <div className="sum-info">
                      <h4>{item.name}</h4>
                      <p>
                        {item.selectedTopSize &&
                          `Top: ${item.selectedTopSize} `}
                        {item.selectedBottomSize &&
                          `| Btm: ${item.selectedBottomSize} `}
                        {item.selectedColor && `| Color: ${item.selectedColor}`}
                      </p>
                    </div>
                    <div className="sum-price">
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="total-row deposit-row">
                  <span>Deposit Required (50%)</span>
                  <span>₹{(cartTotal * 0.5).toLocaleString()}</span>
                </div>
                <div className="total-row final-total">
                  <span>Total</span>
                  <span>₹{(cartTotal * 1.5).toLocaleString()}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                variant="primary"
                className="place-order-btn"
                disabled={loading}
                isLoading={loading}
              >
                {loading ? "Processing..." : "Confirm Booking"}
              </Button>
              <p className="secure-note">
                Secure booking. You won't be charged yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
