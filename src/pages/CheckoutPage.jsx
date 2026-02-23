import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Wallet,
} from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' or 'pay_later'

  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate("/selections");
    } else if (cartItems.length > 0) {
      // Pre-fill dates from first item if available
      const firstItem = cartItems[0];
      if (firstItem.deliverDate && firstItem.returnDate) {
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

  /* global Razorpay */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Validate Dates
    if (new Date(dates.deliveryDate) >= new Date(dates.returnDate)) {
      toast.error("Delivery date must be before return date");
      return;
    }

    setLoading(true);

    if (paymentMethod === "pay_later") {
      // Pay later: create order directly as pending (no Razorpay)
      await placeBookingOrder(null);
      return;
    }

    // ── ONLINE PAYMENT FLOW ────────────────────────────────────────
    // Step 1: Build items payload (so we can conflict-check BEFORE payment)
    let itemsPayload;
    try {
      itemsPayload = cartItems.map((item) => {
        const finalDeliverDate = item.deliverDate || dates.deliveryDate;
        const finalReceiveDate = item.receiveDate || dates.returnDate;
        if (!finalDeliverDate || !finalReceiveDate) {
          throw new Error(`Please select dates for ${item.name}`);
        }
        return {
          selection_id: item._id,
          name: item.name,
          deposit: item.price * 0.5,
          pay: item.price,
          selectedTopSize: item.selectedTopSize,
          selectedBottomSize: item.selectedBottomSize,
          selectedColor: item.selectedColor,
          deliver_date: finalDeliverDate,
          receive_date: finalReceiveDate,
        };
      });
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
      return;
    }

    // Step 2: Create order as PENDING first (conflict-check happens here)
    let pendingOrderId = null;
    try {
      const orderRes = await api.post("/order", { items: itemsPayload, notes });
      pendingOrderId = orderRes.data.data?._id;
    } catch (err) {
      // Conflict or validation error from backend
      toast.error(err.response?.data?.message || "Failed to reserve booking");
      setLoading(false);
      return;
    }

    // Step 3: Create Razorpay payment order
    try {
      const finalAmount = Math.round(cartTotal * 1.5);
      const { data: rzpOrder } = await import("../api/paymentService").then(
        (module) => module.createPaymentOrder(finalAmount),
      );

      const cancelPendingOrder = async () => {
        if (!pendingOrderId) return;
        try {
          await api.delete(`/order/${pendingOrderId}/cancel`);
        } catch {
          // silently ignore cancel errors
        }
      };

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Selection",
        description: "Rental Deposit & Payment",
        image: "/vite.svg",
        order_id: rzpOrder.id,
        handler: async function (response) {
          try {
            // Step 4a: Verify payment
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: finalAmount,
              order_id: pendingOrderId, // link to our internal order
            };

            const verifyRes = await import("../api/paymentService").then(
              (module) => module.verifyPayment(verifyData),
            );

            if (verifyRes.success) {
              // Step 4b: Confirm the pending order by patching payment_id
              try {
                await api.put(`/order/${pendingOrderId}/confirm`, {
                  payment_id: verifyRes.data?.payment_id,
                });
              } catch {
                // If confirm fails, booking is still placed (admin can fix)
              }
              setSuccess(true);
              clearCart();
              toast.success("Booking confirmed! Payment successful.");
            } else {
              await cancelPendingOrder();
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Payment Handler Error:", err);
            await cancelPendingOrder();
            toast.error(
              err.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || "",
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: async function () {
            await cancelPendingOrder();
            setLoading(false);
            toast("Payment cancelled — booking was not confirmed.");
          },
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", async function (response) {
        await cancelPendingOrder();
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      // Cancel the pending order since payment couldn't start
      if (pendingOrderId) {
        try {
          await api.delete(`/order/${pendingOrderId}/cancel`);
        } catch {}
      }
      toast.error(
        error.response?.data?.message || "Failed to initiate payment",
      );
      setLoading(false);
    }
  };

  const placeBookingOrder = async (paymentId) => {
    try {
      const itemsPayload = cartItems.map((item) => {
        const finalDeliverDate = item.deliverDate || dates.deliveryDate;
        const finalReceiveDate = item.receiveDate || dates.returnDate;

        if (!finalDeliverDate || !finalReceiveDate) {
          throw new Error(`Please select dates for ${item.name}`);
        }

        return {
          selection_id: item._id,
          name: item.name,
          deposit: item.price * 0.5,
          pay: item.price,
          selectedTopSize: item.selectedTopSize,
          selectedBottomSize: item.selectedBottomSize,
          selectedColor: item.selectedColor,
          deliver_date: finalDeliverDate,
          receive_date: finalReceiveDate,
        };
      });

      await api.post("/order", {
        items: itemsPayload,
        notes,
        payment_id: paymentId,
      });

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
            Your order has been placed successfully. We will contact you
            shortly.
          </p>
          <div className="success-actions">
            <Link to="/dashboard">
              <Button variant="primary">View My Orders</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
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
                Please provide dates and any special requests for your booking.
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
                  <label>Additional Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Any special requests or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-options">
                    <label
                      className={`payment-option ${paymentMethod === "online" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-icon">
                        <CreditCard size={24} />
                      </div>
                      <div className="option-content">
                        <span className="option-title">Pay Now (Online)</span>
                        <span className="option-desc">
                          Credit/Debit Card, UPI, Netbanking
                        </span>
                      </div>
                    </label>

                    <label
                      className={`payment-option ${paymentMethod === "pay_later" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_later"
                        checked={paymentMethod === "pay_later"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="option-icon">
                        <Wallet size={24} />
                      </div>
                      <div className="option-content">
                        <span className="option-title">Pay Later</span>
                        <span className="option-desc">
                          Pay when you pick up or receive items
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {!user && (
              <div className="login-alert">
                <p>Please login to place your order</p>
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
                  <span>Security Deposit (50%)</span>
                  <span>₹{(cartTotal * 0.5).toLocaleString()}</span>
                </div>
                <div className="total-row final-total">
                  <span>Total Payable</span>
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
                Secure Booking. No payment required now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
