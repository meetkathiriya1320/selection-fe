import React from "react";
import { X, Trash, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // Adjusted path
import Button from "../common/Button"; // Adjusted path
import { getSecureImageUrl } from "../../utils/imageUtils";
import "./CartDrawer.css";

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, cartTotal } =
    useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />
      <div className="cart-drawer animate-slide-in">
        <div className="cart-header">
          <h2>Your Cart ({cartItems.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/selections");
                }}
              >
                Browse Selections
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.uniqueId} className="cart-item">
                <div className="item-img-wrapper">
                  <img
                    src={
                      getSecureImageUrl(item.photos?.[0] || item.photo) ||
                      "https://via.placeholder.com/80"
                    }
                    alt={item.name}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-sku">SKU: {item.SKU}</p>
                  {/* Show variants if available */}
                  {(item.selectedTopSize ||
                    item.selectedBottomSize ||
                    item.selectedColor) && (
                    <p
                      className="item-variants"
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      {item.selectedTopSize && `Top: ${item.selectedTopSize} `}
                      {item.selectedBottomSize &&
                        `Btm: ${item.selectedBottomSize} `}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                  <p className="item-price">₹{item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.uniqueId)} // Use uniqueId here
                  className="remove-btn"
                  title="Remove"
                  style={{ position: "absolute", top: "0", right: "0" }}
                >
                  <Trash size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span className="amount">₹{cartTotal}</span>
            </div>
            <p className="tax-note">
              Taxes and shipping calculated at checkout.
            </p>
            <Button
              variant="primary"
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
